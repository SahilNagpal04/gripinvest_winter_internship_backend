const { query } = require('../config/database');

/**
 * Create new investment
 */
const createInvestment = async (investmentData) => {
  const { user_id, product_id, amount, expected_return, maturity_date } = investmentData;

  const result = await query(
    `INSERT INTO investments (user_id, product_id, amount, expected_return, maturity_date) 
     VALUES (?, ?, ?, ?, ?)`,
    [user_id, product_id, amount, expected_return, maturity_date]
  );

  return result.insertId;
};

/**
 * Get user's portfolio (all investments)
 */
const getUserPortfolio = async (userId) => {
  return await query(
    `SELECT 
       i.id,
       i.amount,
       i.invested_at,
       i.status,
       i.expected_return,
       i.maturity_date,
       p.name as product_name,
       p.investment_type,
       p.annual_yield,
       p.risk_level,
       p.tenure_months
     FROM investments i
     JOIN investment_products p ON i.product_id = p.id
     WHERE i.user_id = ?
     ORDER BY i.invested_at DESC`,
    [userId]
  );
};

/**
 * Get investment by ID
 */
const getInvestmentById = async (investmentId) => {
  const investments = await query(
    `SELECT 
       i.*,
       p.name as product_name,
       p.investment_type,
       p.annual_yield,
       p.risk_level
     FROM investments i
     JOIN investment_products p ON i.product_id = p.id
     WHERE i.id = ?`,
    [investmentId]
  );

  if (!investments || investments.length === 0) {
    return null;
  }

  return investments[0];
};

/**
 * Get portfolio summary
 */
const getPortfolioSummary = async (userId) => {
  const active = await query(
    `SELECT 
       COUNT(*) as total_investments,
       SUM(amount) as total_invested,
       SUM(expected_return) as total_expected_return,
       SUM(expected_return - amount) as total_gains
     FROM investments
     WHERE user_id = ? AND status = 'active'`,
    [userId]
  );

  const matured = await query(
    `SELECT 
       SUM(expected_return - amount) as matured_profit
     FROM investments
     WHERE user_id = ? AND status = 'matured'`,
    [userId]
  );

  return {
    ...active[0],
    total_returns: matured[0].matured_profit || 0
  };
};

/**
 * Get risk distribution of portfolio
 */
const getPortfolioRiskDistribution = async (userId) => {
  return await query(
    `SELECT 
       p.risk_level,
       COUNT(*) as count,
       SUM(i.amount) as total_amount
     FROM investments i
     JOIN investment_products p ON i.product_id = p.id
     WHERE i.user_id = ? AND i.status = 'active'
     GROUP BY p.risk_level`,
    [userId]
  );
};

/**
 * Update investment status
 */
const updateInvestmentStatus = async (investmentId, status) => {
  await query(
    'UPDATE investments SET status = ? WHERE id = ?',
    [status, investmentId]
  );

  return await getInvestmentById(investmentId);
};

/**
 * Cancel investment
 */
const cancelInvestment = async (investmentId) => {
  return await updateInvestmentStatus(investmentId, 'cancelled');
};

/**
 * Get matured investments for notifications
 */
const getMaturedInvestments = async (userId) => {
  return await query(
    `SELECT 
       i.id,
       i.amount,
       i.expected_return,
       i.maturity_date,
       p.name as product_name
     FROM investments i
     JOIN investment_products p ON i.product_id = p.id
     WHERE i.user_id = ? 
       AND i.status = 'matured'
       AND i.notification_read = FALSE
     ORDER BY i.maturity_date DESC`,
    [userId]
  );
};

const markNotificationRead = async (investmentId) => {
  await query(
    'UPDATE investments SET notification_read = TRUE WHERE id = ?',
    [investmentId]
  );
};

module.exports = {
  createInvestment,
  getUserPortfolio,
  getInvestmentById,
  getPortfolioSummary,
  getPortfolioRiskDistribution,
  updateInvestmentStatus,
  cancelInvestment,
  getMaturedInvestments,
  markNotificationRead
};
