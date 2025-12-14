const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { 
  signupValidation, 
  loginValidation, 
  resetPasswordRequestValidation,
  resetPasswordValidation,
  validate 
} = require('../utils/validators');

// Public routes
router.post('/signup', signupValidation, validate, authController.signup);
router.post('/verify-signup', authController.verifySignupOTP);
router.post('/login', loginValidation, validate, authController.login);
router.post('/verify-login', authController.verifyLogin2FA);
router.post('/resend-otp', authController.resendOTP);
router.post('/check-password', authController.checkPassword);
router.post('/request-password-reset', resetPasswordRequestValidation, validate, authController.requestPasswordReset);
router.post('/reset-password', resetPasswordValidation, validate, authController.resetPassword);

// Protected routes
router.get('/profile', protect, authController.getProfile);
router.put('/profile', protect, authController.updateProfile);
router.post('/enable-2fa', protect, authController.enable2FA);
router.post('/disable-2fa', protect, authController.disable2FA);

module.exports = router;
