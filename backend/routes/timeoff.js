import express from 'express';
import authMiddleware from '../middleware/auth.js';
import { getTimeoff, createTimeoff, approveTimeoff, denyTimeoff, cancelTimeoff, cleanupOldRequests } from '../controllers/timeoffController.js';

const router = express.Router();

router.route('/')
    .get(authMiddleware, getTimeoff)
    .post(authMiddleware, createTimeoff);

// FIX: /cleanup must come BEFORE /:id/approve so Express doesn't read "cleanup" as an ID
router.put('/cleanup', authMiddleware, cleanupOldRequests);

router.put('/:id/approve', authMiddleware, approveTimeoff);
router.put('/:id/deny', authMiddleware, denyTimeoff);
router.put('/:id/cancel', authMiddleware, cancelTimeoff);

export default router;