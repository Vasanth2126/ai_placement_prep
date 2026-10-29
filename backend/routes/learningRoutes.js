const express = require('express');
const router = express.Router();
const {
  getLearningModules,
  completeLearningModule,
} = require('../controllers/learningController');
const { protect } = require('../middleware/auth');

router.get('/modules', protect, getLearningModules);
router.post('/:id/complete', protect, completeLearningModule);

module.exports = router;
