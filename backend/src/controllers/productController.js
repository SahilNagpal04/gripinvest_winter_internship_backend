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

		// Auto-generate description using AI if not provided
		let finalDescription = description;
		if (!description) {
			finalDescription = `${name} is a ${risk_level} risk ${investment_type} with ${tenure_months} months tenure offering ${annual_yield}% annual yield. Minimum investment: ₹${min_investment}.`;
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

		res.status(201).json({
			status: 'success',
			message: 'Product created successfully',
			data: {
				product
			}
		});
	} catch (error) {
		next(error);
	}
};

/**
 * Get all products with filters
 */
const getAllProducts = async (req, res, next) => {
	try {
		const { investment_type, risk_level, min_yield } = req.query;

		const filters = {};
		if (investment_type) filters.investment_type = investment_type;
		if (risk_level) filters.risk_level = risk_level;
		if (min_yield) filters.min_yield = parseFloat(min_yield);

		const products = await productModel.getAllProducts(filters);

		res.status(200).json({
			status: 'success',
			results: products.length,
			data: {
				products
			}
		});
	} catch (error) {
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

		const product = await productModel.updateProduct(id, updateData);
		if (!product) {
			return next(new AppError('Product not found', 404));
		}

		res.status(200).json({
			status: 'success',
			message: 'Product updated successfully',
			data: {
				product
			}
		});
	} catch (error) {
		next(error);
	}
};

/**
 * Delete product (Admin only)
 */
const deleteProduct = async (req, res, next) => {
	try {
		const { id } = req.params;

		await productModel.deleteProduct(id);

		res.status(200).json({
			status: 'success',
			message: 'Product deleted successfully'
		});
	} catch (error) {
		next(error);
	}
};

/**
 * Get recommended products based on user's risk appetite
 */
const getRecommendedProducts = async (req, res, next) => {
	try {
		const riskAppetite = req.user.risk_appetite;

		const products = await productModel.getRecommendedProducts(riskAppetite);

		res.status(200).json({
			status: 'success',
			message: `Products recommended based on your ${riskAppetite} risk appetite`,
			results: products.length,
			data: {
				products
			}
		});
	} catch (error) {
		next(error);
	}
};

/**
 * Get top performing products
 */
const getTopProducts = async (req, res, next) => {
	try {
		const limit = parseInt(req.query.limit) || 5;

		const products = await productModel.getTopProducts(limit);

		res.status(200).json({
			status: 'success',
			message: 'Top performing products',
			results: products.length,
			data: {
				products
			}
		});
	} catch (error) {
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
