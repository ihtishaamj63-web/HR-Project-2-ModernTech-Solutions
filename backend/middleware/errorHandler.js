// Global error handler
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err.message);

    // Duplicate entry error (MySQL)
    if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
            success: false,
            error: 'Duplicate entry',
            details: err.message
        });
    }

    // Foreign key error (MySQL)
    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(400).json({
            success: false,
            error: 'Invalid reference',
            details: 'Referenced record does not exist'
        });
    }

    // Default error
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: err.message
    });
};

export default errorHandler;