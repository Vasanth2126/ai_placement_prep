/**
 * Placement360 Placement Twin Engine
 * Calculates candidate readiness across 7 weighted dimensions:
 * Technical Skills (25%) + Target Role Alignment (15%) + Adaptive Assessments (15%)
 * + AI Mock Interview (15%) + Group Discussion (10%) + Communication (10%) + Resume ATS (10%)
 */

function calculatePlacementReadiness(profile) {
  const skills = profile.skills || [];
  const avgSkillScore = skills.length > 0
    ? Math.round(skills.reduce((acc, s) => acc + (s.score || 50), 0) / skills.length)
    : 65;

  const assessmentAttempts = profile.assessmentAttempts || [];
  const assessmentScore = assessmentAttempts.length > 0
    ? Math.round(assessmentAttempts.reduce((acc, a) => acc + (a.score || 60), 0) / assessmentAttempts.length)
    : (profile.readiness?.assessment || 55);

  const gdAttempts = profile.gdAttempts || [];
  const gdScore = gdAttempts.length > 0
    ? Math.round(gdAttempts.reduce((acc, g) => acc + (g.overallScore || 50), 0) / gdAttempts.length)
    : (profile.readiness?.gd || 50);

  const interviewScore = profile.readiness?.interview || 58;
  const communicationScore = profile.readiness?.communication || 65;
  const resumeScore = profile.readiness?.resume || 75;
  const roleAlignment = profile.readiness?.roleAlignment || 78;

  const overall = Math.round(
    avgSkillScore * 0.25 +
    roleAlignment * 0.15 +
    assessmentScore * 0.15 +
    interviewScore * 0.15 +
    gdScore * 0.10 +
    communicationScore * 0.10 +
    resumeScore * 0.10
  );

  return {
    overall: Math.min(100, Math.max(15, overall)),
    skills: avgSkillScore,
    assessment: assessmentScore,
    interview: interviewScore,
    gd: gdScore,
    communication: communicationScore,
    resume: resumeScore,
    roleAlignment,
  };
}

function computeNextBestAction(profile) {
  const skills = profile.skills || [];
  const sortedSkills = [...skills].sort((a, b) => (a.score || 0) - (b.score || 0));
  const weakestSkill = sortedSkills[0];

  // 1. SQL Bottleneck check
  const sqlSkill = skills.find(s => s.name?.toLowerCase().includes('sql'));
  if (sqlSkill && sqlSkill.score < 55) {
    return {
      id: 'nba-sql-joins',
      title: 'SQL Multi-Table JOIN Masterclass & Sprint',
      category: 'learning',
      description: 'Close your single biggest technical gap before campus technical screen rounds.',
      why: `Your SQL score is ${sqlSkill.score}%. Target ${profile.targetRole || 'Software Engineer'} campus hiring requires >= 70% in relational queries.`,
      timeEstimate: '15 minutes',
      priority: 'High',
      actionUrl: '/learning',
      actionText: 'Start 15-Min Focused Practice',
    };
  }

  // 2. Unattempted or low Assessment check
  if ((profile.readiness?.assessment || 50) < 60) {
    return {
      id: 'nba-adaptive-assessment',
      title: 'Take Core Technical Diagnostic Assessment',
      category: 'assessment',
      description: 'Calibrate your technical benchmark across Data Structures, Algorithms, and System Design.',
      why: 'Diagnostic tests recalibrate your Placement Twin in real-time and unlock Tier-1 recruiter match eligibility.',
      timeEstimate: '10 minutes',
      priority: 'High',
      actionUrl: '/assessment',
      actionText: 'Take 10-Min Assessment',
    };
  }

  // 3. Low GD check
  const bookedGds = profile.bookedGDSessions || [];
  if ((profile.readiness?.gd || 50) < 55 && bookedGds.length === 0) {
    return {
      id: 'nba-gd-practice',
      title: 'Join Live Peer & AI Group Discussion Room',
      category: 'gd',
      description: 'Master the PREP structure (Point, Reason, Example, Point) and active turn-taking.',
      why: 'Campus elimination rounds filter heavily on verbal entry confidence and concise argument delivery.',
      timeEstimate: '20 minutes',
      priority: 'High',
      actionUrl: '/gd',
      actionText: 'Join Live GD Room',
    };
  }

  // 4. Project Defense Interview check
  if ((profile.readiness?.interview || 50) < 65) {
    return {
      id: 'nba-project-defense',
      title: 'Simulate AI Project Defense Arena',
      category: 'interview',
      description: 'Face panel pressure probing your resume projects, architectural trade-offs, and metrics.',
      why: 'Top tech panels rigorously test whether you personally built your projects or followed tutorials.',
      timeEstimate: '15 minutes',
      priority: 'High',
      actionUrl: '/interview/project-defense',
      actionText: 'Start Project Defense',
    };
  }

  // Default NBA
  return {
    id: `nba-skill-${weakestSkill?.id || 'core'}`,
    title: `Sharpen ${weakestSkill ? weakestSkill.name : 'Core CS Fundamentals'}`,
    category: 'learning',
    description: 'Keep your placement readiness momentum advancing toward Tier-1 eligibility.',
    why: 'Continuous micro-practice builds compound confidence across technical and soft skill screens.',
    timeEstimate: '15 minutes',
    priority: 'Medium',
    actionUrl: '/learning',
    actionText: 'Explore Micro-Learning',
  };
}

module.exports = {
  calculatePlacementReadiness,
  computeNextBestAction,
};
