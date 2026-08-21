<!-- frontend-vue/src/views/Employees.vue -->
<template>
  <div class="emp-page">
    <div class="container">
      <div class="emp-page__header">
        <p class="emp-page__date">{{ today }}</p>
        <h1 class="emp-page__title">Employees</h1>
        <p class="text-muted">Manage employee records, filter staff by department, and add new employees.</p>
      </div>

      <div class="emp-toolbar">
        <div class="emp-search-bar">
          <i class="bi bi-search"></i>
          <input type="search" v-model="search" placeholder="Search name, position, or ID..." />
        </div>
        <div class="emp-toolbar__actions">
          <router-link to="/add-employee" class="emp-btn emp-btn--primary" v-if="isHR">
            <i class="bi bi-plus-lg"></i> Add Employee
          </router-link>
        </div>
      </div>

      <div class="emp-filters">
        <button
          v-for="dept in departments"
          :key="dept"
          class="emp-filter"
          :class="{ active: currentFilter === dept }"
          @click="currentFilter = dept"
        >
          {{ dept }}
        </button>
      </div>

      <div class="emp-card-wrap">
        <div class="emp-card__head">
          <h2>Employee Directory</h2>
          <span class="emp-card__count">{{ filteredEmployees.length }} employees</span>
        </div>

        <div v-if="loading" class="text-center py-4">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>

        <div v-else-if="filteredEmployees.length === 0" class="text-center text-muted py-4">
          No employees found.
        </div>

        <div v-else class="emp-list">
          <!-- Dynamic Header based on Role -->
          <div class="emp-row emp-row__head" :class="{ 'is-hr': isHR }">
            <div>Name</div>
            <div>Dept</div>
            <div>Position</div>
            <div v-if="isHR">Contact</div>
            <div v-if="isHR">Salary</div>
            <div>Status</div>
            <div v-if="isHR">Action</div>
          </div>

          <!-- Dynamic Row based on Role -->
          <div v-for="emp in filteredEmployees" :key="emp.employeeId" class="emp-row" :class="{ 'is-hr': isHR }">
            <div class="emp-row__name">
              <div class="emp-row__avatar" :style="{ background: getDepartmentColor(emp.department) }">
                {{ getInitials(emp.name) }}
              </div>
              <span>{{ emp.name }}</span>
            </div>
            <div class="emp-row__muted">{{ emp.department }}</div>
            <div class="emp-row__muted">{{ emp.position }}</div>
            
            <div v-if="isHR" class="emp-row__muted"><a class="emp-row__link" :href="'mailto:' + emp.email">{{ emp.email }}</a></div>
            <div v-if="isHR" class="emp-row__muted" style="font-weight:600;">R {{ (emp.salary || 0).toLocaleString('en-ZA') }}</div>
            
            <div><span class="emp-badge" :class="statusBadgeClass(emp.employment_status)">{{ formatStatus(emp.employment_status) }}</span></div>
            
            <div v-if="isHR" class="emp-row__actions">
              <button class="emp-btn emp-btn--ghost" @click="editEmployee(emp.employeeId)">Edit</button>
              <button class="emp-btn emp-btn--danger" @click="confirmDelete(emp.employeeId)">Delete</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Delete Modal -->
      <div v-if="showDeleteModal" class="emp-modal" @click.self="closeDeleteModal">
        <div class="emp-modal__backdrop" @click="closeDeleteModal"></div>
        <div class="emp-modal__content">
          <h3>Delete Employee</h3>
          <p>Are you sure you want to remove this employee? This action cannot be undone.</p>
          <div class="emp-modal__actions">
            <button class="emp-btn emp-btn--ghost" @click="closeDeleteModal">Cancel</button>
            <button class="emp-btn emp-btn--danger" @click="deleteEmployee">Delete</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../stores/auth';
import api from '../api/axios';

const router = useRouter();
const { isHR } = useAuth();

const employees = ref([]);
const loading = ref(false);
const search = ref('');
const currentFilter = ref('All');
const showDeleteModal = ref(false);
const deleteId = ref(null);

const today = new Date().toLocaleDateString('en-ZA', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
});

const departments = computed(() => {
  const depts = ['All', ...new Set(employees.value.map(e => e.department))];
  return depts;
});

const filteredEmployees = computed(() => {
  let filtered = employees.value;
  if (currentFilter.value !== 'All') {
    filtered = filtered.filter(e => e.department === currentFilter.value);
  }
  if (search.value) {
    const term = search.value.toLowerCase();
    filtered = filtered.filter(e =>
      e.name.toLowerCase().includes(term) ||
      e.position.toLowerCase().includes(term) ||
      e.department.toLowerCase().includes(term) ||
      String(e.employeeId).includes(term)
    );
  }
  return filtered;
});

