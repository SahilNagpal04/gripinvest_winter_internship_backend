const db = require('../config/database');

exports.getUserTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(`[GET_USER_TRANSACTIONS] Fetching transactions for userId: ${userId}`);

    const transactions = await db.query(
      `SELECT * FROM financial_transactions WHERE user_id = ? ORDER BY created_at DESC`,
      [userId]
    );

    console.log(`[GET_USER_TRANSACTIONS] Retrieved ${transactions.length} transactions for userId: ${userId}`);
    res.json({ transactions });
  } catch (error) {
    console.error('[GET_USER_TRANSACTIONS] Error:', error.message);
    res.status(500).json({ message: 'Failed to fetch transactions', error: error.message });
  }
};

exports.getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    console.log(`[GET_TRANSACTION_BY_ID] Fetching transaction ${id} for userId: ${userId}`);

    const [transactions] = await db.query(
      'SELECT * FROM financial_transactions WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (transactions.length === 0) {
      console.log(`[GET_TRANSACTION_BY_ID] Transaction ${id} not found for userId: ${userId}`);
      return res.status(404).json({ message: 'Transaction not found' });
    }

    console.log(`[GET_TRANSACTION_BY_ID] Transaction ${id} retrieved successfully`);
    res.json(transactions[0]);
  } catch (error) {
    console.error('[GET_TRANSACTION_BY_ID] Error:', error.message);
    res.status(500).json({ message: 'Failed to fetch transaction' });
  }
};

exports.getTransactionSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(`[GET_TRANSACTION_SUMMARY] Fetching summary for userId: ${userId}`);

    const summary = await db.query(
      `SELECT 
        COUNT(*) as total_transactions,
        SUM(CASE WHEN status = 'matured' THEN expected_return ELSE 0 END) as total_credits,
        SUM(amount) as total_debits,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_investments,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_investments
      FROM investments 
      WHERE user_id = ?`,
      [userId]
    );

    console.log(`[GET_TRANSACTION_SUMMARY] Summary retrieved for userId: ${userId}`);
    res.json(summary[0]);
  } catch (error) {
    console.error('[GET_TRANSACTION_SUMMARY] Error:', error.message);
    res.status(500).json({ message: 'Failed to fetch summary', error: error.message });
  }
};
