const express = require('express');
const router = express.Router();
const { getDashboardAnalytics, downloadPdfReport } = require('../controllers/analyticsController');
const { optionalProtect } = require('../middleware/auth');

router.get('/dashboard', optionalProtect, getDashboardAnalytics);
router.get('/report/pdf', optionalProtect, downloadPdfReport);

module.exports = router;
