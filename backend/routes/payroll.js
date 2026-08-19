import express from 'express';
import authMiddleware from '../middleware/auth.js';
import { getPayroll, getPayrollById, createPayroll, updatePayroll, deletePayroll, calculatePayslip } from '../controllers/payrollController.js';

const router = express.Router();

router.route('/')
    .get(authMiddleware, getPayroll)
    .post(authMiddleware, createPayroll);

// FIX: Custom route must come BEFORE /:id
router.post('/calculate', authMiddleware, calculatePayslip);

router.route('/:id')
    .get(authMiddleware, getPayrollById)
    .put(authMiddleware, updatePayroll)
    .delete(authMiddleware, deletePayroll);

export default router;