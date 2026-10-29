import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Zap,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  Clock,
  Sparkles,
  TrendingUp,
  Layers,
  ChevronRight,
  Code,
  Flame,
  Shuffle,
  RotateCcw,
  Check,
  XCircle,
  Award,
  HelpCircle,
  Filter,
} from 'lucide-react';
import api from '../api/axios';

const CS_SPRINT_QUESTIONS_BANK = {
  CN: [
    {
      id: 'cn-1',
      subject: 'CN & Networking',
      question: 'Which transport layer protocol provides reliable, connection-oriented data transfer with sequence numbering and flow control?',
      options: ['UDP', 'TCP', 'ICMP', 'IGMP'],
      correctIndex: 1,
      explanation: 'TCP (Transmission Control Protocol) uses a three-way handshake, sequence numbers, and acknowledgments to ensure reliable delivery.',
    },
    {
      id: 'cn-2',
      subject: 'CN & Networking',
      question: 'In the OSI Model, which layer is responsible for routing packets across multiple networks using IP addressing?',
      options: ['Data Link Layer', 'Network Layer', 'Transport Layer', 'Session Layer'],
      correctIndex: 1,
      explanation: 'The Network layer (Layer 3) handles logical IP addressing, packet forwarding, and routing path determination.',
    },
    {
      id: 'cn-3',
      subject: 'CN & Networking',
      question: 'What is the standard port number used for secure HTTPS encrypted web traffic?',
      options: ['80', '22', '443', '8080'],
      correctIndex: 2,
      explanation: 'Port 443 is the standard port for HTTPS with TLS/SSL encryption, while port 80 is for unencrypted HTTP.',
    },
    {
      id: 'cn-4',
      subject: 'CN & Networking',
      question: 'Which protocol translates a human-readable domain name (e.g. google.com) into an IP address?',
      options: ['ARP', 'DNS', 'DHCP', 'NAT'],
      correctIndex: 1,
      explanation: 'DNS (Domain Name System) acts as the internet phonebook translating hostnames to IP addresses.',
    },
  ],
  OS: [
    {
      id: 'os-1',
      subject: 'Operating Systems',
      question: 'Which of the following is NOT one of the four Coffman conditions necessary for a Deadlock to occur?',
      options: ['Mutual Exclusion', 'Hold and Wait', 'Preemption Allowed', 'Circular Wait'],
      correctIndex: 2,
      explanation: 'No Preemption is required for deadlock. If preemption is allowed, deadlock cannot happen.',
    },
    {
      id: 'os-2',
      subject: 'Operating Systems',
      question: 'What is the phenomenon called when the CPU spends more time swapping pages in and out of memory than executing processes?',
      options: ['Paging', 'Thrashing', 'Starvation', 'Fragmentation'],
      correctIndex: 1,
      explanation: 'Thrashing occurs when high memory pressure causes continuous page faults, severely degrading system throughput.',
    },
    {
      id: 'os-3',
      subject: 'Operating Systems',
      question: 'Which CPU scheduling algorithm is non-preemptive and selects the process with the smallest execution burst time?',
      options: ['Round Robin (RR)', 'Shortest Job First (SJF Non-preemptive)', 'Priority Scheduling', 'FCFS'],
      correctIndex: 1,
      explanation: 'Non-preemptive SJF runs the shortest available burst to completion without interruption.',
    },
  ],
  DBMS: [
    {
      id: 'db-1',
      subject: 'DBMS & SQL',
      question: 'In ACID properties of database transactions, what does "I" stand for?',
      options: ['Indexing', 'Isolation', 'Integrity', 'Immutability'],
      correctIndex: 1,
      explanation: 'Isolation ensures concurrent transactions execute without interfering with one another.',
    },
    {
      id: 'db-2',
      subject: 'DBMS & SQL',
      question: 'Which normal form eliminates partial functional dependencies on a composite primary key?',
      options: ['1NF', '2NF', '3NF', 'BCNF'],
      correctIndex: 1,
      explanation: 'Second Normal Form (2NF) requires 1NF + all non-key attributes to be fully functionally dependent on the primary key.',
    },
    {
      id: 'db-3',
      subject: 'DBMS & SQL',
      question: 'Which SQL clause is used to filter aggregated grouped data produced by a GROUP BY clause?',
      options: ['WHERE', 'HAVING', 'ORDER BY', 'LIMIT'],
      correctIndex: 1,
      explanation: 'WHERE filters individual rows before grouping, while HAVING filters aggregated grouped results.',
    },
  ],
  OOPS: [
    {
      id: 'oops-1',
      subject: 'OOPs Concepts',
      question: 'Method Overriding (same method signature in subclass with different implementation) is an example of what type of polymorphism?',
      options: ['Compile-Time Polymorphism', 'Runtime / Dynamic Polymorphism', 'Parametric Polymorphism', 'Ad-hoc Polymorphism'],
      correctIndex: 1,
      explanation: 'Method overriding is resolved at runtime via virtual method tables (dynamic dispatch).',
    },
    {
      id: 'oops-2',
      subject: 'OOPs Concepts',
      question: 'Which OOP principle restricts direct access to an object’s internal state and hides implementation details behind getters and setters?',
      options: ['Encapsulation', 'Inheritance', 'Abstraction', 'Polymorphism'],
      correctIndex: 0,
      explanation: 'Encapsulation binds data and functions into a single unit and restricts direct access to internal fields.',
    },
    {
      id: 'oops-3',
      subject: 'OOPs Concepts',
      question: 'What is the relationship called when a Class contains an instance of another Class (a "HAS-A" relationship)?',
      options: ['Inheritance', 'Composition / Aggregation', 'Generalization', 'Polymorphism'],
      correctIndex: 1,
      explanation: 'Composition / Aggregation represents a HAS-A relationship (e.g. Car HAS-A Engine).',
    },
  ],
  DEVOPS: [
    {
      id: 'devops-1',
      subject: 'DevOps & Cloud',
      question: 'What is the primary difference between a Docker Container and a Virtual Machine (VM)?',
      options: [
        'Containers bundle a full guest OS kernel, while VMs share the host kernel',
        'Containers share the host OS kernel and are lightweight, while VMs virtualize hardware and run full guest OS kernels',
        'VMs cannot run Linux',
        'Containers only run in the cloud',
      ],
      correctIndex: 1,
      explanation: 'Containers isolate at process level sharing host kernel, making them lightweight (MBs) vs VMs (GBs).',
    },
    {
      id: 'devops-2',
      subject: 'DevOps & Cloud',
      question: 'In Git version control, which command combines changes from one branch into the current branch without creating a merge commit?',
      options: ['git merge', 'git rebase', 'git cherry-pick', 'git stash'],
      correctIndex: 1,
      explanation: 'git rebase replays commits on top of the base branch creating a clean linear history.',
    },
  ],
};

