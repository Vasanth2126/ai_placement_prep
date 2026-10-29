const Profile = require('../models/Profile');
const { calculatePlacementReadiness, computeNextBestAction } = require('../services/placementEngine');

const ASSESSMENTS = [
  {
    id: 'assessment-sql-diagnostic',
    title: 'Adaptive SQL & Relational Queries Diagnostic',
    category: 'Database & SQL',
    roleTarget: 'Full Stack Developer',
    description: 'Diagnoses your command over multi-table JOINs, subqueries, indexing performance, and aggregations.',
    estimatedMinutes: 10,
    questionsCount: 4,
    difficulty: 'Adaptive',
    highestScore: 50,
    attemptsCount: 1,
    questions: [
      {
        id: 'sql-q1',
        topic: 'SQL Joins',
        question: 'Which SQL JOIN returns all records from the left table and matched records from the right table, filling with NULL where there is no match?',
        options: [
          'INNER JOIN',
          'LEFT OUTER JOIN',
          'FULL OUTER JOIN',
          'CROSS JOIN',
        ],
        correctAnswer: 1,
        explanation: 'LEFT OUTER JOIN preserves all rows from the left table regardless of whether there is a matching row in the right table.',
        difficulty: 'Easy',
      },
      {
        id: 'sql-q2',
        topic: 'Query Performance & Indexing',
        question: 'What type of index scan is performed when an index is used to jump directly to matching row pointers without scanning the full table?',
        options: [
          'Sequential Table Scan',
          'B-Tree Index Seek',
          'Cartesian Scan',
          'Heap Buffer Pass',
        ],
        correctAnswer: 1,
        explanation: 'An Index Seek traverses the B-Tree directly using binary search logic, making it O(log N) rather than an O(N) sequential table scan.',
        difficulty: 'Medium',
      },
      {
        id: 'sql-q3',
        topic: 'Aggregates & Filtering',
        question: 'In standard SQL, which clause is required to filter groups produced by a GROUP BY clause based on an aggregate condition like COUNT() > 5?',
        options: [
          'WHERE',
          'HAVING',
          'QUALIFY',
          'ORDER BY',
        ],
        correctAnswer: 1,
        explanation: 'HAVING filters aggregated groups after the GROUP BY execution, whereas WHERE filters individual rows before aggregation occurs.',
        difficulty: 'Easy',
      },
      {
        id: 'sql-q4',
        topic: 'Window Functions',
        question: 'How does DENSE_RANK() differ from RANK() when two rows have equal ordering values?',
        options: [
          'RANK() skips rank numbers after duplicates (e.g. 1, 2, 2, 4), whereas DENSE_RANK() leaves no gaps (e.g. 1, 2, 2, 3)',
          'DENSE_RANK() skips ranks while RANK() does not',
          'DENSE_RANK() can only be used with COUNT()',
          'There is no difference between them',
        ],
        correctAnswer: 0,
        explanation: 'DENSE_RANK() maintains consecutive rank numbers without gaps when duplicate values occur.',
        difficulty: 'Hard',
      },
    ],
  },
  {
    id: 'assessment-dsa-diagnostic',
    title: 'Data Structures & Algorithmic Complexity',
    category: 'Core CS & DSA',
    roleTarget: 'Software Development Engineer',
    description: 'Tests time/space complexity analysis, tree traversals, two-pointer techniques, and memoization.',
    estimatedMinutes: 12,
    questionsCount: 4,
    difficulty: 'Adaptive',
    highestScore: null,
    attemptsCount: 0,
    questions: [
      {
        id: 'dsa-q1',
        topic: 'Two Pointer Technique',
        question: 'What is the optimal time complexity to find if a sorted array has a pair with sum equal to K?',
        options: [
          'O(N^2) using nested loops',
          'O(N) using two pointers initialized at start and end',
          'O(N log N) using binary search for all elements',
          'O(1) constant time',
        ],
        correctAnswer: 1,
        explanation: 'Since the array is already sorted, a two-pointer approach starting at opposite ends converges in O(N) time and O(1) space.',
        difficulty: 'Easy',
      },
      {
        id: 'dsa-q2',
        topic: 'Tree Traversal',
        question: 'Which binary tree traversal visits the root node BETWEEN its left and right subtrees?',
        options: [
          'Pre-order (Root, Left, Right)',
          'In-order (Left, Root, Right)',
          'Post-order (Left, Right, Root)',
          'Level-order (BFS)',
        ],
        correctAnswer: 1,
        explanation: 'In-order traversal visits Left Subtree -> Root -> Right Subtree, which outputs elements of a Binary Search Tree in sorted ascending order.',
        difficulty: 'Easy',
      },
      {
        id: 'dsa-q3',
        topic: 'Dynamic Programming',
        question: 'What distinguishes Dynamic Programming with Memoization (Top-Down) from Tabulation (Bottom-Up)?',
        options: [
          'Memoization is recursive and caches subproblem results as encountered; Tabulation iteratively builds a table from base cases up',
          'Memoization always uses more time than Tabulation',
          'Tabulation requires recursion while Memoization requires iteration',
          'They cannot solve the same problems',
        ],
        correctAnswer: 0,
        explanation: 'Top-down memoization utilizes recursion with a lookup cache, while bottom-up tabulation iteratively fills arrays without recursion stack overhead.',
        difficulty: 'Medium',
      },
      {
        id: 'dsa-q4',
        topic: 'Hash Map Collision Resolution',
        question: 'In Separate Chaining hash table resolution, what is the worst-case lookup time when all N keys hash to the exact same bucket without balanced trees?',
        options: [
          'O(1)',
          'O(log N)',
          'O(N)',
          'O(N^2)',
        ],
        correctAnswer: 2,
        explanation: 'If all keys collide into a single linked list bucket, searching degenerates to linear scan O(N).',
        difficulty: 'Medium',
      },
    ],
  },
  {
    id: 'assessment-js-react',
    title: 'Modern JavaScript (ES6+) & React Internals',
    category: 'Frontend Engineering',
    roleTarget: 'Full Stack Developer',
    description: 'Deep-dive into event loop phases, React 18 reconciliation, hooks dependencies, and state batching.',
    estimatedMinutes: 10,
    questionsCount: 4,
    difficulty: 'Standard',
    highestScore: 75,
    attemptsCount: 1,
    questions: [
      {
        id: 'js-q1',
        topic: 'Event Loop & Microtasks',
        question: 'In what order will the following console logs execute?\nconsole.log(1);\nsetTimeout(() => console.log(2), 0);\nPromise.resolve().then(() => console.log(3));\nconsole.log(4);',
        options: [
          '1, 2, 3, 4',
          '1, 4, 3, 2',
          '1, 4, 2, 3',
          '3, 1, 4, 2',
        ],
        correctAnswer: 1,
        explanation: 'Synchronous logs execute first (1, 4). Then the microtask queue (Promise -> 3) is drained completely before the macrotask queue (setTimeout -> 2).',
        difficulty: 'Medium',
      },
      {
        id: 'js-q2',
        topic: 'React Hooks & Closures',
        question: 'Why might a function inside useEffect capture stale state variables if omitted from the dependency array?',
        options: [
          'Because JavaScript closures capture variable values at the moment the render function was invoked',
          'Because React clears the memory of previous renders',
          'Because useEffect runs on a background Web Worker',
          'Because state is mutated directly by React',
        ],
        correctAnswer: 0,
        explanation: 'Stale closures occur because the effect function retains references to variables from the specific render cycle in which it was created.',
        difficulty: 'Medium',
      },
      {
        id: 'js-q3',
        topic: 'React 18 Automatic Batching',
        question: 'How does React 18 handle multiple setState calls inside asynchronous callbacks (like setTimeout or fetch)?',
        options: [
          'Each setState triggers an immediate separate re-render',
          'Automatically batches all state updates into a single re-render',
          'Throws a concurrent mode warning',
          'Only the last setState is executed',
        ],
        correctAnswer: 1,
        explanation: 'React 18 introduced automatic batching across all event handlers, promises, and timeouts to optimize rendering performance.',
        difficulty: 'Easy',
      },
      {
        id: 'js-q4',
        topic: 'Virtual DOM & Diffing',
        question: 'Why is providing unique, stable "key" props critical when rendering lists in React?',
        options: [
          'Keys are required by CSS animations',
          'Keys allow the diffing algorithm to match elements across renders, avoiding unnecessary DOM re-creation',
          'Keys convert elements into pure Web Components',
          'Keys automatically paginate the list',
        ],
        correctAnswer: 1,
        explanation: 'Stable keys allow React to identify which items have changed, been added, or removed, preserving component state efficiently.',
        difficulty: 'Easy',
      },
    ],
  },
];

