// Dashboard controller - handles dashboard request/response logic
import * as dashboardModel from '../models/dashboardModel.js';

// GET /api/dashboard/stats
export const getDashboardStats = async (req, res) => {
    try {
        const stats = {
            total_employees: await dashboardModel.getTotalEmployees(),
            active_employees: await dashboardModel.getActiveEmployees(),
            pending_timeoff: await dashboardModel.getPendingTimeoff(),
            total_reviews: await dashboardModel.getTotalReviews(),
            payroll_total: await dashboardModel.getPayrollTotal()
        };

        res.json({ success: true, data: stats });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};