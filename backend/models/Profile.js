const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  personalInfo: {
    name: { type: String, default: 'Candidate' },
    email: { type: String, default: '' },
    degree: { type: String, default: 'B.Tech' },
    branch: { type: String, default: 'Computer Science & Engineering' },
    graduationYear: { type: String, default: '2025' },
    semester: { type: String, default: '7th Semester' },
    college: { type: String, default: 'Engineering College' },
  },
  targetRole: {
    type: String,
    default: 'Full Stack Developer',
  },
  secondaryRoles: [{ type: String }],
  targetCompanies: [{ type: String }],
  availableDailyMinutes: { type: Number, default: 90 },
  careerGoals: { type: String, default: 'Crack a Tier-1 tech fresher role (10-20 LPA).' },
  rawResumeText: { type: String, default: '' },

  readiness: {
    overall: { type: Number, default: 62 },
    skills: { type: Number, default: 70 },
    assessment: { type: Number, default: 55 },
    interview: { type: Number, default: 58 },
    gd: { type: Number, default: 50 },
    communication: { type: Number, default: 65 },
    resume: { type: Number, default: 75 },
    roleAlignment: { type: Number, default: 78 },
  },

  skills: [
    {
      id: String,
      name: String,
      category: { type: String, default: 'Technical' },
      level: { type: String, default: 'Good' },
      score: { type: Number, default: 60 },
      marketDemand: { type: String, default: 'High' },
      lastAssessed: { type: String, default: 'Recently' },
      subskills: [
        {
          id: String,
          name: String,
          status: { type: String, default: 'practicing' },
        },
      ],
    },
  ],

  completedModules: [{ type: String }],
  bookedGDSessions: [{ type: String }],
  assessmentAttempts: [
    {
      assessmentId: String,
      title: String,
      score: Number,
      date: { type: Date, default: Date.now },
      correctCount: Number,
      totalQuestions: Number,
    },
  ],
  gdAttempts: [
    {
      sessionId: String,
      topic: String,
      date: { type: Date, default: Date.now },
      overallScore: Number,
      participation: Number,
      prepScore: Number,
      strengths: [String],
    },
  ],
  achievements: [
    {
      id: String,
      title: String,
      description: String,
      date: String,
      icon: String,
    },
  ],
  weeklyHistory: [
    {
      week: String,
      readiness: Number,
      techScore: Number,
      gdScore: Number,
      interviewScore: Number,
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model('Profile', ProfileSchema);
