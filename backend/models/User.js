const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: 60,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    targetRole: {
      type: String,
      default: 'Full Stack Software Engineer',
    },
    targetCompany: {
      type: String,
      default: 'Top Tech / Tier-1 Product Companies',
    },
    experienceLevel: {
      type: String,
      enum: ['fresher', 'junior', 'mid', 'senior'],
      default: 'fresher',
    },
    resumeText: {
      type: String,
      default: '',
    },
    extractedSkills: {
      languages: [String],
      frameworks: [String],
      databases: [String],
      tools: [String],
      concepts: [String],
    },
    resumeProjects: [
      {
        title: String,
        description: String,
        techStack: [String],
      },
    ],
    streak: {
      currentStreak: { type: Number, default: 1 },
      lastActiveDate: { type: Date, default: Date.now },
      longestStreak: { type: Number, default: 1 },
      history: [Date],
    },
    hasUploadedResume: {
      type: Boolean,
      default: false,
    },
    overallReadinessScore: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
