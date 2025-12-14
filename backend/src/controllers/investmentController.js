const investmentModel = require('../models/investmentModel');
const productModel = require('../models/productModel');
const userModel = require('../models/userModel');
const { AppError } = require('../middleware/errorHandler');

/**
 * Create new investment
 */
const createInvestment = async (req, res, next) => {
	try {
		const { product_id, amount } = req.body;
		const userId = req.user.id;

		// Validate amount
		if (!amount || amount <= 0) {
			return next(new AppError('Invalid investment amount', 400));
		}

		// Get product details
		const product = await productModel.getProductById(product_id);
		if (!product) {
			return next(new AppError('Product not found', 404));
		}

		// Check minimum investment
		if (amount < product.min_investment) {
			return next(new AppError(`Minimum investment for this product is ₹${product.min_investment}`, 400));
		}

		// Check maximum investment
		if (product.max_investment && amount > product.max_investment) {
			return next(new AppError(`Maximum investment for this product is ₹${product.max_investment}`, 400));
		}

		// Check user balance
		const userBalance = await userModel.getUserBalance(userId);
		if (amount > userBalance) {
			return next(new AppError(`Insufficient balance. Your current balance is ₹${userBalance}`, 400));
		}

		// Calculate expected return
		const expectedReturn = amount * (1 + (product.annual_yield / 100) * (product.tenure_months / 12));

		// Calculate maturity date
		const maturityDate = new Date();
		maturityDate.setMonth(maturityDate.getMonth() + product.tenure_months);

		// Create investment
		const investmentId = await investmentModel.createInvestment({
			user_id: userId,
			product_id,
			amount,
			expected_return: expectedReturn,
			maturity_date: maturityDate.toISOString().split('T')[0]
		});

		// Deduct amount from user balance
		await userModel.updateUserBalance(userId, -amount);

		// Get created investment
		const investment = await investmentModel.getInvestmentById(investmentId);

		res.status(201).json({
			status: 'success',
			message: 'Investment created successfully',
			data: {
				investment
			}
		});
	} catch (error) {
		next(error);
	}
};

/**
 * Get user portfolio
 */
const getPortfolio = async (req, res, next) => {
	try {
		const userId = req.user.id;

		const investments = await investmentModel.getUserPortfolio(userId);
		const summary = await investmentModel.getPortfolioSummary(userId);
		const riskDistribution = await investmentModel.getPortfolioRiskDistribution(userId);

		// AI-generated portfolio insights
		const insights = generatePortfolioInsights(summary, riskDistribution);

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

		const investment = await investmentModel.getInvestmentById(id);

		if (!investment) {
			return next(new AppError('Investment not found', 404));
		}

		// Check if investment belongs to user (unless admin)
		if (investment.user_id !== userId && !req.user.is_admin) {
			return next(new AppError('Access denied', 403));
		}

		res.status(200).json({
			status: 'success',
			data: {
				investment
			}
		});
	} catch (error) {
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

		const investment = await investmentModel.getInvestmentById(id);

		if (!investment) {
			return next(new AppError('Investment not found', 404));
		}

		// Check if investment belongs to user
		if (investment.user_id !== userId) {
			return next(new AppError('Access denied', 403));
		}

		// Check if already cancelled or matured
		if (investment.status !== 'active') {
			return next(new AppError(`Cannot cancel ${investment.status} investment`, 400));
		}

		// Cancel investment
		await investmentModel.cancelInvestment(id);

		// Refund amount to user
		await userModel.updateUserBalance(userId, investment.amount);

		res.status(200).json({
			status: 'success',
			message: 'Investment cancelled successfully. Amount refunded to your balance'
		});
	} catch (error) {
		next(error);
	}
};

/**
 * Generate AI portfolio insights
 */
const generatePortfolioInsights = (summary, riskDistribution) => {
	const insights = [];

	// Calculate portfolio diversity
	const riskTypes = riskDistribution.length;
	if (riskTypes === 1) {
		insights.push('💡 Consider diversifying across different risk levels to balance your portfolio');
	} else if (riskTypes >= 3) {
		insights.push('✅ Great! Your portfolio is well-diversified across risk levels');
	}

	// Check returns
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
	}

	// Risk distribution insights
	riskDistribution.forEach(risk => {
		const percentage = ((risk.total_amount / totalInvested) * 100).toFixed(1);
		insights.push(`${risk.risk_level.toUpperCase()} risk: ${percentage}% of portfolio`);
	});

	return insights;
};

/**
 * Get notifications for user
 */
const getNotifications = async (req, res, next) => {
	try {
		const userId = req.user.id;
		const notifications = await investmentModel.getMaturedInvestments(userId);

		res.status(200).json({
			status: 'success',
			data: {
				notifications
			}
		});
	} catch (error) {
		next(error);
	}
};

/**
 * Mark notification as read
 */
const markNotificationRead = async (req, res, next) => {
	try {
		const { id } = req.params;
		await investmentModel.markNotificationRead(id);

		res.status(200).json({
			status: 'success',
			message: 'Notification marked as read'
		});
	} catch (error) {
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
