const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Question title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Question description is required'],
    },
    type: {
      type: String,
      enum: ['text', 'code', 'voice'],
      required: true,
      default: 'text',
    },
    topic: {
      type: String,
      required: true,
      default: 'System Design & Architecture',
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium',
    },
    companyTags: [
      {
        type: String,
      },
    ],
    // For Coding Questions
    starterCode: {
      python: { type: String, default: '' },
      javascript: { type: String, default: '' },
      cpp: { type: String, default: '' },
      java: { type: String, default: '' },
    },
    testCases: [
      {
        input: String,
        expectedOutput: String,
        isHidden: { type: Boolean, default: false },
        explanation: String,
      },
    ],
    hints: [String],
    solutionExplanation: String,
    modelAnswer: String,
    isGeneratedByAI: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Question', QuestionSchema);
