const db = require('../config/database');

/**
 * Get alerts for user
 */
const getAlerts = async (req, res, next) => {
  try {
    const userId = req.user.id;
    console.log(`[GET_ALERTS] Fetching alerts for userId: ${userId}`);
    const alerts = [];

    // 1. Maturity alerts - investments maturing in next 7 days
    const maturityAlerts = await db.query(`
      SELECT i.id, p.name, i.amount, i.expected_return, i.maturity_date,
             DATEDIFF(i.maturity_date, CURDATE()) as days_left
      FROM investments i
      JOIN investment_products p ON i.product_id = p.id
      WHERE i.user_id = ? 
        AND i.status = 'active'
        AND i.maturity_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
      ORDER BY i.maturity_date
    `, [userId]);

    maturityAlerts.forEach(inv => {
      alerts.push({
        type: 'maturity',
        message: `${inv.name} matures in ${inv.days_left} day${inv.days_left > 1 ? 's' : ''}`,
        amount: inv.expected_return,
        days: inv.days_left,
        investmentId: inv.id
      });
    });

    // 2. New product alerts - products added in last 7 days matching user risk
    const newProducts = req.user.risk_appetite ? await db.query(`
      SELECT id, name, annual_yield, risk_level, investment_type
      FROM investment_products
      WHERE risk_level = ?
        AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        AND is_active = 1
      ORDER BY created_at DESC
      LIMIT 5
    `, [req.user.risk_appetite]) : [];

    newProducts.forEach(prod => {
      alerts.push({
        type: 'new_product',
        message: `New ${prod.investment_type} matches your profile`,
        productName: prod.name,
        yield: prod.annual_yield,
        productId: prod.id
      });
    });

    console.log(`[GET_ALERTS] Retrieved ${alerts.length} alerts for userId: ${userId}`);

    res.status(200).json({
      status: 'success',
      data: {
        alerts,
        count: alerts.length
      }
    });
  } catch (error) {
    console.error('[GET_ALERTS] Error:', error);
    next(error);
  }
};

/**
 * Get alert count only
 */
const getAlertCount = async (req, res, next) => {
  try {
    const userId = req.user.id;
    console.log(`[GET_ALERT_COUNT] Fetching alert count for userId: ${userId}`);

    const maturityCount = await db.query(`
      SELECT COUNT(*) as count
      FROM investments
      WHERE user_id = ? 
        AND status = 'active'
        AND maturity_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
    `, [userId]);

    const productCount = req.user.risk_appetite ? await db.query(`
      SELECT COUNT(*) as count
      FROM investment_products
      WHERE risk_level = ?
        AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        AND is_active = 1
    `, [req.user.risk_appetite]) : [{ count: 0 }];

    const count = (maturityCount[0]?.count || 0) + (productCount[0]?.count || 0);
    console.log(`[GET_ALERT_COUNT] Alert count for userId ${userId}: ${count}`);

    res.status(200).json({
      status: 'success',
      data: { count }
    });
  } catch (error) {
    console.error('[GET_ALERT_COUNT] Error:', error);
    next(error);
  }
};

module.exports = {
  getAlerts,
  getAlertCount
};
