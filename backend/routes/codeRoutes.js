const express = require('express');
const router = express.Router();
const { executeCode, submitCode } = require('../controllers/codeController');
const { protect } = require('../middleware/auth');

router.post('/run', protect, executeCode);
router.post('/submit', protect, submitCode);

module.exports = router;
