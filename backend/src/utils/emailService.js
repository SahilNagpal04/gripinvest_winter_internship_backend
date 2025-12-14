// Email service for sending OTPs
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Create transporter if email configured
let transporter = null;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
}

/**
 * Generate 6-digit OTP
 */
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Send OTP via email
 */
const sendOTP = async (email, otp, purpose = 'verification') => {
  // Log OTP to console
  const otpMessage = `\n📧 ========== EMAIL OTP ==========\nTo: ${email}\nPurpose: ${purpose}\nOTP Code: ${otp}\nValid for: 10 minutes\n================================\n`;
  console.error(otpMessage);
  process.stdout.write(otpMessage);

  // Send email if configured
  if (transporter) {
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: email,
        subject: `GripInvest - Your OTP for ${purpose}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">GripInvest - OTP Verification</h2>
            <p>Your OTP for ${purpose} is:</p>
            <div style="background: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: bold; color: #1f2937; letter-spacing: 5px;">${otp}</span>
            </div>
            <p style="color: #6b7280;">This OTP is valid for 10 minutes.</p>
            <p style="color: #6b7280;">If you didn't request this, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            <p style="color: #9ca3af; font-size: 12px;">© 2025 GripInvest. All rights reserved.</p>
          </div>
        `
      });
      console.error('✅ Email sent successfully\n');
    } catch (error) {
      console.error('❌ Failed to send email:', error.message);
    }
  }

  return true;
};

/**
 * Verify OTP
 */
const verifyOTP = (storedOTP, storedExpiry, providedOTP) => {
  if (!storedOTP || !storedExpiry) {
    return { valid: false, message: 'No OTP found. Please request a new one.' };
  }

  const now = new Date();
  const expiry = new Date(storedExpiry);
  
  if (now > expiry) {
    return { valid: false, message: 'OTP has expired. Please request a new one.' };
  }

  if (storedOTP.toString() !== providedOTP.toString()) {
    return { valid: false, message: 'Invalid OTP. Please try again.' };
  }

  return { valid: true, message: 'OTP verified successfully' };
};

module.exports = {
  generateOTP,
  sendOTP,
  verifyOTP
};
