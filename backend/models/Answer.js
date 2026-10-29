const mongoose = require('mongoose');

const AnswerSchema = new mongoose.Schema(
  {
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
    },
    userResponse: {
      text: { type: String, default: '' },
      code: { type: String, default: '' },
      language: { type: String, default: 'javascript' },
      audioTranscript: { type: String, default: '' },
      durationSeconds: { type: Number, default: 0 },
    },
    codeExecution: {
      passedAll: { type: Boolean, default: false },
      passedTestsCount: { type: Number, default: 0 },
      totalTestsCount: { type: Number, default: 0 },
      rawOutput: { type: String, default: '' },
      error: { type: String, default: '' },
      runtimeMs: { type: Number, default: 0 },
    },
    aiFeedback: {
      overallScore: { type: Number, required: true, default: 70 }, // 0 to 100
      correctnessScore: { type: Number, default: 70 },
      clarityScore: { type: Number, default: 70 },
      complexityScore: { type: Number, default: 70 }, // For code / design
      timeComplexity: { type: String, default: 'N/A' },
      spaceComplexity: { type: String, default: 'N/A' },
      strengths: [String],
      improvements: [String],
      detailedAnalysis: String,
      modelAnswer: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Answer', AnswerSchema);
