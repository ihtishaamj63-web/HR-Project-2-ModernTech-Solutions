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
      <i class="bi bi-calendar3 me-1"></i>
      {{ today }}
    </p>

    <!-- SEARCH -->
    <div class="rev-search" v-if="isHR">
      <input
        type="text"
        v-model="search"
        placeholder="Search employee reviews..."
      />

      <button type="button">
        <i class="fa-solid fa-magnifying-glass"></i>
        Search
      </button>
    </div>

    <!-- ADD REVIEW BUTTON -->
    <div class="rev-actions" v-if="isHR">
      <button
        type="button"
        id="revAddBtn"
        @click="openAddModal"
      >
        <i class="fa-solid fa-plus"></i>
        Add New Review
      </button>
    </div>

    <!-- REVIEWS TABLE -->
    <div
      class="rev-card"
      style="padding: 0; overflow: hidden"
    >
      <div class="table-responsive">

        <table
          class="att-table table"
          style="margin: 0"
        >

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

            <tr
              v-for="review in filteredReviews"
              :key="review.review_id"
            >

              <!-- Employee -->
              <td>
                <div class="att-employee-cell">

                  <div
                    class="att-employee-avatar"
                    :style="{ background: '#272757' }"
                  >
                    {{ review.initials }}
                  </div>

                  <span class="att-employee-name">
                    {{ review.employee_name }}
                  </span>

                </div>
              </td>

              <!-- Reviewer -->
              <td>
                {{ review.reviewer_name }}
              </td>

              <!-- Date -->
              <td>
                {{ review.date }}
              </td>

              <!-- Rating -->
              <td>
                {{ displayRating(review.rating) }}
              </td>

              <!-- Performance Score -->
              <td>
                <span class="performance-score">
                  {{ review.performance_score }}/5
                </span>
              </td>

              <!-- Comments -->
              <td>
                {{ review.comments }}
              </td>

              <!-- Actions -->
              <td v-if="isHR">

                <button
                  class="btn btn-sm"
                  style="
                    background: #dc3545;
                    color: white;
                    border: none;
                  "
                  @click="deleteReview(review.review_id)"
                >
                  Delete
                </button>

              </td>

            </tr>

            <!-- NO REVIEWS -->
            <tr v-if="filteredReviews.length === 0">

              <td
                :colspan="isHR ? 7 : 6"
                class="text-center py-4"
              >
                No reviews found.
              </td>

            </tr>

          </tbody>

        </table>

      </div>
    </div>

    <!-- DOWNLOAD PDF -->
    <div class="rev-download-section">

      <button
        type="button"
        class="rev-download-btn"
        @click="generatePDF"
      >
        <i class="fa-solid fa-file-pdf"></i>
        Download Reviews PDF
      </button>

    </div>


    <!-- ========================================================= -->
    <!-- ADD NEW REVIEW MODAL -->
    <!-- ========================================================= -->

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
            style="
              background: var(--primary);
              color: white;
            "
          >

            <h5
              class="modal-title"
              id="reviewModalLabel"
            >
              Add New Review
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

                <label
                  class="form-label fw-semibold"
                >
                  Employee
                </label>

                <select
                  class="form-select"
                  v-model="newReview.employeeId"
                  required
                >

                  <option value="">
                    Select employee...
                  </option>

                  <option
                    v-for="emp in employees"
                    :key="emp.emp_id"
                    :value="emp.emp_id"
                  >
                    {{ emp.first_name }}
                    {{ emp.last_name }}
                    ({{ emp.department }})
                  </option>

                </select>

              </div>


              <!-- RATING -->
              <div class="mb-3">

                <label
                  class="form-label fw-semibold"
                >
                  Rating
                </label>

                <select
                  class="form-select"
                  v-model="newReview.rating"
                  required
                >

                  <option value="">
                    Select rating...
                  </option>

                  <option value="excellent">
                    Excellent
                  </option>

                  <option value="good">
                    Good
                  </option>

                  <option value="average">
                    Average
                  </option>

                  <option value="below_average">
                    Below Average
                  </option>

                  <option value="poor">
                    Poor
                  </option>

                </select>

              </div>


              <!-- PERFORMANCE SCORE -->
              <div class="mb-3">

                <label
                  class="form-label fw-semibold"
                >
                  Performance Score
                </label>

                <select
                  class="form-select"
                  v-model="newReview.performanceScore"
                  required
                >

                  <option value="">
                    Select score...
                  </option>

                  <option value="5">
                    5 - Excellent
                  </option>

                  <option value="4">
                    4 - Good
                  </option>

                  <option value="3">
                    3 - Average
                  </option>

                  <option value="2">
                    2 - Below Average
                  </option>

                  <option value="1">
                    1 - Poor
                  </option>

                </select>

              </div>


              <!-- STRENGTHS -->
              <div class="mb-3">

                <label
                  class="form-label fw-semibold"
                >
                  Strengths
                </label>

                <textarea
                  class="form-control"
                  v-model="newReview.strengths"
                  rows="3"
                  placeholder="Describe the employee's strengths and achievements..."
                  required
                ></textarea>

              </div>


              <!-- AREAS FOR IMPROVEMENT -->
              <div class="mb-3">

                <label
                  class="form-label fw-semibold"
                >
                  Areas for Improvement
                </label>

                <textarea
                  class="form-control"
                  v-model="newReview.areasForImprovement"
                  rows="3"
                  placeholder="Describe areas where the employee can improve..."
                  required
                ></textarea>

              </div>


              <!-- GOALS -->
              <div class="mb-3">

                <label
                  class="form-label fw-semibold"
                >
                  Goals for Next Period
                </label>

                <textarea
                  class="form-control"
                  v-model="newReview.goalsForNextPeriod"
                  rows="3"
                  placeholder="Describe goals for the next review period..."
                ></textarea>

              </div>


              <!-- COMMENTS -->
              <div class="mb-3">

                <label
                  class="form-label fw-semibold"
                >
                  Comments
                </label>

                <textarea
                  class="form-control"
                  v-model="newReview.comments"
                  rows="4"
                  placeholder="Write additional performance review comments..."
                  required
                ></textarea>

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

              <span v-if="saving">
                Saving...
              </span>

              <span v-else>
                Save Review
              </span>

            </button>

          </div>

        </div>

      </div>

    </div>

  </div>
