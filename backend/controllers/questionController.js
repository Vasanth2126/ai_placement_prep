const Question = require('../models/Question');
const { sampleQuestions } = require('../utils/seedData');

/**
 * @desc    Get questions with filters (topic, difficulty, type, search)
 * @route   GET /api/questions
 * @access  Public
 */
const getQuestions = async (req, res, next) => {
  try {
    const { topic, difficulty, type, search } = req.query;

    let filter = {};
    if (topic && topic !== 'All') filter.topic = topic;
    if (difficulty && difficulty !== 'All') filter.difficulty = difficulty;
    if (type && type !== 'All') filter.type = type;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { companyTags: { $regex: search, $options: 'i' } },
      ];
    }

    let questions = [];
    try {
      questions = await Question.find(filter).sort({ createdAt: -1 });
      if (questions.length === 0 && Object.keys(filter).length === 0) {
        questions = sampleQuestions;
      }
    } catch (e) {
      questions = sampleQuestions.filter((q) => {
        if (topic && topic !== 'All' && q.topic !== topic) return false;
        if (difficulty && difficulty !== 'All' && q.difficulty !== difficulty) return false;
        if (type && type !== 'All' && q.type !== type) return false;
        return true;
      });
    }

    res.json({
      success: true,
      count: questions.length,
      questions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single question by ID
 * @route   GET /api/questions/:id
 * @access  Public
 */
const getQuestionById = async (req, res, next) => {
  try {
    let question;
    try {
      question = await Question.findById(req.params.id);
    } catch (e) {}

    if (!question) {
      question = sampleQuestions.find((q) => q._id === req.params.id || q.title === req.params.id) || sampleQuestions[0];
    }

    res.json({
      success: true,
      question,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new question (Admin or user generated)
 * @route   POST /api/questions
 * @access  Private/Admin
 */
const createQuestion = async (req, res, next) => {
  try {
    const question = await Question.create({
      ...req.body,
      createdBy: req.user?._id,
    });

    res.status(201).json({
      success: true,
      message: 'Question created successfully',
      question,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete question
 * @route   DELETE /api/questions/:id
 * @access  Private/Admin
 */
const deleteQuestion = async (req, res, next) => {
  try {
    await Question.findByIdAndDelete(req.params.id);
    res.json({
      success: true,
      message: 'Question removed',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getQuestions,
  getQuestionById,
  createQuestion,
  deleteQuestion,
};
