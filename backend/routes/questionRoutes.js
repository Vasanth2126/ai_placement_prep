const express = require('express');
const router = express.Router();
const {
  getQuestions,
  getQuestionById,
  createQuestion,
  deleteQuestion,
} = require('../controllers/questionController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getQuestions);
router.get('/:id', getQuestionById);
router.post('/', protect, authorize('admin'), createQuestion);
router.delete('/:id', protect, authorize('admin'), deleteQuestion);

module.exports = router;
