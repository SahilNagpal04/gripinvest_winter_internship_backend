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
      if (!existingUser.email_verified) {
        const lastDeleted = await userModel.getLastDeletionTime(email);
        if (lastDeleted && (Date.now() - lastDeleted) < 3600000) {
          return next(new AppError('Please wait before trying again', 429));
        }
        await userModel.deleteUser(existingUser.id);
        console.log(`[SIGNUP] Deleted unverified account for: ${email}`);
      } else {
        return next(new AppError('Email already registered', 400));
      }
    }

    const password_hash = await hashPassword(password);
    const userId = await userModel.createUser({
      first_name,
      last_name,
      email,
      password_hash,
      risk_appetite: risk_appetite || 'moderate'
    });

    const otp = generateOTP();
    const expiryTime = new Date(Date.now() + 10 * 60 * 1000);
    await userModel.store2FAOTP(userId, otp, expiryTime);
    try {
      await sendOTP(email, otp, 'Email Verification for Signup');
    } catch (emailError) {
      await userModel.clear2FAOTP(userId);
      throw new AppError('Failed to send verification email. Please try again.', 500);
    }

    console.log(`[SIGNUP] User created successfully. UserId: ${userId}, Email: ${email}`);

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
    console.error(`[SIGNUP] Error: ${error.message}`);
    next(error);
  }
};

/**
 * Signup Step 2 - Verify OTP and complete registration
 */
const verifySignupOTP = async (req, res, next) => {
  try {
    const { userId, otp } = req.body;
    console.log(`[VERIFY_SIGNUP] Verifying OTP for userId: ${userId}`);

    const user = await userModel.findUserById(userId);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    if (user.email_verified) {
      return next(new AppError('Email already verified', 400));
    }

    const verification = verifyOTP(user.two_factor_code, user.two_factor_expires, otp);
    if (!verification.valid) {
      return next(new AppError(verification.message, 400));
    }

    await userModel.verifyEmail(userId);
    await userModel.clear2FAOTP(userId);

    const token = generateToken({ userId: user.id, email: user.email });

    console.log(`[VERIFY_SIGNUP] Email verified successfully for: ${user.email}`);

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
    console.error(`[VERIFY_SIGNUP] Error: ${error.message}`);
    next(error);
  }
};

/**
 * Login Step 1 - Verify credentials
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log(`[LOGIN] Login attempt for email: ${email}`);

    const user = await userModel.findUserByEmail(email);
    if (!user) {
      return next(new AppError('Invalid email or password', 401));
    }

    if (!user.email_verified) {
      return next(new AppError('Please verify your email first', 401));
    }

    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      return next(new AppError('Invalid email or password', 401));
    }

    if (user.two_factor_enabled) {
      const otp = generateOTP();
      const expiryTime = new Date(Date.now() + 10 * 60 * 1000);
      await userModel.store2FAOTP(user.id, otp, expiryTime);
      try {
        await sendOTP(email, otp, 'Login Verification');
      } catch (emailError) {
        await userModel.clear2FAOTP(user.id);
        throw new AppError('Failed to send verification code. Please try again.', 500);
      }

      console.log(`[LOGIN] 2FA OTP sent for: ${email}`);

      return res.status(200).json({
        status: 'success',
        message: 'OTP sent to your email',
        data: {
          userId: user.id,
          requires2FA: true
        }
      });
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
          is_admin: user.is_admin,
          two_factor_enabled: user.two_factor_enabled
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
 * Login Step 2 - Verify 2FA OTP
 */
