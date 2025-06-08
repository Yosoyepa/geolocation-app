/**
 * Global error handling middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Default error
  let error = {
    success: false,
    message: err.message || 'Internal server error',
    status: err.status || 500
  };

  // Sequelize validation errors
  if (err.name === 'SequelizeValidationError') {
    error.status = 400;
    error.message = 'Validation error';
    error.errors = err.errors.map(e => ({
      field: e.path,
      message: e.message,
      value: e.value
    }));
  }

  // Sequelize unique constraint errors
  if (err.name === 'SequelizeUniqueConstraintError') {
    error.status = 409;
    error.message = 'Resource already exists';
    error.errors = err.errors.map(e => ({
      field: e.path,
      message: `${e.path} already exists`,
      value: e.value
    }));
  }

  // Sequelize foreign key constraint errors
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    error.status = 400;
    error.message = 'Invalid reference to related resource';
  }

  // Sequelize database connection errors
  if (err.name === 'SequelizeConnectionError') {
    error.status = 503;
    error.message = 'Database connection error';
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error.status = 401;
    error.message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    error.status = 401;
    error.message = 'Token expired';
  }

  // Cast errors (invalid ObjectId, etc.)
  if (err.name === 'CastError') {
    error.status = 400;
    error.message = 'Invalid resource ID';
  }

  // Don't send stack trace in production
  if (process.env.NODE_ENV === 'production') {
    delete error.stack;
  } else {
    error.stack = err.stack;
  }

  res.status(error.status).json(error);
};

/**
 * 404 Not Found handler
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
};

/**
 * Async error wrapper to catch async errors in route handlers
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Express middleware function
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  errorHandler,
  notFound,
  asyncHandler
};
