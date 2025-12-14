const jwt = require('jsonwebtoken');

// Validate JWT_SECRET at module load
if (!process.env.JWT_SECRET) {
  console.error('[JWT_UTILS] Missing required JWT_SECRET environment variable');
  throw new Error('JWT_SECRET environment variable is required');
}

console.log('[JWT_UTILS] JWT utilities initialized successfully');

/**
 * Generate JWT token
 * @param {Object} payload - Token payload
 * @returns {string} JWT token
 */
const generateToken = (payload) => {
  console.log('[JWT_UTILS] Generating JWT token...');
  
  if (!payload || typeof payload !== 'object') {
    console.error('[JWT_UTILS] Invalid payload provided');
    throw new Error('Payload must be a valid object');
  }
  
  const token = jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
  
  console.log('[JWT_UTILS] JWT token generated successfully');
  return token;
};

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
const verifyToken = (token) => {
  console.log('[JWT_UTILS] Verifying JWT token...');
  
  if (!token || typeof token !== 'string') {
    console.error('[JWT_UTILS] Invalid token format');
    throw new Error('Token must be a non-empty string');
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('[JWT_UTILS] Token verified successfully');
    return decoded;
  } catch (error) {
    console.error('[JWT_UTILS] Token verification failed:', error.name);
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    }
    throw new Error('Token verification failed');
  }
};

/**
 * Decode JWT token without verification (for debugging)
 * @param {string} token - JWT token to decode
 * @returns {Object|null} Decoded token payload
 */
const decodeToken = (token) => {
  console.log('[JWT_UTILS] Decoding JWT token...');
  
  if (!token || typeof token !== 'string') {
    console.error('[JWT_UTILS] Invalid token format for decoding');
    return null;
  }
  
  const decoded = jwt.decode(token);
  console.log('[JWT_UTILS] Token decoded successfully');
  return decoded;
};

module.exports = {
  generateToken,
  verifyToken,
  decodeToken
};
