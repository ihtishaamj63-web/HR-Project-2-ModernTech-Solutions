// backend/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit'; // <-- IMPORT HERE

import authRoutes from './routes/auth.js';
import employeeRoutes from './routes/employees.js';
import reviewRoutes from './routes/reviews.js';
import payrollRoutes from './routes/payroll.js';
import attendanceRoutes from './routes/attendance.js';
import timeoffRoutes from './routes/timeoff.js';
import dashboardRoutes from './routes/dashboard.js';

dotenv.config();

const app = express();

// FIX: Trust proxy so express-rate-limit works on Render
app.set('trust proxy', 1);

// --- RATE LIMITERS ---

// 1. General API Limiter (Max 100 requests per 15 minutes)
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100, 
    message: {
        success: false,
        error: 'Too many requests from this IP, please try again after 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// 2. Strict Login Limiter (Max 5 login attempts per 15 minutes)
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
        success: false,
        error: 'Too many login attempts. Your account access is locked for 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// --- MIDDLEWARE ---

// Apply general rate limiting to all API requests
app.use('/api/', apiLimiter);

// Secure CORS configuration
const allowedOrigins = [
  'http://localhost:5173',      
  'http://localhost:3000',       
  process.env.FRONTEND_URL       
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use(express.json());

// --- ROUTES ---

// Apply strict login limiter ONLY to the login route
app.use('/api/auth/login', loginLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/timeoff', timeoffRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found', path: req.path });
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});