// Attendance controller - handles attendance request/response logic
import * as attendanceModel from '../models/attendanceModel.js';

// GET /api/attendance
export const getAttendance = async (req, res) => {
    try {
        const attendance = await attendanceModel.getAllAttendance();
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
            return res.status(400).json({
                success: false,
                error: 'emp_id, attendance_date, and status are required'
            });
        }

        const exists = await attendanceModel.attendanceExists(emp_id, attendance_date);
        if (exists) {
            return res.status(409).json({
                success: false,
                error: 'Attendance already recorded for this employee on this date'
            });
        }

        const id = await attendanceModel.createAttendance({
            emp_id,
            attendance_date,
            status: status.toLowerCase(),
            check_in_time,
            check_out_time,
            hours_worked,
            notes,
            recorded_by: req.user.user_id
        });

        res.status(201).json({
            success: true,
            message: 'Attendance logged successfully',
            data: { attendance_id: id }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};