</template>


<script setup>

import {
  ref,
  computed,
  onMounted
} from 'vue';

import { Modal } from 'bootstrap';

import { useAuth } from '../stores/auth';

import api from '../api/axios';


// ============================================================
// AUTH
// ============================================================

const {
  isHR,
  state
} = useAuth();


// ============================================================
// DATA
// ============================================================

const reviews = ref([]);

const employees = ref([]);

const search = ref('');

const saving = ref(false);

const reviewModal = ref(null);


// ============================================================
// DATE
// ============================================================

const today = new Date().toLocaleDateString(
  'en-ZA',
  {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }
);


// ============================================================
// NEW REVIEW
// ============================================================

const newReview = ref({

  employeeId: '',

  rating: '',

  performanceScore: '',

  strengths: '',

  areasForImprovement: '',

  goalsForNextPeriod: '',

  comments: ''

});


// ============================================================
// SEARCH
// ============================================================

const filteredReviews = computed(() => {

  if (!search.value.trim()) {

    return reviews.value;

  }

  const query =
    search.value.toLowerCase().trim();

  return reviews.value.filter(review =>

    review.employee_name
      .toLowerCase()
      .includes(query)

  );

});


// ============================================================
// RATING DISPLAY
// ============================================================

function displayRating(rating) {

  const ratingMap = {

    excellent: '⭐⭐⭐⭐⭐',

    good: '⭐⭐⭐⭐',

    average: '⭐⭐⭐',

    below_average: '⭐⭐',

    poor: '⭐'

  };

  return ratingMap[
    String(rating).toLowerCase()
  ] || rating || '';

}


// ============================================================
// INITIALS
// ============================================================

function getInitials(name) {

  if (!name) return '??';

  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .substring(0, 2)
    .toUpperCase();

}


// ============================================================
// FORMAT DATE
// ============================================================

function formatDate(dateValue) {

  if (!dateValue) return '';

  const date = new Date(dateValue);

  if (isNaN(date.getTime())) {

    return dateValue;

  }

  return date.toLocaleDateString(
    'en-ZA',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }
  );

}


// ============================================================
// TOAST
// ============================================================

function showToast(message, type) {

  if (window.showToast) {

    window.showToast(message, type);

  } else {

    alert(message);

  }

}


// ============================================================
// OPEN MODAL
// ============================================================

async function openAddModal() {

  newReview.value = {

    employeeId: '',

    rating: '',

    performanceScore: '',

    strengths: '',

    areasForImprovement: '',

    goalsForNextPeriod: '',

    comments: ''

  };

  await loadEmployees();

  const modal = new Modal(
    reviewModal.value
  );

  modal.show();

}


// ============================================================
// LOAD EMPLOYEES
// ============================================================

async function loadEmployees() {

  try {

    const response =
      await api.get('/employees');

    if (response.data.success) {

      employees.value =
        response.data.data;

    }

  } catch (error) {

    console.error(
      'Error loading employees:',
      error
    );

    showToast(
      'Failed to load employees.',
      'danger'
    );

  }

}


