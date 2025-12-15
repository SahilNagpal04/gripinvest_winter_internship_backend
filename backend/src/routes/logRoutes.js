const express = require('express');
const router = express.Router();
const logController = require('../controllers/logController');
const { protect, restrictTo } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// User routes
router.get('/me', logController.getMyLogs);
router.get('/me/errors', logController.getMyErrorLogs);
router.get('/date-range', logController.getLogsByDateRange);



module.exports = router;
