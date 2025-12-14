const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { protect } = require('../middleware/auth');

router.get('/summary', protect, transactionController.getTransactionSummary);
router.get('/:id', protect, transactionController.getTransactionById);
router.get('/', protect, transactionController.getUserTransactions);

module.exports = router;
