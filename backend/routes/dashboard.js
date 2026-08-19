// Dashboard stats route
import express from 'express';
import pool from '../config/database.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// GET /api/dashboard/stats - Get dashboard statistics
router.get('/stats', authMiddleware, async (req, res) => {
    try {
        // Total employees
        const [totalEmployees] = await pool.query(
            'SELECT COUNT(*) as total FROM employees WHERE is_deleted = FALSE'
        );

        // Active employees
        const [activeEmployees] = await pool.query(
            'SELECT COUNT(*) as active FROM employees WHERE employment_status = "active" AND is_deleted = FALSE'
        );

        // Pending time-off requests
        const [pendingTimeoff] = await pool.query(
            'SELECT COUNT(*) as pending FROM timeoff WHERE status = "pending"'
        );

        // Total reviews
        const [totalReviews] = await pool.query(
            'SELECT COUNT(*) as total FROM performance_reviews'
        );

        // Attendance rate for this week
        const today = new Date();
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - 7);
        const [attendanceRate] = await pool.query(
            `SELECT 
                COUNT(CASE WHEN status = 'present' THEN 1 END) as present,
                COUNT(*) as total
             FROM attendance 
             WHERE attendance_date >= ?`,
            [weekStart.toISOString().split('T')[0]]
        );

        const rate = attendanceRate[0]?.total > 0 
            ? Math.round((attendanceRate[0].present / attendanceRate[0].total) * 100) 
            : 0;

        // Payroll total
        const [payrollTotal] = await pool.query(
            'SELECT SUM(base_salary) as total FROM payroll WHERE is_active = TRUE'
        );

        // Recent reviews
        const [recentReviews] = await pool.query(
            `SELECT r.*, e.first_name, e.last_name 
             FROM performance_reviews r
             JOIN employees e ON r.emp_id = e.emp_id
             ORDER BY r.review_date DESC LIMIT 5`
        );

        res.json({
            success: true,
            data: {
                total_employees: totalEmployees[0]?.total || 0,
                active_employees: activeEmployees[0]?.active || 0,
                pending_timeoff: pendingTimeoff[0]?.pending || 0,
                total_reviews: totalReviews[0]?.total || 0,
                attendance_rate: rate,
                payroll_total: payrollTotal[0]?.total || 0,
                recent_reviews: recentReviews
            }
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;