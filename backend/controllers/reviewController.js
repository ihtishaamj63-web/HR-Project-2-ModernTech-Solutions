// Review controller - handles review request/response logic
import pool from '../config/database.js';
import * as reviewModel from '../models/reviewModel.js';

// GET /api/reviews
export const getReviews = async (req, res) => {
    try {
        let reviews;
        
        if (req.user.role === 'employee') {
            const [empRows] = await pool.query('SELECT emp_id FROM employees WHERE email = ?', [req.user.email]);
            const empId = empRows[0]?.emp_id;
            if (empId) {
                reviews = await reviewModel.getReviewsByEmployee(empId);
            } else {
                reviews = [];
            }
        } else {
            reviews = await reviewModel.getAllReviews();
        }

        res.json({ success: true, data: reviews });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// GET /api/reviews/:id
export const getReviewById = async (req, res) => {
    try {
        const review = await reviewModel.getReviewById(req.params.id);
        if (!review) {
            return res.status(404).json({ success: false, error: 'Review not found' });
        }
        res.json({ success: true, data: review });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// POST /api/reviews
export const createReview = async (req, res) => {
    try {
        const { emp_id, reviewer_id, review_date, review_period_start, review_period_end, rating, performance_score, strengths, areas_for_improvement, goals_for_next_period, comments, status } = req.body;

        if (!emp_id || !reviewer_id || !review_date || !rating) {
            return res.status(400).json({ success: false, error: 'emp_id, reviewer_id, review_date, and rating are required' });
        }

        // Strict validation for text fields
        const cleanStr = (str) => str ? str.trim() : '';
        
        if (cleanStr(strengths).length < 10) {
            return res.status(400).json({ success: false, error: 'Strengths must be at least 10 characters long.' });
        }
        if (cleanStr(areas_for_improvement).length < 10) {
            return res.status(400).json({ success: false, error: 'Areas for Improvement must be at least 10 characters long.' });
        }
        if (cleanStr(goals_for_next_period).length < 10) {
            return res.status(400).json({ success: false, error: 'Goals for Next Period must be at least 10 characters long.' });
        }
        if (cleanStr(comments).length < 10) {
            return res.status(400).json({ success: false, error: 'Comments must be at least 10 characters long.' });
        }

        const id = await reviewModel.createReview({
            emp_id, reviewer_id, review_date, review_period_start, review_period_end,
            rating, performance_score, 
            strengths: cleanStr(strengths), 
            areas_for_improvement: cleanStr(areas_for_improvement), 
            goals_for_next_period: cleanStr(goals_for_next_period), 
            comments: cleanStr(comments), 
            status
        });

        res.status(201).json({ success: true, message: 'Review created successfully', data: { review_id: id } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// PUT /api/reviews/:id
export const updateReview = async (req, res) => {
    try {
        const { rating, performance_score, strengths, areas_for_improvement, goals_for_next_period, comments, status } = req.body;
        const affectedRows = await reviewModel.updateReview(req.params.id, {
            rating, performance_score, strengths, areas_for_improvement, goals_for_next_period, comments, status
        });

        if (affectedRows === 0) {
            return res.status(404).json({ success: false, error: 'Review not found' });
        }
        res.json({ success: true, message: 'Review updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// DELETE /api/reviews/:id
export const deleteReview = async (req, res) => {
    try {
        const affectedRows = await reviewModel.deleteReview(req.params.id);
        if (affectedRows === 0) {
            return res.status(404).json({ success: false, error: 'Review not found' });
        }
        res.json({ success: true, message: 'Review deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};