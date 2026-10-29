import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FileCheck,
  Clock,
  Award,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  ChevronRight,
  BookOpen,
  Building,
  Target,
  Zap,
  TrendingUp,
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const COMPANY_BENCHMARKS = {
  Google: {
    tier: 'Tier-1 FAANG',
    minScore: 85,
    requiredSkills: ['Data Structures', 'Graph Algorithms', 'System Scalability', 'Multithreading', 'C++ / Java / Python'],
    recommendedTopics: [
      { topic: 'Advanced Graph Algorithms & Shortest Path', sprint: '15-min Graph Traversal & Dijkstra Sprint', link: '/learning' },
      { topic: 'Distributed Caching (Redis LRU)', sprint: '15-min In-Memory Caching Architecture', link: '/learning' },
    ],
  },
  Microsoft: {
    tier: 'Tier-1 Product',
    minScore: 80,
    requiredSkills: ['React / TypeScript', 'RESTful API Architecture', 'SQL Relational Modeling', 'Trie & Tree Algorithms'],
    recommendedTopics: [
      { topic: 'SQL Multi-Table JOINs & Indexing', sprint: '15-min Database Query Optimization Sprint', link: '/learning' },
      { topic: 'Component Lifecycle & State Management', sprint: '15-min React Architecture Masterclass', link: '/learning' },
    ],
  },
  Amazon: {
    tier: 'Tier-1 FAANG',
    minScore: 82,
    requiredSkills: ['Java / Python OOP', 'Microservices Architecture', 'DynamoDB / NoSQL', '16 Leadership Principles'],
    recommendedTopics: [
      { topic: 'Microservices vs Monolith Trade-offs', sprint: '15-min Distributed Systems Sprint', link: '/learning' },
      { topic: 'STAR Behavioral Scenarios', sprint: '15-min Behavioral Leadership Sprint', link: '/interview/voice' },
    ],
  },
  Zoho: {
    tier: 'Product Pioneer',
    minScore: 75,
    requiredSkills: ['Core C / C++', 'Pointer Mechanics & Memory', 'Matrix Algorithms', 'Relational Database Schema'],
    recommendedTopics: [
      { topic: 'C/C++ Pointers & Memory Allocation', sprint: '15-min Core Memory Management Sprint', link: '/learning' },
      { topic: '2D Matrix Manipulations', sprint: '15-min Matrix & Array Sprint', link: '/interview/code' },
    ],
  },
  'TCS Digital': {
    tier: 'Digital Prime',
    minScore: 72,
    requiredSkills: ['Core CS Fundamentals (CN, OS, DBMS)', 'Quantitative Aptitude', 'Basic Coding in Java/Python'],
    recommendedTopics: [
      { topic: 'Computer Networks & OSI Layer', sprint: '15-min CN & Networking Foundations Sprint', link: '/learning' },
      { topic: 'Operating Systems & Process Scheduling', sprint: '15-min OS Threading & Deadlocks Sprint', link: '/learning' },
    ],
  },
};

