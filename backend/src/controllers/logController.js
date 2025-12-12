const logModel = require('../models/logModel');
const { AppError } = require('../middleware/errorHandler');

/**
 * Get logs for current user
 */
const getMyLogs = async (req, res, next) => {
	try {
		const userId = req.user.id;
		const limit = parseInt(req.query.limit) || 100;

		const logs = await logModel.getLogsByUserId(userId, limit);

		res.status(200).json({
			status: 'success',
			results: logs.length,
			data: {
				logs
			}
		});
	} catch (error) {
		next(error);
	}
};

/**
 * Get error logs for current user
 */
const getMyErrorLogs = async (req, res, next) => {
	try {
		const userId = req.user.id;

		const errorLogs = await logModel.getErrorLogsByUserId(userId);
		const errorSummary = await logModel.getErrorSummary(userId);

		// AI-generated error insights
		const insights = generateErrorInsights(errorSummary);

		res.status(200).json({
			status: 'success',
			results: errorLogs.length,
			data: {
				errorLogs,
				errorSummary,
				insights
			}
		});
	} catch (error) {
		next(error);
	}
};

/**
 * Get all logs (Admin only)
 */
const getAllLogs = async (req, res, next) => {
	try {
		const limit = parseInt(req.query.limit) || 100;
		const offset = parseInt(req.query.offset) || 0;

		const logs = await logModel.getAllLogs(limit, offset);

		res.status(200).json({
			status: 'success',
			results: logs.length,
			data: {
				logs
			}
		});
	} catch (error) {
		next(error);
	}
};

/**
 * Get logs by user ID (Admin only)
 */
const getLogsByUserId = async (req, res, next) => {
	try {
		const { userId } = req.params;
		const limit = parseInt(req.query.limit) || 100;

		const logs = await logModel.getLogsByUserId(userId, limit);

		res.status(200).json({
			status: 'success',
			results: logs.length,
			data: {
				logs
			}
		});
	} catch (error) {
		next(error);
	}
};

/**
 * Get logs by email (Admin only)
 */
const getLogsByEmail = async (req, res, next) => {
	try {
		const { email } = req.params;
		const limit = parseInt(req.query.limit) || 100;

		const logs = await logModel.getLogsByEmail(email, limit);

		res.status(200).json({
			status: 'success',
			results: logs.length,
			data: {
				logs
			}
		});
	} catch (error) {
		next(error);
	}
};

/**
 * Get logs by date range
 */
const getLogsByDateRange = async (req, res, next) => {
	try {
		const { startDate, endDate } = req.query;

		if (!startDate || !endDate) {
			return next(new AppError('Start date and end date are required', 400));
		}

		const userId = req.user.is_admin ? null : req.user.id;
		const logs = await logModel.getLogsByDateRange(startDate, endDate, userId);

		res.status(200).json({
			status: 'success',
			results: logs.length,
			data: {
				logs
			}
		});
	} catch (error) {
		next(error);
	}
};

/**
 * Generate AI error insights
 */
const generateErrorInsights = (errorSummary) => {
	const insights = [];

	if (errorSummary.length === 0) {
		insights.push('✅ No errors detected. All transactions are successful!');
		return insights;
	}

	errorSummary.forEach(error => {
		const statusCode = error.status_code;
		const count = error.error_count;

		if (statusCode === 401) {
			insights.push(`🔒 ${count} authentication error(s). Make sure you're logged in with a valid token`);
		} else if (statusCode === 403) {
			insights.push(`⛔ ${count} authorization error(s). You don't have permission for these actions`);
		} else if (statusCode === 404) {
			insights.push(`🔍 ${count} not found error(s). Check if resources exist before accessing`);
		} else if (statusCode === 400) {
			insights.push(`⚠️ ${count} validation error(s). Review your input data`);
		} else if (statusCode >= 500) {
			insights.push(`🔧 ${count} server error(s). Contact support if issues persist`);
		}
	});

	return insights;
};

module.exports = {
	getMyLogs,
	getMyErrorLogs,
	getAllLogs,
	getLogsByUserId,
	getLogsByEmail,
	getLogsByDateRange
};
