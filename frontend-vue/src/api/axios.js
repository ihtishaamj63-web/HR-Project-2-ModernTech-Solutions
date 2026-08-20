// frontend-vue/src/api/axios.js
import axios from 'axios';
import { startLoading, stopLoading } from '../stores/loading.js';

const api = axios.create({
  // Uses Vite env variable, falls back to localhost for dev
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Start loading timer
api.interceptors.request.use((config) => {
  startLoading();
  
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
}, (error) => {
  stopLoading();
  return Promise.reject(error);
});

// Response Interceptor: Stop loading timer
api.interceptors.response.use((response) => {
  stopLoading();
  return response;
}, (error) => {
  stopLoading();
  return Promise.reject(error);
});

export default api;