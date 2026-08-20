<!-- frontend-vue/src/views/TimeOff.vue -->
<template>
  <div class="to-main-content">
    <div class="to-page-header">
      <div>
        <h1 class="to-page-title">Time Off</h1>
        <p class="to-page-subtitle"><i class="bi bi-calendar3 me-1"></i> {{ today }}</p>
      </div>
      <div class="to-header-actions">
        <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#toNewRequestModal" @click="openNewRequest">
          <i class="bi bi-plus-lg me-1"></i> New Request
        </button>
      </div>
    </div>

    <div class="to-card card shadow-sm">
      <div class="card-body">
        <div class="to-header">
          <h5 class="to-card-title"><i class="bi bi-clock-history"></i> Time Off Requests</h5>
        </div>
        <div class="to-filter-tabs mt-3">
          <button v-for="tab in filterTabs" :key="tab.key" class="to-filter-tab" :class="{ active: currentFilter === tab.key }" @click="currentFilter = tab.key">
            <i :class="tab.icon"></i> {{ tab.label }}
            <span class="to-tab-count" :class="tab.countClass">{{ getCount(tab.key) }}</span>
          </button>
        </div>
        <div id="toRequestsContainer" class="mt-3">
          <div v-if="loading" class="text-center py-4">
            <div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div>
          </div>
          <div v-else-if="paginatedRequests.length === 0" class="to-empty-state">
            <i class="bi bi-inbox"></i>
            <p class="text-muted">{{ isHR ? 'No requests found.' : 'You have no time off requests.' }}</p>
          </div>
          <div v-else>
            <div v-for="req in paginatedRequests" :key="req.timeoff_id" class="to-request-card" :class="'status-' + req.status.toLowerCase()">
              <div class="to-request-header">
                <div class="to-request-employee">
                  <div class="to-request-avatar" :style="{ background: req.color }">{{ req.initials }}</div>
                  <div>
                    <div class="to-request-name">{{ req.employeeName }}</div>
                    <div class="to-request-position">{{ req.position }}</div>
                  </div>
                </div>
                <span class="to-request-status" :class="req.status.toLowerCase()">
                  {{ req.status }}
                </span>
              </div>
              <div class="to-request-details">
                <span class="to-detail-label">TYPE</span>
                <span class="to-detail-value">{{ req.type || 'Annual' }}</span>
                <span class="to-detail-label">DATES</span>
                <span class="to-detail-value">{{ req.date || '—' }}</span>
                <span class="to-detail-label">DAYS</span>
                <span class="to-detail-value">{{ req.days || '—' }}</span>
              </div>
              <div class="to-request-reason">"{{ req.reason }}"</div>
              <div class="to-request-actions" v-if="req.status === 'pending'">
                <button v-if="isHR" class="to-btn-approve" @click="handleApprove(req.timeoff_id)"><i class="bi bi-check-lg me-1"></i>Approve</button>
                <button v-if="isHR" class="to-btn-deny" @click="handleDeny(req.timeoff_id)"><i class="bi bi-x-lg me-1"></i>Deny</button>
                <button class="to-btn-cancel" @click="handleCancel(req.timeoff_id)"><i class="bi bi-trash me-1"></i>Cancel</button>
              </div>
              <div class="to-request-actions" v-else-if="isHR">
                <button class="to-btn-reverse" @click="handleReverse(req.timeoff_id)"><i class="bi bi-arrow-counterclockwise me-1"></i>Reverse</button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Pagination -->
        <div class="to-pagination" v-if="filteredRequests.length > itemsPerPage">
          <button class="btn btn-sm btn-outline-secondary" :disabled="currentPage === 1" @click="currentPage--">Prev</button>
          <span>Page {{ currentPage }} of {{ totalPages }}</span>
          <button class="btn btn-sm btn-outline-secondary" :disabled="currentPage === totalPages" @click="currentPage++">Next</button>
        </div>
      </div>
    </div>

    <!-- New Request Modal -->
    <div class="modal fade" id="toNewRequestModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header" style="background:#272757;color:white;">
            <h5 class="modal-title"><i class="bi bi-plus-circle me-2"></i>New Time Off Request</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="submitNewRequest">
              <div class="mb-3">
                <label class="form-label fw-semibold">Employee</label>
                <select class="form-select" v-model="newRequest.employeeId" required>
                  <option value="">Select employee...</option>
                  <option v-for="emp in employeeList" :key="emp.employeeId" :value="emp.employeeId">{{ emp.name }}</option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label fw-semibold">Leave Type</label>
                <select class="form-select" v-model="newRequest.type" required>
                  <option value="">Select type...</option>
                  <option v-for="type in leaveTypes" :key="type.value" :value="type.value">{{ type.label }}</option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label fw-semibold">Start Date</label>
                <input type="date" class="form-control" v-model="newRequest.startDate" required :min="todayStr" />
              </div>
              <div class="mb-3">
                <label class="form-label fw-semibold">End Date</label>
                <input type="date" class="form-control" v-model="newRequest.endDate" required :min="todayStr" />
              </div>
              <div class="mb-3">
                <label class="form-label fw-semibold">Reason / Notes</label>
                <textarea class="form-control" v-model="newRequest.reason" rows="3" placeholder="e.g., Family trip — Garden Route"></textarea>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" @click="submitNewRequest">Submit Request</button>
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

