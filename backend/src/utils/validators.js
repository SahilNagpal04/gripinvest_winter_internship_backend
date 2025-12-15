const { body, param, query, validationResult } = require('express-validator');

/**
 * Validate request and return errors if any
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 */
const validate = (req, res, next) => {
  console.log('[VALIDATION] Validating request:', req.method, req.path);
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('[VALIDATION] Validation failed:', errors.array().length, 'error(s)');
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  
  console.log('[VALIDATION] Validation passed');
  next();
};

/**
 * Reusable password validation rules
 */
const passwordValidationRules = [
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number')
    .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Password must contain at least one special character')
];

/**
 * Validation rules for user signup
 */
const signupValidation = [
  body('first_name')
    .trim()
    .notEmpty().withMessage('First name is required')
    .isLength({ min: 2, max: 100 }).withMessage('First name must be at least 2 characters'),
  
  body('last_name')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 }).withMessage('Last name must be less than 100 characters'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  
  ...passwordValidationRules,
  
  body('risk_appetite')
    .optional()
    .isIn(['low', 'moderate', 'high']).withMessage('Risk appetite must be low, moderate, or high')
];

/**
 * Validation rules for user login
 */
const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required')
];

/**
 * Validation rules for password reset request
 */
const resetPasswordRequestValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail()
];

/**
 * Validation rules for password reset
 */
const resetPasswordValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  
  body('otp')
    .notEmpty().withMessage('OTP is required')
    .matches(/^\d{6}$/).withMessage('OTP must be exactly 6 numeric digits'),
  
  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number')
    .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Password must contain at least one special character')
];

/**
 * Validation rules for creating investment
 */
const createInvestmentValidation = [
  body('product_id')
    .notEmpty().withMessage('Product ID is required')
    .isString().withMessage('Product ID must be a valid identifier'),
  
  body('amount')
    .notEmpty().withMessage('Amount is required')
    .isFloat({ min: 1 }).withMessage('Amount must be at least 1')
];

module.exports = {
  validate,
  passwordValidationRules,
  signupValidation,
  loginValidation,
  resetPasswordRequestValidation,
  resetPasswordValidation,
  createInvestmentValidation
};
