const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect, restrictTo } = require('../middleware/auth');
const { validate } = require('../utils/validators');

// Public routes (can view products without login)
router.get('/', productController.getAllProducts);
router.get('/top', productController.getTopProducts);
router.get('/:id', productController.getProductById);

// Protected routes (login required)
router.get('/recommended/me', protect, productController.getRecommendedProducts);



module.exports = router;
