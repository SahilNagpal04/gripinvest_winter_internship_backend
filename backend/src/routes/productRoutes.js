const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect, restrictTo } = require('../middleware/auth');
const { createProductValidation, validate } = require('../utils/validators');

// Public routes (can view products without login)
router.get('/', productController.getAllProducts);
router.get('/top', productController.getTopProducts);
router.get('/:id', productController.getProductById);

// Protected routes (login required)
router.get('/recommended/me', protect, productController.getRecommendedProducts);

// Admin only routes
router.post('/', protect, restrictTo('admin'), createProductValidation, validate, productController.createProduct);
router.put('/:id', protect, restrictTo('admin'), productController.updateProduct);
router.delete('/:id', protect, restrictTo('admin'), productController.deleteProduct);

module.exports = router;
