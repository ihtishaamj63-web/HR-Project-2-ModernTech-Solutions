// Attendance routes only
import express from 'express';
import pool from '../config/database.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// GET /api/attendance - Get all attendance records
router.get('/', authMiddleware, async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT a.*, e.first_name, e.last_name 
             FROM attendance a
             JOIN employees e ON a.emp_id = e.emp_id
             ORDER BY a.attendance_date DESC`
        );
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/attendance - Log new attendance
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { emp_id, attendance_date, status, check_in_time, check_out_time, hours_worked, notes } = req.body;

        if (!emp_id || !attendance_date || !status) {
            return res.status(400).json({
                success: false,
                error: 'emp_id, attendance_date, and status are required'
            });
        }

        // Check for duplicate
        const [existing] = await pool.query(
            'SELECT * FROM attendance WHERE emp_id = ? AND attendance_date = ?',
            [emp_id, attendance_date]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                error: 'Attendance already recorded for this employee on this date'
            });
        }

        // Insert new attendance record
        const [result] = await pool.query(
            `INSERT INTO attendance 
             (emp_id, attendance_date, status, check_in_time, check_out_time, hours_worked, notes, recorded_by)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [emp_id, attendance_date, status, check_in_time || null, check_out_time || null, hours_worked || null, notes || null, req.user.user_id]
        );

        res.status(201).json({
            success: true,
            message: 'Attendance logged successfully',
            data: { attendance_id: result.insertId }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;