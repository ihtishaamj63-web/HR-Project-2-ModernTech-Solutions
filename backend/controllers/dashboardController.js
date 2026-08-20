// Dashboard controller - handles dashboard request/response logic
import pool from '../config/database.js';
import * as dashboardModel from '../models/dashboardModel.js';

// GET /api/dashboard/stats
export const getStats = async (req, res) => {
    try {
        let stats = {};

        if (req.user.role === 'employee') {
            // Find employee ID via email
            const [empRows] = await pool.query('SELECT emp_id FROM employees WHERE email = ?', [req.user.email]);
            const empId = empRows[0]?.emp_id;

            if (empId) {
                const [pending] = await pool.query("SELECT COUNT(*) as count FROM timeoff WHERE emp_id = ? AND status = 'pending'", [empId]);
                const [reviews] = await pool.query("SELECT COUNT(*) as count FROM performance_reviews WHERE emp_id = ?", [empId]);
                const [payroll] = await pool.query("SELECT base_salary, tax_rate FROM payroll WHERE emp_id = ? AND is_active = TRUE", [empId]);
                const [attendance] = await pool.query("SELECT COUNT(CASE WHEN status='present' THEN 1 END) as present, COUNT(*) as total FROM attendance WHERE emp_id = ?", [empId]);

                const netPay = payroll[0] ? payroll[0].base_salary - (payroll[0].base_salary * (payroll[0].tax_rate / 100)) : 0;
                const rate = attendance[0]?.total > 0 ? Math.round((attendance[0].present / attendance[0].total) * 100) : 0;

                stats = {
                    total_employees: 1,
                    pending_timeoff: pending[0]?.count || 0,
                    total_reviews: reviews[0]?.count || 0,
                    payroll_total: Math.round(netPay),
                    attendance_rate: rate
                };
            }
        } else {
            // HR / Admin global stats
            stats = {
                total_employees: await dashboardModel.getTotalEmployees(),
                active_employees: await dashboardModel.getActiveEmployees(),
                pending_timeoff: await dashboardModel.getPendingTimeoff(),
                total_reviews: await dashboardModel.getTotalReviews(),
                payroll_total: await dashboardModel.getPayrollTotal()
            };
        }

        res.json({ success: true, data: stats });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};