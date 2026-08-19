import express from 'express';
import authMiddleware from '../middleware/auth.js';
import { getStats } from '../controllers/dashboardController.js';

const router = express.Router();

router.get('/stats', authMiddleware, getStats);

export default router;