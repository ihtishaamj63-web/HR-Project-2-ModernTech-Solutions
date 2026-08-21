// Employee model - handles employee database operations
import pool from '../config/database.js';

// Get all employees
export const getAllEmployees = async () => {
    const [rows] = await pool.query('SELECT * FROM employees WHERE is_deleted = FALSE ORDER BY emp_id');
    return rows;
};

// Get employee by ID
export const getEmployeeById = async (id) => {
    const [rows] = await pool.query('SELECT * FROM employees WHERE emp_id = ? AND is_deleted = FALSE', [id]);
    return rows[0];
};

// Create employee
export const createEmployee = async (employeeData) => {
    const { first_name, last_name, email, phone, position, department, hire_date, employment_status, employment_history } = employeeData;
    const [result] = await pool.query(
        `INSERT INTO employees 
         (first_name, last_name, email, phone, position, department, hire_date, employment_history, employment_status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [first_name, last_name, email, phone || null, position, department, hire_date, employment_history || null, employment_status || 'active']
    );
    return result.insertId;
};

// Update employee
export const updateEmployee = async (id, employeeData) => {
    const { first_name, last_name, email, phone, position, department, employment_status, employment_history } = employeeData;
    const [result] = await pool.query(
        `UPDATE employees 
         SET first_name = ?, last_name = ?, email = ?, phone = ?, 
             position = ?, department = ?, employment_status = ?, employment_history = ?
         WHERE emp_id = ? AND is_deleted = FALSE`,
        [first_name, last_name, email, phone || null, position, department, employment_status, employment_history || null, id]
    );
    return result.affectedRows;
};

// Soft delete employee
// FIX: Changed double quotes to single quotes for 'terminated' to fix Aiven crash
export const deleteEmployee = async (id) => {
    const [result] = await pool.query(
        "UPDATE employees SET is_deleted = TRUE, employment_status = 'terminated' WHERE emp_id = ?",
        [id]
    );
    return result.affectedRows;
};

// Link employee to user
export const linkEmployeeToUser = async (empId, userId) => {
    await pool.query(
        'UPDATE employees SET user_id = ? WHERE emp_id = ?',
        [userId, empId]
    );
};