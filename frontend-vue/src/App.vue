<!-- src/App.vue -->
<script setup>
import Navbar from './components/Navbar.vue';
import { useRoute } from 'vue-router';
import { ref, onMounted } from 'vue';

const route = useRoute();
const isDarkMode = ref(false);

onMounted(() => {
  isDarkMode.value = localStorage.getItem('nightMode') === 'enabled';
  if (isDarkMode.value) document.body.classList.add('dark-mode');
});

function toggleDarkMode() {
  isDarkMode.value = !isDarkMode.value;
  document.body.classList.toggle('dark-mode', isDarkMode.value);
  localStorage.setItem('nightMode', isDarkMode.value ? 'enabled' : 'disabled');
}
</script>

<template>
  <div class="app-wrapper">
    <Navbar v-if="route.name !== 'Login'" :isDarkMode="isDarkMode" @toggle-dark-mode="toggleDarkMode" />
    <main class="app-main">
      <router-view />
    </main>
  </div>
</template>

<style>
/* Removed scoped styles so global main.css handles everything */
.app-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.app-main {
  flex: 1;
  padding: 20px;
}
</style>