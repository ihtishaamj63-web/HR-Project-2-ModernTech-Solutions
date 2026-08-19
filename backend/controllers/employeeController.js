// Employee controller - handles employee request/response logic
import bcrypt from 'bcryptjs';
import * as employeeModel from '../models/employeeModel.js';
import * as authModel from '../models/authModel.js';

// GET /api/employees
export const getEmployees = async (req, res) => {
    try {
        const employees = await employeeModel.getAllEmployees();
        res.json({ success: true, data: employees });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// GET /api/employees/:id
export const getEmployee = async (req, res) => {
    try {
        const employee = await employeeModel.getEmployeeById(req.params.id);
        if (!employee) {
            return res.status(404).json({ success: false, error: 'Employee not found' });
        }
        res.json({ success: true, data: employee });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// POST /api/employees
export const addEmployee = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { first_name, last_name, email, phone, position, department, hire_date, employment_status } = req.body;

        if (!first_name || !last_name || !email || !position || !department || !hire_date) {
            connection.release();
            return res.status(400).json({
                success: false,
                error: 'All required fields must be filled'
            });
        }

        await connection.beginTransaction();

        const empId = await employeeModel.createEmployee({
            first_name,
            last_name,
            email,
            phone,
            position,
            department,
            hire_date,
            employment_status
        });

        // Create user account for employee
        const username = email;
        const tempPassword = 'password123';
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        const userId = await authModel.createUser({
            username,
            email,
            password_hash: hashedPassword,
            first_name,
            last_name,
            role: 'employee'
        });

        await employeeModel.linkEmployeeToUser(empId, userId);

        await connection.commit();
        connection.release();

        res.status(201).json({
            success: true,
            message: 'Employee added with login account',
            data: { emp_id: empId, user_id: userId }
        });
    } catch (error) {
        await connection.rollback();
        connection.release();
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                success: false,
                error: 'Email already exists'
            });
        }
        res.status(500).json({ success: false, error: 'Failed to add employee' });
    }
};

// PUT /api/employees/:id
export const updateEmployee = async (req, res) => {
    try {
        const { first_name, last_name, email, phone, position, department, employment_status } = req.body;
        const affectedRows = await employeeModel.updateEmployee(req.params.id, {
            first_name,
            last_name,
            email,
            phone,
            position,
            department,
            employment_status
        });

        if (affectedRows === 0) {
            return res.status(404).json({ success: false, error: 'Employee not found' });
        }

        res.json({ success: true, message: 'Employee updated successfully' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ success: false, error: 'Email already exists' });
        }
        res.status(500).json({ success: false, error: error.message });
    }
};

// DELETE /api/employees/:id
export const deleteEmployee = async (req, res) => {
    try {
        const affectedRows = await employeeModel.deleteEmployee(req.params.id);
        if (affectedRows === 0) {
            return res.status(404).json({ success: false, error: 'Employee not found' });
        }
        res.json({ success: true, message: 'Employee deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};