const express = require('express');
const router = express.Router();
const investmentController = require('../controllers/investmentController');
const { protect } = require('../middleware/auth');
const { createInvestmentValidation, validate } = require('../utils/validators');

// All routes require authentication
router.use(protect);

router.post('/', createInvestmentValidation, validate, investmentController.createInvestment);
router.get('/portfolio', investmentController.getPortfolio);
router.get('/:id', investmentController.getInvestmentById);
router.delete('/:id', investmentController.cancelInvestment);

module.exports = router;
