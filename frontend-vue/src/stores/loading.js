// frontend-vue/src/stores/loading.js
import { reactive } from 'vue';

export const loadingState = reactive({
  isLoading: false,
  requestCount: 0
});

let loadingTimer = null;

export function startLoading() {
  loadingState.requestCount++;
  
  // FIX: Only show the overlay if the request takes longer than 800ms
  // This prevents the screen from flashing on quick page navigations
  if (!loadingTimer && !loadingState.isLoading) {
    loadingTimer = setTimeout(() => {
      if (loadingState.requestCount > 0) {
        loadingState.isLoading = true;
      }
    }, 800);
  }
}

export function stopLoading() {
  loadingState.requestCount--;
  if (loadingState.requestCount <= 0) {
    loadingState.requestCount = 0;
    loadingState.isLoading = false;
    
    // Clear the timer if the request finished before 800ms
    if (loadingTimer) {
      clearTimeout(loadingTimer);
      loadingTimer = null;
    }
  }
}