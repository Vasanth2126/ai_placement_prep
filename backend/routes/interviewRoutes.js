const express = require('express');
const router = express.Router();
const {
  startSession,
  initProjectDefense,
  getUserResumeProjects,
  submitAnswer,
  completeSession,
} = require('../controllers/interviewController');
const { protect } = require('../middleware/auth');

router.post('/session', protect, startSession);
router.post('/project-defense/init', protect, initProjectDefense);
router.get('/project-defense/projects', protect, getUserResumeProjects);
router.post('/answer', protect, submitAnswer);
router.post('/session/complete', protect, completeSession);

module.exports = router;