const verifyLogin2FA = async (req, res, next) => {
  try {
    const { userId, otp } = req.body;
    console.log(`[VERIFY_LOGIN] Verifying 2FA OTP for userId: ${userId}`);

    const user = await userModel.findUserById(userId);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    const verification = verifyOTP(user.two_factor_code, user.two_factor_expires, otp);
    if (!verification.valid) {
      return next(new AppError(verification.message, 400));
    }

    await userModel.clear2FAOTP(userId);

    const token = generateToken({ userId: user.id, email: user.email });

    console.log(`[VERIFY_LOGIN] 2FA verification successful for: ${user.email}`);

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
    console.error(`[VERIFY_LOGIN] Error: ${error.message}`);
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
    console.log(`[PASSWORD_RESET] Reset requested for email: ${email}`);

    const user = await userModel.findUserByEmail(email);
    if (!user) {
      return next(new AppError('No user found with this email', 404));
    }

    const otp = generateOTP();
    const expiryTime = new Date(Date.now() + 10 * 60 * 1000);

    await userModel.storePasswordResetOTP(email, otp, expiryTime);
    try {
      await sendOTP(email, otp, 'Password Reset');
    } catch (emailError) {
      throw new AppError('Failed to send reset code. Please try again.', 500);
    }

    console.log(`[PASSWORD_RESET] OTP sent successfully to: ${email}`);

    res.status(200).json({
      status: 'success',
      message: 'OTP sent to your email',
      data: {
        expiresIn: '10 minutes'
      }
    });
  } catch (error) {
    console.error(`[PASSWORD_RESET] Error: ${error.message}`);
    next(error);
  }
};

/**
 * Reset password using OTP
 */
const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;
    console.log(`[RESET_PASSWORD] Attempting password reset for: ${email}`);

    const user = await userModel.verifyOTP(email, otp);
    if (!user) {
      return next(new AppError('Invalid or expired OTP', 400));
    }

    const passwordStrength = checkPasswordStrength(newPassword);
    if (!passwordStrength.isStrong) {
      return next(new AppError('Password is not strong enough. ' + passwordStrength.feedback.join(', '), 400));
    }

    const password_hash = await hashPassword(newPassword);
    await userModel.updatePassword(user.id, password_hash);

    console.log(`[RESET_PASSWORD] Password reset successful for: ${email}`);

    res.status(200).json({
      status: 'success',
      message: 'Password reset successful. Please login with your new password'
    });
  } catch (error) {
    console.error(`[RESET_PASSWORD] Error: ${error.message}`);
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
 * Enable 2FA for user
 */
const enable2FA = async (req, res, next) => {
  try {
    console.log(`[ENABLE_2FA] Enabling 2FA for userId: ${req.user.id}`);
    await userModel.update2FAStatus(req.user.id, true);
    console.log(`[ENABLE_2FA] 2FA enabled successfully for userId: ${req.user.id}`);

    res.status(200).json({
      status: 'success',
      message: '2FA enabled successfully'
    });
  } catch (error) {
    console.error(`[ENABLE_2FA] Error: ${error.message}`);
    next(error);
  }
};

/**
 * Disable 2FA for user
 */
const disable2FA = async (req, res, next) => {
  try {
    console.log(`[DISABLE_2FA] Disabling 2FA for userId: ${req.user.id}`);
    await userModel.update2FAStatus(req.user.id, false);
    console.log(`[DISABLE_2FA] 2FA disabled successfully for userId: ${req.user.id}`);

    res.status(200).json({
      status: 'success',
      message: '2FA disabled successfully'
    });
  } catch (error) {
    console.error(`[DISABLE_2FA] Error: ${error.message}`);
    next(error);
  }
};

/**
 * Resend OTP
 */
const resendOTP = async (req, res, next) => {
  try {
    const { userId } = req.body;
    console.log(`[RESEND_OTP] Resending OTP for userId: ${userId}`);

    if (!userId) {
      return next(new AppError('User ID is required', 400));
    }

    const user = await userModel.findUserById(userId);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    const otp = generateOTP();
    const expiryTime = new Date(Date.now() + 10 * 60 * 1000);
    await userModel.store2FAOTP(userId, otp, expiryTime);
    try {
      await sendOTP(user.email, otp, 'OTP Resend');
    } catch (emailError) {
      await userModel.clear2FAOTP(userId);
      throw new AppError('Failed to send OTP. Please try again.', 500);
    }

    console.log(`[RESEND_OTP] OTP resent successfully to: ${user.email}`);

    res.status(200).json({
      status: 'success',
      message: 'New OTP sent successfully. Previous OTP is now invalid.'
    });
  } catch (error) {
    console.error(`[RESEND_OTP] Error: ${error.message}`);
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
