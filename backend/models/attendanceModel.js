// Attendance model - handles attendance database operations
import pool from '../config/database.js';

// Get all attendance with employee names
export const getAllAttendance = async () => {
    const [rows] = await pool.query(
        `SELECT a.*, e.first_name, e.last_name, e.department, e.position 
         FROM attendance a
         JOIN employees e ON a.emp_id = e.emp_id
         ORDER BY a.attendance_date DESC`
    );
    return rows;
};

// Get attendance by employee ID
export const getAttendanceByEmployee = async (empId) => {
    const [rows] = await pool.query(
        'SELECT * FROM attendance WHERE emp_id = ? ORDER BY attendance_date DESC',
        [empId]
    );
    return rows;
};

// Check if attendance exists for employee on date
export const attendanceExists = async (empId, date) => {
    const [rows] = await pool.query(
        'SELECT * FROM attendance WHERE emp_id = ? AND attendance_date = ?',
        [empId, date]
    );
    return rows.length > 0;
};

// Create attendance record
export const createAttendance = async (attendanceData) => {
    const { emp_id, attendance_date, status, check_in_time, check_out_time, hours_worked, notes, recorded_by } = attendanceData;
    const [result] = await pool.query(
        `INSERT INTO attendance 
         (emp_id, attendance_date, status, check_in_time, check_out_time, hours_worked, notes, recorded_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [emp_id, attendance_date, status, check_in_time || null, check_out_time || null, hours_worked || null, notes || null, recorded_by]
    );
    return result.insertId;
};

// Update attendance record
export const updateAttendance = async (id, attendanceData) => {
    const { status, check_in_time, check_out_time, hours_worked, notes } = attendanceData;
    const [result] = await pool.query(
        `UPDATE attendance 
         SET status = ?, check_in_time = ?, check_out_time = ?, hours_worked = ?, notes = ?
         WHERE attendance_id = ?`,
        [status, check_in_time || null, check_out_time || null, hours_worked || null, notes || null, id]
    );
    return result.affectedRows;
};

// Delete attendance record
export const deleteAttendance = async (id) => {
    const [result] = await pool.query(
        'DELETE FROM attendance WHERE attendance_id = ?',
        [id]
    );
    return result.affectedRows;
};

// Get attendance for date range
export const getAttendanceByDateRange = async (empId, startDate, endDate) => {
    const [rows] = await pool.query(
        'SELECT * FROM attendance WHERE emp_id = ? AND attendance_date BETWEEN ? AND ?',
        [empId, startDate, endDate]
    );
    return rows;
};