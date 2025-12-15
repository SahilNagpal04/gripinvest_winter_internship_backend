const bcrypt = require('bcryptjs');

/**
 * Hash a plain text password
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
const hashPassword = async (password) => {
  console.log('[PASSWORD] Hashing password');
  
  if (!password || typeof password !== 'string') {
    console.error('[PASSWORD] Hashing failed: Invalid password');
    throw new Error('Password must be a non-empty string');
  }
  
  const salt = await bcrypt.genSalt(12);
  const hash = await bcrypt.hash(password, salt);
  
  console.log('[PASSWORD] Password hashed successfully');
  return hash;
};

/**
 * Compare plain text password with hashed password
 * @param {string} plainPassword - Plain text password
 * @param {string} hashedPassword - Hashed password
 * @returns {Promise<boolean>} Match result
 */
const comparePassword = async (plainPassword, hashedPassword) => {
  console.log('[PASSWORD] Comparing password');
  
  if (!plainPassword || typeof plainPassword !== 'string') {
    console.error('[PASSWORD] Comparison failed: Invalid plain password');
    throw new Error('Plain password must be a non-empty string');
  }
  if (!hashedPassword || typeof hashedPassword !== 'string') {
    console.error('[PASSWORD] Comparison failed: Invalid hashed password');
    throw new Error('Hashed password must be a non-empty string');
  }
  
  const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
  console.log('[PASSWORD] Password comparison completed:', isMatch ? 'Match' : 'No match');
  return isMatch;
};

/**
 * Check password strength and give AI suggestions
 * @param {string} password - Password to check
 * @returns {Object} Password strength analysis
 */
const checkPasswordStrength = (password) => {
  console.log('[PASSWORD] Checking password strength');
  
  if (!password || typeof password !== 'string') {
    console.log('[PASSWORD] Strength check: weak (no password)');
    return {
      score: 0,
      level: 'weak',
      feedback: ['Password is required'],
      isStrong: false
    };
  }
  
  const strength = {
    score: 0,
    feedback: [],
    isStrong: false
  };

  // Length check
  if (password.length >= 8) {
    strength.score += 25;
  } else {
    strength.feedback.push('Password should be at least 8 characters long');
  }

  // Uppercase check
  if (/[A-Z]/.test(password)) {
    strength.score += 25;
  } else {
    strength.feedback.push('Add uppercase letters (A-Z)');
  }

  // Lowercase check
  if (/[a-z]/.test(password)) {
    strength.score += 25;
  } else {
    strength.feedback.push('Add lowercase letters (a-z)');
  }

  // Number check
  if (/[0-9]/.test(password)) {
    strength.score += 15;
  } else {
    strength.feedback.push('Add numbers (0-9)');
  }

  // Special character check
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    strength.score += 10;
  } else {
    strength.feedback.push('Add special characters (!@#$%^&*)');
  }

  // Determine strength level
  if (strength.score >= 80) {
    strength.level = 'strong';
    strength.isStrong = true;
    strength.feedback = ['Great! Your password is strong'];
  } else if (strength.score >= 60) {
    strength.level = 'moderate';
  } else {
    strength.level = 'weak';
  }

  console.log('[PASSWORD] Strength check completed:', strength.level, `(${strength.score}/100)`);
  return strength;
};

module.exports = {
  hashPassword,
  comparePassword,
  checkPasswordStrength
};
