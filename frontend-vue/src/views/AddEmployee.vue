<!-- src/views/AddEmployee.vue -->
<template>
  <div class="emp-page">
    <div class="container">
      <div class="emp-page__header">
        <p class="emp-page__date">{{ today }}</p>
        <h1 class="emp-page__title">{{ isEdit ? 'Edit Employee' : 'Add New Employee' }}</h1>
        <p class="text-muted" v-if="!isEdit">New employees are automatically set to <strong>Active</strong> status.</p>
      </div>

      <div class="emp-card-wrap">
        <!-- Step-by-step workflow guide -->
        <div class="emp-workflow-guide">
          <h6><i class="bi bi-info-circle"></i> Follow these steps to add an employee:</h6>
          <ol>
            <li><strong>Step 1:</strong> Select a Department</li>
            <li><strong>Step 2:</strong> Choose a Position (based on selected department)</li>
            <li><strong>Step 3:</strong> Select a Salary Range (based on position)</li>
            <li><strong>Step 4:</strong> Complete remaining employee details</li>
          </ol>
        </div>

        <form class="emp-form-grid" @submit.prevent="saveEmployee">
          <!-- STEP 1: DEPARTMENT -->
          <div class="emp-form-group emp-workflow-step">
            <div class="step-label-container">
              <span class="step-badge" :class="{ 'active': form.department }">1</span>
              <label>Department <span class="required">*</span></label>
            </div>
            <select v-model="form.department" required @change="updatePositions" class="form-control">
              <option value="">Select Department</option>
              <option>Development</option>
              <option>HR</option>
              <option>QA</option>
              <option>Sales</option>
              <option>Marketing</option>
              <option>Design</option>
              <option>IT</option>
              <option>Finance</option>
              <option>Support</option>
            </select>
            <small class="help-text"><i class="bi bi-arrow-right-short"></i> Start here – selecting a department will populate available positions</small>
          </div>

          <!-- STEP 2: POSITION -->
          <div class="emp-form-group emp-workflow-step">
            <div class="step-label-container">
              <span class="step-badge" :class="{ 'active': form.position }">2</span>
              <label>Position <span class="required">*</span></label>
            </div>
            <select v-model="form.position" required :disabled="!form.department" class="form-control" :class="{ 'disabled-select': !form.department }">
              <option value="">Select Position</option>
              <option v-for="pos in availablePositions" :key="pos" :value="pos">{{ pos }}</option>
            </select>
            <small class="help-text" v-if="!form.department"><i class="bi bi-lock-fill"></i> Select a department first</small>
            <small class="help-text" v-else><i class="bi bi-check-circle-fill text-success"></i> Choose a position for {{ form.department }}</small>
          </div>

          <!-- STEP 3: SALARY -->
          <div class="emp-form-group emp-workflow-step">
            <div class="step-label-container">
              <span class="step-badge" :class="{ 'active': form.salary }">3</span>
              <label>Monthly Salary (R) <span class="required">*</span></label>
            </div>
            <input type="number" v-model="form.salary" required min="5000" step="1" placeholder="e.g. 45000" :disabled="!form.position" class="form-control" :class="{ 'disabled-select': !form.position }" />
            <select v-model="selectedSalaryTier" class="form-control salary-range mt-2" @change="applySalaryTier" :disabled="!form.position" :class="{ 'disabled-select': !form.position }">
              <option value="">Select salary range...</option>
              <option v-for="tier in salaryTiers" :key="tier.id" :value="tier.id">
                {{ tier.label }}
              </option>
            </select>
            <small class="help-text" v-if="!form.position"><i class="bi bi-lock-fill"></i> Select a position first</small>
            <small class="help-text" v-else><i class="bi bi-check-circle-fill text-success"></i> Autofills a clean midpoint (multiple of 5k). You can type any amount (min R5,000).</small>
          </div>

          <!-- STEP 4: BASIC INFO -->
          <div class="emp-form-group emp-workflow-step">
            <div class="step-label-container">
              <span class="step-badge" :class="{ 'active': form.name }">4</span>
              <label>Full Name & Surname <span class="required">*</span></label>
            </div>
            <input type="text" v-model="form.name" required placeholder="e.g. Bongiwe Dube" class="form-control" />
            <small class="help-text">Letters only. Must include first and last name.</small>
          </div>

          <div class="emp-form-group emp-workflow-step">
            <div class="step-label-container">
              <span class="step-badge" :class="{ 'active': form.email }">4</span>
              <label>Email <span class="required">*</span></label>
            </div>
            <input type="email" v-model="form.email" required placeholder="name@moderntech.com" class="form-control" />
            <small class="help-text">Must be a valid email format.</small>
          </div>

          <!-- Temporary Password Field -->
          <div class="emp-form-group emp-workflow-step">
            <div class="step-label-container">
              <span class="step-badge" :class="{ 'active': form.password }">4</span>
              <label>Temporary Password <span class="required">*</span></label>
            </div>
            <input type="text" v-model="form.password" :required="!isEdit" minlength="6" placeholder="Min 6 characters" class="form-control" />
            <small class="help-text" v-if="isEdit">Leave blank to keep current password.</small>
            <small class="help-text" v-else>Employee will use this to log in initially.</small>
          </div>

          <!-- Phone Field -->
          <div class="emp-form-group emp-workflow-step">
            <div class="step-label-container">
              <span class="step-badge" :class="{ 'active': form.phone }">4</span>
              <label>Phone Number</label>
            </div>
            <input type="tel" v-model="form.phone" placeholder="e.g. 0821234567" class="form-control" />
            <small class="help-text">10-15 digits. Spaces and + allowed.</small>
          </div>

          <div class="emp-form-group emp-workflow-step">
            <div class="step-label-container">
              <span class="step-badge" :class="{ 'active': form.startDate }">4</span>
              <label>Start Date <span class="required">*</span></label>
            </div>
            <input type="date" v-model="form.startDate" required :min="todayStr" class="form-control" />
            <small class="help-text">Must be today or a future date.</small>
          </div>

          <div class="emp-form-group emp-form-group--full">
            <label>Employment History</label>
            <textarea v-model="form.history" rows="3" placeholder="e.g. Joined in 2026, bringing 5 years of industry experience..." class="form-control"></textarea>
          </div>

          <div class="emp-form-actions emp-form-group--full">
            <router-link to="/employees" class="emp-btn emp-btn--ghost">
              <i class="bi bi-x-lg"></i> Cancel
            </router-link>
            <button type="submit" class="emp-btn emp-btn--primary" :disabled="saving">
              <i class="bi bi-check-lg"></i> {{ saving ? 'Saving...' : 'Save Employee' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuth } from '../stores/auth';
import api from '../api/axios';

const router = useRouter();
const route = useRoute();
const { isHR } = useAuth();

const form = ref({
  name: '',
  position: '',
  department: '',
  salary: '',
  email: '',
  password: '',
  phone: '',
  startDate: '',
  history: '',
});

const isEdit = ref(false);
const employeeId = ref(null);
const saving = ref(false);
const selectedSalaryTier = ref('');

const today = new Date().toLocaleDateString('en-ZA', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

// FIX: Calculate today's date in YYYY-MM-DD to restrict the date picker
const todayStr = new Date().toISOString().split('T')[0];

const positionMap = {
  Development: ['Frontend Developer', 'Backend Developer', 'Fullstack Developer', 'Mobile Developer', 'DevOps Engineer', 'Software Architect', 'Software Engineer', 'Junior Developer', 'Senior Developer'],
  HR: ['HR Manager', 'HR Coordinator', 'Recruiter', 'Talent Acquisition Specialist', 'HR Administrator'],
  QA: ['QA Engineer', 'Test Analyst', 'Automation Engineer', 'QA Lead', 'Quality Analyst'],
  Sales: ['Sales Representative', 'Account Manager', 'Sales Engineer', 'Enterprise Sales', 'Sales Lead'],
  Marketing: ['Marketing Specialist', 'Content Strategist', 'SEO Specialist', 'Growth Marketer', 'Marketing Manager'],
  Design: ['UI/UX Designer', 'Product Designer', 'Visual Designer', 'UX Researcher', 'Graphic Designer'],
  IT: ['IT Support', 'System Administrator', 'Network Engineer', 'IT Manager'],
  Finance: ['Accountant', 'Financial Analyst', 'Payroll Specialist', 'Finance Manager'],
  Support: ['Customer Support Representative', 'Technical Support Engineer', 'Customer Success Manager', 'Support Lead'],
};

// FIX: Adjusted ranges to 20k increments for clean midpoints
const salaryTiers = computed(() => {
  const deptTiers = {
    Development: [
      { id: 'junior', label: 'Junior Developer (R40,000 - R60,000)', min: 40000, max: 60000 },
      { id: 'mid', label: 'Mid Developer (R60,000 - R80,000)', min: 60000, max: 80000 },
      { id: 'senior', label: 'Senior Developer (R80,000 - R100,000)', min: 80000, max: 100000 },
      { id: 'lead', label: 'Lead/Architect (R100,000 - R120,000)', min: 100000, max: 120000 },
    ],
    HR: [
      { id: 'entry', label: 'Entry Level (R30,000 - R50,000)', min: 30000, max: 50000 },
      { id: 'mid', label: 'Mid Level (R50,000 - R70,000)', min: 50000, max: 70000 },
      { id: 'senior', label: 'Manager (R70,000 - R90,000)', min: 70000, max: 90000 },
    ],
  };
  
  return deptTiers[form.value.department] || [
    { id: 'entry', label: 'Entry Level (R30,000 - R50,000)', min: 30000, max: 50000 },
    { id: 'mid', label: 'Mid Level (R50,000 - R70,000)', min: 50000, max: 70000 },
    { id: 'senior', label: 'Senior Level (R70,000 - R90,000)', min: 70000, max: 90000 },
    { id: 'lead', label: 'Lead/Manager (R90,000 - R110,000)', min: 90000, max: 110000 },
  ];
});

const availablePositions = ref([]);

function updatePositions() {
  const dept = form.value.department;
  availablePositions.value = positionMap[dept] || [];
  form.value.position = '';
  form.value.salary = '';
  selectedSalaryTier.value = '';
}

function applySalaryTier() {
  if (selectedSalaryTier.value) {
    const tier = salaryTiers.value.find(t => t.id === selectedSalaryTier.value);
    if (tier) {
      const min = Number(tier.min);
      const max = Number(tier.max);
      // FIX: Calculate exact midpoint, then round to the nearest 5000 for a standard looking salary
      const midpoint = (min + max) / 2;
      form.value.salary = Math.round(midpoint / 5000) * 5000;
    }
  }
}

async function loadEmployee(id) {
  try {
    const response = await api.get(`/employees/${id}`);
    const emp = response.data.data;
    
    let salary = '';
    try {
      const payRes = await api.get('/payroll');
      const payRecord = payRes.data.data.find(p => p.emp_id === emp.emp_id);
      if (payRecord) salary = payRecord.base_salary;
    } catch (e) {
      console.error('Could not load payroll for employee');
    }

    form.value = {
      name: `${emp.first_name} ${emp.last_name}`,
      position: emp.position,
      department: emp.department,
      salary: salary,
      email: emp.email,
      password: '', 
      phone: emp.phone || '',
      startDate: emp.hire_date ? emp.hire_date.split('T')[0] : '',
      history: emp.employment_history || '',
    };
    
    availablePositions.value = positionMap[form.value.department] || [];
    
    employeeId.value = id;
    isEdit.value = true;
  } catch (error) {
    console.error('Error loading employee:', error);
    showToast('Failed to load employee data', 'danger');
    router.push('/employees');
  }
}

async function saveEmployee() {
  if (!isHR.value) {
    return showToast('Access denied. Only HR staff can perform this action.', 'danger');
  }

  // FIX: Heavy Validation Checks
  if (!form.value.department) return showToast('Step 1: Please select a department.', 'danger');
  if (!form.value.position) return showToast('Step 2: Please choose a position.', 'danger');
  
  // FIX: Validate salary. It just needs to be a number >= 5000. It does NOT have to match the tier.
  if (!form.value.salary || Number(form.value.salary) < 5000) {
    return showToast('Step 3: Please enter a valid salary (minimum R5,000).', 'danger');
  }
  
  // Name Validation (Letters only, at least two words)
  const nameRegex = /^[a-zA-Z]+ [a-zA-Z]+$/;
  if (!form.value.name || !nameRegex.test(form.value.name.trim())) {
    return showToast('Step 4: Please enter a valid full name and surname (letters only).', 'danger');
  }

  // Email Validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!form.value.email || !emailRegex.test(form.value.email)) {
    return showToast('Step 4: Please enter a valid email address.', 'danger');
  }

  // Password Validation
  if (!isEdit.value && (!form.value.password || form.value.password.length < 6)) {
    return showToast('Step 4: Please provide a temporary password (min 6 characters).', 'danger');
  }
  if (isEdit.value && form.value.password && form.value.password.length < 6) {
    return showToast('Step 4: If updating password, it must be at least 6 characters.', 'danger');
  }

  // Start Date Validation (Today or Future)
  if (!form.value.startDate) return showToast('Step 4: Please select a start date.', 'danger');
  const selectedDate = new Date(form.value.startDate);
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0); // Normalize today's date to midnight
  if (selectedDate < todayDate) {
    return showToast('Step 4: Start date must be today or in the future.', 'danger');
  }

  // Phone Validation (10-15 digits, allows spaces/+/-)
  const phoneRegex = /^[0-9+\-\s()]{10,15}$/;
  if (form.value.phone && !phoneRegex.test(form.value.phone)) {
    return showToast('Step 4: Please enter a valid phone number (10-15 digits).', 'danger');
  }

  saving.value = true;
  try {
    const data = {
      first_name: form.value.name.split(' ')[0],
      last_name: form.value.name.split(' ').slice(1).join(' '),
      position: form.value.position,
      department: form.value.department,
      salary: Number(form.value.salary),
      email: form.value.email,
      hire_date: form.value.startDate,
      employment_status: 'active', // FIX: Explicitly send status
      employment_history: form.value.history || null, // FIX: Explicit null
      phone: form.value.phone || null, // FIX: Explicit null
    };

    if (form.value.password && form.value.password.length >= 6) {
      data.password = form.value.password;
    }

    if (isEdit.value) {
      await api.put(`/employees/${employeeId.value}`, data);
      showToast(`${form.value.name} updated successfully`, 'success');
    } else {
      await api.post('/employees', data);
      showToast(`${form.value.name} added successfully!`, 'success');
    }
    router.push('/employees');
  } catch (error) {
    console.error('Save error:', error);
    const errMsg = error.response?.data?.error || 'Failed to save employee. Check console for details.';
    showToast(errMsg, 'danger');
  } finally {
    saving.value = false;
  }
}

