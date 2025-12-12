const userModel = require('../models/userModel');
const { hashPassword, comparePassword, checkPasswordStrength } = require('../utils/passwordUtils');
const { generateToken } = require('../utils/jwtUtils');
const { AppError } = require('../middleware/errorHandler');

/**
 * Signup - Create new user
 */
const signup = async (req, res, next) => {
  try {
    const { first_name, last_name, email, password, risk_appetite } = req.body;

    // Check password strength
    const passwordStrength = checkPasswordStrength(password);

    // Check if user already exists
    const existingUser = await userModel.findUserByEmail(email);
    if (existingUser) {
      return next(new AppError('Email already registered', 400));
    }

    // Hash password
    const password_hash = await hashPassword(password);

    // Create user
    const userId = await userModel.createUser({
      first_name,
      last_name,
      email,
      password_hash,
      risk_appetite: risk_appetite || 'moderate'
    });

    // Get created user
    const user = await userModel.findUserById(userId);

    // Generate token
    const token = generateToken({ userId: user.id, email: user.email });

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          risk_appetite: user.risk_appetite,
          balance: user.balance
        },
        token,
        passwordStrength
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login - Authenticate user
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await userModel.findUserByEmail(email);
    if (!user) {
      return next(new AppError('Invalid email or password', 401));
    }

    // Check password
    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      return next(new AppError('Invalid email or password', 401));
    }

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
          is_admin: user.is_admin
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

module.exports = {
  signup,
  login,
  checkPassword,
  requestPasswordReset,
  resetPassword,
  getProfile,
  updateProfile
};
