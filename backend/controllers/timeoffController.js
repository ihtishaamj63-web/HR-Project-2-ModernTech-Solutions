// Timeoff controller - handles timeoff request/response logic
import * as timeoffModel from '../models/timeoffModel.js';

// GET /api/timeoff
export const getTimeoff = async (req, res) => {
    try {
        const timeoff = await timeoffModel.getAllTimeoff();
        res.json({ success: true, data: timeoff });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// POST /api/timeoff
export const createTimeoff = async (req, res) => {
    try {
        const { emp_id, start_date, end_date, timeoff_type, reason } = req.body;

        if (!emp_id || !start_date || !end_date || !timeoff_type) {
            return res.status(400).json({ success: false, error: 'emp_id, start_date, end_date, and timeoff_type are required' });
        }

        const validTypes = ['vacation', 'sick_leave', 'personal', 'unpaid_leave'];
        if (!validTypes.includes(timeoff_type)) {
            return res.status(400).json({ success: false, error: 'Invalid leave type' });
        }

        if (new Date(end_date) < new Date(start_date)) {
            return res.status(400).json({ success: false, error: 'End date must be after start date' });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (new Date(start_date) < today) {
            return res.status(400).json({ success: false, error: 'Cannot request leave for past dates' });
        }

        const id = await timeoffModel.createTimeoff({ emp_id, start_date, end_date, timeoff_type, reason });

        res.status(201).json({ success: true, message: 'Time-off request submitted', data: { timeoff_id: id } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// PUT /api/timeoff/:id/approve
export const approveTimeoff = async (req, res) => {
    try {
        const request = await timeoffModel.getTimeoffById(req.params.id);
        if (!request) return res.status(404).json({ success: false, error: 'Request not found' });
        if (request.status !== 'pending') return res.status(400).json({ success: false, error: `Request is already ${request.status}` });

        const affectedRows = await timeoffModel.approveTimeoff(req.params.id, req.user.user_id);
        if (affectedRows === 0) return res.status(400).json({ success: false, error: 'Could not approve request' });

        res.json({ success: true, message: 'Request approved' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// PUT /api/timeoff/:id/deny
export const denyTimeoff = async (req, res) => {
    try {
        const { denial_reason } = req.body;
        const request = await timeoffModel.getTimeoffById(req.params.id);
        if (!request) return res.status(404).json({ success: false, error: 'Request not found' });
        if (request.status !== 'pending') return res.status(400).json({ success: false, error: `Request is already ${request.status}` });

        const affectedRows = await timeoffModel.denyTimeoff(req.params.id, req.user.user_id, denial_reason);
        if (affectedRows === 0) return res.status(400).json({ success: false, error: 'Could not deny request' });

        res.json({ success: true, message: 'Request denied' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// PUT /api/timeoff/:id/cancel
export const cancelTimeoff = async (req, res) => {
    try {
        const request = await timeoffModel.getTimeoffById(req.params.id);
        if (!request) return res.status(404).json({ success: false, error: 'Request not found' });
        if (request.status !== 'pending') return res.status(400).json({ success: false, error: 'Can only cancel pending requests' });

        const affectedRows = await timeoffModel.cancelTimeoff(req.params.id);
        if (affectedRows === 0) return res.status(400).json({ success: false, error: 'Could not cancel request' });

        res.json({ success: true, message: 'Request cancelled' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// PUT /api/timeoff/cleanup
export const cleanupOldRequests = async (req, res) => {
    try {
        await timeoffModel.cleanupOldRequests();
        res.json({ success: true, message: 'Old requests cleaned up' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};