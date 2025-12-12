const { verifyToken } = require('../utils/jwtUtils');
const { query } = require('../config/database');

/**
 * Middleware to protect routes - checks if user is authenticated
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Check if token exists in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Not authorized. Please login first'
      });
    }

    // Verify token
    const decoded = verifyToken(token);

    // Get user from database
    const users = await query(
      'SELECT id, first_name, last_name, email, risk_appetite, balance, is_admin FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (users.length === 0) {
      return res.status(401).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Attach user to request object
    req.user = users[0];
    next();
  } catch (error) {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid or expired token'
    });
  }
};

/**
 * Middleware to restrict routes to admin only
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    // Check if user is admin
    if (roles.includes('admin') && !req.user.is_admin) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. Admin privileges required'
      });
    }

    next();
  };
};

module.exports = {
  protect,
  restrictTo
};
