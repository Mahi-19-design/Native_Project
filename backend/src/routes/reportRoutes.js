const express = require('express');
const router = express.Router();
const { getReports, getReport, deleteReport, deleteAllReports } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All report routes require auth
router.get('/', getReports);
router.get('/:id', getReport);
router.delete('/:id', deleteReport);
router.delete('/', deleteAllReports);

module.exports = router;

