<!-- src/components/Navbar.vue -->
<template>
  <nav class="navbar navbar-expand-lg navbar-dark" style="background-color: #272757;">
    <div class="container-fluid">
      <router-link class="navbar-brand fw-bold" to="/">ModernTech Solutions</router-link>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav mx-auto">
          <li class="nav-item"><router-link class="nav-link" to="/">Dashboard</router-link></li>
          <li class="nav-item"><router-link class="nav-link" to="/employees">Employees</router-link></li>
          <li class="nav-item"><router-link class="nav-link" to="/payroll">Payroll</router-link></li>
          <li class="nav-item"><router-link class="nav-link" to="/attendance">Attendance</router-link></li>
          <li class="nav-item"><router-link class="nav-link" to="/timeoff">Time Off</router-link></li>
          <li class="nav-item"><router-link class="nav-link" to="/reviews">Reviews</router-link></li>
        </ul>
        
        <div class="d-flex align-items-center text-white">
          <div class="me-3 text-end d-none d-md-block">
            <div class="fw-bold">{{ userName }}</div>
            <small>{{ formattedRole }} · ModernTech</small>
          </div>
          
          <!-- Change Password Button -->
          <button class="btn btn-sm btn-outline-light me-2" @click="openPasswordModal" title="Change Password">
            <i class="bi bi-key-fill"></i>
          </button>

          <button class="btn btn-sm btn-outline-light me-2" @click="$emit('toggle-dark-mode')" title="Toggle Dark Mode">
            <i class="bi" :class="isDarkMode ? 'bi-sun-fill' : 'bi-moon-stars-fill'"></i>
          </button>
          <button class="btn btn-sm btn-outline-light" @click="handleLogout">Logout</button>
        </div>
      </div>
    </div>
  </nav>

  <!-- Change Password Modal -->
  <div class="modal fade" id="changePasswordModal" tabindex="-1" ref="passwordModal">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header" style="background:#272757;color:white;">
          <h5 class="modal-title"><i class="bi bi-key me-2"></i>Change Password</h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitNewPassword">
            <div class="mb-3">
              <label class="form-label fw-semibold">Current Password</label>
              <input type="password" class="form-control" v-model="passwordForm.current" required />
            </div>
            <div class="mb-3">
              <label class="form-label fw-semibold">New Password</label>
              <input type="password" class="form-control" v-model="passwordForm.new" required minlength="6" />
              <small class="text-muted">Minimum 6 characters.</small>
            </div>
            <div class="mb-3">
              <label class="form-label fw-semibold">Confirm New Password</label>
              <input type="password" class="form-control" v-model="passwordForm.confirm" required />
            </div>
            <div v-if="passwordError" class="alert alert-danger py-2">{{ passwordError }}</div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
          <button type="button" class="btn btn-primary" @click="submitNewPassword" :disabled="changingPassword">
            <i class="bi bi-check-lg me-1"></i> {{ changingPassword ? 'Saving...' : 'Update Password' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAuth } from '../stores/auth';
import { useRouter } from 'vue-router';
import api from '../api/axios';
import { Modal } from 'bootstrap';

defineProps(['isDarkMode']);
const emit = defineEmits(['toggle-dark-mode']);

const { state, logout, userName } = useAuth();
const router = useRouter();

const passwordModal = ref(null);
const changingPassword = ref(false);
const passwordError = ref('');

const passwordForm = ref({
  current: '',
  new: '',
  confirm: ''
});

// FIX: Display the specific job position instead of the generic role
const formattedRole = computed(() => {
  if (state.user?.position) return state.user.position;
  
  // Fallback mapping just in case position is missing
  if (state.user?.role === 'hr_staff' || state.user?.role === 'admin') return 'Human Resources';
  return 'Team Member';
});

function handleLogout() {
  logout();
  router.push('/login');
}

function openPasswordModal() {
  passwordForm.value = { current: '', new: '', confirm: '' };
  passwordError.value = '';
  const modal = new Modal(document.getElementById('changePasswordModal'));
  modal.show();
}

async function submitNewPassword() {
  passwordError.value = '';
  
  if (passwordForm.value.new !== passwordForm.value.confirm) {
    passwordError.value = 'New passwords do not match.';
    return;
  }

  changingPassword.value = true;
  try {
    const response = await api.put('/auth/change-password', {
      currentPassword: passwordForm.value.current,
      newPassword: passwordForm.value.new
    });

    if (response.data.success) {
      const modal = Modal.getInstance(document.getElementById('changePasswordModal'));
      if (modal) modal.hide();
      
      // Dispatch a global event to trigger the toast notification
      const event = new CustomEvent('show-toast', { detail: { message: 'Password updated successfully!', type: 'success' } });
      window.dispatchEvent(event);
    }
  } catch (error) {
    console.error('Password change error:', error);
    passwordError.value = error.response?.data?.error || 'Failed to update password.';
  } finally {
    changingPassword.value = false;
  }
}
</script>

<style scoped>
.navbar-nav .router-link-exact-active {
  color: #fff;
  font-weight: 700;
  border-bottom: 2px solid #fff;
}
.navbar-nav .nav-link {
  color: rgba(255, 255, 255, 0.8);
  margin: 0 5px;
  transition: color 0.2s;
}
.navbar-nav .nav-link:hover {
  color: #fff;
}
</style>