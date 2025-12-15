const investmentModel = require('../models/investmentModel');
const productModel = require('../models/productModel');
const userModel = require('../models/userModel');
const { AppError } = require('../middleware/errorHandler');
const db = require('../config/database');

/**
 * Create new investment
 */
const createInvestment = async (req, res, next) => {
	try {
		const { product_id, amount } = req.body;
		const userId = req.user.id;
		console.log(`[CREATE_INVESTMENT] User ${userId} creating investment for product ${product_id}, amount: ₹${amount}`);

		const investAmount = parseFloat(amount);
		if (!investAmount || isNaN(investAmount) || investAmount <= 0) {
			return next(new AppError('Invalid investment amount', 400));
		}

		const product = await productModel.getProductById(product_id);
		if (!product) {
			return next(new AppError('Product not found', 404));
		}

		if (investAmount < product.min_investment) {
			return next(new AppError(`Minimum investment for this product is ₹${product.min_investment}`, 400));
		}

		if (product.max_investment && investAmount > product.max_investment) {
			return next(new AppError(`Maximum investment for this product is ₹${product.max_investment}`, 400));
		}

		const userBalance = await userModel.getUserBalance(userId);
		if (investAmount > userBalance) {
			return next(new AppError(`Insufficient balance. Your current balance is ₹${userBalance}`, 400));
		}

		const expectedReturn = investAmount * (1 + (product.annual_yield / 100) * (product.tenure_months / 12));

		const maturityDate = new Date();
		maturityDate.setMonth(maturityDate.getMonth() + product.tenure_months);

		const connection = await db.getConnection();
		try {
			await connection.beginTransaction();

			const investmentId = await investmentModel.createInvestment({
				user_id: userId,
				product_id,
				amount: investAmount,
				expected_return: expectedReturn,
				maturity_date: maturityDate.toISOString().split('T')[0]
			});

			await userModel.updateUserBalance(userId, -investAmount);

			await connection.query(
				'INSERT INTO financial_transactions (user_id, investment_id, transaction_type, amount, description) VALUES (?, ?, ?, ?, ?)',
				[userId, investmentId, 'investment_created', investAmount, `Investment in ${product.name}`]
			);

			await connection.commit();
			const investment = await investmentModel.getInvestmentById(investmentId);

			console.log(`[CREATE_INVESTMENT] Investment created successfully. InvestmentId: ${investmentId}`);

			res.status(201).json({
				status: 'success',
				message: 'Investment created successfully',
				data: {
					investment
				}
			});
		} catch (error) {
			if (connection) await connection.rollback();
			console.error(`[CREATE_INVESTMENT] Error: ${error.message}`);
			next(error);
		} finally {
			if (connection) connection.release();
		}
	} catch (error) {
		console.error(`[CREATE_INVESTMENT] Error: ${error.message}`);
		next(error);
	}
};

/**
 * Get user portfolio
 */
const getPortfolio = async (req, res, next) => {
	try {
		const userId = req.user.id;
		console.log(`[GET_PORTFOLIO] Fetching portfolio for userId: ${userId}`);

		const investments = await investmentModel.getUserPortfolio(userId);
		const summary = await investmentModel.getPortfolioSummary(userId);
		const riskDistribution = await investmentModel.getPortfolioRiskDistribution(userId);
		const healthScore = await calculateHealthScore(userId);

		const insights = generatePortfolioInsights(summary, riskDistribution);

		console.log(`[GET_PORTFOLIO] Retrieved ${investments.length} investments for userId: ${userId}`);

		res.status(200).json({
			status: 'success',
			data: {
				summary,
				riskDistribution,
				investments,
				insights,
				healthScore
			}
		});
	} catch (error) {
		console.error(`[GET_PORTFOLIO] Error: ${error.message}`);
		next(error);
	}
};

/**
 * Get investment by ID
 */
