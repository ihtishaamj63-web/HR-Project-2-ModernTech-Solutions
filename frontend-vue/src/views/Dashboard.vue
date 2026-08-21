<template>
  <div class="dashboard-page">
    <!-- Loading Spinner -->
    <div
      v-if="loading"
      class="d-flex justify-content-center align-items-center py-5"
    >
      <div
        class="spinner-border text-primary"
        style="width: 3rem; height: 3rem"
        role="status"
      >
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <div v-else>
      <!-- HERO -->
      <section class="dash-hero">
        <h5>MODERNTECH SOLUTIONS</h5>
        <h1>Welcome back, {{ userName }}.</h1>
        <p
          style="
            font-size: 16px;
            color: rgba(255, 255, 255, 0.7);
            margin-bottom: 15px;
          "
        >
          <i class="bi bi-calendar3 me-1"></i> {{ today }}
        </p>
        <p>
          {{
            isHR
              ? "Manage employee records, performance reviews and payroll from one centralized HR dashboard."
              : "View your personal dashboard: attendance, time off and reviews."
          }}
        </p>
        <div class="dash-hero-buttons" v-if="isHR">
          <button @click="router.push('/employees')">Employee Records</button>
          <button @click="router.push('/payroll')">Open Payroll</button>
        </div>
      </section>

      <!-- STATISTICS -->
      <section class="dash-stats">
        <div class="dash-stat-card" v-if="isHR">
          <div class="dash-stat-icon blue">
            <i class="bi bi-people-fill"></i>
          </div>
          <h4>Total Employees</h4>
          <h2>{{ stats.total_employees || 0 }}</h2>
          <a
            href="#"
            @click.prevent="router.push('/employees')"
            class="dash-stat-link blue-link"
            >View Employees →</a
          >
        </div>

        <div class="dash-stat-card">
          <div class="dash-stat-icon purple">
            <i class="bi bi-calendar-check-fill"></i>
          </div>
          <h4>{{ isHR ? "Attendance Rate" : "My Attendance" }}</h4>
          <h2>{{ stats.attendance_rate || 0 }}%</h2>
          <p>This Week</p>
          <a
            href="#"
            @click.prevent="router.push('/attendance')"
            class="dash-stat-link purple-link"
            >View Attendance →</a
          >
        </div>

        <div class="dash-stat-card">
          <div class="dash-stat-icon orange">
            <i class="bi bi-clock-fill"></i>
          </div>
          <h4>{{ isHR ? "Pending Requests" : "My Pending Leave" }}</h4>
          <h2>{{ stats.pending_timeoff || 0 }}</h2>
          <p>Time Off</p>
          <a
            href="#"
            @click.prevent="router.push('/timeoff')"
            class="dash-stat-link orange-link"
            >Manage Requests →</a
          >
        </div>

        <div class="dash-stat-card">
          <div class="dash-stat-icon green">
            <i class="bi bi-star-fill"></i>
          </div>
          <h4>{{ isHR ? "Completed Reviews" : "My Reviews" }}</h4>
          <h2>{{ stats.total_reviews || 0 }}</h2>
          <p>This Quarter</p>
          <a
            href="#"
            @click.prevent="router.push('/reviews')"
            class="dash-stat-link green-link"
            >View Reviews →</a
          >
        </div>

        <div class="dash-stat-card">
          <div class="dash-stat-icon blue">
            <i class="bi bi-cash-stack"></i>
          </div>
          <h4>{{ isHR ? "Payroll Summary" : "My Net Pay" }}</h4>
          <h2>
            R {{ Number(stats.payroll_total || 0).toLocaleString("en-ZA") }}
          </h2>
          <p>
            {{
              isHR
                ? (stats.total_employees || 0) + " Employees Paid"
                : "Monthly Projection"
            }}
          </p>
          <a
            href="#"
            @click.prevent="router.push('/payroll')"
            class="dash-stat-link blue-link"
            >Open Payroll →</a
          >
        </div>
      </section>

      <!-- ATTENDANCE CHART -->
      <div class="dash-chart-card" v-if="isHR">
        <div class="dash-chart-header">
          <h2>This Week at a Glance</h2>
          <div class="chart-header-right">
            <span class="badge bg-secondary"
              >{{ stats.total_employees || 0 }} employees</span
            >
            <a href="#" @click.prevent="router.push('/attendance')"
              >View Full Report →</a
            >
          </div>
        </div>
        <div class="weekly-chart" style="padding: 16px 0 8px">
          <div class="chart-area">
            <div class="chart-grid">
              <div class="grid-line">
                <span>{{ chartMax }}</span>
              </div>
              <div class="grid-line">
                <span>{{ Math.round(chartMax * 0.75) }}</span>
              </div>
              <div class="grid-line">
                <span>{{ Math.round(chartMax * 0.5) }}</span>
              </div>
              <div class="grid-line">
                <span>{{ Math.round(chartMax * 0.25) }}</span>
              </div>
              <div class="grid-line"><span>0</span></div>
            </div>
            <div class="chart-bars">
              <div v-for="(day, index) in days" :key="day" class="chart-day">
                <div class="bars">
                  <div
                    v-if="weeklyData.present[index] > 0"
                    class="chart-bar present"
                    :style="{
                      height: getBarHeight(weeklyData.present[index]) + 'px',
                    }"
                    :title="`Present: ${weeklyData.present[index]}`"
                  ></div>
                  <div
                    v-if="weeklyData.leave[index] > 0"
                    class="chart-bar leave"
                    :style="{
                      height: getBarHeight(weeklyData.leave[index]) + 'px',
                    }"
                    :title="`On Leave: ${weeklyData.leave[index]}`"
                  ></div>
                  <div
                    v-if="weeklyData.absent[index] > 0"
                    class="chart-bar absent"
                    :style="{
                      height: getBarHeight(weeklyData.absent[index]) + 'px',
                    }"
                    :title="`Absent: ${weeklyData.absent[index]}`"
                  ></div>
                  <div
                    v-if="
                      weeklyData.present[index] === 0 &&
                      weeklyData.leave[index] === 0 &&
                      weeklyData.absent[index] === 0
                    "
                    class="empty-bar"
                  ></div>
                </div>
                <span class="bar-total">{{
                  weeklyData.present[index] +
                  weeklyData.leave[index] +
                  weeklyData.absent[index]
                }}</span>
                <span class="day-label">{{ day }}</span>
              </div>
            </div>
          </div>
          <div class="chart-legend">
            <div class="legend-item">
              <span class="legend-dot present"></span> Present
              <span class="legend-count">{{ totalPresent }}</span>
            </div>
            <div class="legend-item">
              <span class="legend-dot leave"></span> On Leave
              <span class="legend-count">{{ totalLeave }}</span>
            </div>
            <div class="legend-item">
              <span class="legend-dot absent"></span> Absent
              <span class="legend-count">{{ totalAbsent }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- TWO COLUMN -->
      <div class="dash-two-col" v-if="isHR">
        <section class="dash-reviews">
          <div class="dash-reviews-header">
            <h2>Recent Time Off Requests</h2>
            <a href="#" @click.prevent="router.push('/timeoff')">View All →</a>
          </div>
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Type</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="timeOffRequests.length === 0">
                <td colspan="4" class="text-center text-muted">
                  No requests found
                </td>
              </tr>
              <tr
                v-for="request in timeOffRequests.slice(0, 5)"
                :key="request.id"
              >
                <td>{{ request.employee }}</td>
                <td>{{ request.type }}</td>
                <td>{{ request.date }}</td>
                <td>
                  <span
                    class="status-badge"
                    :class="getStatusClass(request.status)"
                    >{{ request.status }}</span
                  >
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        <section class="dash-reviews">
          <div class="dash-reviews-header">
            <h2>Recent Performance Reviews</h2>
            <a href="#" @click.prevent="router.push('/reviews')">View All →</a>
          </div>
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Rating</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="reviews.length === 0">
                <td colspan="4" class="text-center text-muted">
                  No reviews found
                </td>
              </tr>
              <tr v-for="review in reviews.slice(0, 4)" :key="review.id">
                <td>{{ review.name }}</td>
                <td>{{ review.department }}</td>
                <td>
                  <span class="rating-display"
                    >{{ "⭐".repeat(review.rating || 0) }}
                    <small class="text-muted"
                      >({{ review.rating || 0 }}/5)</small
                    ></span
                  >
                </td>
                <td>
                  <button class="view-button" @click="router.push('/reviews')">
                    View
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import api from "../api/axios";
import { useAuth } from "../stores/auth";

const router = useRouter();
const { isHR, userName } = useAuth();

const loading = ref(false);
const stats = ref({
  total_employees: 0,
  attendance_rate: 0,
  pending_timeoff: 0,
  total_reviews: 0,
  payroll_total: 0,
  employees_paid: 0,
});
const timeOffRequests = ref([]);
const reviews = ref([]);
const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const weeklyData = ref({
  present: [0, 0, 0, 0, 0],
  leave: [0, 0, 0, 0, 0],
  absent: [0, 0, 0, 0, 0],
});
const today = new Date().toLocaleDateString("en-ZA", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const chartMax = computed(() =>
  Math.max(
    ...weeklyData.value.present,
    ...weeklyData.value.leave,
    ...weeklyData.value.absent,
    1,
  ),
);
const totalPresent = computed(() =>
  weeklyData.value.present.reduce((a, b) => a + b, 0),
);
const totalLeave = computed(() =>
  weeklyData.value.leave.reduce((a, b) => a + b, 0),
);
const totalAbsent = computed(() =>
  weeklyData.value.absent.reduce((a, b) => a + b, 0),
);

function getBarHeight(value) {
  if (!value) return 0;
  return Math.max((value / chartMax.value) * 180, 4);
}
function formatLeaveType(type) {
  if (!type) return "Annual";
  const typeMap = {
    vacation: "Vacation",
    sick_leave: "Sick Leave",
    personal: "Personal",
    unpaid_leave: "Unpaid Leave",
  };
  return (
    typeMap[type.toLowerCase()] || type.charAt(0).toUpperCase() + type.slice(1)
  );
}
function formatDisplayDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
function getStatusClass(status) {
  if (!status) return "";
  const value = status.toLowerCase();
  if (value === "approved") return "approved";
  if (value === "denied") return "denied";
  if (value === "pending") return "pending";
  return "";
}

async function loadDashboard() {
  try {
    const response = await api.get("/dashboard/stats");
    if (response.data.success) stats.value = response.data.data;
  } catch (error) {
    console.error("Error loading dashboard statistics:", error);
  }
}

async function loadTimeOff() {
  try {
    const response = await api.get("/timeoff");
    if (response.data.success) {
      timeOffRequests.value = response.data.data.map((item) => ({
        id: item.timeoff_id || item.id,
        employee:
          item.employee_name ||
          item.name ||
          `${item.first_name || ""} ${item.last_name || ""}` ||
          `Employee ${item.emp_id}`,
        type: formatLeaveType(item.timeoff_type || item.type),
        date: formatDisplayDate(item.start_date || item.date),
        status: item.status
          ? item.status.charAt(0).toUpperCase() + item.status.slice(1)
          : "Pending",
      }));
    }
  } catch (error) {
    console.error("Error loading time off:", error);
  }
}

async function loadReviews() {
  try {
    const response = await api.get("/reviews");
    if (response.data.success) {
      reviews.value = response.data.data.map((item) => ({
        id: item.review_id || item.id,
        name:
          item.employee_name ||
          item.name ||
          `${item.emp_first_name || ""} ${item.emp_last_name || ""}` ||
          "Unknown Employee",
        department: item.department || item.department_name || "N/A",
        rating: Number(item.performance_score) || 0,
      }));
    }
  } catch (error) {
    console.error("Error loading reviews:", error);
  }
}

async function loadAttendance() {
  try {
    const response = await api.get("/attendance");
    if (!response.data.success) return;
    const data = response.data.data || [];
    const present = [0, 0, 0, 0, 0],
      leave = [0, 0, 0, 0, 0],
      absent = [0, 0, 0, 0, 0];
    data.forEach((item) => {
      const date = new Date(item.attendance_date || item.date);
      const day = date.getDay();
      if (day >= 1 && day <= 5) {
        const index = day - 1;
        const status = (item.status || "").toLowerCase();
        if (status === "present") present[index]++;
        else if (status === "absent") absent[index]++;
        else if (
          status === "leave" ||
          status === "on leave" ||
          status === "on_leave"
        )
          leave[index]++;
      }
    });
    weeklyData.value = { present, leave, absent };
  } catch (error) {
    console.error("Error loading attendance:", error);
  }
}

onMounted(async () => {
  loading.value = true;
  await Promise.all([
    loadDashboard(),
    loadTimeOff(),
    loadReviews(),
    loadAttendance(),
  ]);
  loading.value = false;
});
</script>

<style scoped>
.dashboard-page {
  width: 100%;
}
.dash-hero {
  margin: 20px 40px 40px;
  background: linear-gradient(135deg, #272757, #0f0e47);
  color: white;
  border-radius: 20px;
  padding: 50px;
}
.dash-hero h5 {
  letter-spacing: 2px;
  margin-bottom: 10px;
  color: #a8a8d0;
  font-size: 14px;
}
.dash-hero h1 {
  font-size: 42px;
  margin-bottom: 15px;
}
.dash-hero p {
  width: 60%;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.8);
}
.dash-hero-buttons {
  margin-top: 30px;
}
.dash-hero-buttons button {
  padding: 13px 28px;
  border: none;
  border-radius: 12px;
  margin-right: 15px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  transition: 0.2s;
}
.dash-hero-buttons button:first-child {
  background: #505081;
  color: white;
}
.dash-hero-buttons button:first-child:hover {
  background: #272757;
  transform: translateY(-2px);
}
.dash-hero-buttons button:last-child {
  background: rgba(255, 255, 255, 0.95);
  color: #0f0e47;
}
.dash-hero-buttons button:last-child:hover {
  background: white;
  transform: translateY(-2px);
}
.dash-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 25px;
  margin: 0 40px 40px;
}
.dash-stat-card {
  background: white;
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.08);
  transition: 0.2s;
}
.dash-stat-card:hover {
  transform: translateY(-8px);
}
.dash-stat-icon {
  width: 55px;
  height: 55px;
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  margin-bottom: 20px;
  font-size: 24px;
}
.dash-stat-icon.blue {
  background: #3b82f6;
}
.dash-stat-icon.purple {
  background: #8b5cf6;
}
.dash-stat-icon.green {
  background: #10b981;
}
.dash-stat-icon.orange {
  background: #f59e0b;
}
.dash-stat-card h4 {
  color: #666;
  margin-bottom: 8px;
}
.dash-stat-card h2 {
  font-size: 34px;
  margin-bottom: 5px;
}
.dash-stat-card p {
  color: #888;
}
.dash-stat-link {
  display: inline-block;
  margin-top: 8px;
  font-size: 12px;
  font-weight: 600;
  text-decoration: none;
  transition: 0.2s;
}
.dash-stat-link:hover {
  text-decoration: underline;
}
.blue-link {
  color: #3b82f6;
}
.purple-link {
  color: #8b5cf6;
}
.orange-link {
  color: #f59e0b;
}
.green-link {
  color: #10b981;
}
.dash-chart-card {
  background: white;
  border-radius: 15px;
  padding: 25px;
  margin: 0 40px 40px;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.08);
}
.dash-chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.dash-chart-header h2 {
  margin: 0;
}
.chart-header-right {
  display: flex;
  align-items: center;
  gap: 15px;
}
.chart-header-right a {
  text-decoration: none;
  color: #272757;
  font-weight: 600;
  font-size: 13px;
}
.chart-header-right a:hover {
  color: #505081;
  text-decoration: underline;
}
.chart-area {
  height: 230px;
  position: relative;
  display: flex;
}
.chart-grid {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 40px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.grid-line {
  width: 100%;
  border-top: 1px dashed #ddd;
  position: relative;
}
.grid-line span {
  position: absolute;
  left: -5px;
  top: -10px;
  font-size: 10px;
  color: #888;
}
.chart-bars {
  position: absolute;
  left: 35px;
  right: 10px;
  bottom: 0;
  height: 190px;
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
}
.chart-day {
  height: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
}
.bars {
  height: 180px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
}
.chart-bar {
  width: 25px;
  min-height: 4px;
  transition: 0.2s;
}
.chart-bar:hover {
  opacity: 0.75;
}
.chart-bar.present {
  background: #10b981;
}
.chart-bar.leave {
  background: #f59e0b;
}
.chart-bar.absent {
  background: #ef4444;
}
.empty-bar {
  width: 25px;
  height: 5px;
  background: #ddd;
}
.bar-total {
  font-size: 11px;
  color: #555;
  margin-top: 3px;
}
.day-label {
  font-size: 12px;
  color: #777;
  margin-top: 5px;
}
.chart-legend {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-top: 15px;
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 13px;
}
.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}
.legend-dot.present {
  background: #10b981;
}
.legend-dot.leave {
  background: #f59e0b;
}
.legend-dot.absent {
  background: #ef4444;
}
.legend-count {
  font-weight: 600;
}
.dash-two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 25px;
  margin: 40px;
}
.dash-reviews {
  background: white;
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.08);
}
.dash-reviews-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.dash-reviews-header h2 {
  font-size: 20px;
  margin: 0;
}
.dash-reviews-header a {
  color: #272757;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
}
.dash-reviews-header a:hover {
  text-decoration: underline;
}
.dash-reviews table {
  width: 100%;
  border-collapse: collapse;
}
.dash-reviews th {
  text-align: left;
  padding: 12px 8px;
  font-size: 12px;
  color: #777;
  border-bottom: 1px solid #eee;
}
.dash-reviews td {
  padding: 14px 8px;
  font-size: 13px;
  border-bottom: 1px solid #f1f1f1;
}
.rating-display {
  white-space: nowrap;
}
.status-badge {
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
}
.status-badge.approved {
  background: #dcfce7;
  color: #15803d;
}
.status-badge.denied {
  background: #fee2e2;
  color: #b91c1c;
}
.status-badge.pending {
  background: #fef3c7;
  color: #b45309;
}
.view-button {
  border: none;
  background: #272757;
  color: white;
  padding: 6px 12px;
  border-radius: 7px;
  font-size: 11px;
  cursor: pointer;
}
.view-button:hover {
  background: #505081;
}
@media (max-width: 900px) {
  .dash-two-col {
    grid-template-columns: 1fr;
  }
  .dash-hero p {
    width: 100%;
  }
  .dash-chart-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
}
@media (max-width: 600px) {
  .dash-hero {
    margin: 15px;
    padding: 30px 20px;
  }
  .dash-hero h1 {
    font-size: 30px;
  }
  .dash-stats,
  .dash-chart-card,
  .dash-two-col {
    margin-left: 15px;
    margin-right: 15px;
  }
  .chart-legend {
    flex-wrap: wrap;
    gap: 15px;
  }
  .dash-two-col {
    margin-top: 20px;
  }
}
</style>
