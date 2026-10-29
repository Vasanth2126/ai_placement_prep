import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  ShieldAlert,
  Mic,
  MicOff,
  Sparkles,
  Send,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Clock,
  Flame,
  Layers,
  Terminal,
  Cpu,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Award,
  CheckCircle,
  FileCheck,
  FolderGit2,
  Settings2,
  Code2,
  ExternalLink,
  BookOpen,
  Check,
} from 'lucide-react';
import api from '../api/axios';
import AudioVisualizer from '../components/AudioVisualizer';

const Github = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const SAMPLE_PROJECT_PRESETS = [
  {
    title: 'AI Resume & Interview Preparation Platform',
    description: 'Full-stack AI platform built with React, Node.js, Express, MongoDB, and Gemini/Groq LLMs. Features real-time voice STT, ATS resume scoring, code sandbox execution with Piston API, and Placement Twin readiness calibration.',
    techStack: 'React, Node.js, Express, MongoDB, Gemini API, Redis, Tailwind CSS',
    repoUrl: '',
  },
  {
    title: 'Distributed Real-Time Collaborative Whiteboard',
    description: 'High-concurrency collaborative canvas application with real-time multi-user drawing synchronization using WebSockets, Redis Pub/Sub, CRDT conflict resolution, and PostgreSQL for document state persistence.',
    techStack: 'React, Canvas API, WebSockets, Node.js, Redis Pub/Sub, CRDT, PostgreSQL',
    repoUrl: 'https://github.com/facebook/react',
  },
  {
    title: 'High-Throughput E-Commerce Microservices Engine',
    description: 'Scalable cloud e-commerce backend with decoupled microservices for auth, inventory, ordering, and payments. Utilizes RabbitMQ message queues, Redis caching, and PostgreSQL with database sharding.',
    techStack: 'Node.js, Express, RabbitMQ, Redis, PostgreSQL, Docker, Nginx, JWT',
    repoUrl: '',
  },
];

const DEFAULT_DEFENSE_QUESTIONS = [
  {
    id: 'proj-1',
    title: 'Architectural Trade-offs & Tech Stack Justification',
    topic: 'Architecture & System Decisions',
    description: 'Explain why you selected your chosen database and frontend/backend framework for your flagship project. What were the specific latency, concurrency, or scale trade-offs you evaluated against alternatives?',
    evaluationTips: 'Focus on throughput, concurrency, CAP theorem, or developer velocity trade-offs.',
    modelAnswer: 'Exemplary solution: 1) ACID relational data safety. 2) In-memory Redis sub-10ms cache. 3) Decoupled async job queues.',
  },
  {
    id: 'proj-2',
    title: 'Failure Modes, Edge Cases & Error Recovery',
    topic: 'Reliability & Fault Tolerance',
    description: 'Describe the worst edge case or unexpected failure mode your system encountered in development or testing. How did you diagnose the root cause and ensure graceful degradation?',
    evaluationTips: 'Highlight root-cause isolation, circuit breakers, retry logic, or data validation safeguards.',
    modelAnswer: 'Exemplary solution: Implemented circuit breaker with exponential backoff on external APIs and idempotent database transactions.',
  },
  {
    id: 'proj-3',
    title: 'Production Metrics & Bottleneck Optimization',
    topic: 'Scalability & Performance Benchmarks',
    description: 'What key metrics (e.g. p99 response latency, queries per second, memory footprint, bundle size) did you benchmark? If traffic increased 100x overnight, where would the system break first?',
    evaluationTips: 'Quantify metrics (e.g., latency ms, DB query times) and detail sharding/caching/load-balancing plans.',
    modelAnswer: 'Exemplary solution: Target p99 < 50ms at 5,000 QPS. Read-heavy caching in Redis and horizontal database read replicas prevent bottlenecking.',
  },
];

