// Timeoff model - handles timeoff database operations
import pool from '../config/database.js';

// Get all timeoff with employee names
export const getAllTimeoff = async () => {
    const [rows] = await pool.query(
        `SELECT t.*, e.first_name, e.last_name, e.department, e.position 
         FROM timeoff t
         JOIN employees e ON t.emp_id = e.emp_id
         ORDER BY t.request_date DESC`
    );
    return rows;
};

// Get timeoff by employee ID
export const getTimeoffByEmployee = async (empId) => {
    const [rows] = await pool.query(
        'SELECT * FROM timeoff WHERE emp_id = ? ORDER BY request_date DESC',
        [empId]
    );
    return rows;
};

// Get timeoff by ID
export const getTimeoffById = async (id) => {
    const [rows] = await pool.query(
        'SELECT * FROM timeoff WHERE timeoff_id = ?',
        [id]
    );
    return rows[0];
};

// Create timeoff request
export const createTimeoff = async (timeoffData) => {
    const { emp_id, start_date, end_date, timeoff_type, reason } = timeoffData;
    const [result] = await pool.query(
        `INSERT INTO timeoff 
         (emp_id, request_date, start_date, end_date, timeoff_type, reason, status)
         VALUES (?, NOW(), ?, ?, ?, ?, 'pending')`,
        [emp_id, start_date, end_date, timeoff_type, reason || null]
    );
    return result.insertId;
};

// Approve timeoff request
export const approveTimeoff = async (id, approverId) => {
    const [result] = await pool.query(
        `UPDATE timeoff 
         SET status = 'approved', approver_id = ?, approved_date = NOW()
         WHERE timeoff_id = ? AND status = 'pending'`,
        [approverId, id]
    );
    return result.affectedRows;
};

// Deny timeoff request
export const denyTimeoff = async (id, approverId, denialReason) => {
    const [result] = await pool.query(
        `UPDATE timeoff 
         SET status = 'denied', approver_id = ?, approved_date = NOW(), denial_reason = ?
         WHERE timeoff_id = ? AND status = 'pending'`,
        [approverId, denialReason || null, id]
    );
    return result.affectedRows;
};

// Cancel timeoff request
export const cancelTimeoff = async (id) => {
    const [result] = await pool.query(
        `UPDATE timeoff 
         SET status = 'cancelled'
         WHERE timeoff_id = ? AND status = 'pending'`,
        [id]
    );
    return result.affectedRows;
};

// Auto-deny old pending requests
export const cleanupOldRequests = async () => {
    const [result] = await pool.query(
        `UPDATE timeoff 
         SET status = 'denied', denial_reason = 'Automatically rejected (past date)'
         WHERE status = 'pending' AND start_date < CURDATE()`
    );
    return result.affectedRows;
};