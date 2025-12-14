// Email service for OTP generation and console logging
const crypto = require('crypto');

console.log('[EMAIL_SERVICE] Email service initialized (console-only mode)');

/**
 * Generate 6-digit OTP
 * @returns {string} 6-digit OTP code
 */
const generateOTP = () => {
  console.log('[EMAIL_SERVICE] Generating OTP...');
  const otp = crypto.randomInt(100000, 999999).toString();
  console.log('[EMAIL_SERVICE] OTP generated successfully');
  return otp;
};

/**
 * Send OTP via console (email functionality removed)
 * @param {string} email - Recipient email
 * @param {string} otp - OTP code
 * @param {string} purpose - Purpose of OTP
 * @returns {Promise<boolean>} Always returns true
 */
const sendOTP = async (email, otp, purpose = 'verification') => {
  console.log('[EMAIL_SERVICE] Sending OTP to console...');
  
  const otpMessage = `\n📧 ========== OTP CODE ==========\nTo: ${email}\nPurpose: ${purpose}\nOTP Code: ${otp}\nValid for: 10 minutes\n================================\n`;
  console.log(otpMessage);
  
  console.log('[EMAIL_SERVICE] OTP logged to console successfully');
  return true;
};

/**
 * Verify OTP
 * @param {string} storedOTP - Stored OTP from database
 * @param {Date} storedExpiry - OTP expiry timestamp
 * @param {string} providedOTP - OTP provided by user
 * @returns {Object} Verification result with valid flag and message
 */
const verifyOTP = (storedOTP, storedExpiry, providedOTP) => {
  console.log('[EMAIL_SERVICE] Verifying OTP...');
  if (!storedOTP || !storedExpiry) {
    console.log('[EMAIL_SERVICE] OTP verification failed: No OTP found');
    return { valid: false, message: 'No OTP found. Please request a new one.' };
  }

  const now = new Date();
  const expiry = new Date(storedExpiry);
  
  if (now > expiry) {
    console.log('[EMAIL_SERVICE] OTP verification failed: Expired');
    return { valid: false, message: 'OTP has expired. Please request a new one.' };
  }

  if (storedOTP.toString() !== providedOTP.toString()) {
    console.log('[EMAIL_SERVICE] OTP verification failed: Invalid code');
    return { valid: false, message: 'Invalid OTP. Please try again.' };
  }

  console.log('[EMAIL_SERVICE] OTP verified successfully');
  return { valid: true, message: 'OTP verified successfully' };
};

module.exports = {
  generateOTP,
  sendOTP,
  verifyOTP
};
