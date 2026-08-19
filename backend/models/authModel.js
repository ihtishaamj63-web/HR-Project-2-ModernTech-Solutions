// Auth model - handles user database operations
import pool from '../config/database.js';
import bcrypt from 'bcryptjs';

// Find user by username
export const findUserByUsername = async (username) => {
    const [rows] = await pool.query(
        'SELECT * FROM users WHERE username = ? AND is_active = TRUE',
        [username]
    );
    return rows[0];
};

// Find user by ID
export const findUserById = async (userId) => {
    const [rows] = await pool.query(
        'SELECT * FROM users WHERE user_id = ?',
        [userId]
    );
    return rows[0];
};

// Create new user
export const createUser = async (userData) => {
    const { username, email, password_hash, first_name, last_name, role } = userData;
    const [result] = await pool.query(
        `INSERT INTO users (username, email, password_hash, first_name, last_name, role, is_active)
         VALUES (?, ?, ?, ?, ?, ?, TRUE)`,
        [username, email, password_hash, first_name, last_name, role]
    );
    return result.insertId;
};

// Update last login
export const updateLastLogin = async (userId) => {
    await pool.query(
        'UPDATE users SET last_login = NOW() WHERE user_id = ?',
        [userId]
    );
};

// Update password
export const updatePassword = async (userId, newPasswordHash) => {
    const [result] = await pool.query(
        'UPDATE users SET password_hash = ? WHERE user_id = ?',
        [newPasswordHash, userId]
    );
    return result.affectedRows;
};