/**
 * @desc    Get all available assessments
 * @route   GET /api/assessments
 * @access  Private
 */
const getAssessments = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    let profile = await Profile.findOne({ user: userId });

    const attemptsMap = {};
    if (profile?.assessmentAttempts) {
      profile.assessmentAttempts.forEach(att => {
        if (!attemptsMap[att.assessmentId] || att.score > attemptsMap[att.assessmentId]) {
          attemptsMap[att.assessmentId] = att.score;
        }
      });
    }

    const data = ASSESSMENTS.map(a => ({
      ...a,
      highestScore: attemptsMap[a.id] !== undefined ? attemptsMap[a.id] : a.highestScore,
      questions: a.questions.map(({ correctAnswer, explanation, ...rest }) => rest), // sanitize correct answers from list view
    }));

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single assessment with full questions for taking test
 * @route   GET /api/assessments/:id
 * @access  Private
 */
const getAssessmentById = async (req, res, next) => {
  try {
    const assessment = ASSESSMENTS.find(a => a.id === req.params.id);
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }

    res.json({
      success: true,
      data: assessment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Submit assessment answers and calibrate student score
 * @route   POST /api/assessments/:id/submit
 * @access  Private
 */
const submitAssessment = async (req, res, next) => {
  try {
    const { answers } = req.body; // array of { questionId, selectedOption }
    const userId = req.user._id || req.user.id;

    const assessment = ASSESSMENTS.find(a => a.id === req.params.id);
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }

    let correctCount = 0;
    const reviewDetails = [];
    const weakTopics = [];
    const strongTopics = [];

    assessment.questions.forEach((q) => {
      const userAnswer = answers?.find(ans => ans.questionId === q.id);
      const isCorrect = userAnswer && userAnswer.selectedOption === q.correctAnswer;
      if (isCorrect) {
        correctCount++;
        strongTopics.push(q.topic);
      } else {
        weakTopics.push(q.topic);
      }

      reviewDetails.push({
        questionId: q.id,
        question: q.question,
        options: q.options,
        selectedOption: userAnswer ? userAnswer.selectedOption : null,
        correctAnswer: q.correctAnswer,
        isCorrect: !!isCorrect,
        explanation: q.explanation,
        topic: q.topic,
      });
    });

    const scorePercentage = Math.round((correctCount / assessment.questions.length) * 100);

    // Save attempt and update profile
    let profile = await Profile.findOne({ user: userId });
    if (profile) {
      profile.assessmentAttempts.push({
        assessmentId: assessment.id,
        title: assessment.title,
        score: scorePercentage,
        correctCount,
        totalQuestions: assessment.questions.length,
      });

      // Update assessment readiness dimension
      const totalScore = profile.assessmentAttempts.reduce((acc, a) => acc + a.score, 0);
      profile.readiness.assessment = Math.round(totalScore / profile.assessmentAttempts.length);

      // Boost skill if high score
      if (scorePercentage >= 70 && profile.skills) {
        let matchedSkill = profile.skills.find(s =>
          assessment.category.toLowerCase().includes(s.name.toLowerCase()) ||
          s.name.toLowerCase().includes(assessment.category.toLowerCase()) ||
          (assessment.id.includes('sql') && s.name.toLowerCase().includes('sql'))
        );
        if (matchedSkill) {
          matchedSkill.score = Math.min(100, Math.max(matchedSkill.score, scorePercentage));
          matchedSkill.level = matchedSkill.score >= 75 ? 'Strong' : 'Good';
          matchedSkill.lastAssessed = 'Just now';
        }
      }

      profile.readiness = calculatePlacementReadiness(profile);
      await profile.save();
    }

    const nextBestAction = profile ? computeNextBestAction(profile) : null;

    res.json({
      success: true,
      data: {
        assessmentId: assessment.id,
        title: assessment.title,
        scorePercentage,
        correctCount,
        totalQuestions: assessment.questions.length,
        strongTopics,
        weakTopics,
        reviewDetails,
        recalibratedReadiness: profile?.readiness,
        nextBestAction,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAssessments,
  getAssessmentById,
  submitAssessment,
};
