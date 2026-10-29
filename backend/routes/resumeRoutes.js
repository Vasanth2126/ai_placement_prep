const express = require('express');
const router = express.Router();
const { uploadResume, getSkills, loadSampleResume } = require('../controllers/resumeController');
const { optionalProtect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/upload', optionalProtect, upload.single('resume'), uploadResume);
router.post('/sample', optionalProtect, loadSampleResume);
router.get('/skills', optionalProtect, getSkills);

module.exports = router;