const DIAGNOSTIC_ASSESSMENTS = [
  {
    id: 'oa-dsa-1',
    title: 'Data Structures & Algorithmic Problem Solving',
    category: 'Core CS',
    description: 'Evaluate your proficiency in arrays, two-pointer techniques, recursion, trees, and time-space Big-O analysis.',
    estimatedMinutes: 10,
    questionsCount: 5,
    highestScore: 85,
    questions: [
      {
        id: 'q1',
        prompt: 'What is the worst-case time complexity of searching an element in a balanced Binary Search Tree (AVL Tree)?',
        options: ['O(N)', 'O(log N)', 'O(1)', 'O(N log N)'],
        correctIndex: 1,
        explanation: 'AVL trees maintain balance guaranteeing maximum tree height of O(log N).',
      },
      {
        id: 'q2',
        prompt: 'Which data structure is optimal for implementing an LRU (Least Recently Used) Cache with O(1) get and put operations?',
        options: ['Array + Binary Search', 'Hash Map + Doubly Linked List', 'Min-Heap + Queue', 'Stack + Set'],
        correctIndex: 1,
        explanation: 'Hash Map gives O(1) key lookup, while Doubly Linked List enables O(1) node eviction/reordering.',
      },
      {
        id: 'q3',
        prompt: 'In Kadane’s algorithm for Maximum Subarray, what is the core decision made at index `i`?',
        options: [
          'Restart subarray if total sum becomes negative',
          'Choose max between current element alone vs (current element + running sum)',
          'Multiply with previous element',
          'Sort the array first in O(N log N)',
        ],
        correctIndex: 1,
        explanation: 'curr = max(nums[i], curr + nums[i]) determines whether to extend or start fresh.',
      },
    ],
  },
  {
    id: 'oa-dbms-1',
    title: 'Database Systems & SQL Optimization',
    category: 'Databases',
    description: 'Diagnostic test on ACID properties, B-Tree indexes, multi-table JOINs, normalization, and window functions.',
    estimatedMinutes: 10,
    questionsCount: 3,
    highestScore: 78,
    questions: [
      {
        id: 'db-1',
        prompt: 'Which index type is the default for primary keys in PostgreSQL and MySQL InnoDB to accelerate range queries?',
        options: ['Hash Index', 'B-Tree / B+ Tree Index', 'Bitmap Index', 'GiST Index'],
        correctIndex: 1,
        explanation: 'B+ Tree keeps keys sorted, making range queries (BETWEEN, >, <) extremely fast in O(log N).',
      },
      {
        id: 'db-2',
        prompt: 'What happens during a LEFT JOIN if a row in the left table has no match in the right table?',
        options: [
          'The left row is excluded completely',
          'The right columns are populated with NULL values',
          'A database constraint error is thrown',
          'The query defaults to an INNER JOIN',
        ],
        correctIndex: 1,
        explanation: 'LEFT JOIN preserves all rows from the left table, inserting NULL for missing right matches.',
      },
    ],
  },
  {
    id: 'oa-sys-1',
    title: 'System Design & High-Throughput Scalability',
    category: 'Architecture',
    description: 'Diagnose your readiness in load balancing, caching topologies, API rate limiting, and CAP theorem trade-offs.',
    estimatedMinutes: 10,
    questionsCount: 3,
    highestScore: 80,
    questions: [
      {
        id: 'sys-1',
        prompt: 'According to the CAP Theorem, in the event of a network partition (P), what trade-off must a distributed system make?',
        options: [
          'Sacrifice Latency for Throughput',
          'Choose between Consistency (C) vs Availability (A)',
          'Choose between Storage vs Bandwidth',
          'Disable encryption',
        ],
        correctIndex: 1,
        explanation: 'Under network partition, you can either reject requests for consistency or serve stale data for availability.',
      },
      {
        id: 'sys-2',
        prompt: 'Which caching strategy writes data simultaneously to both the cache and underlying database?',
        options: ['Write-Through', 'Write-Back (Write-Behind)', 'Cache-Aside (Lazy Loading)', 'Refresh-Ahead'],
        correctIndex: 0,
        explanation: 'Write-Through updates cache and database synchronously, ensuring strong data consistency.',
      },
    ],
  },
];