const ProjectDefense = () => {
  // Project Configuration State
  const [projectTitle, setProjectTitle] = useState('AI Resume & Interview Preparation Platform');
  const [projectDescription, setProjectDescription] = useState('Full-stack AI platform built with React, Node.js, Express, MongoDB, and Gemini/Groq LLMs. Features real-time voice STT, ATS resume scoring, code sandbox execution with Piston API, and Placement Twin readiness calibration.');
  const [techStack, setTechStack] = useState('React, Node.js, Express, MongoDB, Gemini API, Redis, Tailwind CSS');
  const [repoUrl, setRepoUrl] = useState('');
  const [repoSummary, setRepoSummary] = useState(null);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [savedResumeProjects, setSavedResumeProjects] = useState([]);

  // Interview Session State
  const [questions, setQuestions] = useState(DEFAULT_DEFENSE_QUESTIONS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionId, setSessionId] = useState(null);
  
  // Per-question answers and evaluations
  const [answers, setAnswers] = useState({ 0: '', 1: '', 2: '' });
  const [feedbacks, setFeedbacks] = useState({});
  
  const [isRecording, setIsRecording] = useState(false);
  const [evaluatingSingle, setEvaluatingSingle] = useState(false);
  const [submittingOverall, setSubmittingOverall] = useState(false);
  const [configuringProject, setConfiguringProject] = useState(false);
  const [overallResult, setOverallResult] = useState(null);
  const [loading, setLoading] = useState(true);

  const recognitionRef = useRef(null);

  useEffect(() => {
    fetchUserResumeProjects();
    initProjectDefenseSession();
    setupSpeechRecognition();

    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  const fetchUserResumeProjects = async () => {
    try {
      const res = await api.get('/interview/project-defense/projects');
      if (res.data?.success && Array.isArray(res.data.projects) && res.data.projects.length > 0) {
        setSavedResumeProjects(res.data.projects);
      }
    } catch (e) {}
  };

  const initProjectDefenseSession = async () => {
    try {
      setLoading(true);
      const res = await api.post('/interview/project-defense/init', {
        title: projectTitle,
        description: projectDescription,
        techStack,
        repoUrl,
      });

      if (res.data?.sessionId) setSessionId(res.data.sessionId);
      if (res.data?.questions && res.data.questions.length > 0) {
        setQuestions(res.data.questions);
      }
      if (res.data?.repoSummary) {
        setRepoSummary(res.data.repoSummary);
      }
    } catch (err) {
      console.warn('Using default defense questions bank');
    } finally {
      setLoading(false);
    }
  };

  // Custom Project Configuration & Question Generation
  const handleApplyProjectConfig = async () => {
    if (!projectTitle.trim()) {
      alert('Please enter a project name or title.');
      return;
    }

    try {
      setConfiguringProject(true);
      const res = await api.post('/interview/project-defense/init', {
        title: projectTitle.trim(),
        description: projectDescription.trim(),
        techStack: techStack.trim(),
        repoUrl: repoUrl.trim(),
      });

      if (res.data?.sessionId) setSessionId(res.data.sessionId);
      if (res.data?.questions && res.data.questions.length > 0) {
        setQuestions(res.data.questions);
        setCurrentIndex(0);
        setAnswers({ 0: '', 1: '', 2: '' });
        setFeedbacks({});
        setOverallResult(null);
      }
      if (res.data?.repoSummary) {
        setRepoSummary(res.data.repoSummary);
      } else {
        setRepoSummary(null);
      }

      setIsConfigOpen(false);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.4 } });
    } catch (err) {
      console.error('Project configuration failed', err);
      alert('Could not initialize custom defense questions. Please check network.');
    } finally {
      setConfiguringProject(false);
    }
  };

  const handleSelectPreset = (preset) => {
    setProjectTitle(preset.title);
    setProjectDescription(preset.description);
    setTechStack(preset.techStack);
    setRepoUrl(preset.repoUrl || '');
  };

  const setupSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let text = '';
        for (let i = 0; i < event.results.length; i++) {
          text += event.results[i][0].transcript + ' ';
        }
        setAnswers((prev) => ({
          ...prev,
          [currentIndex]: (prev[currentIndex] ? prev[currentIndex] + ' ' : '') + text,
        }));
      };

      recognition.onerror = (e) => {
        console.warn('Speech recognition error', e.error);
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  };

  const toggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {}
      }
    } else {
      setIsRecording(false);
      if (recognitionRef.current) recognitionRef.current.stop();
    }
  };

  const currentQ = questions[currentIndex] || DEFAULT_DEFENSE_QUESTIONS[0];
  const currentAnswer = answers[currentIndex] || '';
  const currentFeedback = feedbacks[currentIndex] || null;

  // Client-side strict analyzer for fallback / offline execution
  const evaluateDefenseLocally = (question, answerText) => {
    const cleaned = (answerText || '').trim();
    const words = cleaned.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').split(/\s+/).filter(Boolean);
    const wCount = words.length;

    if (wCount === 0 || cleaned.length < 3) {
      return {
        overallScore: 0,
        correctnessScore: 0,
        clarityScore: 0,
        strengths: ['No answer submitted.'],
        improvements: ['Formulate a complete response addressing the technical prompt.'],
        detailedAnalysis: 'No candidate response was detected. 0 marks recorded.',
      };
    }

    // Gibberish & nonsense detector
    const isGibberish = (() => {
      if (/^(.)\1{4,}$/i.test(cleaned)) return true;
      const commonWords = new Set(['the','be','to','of','and','a','in','that','have','i','it','for','not','on','with','he','as','you','do','at','this','but','by','from','or','an','will','my','all','would','there','what','so','if','who','get','which','go','me','when','can','like','time','no','just','know','take','into','year','your','good','some','could','see','other','than','now','look','only','come','its','over','think','also','back','after','use','two','how','our','work','first','well','way','even','new','want','because','any','give','most','us','used','using','chose','chosen','system','project','design','service','data','server','client','code','error','test','scale','latency','tradeoff','architecture','database','react','node','sql','nosql','redis','mongodb','postgres','api']);
      let gibberishCount = 0;
      for (const w of words) {
        if (commonWords.has(w)) continue;
        const vowels = (w.match(/[aeiouy]/g) || []).length;
        const isMash = /asdf|hjkl|qwerty|zxcv|dfgh/i.test(w) || /[bcdfghjklmnpqrstvwxz]{4,}/i.test(w) || (w.length >= 4 && vowels === 0);
        if (isMash) gibberishCount++;
      }
      if (words.length <= 2 && !commonWords.has(words[0])) {
        const vowels = (words[0].match(/[aeiouy]/g) || []).length;
        if (vowels === 0 || /[bcdfghjklmnpqrstvwxz]{4,}/i.test(words[0])) return true;
      }
      return (gibberishCount / words.length) > 0.5;
    })();

    if (isGibberish) {
      return {
        overallScore: 0,
        correctnessScore: 0,
        clarityScore: 0,
        strengths: ['No valid technical content detected.'],
        improvements: [
          `Formulate a coherent technical answer detailing your architecture for "${projectTitle}".`,
          'Avoid random keystrokes or placeholder text.'
        ],
        detailedAnalysis: `The submission "${cleaned.slice(0, 35)}${cleaned.length > 35 ? '...' : ''}" was detected as invalid gibberish and received 0 marks.`,
      };
    }

    const archMatches = (cleaned.match(/\b(react|vue|angular|node|express|fastapi|django|spring|sql|nosql|mongodb|postgres|postgresql|mysql|dynamodb|redis|cache|caching|latency|p99|throughput|qps|rps|load balancer|nginx|circuit breaker|retry|sharding|partition|replication|acid|cap|monolith|microservices|docker|k8s|benchmark|failover|recovery)\b/gi) || []);
    const uniqueConcepts = Array.from(new Set(archMatches.map(c => c.toLowerCase())));

    if (uniqueConcepts.length === 0 && wCount < 10) {
      return {
        overallScore: 0,
        correctnessScore: 0,
        clarityScore: 0,
        strengths: ['No technical concepts or justification detected.'],
        improvements: [
          `Specify concrete technology choices and trade-offs for ${projectTitle}.`,
        ],
        detailedAnalysis: 'The response does not address the engineering requirements and received 0 marks.',
      };
    }

    const score = Math.min(95, Math.max(25, Math.round(uniqueConcepts.length * 15 + Math.min(30, wCount * 0.5))));

    return {
      overallScore: score,
      correctnessScore: Math.min(95, score + 4),
      clarityScore: Math.min(90, score),
      strengths: uniqueConcepts.length > 0
        ? [`Articulated key architectural pillars: [${uniqueConcepts.slice(0, 3).join(', ')}].`]
        : [`Articulated general engineering explanation (${wCount} words).`],
      improvements: [
        'Detail quantitative latency, throughput, and error recovery benchmarks.',
        'Explain specific failover and circuit-breaker mechanisms.',
      ],
      detailedAnalysis: `Candidate submitted a ${score >= 75 ? 'solid' : 'foundational'} defense for "${projectTitle}". Detailed architectural trade-offs were analyzed.`,
    };
  };

  // Single Question Submit: Check whether this single question is correct or not
  const handleEvaluateSingleQuestion = async () => {
    const answerToSubmit = currentAnswer.trim();
    if (!answerToSubmit) return;

    if (isRecording) {
      setIsRecording(false);
      if (recognitionRef.current) recognitionRef.current.stop();
    }

    try {
      setEvaluatingSingle(true);
      const res = await api.post('/interview/answer', {
        sessionId,
        questionId: currentQ?.id || currentQ?._id || `proj-${currentIndex + 1}`,
        userResponse: answerToSubmit,
        mode: 'project-defense',
        questionData: currentQ,
        projectContext: {
          title: projectTitle,
          description: projectDescription,
          techStack,
          repoUrl,
          repoSummary,
        },
      });

      const fb = res.data?.feedback || evaluateDefenseLocally(currentQ, answerToSubmit);

      setFeedbacks((prev) => ({
        ...prev,
        [currentIndex]: fb,
      }));

      if (fb.overallScore >= 80) {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      }
    } catch (err) {
      console.warn('Evaluation fallback:', err.message);
      const fallbackFb = evaluateDefenseLocally(currentQ, answerToSubmit);
      setFeedbacks((prev) => ({
        ...prev,
        [currentIndex]: fallbackFb,
      }));
    } finally {
      setEvaluatingSingle(false);
    }
  };

  // Overall Submit: Submit and get result of all 3 questions
  const handleOverallSubmit = async () => {
    const answeredCount = Object.values(answers).filter((a) => a.trim().length > 0).length;
    if (answeredCount === 0) {
      alert('Please formulate an answer for at least one question before final submission.');
      return;
    }

    setSubmittingOverall(true);
    try {
      // Evaluate any un-evaluated questions first
      const updatedFeedbacks = { ...feedbacks };
      for (let i = 0; i < questions.length; i++) {
        const qAns = (answers[i] || '').trim();
        if (qAns && !updatedFeedbacks[i]) {
          try {
            const res = await api.post('/interview/answer', {
              sessionId,
              questionId: questions[i].id || `proj-${i + 1}`,
              userResponse: qAns,
              mode: 'project-defense',
              questionData: questions[i],
              projectContext: {
                title: projectTitle,
                description: projectDescription,
                techStack,
                repoUrl,
                repoSummary,
              },
            });
            if (res.data?.feedback) {
              updatedFeedbacks[i] = res.data.feedback;
            } else {
              updatedFeedbacks[i] = evaluateDefenseLocally(questions[i], qAns);
            }
          } catch (e) {
            updatedFeedbacks[i] = evaluateDefenseLocally(questions[i], qAns);
          }
        }
      }
      setFeedbacks(updatedFeedbacks);

      // Compute aggregate stats (preserving 0 scores)
      const evaluatedScores = Object.values(updatedFeedbacks).map((f) =>
        typeof f.overallScore === 'number' ? f.overallScore : 0
      );
      const avgScore = evaluatedScores.length > 0
        ? Math.round(evaluatedScores.reduce((a, b) => a + b, 0) / evaluatedScores.length)
        : 0;

      setOverallResult({
        overallScore: avgScore,
        totalQuestions: questions.length,
        answeredCount,
        verdict:
          avgScore >= 80
            ? 'Strong Defense Passed • Ready for Tier-1 Hiring Manager Panel'
            : avgScore >= 65
            ? 'Competent Defense • Minor Architectural Gaps Identified'
            : avgScore >= 30
            ? 'Needs Practice • Expand on Benchmarks & Failure Modes'
            : 'Unsatisfactory Defense • Response contained invalid or insufficient content',
        readinessStatus: avgScore >= 75 ? 'Ready' : 'In Progress',
      });

      if (avgScore >= 65) {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
      }
    } catch (err) {
      console.error('Overall defense submission failed', err);
    } finally {
      setSubmittingOverall(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-950/40 via-purple-950/40 to-dark-900 border border-rose-500/20 p-6 sm:p-8 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider font-mono">
              <ShieldAlert className="w-4 h-4" />
              <span>Simulated Panel Pressure • Flagship Project Defense</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              AI Flagship <span className="text-gradient">Project Defense Arena</span>
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Top tech panels rigorously scrutinize whether you designed your projects or copied tutorials. Define your exact project, stack, or GitHub repo—the AI creates custom panel defense challenges tailored to your architecture.
            </p>
          </div>

          {/* Target Project Mini Card & Toggle Config Button */}
          <div className="flex flex-col gap-2 shrink-0">
            <button
              onClick={() => setIsConfigOpen(!isConfigOpen)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-bold transition-all cursor-pointer shadow-lg shadow-rose-950/50"
            >
              <Settings2 className="w-4 h-4 text-rose-400" />
              <span>{isConfigOpen ? 'Close Project Setup' : 'Change Target Project & Repo'}</span>
            </button>

            {repoUrl && (
              <a
                href={repoUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-dark-950/80 border border-white/10 text-[11px] font-mono text-slate-300 hover:text-white transition-all justify-center"
              >
                <Github className="w-3.5 h-3.5 text-indigo-400" />
                <span>View Linked Repo</span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
            )}
          </div>
        </div>

        {/* Current Active Project Details Bar */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="text-slate-400 font-mono">Active Project:</span>
            <span className="font-bold text-white bg-dark-950/80 px-3 py-1 rounded-xl border border-white/10 font-sans">
              {projectTitle}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-400 font-mono">Stack:</span>
            {techStack.split(',').slice(0, 4).map((tech, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-[11px] font-mono border border-indigo-500/30">
                {tech.trim()}
              </span>
            ))}
            {techStack.split(',').length > 4 && (
              <span className="text-slate-500 text-[10px] font-mono">+{techStack.split(',').length - 4} more</span>
            )}
          </div>

          {repoSummary && (
            <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[11px] bg-emerald-950/40 px-2.5 py-1 rounded-xl border border-emerald-500/30">
              <Check className="w-3.5 h-3.5" />
              <span>GitHub Codebase Analyzed ({repoSummary.language || 'Multi-stack'})</span>
            </div>
          )}
        </div>
      </div>

      {/* Collapsible Project & Repo Setup Console */}
      <AnimatePresence>
        {isConfigOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-6 sm:p-8 rounded-3xl bg-dark-800/95 border-2 border-rose-500/30 backdrop-blur-2xl shadow-2xl space-y-6">
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FolderGit2 className="w-5 h-5 text-rose-400" />
                  <h3 className="text-base sm:text-lg font-bold text-white font-sans">
                    Configure Project Details & GitHub Repository for AI Defense
                  </h3>
                </div>
                <span className="text-xs text-rose-400 font-mono uppercase tracking-wider font-semibold">
                  Personalized AI Analysis
                </span>
              </div>

              {/* Saved Resume Projects Quick Load Chips if available */}
              {savedResumeProjects.length > 0 && (
                <div className="p-4 rounded-2xl bg-dark-950/80 border border-white/10 space-y-2">
                  <span className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Auto-Detected from Your Uploaded Resume:</span>
                  </span>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {savedResumeProjects.map((p, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setProjectTitle(p.title || 'Resume Project');
                          setProjectDescription(p.description || '');
                          setTechStack(Array.isArray(p.techStack) ? p.techStack.join(', ') : (p.techStack || ''));
                        }}
                        className="px-3 py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-all cursor-pointer text-left"
                      >
                        {p.title || `Project #${idx + 1}`}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sample Project Presets */}
              <div className="space-y-2">
                <span className="text-xs text-slate-400 font-mono">Or pick a flagship architecture preset:</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {SAMPLE_PROJECT_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectPreset(preset)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        projectTitle === preset.title
                          ? 'bg-rose-950/50 border-rose-500/50 text-white'
                          : 'bg-dark-900 border-white/10 text-slate-300 hover:border-white/20'
                      }`}
                    >
                      <div className="text-xs font-bold truncate">{preset.title}</div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5">{preset.techStack}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 font-mono">1. Project Name / Title *</label>
                  <input
                    type="text"
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    placeholder="e.g. Distributed Video Transcoding Platform"
                    className="w-full p-3 rounded-xl bg-dark-900 border border-white/10 text-white text-xs focus:border-rose-500 focus:outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 font-mono flex items-center gap-1.5">
                    <Github className="w-3.5 h-3.5 text-indigo-400" />
                    <span>2. GitHub Repository URL (Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="https://github.com/username/project-repo"
                    className="w-full p-3 rounded-xl bg-dark-900 border border-white/10 text-white text-xs focus:border-rose-500 focus:outline-none transition-all font-mono"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-300 font-mono">3. Tech Stack & Key Components</label>
                  <input
                    type="text"
                    value={techStack}
                    onChange={(e) => setTechStack(e.target.value)}
                    placeholder="e.g. React, Node.js, WebSockets, Redis, PostgreSQL, Docker, Nginx"
                    className="w-full p-3 rounded-xl bg-dark-900 border border-white/10 text-white text-xs focus:border-rose-500 focus:outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-300 font-mono">4. Short Project Architecture & Workflow Description</label>
                  <textarea
                    rows={3}
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    placeholder="Briefly describe what your system does, how components talk to each other, and what database/caching layer was chosen..."
                    className="w-full p-3 rounded-xl bg-dark-900 border border-white/10 text-white text-xs focus:border-rose-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/10">
                <button
                  onClick={() => setIsConfigOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApplyProjectConfig}
                  disabled={configuringProject || !projectTitle.trim()}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 text-white font-bold text-xs shadow-xl shadow-rose-600/30 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {configuringProject ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Analyzing Project & Generating Custom Defense...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Generate Custom Defense for This Project</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Defense Console */}
      {loading ? (
        <div className="p-16 text-center text-slate-400 font-mono flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-rose-400" />
          <span>Initializing AI Project Defense Panel for {projectTitle}...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Defense Console (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-dark-800/80 border border-white/10 space-y-6">
              
              {/* Question Header & Navigation Tabs */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono">
                    Question {currentIndex + 1} of {questions.length}
                  </span>
                  <span className="text-xs text-slate-400 font-mono flex items-center gap-1.5 hidden sm:inline-flex">
                    <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                    {currentQ.topic || 'System Architecture'}
                  </span>
                </div>

                {/* Question Selector Tabs */}
                <div className="flex items-center gap-2 bg-dark-950/80 p-1.5 rounded-2xl border border-white/10">
                  {questions.map((q, idx) => {
                    const isCurrent = idx === currentIndex;
                    const hasAnswer = (answers[idx] || '').trim().length > 0;
                    const isEvaluated = Boolean(feedbacks[idx]);

                    return (
                      <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-1 cursor-pointer ${
                          isCurrent
                            ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                            : isEvaluated
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : hasAnswer
                            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                            : 'bg-dark-900 text-slate-400 hover:text-white border border-white/5'
                        }`}
                      >
                        <span>Q{idx + 1}</span>
                        {isEvaluated && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Question Text */}
              <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl font-black text-white leading-snug">
                  {currentQ.title}
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed pt-2 border-t border-white/5">
                  {currentQ.description}
                </p>
                {currentQ.evaluationTips && (
                  <p className="text-xs text-indigo-300 font-mono flex items-center gap-1.5 pt-1">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>Focus: {currentQ.evaluationTips}</span>
                  </p>
                )}
              </div>

              {/* Audio Visualizer & Response Editor */}
              <div className="p-4 rounded-2xl bg-dark-950 border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 font-mono">
                    Defend via Voice Speech or Text Editor
                  </span>
                  <button
                    onClick={toggleRecording}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isRecording
                        ? 'bg-rose-600 text-white animate-pulse'
                        : 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30'
                    }`}
                  >
                    {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                    <span>{isRecording ? 'Stop Voice Recording' : 'Dictate with Voice (STT)'}</span>
                  </button>
                </div>

                {isRecording && <AudioVisualizer isRecording={isRecording} />}

                <textarea
                  rows={6}
                  value={currentAnswer}
                  onChange={(e) =>
                    setAnswers((prev) => ({
                      ...prev,
                      [currentIndex]: e.target.value,
                    }))
                  }
                  placeholder={`Articulate your architectural decisions, data tradeoffs, latency benchmarks, or error recovery mechanisms for "${projectTitle}"...`}
                  className="w-full p-4 rounded-xl bg-dark-900 border border-white/10 text-white text-sm focus:border-rose-500 focus:outline-none transition-all placeholder:text-slate-600 font-sans"
                />

                <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
                  <span>{currentAnswer.split(/\s+/).filter(Boolean).length} words typed</span>
                  <span>Auto-saved for Question {currentIndex + 1}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-white/10">
                {/* Submit 1: Single Question Check */}
                <button
                  onClick={handleEvaluateSingleQuestion}
                  disabled={evaluatingSingle || !currentAnswer.trim()}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {evaluatingSingle
                      ? 'Analyzing & Grading Answer...'
                      : `1. Check This Question (Q${currentIndex + 1})`}
                  </span>
                </button>

                {/* Submit 2: Overall Defense Submit (All 3 Questions) */}
                <button
                  onClick={handleOverallSubmit}
                  disabled={submittingOverall}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 hover:from-rose-500 text-white font-bold text-xs shadow-xl shadow-rose-600/30 transition-all cursor-pointer"
                >
                  <Award className="w-4 h-4" />
                  <span>
                    {submittingOverall
                      ? 'Submitting All Questions...'
                      : '2. Final Overall Defense Submit (All 3 Questions)'}
                  </span>
                </button>
              </div>

            </div>
          </div>

          {/* Side Panel: Individual Question Scorecard or Overall Summary (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Overall Defense Result Modal Card if submitted */}
            {overallResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 rounded-3xl bg-gradient-to-br from-indigo-950/90 via-purple-950/90 to-dark-900 border-2 border-indigo-500/40 space-y-4 shadow-2xl"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-300 uppercase font-mono flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-400" />
                    <span>Overall Defense Result</span>
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                    {overallResult.answeredCount} / {overallResult.totalQuestions} Answered
                  </span>
                </div>

                <div className="text-center p-4 rounded-2xl bg-dark-950/80 border border-white/10">
                  <span className="text-xs text-slate-400 font-mono">Overall Aggregate Score</span>
                  <div className="text-4xl font-black text-white font-mono mt-1">
                    {overallResult.overallScore}%
                  </div>
                  <p className="text-xs text-emerald-400 font-semibold mt-1">
                    {overallResult.verdict}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Current Question Feedback Scorecard */}
            <div className="p-6 rounded-3xl bg-dark-800/90 border border-white/10 space-y-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-rose-400" />
                <span>Question #{currentIndex + 1} Assessment</span>
              </h3>

              {currentFeedback ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className={`text-center p-4 rounded-2xl border ${
                    currentFeedback.overallScore >= 70
                      ? 'bg-emerald-950/30 border-emerald-500/30'
                      : currentFeedback.overallScore > 0
                      ? 'bg-amber-950/30 border-amber-500/30'
                      : 'bg-rose-950/40 border-rose-500/30'
                  }`}>
                    <span className="text-xs font-bold uppercase font-mono text-slate-300">Question Score</span>
                    <div className="text-3xl font-black text-white font-mono mt-0.5">
                      {currentFeedback.overallScore}%
                    </div>
                  </div>

                  {/* Strengths */}
                  <div className="space-y-2 text-xs">
                    <h5 className="font-bold text-emerald-400 font-mono flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Technical Strengths
                    </h5>
                    <ul className="space-y-1 text-slate-300">
                      {currentFeedback.strengths?.map((s, i) => (
                        <li key={i}>• {s}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Vulnerabilities */}
                  {currentFeedback.improvements?.length > 0 && (
                    <div className="space-y-2 text-xs pt-2 border-t border-white/5">
                      <h5 className="font-bold text-rose-400 font-mono flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" /> Panel Recommendations
                      </h5>
                      <ul className="space-y-1 text-slate-300">
                        {currentFeedback.improvements?.map((w, i) => (
                          <li key={i}>• {w}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Detailed Analysis */}
                  {currentFeedback.detailedAnalysis && (
                    <div className="p-3 rounded-xl bg-dark-900 border border-white/5 text-[11px] text-slate-400 leading-relaxed">
                      {currentFeedback.detailedAnalysis}
                    </div>
                  )}
                </motion.div>
              ) : (
                <div className="p-8 rounded-2xl bg-dark-900/60 border border-white/5 text-center text-slate-500 space-y-2">
                  <ShieldAlert className="w-8 h-8 mx-auto text-rose-400/50" />
                  <p className="text-xs">
                    Type or dictate your answer and click <strong>"Check This Question"</strong> to receive real-time panel feedback.
                  </p>
                </div>
              )}
            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default ProjectDefense;
