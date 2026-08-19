import express from 'express';
import authMiddleware from '../middleware/auth.js';
import { getAttendance, logAttendance, updateAttendance, deleteAttendance } from '../controllers/attendanceController.js';

const router = express.Router();

router.route('/')
    .get(authMiddleware, getAttendance)
    .post(authMiddleware, logAttendance);

router.route('/:id')
    .put(authMiddleware, updateAttendance)
    .delete(authMiddleware, deleteAttendance);

export default router;