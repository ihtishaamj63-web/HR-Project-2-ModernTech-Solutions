// Attendance controller - handles attendance request/response logic
import pool from '../config/database.js';
import * as attendanceModel from '../models/attendanceModel.js';

// GET /api/attendance
export const getAttendance = async (req, res) => {
    try {
        let attendance;
        
        if (req.user.role === 'employee') {
            const [empRows] = await pool.query('SELECT emp_id FROM employees WHERE email = ?', [req.user.email]);
            const empId = empRows[0]?.emp_id;
            if (empId) {
                attendance = await attendanceModel.getAttendanceByEmployee(empId);
            } else {
                attendance = [];
            }
        } else {
            attendance = await attendanceModel.getAllAttendance();
        }

        res.json({ success: true, data: attendance });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// POST /api/attendance
export const logAttendance = async (req, res) => {
    try {
        const { emp_id, attendance_date, status, check_in_time, check_out_time, hours_worked, notes } = req.body;

        if (!emp_id || !attendance_date || !status) {
            return res.status(400).json({ success: false, error: 'emp_id, attendance_date, and status are required' });
        }

        const exists = await attendanceModel.attendanceExists(emp_id, attendance_date);
        if (exists) {
            return res.status(409).json({ success: false, error: 'Attendance already recorded for this employee on this date' });
        }

        const id = await attendanceModel.createAttendance({
            emp_id, attendance_date, status: status.toLowerCase(),
            check_in_time, check_out_time, hours_worked, notes, recorded_by: req.user.user_id
        });

        res.status(201).json({ success: true, message: 'Attendance logged successfully', data: { attendance_id: id } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// PUT /api/attendance/:id
export const updateAttendance = async (req, res) => {
    try {
        const { status, check_in_time, check_out_time, hours_worked, notes } = req.body;
        const affectedRows = await attendanceModel.updateAttendance(req.params.id, {
            status, check_in_time, check_out_time, hours_worked, notes
        });

        if (affectedRows === 0) {
            return res.status(404).json({ success: false, error: 'Attendance record not found' });
        }
        res.json({ success: true, message: 'Attendance updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// DELETE /api/attendance/:id
export const deleteAttendance = async (req, res) => {
    try {
        const affectedRows = await attendanceModel.deleteAttendance(req.params.id);
        if (affectedRows === 0) {
            return res.status(404).json({ success: false, error: 'Attendance record not found' });
        }
        res.json({ success: true, message: 'Attendance deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};