function showToast(message, type) {
  if (window.showToast) {
    window.showToast(message, type);
    return;
  }
  alert(message);
}

onMounted(() => {
  const id = route.params.id;
  if (id) {
    loadEmployee(id);
  }
});
</script>

<style scoped>
.emp-page { padding: 32px 0 64px; }
.emp-page__header { margin-bottom: 24px; }
.emp-page__date { font-size: 0.75rem; letter-spacing: 0.8px; color: #5a5a7a; margin-bottom: 10px; text-transform: uppercase; font-weight: 600; }
.emp-page__title { font-size: 2.1rem; font-weight: 800; color: #272757; }
.text-muted { color: #5a5a7a; font-size: 14px; margin-top: 4px; }

.emp-card-wrap { background: white; border: 1px solid #d8dce6; border-radius: 8px; padding: 24px; box-shadow: 0 4px 16px rgba(15,14,71,0.06); overflow: hidden; max-width: 800px; margin: 0 auto; }

.emp-workflow-guide { margin-bottom: 24px; padding: 16px; background: #eef0f6; border-radius: 8px; border-left: 4px solid #272757; }
.emp-workflow-guide h6 { margin: 0 0 8px 0; color: #272757; font-weight: 600; display: flex; align-items: center; gap: 8px; }
.emp-workflow-guide ol { margin: 0; padding-left: 20px; font-size: 13px; color: #4a4a6a; }
.emp-workflow-guide li { margin-bottom: 4px; }

.emp-form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
.emp-form-group { display: flex; flex-direction: column; gap: 8px; }
.emp-form-group--full { grid-column: 1 / -1; }
.emp-form-group label { font-size: 0.9rem; font-weight: 600; color: #505081; margin: 0; }

.step-label-container { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.step-badge { display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; background: #b0b0c0; color: #ffffff; border-radius: 50%; font-size: 12px; font-weight: bold; transition: 0.2s; border: 1px solid rgba(0,0,0,0.1); }
.step-badge.active { background: #272757; color: #ffffff; box-shadow: 0 2px 4px rgba(0,0,0,0.2); }

.emp-form-group .form-control { padding: 12px 14px; border: 1.5px solid #d8dce6; border-radius: 10px; font-size: 0.95rem; font-family: inherit; background: white; transition: 0.2s; width: 100%; }
.emp-form-group .form-control:focus { outline: none; border-color: #272757; box-shadow: 0 0 0 3px rgba(39,39,87,0.1); }

.disabled-select { background-color: #f0f2f7 !important; cursor: not-allowed !important; opacity: 0.7; }

.required { color: #e53935; }
.help-text { color: #5a5a7a; font-size: 11px; margin-top: 2px; display: block; }
.text-success { color: #43a047 !important; margin-right: 4px; }
.salary-range { margin-top: 6px; }

.emp-form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 8px; }
.emp-btn { display: inline-flex; align-items: center; gap: 8px; padding: 11px 18px; border-radius: 999px; font-weight: 600; cursor: pointer; border: 1px solid transparent; font-size: 0.93rem; height: 46px; text-decoration: none; transition: 0.2s; }
.emp-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(15,14,71,0.15); }
.emp-btn--primary { background: #272757; color: #fff; }
.emp-btn--primary:hover { background: #505081; }
.emp-btn--ghost { background: white; border-color: #d8dce6; color: #1a1a2e; }
.emp-btn--ghost:hover { border-color: #505081; background: #f8f7ff; }

@media (max-width: 768px) { 
  .emp-form-grid { grid-template-columns: 1fr; } 
  .emp-form-actions { flex-direction: column; } 
  .emp-form-actions .emp-btn { width: 100%; justify-content: center; } 
}
</style>