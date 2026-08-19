// Review controller - handles review request/response logic
import * as reviewModel from '../models/reviewModel.js';

// GET /api/reviews
export const getReviews = async (req, res) => {
    try {
        const reviews = await reviewModel.getAllReviews();
        res.json({ success: true, data: reviews });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// POST /api/reviews
export const addReview = async (req, res) => {
    try {
        const { emp_id, reviewer_id, review_date, review_period_start, review_period_end, rating, performance_score, strengths, areas_for_improvement, goals_for_next_period, comments, status } = req.body;

        if (!emp_id || !reviewer_id || !review_date || !rating) {
            return res.status(400).json({
                success: false,
                error: 'emp_id, reviewer_id, review_date, and rating are required'
            });
        }

        const id = await reviewModel.createReview({
            emp_id,
            reviewer_id,
            review_date,
            review_period_start,
            review_period_end,
            rating,
            performance_score,
            strengths,
            areas_for_improvement,
            goals_for_next_period,
            comments,
            status
        });

        res.status(201).json({
            success: true,
            message: 'Review created successfully',
            data: { review_id: id }
        });
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