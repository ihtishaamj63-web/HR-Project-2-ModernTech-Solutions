// frontend-vue/src/stores/loading.js
import { reactive } from 'vue';

export const loadingState = reactive({
  isLoading: false,
  requestCount: 0
});

export function startLoading() {
  loadingState.requestCount++;
  loadingState.isLoading = true;
}

export function stopLoading() {
  loadingState.requestCount--;
  if (loadingState.requestCount <= 0) {
    loadingState.requestCount = 0;
    loadingState.isLoading = false;
  }
}