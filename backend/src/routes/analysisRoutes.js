const express = require('express');
const router = express.Router();
const { analyzeMessage, analyzeUrl, submitFeedback } = require('../controllers/analysisController');
const { optionalAuth } = require('../middleware/authMiddleware');

router.post('/message', optionalAuth, analyzeMessage);
router.post('/url', optionalAuth, analyzeUrl);
router.post('/feedback', optionalAuth, submitFeedback);

module.exports = router;

