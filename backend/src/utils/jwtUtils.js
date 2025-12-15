const jwt = require('jsonwebtoken');

// Validate JWT_SECRET at module load
if (!process.env.JWT_SECRET) {
  console.error('[JWT_UTILS] Missing required JWT_SECRET environment variable');
  throw new Error('JWT_SECRET environment variable is required');
}

/**
 * Generate JWT token
 * @param {Object} payload - Token payload
 * @returns {string} JWT token
 */
const generateToken = (payload) => {
  console.log('[JWT] Generating token for user:', payload.id);
  
  if (!payload || typeof payload !== 'object') {
    console.error('[JWT] Token generation failed: Invalid payload');
    throw new Error('Payload must be a valid object');
  }
  
  const token = jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
  
  console.log('[JWT] Token generated successfully for user:', payload.id);
  return token;
};

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
const verifyToken = (token) => {
  console.log('[JWT] Verifying token');
  
  if (!token || typeof token !== 'string') {
    console.error('[JWT] Verification failed: Invalid token format');
    throw new Error('Token must be a non-empty string');
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('[JWT] Token verified successfully for user:', decoded.id);
    return decoded;
  } catch (error) {
    console.error('[JWT] Verification failed:', error.name);
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    }
    throw new Error(`Token verification failed: ${error.message}`);
  }
};

/**
 * Decode JWT token without verification (for debugging)
 * @param {string} token - JWT token to decode
 * @returns {Object|null} Decoded token payload
 */
const decodeToken = (token) => {
  if (!token || typeof token !== 'string') {
    return null;
  }
  
  const decoded = jwt.decode(token);
  return decoded;
};

module.exports = {
  generateToken,
  verifyToken,
  decodeToken
};
