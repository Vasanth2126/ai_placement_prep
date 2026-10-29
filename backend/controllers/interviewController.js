const Session = require('../models/Session');
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const Profile = require('../models/Profile');
const User = require('../models/User');
const { evaluateAnswer, generateProjectDefenseQuestions, fetchGithubRepoSummary } = require('../services/aiService');
const { sampleQuestions } = require('../utils/seedData');
const { calculatePlacementReadiness, computeNextBestAction } = require('../services/placementEngine');

const PROJECT_DEFENSE_QUESTIONS = [
  {
    id: 'proj-1',
    title: 'Architectural Trade-offs & Tech Stack Justification',
    description: 'Explain why you selected your chosen database and frontend/backend framework for your flagship project. What were the specific latency, concurrency, or scale trade-offs you evaluated against alternatives?',
    type: 'project-defense',
    topic: 'Architecture & System Decisions',
    hints: ['Discuss why NoSQL vs SQL was chosen', 'State throughput and scalability considerations'],
  },
  {
    id: 'proj-2',
    title: 'Failure Modes, Edge Cases & Error Recovery',
    description: 'Describe the worst edge case or unexpected failure mode your system encountered in development or testing. How did you diagnose the root cause and ensure graceful degradation?',
    type: 'project-defense',
    topic: 'Reliability & Debugging',
    hints: ['Discuss timeout thresholds, circuit breakers, or input validation'],
  },
  {
    id: 'proj-3',
    title: 'Production Metrics & Bottleneck Optimization',
    description: 'What key metrics (e.g. p99 response latency, queries per second, model inference time, memory footprint) did you benchmark? If traffic increased 100x overnight, where would the system break first?',
    type: 'project-defense',
    topic: 'Scalability & Performance',
    hints: ['Identify the database or external API bottleneck', 'Explain caching or horizontal partitioning solutions'],
  },
];

/**
 * @desc    Configure and initialize Project Defense with custom project details & repo
 * @route   POST /api/interview/project-defense/init
 * @access  Private
 */
