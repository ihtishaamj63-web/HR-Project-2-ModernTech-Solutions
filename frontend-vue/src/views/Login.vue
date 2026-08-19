<!-- src/views/Login.vue -->
<template>
  <div class="login-container d-flex align-items-center justify-content-center vh-100">
    <div class="card p-4 shadow" style="width: 420px;">
      <h2 class="text-center mb-4">ModernTech Login</h2>
      
      <form @submit.prevent="handleLogin">
        <div class="mb-3">
          <label class="form-label">Username</label>
          <input v-model="username" type="text" class="form-control" placeholder="Enter your username (e.g., hr@moderntech.com)" required />
        </div>
        <div class="mb-3">
          <label class="form-label">Password</label>
          <input v-model="password" type="password" class="form-control" placeholder="Enter your password" required />
        </div>
        
        <div v-if="error" class="alert alert-danger">{{ error }}</div>
        
        <button type="submit" class="btn btn-primary w-100">Login</button>
      </form>

      <!-- Demo Credentials Section -->
      <div class="mt-4 border-top pt-3">
        <h6 class="text-center text-muted mb-3">Demo Credentials (Click to autofill)</h6>
        <div class="d-flex gap-2">
          <button type="button" class="btn btn-outline-primary btn-sm w-50 text-start" @click="fillCredentials('hr@moderntech.com', 'password123')">
            <strong>HR Role</strong><br>
            <small>hr@moderntech.com</small>
          </button>
          <button type="button" class="btn btn-outline-secondary btn-sm w-50 text-start" @click="fillCredentials('sibongile.nkosi@moderntech.com', 'password123')">
            <strong>Employee Role</strong><br>
            <small>sibongile.nkosi@...</small>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../stores/auth';

const router = useRouter();
const { login } = useAuth();

const username = ref('');
const password = ref('');
const error = ref('');

// Helper function to autofill the form for demonstrations
function fillCredentials(user, pass) {
  username.value = user;
  password.value = pass;
  error.value = '';
}

const handleLogin = async () => {
  error.value = '';
  try {
    // Pass username, not email
    const result = await login(username.value, password.value);
    if (result.success) {
      router.push('/');
    } else {
      error.value = result.error || 'Login failed';
    }
  } catch (err) {
    error.value = 'Server error. Is the backend running?';
  }
};
</script>

<style scoped>
.login-container {
  background-color: #f0f2f7;
}
.btn-outline-primary small, .btn-outline-secondary small {
  opacity: 0.8;
}
</style>