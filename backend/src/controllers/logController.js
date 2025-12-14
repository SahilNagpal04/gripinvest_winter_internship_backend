const logModel = require('../models/logModel');
const { AppError } = require('../middleware/errorHandler');

/**
 * Get logs for current user
 */
const getMyLogs = async (req, res, next) => {
	try {
		const userId = req.user.id;
		const limit = parseInt(req.query.limit) || 100;
		console.log(`[GET_MY_LOGS] Fetching logs for userId: ${userId}, limit: ${limit}`);

		if (isNaN(limit) || limit < 1 || limit > 1000) {
			return next(new AppError('Limit must be between 1 and 1000', 400));
		}

		const logs = await logModel.getLogsByUserId(userId, limit);

		console.log(`[GET_MY_LOGS] Retrieved ${logs.length} logs for userId: ${userId}`);

		res.status(200).json({
			status: 'success',
			results: logs.length,
			data: {
				logs
			}
		});
	} catch (error) {
		console.error(`[GET_MY_LOGS] Error: ${error.message}`);
		next(error);
	}
};

/**
 * Get error logs for current user
 */
const getMyErrorLogs = async (req, res, next) => {
	try {
		const userId = req.user.id;
		console.log(`[GET_MY_ERROR_LOGS] Fetching error logs for userId: ${userId}`);

		const errorLogs = await logModel.getErrorLogsByUserId(userId);
		const errorSummary = await logModel.getErrorSummary(userId);

		const insights = generateErrorInsights(errorSummary);

		console.log(`[GET_MY_ERROR_LOGS] Retrieved ${errorLogs.length} error logs for userId: ${userId}`);

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
		console.error(`[GET_MY_ERROR_LOGS] Error: ${error.message}`);
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
		console.log(`[GET_ALL_LOGS] Admin fetching logs, limit: ${limit}, offset: ${offset}`);

		if (isNaN(limit) || limit < 1 || limit > 1000) {
			return next(new AppError('Limit must be between 1 and 1000', 400));
		}

		if (isNaN(offset) || offset < 0) {
			return next(new AppError('Offset must be a non-negative number', 400));
		}

		const logs = await logModel.getAllLogs(limit, offset);

		console.log(`[GET_ALL_LOGS] Retrieved ${logs.length} logs`);

		res.status(200).json({
			status: 'success',
			results: logs.length,
			data: {
				logs
			}
		});
	} catch (error) {
		console.error(`[GET_ALL_LOGS] Error: ${error.message}`);
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
		console.log(`[GET_LOGS_BY_USER_ID] Admin fetching logs for userId: ${userId}`);

		if (!userId || isNaN(parseInt(userId))) {
			return next(new AppError('Valid user ID is required', 400));
		}

		if (isNaN(limit) || limit < 1 || limit > 1000) {
			return next(new AppError('Limit must be between 1 and 1000', 400));
		}

		const logs = await logModel.getLogsByUserId(userId, limit);

		console.log(`[GET_LOGS_BY_USER_ID] Retrieved ${logs.length} logs for userId: ${userId}`);

		res.status(200).json({
			status: 'success',
			results: logs.length,
			data: {
				logs
			}
		});
	} catch (error) {
		console.error(`[GET_LOGS_BY_USER_ID] Error: ${error.message}`);
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
		console.log(`[GET_LOGS_BY_EMAIL] Admin fetching logs for email: ${email}`);

		if (!email || !email.includes('@')) {
			return next(new AppError('Valid email is required', 400));
		}

		if (isNaN(limit) || limit < 1 || limit > 1000) {
			return next(new AppError('Limit must be between 1 and 1000', 400));
		}

		const logs = await logModel.getLogsByEmail(email, limit);

		console.log(`[GET_LOGS_BY_EMAIL] Retrieved ${logs.length} logs for email: ${email}`);

		res.status(200).json({
			status: 'success',
			results: logs.length,
			data: {
				logs
			}
		});
	} catch (error) {
		console.error(`[GET_LOGS_BY_EMAIL] Error: ${error.message}`);
		next(error);
	}
};

/**
 * Get logs by date range
 */
const getLogsByDateRange = async (req, res, next) => {
	try {
		const { startDate, endDate } = req.query;
		console.log(`[GET_LOGS_BY_DATE_RANGE] Fetching logs from ${startDate} to ${endDate}`);

		if (!startDate || !endDate) {
			return next(new AppError('Start date and end date are required', 400));
		}

		const startDateObj = new Date(startDate);
		const endDateObj = new Date(endDate);

		if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
			return next(new AppError('Invalid date format. Use YYYY-MM-DD', 400));
		}

		if (startDateObj > endDateObj) {
			return next(new AppError('Start date must be before end date', 400));
		}

		const userId = req.user.is_admin ? null : req.user.id;
		const logs = await logModel.getLogsByDateRange(startDate, endDate, userId);

		console.log(`[GET_LOGS_BY_DATE_RANGE] Retrieved ${logs.length} logs`);

		res.status(200).json({
			status: 'success',
			results: logs.length,
			data: {
				logs
			}
		});
	} catch (error) {
		console.error(`[GET_LOGS_BY_DATE_RANGE] Error: ${error.message}`);
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
