const productModel = require('../models/productModel');
const { AppError } = require('../middleware/errorHandler');

/**
 * Create new product (Admin only)
 */
const createProduct = async (req, res, next) => {
	try {
		const {
			name,
			investment_type,
			tenure_months,
			annual_yield,
			risk_level,
			min_investment,
			max_investment,
			description
		} = req.body;
		console.log(`[CREATE_PRODUCT] Creating product: ${name}`);

		if (!name || !investment_type || !tenure_months || !annual_yield || !risk_level) {
			return next(new AppError('Name, investment_type, tenure_months, annual_yield, and risk_level are required', 400));
		}

		const validInvestmentTypes = ['bond', 'fixed_deposit', 'mutual_fund', 'etf'];
		if (!validInvestmentTypes.includes(investment_type)) {
			return next(new AppError('Invalid investment_type. Must be bond, fixed_deposit, mutual_fund, or etf', 400));
		}

		const validRiskLevels = ['low', 'moderate', 'high'];
		if (!validRiskLevels.includes(risk_level)) {
			return next(new AppError('Invalid risk_level. Must be low, moderate, or high', 400));
		}

		if (tenure_months < 1 || tenure_months > 360) {
			return next(new AppError('Tenure must be between 1 and 360 months', 400));
		}

		if (annual_yield < 0 || annual_yield > 100) {
			return next(new AppError('Annual yield must be between 0 and 100', 400));
		}

		let finalDescription = description;
		if (!description) {
			finalDescription = `${name} is a ${risk_level} risk ${investment_type} with ${tenure_months} months tenure offering ${annual_yield}% annual yield. Minimum investment: ₹${min_investment || 1000}.`;
		}

		const productId = await productModel.createProduct({
			name,
			investment_type,
			tenure_months,
			annual_yield,
			risk_level,
			min_investment: min_investment || 1000,
			max_investment: max_investment || null,
			description: finalDescription
		});

		const product = await productModel.getProductById(productId);

		console.log(`[CREATE_PRODUCT] Product created successfully. ProductId: ${productId}`);

		res.status(201).json({
			status: 'success',
			message: 'Product created successfully',
			data: {
				product
			}
		});
	} catch (error) {
		console.error(`[CREATE_PRODUCT] Error: ${error.message}`);
		next(error);
	}
};

/**
 * Get all products with filters
 */
const getAllProducts = async (req, res, next) => {
	try {
		const { investment_type, risk_level, min_yield } = req.query;
		console.log(`[GET_ALL_PRODUCTS] Fetching products with filters:`, { investment_type, risk_level, min_yield });

		const filters = {};
		if (investment_type) filters.investment_type = investment_type;
		if (risk_level) filters.risk_level = risk_level;
		if (min_yield) {
			const parsedYield = parseFloat(min_yield);
			if (isNaN(parsedYield)) {
				return next(new AppError('Invalid min_yield value', 400));
			}
			filters.min_yield = parsedYield;
		}

		const products = await productModel.getAllProducts(filters);

		console.log(`[GET_ALL_PRODUCTS] Retrieved ${products.length} products`);

		res.status(200).json({
			status: 'success',
			results: products.length,
			data: {
				products
			}
		});
	} catch (error) {
		console.error(`[GET_ALL_PRODUCTS] Error: ${error.message}`);
		next(error);
	}
};

/**
 * Get product by ID
 */
const getProductById = async (req, res, next) => {
	try {
		const { id } = req.params;

		const product = await productModel.getProductById(id);
		if (!product) {
			return next(new AppError('Product not found', 404));
		}

		res.status(200).json({
			status: 'success',
			data: {
				product
			}
		});
	} catch (error) {
		next(error);
	}
};

/**
 * Update product (Admin only)
 */
