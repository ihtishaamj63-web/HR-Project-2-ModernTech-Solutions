<!-- src/views/Attendance.vue -->
<template>
  <div class="att-main-content">
    <div class="att-page-header">
      <div>
        <h1 class="att-page-title">Attendance Tracking</h1>
        <p class="att-page-subtitle"><i class="bi bi-calendar3 me-1"></i> {{ today }}</p>
      </div>
      <div class="att-header-actions" v-if="isHR">
        <button class="btn btn-outline-primary" @click="exportAttendance">
          <i class="bi bi-download me-1"></i> Export Excel
        </button>
        <button class="btn btn-primary" @click="openLogModal">
          <i class="bi bi-plus-lg me-1"></i> Log Attendance
        </button>
      </div>
    </div>

    <!-- HR View: Stats & Chart -->
    <template v-if="isHR">
      <div class="row g-3 mb-4">
        <div class="col-md-3">
          <div class="att-summary-card">
            <div class="att-summary-icon present"><i class="bi bi-check-circle-fill"></i></div>
            <div class="att-summary-info">
              <span class="att-summary-label">Present Today</span>
              <span class="att-summary-number">{{ stats.present }}</span>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="att-summary-card">
            <div class="att-summary-icon absent"><i class="bi bi-x-circle-fill"></i></div>
            <div class="att-summary-info">
              <span class="att-summary-label">Absent Today</span>
              <span class="att-summary-number">{{ stats.absent }}</span>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="att-summary-card">
            <div class="att-summary-icon leave"><i class="bi bi-clock-fill"></i></div>
            <div class="att-summary-info">
              <span class="att-summary-label">On Leave Today</span>
              <span class="att-summary-number">{{ stats.leave }}</span>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="att-summary-card">
            <div class="att-summary-icon rate"><i class="bi bi-graph-up"></i></div>
            <div class="att-summary-info">
              <span class="att-summary-label">Attendance Rate (14d)</span>
              <span class="att-summary-number">{{ stats.rate }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Dynamic 14-Day Chart -->
      <div class="att-card card shadow-sm mb-4">
        <div class="card-body">
          <h5 class="att-card-title mb-3"><i class="bi bi-bar-chart-line-fill"></i> Last 14 Days Overview</h5>
          <div class="chart-container">
            <div v-for="day in chartData" :key="day.date" class="chart-day">
              <div class="chart-bars">
                <div class="chart-bar present" :style="{ height: (day.present * 10) + 'px' }" :title="`Present: ${day.present}`"></div>
                <div class="chart-bar leave" :style="{ height: (day.leave * 10) + 'px' }" :title="`On Leave: ${day.leave}`"></div>
                <div class="chart-bar absent" :style="{ height: (day.absent * 10) + 'px' }" :title="`Absent: ${day.absent}`"></div>
              </div>
              <span class="chart-label">{{ day.shortDate }}</span>
            </div>
          </div>
          <div class="chart-legend mt-3">
            <span><span class="legend-dot present"></span> Present</span>
            <span><span class="legend-dot leave"></span> On Leave</span>
            <span><span class="legend-dot absent"></span> Absent</span>
          </div>
        </div>
      </div>
    </template>

    <!-- Main Table Area (For both HR and Employees) -->
    <div class="att-card card shadow-sm">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <h5 class="att-card-title mb-0">
            <i class="bi bi-list-ul"></i> 
            {{ isHR ? "Today's Employee Roster" : 'My Recent Attendance' }}
          </h5>
          <div class="att-search-box" v-if="isHR">
            <input type="text" v-model="search" placeholder="Search employee..." />
          </div>
          <button v-if="!isHR" class="btn btn-sm btn-outline-primary" @click="viewMyCalendar">
            <i class="bi bi-calendar-week me-1"></i> View My Calendar
          </button>
        </div>

        <div v-if="loading" class="text-center py-4">
          <div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div>
        </div>

        <div v-else class="table-responsive">
          <table class="att-table table table-hover">
            <thead>
              <tr v-if="isHR">
                <th>Employee</th>
                <th>Department</th>
                <th>Today Status</th>
                <th>Check In</th>
                <th>Action</th>
              </tr>
              <tr v-else>
                <th>Date</th>
                <th>Status</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Hours</th>
              </tr>
            </thead>
            <tbody>
              <!-- HR View: Roster -->
              <template v-if="isHR">
                <tr v-for="emp in paginatedRoster" :key="emp.emp_id">
                  <td>
                    <div class="att-employee-cell">
                      <div class="att-employee-avatar" :style="{ background: emp.color }">{{ emp.initials }}</div>
                      <span class="att-employee-name">{{ emp.name }}</span>
                    </div>
                  </td>
                  <td>{{ emp.department }}</td>
                  <td>
                    <span class="att-status-badge" :class="statusClass(emp.todayStatus)">
                      <span class="att-status-dot"></span> {{ formatStatus(emp.todayStatus) }}
                    </span>
                  </td>
                  <td>{{ emp.checkIn ? formatTime(emp.checkIn) : '—' }}</td>
                  <td><button class="btn btn-sm btn-outline-primary" @click="viewCalendar(emp)"><i class="bi bi-calendar3"></i> Calendar</button></td>
                </tr>
              </template>

              <!-- Employee View: History -->
              <template v-else>
                <tr v-for="record in paginatedMyHistory" :key="record.attendance_id">
                  <td>{{ formatDate(record.attendance_date) }}</td>
                  <td>
                    <span class="att-status-badge" :class="statusClass(record.status)">
                      <span class="att-status-dot"></span> {{ formatStatus(record.status) }}
                    </span>
                  </td>
                  <td>{{ record.check_in_time ? formatTime(record.check_in_time) : '—' }}</td>
                  <td>{{ record.check_out_time ? formatTime(record.check_out_time) : '—' }}</td>
                  <td>{{ record.hours_worked ? record.hours_worked + 'h' : '—' }}</td>
                </tr>
                <tr v-if="paginatedMyHistory.length === 0">
                  <td colspan="5" class="text-center text-muted py-4">No attendance records found for you.</td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
        
        <!-- Pagination -->
        <div class="att-pagination" v-if="totalPages > 1">
          <button class="btn btn-sm btn-outline-secondary" :disabled="currentPage === 1" @click="currentPage--">Prev</button>
          <span>Page {{ currentPage }} of {{ totalPages }}</span>
          <button class="btn btn-sm btn-outline-secondary" :disabled="currentPage === totalPages" @click="currentPage++">Next</button>
        </div>
      </div>
    </div>

    <!-- Log Attendance Modal -->
    <div class="modal fade" id="attLogModal" tabindex="-1" ref="logModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header" style="background:#272757;color:white;">
            <h5 class="modal-title"><i class="bi bi-calendar-check me-2"></i>Log Attendance</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="submitAttendance">
              <div class="mb-3">
                <label class="form-label fw-semibold">Employee</label>
                <select class="form-select" v-model="logForm.employeeId" required>
                  <option value="">Select employee...</option>
                  <option v-for="emp in employeeList" :key="emp.emp_id" :value="emp.emp_id">{{ emp.name }} ({{ emp.department }})</option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label fw-semibold">Date</label>
                <input type="date" class="form-control" v-model="logForm.date" required :max="todayStr" />
                <small class="text-muted">Future dates are not allowed.</small>
              </div>
              <div class="mb-3">
                <label class="form-label fw-semibold">Status</label>
                <select class="form-select" v-model="logForm.status" required @change="handleStatusChange">
                  <option value="">Select status...</option>
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="late">Late</option>
                  <option value="half_day">Half Day</option>
                  <option value="on_leave">On Leave</option>
                </select>
              </div>
              
              <div class="row" v-if="logForm.status === 'present' || logForm.status === 'late' || logForm.status === 'half_day'">
                <div class="col-md-6 mb-3">
                  <label class="form-label fw-semibold">Check In Time</label>
                  <select class="form-select" v-model="logForm.checkIn">
                    <option value="">Select time...</option>
                    <option v-for="t in checkInTimes" :key="t" :value="t">{{ formatTime(t) }}</option>
                  </select>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label fw-semibold">Check Out Time</label>
                  <select class="form-select" v-model="logForm.checkOut">
                    <option value="">Select time...</option>
                    <option v-for="t in checkOutTimes" :key="t" :value="t">{{ formatTime(t) }}</option>
                  </select>
                </div>
                <div class="col-12 mb-3 text-muted text-center">
                  <small>Calculated Hours: <strong>{{ calculatedHours }}h</strong></small>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" @click="submitAttendance" :disabled="saving">
              <i class="bi bi-check-lg me-1"></i> {{ saving ? 'Saving...' : 'Log Attendance' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Calendar Pop-up Modal (For HR and Employee) -->
    <div class="modal fade" id="attCalendarModal" tabindex="-1" ref="calendarModal">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header" style="background:#272757;color:white;">
            <h5 class="modal-title"><i class="bi bi-calendar-week me-2"></i>Attendance Calendar: {{ selectedEmp?.name }}</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="d-flex justify-content-between align-items-center mb-4">
              <button class="btn btn-sm btn-outline-secondary" @click="prevModalMonth"><i class="bi bi-chevron-left"></i></button>
              <span class="current-month">{{ modalCalendarMonthYear }}</span>
              <button class="btn btn-sm btn-outline-secondary" @click="nextModalMonth"><i class="bi bi-chevron-right"></i></button>
            </div>
            
            <div class="calendar-grid">
              <div class="calendar-weekday">Sun</div>
              <div class="calendar-weekday">Mon</div>
              <div class="calendar-weekday">Tue</div>
              <div class="calendar-weekday">Wed</div>
              <div class="calendar-weekday">Thu</div>
              <div class="calendar-weekday">Fri</div>
              <div class="calendar-weekday">Sat</div>
              
              <div v-for="(day, index) in modalCalendarDays" :key="index" class="calendar-day" :class="{ 'blank': !day.date, [day.statusClass]: day.statusClass }">
                <span v-if="day.date" class="day-number">{{ day.day }}</span>
                <span v-if="day.status" class="day-status">{{ day.status }}</span>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuth } from '../stores/auth';
import api from '../api/axios';
import { Modal } from 'bootstrap';

const { isHR, state } = useAuth();

const loading = ref(false);
const saving = ref(false);
const employeeList = ref([]);
const allRecords = ref([]);
const search = ref('');
const selectedEmp = ref(null);

const today = new Date().toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

const getLocalTodayStr = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
const todayStr = getLocalTodayStr();

const currentPage = ref(1);
const itemsPerPage = 10;

const checkInTimes = ['07:00:00', '07:30:00', '08:00:00', '08:30:00', '09:00:00', '09:30:00', '10:00:00'];
const checkOutTimes = ['16:00:00', '16:30:00', '17:00:00', '17:30:00', '18:00:00', '18:30:00', '19:00:00'];

const logForm = ref({
  employeeId: '',
  date: todayStr,
  status: '',
  checkIn: '',
  checkOut: '',
});

const stats = ref({ present: 0, absent: 0, leave: 0, rate: 0 });
const modalCalendarDate = ref(new Date());

const filteredRoster = computed(() => {
  if (!search.value) return employeeList.value;
  const q = search.value.toLowerCase();
  return employeeList.value.filter(e => e.name.toLowerCase().includes(q) || e.department.toLowerCase().includes(q));
});

const myHistory = computed(() => {
  if (!state.user) return [];
  const myEmp = employeeList.value.find(e => e.email === state.user.email);
  if (!myEmp) return [];
  return allRecords.value
    .filter(r => r.emp_id === myEmp.emp_id)
    .sort((a, b) => new Date(b.attendance_date) - new Date(a.attendance_date));
});

const selectedEmpHistory = computed(() => {
  if (!selectedEmp.value) return [];
  return allRecords.value
    .filter(r => r.emp_id === selectedEmp.value.emp_id)
    .sort((a, b) => new Date(b.attendance_date) - new Date(a.attendance_date));
});

const totalPages = computed(() => {
  const list = isHR.value ? filteredRoster.value : myHistory.value;
  return Math.ceil(list.length / itemsPerPage);
});

const paginatedRoster = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredRoster.value.slice(start, end);
});

