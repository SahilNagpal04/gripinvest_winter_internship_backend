const { query } = require('../config/database');

/**
 * Create a new user
 */
const createUser = async (userData) => {
  const { first_name, last_name, email, password_hash, risk_appetite } = userData;
  
  await query(
    `INSERT INTO users (first_name, last_name, email, password_hash, risk_appetite) 
     VALUES (?, ?, ?, ?, ?)`,
    [first_name, last_name || null, email, password_hash, risk_appetite || 'moderate']
  );
  
  // Get the newly created user by email
  const users = await query('SELECT id FROM users WHERE email = ?', [email]);
  
  if (!users || users.length === 0) {
    throw new Error('Failed to create user');
  }
  
  return users[0].id;
};

/**
 * Find user by email
 */
const findUserByEmail = async (email) => {
  const users = await query(
    'SELECT * FROM users WHERE email = ?',
    [email]
  );
  
  return users.length > 0 ? users[0] : null;
};

/**
 * Find user by ID
 */
const findUserById = async (userId) => {
  const users = await query(
    'SELECT id, first_name, last_name, email, risk_appetite, balance, is_admin, two_factor_enabled, two_factor_code, two_factor_expires, email_verified, created_at FROM users WHERE id = ?',
    [userId]
  );
  
  if (!users || users.length === 0) {
    return null;
  }
  
  return users[0];
};

/**
 * Update user profile
 */
const updateUser = async (userId, updateData) => {
  const fields = [];
  const values = [];
  
  Object.keys(updateData).forEach(key => {
    if (updateData[key] !== undefined) {
      fields.push(`${key} = ?`);
      values.push(updateData[key]);
    }
  });
  
  if (fields.length === 0) return null;
  
  values.push(userId);
  
  await query(
    `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
    values
  );
  
  return await findUserById(userId);
};

/**
 * Update user balance
 */
const updateUserBalance = async (userId, amount) => {
  await query(
    'UPDATE users SET balance = balance + ? WHERE id = ?',
    [amount, userId]
  );
  
  return await findUserById(userId);
};

/**
 * Get user balance
 */
const getUserBalance = async (userId) => {
  const result = await query(
    'SELECT balance FROM users WHERE id = ?',
    [userId]
  );
  
  return result.length > 0 ? result[0].balance : 0;
};

/**
 * Store OTP for password reset (we'll use a simple approach - store in a temp table or memory)
 * For simplicity, we'll add otp and otp_expiry columns to users table
 */
const storePasswordResetOTP = async (email, otp, expiryTime) => {
  await query(
    'UPDATE users SET otp = ?, otp_expiry = ? WHERE email = ?',
    [otp, expiryTime, email]
  );
};

/**
 * Verify OTP
 */
const verifyOTP = async (email, otp) => {
  const users = await query(
    'SELECT * FROM users WHERE email = ? AND otp = ? AND otp_expiry > NOW()',
    [email, otp]
  );
  
  return users.length > 0 ? users[0] : null;
};

/**
 * Update password
 */
const updatePassword = async (userId, newPasswordHash) => {
  await query(
    'UPDATE users SET password_hash = ?, otp = NULL, otp_expiry = NULL WHERE id = ?',
    [newPasswordHash, userId]
  );
};

/**
 * Store 2FA OTP
 */
const store2FAOTP = async (userId, otp, expiryTime) => {
  await query(
    'UPDATE users SET two_factor_code = ?, two_factor_expires = ? WHERE id = ?',
    [otp, expiryTime, userId]
  );
};

/**
 * Clear 2FA OTP
 */
const clear2FAOTP = async (userId) => {
  await query(
    'UPDATE users SET two_factor_code = NULL, two_factor_expires = NULL WHERE id = ?',
    [userId]
  );
};

/**
 * Verify email
 */
const verifyEmail = async (userId) => {
  await query(
    'UPDATE users SET email_verified = TRUE, two_factor_code = NULL, two_factor_expires = NULL WHERE id = ?',
    [userId]
  );
};

/**
 * Update 2FA status
 */
const update2FAStatus = async (userId, enabled) => {
  await query(
    'UPDATE users SET two_factor_enabled = ? WHERE id = ?',
    [enabled, userId]
  );
};

/**
 * Delete user
 */
const deleteUser = async (userId) => {
  await query(
    'DELETE FROM users WHERE id = ?',
    [userId]
  );
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  updateUser,
  updateUserBalance,
  getUserBalance,
  storePasswordResetOTP,
  verifyOTP,
  updatePassword,
  store2FAOTP,
  clear2FAOTP,
  verifyEmail,
  update2FAStatus,
  deleteUser
};
