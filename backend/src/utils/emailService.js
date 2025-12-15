// Email service for OTP generation and console logging
const crypto = require('crypto');

/**
 * Generate 6-digit OTP
 * @returns {string} 6-digit OTP code
 */
const generateOTP = () => {
  console.log('[OTP] Generating new OTP');
  const otp = crypto.randomInt(100000, 1000000).toString();
  console.log('[OTP] OTP generated successfully');
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
  console.log(`[OTP] Sending OTP to ${email} for ${purpose}`);
  const otpMessage = `\n📧 ========== OTP CODE ==========\nTo: ${email}\nPurpose: ${purpose}\nOTP Code: ${otp}\nValid for: 10 minutes\n================================\n`;
  console.log(otpMessage);
  console.log(`[OTP] OTP sent successfully to ${email}`);
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
  console.log('[OTP] Starting OTP verification');
  
  if (!providedOTP || !/^\d{6}$/.test(providedOTP.toString())) {
    console.log('[OTP] Verification failed: Invalid format');
    return { valid: false, message: 'Please provide a valid 6-digit OTP code.' };
  }

  if (!storedOTP || !storedExpiry) {
    console.log('[OTP] Verification failed: No OTP found');
    return { valid: false, message: 'No OTP found. Please request a new one.' };
  }

  const now = new Date();
  const expiry = new Date(storedExpiry);
  
  if (now > expiry) {
    console.log('[OTP] Verification failed: OTP expired');
    return { valid: false, message: 'OTP has expired. Please request a new one.' };
  }

  if (storedOTP.toString() !== providedOTP.toString()) {
    console.log('[OTP] Verification failed: OTP mismatch');
    return { valid: false, message: 'Invalid OTP. Please try again.' };
  }

  console.log('[OTP] OTP verified successfully');
  return { valid: true, message: 'OTP verified successfully' };
};

module.exports = {
  generateOTP,
  sendOTP,
  verifyOTP
};
