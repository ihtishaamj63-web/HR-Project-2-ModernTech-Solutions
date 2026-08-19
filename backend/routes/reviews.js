// Reviews routes
import express from 'express';
import pool from '../config/database.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// GET /api/reviews - Get all reviews
router.get('/', authMiddleware, async (req, res) => {
    try {
        const [reviews] = await pool.query(
            `SELECT r.*, e.first_name, e.last_name 
             FROM performance_reviews r
             JOIN employees e ON r.emp_id = e.emp_id
             ORDER BY r.review_date DESC`
        );
        res.json({ success: true, data: reviews });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/reviews - Add new review
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { emp_id, reviewer_id, review_date, review_period_start, review_period_end, rating, performance_score, strengths, areas_for_improvement, goals_for_next_period, comments, status } = req.body;

        if (!emp_id || !reviewer_id || !review_date || !rating) {
            return res.status(400).json({
                success: false,
                error: 'emp_id, reviewer_id, review_date, and rating are required'
            });
        }

        const [result] = await pool.query(
            `INSERT INTO performance_reviews 
             (emp_id, reviewer_id, review_date, review_period_start, review_period_end, 
              rating, performance_score, strengths, areas_for_improvement, 
              goals_for_next_period, comments, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [emp_id, reviewer_id, review_date, review_period_start || null, review_period_end || null,
             rating, performance_score || null, strengths || null, areas_for_improvement || null,
             goals_for_next_period || null, comments || null, status || 'draft']
        );

        res.status(201).json({
            success: true,
            message: 'Review created successfully',
            data: { review_id: result.insertId }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// DELETE /api/reviews/:id - Delete review
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const [result] = await pool.query(
            'DELETE FROM performance_reviews WHERE review_id = ?',
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, error: 'Review not found' });
        }

        res.json({ success: true, message: 'Review deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;