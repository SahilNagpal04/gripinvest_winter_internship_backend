const { verifyToken } = require('../utils/jwtUtils');
const { query } = require('../config/database');

console.log('[AUTH_MIDDLEWARE] Authentication middleware initialized');

/**
 * Middleware to protect routes - checks if user is authenticated
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 */
const protect = async (req, res, next) => {
  console.log('[AUTH_MIDDLEWARE] Authenticating request...');
  
  try {
    let token;

    // Check if token exists in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      console.log('[AUTH_MIDDLEWARE] No token provided');
      return res.status(401).json({
        status: 'error',
        message: 'Not authorized. Please login first'
      });
    }

    // Verify token
    const decoded = verifyToken(token);

    // Validate decoded token structure
    if (!decoded || !decoded.userId) {
      console.log('[AUTH_MIDDLEWARE] Invalid token payload');
      return res.status(401).json({
        status: 'error',
        message: 'Invalid token payload'
      });
    }

    // Get user from database
    console.log('[AUTH_MIDDLEWARE] Fetching user from database...');
    const users = await query(
      'SELECT id, first_name, last_name, email, risk_appetite, balance, is_admin FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (users.length === 0) {
      console.log('[AUTH_MIDDLEWARE] User not found in database');
      return res.status(401).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Attach user to request object
    req.user = users[0];
    console.log('[AUTH_MIDDLEWARE] Authentication successful');
    next();
  } catch (error) {
    console.error('[AUTH_MIDDLEWARE] Authentication failed:', error.message);
    
    // Differentiate between token and database errors
    const message = error.message.includes('Token') || error.message.includes('token') 
      ? error.message 
      : 'Authentication failed';
    
    return res.status(401).json({
      status: 'error',
      message
    });
  }
};

/**
 * Middleware to restrict routes to admin only
 * @param {...string} roles - Allowed roles
 * @returns {Function} Express middleware function
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    console.log('[AUTH_MIDDLEWARE] Checking role permissions...');
    
    // Check if user is admin
    if (roles.includes('admin') && !req.user.is_admin) {
      console.log('[AUTH_MIDDLEWARE] Access denied: Admin privileges required');
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. Admin privileges required'
      });
    }

    console.log('[AUTH_MIDDLEWARE] Role check passed');
    next();
  };
};

module.exports = {
  protect,
  restrictTo
};