const Assessments = () => {
  const { user } = useAuth();
  const [selectedCompany, setSelectedCompany] = useState('Google');
  const [activeTest, setActiveTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600);

  const activeBenchmark = COMPANY_BENCHMARKS[selectedCompany] || COMPANY_BENCHMARKS.Google;
  const activeResumeData = (() => {
    try {
      const saved = localStorage.getItem(`active_resume_data_${user?.email || user?.id || 'candidate'}`);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  })();

  const userAtsScore = activeResumeData?.atsScore || 75;

  useEffect(() => {
    let timer;
    if (activeTest && !result && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [activeTest, result, timeLeft]);

  const startTest = (test) => {
    setActiveTest(test);
    setAnswers({});
    setResult(null);
    setTimeLeft((test.estimatedMinutes || 10) * 60);
  };

  const handleSelectOption = (qId, optionIdx) => {
    setAnswers((prev) => ({ ...prev, [qId]: optionIdx }));
  };

  const handleSubmitTest = () => {
    if (!activeTest) return;
    setSubmitting(true);

    let correctCount = 0;
    activeTest.questions.forEach((q) => {
      if (answers[q.id] === q.correctIndex) {
        correctCount++;
      }
    });

    const scorePercent = Math.round((correctCount / activeTest.questions.length) * 100);

    setResult({
      score: scorePercent,
      correctCount,
      totalCount: activeTest.questions.length,
      passed: scorePercent >= 70,
    });

    setSubmitting(false);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-cyan-950/40 via-indigo-950/40 to-dark-900 border border-cyan-500/20 p-6 sm:p-8 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider font-mono mb-2">
              <FileCheck className="w-4 h-4" />
              <span>Skill Gap Diagnostics • Multi-Company Benchmark Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              Skill Gap Diagnostics & <span className="text-gradient">Target Calibration</span>
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl mt-2 leading-relaxed">
              Compare your verified active resume skills & test performance directly against Tier-1 company hiring standards. Pinpoint bottlenecks and receive personalized topic recommendations to close your gap.
            </p>
          </div>
        </div>
      </div>

      {/* Target Company Skill Gap Matrix & Actionable Suggestions */}
      {!activeTest && (
        <div className="space-y-6">
          
          <div className="p-6 sm:p-8 rounded-3xl bg-dark-800/80 border border-white/10 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Target className="w-5 h-5 text-cyan-400" />
                  <span>Company-Specific Skill Gap Diagnostic</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select a target company to analyze your readiness threshold and recommended topics.
                </p>
              </div>

              {/* Company Tabs */}
              <div className="flex flex-wrap gap-2">
                {Object.keys(COMPANY_BENCHMARKS).map((comp) => (
                  <button
                    key={comp}
                    onClick={() => setSelectedCompany(comp)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                      selectedCompany === comp
                        ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                        : 'bg-dark-900 border border-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    {comp}
                  </button>
                ))}
              </div>
            </div>

            {/* Diagnostic Scorecard for Selected Company */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              <div className="p-5 rounded-2xl bg-dark-950 border border-white/5 space-y-2">
                <span className="text-[10px] uppercase font-mono font-bold text-slate-500">
                  {selectedCompany} Readiness Threshold
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-black text-white font-mono">{activeBenchmark.minScore}%</span>
                  <span className="text-xs font-bold text-cyan-400 font-mono">Tier: {activeBenchmark.tier}</span>
                </div>
                <p className="text-xs text-slate-400">Your Current Match: <strong className="text-white">{userAtsScore}%</strong></p>
              </div>

              <div className="p-5 rounded-2xl bg-dark-950 border border-white/5 space-y-2 md:col-span-2">
                <span className="text-[10px] uppercase font-mono font-bold text-slate-500">
                  Required Competency Standards for {selectedCompany}
                </span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {activeBenchmark.requiredSkills.map((sk, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-xs font-medium"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

            </div>

            {/* Personalized Learning Topic Suggestions */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold text-indigo-300 uppercase font-mono tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>AI Suggested Topics to Close Your Gap for {selectedCompany}</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {activeBenchmark.recommendedTopics.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-dark-900 border border-indigo-500/20 flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-indigo-400 font-mono uppercase">Suggested Topic #{idx + 1}</span>
                      <h4 className="text-sm font-bold text-white">{item.topic}</h4>
                      <p className="text-xs text-slate-400">{item.sprint}</p>
                    </div>

                    <Link
                      to={item.link}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 font-mono self-start pt-1"
                    >
                      <span>Start Focused Learning Module</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Section: Diagnostic Test Arenas */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider font-mono">
              Diagnostic Skill Verification Tests
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {DIAGNOSTIC_ASSESSMENTS.map((test) => (
                <div
                  key={test.id}
                  className="p-6 rounded-3xl bg-dark-800/80 border border-white/10 hover:border-cyan-500/40 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-mono">
                        {test.category}
                      </span>
                      <span className="text-xs font-bold text-emerald-400 font-mono">
                        Best: {test.highestScore}%
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-white">{test.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{test.description}</p>
                  </div>

                  <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      {test.estimatedMinutes} Mins • {test.questionsCount} Qs
                    </span>

                    <button
                      onClick={() => startTest(test)}
                      className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md shadow-cyan-600/20 transition-all cursor-pointer"
                    >
                      Start Test
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Active Diagnostic Test Interactive Mode */}
      {activeTest && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-dark-800/90 border border-white/10 space-y-6">
            
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <span className="text-xs font-bold text-cyan-400 font-mono uppercase">{activeTest.category} Assessment</span>
                <h2 className="text-xl font-black text-white mt-0.5">{activeTest.title}</h2>
              </div>

              <div className="flex items-center gap-4 font-mono text-xs">
                <span className="text-slate-400 flex items-center gap-1.5 bg-dark-950 px-3 py-1.5 rounded-xl border border-white/5">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <span>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
                </span>
                <button
                  onClick={() => setActiveTest(null)}
                  className="px-3 py-1.5 rounded-xl bg-dark-900 border border-white/10 text-slate-400 hover:text-white"
                >
                  Exit Test
                </button>
              </div>
            </div>

            {/* Test Questions */}
            <div className="space-y-6">
              {activeTest.questions.map((q, idx) => (
                <div key={q.id} className="p-5 rounded-2xl bg-dark-950 border border-white/5 space-y-3">
                  <div className="flex items-start gap-2">
                    <span className="text-xs font-bold text-cyan-400 font-mono">Q{idx + 1}.</span>
                    <p className="text-sm font-semibold text-white">{q.prompt}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = answers[q.id] === optIdx;
                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => handleSelectOption(q.id, optIdx)}
                          className={`p-3 rounded-xl border text-left text-xs font-medium transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-cyan-600 text-white border-cyan-400 shadow-md shadow-cyan-600/30'
                              : 'bg-dark-900 border-white/10 text-slate-300 hover:border-cyan-500/40'
                          }`}
                        >
                          <span className="font-mono font-bold mr-2">{String.fromCharCode(65 + optIdx)}.</span>
                          <span>{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Submit Bar */}
            {!result ? (
              <div className="pt-4 border-t border-white/10 flex justify-end">
                <button
                  onClick={handleSubmitTest}
                  disabled={submitting}
                  className="px-8 py-3 rounded-2xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 transition-all cursor-pointer"
                >
                  {submitting ? 'Calculating Score...' : 'Submit Diagnostic Test'}
                </button>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-dark-950 border border-cyan-500/30 text-center space-y-3">
                <div className="text-3xl font-black text-cyan-400 font-mono">{result.score}%</div>
                <p className="text-sm text-white font-semibold">
                  You answered {result.correctCount} out of {result.totalCount} questions correctly.
                </p>
                <button
                  onClick={() => setActiveTest(null)}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20"
                >
                  Return to Skill Gap Matrix
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

export default Assessments;
