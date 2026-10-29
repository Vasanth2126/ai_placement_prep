const Profile = require('../models/Profile');
const { calculatePlacementReadiness, computeNextBestAction } = require('../services/placementEngine');

const LEARNING_MODULES = [
  {
    id: 'module-sql-joins',
    title: 'SQL Multi-Table JOIN Masterclass & Practice',
    topic: 'Database & SQL',
    category: 'Database',
    description: 'Master INNER, LEFT, RIGHT, and FULL OUTER joins with real schema query puzzles in 15 minutes.',
    whyNeeded: 'Crucial for passing multi-table relational query rounds in technical interviews.',
    difficulty: 'Intermediate',
    estimatedTime: '15 mins',
    prerequisites: ['Basic SELECT queries', 'Primary and Foreign Keys'],
    relatedSkill: 'SQL & Relational Databases',
    scoreBoostEstimate: 8,
    keyTakeaways: [
      'INNER JOIN returns matching rows across both tables only.',
      'LEFT JOIN preserves all rows from the primary table, filling missing right table attributes with NULL.',
      'Use COALESCE() to handle NULL default values gracefully.',
      'Always qualify columns with table aliases when joining identical attribute names.',
    ],
    resources: [
      { title: 'Interactive SQL Fiddle Sandbox', type: 'interactive', url: 'https://sqlfiddle.com/', provider: 'SQLFiddle', duration: '5 mins' },
      { title: 'Visual Guide to SQL Joins', type: 'documentation', url: 'https://www.postgresqltutorial.com/postgresql-tutorial/postgresql-joins/', provider: 'PostgreSQL Tutorial', duration: '5 mins' },
      { title: 'Complex Joins Cheat Sheet', type: 'cheatsheet', url: 'https://quickref.me/sql', provider: 'QuickRef', duration: '5 mins' },
    ],
  },
  {
    id: 'module-docker-basics',
    title: 'Docker Fundamentals for Modern Developers',
    topic: 'Containers & DevOps',
    category: 'Framework',
    description: 'Build lightweight multi-stage Dockerfiles, manage volumes, and wire multi-container apps with docker-compose.',
    whyNeeded: '88% of tech job descriptions mandate containerized application deployment.',
    difficulty: 'Beginner',
    estimatedTime: '15 mins',
    prerequisites: ['Basic Command Line / Terminal familiarity'],
    relatedSkill: 'Docker & DevOps Pipelines',
    scoreBoostEstimate: 7,
    keyTakeaways: [
      'Docker images are immutable layered blueprints built from Dockerfile instructions.',
      'Use multi-stage builds (`AS builder`) to drastically reduce production image sizes.',
      'Never run container processes as root in production; configure `USER node` or non-root user.',
      'Use named volumes for persistent data like PostgreSQL databases.',
    ],
    resources: [
      { title: 'Docker Official 101 Tutorial', type: 'documentation', url: 'https://docs.docker.com/get-started/', provider: 'Docker Docs', duration: '7 mins' },
      { title: 'Writing Production Dockerfiles', type: 'documentation', url: 'https://snyk.io/blog/10-best-practices-to-containerize-nodejs-web-applications-with-docker/', provider: 'Snyk Security', duration: '8 mins' },
    ],
  },
  {
    id: 'module-dsa-trees',
    title: 'Binary Tree Traversal Patterns (DFS & BFS)',
    topic: 'Data Structures & Algorithms',
    category: 'Core CS',
    description: 'Learn when to apply recursion for Pre/In/Post-order DFS vs Queue-based Level-Order BFS.',
    whyNeeded: 'Tree traversal questions appear in over 60% of Tier-1 initial coding screening rounds.',
    difficulty: 'Intermediate',
    estimatedTime: '15 mins',
    prerequisites: ['Recursion basics', 'Queues and Stacks'],
    relatedSkill: 'Data Structures & Algorithms',
    scoreBoostEstimate: 6,
    keyTakeaways: [
      'In-Order traversal on a Binary Search Tree (BST) visits keys in sorted ascending order.',
      'BFS (Level Order) uses a Queue (FIFO) and is ideal for finding the shortest path in unweighted graphs/trees.',
      'DFS uses the Call Stack or an explicit Stack (LIFO) and is ideal for exhaustive branch exploration.',
    ],
    resources: [
      { title: 'Visual Tree Traversal Explorer', type: 'interactive', url: 'https://visualgo.net/en/bst', provider: 'VisuAlgo', duration: '8 mins' },
      { title: 'LeetCode Tree Pattern Guide', type: 'documentation', url: 'https://leetcode.com/explore/', provider: 'LeetCode', duration: '7 mins' },
    ],
  },
  {
    id: 'module-redis-caching',
    title: 'System Design: Redis Caching & Latency Reduction',
    topic: 'System Design & Scalability',
    category: 'Technical',
    description: 'Understand Cache-Aside, Write-Through, Write-Behind strategies and avoiding Cache Stampede.',
    whyNeeded: 'System design rounds heavily test caching trade-offs and invalidation mechanisms.',
    difficulty: 'Intermediate',
    estimatedTime: '15 mins',
    prerequisites: ['Client-Server Architecture', 'REST APIs'],
    relatedSkill: 'System Design & Distributed Scalability',
    scoreBoostEstimate: 6,
    keyTakeaways: [
      'Cache-Aside (Lazy Loading) only reads from the cache; on miss, fetches from DB and populates cache.',
      'Set an explicit TTL (Time-To-Live) and jitter on cache keys to avoid simultaneous cache stampedes.',
      'Redis in-memory read latencies are sub-millisecond compared to relational disk scans.',
    ],
    resources: [
      { title: 'System Design Primer: Caching', type: 'documentation', url: 'https://github.com/donnemartin/system-design-primer#caching', provider: 'System Design Primer', duration: '10 mins' },
      { title: 'Redis Architectural Patterns', type: 'cheatsheet', url: 'https://redis.io/docs/manual/patterns/', provider: 'Redis Docs', duration: '5 mins' },
    ],
  },
];