const getInvestmentById = async (req, res, next) => {
	try {
		const { id } = req.params;
		const userId = req.user.id;
		console.log(`[GET_INVESTMENT_BY_ID] Fetching investment ${id} for userId: ${userId}`);

		const investment = await investmentModel.getInvestmentById(id);

		if (!investment) {
			return next(new AppError('Investment not found', 404));
		}

		if (Number(investment.user_id) !== Number(userId) && !req.user.is_admin) {
			return next(new AppError('Access denied', 403));
		}

		console.log(`[GET_INVESTMENT_BY_ID] Investment retrieved successfully: ${id}`);

		res.status(200).json({
			status: 'success',
			data: {
				investment
			}
		});
	} catch (error) {
		console.error(`[GET_INVESTMENT_BY_ID] Error: ${error.message}`);
		next(error);
	}
};

/**
 * Cancel investment
 */
const cancelInvestment = async (req, res, next) => {
	try {
		const { id } = req.params;
		const userId = req.user.id;
		console.log(`[CANCEL_INVESTMENT] User ${userId} cancelling investment: ${id}`);

		const investment = await investmentModel.getInvestmentById(id);

		if (!investment) {
			return next(new AppError('Investment not found', 404));
		}

		if (String(investment.user_id) !== String(userId) && !req.user.is_admin) {
			return next(new AppError('Access denied', 403));
		}

		if (investment.status !== 'active') {
			return next(new AppError(`Cannot cancel ${investment.status} investment`, 400));
		}

		const connection = await db.getConnection();
		try {
			await connection.beginTransaction();

			await investmentModel.cancelInvestment(id);
			await userModel.updateUserBalance(userId, investment.amount);

			const product = await productModel.getProductById(investment.product_id);
			await connection.query(
				'INSERT INTO financial_transactions (user_id, investment_id, transaction_type, amount, description) VALUES (?, ?, ?, ?, ?)',
				[userId, id, 'investment_cancelled', investment.amount, `Cancelled investment in ${product.name}`]
			);

			await connection.commit();

			console.log(`[CANCEL_INVESTMENT] Investment cancelled successfully: ${id}`);

			res.status(200).json({
				status: 'success',
				message: 'Investment cancelled successfully. Amount refunded to your balance'
			});
		} catch (error) {
			if (connection) await connection.rollback();
			throw error;
		} finally {
			if (connection) connection.release();
		}
	} catch (error) {
		console.error(`[CANCEL_INVESTMENT] Error: ${error.message}`);
		next(error);
	}
};

/**
 * Helper functions for health score calculation
 */
const calculateDiversificationScore = (typeCount) => {
	if (typeCount === 1) return 10;
	if (typeCount === 2) return 18;
	if (typeCount === 3) return 24;
	if (typeCount === 4) return 28;
	return 30;
};

const calculateRiskBalanceScore = (lowRisk, moderateRisk, highRisk) => {
	if (lowRisk > 0 && moderateRisk > 0 && highRisk > 0) return 30;
	if ((lowRisk > 0 && moderateRisk > 0) || (moderateRisk > 0 && highRisk > 0)) return 20;
	return 10;
};

const calculateReturnsScore = (avgReturn) => {
	if (avgReturn > 12) return 20;
	if (avgReturn >= 10) return 15;
	if (avgReturn >= 8) return 10;
	return 5;
};

const calculateActiveInvestmentsScore = (totalInvestments) => {
	if (totalInvestments >= 10) return 20;
	if (totalInvestments >= 6) return 18;
	if (totalInvestments >= 3) return 14;
	return 8;
};

/**
 * Calculate portfolio health score
 */
