const express = require('express');
const router = express.Router();
const {
  getGDSessions,
  bookGDSession,
  evaluateGDContribution,
} = require('../controllers/gdController');
const { protect, optionalProtect } = require('../middleware/auth');

router.get('/sessions', optionalProtect, getGDSessions);
router.post('/book', optionalProtect, bookGDSession);
router.post('/evaluate', optionalProtect, evaluateGDContribution);

module.exports = router;
