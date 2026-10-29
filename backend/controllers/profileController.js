const Profile = require('../models/Profile');
const { calculatePlacementReadiness, computeNextBestAction } = require('../services/placementEngine');

const DEFAULT_SKILLS = [
  {
    id: 'skill-python-js',
    name: 'Core JavaScript & Python',
    category: 'Technical',
    level: 'Strong',
    score: 82,
    marketDemand: 'Very High',
    lastAssessed: '2 days ago',
    subskills: [
      { id: 'sk-1', name: 'Async / Await & Promises', status: 'mastered' },
      { id: 'sk-2', name: 'Event Loop & Closures', status: 'mastered' },
      { id: 'sk-3', name: 'Data Structures Implementation', status: 'practicing' },
    ],
  },
  {
    id: 'skill-react-frontend',
    name: 'React.js & Frontend Architecture',
    category: 'Framework',
    level: 'Strong',
    score: 78,
    marketDemand: 'Very High',
    lastAssessed: '3 days ago',
    subskills: [
      { id: 'sk-4', name: 'Hooks & State Management', status: 'mastered' },
      { id: 'sk-5', name: 'DOM Performance & Virtual DOM', status: 'mastered' },
      { id: 'sk-6', name: 'SSR vs SPA Trade-offs', status: 'practicing' },
    ],
  },
  {
    id: 'skill-sql',
    name: 'SQL & Relational Databases',
    category: 'Database',
    level: 'Needs Practice',
    score: 44,
    marketDemand: 'Very High',
    lastAssessed: 'Yesterday',
    subskills: [
      { id: 'sk-7', name: 'SELECT, WHERE, Aggregates', status: 'mastered' },
      { id: 'sk-8', name: 'INNER, LEFT, FULL OUTER JOINs', status: 'weak' },
      { id: 'sk-9', name: 'Indexing & Query Optimization', status: 'weak' },
      { id: 'sk-10', name: 'Window Functions (RANK, PARTITION)', status: 'missing' },
    ],
  },
  {
    id: 'skill-dsa',
    name: 'Data Structures & Algorithms',
    category: 'Core CS',
    level: 'Needs Practice',
    score: 48,
    marketDemand: 'Very High',
    lastAssessed: '4 days ago',
    subskills: [
      { id: 'sk-11', name: 'Arrays & Hash Maps', status: 'mastered' },
      { id: 'sk-12', name: 'Trees & Traversals (DFS/BFS)', status: 'practicing' },
      { id: 'sk-13', name: 'Dynamic Programming & Memoization', status: 'weak' },
      { id: 'sk-14', name: 'Graphs & Shortest Path', status: 'missing' },
    ],
  },
  {
    id: 'skill-system-design',
    name: 'System Design & Distributed Scalability',
    category: 'Technical',
    level: 'Good',
    score: 64,
    marketDemand: 'High',
    lastAssessed: 'Last week',
    subskills: [
      { id: 'sk-15', name: 'Load Balancing & Caching (Redis)', status: 'practicing' },
      { id: 'sk-16', name: 'Database Sharding & Replication', status: 'practicing' },
      { id: 'sk-17', name: 'Microservices & Message Queues (Kafka)', status: 'weak' },
    ],
  },
  {
    id: 'skill-docker',
    name: 'Docker & DevOps Pipelines',
    category: 'Framework',
    level: 'Needs Practice',
    score: 42,
    marketDemand: 'Very High',
    lastAssessed: '5 days ago',
    subskills: [
      { id: 'sk-18', name: 'Dockerfile Optimization & Multi-stage', status: 'weak' },
      { id: 'sk-19', name: 'Docker Compose Networking', status: 'weak' },
      { id: 'sk-20', name: 'CI/CD GitHub Actions', status: 'missing' },
    ],
  },
];

