const { body, param, query, validationResult } = require('express-validator');

/**
 * Validate request and return errors if any
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

/**
 * Validation rules for user signup
 */
const signupValidation = [
  body('first_name')
    .trim()
    .notEmpty().withMessage('First name is required')
    .isLength({ min: 4, max: 100 }).withMessage('First name must be at least 4 characters'),
  
  body('last_name')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 }).withMessage('Last name must be less than 100 characters'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number'),
  
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
    .isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  
  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
];

/**
 * Validation rules for creating product
 */
const createProductValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Product name is required')
    .isLength({ min: 3, max: 255 }).withMessage('Name must be between 3-255 characters'),
  
  body('investment_type')
    .notEmpty().withMessage('Investment type is required')
    .isIn(['bond', 'fd', 'mf', 'etf', 'other']).withMessage('Invalid investment type'),
  
  body('tenure_months')
    .notEmpty().withMessage('Tenure is required')
    .isInt({ min: 1 }).withMessage('Tenure must be at least 1 month'),
  
  body('annual_yield')
    .notEmpty().withMessage('Annual yield is required')
    .isFloat({ min: 0, max: 100 }).withMessage('Annual yield must be between 0-100'),
  
  body('risk_level')
    .notEmpty().withMessage('Risk level is required')
    .isIn(['low', 'moderate', 'high']).withMessage('Invalid risk level'),
  
  body('min_investment')
    .optional()
    .isFloat({ min: 0 }).withMessage('Minimum investment must be positive'),
  
  body('max_investment')
    .optional()
    .isFloat({ min: 0 }).withMessage('Maximum investment must be positive')
];

/**
 * Validation rules for creating investment
 */
const createInvestmentValidation = [
  body('product_id')
    .notEmpty().withMessage('Product ID is required'),
  
  body('amount')
    .notEmpty().withMessage('Amount is required')
    .isFloat({ min: 1 }).withMessage('Amount must be at least 1')
];

module.exports = {
  validate,
  signupValidation,
  loginValidation,
  resetPasswordRequestValidation,
  resetPasswordValidation,
  createProductValidation,
  createInvestmentValidation
};
