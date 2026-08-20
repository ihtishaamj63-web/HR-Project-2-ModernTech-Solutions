// backend/middleware/auth.js
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const authMiddleware = (req, res, next) => {
    try {
        // Get token from Authorization header
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'No token provided'
            });
        }

        // Verify the token - FIX: Add fallback secret to match the auth route
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'modernTechSecretKey2026');
        req.user = decoded; // Attach user info to request
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            error: 'Invalid or expired token'
        });
    }
};

export default authMiddleware;