const userModel = require('../models/userModel');
const { hashPassword, comparePassword, checkPasswordStrength } = require('../utils/passwordUtils');
const { generateToken } = require('../utils/jwtUtils');
const { AppError } = require('../middleware/errorHandler');
const { generateOTP, sendOTP, verifyOTP } = require('../utils/emailService');

/**
 * Signup Step 1 - Create user and send OTP
 */
const signup = async (req, res, next) => {
  try {
    const { first_name, last_name, email, password, risk_appetite } = req.body;

    // Check password strength
    const passwordStrength = checkPasswordStrength(password);
    if (!passwordStrength.isStrong) {
      return next(new AppError('Password is not strong enough. ' + passwordStrength.feedback.join(', '), 400));
    }

    // Check if user already exists
    const existingUser = await userModel.findUserByEmail(email);
    if (existingUser) {
      // If email not verified, delete the old unverified account
      if (!existingUser.email_verified) {
        await userModel.deleteUser(existingUser.id);
      } else {
        return next(new AppError('Email already registered', 400));
      }
    }

    // Hash password
    const password_hash = await hashPassword(password);

    // Create user (email_verified = false)
    const userId = await userModel.createUser({
      first_name,
      last_name,
      email,
      password_hash,
      risk_appetite: risk_appetite || 'moderate'
    });

    // Generate and send OTP
    const otp = generateOTP();
    const expiryTime = new Date(Date.now() + 10 * 60 * 1000);
    await userModel.store2FAOTP(userId, otp, expiryTime);
    await sendOTP(email, otp, 'Email Verification for Signup');

    res.status(201).json({
      status: 'success',
      message: 'OTP sent to your email. Please verify to complete signup.',
      data: {
        userId,
        email,
        requiresVerification: true
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Signup Step 2 - Verify OTP and complete registration
 */
const verifySignupOTP = async (req, res, next) => {
  try {
    const { userId, otp } = req.body;

    console.log('\n=== OTP Verification Debug ===');
    console.log('Received userId:', userId);
    console.log('Received OTP:', otp, 'Type:', typeof otp);

    // Get user
    const user = await userModel.findUserById(userId);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    console.log('Stored OTP:', user.two_factor_code, 'Type:', typeof user.two_factor_code);
    console.log('Stored Expiry:', user.two_factor_expires);
    console.log('Is Expired:', new Date() > new Date(user.two_factor_expires));

    if (user.email_verified) {
      return next(new AppError('Email already verified', 400));
    }

    // Verify OTP
    const verification = verifyOTP(user.two_factor_code, user.two_factor_expires, otp);
    console.log('Verification result:', verification);
    if (!verification.valid) {
      return next(new AppError(verification.message, 400));
    }

    // Mark email as verified
    await userModel.verifyEmail(userId);

    // Generate token
    const token = generateToken({ userId: user.id, email: user.email });

    res.status(200).json({
      status: 'success',
      message: 'Email verified successfully. Registration complete!',
      data: {
        user: {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          risk_appetite: user.risk_appetite,
          balance: user.balance
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login Step 1 - Verify credentials
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await userModel.findUserByEmail(email);
    if (!user) {
      return next(new AppError('Invalid email or password', 401));
    }

    // Check if email is verified
    if (!user.email_verified) {
      return next(new AppError('Please verify your email first', 401));
    }

    // Check password
    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      return next(new AppError('Invalid email or password', 401));
    }

    // If 2FA is enabled, send OTP
    if (user.two_factor_enabled) {
      const otp = generateOTP();
      const expiryTime = new Date(Date.now() + 10 * 60 * 1000);
      await userModel.store2FAOTP(user.id, otp, expiryTime);
      await sendOTP(email, otp, 'Login Verification');

      return res.status(200).json({
        status: 'success',
        message: 'OTP sent to your email',
        data: {
          userId: user.id,
          requires2FA: true
        }
      });
    }

    // No 2FA - direct login
    const token = generateToken({ userId: user.id, email: user.email });

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          risk_appetite: user.risk_appetite,
          balance: user.balance,
          is_admin: user.is_admin,
          two_factor_enabled: user.two_factor_enabled
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login Step 2 - Verify 2FA OTP
 */
const verifyLogin2FA = async (req, res, next) => {
  try {
    const { userId, otp } = req.body;

    // Get user
    const user = await userModel.findUserById(userId);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Verify OTP
    const verification = verifyOTP(user.two_factor_code, user.two_factor_expires, otp);
    if (!verification.valid) {
      return next(new AppError(verification.message, 400));
    }

    // Clear OTP
    await userModel.clear2FAOTP(userId);

    // Generate token
    const token = generateToken({ userId: user.id, email: user.email });

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          risk_appetite: user.risk_appetite,
          balance: user.balance,
          is_admin: user.is_admin,
          two_factor_enabled: user.two_factor_enabled
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Check password strength
 */
const checkPassword = async (req, res, next) => {
  try {
    const { password } = req.body;

    if (!password) {
      return next(new AppError('Password is required', 400));
    }

    const strength = checkPasswordStrength(password);

    res.status(200).json({
      status: 'success',
      data: {
        strength
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Request password reset - Generate OTP
 */
const requestPasswordReset = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Find user
    const user = await userModel.findUserByEmail(email);
    if (!user) {
      return next(new AppError('No user found with this email', 404));
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Set OTP expiry (10 minutes from now)
    const expiryTime = new Date(Date.now() + 10 * 60 * 1000);

    // Store OTP
    await userModel.storePasswordResetOTP(email, otp, expiryTime);

    // In production, send OTP via email
    // For now, we'll return it in response (NOT SECURE - only for development)
    res.status(200).json({
      status: 'success',
      message: 'OTP sent to your email',
      data: {
        otp: process.env.NODE_ENV === 'development' ? otp : undefined,
        expiresIn: '10 minutes'
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset password using OTP
 */
const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;

    // Verify OTP
    const user = await userModel.verifyOTP(email, otp);
    if (!user) {
      return next(new AppError('Invalid or expired OTP', 400));
    }

    // Check new password strength
    const passwordStrength = checkPasswordStrength(newPassword);
    if (!passwordStrength.isStrong) {
      return next(new AppError('Password is not strong enough. ' + passwordStrength.feedback.join(', '), 400));
    }

    // Hash new password
    const password_hash = await hashPassword(newPassword);

    // Update password
    await userModel.updatePassword(user.id, password_hash);

    res.status(200).json({
      status: 'success',
      message: 'Password reset successful. Please login with your new password'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user profile
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await userModel.findUserById(req.user.id);

    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const { first_name, last_name, risk_appetite } = req.body;

    const updateData = {};
    if (first_name) updateData.first_name = first_name;
    if (last_name) updateData.last_name = last_name;
    if (risk_appetite) updateData.risk_appetite = risk_appetite;

    const updatedUser = await userModel.updateUser(req.user.id, updateData);

    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: {
        user: updatedUser
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Enable 2FA for user
 */
const enable2FA = async (req, res, next) => {
  try {
    await userModel.update2FAStatus(req.user.id, true);

    res.status(200).json({
      status: 'success',
      message: '2FA enabled successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Disable 2FA for user
 */
const disable2FA = async (req, res, next) => {
  try {
    await userModel.update2FAStatus(req.user.id, false);

    res.status(200).json({
      status: 'success',
      message: '2FA disabled successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Resend OTP
 */
const resendOTP = async (req, res, next) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return next(new AppError('User ID is required', 400));
    }

    const user = await userModel.findUserById(userId);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Generate and send new OTP (this overwrites the old one)
    const otp = generateOTP();
    const expiryTime = new Date(Date.now() + 10 * 60 * 1000);
    await userModel.store2FAOTP(userId, otp, expiryTime);
    await sendOTP(user.email, otp, 'OTP Resend');

    res.status(200).json({
      status: 'success',
      message: 'New OTP sent successfully. Previous OTP is now invalid.'
    });
  } catch (error) {
    console.error('Resend OTP Error:', error);
    next(error);
  }
};

module.exports = {
  signup,
  verifySignupOTP,
  login,
  verifyLogin2FA,
  checkPassword,
  requestPasswordReset,
  resetPassword,
  getProfile,
  updateProfile,
  enable2FA,
  disable2FA,
  resendOTP
};
