const Profile = require('../models/Profile');
const { calculatePlacementReadiness, computeNextBestAction } = require('../services/placementEngine');

let liveGDSessions = [
  {
    id: 'gd-session-1',
    topic: 'Should AI Agents Replace Junior Developers in Production CI/CD Pipelines?',
    category: 'AI & Tech',
    context: 'With LLM code agents writing and deploying code autonomously, tech organizations debate code quality, hallucination risks, and junior hiring pipelines.',
    rules: [
      'State your clear initial stance within the first 30 seconds using PREP.',
      'Acknowledge previous speaker points before introducing counter-arguments.',
      'Back statements with concrete software examples (e.g. unit tests, canary deployments).',
    ],
    date: 'Today',
    time: '04:00 PM IST',
    durationMinutes: 25,
    maxParticipants: 6,
    currentParticipants: 4,
    isBookedByMe: true,
    meetLink: 'https://meet.jit.si/Placement360-GD-Room-Alpha',
    isRealMeeting: true,
    meetingType: 'jitsi-live',
    status: 'live',
  },
  {
    id: 'gd-session-2',
    topic: 'Monolithic Architecture vs Microservices for Modern Fast-Scaling Startups',
    category: 'AI & Tech',
    context: 'Startups often face premature optimization when adopting distributed microservices too early vs modular monoliths.',
    rules: [
      'Focus on business latency, engineering overhead, and cloud infrastructure costs.',
      'Maintain conversational entry discipline without dominating speaking time.',
    ],
    date: 'Tomorrow',
    time: '06:00 PM IST',
    durationMinutes: 30,
    maxParticipants: 6,
    currentParticipants: 3,
    isBookedByMe: false,
    meetLink: 'https://meet.jit.si/Placement360-GD-Room-Beta',
    isRealMeeting: true,
    meetingType: 'jitsi-live',
    status: 'upcoming',
  },
  {
    id: 'gd-session-3',
    topic: 'Data Privacy & Ethics in Medical AI Diagnostics Systems',
    category: 'Ethics & Society',
    context: 'Balancing model training data accessibility with patient HIPAA/GDPR anonymization mandates.',
    rules: [
      'Discuss legal frameworks, federated learning, and bias mitigation.',
      'Summarize key consensus takeaways during final turns.',
    ],
    date: 'Saturday',
    time: '11:00 AM IST',
    durationMinutes: 25,
    maxParticipants: 8,
    currentParticipants: 5,
    isBookedByMe: false,
    meetLink: 'https://meet.jit.si/Placement360-GD-Room-Gamma',
    isRealMeeting: true,
    meetingType: 'jitsi-live',
    status: 'upcoming',
  },
];

/**
 * @desc    Get all GD sessions
 * @route   GET /api/gd/sessions
 * @access  Private
 */