// ============================================================
// LOAD REVIEWS
// ============================================================

async function loadReviews() {

  try {

    const response =
      await api.get('/reviews');

    if (!response.data.success) {

      throw new Error(
        response.data.error ||
        'Failed to fetch reviews'
      );

    }

    let data =
      response.data.data || [];


    // EMPLOYEE VIEW
    if (
      !isHR.value &&
      state.user &&
      state.user.name
    ) {

      const currentName =
        String(state.user.name)
          .toLowerCase();

      data = data.filter(review => {

        const employeeName =
          review.employee_name ||
          `${review.first_name || ''} ${review.last_name || ''}`
            .trim();

        return employeeName
          .toLowerCase() === currentName;

      });

    }


    reviews.value =
      data.map(review => {

        const employeeName =
          review.employee_name ||
          `${review.first_name || ''} ${review.last_name || ''}`
            .trim() ||
          'Unknown Employee';

        return {

          review_id:
            review.review_id,

          employee_name:
            employeeName,

          reviewer_name:
            review.reviewer_name ||
            review.reviewer ||
            'Unknown Reviewer',

          date:
            formatDate(
              review.review_date ||
              review.date
            ),

          rating:
            review.rating || '',

          performance_score:
            review.performance_score ||
            0,

          strengths:
            review.strengths || '',

          areas_for_improvement:
            review.areas_for_improvement || '',

          goals_for_next_period:
            review.goals_for_next_period || '',

          comments:
            review.comments || '',

          initials:
            getInitials(employeeName)

        };

      });

  } catch (error) {

    console.error(
      'Error loading reviews:',
      error
    );

    showToast(
      'Failed to load reviews.',
      'danger'
    );

  }

}


// ============================================================
// SUBMIT REVIEW
// ============================================================

async function submitReview() {

  if (!isHR.value) {

    showToast(
      'Only HR staff can add reviews.',
      'danger'
    );

    return;

  }


  const {
    employeeId,
    rating,
    performanceScore,
    strengths,
    areasForImprovement,
    goalsForNextPeriod,
    comments
  } = newReview.value;


  // REQUIRED FIELDS

  if (
    !employeeId ||
    !rating ||
    !performanceScore ||
    !strengths ||
    !areasForImprovement ||
    !comments
  ) {

    showToast(
      'Please complete all required fields.',
      'danger'
    );

    return;

  }


  saving.value = true;


  try {

    const todayDate =
      new Date();

    const reviewDate =
      todayDate
        .toISOString()
        .split('T')[0];


    const periodStart =
      new Date(todayDate);

    periodStart.setMonth(
      periodStart.getMonth() - 3
    );


    const reviewPeriodStart =
      periodStart
        .toISOString()
        .split('T')[0];


    const reviewData = {

      emp_id:
        parseInt(employeeId),

      reviewer_id:
        state.user?.user_id || 2,

      review_date:
        reviewDate,

      review_period_start:
        reviewPeriodStart,

      review_period_end:
        reviewDate,

      rating:
        rating,

      performance_score:
        parseFloat(performanceScore),

      strengths:
        strengths,

      areas_for_improvement:
        areasForImprovement,

      goals_for_next_period:
        goalsForNextPeriod,

      comments:
        comments,

      status:
        'submitted'

    };


    console.log(
      'Sending review:',
      reviewData
    );


    const response =
      await api.post(
        '/reviews',
        reviewData
      );


    if (!response.data.success) {

      throw new Error(
        response.data.error ||
        'Failed to create review'
      );

    }


    showToast(
      'Review added successfully!',
      'success'
    );


    // CLOSE MODAL

    const modal =
      Modal.getInstance(
        reviewModal.value
      );

    if (modal) {

      modal.hide();

    }


    // RESET

    newReview.value = {

      employeeId: '',

      rating: '',

      performanceScore: '',

      strengths: '',

      areasForImprovement: '',

      goalsForNextPeriod: '',

      comments: ''

    };


    // REFRESH TABLE

    await loadReviews();

  } catch (error) {

    console.error(
      'Error creating review:',
      error
    );

    showToast(
      error.response?.data?.error ||
      'Failed to create review.',
      'danger'
    );

  } finally {

    saving.value = false;

  }

}


// ============================================================
// DELETE REVIEW
// ============================================================

async function deleteReview(reviewId) {

  if (!isHR.value) {

    showToast(
      'Only HR staff can delete reviews.',
      'danger'
    );

    return;

  }


  const confirmed =
    confirm(
      'Are you sure you want to delete this review?'
    );


  if (!confirmed) return;


  try {

    await api.delete(
      `/reviews/${reviewId}`
    );


    showToast(
      'Review deleted successfully.',
      'success'
    );


    await loadReviews();

  } catch (error) {

    console.error(
      'Error deleting review:',
      error
    );

    showToast(
      'Failed to delete review.',
      'danger'
    );

  }

}


