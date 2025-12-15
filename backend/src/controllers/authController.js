const userModel = require('../models/userModel');
const { hashPassword, comparePassword, checkPasswordStrength } = require('../utils/passwordUtils');
const { generateToken } = require('../utils/jwtUtils');
const { AppError } = require('../middleware/errorHandler');
const { generateOTP, sendOTP, verifyOTP } = require('../utils/emailService');

/**
 * Signup - Create user directly
 */
const signup = async (req, res, next) => {
  try {
    const { first_name, last_name, email, password, risk_appetite } = req.body;
    console.log(`[SIGNUP] Attempting signup for email: ${email}`);

    const validRiskLevels = ['low', 'moderate', 'high'];
    if (risk_appetite && !validRiskLevels.includes(risk_appetite)) {
      return next(new AppError('Invalid risk appetite. Must be low, moderate, or high', 400));
    }

    const passwordStrength = checkPasswordStrength(password);
    if (!passwordStrength.isStrong) {
      return next(new AppError('Password is not strong enough. ' + passwordStrength.feedback.join(', '), 400));
    }

    const existingUser = await userModel.findUserByEmail(email);
    if (existingUser) {
      return next(new AppError('Email already registered', 400));
    }

    const password_hash = await hashPassword(password);
    const userId = await userModel.createUser({
      first_name,
      last_name,
      email,
      password_hash,
      risk_appetite: risk_appetite || 'moderate'
    });

    // Email verified on signup

    const user = await userModel.findUserById(userId);
    const token = generateToken({ userId: user.id, email: user.email });

    console.log(`[SIGNUP] User created successfully. UserId: ${userId}, Email: ${email}`);

    res.status(201).json({
      status: 'success',
      message: 'Signup successful',
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
    console.error(`[SIGNUP] Error: ${error.message}`);
    next(error);
  }
};

/**
 * Verify Signup OTP - Deprecated (kept for backward compatibility)
 */
const verifySignupOTP = async (req, res, next) => {
  try {
    return next(new AppError('OTP verification is no longer required', 400));
  } catch (error) {
    next(error);
  }
};

/**
 * Login - Verify credentials and return token
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log(`[LOGIN] Login attempt for email: ${email}`);

    const user = await userModel.findUserByEmail(email);
    if (!user) {
      return next(new AppError('Invalid email or password', 401));
    }

    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      return next(new AppError('Invalid email or password', 401));
    }

    const token = generateToken({ userId: user.id, email: user.email });

    console.log(`[LOGIN] Login successful for: ${email}`);

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
    console.error(`[LOGIN] Error: ${error.message}`);
    next(error);
  }
};

/**
 * Verify Login 2FA - Deprecated (kept for backward compatibility)
 */
const verifyLogin2FA = async (req, res, next) => {
  try {
    return next(new AppError('2FA verification is no longer required', 400));
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
 * Request password reset - Deprecated (kept for backward compatibility)
 */
const requestPasswordReset = async (req, res, next) => {
  try {
    return next(new AppError('Nope! Try remembering your password instead 🧠', 400));
  } catch (error) {
    next(error);
  }
};

/**
 * Reset password - Deprecated (kept for backward compatibility)
 */
const resetPassword = async (req, res, next) => {
  try {
    return next(new AppError('Nope! Try remembering your password instead 🧠', 400));
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

    if (!user) {
      return next(new AppError('User not found', 404));
    }

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
    console.log(`[UPDATE_PROFILE] Updating profile for userId: ${req.user.id}`);

    if (risk_appetite) {
      const validRiskLevels = ['low', 'moderate', 'high'];
      if (!validRiskLevels.includes(risk_appetite)) {
        return next(new AppError('Invalid risk appetite. Must be low, moderate, or high', 400));
      }
    }

    const updateData = {};
    if (first_name) updateData.first_name = first_name;
    if (last_name) updateData.last_name = last_name;
    if (risk_appetite) updateData.risk_appetite = risk_appetite;

    const updatedUser = await userModel.updateUser(req.user.id, updateData);

    console.log(`[UPDATE_PROFILE] Profile updated successfully for userId: ${req.user.id}`);

    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: {
        user: updatedUser
      }
    });
  } catch (error) {
    console.error(`[UPDATE_PROFILE] Error: ${error.message}`);
    next(error);
  }
};

/**
 * Resend OTP - Deprecated (kept for backward compatibility)
 */
const resendOTP = async (req, res, next) => {
  try {
    return next(new AppError('OTP functionality is no longer supported', 400));
  } catch (error) {
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
  resendOTP
};
