// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import { useAuth } from '../stores/auth';

const routes = [
  { path: '/login', name: 'Login', component: () => import('../views/Login.vue') },
  { path: '/', name: 'Dashboard', component: () => import('../views/Dashboard.vue') },
  { path: '/employees', name: 'Employees', component: () => import('../views/Employees.vue') },
  { path: '/add-employee/:id?', name: 'AddEmployee', component: () => import('../views/AddEmployee.vue') },
  { path: '/payroll', name: 'Payroll', component: () => import('../views/Payroll.vue') },
  { path: '/attendance', name: 'Attendance', component: () => import('../views/Attendance.vue') },
  { path: '/timeoff', name: 'TimeOff', component: () => import('../views/TimeOff.vue') },
  { path: '/reviews', name: 'Reviews', component: () => import('../views/Reviews.vue') }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guard (Keeps unlogged users out)
router.beforeEach((to, from, next) => {
  const { state } = useAuth();
  if (to.name !== 'Login' && !state.token) {
    next({ name: 'Login' });
  } else {
    next();
  }
});

export default router;