const calculateHealthScore = async (userId) => {
	try {
		const stats = await db.query(`
			SELECT 
				COUNT(DISTINCT p.investment_type) as type_count,
				COUNT(*) as total_investments,
				AVG(p.annual_yield) as avg_return,
				SUM(CASE WHEN p.risk_level = 'low' THEN 1 ELSE 0 END) as low_risk,
				SUM(CASE WHEN p.risk_level = 'moderate' THEN 1 ELSE 0 END) as moderate_risk,
				SUM(CASE WHEN p.risk_level = 'high' THEN 1 ELSE 0 END) as high_risk
			FROM investments i
			JOIN investment_products p ON i.product_id = p.id
			WHERE i.user_id = ? AND i.status = 'active'
		`, [userId]);

		const portfolioStats = stats[0];
		if (!portfolioStats || portfolioStats.total_investments === 0) {
			return { score: 0, status: 'No Investments', breakdown: {}, tips: ['Start investing to build your portfolio'] };
		}

		const diversification = calculateDiversificationScore(portfolioStats.type_count);
		const riskBalance = calculateRiskBalanceScore(portfolioStats.low_risk, portfolioStats.moderate_risk, portfolioStats.high_risk);
		const returns = calculateReturnsScore(portfolioStats.avg_return);
		const activeInv = calculateActiveInvestmentsScore(portfolioStats.total_investments);

		const score = diversification + riskBalance + returns + activeInv;
		const status = score > 80 ? 'Excellent' : score > 60 ? 'Healthy' : score > 40 ? 'Fair' : 'Needs Attention';

		const tips = [];
		if (diversification < 20) tips.push('Add more investment types for better diversification');
		if (riskBalance < 20) tips.push('Balance your portfolio across different risk levels');
		if (returns < 10) tips.push('Consider higher-yield products like bonds or mutual funds');
		if (activeInv < 10) tips.push('Invest in 2-3 more products to spread risk');

		return {
			score,
			status,
			breakdown: { diversification, riskBalance, returns, activeInvestments: activeInv },
			tips
		};
	} catch (error) {
		console.error('[HEALTH_SCORE] Error:', error);
		return { score: 0, status: 'Error', breakdown: {}, tips: [] };
	}
};

/**
 * Generate AI portfolio insights
 */
const generatePortfolioInsights = (summary, riskDistribution) => {
	const insights = [];

	const riskTypes = riskDistribution.length;
	if (riskTypes === 1) {
		insights.push('💡 Consider diversifying across different risk levels to balance your portfolio');
	} else if (riskTypes >= 3) {
		insights.push('✅ Great! Your portfolio is well-diversified across risk levels');
	}

	const totalGains = parseFloat(summary.total_gains) || 0;
	const totalInvested = parseFloat(summary.total_invested) || 0;
  
	if (totalInvested > 0) {
		const returnPercentage = ((totalGains / totalInvested) * 100).toFixed(2);
    
		if (returnPercentage > 10) {
			insights.push(`📈 Excellent! Your portfolio is generating ${returnPercentage}% returns`);
		} else if (returnPercentage > 5) {
			insights.push(`📊 Your portfolio is generating ${returnPercentage}% returns - on track!`);
		} else {
			insights.push(`💰 Consider exploring higher-yield products to improve returns`);
		}

		riskDistribution.forEach(risk => {
			const percentage = ((risk.total_amount / totalInvested) * 100).toFixed(1);
			insights.push(`${risk.risk_level.toUpperCase()} risk: ${percentage}% of portfolio`);
		});
	}

	return insights;
};

/**
 * Get notifications for user
 */
const getNotifications = async (req, res, next) => {
	try {
		const userId = req.user.id;
		console.log(`[GET_NOTIFICATIONS] Fetching notifications for userId: ${userId}`);

		const notifications = await investmentModel.getMaturedInvestments(userId);

		console.log(`[GET_NOTIFICATIONS] Retrieved ${notifications.length} notifications`);

		res.status(200).json({
			status: 'success',
			data: {
				notifications
			}
		});
	} catch (error) {
		console.error(`[GET_NOTIFICATIONS] Error: ${error.message}`);
		next(error);
	}
};

/**
 * Mark notification as read
 */
const markNotificationRead = async (req, res, next) => {
	try {
		const { id } = req.params;
		const userId = req.user.id;
		console.log(`[MARK_NOTIFICATION_READ] Marking notification ${id} as read for userId: ${userId}`);

		const investment = await investmentModel.getInvestmentById(id);
		if (!investment) {
			return next(new AppError('Investment not found', 404));
		}

		if (Number(investment.user_id) !== Number(userId)) {
			return next(new AppError('Access denied', 403));
		}

		await investmentModel.markNotificationRead(id);

		console.log(`[MARK_NOTIFICATION_READ] Notification marked as read: ${id}`);

		res.status(200).json({
			status: 'success',
			message: 'Notification marked as read'
		});
	} catch (error) {
		console.error(`[MARK_NOTIFICATION_READ] Error: ${error.message}`);
		next(error);
	}
};

module.exports = {
	createInvestment,
	getPortfolio,
	getInvestmentById,
	cancelInvestment,
	getNotifications,
	markNotificationRead
};