const getGDSessions = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    let profile = await Profile.findOne({ user: userId });
    const bookedIds = profile?.bookedGDSessions || [];

    const sessions = liveGDSessions.map(s => ({
      ...s,
      isBookedByMe: bookedIds.includes(s.id) || s.isBookedByMe,
    }));

    res.json({
      success: true,
      data: sessions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Book or unbook a GD session
 * @route   POST /api/gd/book
 * @access  Private
 */
const bookGDSession = async (req, res, next) => {
  try {
    const { sessionId } = req.body;
    const userId = req.user._id || req.user.id;

    let profile = await Profile.findOne({ user: userId });
    if (!profile) return res.status(404).json({ success: false, message: 'Profile not found' });

    const isAlreadyBooked = profile.bookedGDSessions.includes(sessionId);
    if (isAlreadyBooked) {
      profile.bookedGDSessions = profile.bookedGDSessions.filter(id => id !== sessionId);
    } else {
      profile.bookedGDSessions.push(sessionId);
      // Boost GD readiness for taking proactive initiative
      profile.readiness.gd = Math.min(100, (profile.readiness.gd || 50) + 4);
    }

    profile.readiness = calculatePlacementReadiness(profile);
    await profile.save();

    res.json({
      success: true,
      message: isAlreadyBooked ? 'Session unbooked' : 'GD session booked successfully!',
      isBooked: !isAlreadyBooked,
      readiness: profile.readiness,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Evaluate student GD contribution using PREP (Point, Reason, Example, Point) framework
 * @route   POST /api/gd/evaluate
 * @access  Private
 */
const evaluateGDContribution = async (req, res, next) => {
  try {
    const { topic, speechTranscript = '', speakingSeconds = 0 } = req.body;
    const userId = req.user?._id || req.user?.id;

    const transcript = (speechTranscript || '').trim();
    const words = transcript ? transcript.split(/\s+/).filter(Boolean).length : 0;
    const lower = transcript.toLowerCase();

    // 1. Edge case: Zero or minimal greeting participation (e.g. "hello", "hi")
    if (words < 5) {
      const minScore = words === 0 ? 0 : Math.min(4, words * 2); // 0-4 marks for greetings like "hello"
      
      const scorecard = {
        overallScore: minScore,
        scoringSource: 'Pure GD Performance Evaluation (Speech, PREP & Collaboration only)',
        prepBreakdown: {
          hasPoint: false,
          hasReason: false,
          hasExample: false,
          hasConclusion: false,
          prepScore: 0,
        },
        substanceScore: words > 0 ? 4 : 0, // out of 100%
        fluencyScore: words > 0 ? 10 : 0,
        listeningScore: 0,
        detectedFillers: [],
        wordCount: words,
        strengths: words > 0 ? ['Greeting acknowledged'] : [],
        improvements: [
          'Minimal speech detected (' + words + ' words). In a Group Discussion, you must present arguments using the PREP framework (Point, Reason, Example, Point).',
          'Actively speak on the topic and counter peer arguments to earn technical and participation marks.',
        ],
      };

      if (userId) {
        let profile = await Profile.findOne({ user: userId });
        if (profile) {
          profile.gdAttempts.push({
            topic: topic || 'General Technical Group Discussion',
            overallScore: minScore,
            participation: Math.min(100, Math.round((speakingSeconds / 60) * 85)),
            prepScore: 0,
            strengths: scorecard.strengths,
          });
          const totalGD = profile.gdAttempts.reduce((acc, g) => acc + g.overallScore, 0);
          profile.readiness.gd = Math.round(totalGD / profile.gdAttempts.length);
          profile.readiness = calculatePlacementReadiness(profile);
          await profile.save();
        }
      }

      return res.json({
        success: true,
        data: scorecard,
      });
    }

    // Heuristic PREP detection
    const hasPoint = /i believe|my stance|in my opinion|firstly|crucial point|fundamentally|my point is|i argue|i support|i disagree/i.test(transcript);
    const hasReason = /because|due to|the reason|as a result|since|consequently|therefore this leads|this allows/i.test(transcript);
    const hasExample = /for example|for instance|such as|in case of|take the case|companies like|project|in production|netflix|google|uber|amazon/i.test(transcript);
    const hasConclusion = /therefore|to summarize|in conclusion|ultimately|in summary|to conclude|hence/i.test(transcript);

    // Conversational Rebuttal / Active Listening Detection
    const hasRebuttalOrReference = /agree with|disagree with|counter|building on|rohan|ananya|karthik|previous speaker|as mentioned earlier|point made by/i.test(transcript);

    // Detect common speech filler words
    const detectedFillers = [];
    ['um', 'uh', 'like', 'you know', 'basically', 'actually', 'sort of', 'kind of'].forEach(filler => {
      const regex = new RegExp(`\\b${filler}\\b`, 'gi');
      const matches = transcript.match(regex);
      if (matches && matches.length > 0) {
        detectedFillers.push(`${filler} (${matches.length}x)`);
      }
    });

    // 1. PREP Score (Max 40 pts, starts strictly at 0)
    let prepScore = 0;
    if (hasPoint) prepScore += 10;
    if (hasReason) prepScore += 10;
    if (hasExample) prepScore += 10;
    if (hasConclusion) prepScore += 10;

    // 2. Substance & Technical Depth (Max 25 pts, starts strictly at 0)
    let substanceScore = 0;
    if (words >= 15) substanceScore += 5;
    if (words >= 35) substanceScore += 7;
    if (words >= 60) substanceScore += 7;
    if (words >= 90) substanceScore += 6;

    // 3. Fluency & Filler Control (Max 20 pts)
    let fluencyScore = words >= 30 ? 18 : words >= 15 ? 10 : 5;
    const fillerPenalty = Math.min(10, detectedFillers.length * 2.5);
    fluencyScore = Math.max(2, Math.round(fluencyScore - fillerPenalty));

    // 4. Collaborative Listening & Rebuttal (Max 15 pts)
    let listeningScore = 0;
    if (hasRebuttalOrReference) {
      listeningScore = 15;
    } else if (words >= 30) {
      listeningScore = 5;
    }

    // Pure GD Overall Score (Sum of all 4 pillars = 100)
    const overallScore = Math.min(100, Math.max(0, prepScore + substanceScore + fluencyScore + listeningScore));

    const strengths = [];
    const improvements = [];

    if (hasPoint) strengths.push('Clear articulation of initial stance (P)');
    if (hasReason) strengths.push('Logical cause-and-effect justification (R)');
    if (hasExample) strengths.push('Concrete real-world validation / technical case study (E)');
    if (hasConclusion) strengths.push('Crisp summary takeaway (Final P)');
    if (hasRebuttalOrReference) strengths.push('Active listening: explicitly acknowledged other participants’ arguments');
    if (strengths.length === 0 && words >= 15) strengths.push('Participated in conversational dialogue');

    if (!hasPoint) improvements.push('Open your speaking turn by stating your direct stance (Point)');
    if (!hasReason) improvements.push('Provide logical reasoning using cause-and-effect (Reason)');
    if (!hasExample) improvements.push('Add concrete engineering or business examples (e.g. Netflix canary rollouts, Uber migrations)');
    if (!hasConclusion) improvements.push('Always close your turn with a 1-sentence final takeaway (Final Point)');
    if (!hasRebuttalOrReference) improvements.push('Reference previous speakers (e.g., "Building on Rohan’s point...") to boost collaboration score');
    if (detectedFillers.length > 0) improvements.push(`Reduce verbal filler habits: ${detectedFillers.join(', ')}`);
    if (words < 45) improvements.push('Elaborate with deeper technical trade-offs (aim for 45-60 words per speaking turn)');

    // Save pure GD attempt to profile if user exists
    if (userId) {
      let profile = await Profile.findOne({ user: userId });
      if (profile) {
        profile.gdAttempts.push({
          topic: topic || 'General Technical Group Discussion',
          overallScore,
          participation: Math.min(100, Math.round((speakingSeconds / 60) * 85)),
          prepScore: Math.round((prepScore / 40) * 100),
          strengths,
        });

        const totalGD = profile.gdAttempts.reduce((acc, g) => acc + g.overallScore, 0);
        profile.readiness.gd = Math.round(totalGD / profile.gdAttempts.length);
        profile.readiness = calculatePlacementReadiness(profile);
        await profile.save();
      }
    }

    res.json({
      success: true,
      data: {
        overallScore,
        scoringSource: 'Pure GD Performance Evaluation (Speech, PREP & Collaboration only)',
        prepBreakdown: {
          hasPoint,
          hasReason,
          hasExample,
          hasConclusion,
          prepScore: Math.round((prepScore / 40) * 100),
        },
        substanceScore: Math.round((substanceScore / 25) * 100),
        fluencyScore: Math.round((fluencyScore / 20) * 100),
        listeningScore: Math.round((listeningScore / 15) * 100),
        detectedFillers,
        wordCount: words,
        strengths,
        improvements,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGDSessions,
  bookGDSession,
  evaluateGDContribution,
};