const paginatedMyHistory = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return myHistory.value.slice(start, end);
});

const chartData = computed(() => {
  const days = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    const dayRecords = allRecords.value.filter(r => r.attendance_date === dateStr);
    
    days.push({
      date: dateStr,
      shortDate: d.toLocaleDateString('en-ZA', { day: '2-digit', month: '2-digit' }),
      present: dayRecords.filter(r => r.status === 'present' || r.status === 'late').length,
      absent: dayRecords.filter(r => r.status === 'absent').length,
      leave: dayRecords.filter(r => r.status === 'on_leave' || r.status === 'half_day').length,
    });
  }
  return days;
});

const calculatedHours = computed(() => {
  if (!logForm.value.checkIn || !logForm.value.checkOut) return 0;
  const [inH, inM] = logForm.value.checkIn.split(':').map(Number);
  const [outH, outM] = logForm.value.checkOut.split(':').map(Number);
  const diff = (outH + outM / 60) - (inH + inM / 60);
  return diff > 0 ? diff.toFixed(1) : 0;
});

function normalizeDate(dateInput) {
  if (!dateInput) return null;
  if (typeof dateInput === 'string' && dateInput.length === 10) return dateInput;
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return null;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getCalendarDays(targetDate, historyRecords) {
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = [];
  for (let i = 0; i < firstDay; i++) days.push({ blank: true });
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const record = historyRecords.value.find(r => r.attendance_date === dateStr);
    days.push({
      day: d, date: dateStr,
      status: record ? formatStatus(record.status) : null,
      statusClass: record ? statusClass(record.status) : null
    });
  }
  return days;
}

