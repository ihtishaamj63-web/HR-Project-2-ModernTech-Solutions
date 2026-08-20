// Payroll controller - handles payroll request/response logic
import pool from '../config/database.js';
import * as payrollModel from '../models/payrollModel.js';

// GET /api/payroll
export const getPayroll = async (req, res) => {
    try {
        let payroll;
        
        if (req.user.role === 'employee') {
            const [empRows] = await pool.query('SELECT emp_id FROM employees WHERE email = ?', [req.user.email]);
            const empId = empRows[0]?.emp_id;
            if (empId) {
                const data = await payrollModel.getPayrollByEmployee(empId);
                payroll = data ? [data] : []; // Wrap in array for frontend mapping
            } else {
                payroll = [];
            }
        } else {
            payroll = await payrollModel.getAllPayroll();
        }

        res.json({ success: true, data: payroll });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// GET /api/payroll/:id
export const getPayrollById = async (req, res) => {
    try {
        const payroll = await payrollModel.getPayrollById(req.params.id);
        if (!payroll) {
            return res.status(404).json({ success: false, error: 'Payroll record not found' });
        }
        res.json({ success: true, data: payroll });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// POST /api/payroll
export const createPayroll = async (req, res) => {
    try {
        const { emp_id, base_salary, hourly_rate, tax_rate, benefits, deductions, effective_date } = req.body;

        if (!emp_id || !base_salary || !effective_date) {
            return res.status(400).json({ success: false, error: 'emp_id, base_salary, and effective_date are required' });
        }

        await payrollModel.deactivatePayroll(emp_id); // Deactivate old payroll
        const id = await payrollModel.createPayroll({ emp_id, base_salary, hourly_rate, tax_rate, benefits, deductions, effective_date });

        res.status(201).json({ success: true, message: 'Payroll created successfully', data: { payroll_id: id } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// POST /api/payroll/calculate
export const calculatePayslip = async (req, res) => {
    try {
        const { emp_id, period_start, period_end } = req.body;

        if (!emp_id || !period_start || !period_end) {
            return res.status(400).json({ success: false, error: 'emp_id, period_start, and period_end are required' });
        }

        const config = await payrollModel.getPayrollByEmployee(emp_id);

        if (!config) {
            return res.status(404).json({ success: false, error: 'No active payroll configuration found' });
        }

        const salary = config.base_salary;
        const taxRate = config.tax_rate / 100;
        const grossPay = salary;
        const taxDeducted = grossPay * taxRate;
        const netPay = grossPay - taxDeducted;

        res.json({
            success: true,
            data: {
                emp_id, period_start, period_end,
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

// PUT /api/payroll/:id
export const updatePayroll = async (req, res) => {
    try {
        const { base_salary, hourly_rate, tax_rate, benefits, deductions } = req.body;
        const affectedRows = await payrollModel.updatePayroll(req.params.id, {
            base_salary, hourly_rate, tax_rate, benefits, deductions
        });

        if (affectedRows === 0) {
            return res.status(404).json({ success: false, error: 'Payroll record not found' });
        }
        res.json({ success: true, message: 'Payroll updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// DELETE /api/payroll/:id
export const deletePayroll = async (req, res) => {
    try {
        const affectedRows = await payrollModel.deletePayroll(req.params.id);
        if (affectedRows === 0) {
            return res.status(404).json({ success: false, error: 'Payroll record not found' });
        }
        res.json({ success: true, message: 'Payroll deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};