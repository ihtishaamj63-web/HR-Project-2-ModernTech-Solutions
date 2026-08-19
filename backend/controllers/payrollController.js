// Payroll controller - handles payroll request/response logic
import * as payrollModel from '../models/payrollModel.js';

// GET /api/payroll
export const getPayroll = async (req, res) => {
    try {
        const payroll = await payrollModel.getAllPayroll();
        res.json({ success: true, data: payroll });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// POST /api/payroll/calculate
export const calculatePayslip = async (req, res) => {
    try {
        const { emp_id, period_start, period_end } = req.body;

        if (!emp_id || !period_start || !period_end) {
            return res.status(400).json({
                success: false,
                error: 'emp_id, period_start, and period_end are required'
            });
        }

        const config = await payrollModel.getPayrollByEmployee(emp_id);

        if (!config) {
            return res.status(404).json({
                success: false,
                error: 'No active payroll configuration found'
            });
        }

        const salary = config.base_salary;
        const taxRate = config.tax_rate / 100;
        const grossPay = salary;
        const taxDeducted = grossPay * taxRate;
        const netPay = grossPay - taxDeducted;

        res.json({
            success: true,
            data: {
                emp_id,
                period_start,
                period_end,
                gross_pay: Math.round(grossPay),
                tax_deducted: Math.round(taxDeducted),
                net_pay: Math.round(netPay),
                basic_salary: salary,
                tax_rate: config.tax_rate
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};