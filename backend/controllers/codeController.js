const { runCode, runTestCases } = require('../services/codeExecutionService');
const { evaluateAnswer } = require('../services/aiService');
const Question = require('../models/Question');

/**
 * @desc    Execute code in real-time (Run button)
 * @route   POST /api/code/run
 * @access  Private
 */
const executeCode = async (req, res, next) => {
  try {
    const { language, code, stdin } = req.body;

    if (!code || code.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Code cannot be empty',
      });
    }

    const result = await runCode(language || 'javascript', code, stdin || '');

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Submit code solution against test cases and get AI Big-O & quality feedback
 * @route   POST /api/code/submit
 * @access  Private
 */
const submitCode = async (req, res, next) => {
  try {
    const { language, code, questionId, testCases = [] } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Code submission is required',
      });
    }

    let question;
    try {
      if (questionId) {
        question = await Question.findById(questionId);
      }
    } catch (e) {}

    const resolvedTestCases = (question && question.testCases && question.testCases.length > 0)
      ? question.testCases
      : testCases;

    // Run test cases against Piston engine
    const testResults = await runTestCases(language || 'javascript', code, resolvedTestCases);

    // Run AI Evaluation for Code Quality & Complexity
    const dummyQ = question || {
      title: 'Coding Challenge Submission',
      description: 'Algorithm efficiency and correctness review',
      topic: 'Data Structures & Algorithms',
    };

    const aiFeedback = await evaluateAnswer(dummyQ, { code, language }, 'code');

    // Adjust score based on test cases pass percentage
    const passPercentage = testResults.totalTestsCount > 0
      ? (testResults.passedTestsCount / testResults.totalTestsCount)
      : (testResults.passedAll ? 1 : 0.5);

    aiFeedback.overallScore = Math.round(aiFeedback.overallScore * 0.4 + (passPercentage * 100) * 0.6);
    aiFeedback.correctnessScore = Math.round(passPercentage * 100);

    res.json({
      success: true,
      message: 'Code executed and evaluated successfully',
      testResults,
      aiFeedback,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  executeCode,
  submitCode,
};
