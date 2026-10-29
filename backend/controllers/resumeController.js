const User = require('../models/User');
const Question = require('../models/Question');
const { analyzeResume } = require('../services/resumeParserService');
const fs = require('fs');
const path = require('path');

/**
 * @desc    Upload resume PDF, extract skills and generate personalized questions
 * @route   POST /api/resume/upload
 * @access  Private
 */
const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a PDF resume file.',
      });
    }

    const targetRole = req.body.targetRole || (req.user && req.user.targetRole) || 'Full Stack Software Engineer';

    // Process PDF and extract skills + questions + ATS metrics
    const analysis = await analyzeResume(req.file.buffer, targetRole);

    // Save extracted skills to User if available in DB
    try {
      if (req.user && (req.user._id || req.user.id)) {
        const userId = req.user._id || req.user.id;
        const user = await User.findById(userId);
        if (user) {
          user.extractedSkills = analysis.extractedSkills;
          user.resumeProjects = analysis.projects;
          user.targetRole = targetRole;
          user.hasUploadedResume = true;
          user.overallReadinessScore = analysis.atsScore;
          await user.save();
        }
      }
    } catch (dbErr) {
      console.warn('DB update skipped in demo mode:', dbErr.message);
    }

    // Save generated questions to DB if possible
    try {
      if (analysis.suggestedQuestions && analysis.suggestedQuestions.length > 0) {
        const questionsToSave = analysis.suggestedQuestions.map((q) => ({
          ...q,
          isGeneratedByAI: true,
          createdBy: req.user?._id || null,
        }));
        await Question.insertMany(questionsToSave);
      }
    } catch (qErr) {
      console.warn('Questions persistence note:', qErr.message);
    }

    res.json({
      success: true,
      message: analysis.isValidResume
        ? 'Resume parsed and analyzed successfully!'
        : (analysis.warning || 'Document analyzed (unrecognized resume format).'),
      data: {
        isValidResume: analysis.isValidResume,
        warning: analysis.warning,
        atsScore: analysis.atsScore,
        missingKeywords: analysis.missingKeywords,
        matchVerdict: analysis.matchVerdict,
        extractedSkills: analysis.extractedSkills,
        projects: analysis.projects,
        suggestedQuestions: analysis.suggestedQuestions,
        rawTextLength: analysis.rawTextLength,
        targetRole,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current user's extracted skills & profile breakdown
 * @route   GET /api/resume/skills
 * @access  Private
 */
const getSkills = async (req, res, next) => {
  try {
    let skills = {
      languages: ['JavaScript', 'Python', 'TypeScript', 'SQL'],
      frameworks: ['React', 'Node.js', 'Express.js', 'Tailwind CSS'],
      databases: ['MongoDB', 'PostgreSQL', 'Redis'],
      tools: ['Git', 'Docker', 'Postman', 'Vite'],
      concepts: ['Data Structures', 'RESTful APIs', 'System Design', 'JWT Authentication'],
    };

    try {
      const user = await User.findById(req.user._id || req.user.id);
      if (user && user.extractedSkills && user.extractedSkills.languages?.length > 0) {
        skills = user.extractedSkills;
      }
    } catch (e) {}

    res.json({
      success: true,
      skills,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Test with pre-generated sample placement resume
 * @route   POST /api/resume/sample
 * @access  Private
 */
const loadSampleResume = async (req, res, next) => {
  try {
    const samplePath = path.join(__dirname, '..', '..', 'sample_placement_resume.pdf');

    if (!fs.existsSync(samplePath)) {
      return res.status(404).json({
        success: false,
        message: 'Sample placement resume PDF not found.',
      });
    }

    const pdfBuffer = fs.readFileSync(samplePath);
    const targetRole = req.body.targetRole || 'Full Stack Software Engineer';
    const analysis = await analyzeResume(pdfBuffer, targetRole);

    // Save to User
    try {
      if (req.user && (req.user._id || req.user.id)) {
        const userId = req.user._id || req.user.id;
        const user = await User.findById(userId);
        if (user) {
          user.extractedSkills = analysis.extractedSkills;
          user.resumeProjects = analysis.projects;
          user.targetRole = targetRole;
          user.hasUploadedResume = true;
          user.overallReadinessScore = analysis.atsScore;
          await user.save();
        }
      }
    } catch (dbErr) {}

    res.json({
      success: true,
      message: 'Sample resume evaluated successfully!',
      data: {
        isValidResume: true,
        atsScore: analysis.atsScore,
        missingKeywords: analysis.missingKeywords,
        matchVerdict: analysis.matchVerdict,
        extractedSkills: analysis.extractedSkills,
        projects: analysis.projects,
        suggestedQuestions: analysis.suggestedQuestions,
        rawTextLength: analysis.rawTextLength,
        targetRole,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadResume,
  getSkills,
  loadSampleResume,
};
