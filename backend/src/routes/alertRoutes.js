const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', alertController.getAlerts);
router.get('/count', alertController.getAlertCount);

module.exports = router;
