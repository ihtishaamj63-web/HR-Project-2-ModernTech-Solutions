<!-- src/views/Reviews.vue -->
<template>
  <div class="rev-main">
    <h1>Employee Performance Reviews</h1>
    <p style="text-align:center;color:#5a5a7a;font-size:14px;margin-bottom:20px;">
      <i class="bi bi-calendar3 me-1"></i> {{ today }}
    </p>

    <div class="rev-search" v-if="isHR">
      <input type="text" v-model="search" placeholder="Search employee reviews..." />
      <button @click="filterReviews"><i class="fa-solid fa-magnifying-glass"></i> Search</button>
    </div>

    <div class="rev-actions">
      <button id="revAddBtn" @click="openAddModal" v-if="isHR">
        <i class="fa-solid fa-plus"></i> Add New Review
      </button>
    </div>

    <div class="rev-card" style="padding:0;overflow:hidden;">
      <div class="table-responsive">
        <table class="att-table table" style="margin:0;">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Department</th>
              <th>Reviewer</th>
              <th>Date</th>
              <th>Rating</th>
              <th>Comments</th>
              <th v-if="isHR">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="review in filteredReviews" :key="review.review_id">
              <td>
                <div class="att-employee-cell">
                  <div class="att-employee-avatar" :style="{ background: review.color || '#272757' }">
                    {{ review.initials }}
                  </div>
                  <span class="att-employee-name">{{ review.name }}</span>
                </div>
              </td>
              <td>{{ review.department }}</td>
              <td>{{ review.reviewer }}</td>
              <td>{{ review.date }}</td>
              <td>{{ getStars(review.rating) }}</td>
              <td>{{ review.comments }}</td>
              <td v-if="isHR">
                <button class="btn btn-sm btn-danger" @click="deleteReview(review.review_id)">
                  Delete
                </button>
              </td>
            </tr>
            <tr v-if="filteredReviews.length === 0">
              <td colspan="7" class="text-center text-muted py-4">No reviews found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="rev-download-section">
      <button class="rev-download-btn" @click="downloadPDF">
        <i class="fa-solid fa-file-pdf"></i> Download Reviews PDF
      </button>
    </div>

    <!-- Add Review Modal -->
    <div class="modal fade" id="reviewModal" tabindex="-1" ref="reviewModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header" style="background:#272757;color:white;">
            <h5 class="modal-title">Add New Review</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="submitReview">
              <div class="mb-3">
                <label class="form-label fw-semibold">Employee</label>
                <select class="form-select" v-model="newReview.employeeId" required>
                  <option value="">Select employee...</option>
                  <option v-for="emp in employeeOptions" :key="emp.emp_id" :value="emp.emp_id">
                    {{ emp.first_name }} {{ emp.last_name }} ({{ emp.department }})
                  </option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label fw-semibold">Rating</label>
                <select class="form-select" v-model="newReview.rating" required>
                  <option value="5">⭐⭐⭐⭐⭐</option>
                  <option value="4">⭐⭐⭐⭐</option>
                  <option value="3">⭐⭐⭐</option>
                  <option value="2">⭐⭐</option>
                  <option value="1">⭐</option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label fw-semibold">Comments</label>
                <textarea class="form-control" v-model="newReview.comments" rows="3" placeholder="Write performance review comments..."></textarea>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" @click="submitReview" :disabled="saving">
              <i class="bi bi-check-lg me-1"></i> {{ saving ? 'Saving...' : 'Save Review' }}
            </button>
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

const reviews = ref([]);
const employees = ref([]);
const search = ref('');
const saving = ref(false);
const today = new Date().toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

const newReview = ref({
  employeeId: '',
  rating: 5,
  comments: '',
});

const employeeOptions = computed(() => {
  return employees.value;
});

const filteredReviews = computed(() => {
  if (!search.value) return reviews.value;
  const q = search.value.toLowerCase();
  return reviews.value.filter(r =>
    r.name.toLowerCase().includes(q) ||
    r.department.toLowerCase().includes(q)
  );
});

function getStars(rating) {
  return '⭐'.repeat(rating || 0);
}

