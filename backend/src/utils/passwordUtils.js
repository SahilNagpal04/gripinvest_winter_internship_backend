const bcrypt = require('bcryptjs');

/**
 * Hash a plain text password
 */
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

/**
 * Compare plain text password with hashed password
 */
const comparePassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

/**
 * Check password strength and give AI suggestions
 */
const checkPasswordStrength = (password) => {
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

  return strength;
};

module.exports = {
  hashPassword,
  comparePassword,
  checkPasswordStrength
};
