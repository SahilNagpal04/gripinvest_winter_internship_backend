const { query } = require('../config/database');

/**
 * Get logs by user ID
 */
const getLogsByUserId = async (userId, limit = 100) => {
  return await query(
    `SELECT * FROM transaction_logs 
     WHERE user_id = ? 
     ORDER BY created_at DESC 
     LIMIT ${parseInt(limit)}`,
    [userId]
  );
};

/**
 * Get logs by email
 */
const getLogsByEmail = async (email, limit = 100) => {
  return await query(
    `SELECT * FROM transaction_logs 
     WHERE email = ? 
     ORDER BY created_at DESC 
     LIMIT ${parseInt(limit)}`,
    [email]
  );
};

/**
 * Get all logs (Admin only)
 */
const getAllLogs = async (limit = 100, offset = 0) => {
  return await query(
    `SELECT * FROM transaction_logs 
     ORDER BY created_at DESC 
     LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`
  );
};

/**
 * Get error logs for a user
 */
const getErrorLogsByUserId = async (userId) => {
  return await query(
    `SELECT * FROM transaction_logs 
     WHERE user_id = ? AND status_code >= 400 
     ORDER BY created_at DESC`,
    [userId]
  );
};

/**
 * Get error summary for a user
 */
const getErrorSummary = async (userId) => {
  return await query(
    `SELECT 
       status_code,
       COUNT(*) as error_count,
       GROUP_CONCAT(DISTINCT error_message SEPARATOR '; ') as error_messages
     FROM transaction_logs 
     WHERE user_id = ? AND status_code >= 400 
     GROUP BY status_code 
     ORDER BY error_count DESC`,
    [userId]
  );
};

/**
 * Get logs by date range
 */
const getLogsByDateRange = async (startDate, endDate, userId = null) => {
  let sql = `SELECT * FROM transaction_logs 
             WHERE created_at BETWEEN ? AND ?`;
  const params = [startDate, endDate];

  if (userId) {
    sql += ' AND user_id = ?';
    params.push(userId);
  }

  sql += ' ORDER BY created_at DESC';

  return await query(sql, params);
};

module.exports = {
  getLogsByUserId,
  getLogsByEmail,
  getAllLogs,
  getErrorLogsByUserId,
  getErrorSummary,
  getLogsByDateRange
};
