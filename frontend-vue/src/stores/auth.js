// frontend-vue/src/stores/auth.js
import { reactive, computed } from 'vue';
import api from '../api/axios';

const state = reactive({
  user: JSON.parse(localStorage.getItem('authUser') || 'null'),
  token: localStorage.getItem('token'),
});

export function useAuth() {
  function login(username, password) {
    return api.post('/auth/login', { username, password })
      .then(response => {
        if (response.data.success) {
          state.token = response.data.data.token;
          state.user = response.data.data.user;
          localStorage.setItem('token', state.token);
          localStorage.setItem('authUser', JSON.stringify(state.user));
          return { success: true };
        }
      })
      .catch(error => {
        return { success: false, error: error.response?.data?.error || 'Server error' };
      });
  }

  function logout() {
    state.token = null;
    state.user = null;
    localStorage.removeItem('token');
    localStorage.removeItem('authUser');
  }

  // Use computed properties so Vue updates the UI automatically
  const isHR = computed(() => {
    const role = state.user?.role;
    return role === 'hr_staff' || role === 'HR Manager' || role === 'HR Admin';
  });

  const userName = computed(() => {
    return state.user?.first_name || 'User';
  });

  return { state, login, logout, isHR, userName };
}