function getInitials(name) {
  if (!name) return '??';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function getColor(name) {
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#ec4899', '#06b6d4', '#f97316'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function showToast(message, type) {
  if (window.showToast) window.showToast(message, type);
  else alert(message);
}

function openAddModal() {
  newReview.value = { employeeId: '', rating: 5, comments: '' };
  const modal = new Modal(document.getElementById('reviewModal'));
  modal.show();
}

async function submitReview() {
  const { employeeId, rating, comments } = newReview.value;
  if (!employeeId || !comments) {
    showToast('Please select an employee and write a comment.', 'danger');
    return;
  }

  saving.value = true;
  try {
    await api.post('/reviews', {
      emp_id: employeeId,
      reviewer_id: state.user?.user_id || 2,
      review_date: new Date().toISOString().split('T')[0],
      review_period_start: new Date(new Date().setMonth(new Date().getMonth() - 3)).toISOString().split('T')[0],
      review_period_end: new Date().toISOString().split('T')[0],
      rating: ['poor', 'below_average', 'average', 'good', 'excellent'][rating - 1] || 'good',
      performance_score: rating,
      comments: comments,
      status: 'submitted',
    });
    showToast('Review added successfully!', 'success');
    const modal = Modal.getInstance(document.getElementById('reviewModal'));
    if (modal) modal.hide();
    await loadData();
    newReview.value = { employeeId: '', rating: 5, comments: '' };
  } catch (error) {
    console.error('Submit error:', error);
    showToast(error.response?.data?.error || 'Failed to add review', 'danger');
  } finally {
    saving.value = false;
  }
}

async function deleteReview(reviewId) {
  if (!confirm('Are you sure you want to delete this review?')) return;
  try {
    await api.delete(`/reviews/${reviewId}`);
    showToast('Review deleted.', 'success');
    await loadData();
  } catch (error) {
    console.error('Delete error:', error);
    showToast('Error deleting review', 'danger');
  }
}

function filterReviews() {
  // Search is reactive via computed
}

async function downloadPDF() {
  if (reviews.value.length === 0) {
    showToast('No reviews to download.', 'danger');
    return;
  }

  let tableRows = '';
  reviews.value.forEach(review => {
    tableRows += `<tr><td>${review.name}</td><td>${review.department}</td><td>${review.reviewer}</td><td>${review.date}</td><td>${'⭐'.repeat(review.rating)}</td><td>${review.comments}</td></tr>`;
  });

  const todayStr = new Date().toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' });
  const pdfContent = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"/>
<title>ModernTech Solutions - Performance Reviews</title>
<style>
  @page{size:A4 landscape;margin:15mm}
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Segoe UI',Arial,sans-serif;font-size:12px;color:#1a1a2e;line-height:1.4}
  .header{text-align:center;margin-bottom:20px;padding-bottom:15px;border-bottom:3px solid #272757}
  .header h1{color:#272757;font-size:22px;margin-bottom:5px}
  .header p{color:#5a5a7a;font-size:13px}
  .meta{display:flex;justify-content:space-between;margin-bottom:20px;font-size:12px;color:#8686ac}
  table{width:100%;border-collapse:collapse;margin-bottom:20px;table-layout:fixed}
  thead th{background:#272757;color:white;padding:10px 8px;text-align:left;font-weight:600;font-size:11px;text-transform:uppercase}
  thead th:nth-child(1){width:15%}
  thead th:nth-child(2){width:12%}
  thead th:nth-child(3){width:12%}
  thead th:nth-child(4){width:13%}
  thead th:nth-child(5){width:13%}
  thead th:nth-child(6){width:35%}
  tbody td{padding:10px 8px;border-bottom:1px solid #ddd;word-wrap:break-word;vertical-align:top}
  tbody tr:nth-child(even){background:#f8f9fc}
  .footer{text-align:center;font-size:11px;color:#8686ac;margin-top:30px;padding-top:10px;border-top:1px solid #d8dce6}
  .footer span{color:#272757;font-weight:600}
</style>
</head>
<body>
  <div class="header"><h1>ModernTech Solutions</h1><p>Employee Performance Reviews Report</p></div>
  <div class="meta"><div>Generated: ${todayStr}</div><div>Total Reviews: ${reviews.value.length}</div></div>
  <table><thead><tr><th>Employee</th><th>Department</th><th>Reviewer</th><th>Date</th><th>Rating</th><th>Comments</th></tr></thead><tbody>${tableRows}</tbody></table>
  <div class="footer"><p><span>ModernTech Solutions</span> | HR Department | Confidential</p><p>Generated on ${todayStr}</p></div>
</body></html>`;

  const printWindow = window.open('', '_blank', 'width=1100,height=800');
  if (printWindow) {
    printWindow.document.write(pdfContent);
    printWindow.document.close();
    setTimeout(() => { printWindow.print(); }, 500);
  }
}

async function loadData() {
  try {
    const empResponse = await api.get('/employees');
    const revResponse = await api.get('/reviews');

    if (empResponse.data.success) {
      employees.value = empResponse.data.data;
    }

    if (revResponse.data.success) {
      reviews.value = revResponse.data.data.map(r => {
        const name = `${r.first_name || ''} ${r.last_name || ''}`.trim() || 'Unknown';
        return {
          review_id: r.review_id,
          name: name,
          department: r.department || 'Unknown',
          reviewer: r.reviewer_name || 'HR Staff',
          date: new Date(r.review_date).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' }),
          rating: ['poor', 'below_average', 'average', 'good', 'excellent'].indexOf(r.rating) + 1 || 3,
          comments: r.comments || 'No comments',
          initials: getInitials(name),
          color: getColor(name),
          first_name: r.first_name || '',
          last_name: r.last_name || '',
        };
      });
    }

    // Filter for employee view (non-HR only see their own reviews)
    if (!isHR.value && state.user) {
      const userName = state.user.name || '';
      reviews.value = reviews.value.filter(r =>
        r.name.toLowerCase().includes(userName.toLowerCase())
      );
    }
  } catch (error) {
    console.error('Error loading data:', error);
    showToast('Failed to load reviews', 'danger');
  }
}

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.rev-main { width: 90%; max-width: 1400px; margin: 40px auto; flex: 1; }
.rev-main h1 { text-align: center; color: #272757; margin-bottom: 35px; }

.rev-search { display: flex; justify-content: center; gap: 15px; margin-bottom: 25px; }
.rev-search input { width: 420px; padding: 14px; border-radius: 50px; border: 1px solid #ccc; outline: none; font-family: inherit; }
.rev-search button { background: #272757; color: white; border: none; padding: 14px 28px; border-radius: 12px; cursor: pointer; transition: 0.2s; box-shadow: 0 8px 18px rgba(39,39,87,0.12); }
.rev-search button:hover { background: #505081; transform: translateY(-1px); }

.rev-actions { display: flex; justify-content: flex-end; margin-bottom: 30px; }
#revAddBtn { background: #272757; color: white; border: none; padding: 14px 25px; border-radius: 12px; cursor: pointer; font-size: 15px; font-weight: 600; transition: 0.2s; box-shadow: 0 8px 18px rgba(39,39,87,0.12); }
#revAddBtn:hover { background: #0f0e47; transform: translateY(-1px); }

.rev-card { background: white; border-radius: 18px; box-shadow: 0 8px 25px rgba(0,0,0,0.08); transition: 0.3s; }
.rev-card:hover { transform: translateY(-4px); }
.att-table { margin: 0; }
.att-table thead th { background: #f0f2f7; color: #1a1a2e; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #d8dce6; padding: 10px 14px; }
.att-table tbody td { padding: 12px 14px; vertical-align: middle; border-bottom: 1px solid #d8dce6; font-size: 14px; }

.att-employee-cell { display: flex; align-items: center; gap: 10px; }
.att-employee-avatar { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 12px; color: white; flex-shrink: 0; }
.att-employee-name { font-weight: 500; }

.rev-download-section { text-align: center; margin: 50px 0; }
.rev-download-btn { background: #f0f2f7; color: #0f0e47; border: 1px solid #d8dce6; padding: 15px 30px; border-radius: 12px; font-size: 16px; font-weight: 600; cursor: pointer; transition: 0.2s; box-shadow: 0 8px 18px rgba(39,39,87,0.12); }
.rev-download-btn:hover { background: #d8dce6; color: #0f0e47; transform: translateY(-1px); }

@media (max-width: 768px) {
  .rev-main { width: 95%; margin: 20px auto; }
  .rev-search { flex-direction: column; align-items: center; }
  .rev-search input { width: 100%; max-width: 420px; }
  .rev-search button { width: 100%; }
  .rev-actions { justify-content: center; }
}
</style>