const initProjectDefense = async (req, res, next) => {
  try {
    const { title, description, techStack, repoUrl } = req.body;
    const userId = req.user?._id || req.user?.id || 'demo_user';

    let repoSummary = null;
    if (repoUrl && repoUrl.trim()) {
      repoSummary = await fetchGithubRepoSummary(repoUrl.trim());
    }

    const projectDetails = {
      title: (title || '').trim() || (repoSummary?.fullName ? `Project: ${repoSummary.fullName}` : 'Flagship Architecture Project'),
      description: (description || '').trim() || (repoSummary?.description || 'Full stack system implementation'),
      techStack: techStack || (repoSummary?.language ? [repoSummary.language, ...(repoSummary.topics || [])] : ['React', 'Node.js', 'PostgreSQL']),
      repoUrl: repoUrl || '',
      repoSummary,
    };

    const customizedQuestions = await generateProjectDefenseQuestions(projectDetails);

    let session;
    try {
      session = await Session.create({
        user: userId,
        mode: 'project-defense',
        topic: `Project Defense: ${projectDetails.title}`,
        difficulty: 'Hard',
        questions: customizedQuestions.map((q) => q.id || 'mock_' + Math.random()),
        status: 'in-progress',
      });
    } catch (dbErr) {
      session = {
        _id: 'session_' + Date.now(),
        user: userId,
        mode: 'project-defense',
        topic: `Project Defense: ${projectDetails.title}`,
        difficulty: 'Hard',
        questions: customizedQuestions,
        status: 'in-progress',
      };
    }

    res.json({
      success: true,
      sessionId: session._id,
      session,
      projectDetails,
      questions: customizedQuestions,
      repoSummary,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's resume projects for easy project selection
 * @route   GET /api/interview/project-defense/projects
 * @access  Private
 */
const getUserResumeProjects = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.user?.id;
    let projects = [];

    if (userId) {
      try {
        const user = await User.findById(userId);
        if (user && Array.isArray(user.resumeProjects) && user.resumeProjects.length > 0) {
          projects = user.resumeProjects;
        }
      } catch (e) {}
    }

    res.json({
      success: true,
      projects,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Start an interview session (Text, Code, Voice, or Project Defense)
 * @route   POST /api/interview/session
 * @access  Private
 */
const startSession = async (req, res, next) => {
  try {
    const { mode, topic, difficulty, projectDetails } = req.body;

    let selectedQuestions = [];

    if (mode === 'project-defense') {
      if (projectDetails && (projectDetails.title || projectDetails.description || projectDetails.repoUrl)) {
        selectedQuestions = await generateProjectDefenseQuestions(projectDetails);
      } else {
        selectedQuestions = PROJECT_DEFENSE_QUESTIONS;
      }
    } else {
      try {
        const query = {};
        if (mode && mode !== 'project-defense') query.type = mode;
        if (topic && topic !== 'All Topics') query.topic = topic;
        if (difficulty && difficulty !== 'Mixed') query.difficulty = difficulty;

        selectedQuestions = await Question.find(query).limit(5);

        if (selectedQuestions.length === 0) {
          selectedQuestions = sampleQuestions
            .filter((q) => (!mode || q.type === mode))
            .slice(0, 4);
        }
      } catch (e) {
        selectedQuestions = sampleQuestions
          .filter((q) => (!mode || q.type === mode))
          .slice(0, 4);
      }

      if (selectedQuestions.length === 0) {
        selectedQuestions = sampleQuestions.slice(0, 3);
      }
    }

    let session;
    try {
      session = await Session.create({
        user: req.user?._id || req.user?.id || 'demo_user',
        mode: mode || 'text',
        topic: topic || 'All Topics',
        difficulty: difficulty || 'Medium',
        questions: selectedQuestions.map((q) => q._id || q.id || 'mock_' + Math.random()),
        status: 'in-progress',
      });
    } catch (dbErr) {
      session = {
        _id: 'session_' + Date.now(),
        user: req.user?._id || 'demo_user',
        mode: mode || 'text',
        topic: topic || 'All Topics',
        difficulty: difficulty || 'Medium',
        questions: selectedQuestions,
        currentQuestionIndex: 0,
        status: 'in-progress',
      };
    }

    res.status(201).json({
      success: true,
      sessionId: session._id,
      session,
      questions: selectedQuestions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Submit an answer and get AI evaluation feedback with STAR & Filler Word telemetry
 * @route   POST /api/interview/answer
 * @access  Private
 */
const submitAnswer = async (req, res, next) => {
  try {
    const { sessionId, questionId, userResponse, mode, projectContext, questionData } = req.body;
    const userId = req.user?._id || req.user?.id || 'demo_user';

    const responseText = (
      typeof userResponse === 'string'
        ? userResponse
        : (userResponse?.audioTranscript || userResponse?.text || userResponse?.code || '')
    ).trim();

    if (!responseText || responseText.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'User response payload is required',
      });
    }

    let question = questionData || PROJECT_DEFENSE_QUESTIONS.find(q => q.id === questionId);
    if (!question) {
      try {
        question = await Question.findById(questionId);
      } catch (e) {}
    }

    if (!question) {
      question = sampleQuestions.find((q) => q.title === questionId || q._id === questionId) || {
        title: questionData?.title || 'Interview Technical Assessment',
        description: questionData?.description || 'Candidate problem solving evaluation.',
        topic: questionData?.topic || 'General Technical',
        type: mode || 'text',
      };
    }

    // Call AI evaluation service with projectContext
    const aiFeedback = await evaluateAnswer(question, responseText, mode || question.type || 'text', projectContext);

    // Filler word detection
    const detectedFillers = [];
    ['um', 'uh', 'like', 'you know', 'basically', 'actually', 'sort of', 'kind of'].forEach(filler => {
      const regex = new RegExp(`\\b${filler}\\b`, 'gi');
      const matches = responseText.match(regex);
      if (matches && matches.length > 0) {
        detectedFillers.push(`${filler} (${matches.length}x)`);
      }
    });

    aiFeedback.fillerWordsDetected = detectedFillers;

    // Generate contextual follow-up counter-question for simulated panel pressure
    if (mode === 'project-defense' || mode === 'voice') {
      const targetProj = projectContext?.title ? `in ${projectContext.title}` : 'on this exact path';
      aiFeedback.followUpQuestion = `Follow-up challenge: If our production telemetry observed a sudden 3x spike in latency ${targetProj}, which profiling tool would you attach first and how would you prove your fix resolved the root cause?`;
    }

    let answerRecord;
    try {
      answerRecord = await Answer.create({
        session: sessionId || 'demo_session',
        user: userId || 'demo_user',
        question: question._id || questionId,
        userResponse,
        aiFeedback,
      });
    } catch (dbErr) {
      answerRecord = {
        _id: 'ans_' + Date.now(),
        session: sessionId,
        question: question._id || questionId,
        userResponse,
        aiFeedback,
      };
    }

    // Recalibrate Placement Twin interview score
    try {
      let profile = await Profile.findOne({ user: userId });
      if (profile) {
        const newScore = typeof aiFeedback.overallScore === 'number' ? aiFeedback.overallScore : 0;
        profile.readiness.interview = Math.round(((profile.readiness.interview || 58) * 0.7) + (newScore * 0.3));
        profile.readiness = calculatePlacementReadiness(profile);
        await profile.save();
      }
    } catch (e) {}

    res.json({
      success: true,
      message: 'Evaluation generated successfully',
      feedback: aiFeedback,
      answerId: answerRecord._id,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Complete session & compute aggregated score breakdown
 * @route   POST /api/interview/session/complete
 * @access  Private
 */
const completeSession = async (req, res, next) => {
  try {
    const { sessionId, durationMinutes, answers = [] } = req.body;
    const userId = req.user?._id || req.user?.id || 'demo_user';

    let averageScore = 0;
    if (answers.length > 0) {
      const total = answers.reduce((acc, curr) => acc + (typeof curr.aiFeedback?.overallScore === 'number' ? curr.aiFeedback.overallScore : 0), 0);
      averageScore = Math.round(total / answers.length);
    }

    const feedbackSummary = {
      overallVerdict:
        averageScore >= 85
          ? 'Strong Hire / Exceptional Technical Clarity & Project Ownership'
          : averageScore >= 70
          ? 'Clear Hire with minor edge case and metric polish recommended'
          : 'Candidate demonstrates potential; recommend targeted practice on core system bottlenecks.',
      strengths: [
        'Structured problem approach and clear articulation of ideas',
        'Familiarity with fundamental software development patterns and trade-offs',
        'Effective delivery pacing within allocated session time',
      ],
      weaknesses: [
        'Consider proactively quantifying performance metrics (p99 latency, RPS, memory footprints)',
        'Refine communication brevity using structured frameworks like STAR',
      ],
      recommendedTopics: [
        'System Design Bottlenecks & Redis Caching',
        'Advanced Big-O Time/Space Complexity',
        'Database Query Indexing & Profiling',
      ],
    };

    try {
      const session = await Session.findById(sessionId);
      if (session) {
        session.status = 'completed';
        session.totalScore = averageScore;
        session.durationMinutes = durationMinutes || 15;
        session.feedbackSummary = feedbackSummary;
        await session.save();
      }
    } catch (e) {}

    // Update Profile Placement Twin
    try {
      let profile = await Profile.findOne({ user: userId });
      if (profile) {
        profile.readiness.interview = Math.max(50, Math.min(100, averageScore));
        profile.readiness = calculatePlacementReadiness(profile);
        await profile.save();
      }
    } catch (e) {}

    res.json({
      success: true,
      message: 'Session completed successfully',
      summary: {
        sessionId,
        averageScore,
        durationMinutes: durationMinutes || 15,
        feedbackSummary,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  startSession,
  initProjectDefense,
  getUserResumeProjects,
  submitAnswer,
  completeSession,
};