function getInitials(name) {
  if (!name) return '??';
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

function getDepartmentColor(dept) {
  const colors = {
    Development: '#4CAF50', HR: '#2196F3', QA: '#FF9800', Sales: '#E74C5E',
    Marketing: '#9C27B0', Design: '#00BCD4', IT: '#607D8B', Finance: '#795548', Support: '#3F51B5'
  };
  return colors[dept] || '#8686AC';
}

function statusBadgeClass(status) {
  const map = { active: 'emp-badge--active', on_leave: 'emp-badge--leave', terminated: 'emp-badge--term' };
  return map[status] || 'emp-badge--active';
}

function formatStatus(status) {
  if (!status) return 'Active';
  return status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function editEmployee(id) {
  router.push(`/add-employee/${id}`);
}

function confirmDelete(id) {
  deleteId.value = id;
  showDeleteModal.value = true;
}

function closeDeleteModal() {
  showDeleteModal.value = false;
  deleteId.value = null;
}

async function deleteEmployee() {
  if (!deleteId.value) return;
  try {
    await api.delete(`/employees/${deleteId.value}`);
    employees.value = employees.value.filter(e => e.employeeId !== deleteId.value);
    showDeleteModal.value = false;
    deleteId.value = null;
    showToast('Employee removed successfully', 'success');
  } catch (error) {
    console.error('Delete error:', error);
    showToast('Error deleting employee', 'danger');
  }
}

function showToast(message, type) {
  if (window.showToast) {
    window.showToast(message, type);
    return;
  }
  alert(message);
}

async function loadEmployees() {
  loading.value = true;
  try {
    const empResponse = await api.get('/employees');
    const payResponse = await api.get('/payroll');

    // FIX: Enforce Number() casting to ensure IDs match perfectly
    const salaryMap = {};
    if (payResponse.data.success && payResponse.data.data) {
      payResponse.data.data.forEach(p => {
        salaryMap[Number(p.emp_id)] = p.base_salary || 0;
      });
    }

    if (empResponse.data.success) {
      employees.value = empResponse.data.data.map(emp => ({
        ...emp,
        employeeId: emp.emp_id,
        name: `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || 'Unknown',
        // FIX: Use Number() for the lookup key
        salary: salaryMap[Number(emp.emp_id)] || 0,
      }));
    }
  } catch (error) {
    console.error('Error loading employees:', error);
    showToast('Failed to load employees', 'danger');
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadEmployees();
});
</script>

<style scoped>
.emp-page { padding: 32px 0 64px; }
.emp-page__header { margin-bottom: 24px; }
.emp-page__date { font-size: 0.75rem; letter-spacing: 0.8px; color: #5a5a7a; margin-bottom: 10px; text-transform: uppercase; font-weight: 600; }
.emp-page__title { font-size: 2.1rem; font-weight: 800; }
.text-muted { color: #5a5a7a; font-size: 14px; margin-top: 4px; }

.emp-toolbar { display: flex; justify-content: space-between; align-items: center; gap: 16px; margin-bottom: 20px; flex-wrap: wrap; }
.emp-search-bar { 
  display: flex; align-items: center; gap: 10px; background: white; border: 1px solid #d8dce6; 
  border-radius: 999px; padding: 0 18px; height: 46px; transition: 0.2s; flex: 1; min-width: 200px; max-width: 450px; 
}
.emp-search-bar:focus-within { border-color: #272757; box-shadow: 0 0 0 3px rgba(39,39,87,0.1); }
.emp-search-bar i { color: #5a5a7a; flex-shrink: 0; }
.emp-search-bar input { border: none; outline: none; background: transparent; width: 100%; min-width: 0; font-size: 0.95rem; color: #1a1a2e; padding: 10px 0; }
.emp-toolbar__actions { display: flex; gap: 12px; flex-shrink: 0; }
.emp-btn { display: inline-flex; align-items: center; gap: 8px; padding: 11px 18px; border-radius: 999px; font-weight: 600; cursor: pointer; border: 1px solid transparent; font-size: 0.93rem; height: 46px; text-decoration: none; transition: 0.2s; }
.emp-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(15,14,71,0.15); }
.emp-btn--primary { background: #272757; color: #fff; }
.emp-btn--primary:hover { background: #505081; }
.emp-btn--ghost { background: white; border-color: #d8dce6; color: #1a1a2e; }
.emp-btn--ghost:hover { border-color: #505081; background: #f8f7ff; }
.emp-btn--danger { background: #e53935; color: #fff; padding: 8px 12px; height: auto; font-size: 0.85rem; }
.emp-btn--danger:hover { background: #b91c1c; }

.emp-filters { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 28px; }
.emp-filter { padding: 9px 18px; border-radius: 999px; border: 1.5px solid #d8dce6; background: white; color: #5a5a7a; font-weight: 600; cursor: pointer; transition: 0.2s; }
.emp-filter:hover { border-color: #505081; color: #1a1a2e; background: #f8f7ff; transform: translateY(-2px); }
.emp-filter.active { background: #272757; color: #fff; border-color: #272757; box-shadow: 0 4px 12px rgba(39,39,87,0.25); }

.emp-card-wrap { background: white; border: 1px solid #d8dce6; border-radius: 8px; padding: 24px; box-shadow: 0 4px 16px rgba(15,14,71,0.06); overflow: hidden; }
.emp-card__head { display: flex; align-items: center; justify-content: space-between; padding-bottom: 16px; margin-bottom: 12px; border-bottom: 1px solid #d8dce6; }
.emp-card__head h2 { font-size: 1.1rem; font-weight: 700; color: #0f0e47; }
.emp-card__count { font-size: 0.9rem; color: #5a5a7a; font-weight: 600; }

/* Dynamic Grid Layouts for HR vs Employee */
.emp-row { 
  display: grid; 
  gap: 14px; 
  padding: 18px 12px; 
  border-bottom: 1px solid rgba(39,39,71,0.08); 
  align-items: center; 
}

/* HR View: 7 columns */
.emp-row.is-hr {
  grid-template-columns: 2fr 1fr 1.5fr 2fr 1fr 1fr 1.2fr;
}

/* Employee View: 4 columns (No blank spaces!) */
.emp-row:not(.is-hr) {
  grid-template-columns: 2fr 1fr 1.5fr 1fr;
}

.emp-row__head { font-size: 0.75rem; font-weight: 700; letter-spacing: 0.5px; color: #5a5a7a; text-transform: uppercase; padding: 0 8px 10px 8px; border-bottom: 1px solid #d8dce6; }
.emp-row__name { display: flex; align-items: center; gap: 12px; font-weight: 600; }
.emp-row__avatar { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 0.8rem; font-weight: 700; flex-shrink: 0; }
.emp-row__muted { color: #5a5a7a; font-size: 0.92rem; }
.emp-row__link { color: #272757; text-decoration: none; font-size: 0.92rem; transition: color 0.2s; }
.emp-row__link:hover { color: #0f0e47; text-decoration: underline; }
.emp-row__actions { display: flex; gap: 6px; }

.emp-badge { display: inline-block; padding: 4px 10px; border-radius: 999px; font-size: 0.78rem; font-weight: 700; text-align: center; }
.emp-badge--active { background: #d1fae5; color: #1b5e20; }
.emp-badge--leave { background: #fef3c7; color: #bf360c; }
.emp-badge--term { background: #fee2e2; color: #b71c1c; }

.emp-modal { position: fixed; inset: 0; z-index: 9998; display: flex; align-items: center; justify-content: center; }
.emp-modal__backdrop { position: absolute; inset: 0; background: rgba(15,14,71,0.6); backdrop-filter: blur(2px); }
.emp-modal__content { position: relative; background: white; border-radius: 8px; padding: 24px; max-width: 420px; width: 90%; box-shadow: 0 20px 40px rgba(15,14,71,0.2); }
.emp-modal__content h3 { font-size: 1.25rem; font-weight: 700; margin-bottom: 8px; color: #0f0e47; }
.emp-modal__content p { font-size: 0.95rem; color: #5a5a7a; margin-bottom: 20px; line-height: 1.5; }
.emp-modal__actions { display: flex; justify-content: flex-end; gap: 12px; }

/* Responsive Design */
@media (max-width: 992px) {
  .emp-row.is-hr {
    grid-template-columns: 2fr 1fr 1.5fr 1fr 1.2fr; /* Hide Contact & Status on medium HR view */
  }
  .emp-row.is-hr > div:nth-child(4), .emp-row.is-hr > div:nth-child(7) {
    display: none;
  }
}

@media (max-width: 768px) {
  .emp-row.is-hr, .emp-row:not(.is-hr) {
    grid-template-columns: 1fr; /* Stack everything on mobile */
    gap: 8px;
    padding: 14px 16px;
    border-radius: 12px;
    border: 1px solid rgba(39,39,71,0.1);
    background: white;
    margin-bottom: 10px;
  }
  .emp-row__head { display: none; }
  .emp-search-bar { min-width: auto; width: 100%; max-width: none; }
  .emp-toolbar { flex-direction: column; align-items: stretch; }
  .emp-toolbar__actions { flex-direction: column; width: 100%; }
  .emp-toolbar__actions .emp-btn { width: 100%; justify-content: center; }
}
</style>