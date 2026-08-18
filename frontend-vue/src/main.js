// src/main.js
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css'; // <-- ADD THIS LINE
import './assets/main.css';

const app = createApp(App);
app.use(router);
app.mount('#app');