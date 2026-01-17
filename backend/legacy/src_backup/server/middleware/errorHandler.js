// Centralized error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error
  let error = {
    message: 'Internal Server Error',
    statusCode: 500
  };

  // Handle specific error types
  if (err.name === 'ValidationError') {
    error.message = 'Validation Error';
    error.statusCode = 400;
  } else if (err.name === 'UnauthorizedError') {
    error.message = 'Unauthorized';
    error.statusCode = 401;
  } else if (err.name === 'ForbiddenError') {
    error.message = 'Forbidden';
    error.statusCode = 403;
  } else if (err.name === 'NotFoundError') {
    error.message = 'Not Found';
    error.statusCode = 404;
  } else if (err.code === 'SQLITE_CONSTRAINT') {
    error.message = 'Database constraint violation';
    error.statusCode = 400;
  } else if (err.code === 'SQLITE_BUSY') {
    error.message = 'Database is busy, please try again';
    error.statusCode = 503;
  }

  // Send error response
  res.status(error.statusCode).json({
    message: error.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// 404 handler for undefined routes
const notFound = (req, res) => {
  res.status(404).json({
    message: `Route ${req.originalUrl} not found`
  });
};

module.exports = {
  errorHandler,
  notFound
};

