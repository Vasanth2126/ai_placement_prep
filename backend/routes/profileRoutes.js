const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  completeModule,
  recalibrateProfile,
} = require('../controllers/profileController');
const { protect, optionalProtect } = require('../middleware/auth');

router.get('/', optionalProtect, getProfile);
router.put('/', optionalProtect, updateProfile);
router.post('/complete-module', optionalProtect, completeModule);
router.post('/recalibrate', optionalProtect, recalibrateProfile);

module.exports = router;
