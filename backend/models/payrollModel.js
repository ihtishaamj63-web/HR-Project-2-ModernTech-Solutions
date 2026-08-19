// Payroll model - handles payroll database operations
import pool from '../config/database.js';

// Get all active payroll with employee names
export const getAllPayroll = async () => {
    const [rows] = await pool.query(
        `SELECT p.*, e.first_name, e.last_name, e.email
         FROM payroll p
         JOIN employees e ON p.emp_id = e.emp_id
         WHERE p.is_active = TRUE
         ORDER BY p.payroll_id`
    );
    return rows;
};

// Get payroll by employee ID
export const getPayrollByEmployee = async (empId) => {
    const [rows] = await pool.query(
        'SELECT * FROM payroll WHERE emp_id = ? AND is_active = TRUE',
        [empId]
    );
    return rows[0];
};

// Get payroll by ID
export const getPayrollById = async (id) => {
    const [rows] = await pool.query(
        'SELECT * FROM payroll WHERE payroll_id = ?',
        [id]
    );
    return rows[0];
};

// Create payroll record
export const createPayroll = async (payrollData) => {
    const { emp_id, base_salary, hourly_rate, tax_rate, benefits, deductions, effective_date } = payrollData;
    const [result] = await pool.query(
        `INSERT INTO payroll 
         (emp_id, base_salary, hourly_rate, tax_rate, benefits, deductions, effective_date, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, TRUE)`,
        [emp_id, base_salary, hourly_rate || null, tax_rate || 18.00, benefits || 0, deductions || 0, effective_date]
    );
    return result.insertId;
};

// Deactivate old payroll for employee
export const deactivatePayroll = async (empId) => {
    await pool.query(
        'UPDATE payroll SET is_active = FALSE WHERE emp_id = ?',
        [empId]
    );
};

// Update payroll
export const updatePayroll = async (id, payrollData) => {
    const { base_salary, hourly_rate, tax_rate, benefits, deductions } = payrollData;
    const [result] = await pool.query(
        `UPDATE payroll 
         SET base_salary = ?, hourly_rate = ?, tax_rate = ?, benefits = ?, deductions = ?
         WHERE payroll_id = ?`,
        [base_salary, hourly_rate || null, tax_rate || 18.00, benefits || 0, deductions || 0, id]
    );
    return result.affectedRows;
};