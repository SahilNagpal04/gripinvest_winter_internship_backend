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
    'SELECT id, first_name, last_name, email, risk_appetite, balance, is_admin, created_at FROM users WHERE id = ?',
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
 * Get last deletion time for email
 */
const getLastDeletionTime = async (email) => {
  const result = await query(
    'SELECT last_deletion FROM user_deletions WHERE email = ?',
    [email]
  );
  return result.length > 0 ? new Date(result[0].last_deletion).getTime() : null;
};

/**
 * Delete user
 */
const deleteUser = async (userId) => {
  const user = await findUserById(userId);
  if (user) {
    await query(
      'INSERT INTO user_deletions (email, last_deletion) VALUES (?, NOW()) ON DUPLICATE KEY UPDATE last_deletion = NOW()',
      [user.email]
    );
  }
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
  deleteUser,
  getLastDeletionTime
};
