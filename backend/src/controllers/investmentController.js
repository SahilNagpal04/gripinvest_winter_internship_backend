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

		if (!amount || amount <= 0) {
			return next(new AppError('Invalid investment amount', 400));
		}

		const product = await productModel.getProductById(product_id);
		if (!product) {
			return next(new AppError('Product not found', 404));
		}

		if (amount < product.min_investment) {
			return next(new AppError(`Minimum investment for this product is ₹${product.min_investment}`, 400));
		}

		if (product.max_investment && amount > product.max_investment) {
			return next(new AppError(`Maximum investment for this product is ₹${product.max_investment}`, 400));
		}

		const userBalance = await userModel.getUserBalance(userId);
		if (amount > userBalance) {
			return next(new AppError(`Insufficient balance. Your current balance is ₹${userBalance}`, 400));
		}

		const expectedReturn = amount * (1 + (product.annual_yield / 100) * (product.tenure_months / 12));

		const maturityDate = new Date();
		maturityDate.setMonth(maturityDate.getMonth() + product.tenure_months);

		const connection = await db.getConnection();
		try {
			await connection.beginTransaction();

			const investmentId = await investmentModel.createInvestment({
				user_id: userId,
				product_id,
				amount,
				expected_return: expectedReturn,
				maturity_date: maturityDate.toISOString().split('T')[0]
			});

			await userModel.updateUserBalance(userId, -amount);

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
			await connection.rollback();
			console.error(`[CREATE_INVESTMENT] Transaction failed: ${error.message}`);
			next(new AppError('Failed to create investment. Your balance has not been deducted.', 500));
			return;
		} finally {
			connection.release();
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

		const insights = generatePortfolioInsights(summary, riskDistribution);

		console.log(`[GET_PORTFOLIO] Retrieved ${investments.length} investments for userId: ${userId}`);

		res.status(200).json({
			status: 'success',
			data: {
				summary,
				riskDistribution,
				investments,
				insights
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

		if (Number(investment.user_id) !== Number(userId)) {
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

			await connection.commit();

			console.log(`[CANCEL_INVESTMENT] Investment cancelled successfully: ${id}`);

			res.status(200).json({
				status: 'success',
				message: 'Investment cancelled successfully. Amount refunded to your balance'
			});
		} catch (error) {
			await connection.rollback();
			console.error(`[CANCEL_INVESTMENT] Transaction failed: ${error.message}`);
			next(new AppError('Failed to cancel investment. No changes have been made.', 500));
			return;
		} finally {
			connection.release();
		}
	} catch (error) {
		console.error(`[CANCEL_INVESTMENT] Error: ${error.message}`);
		next(error);
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