const DEFAULT_WEEKLY_HISTORY = [
  { week: 'Week 1 (Diagnostic Baseline)', readiness: 42, techScore: 48, gdScore: 35, interviewScore: 40 },
  { week: 'Week 2 (Core DS & SQL Basics)', readiness: 49, techScore: 56, gdScore: 40, interviewScore: 48 },
  { week: 'Week 3 (Micro-Sprints & PREP GD)', readiness: 58, techScore: 68, gdScore: 48, interviewScore: 54 },
  { week: 'Week 4 (Current Placement Twin)', readiness: 65, techScore: 74, gdScore: 55, interviewScore: 62 },
];

const DEFAULT_ACHIEVEMENTS = [
  { id: 'ach-1', title: 'Placement Twin Calibrated', description: 'Established baseline across all 7 readiness dimensions', date: 'Initial Setup', icon: '🎯' },
  { id: 'ach-2', title: '15-Min Sprint Pioneer', description: 'Completed first targeted bottleneck learning module', date: 'Yesterday', icon: '⚡' },
  { id: 'ach-3', title: 'PREP GD Contender', description: 'Delivered structured Point-Reason-Example argument in live GD', date: '2 days ago', icon: '🗣️' },
];

// Helper to get or create profile
async function getOrCreateProfile(userId, userName, userEmail) {
  let profile = await Profile.findOne({ user: userId });
  if (!profile) {
    profile = await Profile.create({
      user: userId,
      personalInfo: {
        name: userName || 'Student Candidate',
        email: userEmail || 'student@campus.edu',
        degree: 'B.Tech',
        branch: 'Computer Science & Engineering',
        graduationYear: '2025',
        semester: '7th Semester',
        college: 'National Institute of Technology',
      },
      targetRole: 'Full Stack Developer',
      secondaryRoles: ['Software Development Engineer', 'Backend Developer', 'Machine Learning Engineer'],
      targetCompanies: ['Google', 'Microsoft', 'Amazon', 'Atlassian', 'Swiggy', 'Zomato'],
      availableDailyMinutes: 90,
      skills: DEFAULT_SKILLS,
      weeklyHistory: DEFAULT_WEEKLY_HISTORY,
      achievements: DEFAULT_ACHIEVEMENTS,
      readiness: {
        overall: 65,
        skills: 74,
        assessment: 55,
        interview: 62,
        gd: 55,
        communication: 68,
        resume: 78,
        roleAlignment: 80,
      },
    });
  }
  return profile;
}

/**
 * @desc    Get complete candidate Placement Twin profile
 * @route   GET /api/profile
 * @access  Private
 */