// ============================================================
// PDF
// ============================================================

async function generatePDF() {

  if (reviews.value.length === 0) {

    showToast(
      'No reviews to download.',
      'danger'
    );

    return;

  }


  let tableRows = '';


  reviews.value.forEach(review => {

    tableRows += `

      <tr>

        <td>
          ${review.employee_name}
        </td>

        <td>
          ${review.reviewer_name}
        </td>

        <td>
          ${review.date}
        </td>

        <td>
          ${displayRating(review.rating)}
        </td>

        <td>
          ${review.performance_score}/5
        </td>

        <td>
          ${review.strengths || ''}
        </td>

        <td>
          ${review.areas_for_improvement || ''}
        </td>

        <td>
          ${review.goals_for_next_period || ''}
        </td>

        <td>
          ${review.comments || ''}
        </td>

      </tr>

    `;

  });


  const generatedDate =
    new Date().toLocaleDateString(
      'en-ZA',
      {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }
    );


  const pdfContent = `

    <!DOCTYPE html>

    <html>

    <head>

      <meta charset="UTF-8"/>

      <title>
        ModernTech Solutions - Performance Reviews
      </title>

      <style>

        @page {
          size: A4 landscape;
          margin: 10mm;
        }

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        body {
          font-family: "Segoe UI", Arial, sans-serif;
          font-size: 10px;
          color: #1a1a2e;
          line-height: 1.4;
        }

        .header {
          text-align: center;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 3px solid #272757;
        }

        .header h1 {
          color: #272757;
          font-size: 22px;
          margin-bottom: 5px;
        }

        .header p {
          color: #5a5a7a;
          font-size: 13px;
        }

        .meta {
          display: flex;
          justify-content: space-between;
          margin-bottom: 15px;
          font-size: 11px;
          color: #8686ac;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
        }

        thead th {
          background: #272757;
          color: white;
          padding: 7px 5px;
          text-align: left;
          font-size: 9px;
          text-transform: uppercase;
        }

        tbody td {
          padding: 7px 5px;
          border-bottom: 1px solid #ddd;
          word-wrap: break-word;
          vertical-align: top;
        }

        tbody tr:nth-child(even) {
          background: #f8f9fc;
        }

        .footer {
          text-align: center;
          font-size: 10px;
          color: #8686ac;
          margin-top: 20px;
          padding-top: 8px;
          border-top: 1px solid #d8dce6;
        }

        .footer span {
          color: #272757;
          font-weight: 600;
        }

      </style>

    </head>

    <body>

      <div class="header">

        <h1>
          ModernTech Solutions
        </h1>

        <p>
          Employee Performance Reviews Report
        </p>

      </div>


      <div class="meta">

        <div>
          Generated: ${generatedDate}
        </div>

        <div>
          Total Reviews: ${reviews.value.length}
        </div>

      </div>


      <table>

        <thead>

          <tr>

            <th>Employee</th>

            <th>Reviewer</th>

            <th>Date</th>

            <th>Rating</th>

            <th>Score</th>

            <th>Strengths</th>

            <th>Areas for Improvement</th>

            <th>Goals</th>

            <th>Comments</th>

          </tr>

        </thead>

        <tbody>

          ${tableRows}

        </tbody>

      </table>


      <div class="footer">

        <p>
          <span>ModernTech Solutions</span>
          | HR Department | Confidential
        </p>

        <p>
          Generated on ${generatedDate}
        </p>

      </div>

    </body>

    </html>

  `;


  const printWindow =
    window.open(
      '',
      '_blank',
      'width=1100,height=800'
    );


  if (!printWindow) {

    showToast(
      'Please allow pop-ups to generate the PDF.',
      'danger'
    );

    return;

  }


  printWindow.document.write(
    pdfContent
  );

  printWindow.document.close();


  setTimeout(() => {

    printWindow.print();

  }, 500);


  showToast(
    'PDF generated! Save from the print dialog.',
    'success'
  );

}


// ============================================================
// INITIAL LOAD
// ============================================================

onMounted(() => {

  loadReviews();

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
  box-shadow: 0 8px 18px rgba(39,39,87,0.12);
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
  box-shadow: 0 8px 18px rgba(39,39,87,0.12);
}

#revAddBtn:hover {
  background: #0f0e47;
  transform: translateY(-1px);
}


.rev-card {
  background: white;
  border-radius: 18px;
  box-shadow: 0 8px 25px rgba(0,0,0,0.08);
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
  box-shadow: 0 8px 18px rgba(39,39,87,0.12);
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