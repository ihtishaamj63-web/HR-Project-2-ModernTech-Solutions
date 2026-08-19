// Auth controller - handles login and register logic
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import * as authModel from '../models/authModel.js';

dotenv.config();

// POST /api/auth/login
export const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ success: false, error: 'Username and password required' });
        }

        const user = await authModel.findUserByUsername(username);

        if (!user) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        const isValid = await bcrypt.compare(password, user.password_hash);

        if (!isValid) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        await authModel.updateLastLogin(user.user_id);

        const token = jwt.sign(
            { user_id: user.user_id, username: user.username, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'modernTechSecretKey2026',
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            data: {
                token,
                user: {
                    user_id: user.user_id,
                    username: user.username,
                    email: user.email,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    role: user.role
                }
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, error: 'Server error during login' });
    }
};

// POST /api/auth/register
export const register = async (req, res) => {
    try {
        const { username, email, password, first_name, last_name, role } = req.body;

        if (!username || !email || !password || !first_name || !last_name || !role) {
            return res.status(400).json({ success: false, error: 'All fields are required' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const userId = await authModel.createUser({
            username, email, password_hash: hashedPassword, first_name, last_name, role
        });

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: { user_id: userId }
        });
    } catch (error) {
        console.error('Registration error:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ success: false, error: 'Username or email already exists' });
        }
        res.status(500).json({ success: false, error: 'Server error during registration' });
    }
};

// PUT /api/auth/change-password
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.user_id; 

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, error: 'Current and new passwords are required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ success: false, error: 'New password must be at least 6 characters long' });
        }

        const [users] = await pool.query('SELECT * FROM users WHERE user_id = ?', [userId]);
        if (users.length === 0) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        const user = users[0];

        const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Current password is incorrect' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await pool.query('UPDATE users SET password_hash = ? WHERE user_id = ?', [hashedPassword, userId]);

        res.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ success: false, error: 'Server error during password change' });
    }
};