const getProfile = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.user?.id || '66a1234567890123456789ab';
    let profile = null;
    try {
      profile = await Profile.findOne({ user: userId });
    } catch (e) {}

    if (!profile) {
      try {
        profile = await getOrCreateProfile(userId, req.user?.name, req.user?.email);
      } catch (e) {
        profile = {
          personalInfo: {
            name: req.user?.name || 'Student Candidate',
            email: req.user?.email || 'student@campus.edu',
            degree: 'B.Tech',
            branch: 'Computer Science & Engineering',
            graduationYear: '2025',
            semester: '7th Semester',
            college: 'National Institute of Technology',
          },
          targetRole: 'Full Stack Developer',
          secondaryRoles: ['Software Development Engineer', 'Backend Developer', 'Machine Learning Engineer'],
          targetCompanies: ['Google', 'Microsoft', 'Amazon', 'Atlassian', 'Swiggy', 'Zomato'],
          availableDailyMinutes: 90,
          skills: DEFAULT_SKILLS,
          weeklyHistory: DEFAULT_WEEKLY_HISTORY,
          achievements: DEFAULT_ACHIEVEMENTS,
          readiness: {
            overall: 65,
            skills: 74,
            assessment: 55,
            interview: 62,
            gd: 55,
            communication: 68,
            resume: 78,
            roleAlignment: 80,
          },
        };
      }
    }

    // Recalculate readiness and next best action dynamically
    const dynamicReadiness = calculatePlacementReadiness(profile);
    const nextBestAction = computeNextBestAction(profile);
    const profileData = profile.toObject ? profile.toObject() : profile;

    res.json({
      success: true,
      data: {
        ...profileData,
        readiness: dynamicReadiness,
        nextBestAction,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update candidate profile & target role calibration
 * @route   PUT /api/profile
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    let profile = await Profile.findOne({ user: userId });

    if (!profile) {
      profile = await getOrCreateProfile(userId, req.user.name, req.user.email);
    }

    const {
      personalInfo,
      targetRole,
      secondaryRoles,
      targetCompanies,
      availableDailyMinutes,
      careerGoals,
      rawResumeText,
      readiness,
    } = req.body;

    if (personalInfo) profile.personalInfo = { ...profile.personalInfo, ...personalInfo };
    if (targetRole) profile.targetRole = targetRole;
    if (secondaryRoles) profile.secondaryRoles = secondaryRoles;
    if (targetCompanies) profile.targetCompanies = targetCompanies;
    if (availableDailyMinutes) profile.availableDailyMinutes = availableDailyMinutes;
    if (careerGoals) profile.careerGoals = careerGoals;
    if (rawResumeText) profile.rawResumeText = rawResumeText;
    if (readiness) profile.readiness = { ...profile.readiness, ...readiness };

    // Recalculate
    profile.readiness = calculatePlacementReadiness(profile);
    await profile.save();

    const nextBestAction = computeNextBestAction(profile);

    res.json({
      success: true,
      message: 'Placement Twin profile updated and recalibrated successfully',
      data: {
        ...profile.toObject(),
        nextBestAction,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Record completed micro-learning sprint and boost associated skill
 * @route   POST /api/profile/complete-module
 * @access  Private
 */
const completeModule = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { moduleId, relatedSkillName, scoreBoost = 6 } = req.body;

    let profile = await Profile.findOne({ user: userId });
    if (!profile) {
      profile = await getOrCreateProfile(userId, req.user.name, req.user.email);
    }

    if (!profile.completedModules.includes(moduleId)) {
      profile.completedModules.push(moduleId);
    }

    // Boost corresponding skill
    if (relatedSkillName && profile.skills) {
      const skill = profile.skills.find(s =>
        s.name.toLowerCase().includes(relatedSkillName.toLowerCase()) ||
        relatedSkillName.toLowerCase().includes(s.name.toLowerCase())
      );
      if (skill) {
        skill.score = Math.min(100, (skill.score || 50) + scoreBoost);
        skill.level = skill.score >= 75 ? 'Strong' : skill.score >= 60 ? 'Good' : 'Needs Practice';
        skill.lastAssessed = 'Just now';
        if (skill.subskills) {
          const weakSub = skill.subskills.find(sub => sub.status === 'weak' || sub.status === 'missing');
          if (weakSub) weakSub.status = 'mastered';
        }
      }
    }

    profile.readiness = calculatePlacementReadiness(profile);
    await profile.save();

    const nextBestAction = computeNextBestAction(profile);

    res.json({
      success: true,
      message: `Module completed! +${scoreBoost}% skill boost applied.`,
      data: {
        readiness: profile.readiness,
        skills: profile.skills,
        nextBestAction,
        completedModules: profile.completedModules,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Recalibrate entire Placement Twin
 * @route   POST /api/profile/recalibrate
 * @access  Private
 */
const recalibrateProfile = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    let profile = await Profile.findOne({ user: userId });
    if (!profile) {
      profile = await getOrCreateProfile(userId, req.user.name, req.user.email);
    }

    profile.readiness = calculatePlacementReadiness(profile);
    await profile.save();

    const nextBestAction = computeNextBestAction(profile);

    res.json({
      success: true,
      message: 'Placement Twin successfully recalibrated across all 7 dimensions',
      data: {
        readiness: profile.readiness,
        nextBestAction,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  completeModule,
  recalibrateProfile,
};
