<template>
  <div class="rev-main">
    <h1>Employee Performance Reviews</h1>
    <p
      style="
        text-align: center;
        color: var(--text-muted);
        font-size: 14px;
        margin-bottom: 20px;
      "
    >
      <i class="bi bi-calendar3 me-1"></i> {{ today }}
    </p>

    <!-- SEARCH -->
    <div class="rev-search" v-if="isHR">
      <input
        type="text"
        v-model="search"
        placeholder="Search employee reviews..."
      />
      <button type="button" @click="filterReviews">
        <i class="fa-solid fa-magnifying-glass"></i> Search
      </button>
    </div>

    <!-- ADD REVIEW BUTTON -->
    <div class="rev-actions" v-if="isHR">
      <button type="button" id="revAddBtn" @click="openAddModal">
        <i class="fa-solid fa-plus"></i> Add New Review
      </button>
    </div>

    <!-- REVIEWS TABLE -->
    <div class="rev-card" style="padding: 0; overflow: hidden">
      <div class="table-responsive">
        <table class="att-table table" style="margin: 0">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Reviewer</th>
              <th>Date</th>
              <th>Rating</th>
              <th>Performance Score</th>
              <th>Comments</th>
              <th v-if="isHR">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="review in filteredReviews" :key="review.review_id">
              <!-- Employee -->
              <td>
                <div class="att-employee-cell">
                  <div
                    class="att-employee-avatar"
                    :style="{ background: '#272757' }"
                  >
                    {{ review.initials }}
                  </div>
                  <span class="att-employee-name">{{
                    review.employee_name
                  }}</span>
                </div>
              </td>
              <!-- Reviewer -->
              <td>{{ review.reviewer_name }}</td>
              <!-- Date -->
              <td>{{ review.date }}</td>
              <!-- Rating -->
              <td>{{ review.rating_stars }}</td>
              <!-- Performance Score -->
              <td>
                <span class="performance-score"
                  >{{ review.performance_score }}/5</span
                >
              </td>
              <!-- Comments -->
              <td>{{ review.comments }}</td>
              <!-- Actions -->
              <td v-if="isHR">
                <div class="d-flex gap-2">
                  <button
                    class="btn btn-sm btn-warning"
                    @click="openEditModal(review)"
                  >
                    Edit
                  </button>
                  <button
                    class="btn btn-sm"
                    style="background: #dc3545; color: white; border: none"
                    @click="deleteReview(review.review_id)"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
            <!-- NO REVIEWS -->
            <tr v-if="filteredReviews.length === 0">
              <td :colspan="isHR ? 7 : 6" class="text-center py-4">
                No reviews found.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- DOWNLOAD PDF -->
    <div class="rev-download-section">
      <button type="button" class="rev-download-btn" @click="generatePDF">
        <i class="fa-solid fa-file-pdf"></i> Download Reviews PDF
      </button>
    </div>

    <!-- ADD/EDIT REVIEW MODAL -->
    <div
      class="modal fade"
      id="reviewModal"
      tabindex="-1"
      aria-labelledby="reviewModalLabel"
      aria-hidden="true"
      ref="reviewModal"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <!-- MODAL HEADER -->
          <div
            class="modal-header"
            style="background: var(--primary); color: white"
          >
            <h5 class="modal-title" id="reviewModalLabel">
              {{ isEditing ? "Edit Review" : "Add New Review" }}
            </h5>
            <button
              type="button"
              class="btn-close btn-close-white"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>

          <!-- MODAL BODY -->
          <div class="modal-body">
            <form @submit.prevent="submitReview">
              <!-- EMPLOYEE -->
              <div class="mb-3">
                <label class="form-label fw-semibold"
                  >Employee <span class="text-danger">*</span></label
                >
                <select
                  class="form-select"
                  v-model="newReview.employeeId"
                  required
                  :disabled="isEditing"
                >
                  <option value="">Select employee...</option>
                  <option
                    v-for="emp in employees"
                    :key="emp.emp_id"
                    :value="emp.emp_id"
                  >
                    {{ emp.first_name }} {{ emp.last_name }} ({{
                      emp.department
                    }})
                  </option>
                </select>
                <small v-if="isEditing" class="text-muted"
                  >Employee cannot be changed after creation.</small
                >
              </div>

              <!-- OVERALL RATING -->
              <div class="mb-3">
                <label class="form-label fw-semibold"
                  >Overall Rating <span class="text-danger">*</span></label
                >
                <select class="form-select" v-model="newReview.score" required>
                  <option value="">Select rating...</option>
                  <option value="5">⭐⭐⭐⭐⭐ Excellent (5/5)</option>
                  <option value="4">⭐⭐⭐⭐ Good (4/5)</option>
                  <option value="3">⭐⭐⭐ Average (3/5)</option>
                  <option value="2">⭐⭐ Below Average (2/5)</option>
                  <option value="1">⭐ Poor (1/5)</option>
                </select>
              </div>

              <!-- STRENGTHS -->
              <div class="mb-3">
                <label class="form-label fw-semibold"
                  >Strengths <span class="text-danger">*</span></label
                >
                <textarea
                  class="form-control"
                  v-model="newReview.strengths"
                  rows="3"
                  minlength="10"
                  maxlength="500"
                  placeholder="Describe the employee's strengths and achievements (min 10 characters)..."
                  required
                ></textarea>
                <small class="text-muted"
                  >Minimum 10 characters, maximum 500.</small
                >
              </div>

              <!-- AREAS FOR IMPROVEMENT -->
              <div class="mb-3">
                <label class="form-label fw-semibold"
                  >Areas for Improvement
                  <span class="text-danger">*</span></label
                >
                <textarea
                  class="form-control"
                  v-model="newReview.areasForImprovement"
                  rows="3"
                  minlength="10"
                  maxlength="500"
                  placeholder="Describe areas where the employee can improve (min 10 characters)..."
                  required
                ></textarea>
                <small class="text-muted"
                  >Minimum 10 characters, maximum 500.</small
                >
              </div>

              <!-- GOALS -->
              <div class="mb-3">
                <label class="form-label fw-semibold"
                  >Goals for Next Period
                  <span class="text-danger">*</span></label
                >
                <textarea
                  class="form-control"
                  v-model="newReview.goalsForNextPeriod"
                  rows="3"
                  minlength="10"
                  maxlength="500"
                  placeholder="Describe goals for the next review period (min 10 characters)..."
                  required
                ></textarea>
                <small class="text-muted"
                  >Minimum 10 characters, maximum 500.</small
                >
              </div>

              <!-- COMMENTS -->
              <div class="mb-3">
                <label class="form-label fw-semibold"
                  >Comments <span class="text-danger">*</span></label
                >
                <textarea
                  class="form-control"
                  v-model="newReview.comments"
                  rows="4"
                  minlength="10"
                  maxlength="1000"
                  placeholder="Write additional performance review comments (min 10 characters)..."
                  required
                ></textarea>
                <small class="text-muted"
                  >Minimum 10 characters, maximum 1000.</small
                >
              </div>
            </form>
          </div>

          <!-- MODAL FOOTER -->
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              data-bs-dismiss="modal"
            >
              Cancel
            </button>
            <button
              type="button"
              class="btn btn-primary"
              @click="submitReview"
              :disabled="saving"
            >
              <span v-if="saving">Saving...</span>
              <span v-else>{{
                isEditing ? "Update Review" : "Save Review"
              }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { Modal } from "bootstrap";
import { useAuth } from "../stores/auth";
import api from "../api/axios";

const { isHR, state } = useAuth();

const reviews = ref([]);
const employees = ref([]);
const search = ref("");
const saving = ref(false);
const reviewModal = ref(null);

// FIX: Added state for editing
const isEditing = ref(false);
const editingReviewId = ref(null);

const today = new Date().toLocaleDateString("en-ZA", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const newReview = ref({
  employeeId: "",
  score: "",
  strengths: "",
  areasForImprovement: "",
  goalsForNextPeriod: "",
  comments: "",
});

const filteredReviews = computed(() => {
  if (!search.value.trim()) return reviews.value;
  const query = search.value.toLowerCase().trim();
  return reviews.value.filter((review) =>
    review.employee_name.toLowerCase().includes(query),
  );
});

function filterReviews() {
  /* Computed property handles this automatically */
}

function getInitials(name) {
  if (!name) return "??";
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .substring(0, 2)
    .toUpperCase();
}

function formatDate(dateValue) {
  if (!dateValue) return "";
  const date = new Date(dateValue);
  if (isNaN(date.getTime())) return dateValue;
  return date.toLocaleDateString("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function showToast(message, type) {
  if (window.showToast) window.showToast(message, type);
  else alert(message);
}

async function openAddModal() {
  isEditing.value = false;
  editingReviewId.value = null;
  newReview.value = {
    employeeId: "",
    score: "",
    strengths: "",
    areasForImprovement: "",
    goalsForNextPeriod: "",
    comments: "",
  };

  await loadEmployees();
  const modal = new Modal(reviewModal.value);
  modal.show();
}

// FIX: New function to handle opening the modal for editing
function openEditModal(review) {
  isEditing.value = true;
  editingReviewId.value = review.review_id;

  newReview.value = {
    employeeId: String(review.emp_id), // Must be string for v-model select
    score: String(review.performance_score), // Must be string for v-model select
    strengths: review.strengths || "",
    areasForImprovement: review.areas_for_improvement || "",
    goalsForNextPeriod: review.goals_for_next_period || "",
    comments: review.comments || "",
  };

  const modal = new Modal(reviewModal.value);
  modal.show();
}

async function loadEmployees() {
  try {
    const response = await api.get("/employees");
    if (response.data.success) {
      employees.value = response.data.data;
    }
  } catch (error) {
    console.error("Error loading employees:", error);
    showToast("Failed to load employees list.", "danger");
  }
}

async function loadReviews() {
  try {
    const response = await api.get("/reviews");
    if (!response.data.success)
      throw new Error(response.data.error || "Failed to fetch reviews");

    let data = response.data.data || [];
    let myEmpId = null;
    if (!isHR.value && state.user) {
      const myEmp = employees.value.find((e) => e.email === state.user.email);
      if (myEmp) myEmpId = myEmp.emp_id;
    }

    reviews.value = data
      .map((review) => {
        const employeeName =
          `${review.emp_first_name || ""} ${review.emp_last_name || ""}`.trim() ||
          "Unknown Employee";
        const reviewerName =
          `${review.rev_first_name || ""} ${review.rev_last_name || ""}`.trim() ||
          "Unknown Reviewer";
        const score = Number(review.performance_score) || 0;
        let stars = "";
        if (score === 5) stars = "⭐⭐⭐⭐⭐";
        else if (score === 4) stars = "⭐⭐⭐⭐";
        else if (score === 3) stars = "⭐⭐⭐";
        else if (score === 2) stars = "⭐⭐";
        else if (score === 1) stars = "⭐";

        return {
          review_id: review.review_id,
          emp_id: review.emp_id, // Needed for editing
          employee_name: employeeName,
          reviewer_name: reviewerName,
          date: formatDate(review.review_date || review.date),
          rating_stars: stars,
          performance_score: score,
          strengths: review.strengths || "",
          areas_for_improvement: review.areas_for_improvement || "",
          goals_for_next_period: review.goals_for_next_period || "",
          comments: review.comments || "",
          initials: getInitials(employeeName),
        };
      })
      .filter((review) => (isHR.value ? true : review.emp_id === myEmpId));
  } catch (error) {
    console.error("Error loading reviews:", error);
    showToast("Failed to load reviews.", "danger");
  }
}

async function submitReview() {
  if (!isHR.value)
    return showToast("Only HR staff can add/edit reviews.", "danger");

  const {
    employeeId,
    score,
    strengths,
    areasForImprovement,
    goalsForNextPeriod,
    comments,
  } = newReview.value;

  if (!employeeId) return showToast("Please select an employee.", "danger");
  if (!score) return showToast("Please select an overall rating.", "danger");

  const cleanStr = (str) => (str ? str.trim() : "");
  if (cleanStr(strengths).length < 10)
    return showToast(
      "Strengths must be at least 10 characters long.",
      "danger",
    );
  if (cleanStr(areasForImprovement).length < 10)
    return showToast(
      "Areas for Improvement must be at least 10 characters long.",
      "danger",
    );
  if (cleanStr(goalsForNextPeriod).length < 10)
    return showToast(
      "Goals for Next Period must be at least 10 characters long.",
      "danger",
    );
  if (cleanStr(comments).length < 10)
    return showToast("Comments must be at least 10 characters long.", "danger");

  saving.value = true;
  try {
    const ratingEnumMap = {
      5: "excellent",
      4: "good",
      3: "average",
      2: "below_average",
      1: "poor",
    };

    const reviewData = {
      emp_id: parseInt(employeeId),
      rating: ratingEnumMap[score],
      performance_score: parseFloat(score),
      strengths: cleanStr(strengths),
      areas_for_improvement: cleanStr(areasForImprovement),
      goals_for_next_period: cleanStr(goalsForNextPeriod),
      comments: cleanStr(comments),
      status: "submitted",
    };

    // FIX: If editing, send PUT. If adding, send POST.
    if (isEditing.value) {
      const response = await api.put(
        `/reviews/${editingReviewId.value}`,
        reviewData,
      );
      if (!response.data.success)
        throw new Error(response.data.error || "Failed to update review");
      showToast("Review updated successfully!", "success");
    } else {
      // Add required dates for new reviews
      const todayDate = new Date();
      reviewData.reviewer_id = state.user?.user_id;
      reviewData.review_date = todayDate.toISOString().split("T")[0];
      reviewData.review_period_start = new Date(
        todayDate.getFullYear(),
        todayDate.getMonth() - 3,
        1,
      )
        .toISOString()
        .split("T")[0];
      reviewData.review_period_end = todayDate.toISOString().split("T")[0];

      const response = await api.post("/reviews", reviewData);
      if (!response.data.success)
        throw new Error(response.data.error || "Failed to create review");
      showToast("Review added successfully!", "success");
    }

    const modal = Modal.getInstance(reviewModal.value);
    if (modal) modal.hide();

    newReview.value = {
      employeeId: "",
      score: "",
      strengths: "",
      areasForImprovement: "",
      goalsForNextPeriod: "",
      comments: "",
    };
    await loadReviews();
  } catch (error) {
    console.error("Error saving review:", error);
    showToast(
      error.response?.data?.error || "Failed to save review.",
      "danger",
    );
  } finally {
    saving.value = false;
  }
}

async function deleteReview(reviewId) {
  if (!isHR.value) return;
  if (!confirm("Are you sure you want to delete this review?")) return;
  try {
    await api.delete(`/reviews/${reviewId}`);
    showToast("Review deleted successfully.", "success");
    await loadReviews();
  } catch (error) {
    console.error("Error deleting review:", error);
    showToast("Failed to delete review.", "danger");
  }
}

async function generatePDF() {
  if (reviews.value.length === 0)
    return showToast("No reviews to download.", "danger");
  let tableRows = "";
  reviews.value.forEach((review) => {
    tableRows += `<tr><td>${review.employee_name}</td><td>${review.reviewer_name}</td><td>${review.date}</td><td>${review.rating_stars}</td><td>${review.performance_score}/5</td><td>${review.strengths || ""}</td><td>${review.areas_for_improvement || ""}</td><td>${review.goals_for_next_period || ""}</td><td>${review.comments || ""}</td></tr>`;
  });
  const generatedDate = new Date().toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const pdfContent = `<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>ModernTech Solutions - Performance Reviews</title><style>@page{size:A4 landscape;margin:10mm}*{box-sizing:border-box;margin:0;padding:0}body{font-family:"Segoe UI",Arial,sans-serif;font-size:10px;color:#1a1a2e;line-height:1.4}.header{text-align:center;margin-bottom:15px;padding-bottom:10px;border-bottom:3px solid #272757}.header h1{color:#272757;font-size:22px;margin-bottom:5px}.header p{color:#5a5a7a;font-size:13px}.meta{display:flex;justify-content:space-between;margin-bottom:15px;font-size:11px;color:#8686ac}table{width:100%;border-collapse:collapse;table-layout:fixed}thead th{background:#272757;color:white;padding:7px 5px;text-align:left;font-size:9px;text-transform:uppercase}tbody td{padding:7px 5px;border-bottom:1px solid #ddd;word-wrap:break-word;vertical-align:top}tbody tr:nth-child(even){background:#f8f9fc}.footer{text-align:center;font-size:10px;color:#8686ac;margin-top:20px;padding-top:8px;border-top:1px solid #d8dce6}.footer span{color:#272757;font-weight:600}</style></head><body><div class="header"><h1>ModernTech Solutions</h1><p>Employee Performance Reviews Report</p></div><div class="meta"><div>Generated: ${generatedDate}</div><div>Total Reviews: ${reviews.value.length}</div></div><table><thead><tr><th>Employee</th><th>Reviewer</th><th>Date</th><th>Rating</th><th>Score</th><th>Strengths</th><th>Areas for Improvement</th><th>Goals</th><th>Comments</th></tr></thead><tbody>${tableRows}</tbody></table><div class="footer"><p><span>ModernTech Solutions</span> | HR Department | Confidential</p><p>Generated on ${generatedDate}</p></div></body></html>`;
  const printWindow = window.open("", "_blank", "width=1100,height=800");
  if (!printWindow)
    return showToast("Please allow pop-ups to generate the PDF.", "danger");
  printWindow.document.write(pdfContent);
  printWindow.document.close();
  setTimeout(() => {
    printWindow.print();
  }, 500);
  showToast("PDF generated! Save from the print dialog.", "success");
}

onMounted(async () => {
  await loadEmployees();
  await loadReviews();
});
</script>

<style scoped>
.rev-main {
  width: 90%;
  max-width: 1400px;
  margin: 40px auto;
  flex: 1;
}
.rev-main h1 {
  text-align: center;
  color: #272757;
  margin-bottom: 35px;
}
.rev-search {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 25px;
}
.rev-search input {
  width: 420px;
  padding: 14px;
  border-radius: 50px;
  border: 1px solid #ccc;
  outline: none;
  font-family: inherit;
}
.rev-search button {
  background: #272757;
  color: white;
  border: none;
  padding: 14px 28px;
  border-radius: 12px;
  cursor: pointer;
  transition: 0.2s;
  box-shadow: 0 8px 18px rgba(39, 39, 87, 0.12);
}
.rev-search button:hover {
  background: #505081;
  transform: translateY(-1px);
}
.rev-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 30px;
}
#revAddBtn {
  background: #272757;
  color: white;
  border: none;
  padding: 14px 25px;
  border-radius: 12px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  transition: 0.2s;
  box-shadow: 0 8px 18px rgba(39, 39, 87, 0.12);
}
#revAddBtn:hover {
  background: #0f0e47;
  transform: translateY(-1px);
}
.rev-card {
  background: white;
  border-radius: 18px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
  transition: 0.3s;
}
.rev-card:hover {
  transform: translateY(-4px);
}
.att-table {
  margin: 0;
}
.att-table thead th {
  background: #f0f2f7;
  color: #1a1a2e;
  font-weight: 600;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #d8dce6;
  padding: 10px 14px;
}
.att-table tbody td {
  padding: 12px 14px;
  vertical-align: middle;
  border-bottom: 1px solid #d8dce6;
  font-size: 14px;
}
.att-employee-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}
.att-employee-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 12px;
  color: white;
  flex-shrink: 0;
}
.att-employee-name {
  font-weight: 500;
}
.performance-score {
  display: inline-block;
  background: #f0f2f7;
  color: #272757;
  padding: 5px 10px;
  border-radius: 8px;
  font-weight: 600;
}
.rev-download-section {
  text-align: center;
  margin: 50px 0;
}
.rev-download-btn {
  background: #f0f2f7;
  color: #0f0e47;
  border: 1px solid #d8dce6;
  padding: 15px 30px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
  box-shadow: 0 8px 18px rgba(39, 39, 87, 0.12);
}
.rev-download-btn:hover {
  background: #d8dce6;
  color: #0f0e47;
  transform: translateY(-1px);
}
@media (max-width: 768px) {
  .rev-main {
    width: 95%;
    margin: 20px auto;
  }
  .rev-search {
    flex-direction: column;
    align-items: center;
  }
  .rev-search input {
    width: 100%;
    max-width: 420px;
  }
  .rev-search button {
    width: 100%;
  }
  .rev-actions {
    justify-content: center;
  }
}
</style>