const modalCalendarDays = computed(() => getCalendarDays(modalCalendarDate.value, selectedEmpHistory));
const modalCalendarMonthYear = computed(() => modalCalendarDate.value.toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' }));

function prevModalMonth() { modalCalendarDate.value = new Date(modalCalendarDate.value.getFullYear(), modalCalendarDate.value.getMonth() - 1, 1); }
function nextModalMonth() { modalCalendarDate.value = new Date(modalCalendarDate.value.getFullYear(), modalCalendarDate.value.getMonth() + 1, 1); }

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const normalized = normalizeDate(dateStr);
  if (!normalized) return '—';
  const [y, m, d] = normalized.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatTime(timeStr) {
  if (!timeStr) return '—';
  return String(timeStr).substring(0, 5);
}

function formatStatus(status) {
  if (!status) return 'Not Recorded';
  return status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function statusClass(status) {
  if (status === 'present') return 'active';
  if (status === 'absent') return 'absent';
  if (status === 'on_leave' || status === 'half_day') return 'on-leave';
  if (status === 'late') return 'late';
  return 'probation';
}

function getDepartmentColor(dept) {
  const colors = {
    Development: '#4CAF50', HR: '#2196F3', QA: '#FF9800', Sales: '#E74C5E',
    Marketing: '#9C27B0', Design: '#00BCD4', IT: '#607D8B', Finance: '#795548', Support: '#3F51B5'
  };
  return colors[dept] || '#8686AC';
}

function handleStatusChange() {
  if (logForm.value.status === 'absent' || logForm.value.status === 'on_leave') {
    logForm.value.checkIn = '';
    logForm.value.checkOut = '';
  }
}

function openLogModal() {
  logForm.value = { employeeId: '', date: todayStr, status: '', checkIn: '', checkOut: '' };
  const modal = new Modal(document.getElementById('attLogModal'));
  modal.show();
}

function viewCalendar(emp) {
  selectedEmp.value = emp;
  modalCalendarDate.value = new Date();
  const modal = new Modal(document.getElementById('attCalendarModal'));
  modal.show();
}

function viewMyCalendar() {
  const myEmp = employeeList.value.find(e => e.email === state.user?.email);
  if (myEmp) {
    viewCalendar(myEmp);
  } else {
    showToast('Could not find your employee record.', 'danger');
  }
}

function showToast(message, type) {
  if (window.showToast) window.showToast(message, type);
  else alert(message);
}

async function submitAttendance() {
  const { employeeId, date, status, checkIn, checkOut } = logForm.value;
  if (!employeeId || !date || !status) {
    showToast('Please fill in all required fields', 'danger');
    return;
  }

  const dateObj = new Date(date);
  const day = dateObj.getDay();
  if (day === 0 || day === 6) {
    showToast('Cannot log attendance for weekends', 'danger');
    return;
  }

  if ((status === 'present' || status === 'late' || status === 'half_day') && (!checkIn || !checkOut)) {
    showToast('Please select Check In and Check Out times', 'danger');
    return;
  }

  saving.value = true;
  try {
    await api.post('/attendance', {
      emp_id: employeeId, attendance_date: date, status: status, check_in_time: checkIn || null,
      check_out_time: checkOut || null, hours_worked: calculatedHours.value || 0,
    });
    showToast('Attendance logged successfully', 'success');
    const modal = Modal.getInstance(document.getElementById('attLogModal'));
    if (modal) modal.hide();
    await loadData();
  } catch (error) {
    console.error('Submit error:', error);
    showToast(error.response?.data?.error || 'Failed to log attendance. Record might already exist.', 'danger');
  } finally {
    saving.value = false;
  }
}

// FIX: Upgraded CSV export to Styled Excel (.xls) format
function exportAttendance() {
  if (!isHR.value) {
    showToast('Only HR staff can export attendance data.', 'danger');
    return;
  }

  try {
    let html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="UTF-8">
        <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Attendance Report</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; }
          .header { text-align: center; font-size: 18px; font-weight: bold; color: #272757; }
          .sub-header { text-align: center; font-size: 12px; color: #5a5a7a; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th { background-color: #272757; color: white; padding: 10px; text-align: left; font-size: 12px; }
          td { padding: 8px 10px; border: 1px solid #d8dce6; font-size: 12px; }
          .present { background-color: #e8f5e9; color: #1b5e20; font-weight: bold; }
          .absent { background-color: #ffebee; color: #b71c1c; font-weight: bold; }
          .on-leave { background-color: #fff3e0; color: #bf360c; font-weight: bold; }
          .late { background-color: #e3f2fd; color: #0d47a1; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">ModernTech Solutions</div>
        <div class="sub-header">Attendance Report - Generated on ${new Date().toLocaleDateString()}</div>
        <table>
          <thead>
            <tr>
              <th>Employee Name</th>
              <th>Department</th>
              <th>Date</th>
              <th>Status</th>
              <th>Check In</th>
              <th>Check Out</th>
              <th>Hours</th>
            </tr>
          </thead>
          <tbody>
    `;

    allRecords.value.forEach(r => {
      const emp = employeeList.value.find(e => e.emp_id === r.emp_id);
      // FIX: Renamed variable to cellClass to avoid conflict with statusClass() function
      const cellClass = statusClass(r.status);
      html += `
        <tr>
          <td>${emp ? emp.name : 'Unknown'}</td>
          <td>${emp ? emp.department : 'N/A'}</td>
          <td>${formatDate(r.attendance_date)}</td>
          <td class="${cellClass}">${formatStatus(r.status)}</td>
          <td>${formatTime(r.check_in_time)}</td>
          <td>${formatTime(r.check_out_time)}</td>
          <td>${r.hours_worked || 0}</td>
        </tr>
      `;
    });

    html += `
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `attendance_report_${todayStr}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast('Styled Excel report exported successfully', 'success');
  } catch (error) {
    console.error('Export error:', error);
    showToast('Failed to export attendance', 'danger');
  }
}

async function loadData() {
  loading.value = true;
  try {
    const empResponse = await api.get('/employees');
    const attResponse = await api.get('/attendance');

    if (empResponse.data.success) {
      employeeList.value = empResponse.data.data.map(emp => ({
        ...emp,
        name: `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || 'Unknown',
        initials: (emp.first_name?.[0] || '') + (emp.last_name?.[0] || ''),
        color: getDepartmentColor(emp.department),
        todayStatus: 'not_recorded',
        checkIn: null,
      }));
    }

    if (attResponse.data.success) {
      allRecords.value = attResponse.data.data.map(r => ({
        ...r,
        attendance_date: normalizeDate(r.attendance_date)
      }));
      
      let present = 0, absent = 0, leave = 0;
      employeeList.value.forEach(emp => {
        const todayRec = allRecords.value.find(r => r.emp_id === emp.emp_id && r.attendance_date === todayStr);
        if (todayRec) {
          emp.todayStatus = todayRec.status;
          emp.checkIn = todayRec.check_in_time;
          if (todayRec.status === 'present' || todayRec.status === 'late') present++;
          else if (todayRec.status === 'absent') absent++;
          else if (todayRec.status === 'on_leave' || todayRec.status === 'half_day') leave++;
        }
      });

      let totalRecords = 0, presentRecords = 0;
      chartData.value.forEach(day => {
        totalRecords += day.present + day.absent + day.leave;
        presentRecords += day.present;
      });
      
      stats.value = {
        present, absent, leave,
        rate: totalRecords > 0 ? Math.round((presentRecords / totalRecords) * 100) : 0
      };
    }
  } catch (error) {
    console.error('Error loading data:', error);
    showToast('Failed to load attendance data', 'danger');
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.att-main-content { padding: 28px 36px 40px; }
.att-page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; flex-wrap: wrap; gap: 16px; }
.att-header-actions { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
.att-page-title { font-size: 24px; font-weight: 700; color: #272757; margin: 0; }
.att-page-subtitle { font-size: 14px; color: #5a5a7a; margin: 2px 0 0; }
.att-card { border: none; border-radius: 12px; background: white; box-shadow: 0 2px 8px rgba(39,39,87,0.08); }
.att-card .card-body { padding: 24px 28px; }
.att-card-title { font-size: 15px; font-weight: 600; color: #272757; margin: 0; }
.att-card-title i { color: #8686ac; margin-right: 8px; }

.att-summary-card { background: white; border-radius: 12px; padding: 16px 20px; box-shadow: 0 2px 8px rgba(39,39,87,0.08); display: flex; align-items: center; gap: 16px; border-left: 3px solid #8686ac; }
.att-summary-icon { width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; color: white; }
.att-summary-icon.present { background: #43a047; }
.att-summary-icon.absent { background: #e53935; }
.att-summary-icon.leave { background: #fb8c00; }
.att-summary-icon.rate { background: #272757; }
.att-summary-info { display: flex; flex-direction:column; gap: 4px; }
.att-summary-label { font-size: 13px; color: #5a5a7a; font-weight: 500; }
.att-summary-number { font-size: 24px; font-weight: 700; color: #1a1a2e; }

.chart-container { display: flex; align-items: flex-end; justify-content: space-between; gap: 8px; height: 180px; padding-top: 20px; }
.chart-day { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8px; height: 100%; }
.chart-bars { display: flex; align-items: flex-end; gap: 2px; height: 100%; width: 100%; justify-content: center; }
.chart-bar { width: 6px; min-height: 2px; border-radius: 2px 2px 0 0; transition: height 0.3s ease; }
.chart-bar.present { background: #43a047; }
.chart-bar.leave { background: #fb8c00; }
.chart-bar.absent { background: #e53935; }
.chart-label { font-size: 10px; color: #5a5a7a; font-weight: 600; }
.chart-legend { display: flex; justify-content: center; gap: 20px; font-size: 12px; color: #5a5a7a; }
.legend-dot { display: inline-block; width: 10px; height: 10px; border-radius: 50%; margin-right: 5px; }
.legend-dot.present { background: #43a047; }
.legend-dot.leave { background: #fb8c00; }
.legend-dot.absent { background: #e53935; }

.att-table { margin: 0; }
.att-table thead th { background: #f0f2f7; color: #1a1a2e; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #d8dce6; padding: 10px 14px; }
.att-table tbody td { padding: 12px 14px; vertical-align: middle; border-bottom: 1px solid #d8dce6; font-size: 14px; }
.att-employee-cell { display: flex; align-items: center; gap: 10px; }
.att-employee-avatar { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 12px; color: white; flex-shrink: 0; }
.att-employee-name { font-weight: 500; }
.att-status-badge { display: inline-flex; align-items: center; gap: 5px; padding: 3px 12px; border-radius: 100px; font-size: 12px; font-weight: 600; }
.att-status-badge .att-status-dot { width: 6px; height: 6px; border-radius: 50%; }
.att-status-badge.active { background: #e8f5e9; color: #1b5e20; }
.att-status-badge.active .att-status-dot { background: #43a047; }
.att-status-badge.absent { background: #ffebee; color: #b71c1c; }
.att-status-badge.absent .att-status-dot { background: #e53935; }
.att-status-badge.on-leave { background: #fff3e0; color: #bf360c; }
.att-status-badge.on-leave .att-status-dot { background: #fb8c00; }
.att-status-badge.late { background: #e3f2fd; color: #0d47a1; }
.att-status-badge.late .att-status-dot { background: #1a73e8; }
.att-status-badge.probation { background: #f0f2f7; color: #5a5a7a; }
.att-status-badge.probation .att-status-dot { background: #8686ac; }

.att-pagination { margin-top: 20px; display: flex; justify-content: center; align-items: center; gap: 15px; font-size: 14px; }

/* Calendar Pop-up Styles */
.current-month { font-weight: 600; font-size: 16px; color: #272757; min-width: 150px; text-align: center; }
.calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 10px; }
.calendar-weekday { text-align: center; font-weight: 600; color: #5a5a7a; font-size: 12px; padding-bottom: 10px; }
.calendar-day { min-height: 80px; border: 1px solid #d8dce6; border-radius: 8px; padding: 8px; display: flex; flex-direction: column; justify-content: space-between; background: #fff; transition: 0.2s; }
.calendar-day.blank { background: transparent; border: none; }
.calendar-day .day-number { font-size: 14px; font-weight: 600; color: #1a1a2e; }
.calendar-day .day-status { font-size: 11px; font-weight: 600; text-align: center; padding: 2px 0; border-radius: 4px; margin-top: auto; }
.calendar-day.active { border-color: #43a047; }
.calendar-day.active .day-status { background: #e8f5e9; color: #1b5e20; }
.calendar-day.absent { border-color: #e53935; }
.calendar-day.absent .day-status { background: #ffebee; color: #b71c1c; }
.calendar-day.on-leave { border-color: #fb8c00; }
.calendar-day.on-leave .day-status { background: #fff3e0; color: #bf360c; }
.calendar-day.late { border-color: #1a73e8; }
.calendar-day.late .day-status { background: #e3f2fd; color: #0d47a1; }
</style>