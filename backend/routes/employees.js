import express from 'express';
import authMiddleware from '../middleware/auth.js';
import { getEmployees, getEmployee, addEmployee, updateEmployee, deleteEmployee } from '../controllers/employeeController.js';

const router = express.Router();

router.route('/')
    .get(authMiddleware, getEmployees)
    .post(authMiddleware, addEmployee);

router.route('/:id')
    .get(authMiddleware, getEmployee)
    .put(authMiddleware, updateEmployee)
    .delete(authMiddleware, deleteEmployee);

export default router;