const updateProduct = async (req, res, next) => {
	try {
		const { id } = req.params;
		const updateData = req.body;
		console.log(`[UPDATE_PRODUCT] Updating product: ${id}`);

		const allowedFields = ['name', 'investment_type', 'tenure_months', 'annual_yield', 'risk_level', 'min_investment', 'max_investment', 'description'];
		const filteredData = {};
		const maxFields = 10;
		let fieldCount = 0;

		for (const key of Object.keys(updateData)) {
			if (fieldCount >= maxFields) break;
			if (allowedFields.includes(key)) {
				filteredData[key] = updateData[key];
				fieldCount++;
			}
		}

		if (Object.keys(filteredData).length === 0) {
			return next(new AppError('No valid fields to update', 400));
		}

		if (filteredData.investment_type) {
			const validInvestmentTypes = ['bond', 'fixed_deposit', 'mutual_fund', 'etf'];
			if (!validInvestmentTypes.includes(filteredData.investment_type)) {
				return next(new AppError('Invalid investment_type. Must be bond, fixed_deposit, mutual_fund, or etf', 400));
			}
		}

		if (filteredData.risk_level) {
			const validRiskLevels = ['low', 'moderate', 'high'];
			if (!validRiskLevels.includes(filteredData.risk_level)) {
				return next(new AppError('Invalid risk_level. Must be low, moderate, or high', 400));
			}
		}

		if (filteredData.tenure_months && (filteredData.tenure_months < 1 || filteredData.tenure_months > 360)) {
			return next(new AppError('Tenure must be between 1 and 360 months', 400));
		}

		if (filteredData.annual_yield && (filteredData.annual_yield < 0 || filteredData.annual_yield > 100)) {
			return next(new AppError('Annual yield must be between 0 and 100', 400));
		}

		const product = await productModel.updateProduct(id, filteredData);
		if (!product) {
			return next(new AppError('Product not found', 404));
		}

		console.log(`[UPDATE_PRODUCT] Product updated successfully: ${id}`);

		res.status(200).json({
			status: 'success',
			message: 'Product updated successfully',
			data: {
				product
			}
		});
	} catch (error) {
		console.error(`[UPDATE_PRODUCT] Error: ${error.message}`);
		next(error);
	}
};

/**
 * Delete product (Admin only)
 */
const deleteProduct = async (req, res, next) => {
	try {
		const { id } = req.params;
		console.log(`[DELETE_PRODUCT] Deleting product: ${id}`);

		const product = await productModel.getProductById(id);
		if (!product) {
			return next(new AppError('Product not found', 404));
		}

		await productModel.deleteProduct(id);

		console.log(`[DELETE_PRODUCT] Product deleted successfully: ${id}`);

		res.status(200).json({
			status: 'success',
			message: 'Product deleted successfully'
		});
	} catch (error) {
		console.error(`[DELETE_PRODUCT] Error: ${error.message}`);
		next(error);
	}
};

/**
 * Get recommended products based on user's risk appetite
 */
const getRecommendedProducts = async (req, res, next) => {
	try {
		const riskAppetite = req.user.risk_appetite;
		console.log(`[GET_RECOMMENDED_PRODUCTS] Fetching recommendations for userId: ${req.user.id}, risk: ${riskAppetite}`);

		if (!riskAppetite) {
			return next(new AppError('User risk appetite not set', 400));
		}

		const products = await productModel.getRecommendedProducts(riskAppetite);

		console.log(`[GET_RECOMMENDED_PRODUCTS] Retrieved ${products.length} recommended products`);

		res.status(200).json({
			status: 'success',
			message: `Products recommended based on your ${riskAppetite} risk appetite`,
			results: products.length,
			data: {
				products
			}
		});
	} catch (error) {
		console.error(`[GET_RECOMMENDED_PRODUCTS] Error: ${error.message}`);
		next(error);
	}
};

/**
 * Get top performing products
 */
const getTopProducts = async (req, res, next) => {
	try {
		const limit = parseInt(req.query.limit) || 5;
		console.log(`[GET_TOP_PRODUCTS] Fetching top ${limit} products`);

		if (isNaN(limit) || limit < 1 || limit > 50) {
			return next(new AppError('Limit must be between 1 and 50', 400));
		}

		const products = await productModel.getTopProducts(limit);

		console.log(`[GET_TOP_PRODUCTS] Retrieved ${products.length} top products`);

		res.status(200).json({
			status: 'success',
			message: 'Top performing products',
			results: products.length,
			data: {
				products
			}
		});
	} catch (error) {
		console.error(`[GET_TOP_PRODUCTS] Error: ${error.message}`);
		next(error);
	}
};

module.exports = {
	createProduct,
	getAllProducts,
	getProductById,
	updateProduct,
	deleteProduct,
	getRecommendedProducts,
	getTopProducts
};