const employees = ref([]);
const requests = ref([]);
const loading = ref(false);
const currentFilter = ref('all');
const todayStr = new Date().toISOString().split('T')[0];
const today = new Date().toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

// Pagination state
const currentPage = ref(1);
const itemsPerPage = 8;

const newRequest = ref({
  employeeId: '',
  type: '',
  startDate: '',
  endDate: '',
  reason: '',
});

const leaveTypes = [
  { value: 'vacation', label: 'Vacation / Annual' },
  { value: 'sick_leave', label: 'Sick Leave' },
  { value: 'personal', label: 'Personal' },
  { value: 'unpaid_leave', label: 'Unpaid Leave' }
];

const filterTabs = [
  { key: 'all', label: 'All', icon: 'bi bi-list-ul', countClass: '' },
  { key: 'pending', label: 'Pending', icon: 'bi bi-clock', countClass: 'to-pending-count' },
  { key: 'approved', label: 'Approved', icon: 'bi bi-check-circle', countClass: 'to-approved-count' },
  { key: 'denied', label: 'Denied', icon: 'bi bi-x-circle', countClass: 'to-denied-count' },
];

const employeeList = computed(() => {
  return employees.value.map(emp => ({
    ...emp,
    employeeId: emp.emp_id,
    name: `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || 'Unknown',
  }));
});

// FIX 1: Filter requests by employee FIRST (so employees don't see HR's global counts)
const userSpecificRequests = computed(() => {
  let filtered = requests.value;
  
  if (!isHR.value) {
    const myEmail = state.user?.email;
    const myEmp = employees.value.find(e => e.email === myEmail);
    if (myEmp) {
      filtered = filtered.filter(r => r.emp_id === myEmp.emp_id);
    } else {
      filtered = []; // Hide everything if we can't find their employee record
    }
  }
  return filtered;
});

// FIX 2: Apply the Tab Status filter (All, Pending, Approved, Denied) on top of the user list
const filteredRequests = computed(() => {
  let filtered = userSpecificRequests.value;

  if (currentFilter.value !== 'all') {
    filtered = filtered.filter(r => r.status.toLowerCase() === currentFilter.value);
  }
  return filtered;
});

const totalPages = computed(() => Math.ceil(filteredRequests.value.length / itemsPerPage));

const paginatedRequests = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredRequests.value.slice(start, end);
});

// FIX 3: Base the tab counts on the userSpecificRequests, NOT the filteredRequests!
function getCount(status) {
  if (status === 'all') return userSpecificRequests.value.length;
  return userSpecificRequests.value.filter(r => r.status.toLowerCase() === status).length;
}

function getDepartmentColor(dept) {
  const colors = {
    Development: '#4CAF50', HR: '#2196F3', QA: '#FF9800', Sales: '#E74C5E',
    Marketing: '#9C27B0', Design: '#00BCD4', IT: '#607D8B', Finance: '#795548', Support: '#3F51B5'
  };
  return colors[dept] || '#8686AC';
}

function showToast(message, type) {
  if (window.showToast) window.showToast(message, type);
  else alert(message);
}

async function loadData() {
  loading.value = true;
  try {
    await api.put('/timeoff/cleanup');

    const empResponse = await api.get('/employees');
    const reqResponse = await api.get('/timeoff');

    if (empResponse.data.success) {
      employees.value = empResponse.data.data;
    }

    if (reqResponse.data.success) {
      const typeMap = { 
        vacation: 'Vacation', sick_leave: 'Sick Leave', personal: 'Personal', unpaid_leave: 'Unpaid Leave' 
      };

      requests.value = reqResponse.data.data.map(r => {
        const startDate = new Date(r.start_date).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short' });
        const endDate = new Date(r.end_date).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' });
        
        const diffTime = Math.abs(new Date(r.end_date) - new Date(r.start_date));
        const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        return {
          ...r,
          employeeName: `${r.first_name || ''} ${r.last_name || ''}`.trim() || 'Unknown',
          initials: (r.first_name?.[0] || '') + (r.last_name?.[0] || ''),
          color: getDepartmentColor(r.department),
          position: r.position || 'N/A',
          type: typeMap[r.timeoff_type] || r.timeoff_type,
          date: `${startDate} - ${endDate}`,
          days: days,
        };
      });
    }
  } catch (error) {
    console.error('Error loading data:', error);
    showToast('Failed to load data', 'danger');
  } finally {
    loading.value = false;
  }
}

function openNewRequest() {
  if (!isHR.value) {
    const user = state.user;
    const userEmp = employees.value.find(e => e.email === user?.username || e.email === user?.email);
    if (userEmp) {
      newRequest.value.employeeId = userEmp.emp_id;
    }
  }
}

async function submitNewRequest() {
  const { employeeId, type, startDate, endDate, reason } = newRequest.value;
  if (!employeeId || !type || !startDate || !endDate) {
    showToast('Please fill in all required fields', 'danger');
    return;
  }

  if (new Date(endDate) < new Date(startDate)) {
    showToast('End date must be after start date', 'danger');
    return;
  }

  try {
    const response = await api.post('/timeoff', {
      emp_id: employeeId, start_date: startDate, end_date: endDate, timeoff_type: type, reason: reason || 'No reason provided',
    });

    if (response.data.success) {
      showToast('Request submitted successfully', 'success');
      const modal = Modal.getInstance(document.getElementById('toNewRequestModal'));
      if (modal) modal.hide();
      newRequest.value = { employeeId: '', type: '', startDate: '', endDate: '', reason: '' };
      await loadData();
    }
  } catch (error) {
    console.error('Submit error:', error);
    showToast(error.response?.data?.error || 'Failed to submit request', 'danger');
  }
}

async function handleApprove(timeoffId) {
  try {
    await api.put(`/timeoff/${timeoffId}/approve`);
    showToast('Request approved', 'success');
    await loadData();
  } catch (error) {
    showToast('Failed to approve', 'danger');
  }
}

async function handleDeny(timeoffId) {
  try {
    await api.put(`/timeoff/${timeoffId}/deny`, { denial_reason: 'Denied by HR' });
    showToast('Request denied', 'danger');
    await loadData();
  } catch (error) {
    showToast('Failed to deny', 'danger');
  }
}

async function handleCancel(timeoffId) {
  if (confirm('Cancel this leave request? This will permanently delete it.')) {
    try {
      await api.put(`/timeoff/${timeoffId}/cancel`);
      showToast('Request cancelled', 'success');
      await loadData();
    } catch (error) {
      showToast('Failed to cancel', 'danger');
    }
  }
}

async function handleReverse(timeoffId) {
  try {
    await api.put(`/timeoff/${timeoffId}/reverse`);
    showToast('Request reversed to pending', 'success');
    await loadData();
  } catch (error) {
    showToast('Failed to reverse', 'danger');
  }
}

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.to-main-content { padding: 28px 36px 40px; }
.to-page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; flex-wrap: wrap; gap: 16px; }
.to-page-title { font-size: 24px; font-weight: 700; color: #272757; margin: 0; }
.to-page-subtitle { font-size: 14px; color: #5a5a7a; margin: 2px 0 0; }
.to-card { border: none; border-radius: 12px; background: white; box-shadow: 0 2px 8px rgba(39,39,87,0.08); }
.to-card .card-body { padding: 24px 28px; }
.to-card-title { font-size: 15px; font-weight: 600; color: #272757; margin: 0; }
.to-card-title i { color: #8686ac; margin-right: 8px; }
.to-header { padding-bottom: 12px; border-bottom: 2px solid #d8dce6; }
.to-filter-tabs { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 12px; }
.to-filter-tab { padding: 7px 18px; border: none; background: transparent; color: #5a5a7a; font-weight: 500; font-size: 13px; cursor: pointer; transition: 0.2s; border-radius: 6px; display: flex; align-items: center; gap: 6px; border: 1px solid transparent; }
.to-filter-tab:hover { color: #1a1a2e; background: rgba(39,39,87,0.04); }
.to-filter-tab.active { color: #272757; background: rgba(39,39,87,0.08); border-color: rgba(39,39,87,0.12); }
.to-tab-count { background: #f0f2f7; padding: 0 8px; border-radius: 100px; font-size: 11px; font-weight: 600; min-width: 18px; text-align: center; }
.to-tab-count.to-pending-count { background: #fff3e0; color: #bf360c; }
.to-tab-count.to-approved-count { background: #e8f5e9; color: #1b5e20; }
.to-tab-count.to-denied-count { background: #ffebee; color: #b71c1c; }
.to-filter-tab.active .to-tab-count { background: #272757; color: white; }

.to-request-card { background: white; border-left: 3px solid #8686ac; border: 1px solid #d8dce6; border-radius: 8px; padding: 16px 20px; margin-bottom: 12px; transition: 0.2s; }
.to-request-card:hover { box-shadow: 0 2px 8px rgba(39,39,87,0.08); }
.to-request-card.status-pending { border-left-color: #fb8c00; background: #fff8f0; }
.to-request-card.status-approved { border-left-color: #43a047; background: #f5fff5; }
.to-request-card.status-denied { border-left-color: #e53935; background: #fff5f5; }
.to-request-card .to-request-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
.to-request-employee { display: flex; align-items: center; gap: 10px; }
.to-request-avatar { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 13px; color: white; flex-shrink: 0; }
.to-request-name { font-weight: 600; font-size: 14px; color: #1a1a2e; }
.to-request-position { font-size: 12px; color: #5a5a7a; }

.to-request-status { padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 600; text-transform: capitalize; border: 1px solid transparent; }
.to-request-status.pending { background: #fff3e0; color: #bf360c; border-color: #ffb74d; }
.to-request-status.approved { background: #e8f5e9; color: #1b5e20; border-color: #66bb6a; }
.to-request-status.denied { background: #ffebee; color: #b71c1c; border-color: #e57373; }

.to-request-details { display: grid; grid-template-columns: auto 1fr; gap: 2px 14px; margin: 6px 0; }
.to-detail-label { font-size: 12px; color: #5a5a7a; font-weight: 500; }
.to-detail-value { font-size: 13px; color: #1a1a2e; font-weight: 500; }
.to-request-reason { background: white; padding: 8px 14px; border-radius: 4px; font-size: 13px; color: #1a1a2e; font-style: italic; margin: 4px 0 8px; border-left: 2px solid #8686ac; }
.to-request-actions { display: flex; gap: 8px; margin-top: 8px; padding-top: 8px; border-top: 1px solid #d8dce6; flex-wrap: wrap; }
.to-btn-approve { background: #1b5e20; color: white; border: none; padding: 5px 16px; border-radius: 4px; font-weight: 600; font-size: 12px; transition: 0.2s; cursor: pointer; }
.to-btn-approve:hover { background: #0d3b12; }
.to-btn-deny { background: #b71c1c; color: white; border: none; padding: 5px 16px; border-radius: 4px; font-weight: 600; font-size: 12px; transition: 0.2s; cursor: pointer; }
.to-btn-deny:hover { background: #7f1b1b; }
.to-btn-reverse { background: #5a5a7a; color: white; border: none; padding: 5px 16px; border-radius: 4px; font-weight: 600; font-size: 12px; transition: 0.2s; cursor: pointer; }
.to-btn-reverse:hover { background: #3a3a5a; }
.to-btn-cancel { background: #6b6b8a; color: white; border: none; padding: 5px 16px; border-radius: 4px; font-weight: 600; font-size: 12px; transition: 0.2s; cursor: pointer; }
.to-btn-cancel:hover { background: #4a4a6a; }
.to-empty-state { text-align: center; padding: 40px 16px; }
.to-empty-state i { font-size: 36px; color: #8686ac; margin-bottom: 12px; display: block; }
.to-empty-state p { color: #5a5a7a; font-weight: 500; margin: 0; }

.to-pagination { margin-top: 20px; display: flex; justify-content: center; align-items: center; gap: 15px; font-size: 14px; }
</style>