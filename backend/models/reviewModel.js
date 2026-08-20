// Review model - handles review database operations
import pool from '../config/database.js';

// Get all reviews with employee names
// Get all reviews with employee and reviewer names
export const getAllReviews = async () => {
    const [rows] = await pool.query(
        `SELECT r.*, 
                e.first_name AS emp_first_name, 
                e.last_name AS emp_last_name, 
                u.first_name AS rev_first_name, 
                u.last_name AS rev_last_name 
         FROM performance_reviews r
         JOIN employees e ON r.emp_id = e.emp_id
         JOIN users u ON r.reviewer_id = u.user_id
         ORDER BY r.review_date DESC`
    );
    return rows;
};

// Get review by ID
export const getReviewById = async (id) => {
    const [rows] = await pool.query(
        `SELECT r.*, e.first_name, e.last_name 
         FROM performance_reviews r
         JOIN employees e ON r.emp_id = e.emp_id
         WHERE r.review_id = ?`,
        [id]
    );
    return rows[0];
};

// Get reviews by employee ID
export const getReviewsByEmployee = async (empId) => {
    const [rows] = await pool.query(
        'SELECT * FROM performance_reviews WHERE emp_id = ? ORDER BY review_date DESC',
        [empId]
    );
    return rows;
};

// Create review
export const createReview = async (reviewData) => {
    const { emp_id, reviewer_id, review_date, review_period_start, review_period_end, rating, performance_score, strengths, areas_for_improvement, goals_for_next_period, comments, status } = reviewData;
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
    return result.insertId;
};

// Update review
export const updateReview = async (id, reviewData) => {
    const { rating, performance_score, strengths, areas_for_improvement, goals_for_next_period, comments, status } = reviewData;
    const [result] = await pool.query(
        `UPDATE performance_reviews 
         SET rating = ?, performance_score = ?, strengths = ?, areas_for_improvement = ?, 
             goals_for_next_period = ?, comments = ?, status = ?
         WHERE review_id = ?`,
        [rating, performance_score || null, strengths || null, areas_for_improvement || null,
         goals_for_next_period || null, comments || null, status || 'draft', id]
    );
    return result.affectedRows;
};

// Delete review
export const deleteReview = async (id) => {
    const [result] = await pool.query(
        'DELETE FROM performance_reviews WHERE review_id = ?',
        [id]
    );
    return result.affectedRows;
};