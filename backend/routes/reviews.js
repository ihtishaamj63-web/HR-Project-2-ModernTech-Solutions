import express from 'express';
import authMiddleware from '../middleware/auth.js';
import { getReviews, getReviewById, createReview, updateReview, deleteReview } from '../controllers/reviewController.js';

const router = express.Router();

router.route('/')
    .get(authMiddleware, getReviews)
    .post(authMiddleware, createReview);

router.route('/:id')
    .get(authMiddleware, getReviewById)
    .put(authMiddleware, updateReview)
    .delete(authMiddleware, deleteReview);

export default router;