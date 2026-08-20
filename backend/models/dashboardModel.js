// Dashboard model - handles dashboard statistics
import pool from '../config/database.js';

// Get total employees
export const getTotalEmployees = async () => {
    const [rows] = await pool.query(
        'SELECT COUNT(*) as total FROM employees WHERE is_deleted = FALSE'
    );
    return rows[0]?.total || 0;
};

// Get active employees
export const getActiveEmployees = async () => {
    const [rows] = await pool.query(
        'SELECT COUNT(*) as active FROM employees WHERE employment_status = "active" AND is_deleted = FALSE'
    );
    return rows[0]?.active || 0;
};

// Get pending timeoff count
export const getPendingTimeoff = async () => {
    const [rows] = await pool.query(
        'SELECT COUNT(*) as pending FROM timeoff WHERE status = "pending"'
    );
    return rows[0]?.pending || 0;
};

// Get total reviews
export const getTotalReviews = async () => {
    const [rows] = await pool.query(
        'SELECT COUNT(*) as total FROM performance_reviews'
    );
    return rows[0]?.total || 0;
};

// Get payroll total
export const getPayrollTotal = async () => {
    const [rows] = await pool.query(
        'SELECT SUM(base_salary) as total FROM payroll WHERE is_active = TRUE'
    );
    return rows[0]?.total || 0;
};