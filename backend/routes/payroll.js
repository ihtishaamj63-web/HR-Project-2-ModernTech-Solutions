// Payroll routes
import express from 'express';
import pool from '../config/database.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// GET /api/payroll - Get all payroll records
router.get('/', authMiddleware, async (req, res) => {
    try {
        const [payroll] = await pool.query(
            `SELECT p.*, e.first_name, e.last_name, e.email
             FROM payroll p
             JOIN employees e ON p.emp_id = e.emp_id
             WHERE p.is_active = TRUE
             ORDER BY p.payroll_id`
        );
        res.json({ success: true, data: payroll });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/payroll/:id - Get one payroll record
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const [payroll] = await pool.query(
            `SELECT p.*, e.first_name, e.last_name 
             FROM payroll p
             JOIN employees e ON p.emp_id = e.emp_id
             WHERE p.payroll_id = ?`,
            [req.params.id]
        );
        if (payroll.length === 0) {
            return res.status(404).json({ success: false, error: 'Payroll record not found' });
        }
        res.json({ success: true, data: payroll[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/payroll - Create new payroll record
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { emp_id, base_salary, hourly_rate, tax_rate, benefits, deductions, effective_date } = req.body;

        if (!emp_id || !base_salary || !effective_date) {
            return res.status(400).json({
                success: false,
                error: 'emp_id, base_salary, and effective_date are required'
            });
        }

        // Deactivate old payroll
        await pool.query(
            'UPDATE payroll SET is_active = FALSE WHERE emp_id = ?',
            [emp_id]
        );

        // Create new payroll
        const [result] = await pool.query(
            `INSERT INTO payroll 
             (emp_id, base_salary, hourly_rate, tax_rate, benefits, deductions, effective_date, is_active)
             VALUES (?, ?, ?, ?, ?, ?, ?, TRUE)`,
            [emp_id, base_salary, hourly_rate || null, tax_rate || 18.00, benefits || 0, deductions || 0, effective_date]
        );

        res.status(201).json({
            success: true,
            message: 'Payroll created successfully',
            data: { payroll_id: result.insertId }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/payroll/calculate - Calculate payslip
router.post('/calculate', authMiddleware, async (req, res) => {
    try {
        const { emp_id, period_start, period_end } = req.body;

        if (!emp_id || !period_start || !period_end) {
            return res.status(400).json({
                success: false,
                error: 'emp_id, period_start, and period_end are required'
            });
        }

        // Get employee's active payroll config
        const [payrollConfig] = await pool.query(
            'SELECT * FROM payroll WHERE emp_id = ? AND is_active = TRUE',
            [emp_id]
        );

        if (payrollConfig.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'No active payroll configuration found for this employee'
            });
        }

        const config = payrollConfig[0];
        const salary = config.base_salary;
        const taxRate = config.tax_rate / 100;

        // Basic calculation
        const grossPay = salary;
        const taxDeducted = grossPay * taxRate;
        const netPay = grossPay - taxDeducted;

        // Get attendance for period (for hours worked)
        const [attendance] = await pool.query(
            'SELECT SUM(hours_worked) as total_hours FROM attendance WHERE emp_id = ? AND attendance_date BETWEEN ? AND ?',
            [emp_id, period_start, period_end]
        );

        const hoursWorked = attendance[0]?.total_hours || 0;

        res.json({
            success: true,
            data: {
                emp_id,
                period_start,
                period_end,
                gross_pay: Math.round(grossPay),
                tax_deducted: Math.round(taxDeducted),
                net_pay: Math.round(netPay),
                hours_worked: hoursWorked,
                basic_salary: salary,
                tax_rate: config.tax_rate
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;