/**
 * @desc    Get all micro-learning modules
 * @route   GET /api/learning/modules
 * @access  Private
 */
const getLearningModules = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    let profile = await Profile.findOne({ user: userId });
    const completed = profile?.completedModules || [];

    const modules = LEARNING_MODULES.map(m => ({
      ...m,
      completed: completed.includes(m.id),
    }));

    res.json({
      success: true,
      data: modules,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Complete a module and apply score boost
 * @route   POST /api/learning/:id/complete
 * @access  Private
 */
const completeLearningModule = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;

    const moduleItem = LEARNING_MODULES.find(m => m.id === id);
    if (!moduleItem) {
      return res.status(404).json({ success: false, message: 'Learning module not found' });
    }

    let profile = await Profile.findOne({ user: userId });
    if (profile) {
      if (!profile.completedModules.includes(id)) {
        profile.completedModules.push(id);
      }

      // Boost skill
      const skill = profile.skills.find(s =>
        s.name.toLowerCase().includes(moduleItem.relatedSkill.toLowerCase()) ||
        moduleItem.relatedSkill.toLowerCase().includes(s.name.toLowerCase())
      );
      if (skill) {
        skill.score = Math.min(100, (skill.score || 50) + moduleItem.scoreBoostEstimate);
        skill.level = skill.score >= 75 ? 'Strong' : 'Good';
        skill.lastAssessed = 'Just now';
      }

      profile.readiness = calculatePlacementReadiness(profile);
      await profile.save();
    }

    const nextBestAction = profile ? computeNextBestAction(profile) : null;

    res.json({
      success: true,
      message: `Completed "${moduleItem.title}"! +${moduleItem.scoreBoostEstimate}% skill boost applied.`,
      data: {
        moduleId: id,
        recalibratedReadiness: profile?.readiness,
        nextBestAction,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLearningModules,
  completeLearningModule,
};
