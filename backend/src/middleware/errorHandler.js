console.log('[ERROR_HANDLER] Error handling middleware initialized');

/**
 * Custom error class for API errors
 * @class AppError
 * @extends Error
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Handle MySQL duplicate entry errors
 * @param {Error} err - MySQL error object
 * @returns {AppError} Formatted error
 */
const handleDuplicateFieldsDB = (err) => {
  console.log('[ERROR_HANDLER] Handling duplicate entry error');
  const match = err.message.match(/'([^']+)'/);
  const field = match ? match[0] : 'unknown field';
  const message = `Duplicate field value: ${field}. Please use another value`;
  return new AppError(message, 400);
};

/**
 * Handle MySQL validation errors
 * @param {Error} err - Validation error object
 * @returns {AppError} Formatted error
 */
const handleValidationErrorDB = (err) => {
  console.log('[ERROR_HANDLER] Handling validation error');
  const message = `Invalid input data: ${err.message}`;
  return new AppError(message, 400);
};

/**
 * Handle JWT errors
 * @returns {AppError} JWT error
 */
const handleJWTError = () => {
  console.log('[ERROR_HANDLER] Handling JWT error');
  return new AppError('Invalid token. Please log in again', 401);
};

/**
 * Handle JWT expired errors
 * @returns {AppError} JWT expired error
 */
const handleJWTExpiredError = () => {
  console.log('[ERROR_HANDLER] Handling JWT expired error');
  return new AppError('Your token has expired. Please log in again', 401);
};

/**
 * Send error response in development
 * @param {Error} err - Error object
 * @param {Object} res - Express response object
 */
const sendErrorDev = (err, res) => {
  console.log('[ERROR_HANDLER] Sending development error response');
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

/**
 * Send error response in production
 * @param {Error} err - Error object
 * @param {Object} res - Express response object
 */
const sendErrorProd = (err, res) => {
  console.log('[ERROR_HANDLER] Sending production error response');
  
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } else {
    // Programming or unknown error: don't leak error details
    console.error('[ERROR_HANDLER] Unexpected error occurred:', err);
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong'
    });
  }
};

/**
 * Global error handling middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 */
const errorHandler = (err, req, res, next) => {
  console.log('[ERROR_HANDLER] Processing error:', err.name || 'Unknown');
  
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  
  console.log('[ERROR_HANDLER] Error status code:', err.statusCode);

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = err;

    if (err.code === 'ER_DUP_ENTRY') error = handleDuplicateFieldsDB(err);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(err);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
  
  console.log('[ERROR_HANDLER] Error response sent');
};

module.exports = {
  AppError,
  errorHandler
};
