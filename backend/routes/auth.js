// Import packages for auth
import express from 'express';
import bcrypt from 'bcryptjs'; // Hash passwords
import jwt from 'jsonwebtoken'; // Create tokens
import pool from '../config/database.js'; // DB connection
import dotenv from 'dotenv';

dotenv.config(); // Load .env variables

const router = express.Router();

// POST /api/auth/login - User logs in
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if fields are empty
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                error: 'Username and password required'
            });
        }

        // Find user in database
        const [users] = await pool.query(
            'SELECT * FROM users WHERE username = ? AND is_active = TRUE',
            [username]
        );

        // No user found
        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        const user = users[0];

        // Check if password matches the hash
        const isValid = await bcrypt.compare(password, user.password_hash);

        // Password wrong
        if (!isValid) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        // Create JWT token with user info
        const token = jwt.sign(
            {
                user_id: user.user_id,
                username: user.username,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Send token and user data
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
        res.status(500).json({
            success: false,
            error: 'Server error during login'
        });
    }
});

// POST /api/auth/register - Create new user account
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, first_name, last_name, role } = req.body;

        // Make sure all fields are filled
        if (!username || !email || !password || !first_name || !last_name || !role) {
            return res.status(400).json({
                success: false,
                error: 'All fields are required'
            });
        }

        // Turn password into a hash
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save user to database
        const [result] = await pool.query(
            `INSERT INTO users (username, email, password_hash, first_name, last_name, role, is_active)
             VALUES (?, ?, ?, ?, ?, ?, TRUE)`,
            [username, email, hashedPassword, first_name, last_name, role]
        );

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: { user_id: result.insertId }
        });
    } catch (error) {
        console.error('Registration error:', error);

        // Check if username or email already exists
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                success: false,
                error: 'Username or email already exists'
            });
        }

        res.status(500).json({
            success: false,
            error: 'Server error during registration'
        });
    }
});

export default router;