<!-- src/views/Dashboard.vue -->
<template>
  <div class="dash-container">
    <section class="dash-hero">
      <h5>MODERNTECH SOLUTIONS</h5>
      <h1>Welcome back, {{ userName }}.</h1>
      <p><i class="bi bi-calendar3 me-1"></i> {{ today }}</p>
      <p>{{ isHR ? 'Manage employee records, performance reviews and payroll from one centralized HR dashboard.' : 'View your personal dashboard: attendance, time off and reviews.' }}</p>
      <div class="dash-hero-buttons" v-if="isHR">
        <button @click="router.push('/employees')">Employee Records</button>
        <button @click="router.push('/payroll')">Open Payroll</button>
      </div>
    </section>

    <section class="dash-stats">
      <div class="dash-stat-card">
        <div class="dash-stat-icon blue"><i class="bi bi-people-fill"></i></div>
        <h4>Total Employees</h4>
        <h2>{{ stats.total_employees || 0 }}</h2>
        <a href="#" @click.prevent="router.push('/employees')" class="dash-stat-link blue-link">View Employees →</a>
      </div>

      <div class="dash-stat-card">
        <div class="dash-stat-icon orange"><i class="bi bi-clock-fill"></i></div>
        <h4>Pending Requests</h4>
        <h2>{{ stats.pending_timeoff || 0 }}</h2>
        <p>Time Off</p>
        <a href="#" @click.prevent="router.push('/timeoff')" class="dash-stat-link orange-link">Manage Requests →</a>
      </div>

      <div class="dash-stat-card">
        <div class="dash-stat-icon green"><i class="bi bi-star-fill"></i></div>
        <h4>Completed Reviews</h4>
        <h2>{{ stats.total_reviews || 0 }}</h2>
        <p>This Quarter</p>
        <a href="#" @click.prevent="router.push('/reviews')" class="dash-stat-link green-link">View Reviews →</a>
      </div>

      <div class="dash-stat-card">
        <div class="dash-stat-icon blue"><i class="bi bi-cash-stack"></i></div>
        <h4>Payroll Summary</h4>
        <h2>R {{ Number(stats.payroll_total || 0).toLocaleString('en-ZA') }}</h2>
        <p>{{ stats.total_employees || 0 }} Employees Paid</p>
        <a href="#" @click.prevent="router.push('/payroll')" class="dash-stat-link blue-link">Open Payroll →</a>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../stores/auth';
import api from '../api/axios';

const router = useRouter();
const { isHR, userName } = useAuth();

const stats = ref({});
const today = new Date().toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' });

onMounted(async () => {
  try {
    const response = await api.get('/dashboard/stats');
    if (response.data.success) {
      stats.value = response.data.data;
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
  }
});
</script>

<style scoped>
.dash-container { padding: 20px; }
.dash-hero { margin-bottom: 40px; background: linear-gradient(135deg, #272757, #0f0e47); color: white; border-radius: 20px; padding: 50px; }
.dash-hero h5 { letter-spacing: 2px; margin-bottom: 10px; color: #a8a8d0; font-size: 14px; }
.dash-hero h1 { font-size: 42px; margin-bottom: 15px; }
.dash-hero p { width: 60%; line-height: 1.7; color: rgba(255, 255, 255, 0.8); }
.dash-hero-buttons { margin-top: 30px; }
.dash-hero-buttons button { padding: 13px 28px; border: none; border-radius: 12px; margin-right: 15px; cursor: pointer; font-size: 15px; font-weight: 600; transition: 0.2s; }
.dash-hero-buttons button:first-child { background: #505081; color: white; }
.dash-hero-buttons button:first-child:hover { background: #272757; transform: translateY(-2px); }
.dash-hero-buttons button:last-child { background: rgba(255, 255, 255, 0.95); color: #0f0e47; }
.dash-hero-buttons button:last-child:hover { background: white; transform: translateY(-2px); }
.dash-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 25px; margin-bottom: 40px; }
.dash-stat-card { background: white; border-radius: 15px; padding: 25px; box-shadow: 0 8px 18px rgba(0, 0, 0, 0.08); transition: 0.2s; }
.dash-stat-card:hover { transform: translateY(-8px); }
.dash-stat-icon { width: 55px; height: 55px; border-radius: 12px; display: flex; justify-content: center; align-items: center; color: white; margin-bottom: 20px; font-size: 24px; }
.dash-stat-icon.blue { background: #3b82f6; }
.dash-stat-icon.green { background: #10b981; }
.dash-stat-icon.orange { background: #f59e0b; }
.dash-stat-card h4 { color: #666; margin-bottom: 8px; }
.dash-stat-card h2 { font-size: 34px; margin-bottom: 5px; }
.dash-stat-card p { color: #888; }
.dash-stat-link { display: inline-block; margin-top: 8px; font-size: 12px; font-weight: 600; text-decoration: none; transition: 0.2s; }
.dash-stat-link:hover { text-decoration: underline; }
.dash-stat-link.blue-link { color: #3b82f6; }
.dash-stat-link.orange-link { color: #f59e0b; }
.dash-stat-link.green-link { color: #10b981; }
</style>