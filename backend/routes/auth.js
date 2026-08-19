import express from 'express';
import authMiddleware from '../middleware/auth.js';
import { login, register, changePassword } from '../controllers/authController.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.put('/change-password', authMiddleware, changePassword);

export default router;