const MicroLearning = () => {
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(900); // 15 Minutes (900 seconds)
  const [quizActive, setQuizActive] = useState(false);

  // Load questions for the selected category
  useEffect(() => {
    loadCategoryQuestions(activeCategory);
  }, [activeCategory]);

  // 15-Minute Countdown Timer
  useEffect(() => {
    let timer;
    if (quizActive && !submitted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && !submitted) {
      handleFinalSubmit();
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [quizActive, submitted, timeLeft]);

  const loadCategoryQuestions = (cat) => {
    let list = [];
    if (cat === 'ALL') {
      list = Object.values(CS_SPRINT_QUESTIONS_BANK).flat();
    } else {
      list = CS_SPRINT_QUESTIONS_BANK[cat] || [];
    }
    // Shuffle questions
    const shuffled = [...list].sort(() => Math.random() - 0.5);
    setQuizQuestions(shuffled);
    setCurrentQIndex(0);
    setSelectedAnswers({});
    setSubmitted(false);
    setScore(0);
    setTimeLeft(900);
    setQuizActive(true);
  };

  const handleSelectOption = (qId, optionIdx) => {
    if (submitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [qId]: optionIdx,
    }));
  };

  const handleFinalSubmit = () => {
    let totalMarks = 0;
    quizQuestions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        totalMarks++;
      }
    });

    setScore(totalMarks);
    setSubmitted(true);

    if (totalMarks >= Math.ceil(quizQuestions.length * 0.75)) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
  };

  const currentQ = quizQuestions[currentQIndex];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-fadeIn">
      
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-950/40 via-purple-950/40 to-dark-900 border border-amber-500/20 p-6 sm:p-8 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider font-mono mb-2">
              <Zap className="w-4 h-4" />
              <span>15-Minute Micro-Sprints • 1-Mark Objective CS Questions</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              15-Min CS Foundation <span className="text-gradient">Sprint Arena</span>
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl mt-2 leading-relaxed">
              Targeted 15-minute quick sprint tests for core CS subjects (CN, Operating Systems, DBMS, OOPs, DevOps). Daily rotated 1-mark objective questions with instant explanations.
            </p>
          </div>

          {/* 15-Minute Countdown Display */}
          <div className="flex items-center gap-3 bg-dark-950/90 px-4 py-3 rounded-2xl border border-white/10 font-mono self-start md:self-auto">
            <Clock className="w-5 h-5 text-amber-400" />
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Sprint Timer</span>
              <span className="text-xl font-black text-white">
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-3xl bg-dark-800/80 border border-white/10">
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'ALL', label: 'All CS Sprints' },
            { key: 'CN', label: 'CN & Networking' },
            { key: 'OS', label: 'Operating Systems' },
            { key: 'DBMS', label: 'DBMS & SQL' },
            { key: 'OOPS', label: 'OOPs Concepts' },
            { key: 'DEVOPS', label: 'DevOps & Cloud' },
          ].map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                activeCategory === cat.key
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                  : 'bg-dark-900 border border-white/5 text-slate-400 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => loadCategoryQuestions(activeCategory)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-dark-900 hover:bg-dark-700 text-amber-300 text-xs font-mono font-semibold border border-white/10 transition-all cursor-pointer"
        >
          <Shuffle className="w-3.5 h-3.5" />
          <span>Rotate / Refresh Questions</span>
        </button>
      </div>

      {/* Main Sprint Quiz Arena */}
      {quizQuestions.length > 0 && currentQ && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Question View (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-dark-800/90 border border-white/10 space-y-6">
              
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-mono">
                  {currentQ.subject} • Question {currentQIndex + 1} of {quizQuestions.length} (1 Mark)
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Answered: {Object.keys(selectedAnswers).length} / {quizQuestions.length}
                </span>
              </div>

              {/* Question Text */}
              <div className="space-y-2">
                <h3 className="text-lg sm:text-xl font-bold text-white leading-relaxed">
                  {currentQ.question}
                </h3>
              </div>

              {/* Options */}
              <div className="space-y-3 pt-2">
                {currentQ.options.map((opt, optIdx) => {
                  const isSelected = selectedAnswers[currentQ.id] === optIdx;
                  const isCorrect = currentQ.correctIndex === optIdx;
                  
                  let optionClass = 'bg-dark-900 border-white/10 text-slate-300 hover:border-amber-500/40';
                  if (submitted) {
                    if (isCorrect) {
                      optionClass = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold';
                    } else if (isSelected && !isCorrect) {
                      optionClass = 'bg-rose-500/20 text-rose-300 border-rose-500/40 line-through';
                    }
                  } else if (isSelected) {
                    optionClass = 'bg-amber-600 text-white border-amber-400 shadow-md shadow-amber-600/30';
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      onClick={() => handleSelectOption(currentQ.id, optIdx)}
                      className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm font-medium transition-all flex items-center justify-between cursor-pointer ${optionClass}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold w-6">
                          {String.fromCharCode(65 + optIdx)}.
                        </span>
                        <span>{opt}</span>
                      </div>
                      {submitted && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                      {submitted && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Explanation (Shown when submitted) */}
              {submitted && (
                <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-1 text-xs text-slate-200">
                  <span className="font-bold text-indigo-300 font-mono block">Explanation:</span>
                  <p>{currentQ.explanation}</p>
                </div>
              )}

              {/* Navigation Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <button
                  onClick={() => setCurrentQIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentQIndex === 0}
                  className="px-4 py-2 rounded-xl bg-dark-900 border border-white/10 text-xs font-bold text-slate-300 hover:text-white disabled:opacity-30 cursor-pointer"
                >
                  ← Previous
                </button>

                {!submitted ? (
                  <button
                    onClick={handleFinalSubmit}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-indigo-600 hover:from-amber-500 text-white font-bold text-xs shadow-lg shadow-amber-600/30 transition-all cursor-pointer"
                  >
                    Submit 15-Min Sprint
                  </button>
                ) : (
                  <button
                    onClick={() => loadCategoryQuestions(activeCategory)}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
                  >
                    Retake / Next Sprint →
                  </button>
                )}

                <button
                  onClick={() => setCurrentQIndex((prev) => Math.min(quizQuestions.length - 1, prev + 1))}
                  disabled={currentQIndex === quizQuestions.length - 1}
                  className="px-4 py-2 rounded-xl bg-dark-900 border border-white/10 text-xs font-bold text-slate-300 hover:text-white disabled:opacity-30 cursor-pointer"
                >
                  Next →
                </button>
              </div>

            </div>
          </div>

          {/* Side Question Navigator & Result Card (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Scorecard if submitted */}
            {submitted && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 rounded-3xl bg-gradient-to-br from-amber-950/80 via-purple-950/80 to-dark-900 border-2 border-amber-500/40 space-y-4 shadow-2xl text-center"
              >
                <span className="text-xs font-bold text-amber-300 uppercase font-mono">Sprint Score</span>
                <div className="text-4xl font-black text-white font-mono">
                  {score} / {quizQuestions.length} Marks
                </div>
                <p className="text-xs text-emerald-400 font-semibold">
                  {Math.round((score / quizQuestions.length) * 100)}% Accuracy Achieved
                </p>
              </motion.div>
            )}

            {/* Question Quick Palette */}
            <div className="p-6 rounded-3xl bg-dark-800/90 border border-white/10 space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase font-mono">Question Navigator</h4>
              <div className="grid grid-cols-5 gap-2">
                {quizQuestions.map((q, idx) => {
                  const isCurrent = idx === currentQIndex;
                  const isAnswered = selectedAnswers[q.id] !== undefined;

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQIndex(idx)}
                      className={`p-2.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                          : isAnswered
                          ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/30'
                          : 'bg-dark-950 border border-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default MicroLearning;
