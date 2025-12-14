const db = require('../config/database');

exports.getUserTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 50, offset = 0, type, status } = req.query;

    let query = 'SELECT * FROM financial_transactions WHERE user_id = ?';
    const params = [userId];

    if (type) {
      query += ' AND transaction_type = ?';
      params.push(type);
    }

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ` ORDER BY created_at DESC LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`;

    const transactions = await db.query(query, params);

    const countResult = await db.query(
      'SELECT COUNT(*) as total FROM financial_transactions WHERE user_id = ?',
      [userId]
    );

    res.json({
      transactions,
      total: countResult[0]?.total || 0,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('[GET_TRANSACTIONS_ERROR]', error);
    res.status(500).json({ message: 'Failed to fetch transactions' });
  }
};

exports.getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [transactions] = await db.query(
      'SELECT * FROM financial_transactions WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (transactions.length === 0) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json(transactions[0]);
  } catch (error) {
    console.error('[GET_TRANSACTION_ERROR]', error);
    res.status(500).json({ message: 'Failed to fetch transaction' });
  }
};

exports.getTransactionSummary = async (req, res) => {
  try {
    const userId = req.user.id;

    const [summary] = await db.query(
      `SELECT 
        COUNT(*) as total_transactions,
        SUM(CASE WHEN transaction_type = 'investment_matured' THEN amount ELSE 0 END) as total_credits,
        SUM(CASE WHEN transaction_type = 'investment_created' THEN amount ELSE 0 END) as total_debits,
        SUM(CASE WHEN transaction_type = 'investment_created' THEN 1 ELSE 0 END) - SUM(CASE WHEN transaction_type IN ('investment_matured', 'investment_cancelled') THEN 1 ELSE 0 END) as active_investments,
        SUM(CASE WHEN transaction_type = 'investment_cancelled' THEN 1 ELSE 0 END) as cancelled_investments
      FROM financial_transactions 
      WHERE user_id = ?`,
      [userId]
    );

    res.json(summary[0]);
  } catch (error) {
    console.error('[GET_SUMMARY_ERROR]', error);
    res.status(500).json({ message: 'Failed to fetch summary' });
  }
};
