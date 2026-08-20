<!-- src/App.vue -->
<script setup>
import Navbar from './components/Navbar.vue';
import { useRoute } from 'vue-router';
import { ref, onMounted } from 'vue';
import { loadingState } from './stores/loading.js'; // Import loading state

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

    <!-- Global Loading Overlay -->
    <div v-if="loadingState.isLoading" class="global-loading-overlay">
      <div class="spinner-border text-light" role="status" style="width: 3.5rem; height: 3.5rem; border-width: 0.4rem;">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-4 text-light fw-bold fs-5">Waiting for server...</p>
      <p class="text-light-50 small">Waking up the backend, this may take a few seconds.</p>
    </div>
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

/* Global Loading Overlay Styles */
.global-loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(15, 14, 71, 0.75);
  backdrop-filter: blur(5px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.text-light-50 {
  color: rgba(255, 255, 255, 0.6);
}
</style>