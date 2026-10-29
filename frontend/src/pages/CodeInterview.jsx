import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import confetti from 'canvas-confetti';
import api from '../api/axios';
import {
  Play,
  Terminal,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Copy,
  Check,
  Code2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Building2,
  Lightbulb,
  Send,
  FileText,
  BookOpen,
  CheckCircle,
  Clock,
  Maximize2,
  Layers,
  Search,
  Filter,
  Calendar,
  Shuffle,
  FolderOpen,
  Award,
  Zap,
} from 'lucide-react';
import { CODING_QUESTIONS_BANK, buildExecutableDriver } from '../data/codingQuestionsBank';

const CodeInterview = () => {
  const location = useLocation();

  // Dynamic Day Calculation for POTD (Problem of the Day)
  const getDayOfYear = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now - start;
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  };

  const getInitialIndex = () => {
    if (location.state?.questionNumber) {
      const idx = CODING_QUESTIONS_BANK.findIndex((q) => q.number === location.state.questionNumber);
      if (idx !== -1) return idx;
    }
    const dayIdx = Math.abs(getDayOfYear()) % CODING_QUESTIONS_BANK.length;
    return dayIdx;
  };

  const [currentQIndex, setCurrentQIndex] = useState(getInitialIndex);
  const [language, setLanguage] = useState('cpp');
  const [code, setCode] = useState('');
  
  // Solved state tracking saved in localStorage
  const [solvedProblemIds, setSolvedProblemIds] = useState(() => {
    try {
      const saved = localStorage.getItem('solved_coding_problems');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch (e) {
      return new Set();
    }
  });

  // Problem Explorer Drawer state
  const [showProblemDrawer, setShowProblemDrawer] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [selectedCompany, setSelectedCompany] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');

  // Tabs & Views
  const [leftTab, setLeftTab] = useState('Description'); // 'Description' | 'Editorial' | 'Solutions'
  const [bottomTab, setBottomTab] = useState('testcase'); // 'testcase' | 'result'
  const [selectedCaseIdx, setSelectedCaseIdx] = useState(0);
  
  // Execution states
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const currentQ = CODING_QUESTIONS_BANK[currentQIndex] || CODING_QUESTIONS_BANK[0];

  const formattedToday = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  // Set starter code signature when problem or language changes
  useEffect(() => {
    const starter = currentQ.starterCode?.[language] ||
      currentQ.starterCode?.cpp ||
      `// Write your ${language.toUpperCase()} solution for ${currentQ.title}\n`;
    setCode(starter);
    setTestResult(null);
    setBottomTab('testcase');
    setSelectedCaseIdx(0);
    setShowHint(false);
  }, [currentQIndex, language]);

  // Reset to empty starter template
  const handleResetCode = () => {
    const starter = currentQ.starterCode?.[language] || currentQ.starterCode?.cpp || '';
    setCode(starter);
    setTestResult(null);
  };

  // Copy code to clipboard
  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Switch Question by index
  const selectQuestion = (idx) => {
    const validIdx = (idx + CODING_QUESTIONS_BANK.length) % CODING_QUESTIONS_BANK.length;
    setCurrentQIndex(validIdx);
    setShowProblemDrawer(false);
  };

  // Random Shuffle
  const handleShuffle = () => {
    const randomIdx = Math.floor(Math.random() * CODING_QUESTIONS_BANK.length);
    selectQuestion(randomIdx);
  };

  // Language mapper for Monaco Editor
  const getMonacoLanguage = (lang) => {
    if (lang === 'cpp' || lang === 'c') return 'cpp';
    if (lang === 'python') return 'python';
    if (lang === 'java') return 'java';
    return 'javascript';
  };

  // Run Code against single selected testcase
  const handleRun = async () => {
    if (!code.trim()) return;

    setRunning(true);
    setBottomTab('result');
    setTestResult({ status: 'running', message: 'Compiling & Executing Sandbox...' });

    const activeCase = currentQ.testCases[selectedCaseIdx] || currentQ.testCases[0];
    const executableCode = buildExecutableDriver(currentQ.id, language, code, activeCase);

    try {
      const res = await api.post('/code/run', {
        language,
        code: executableCode,
      });

      const data = res.data?.data || {};
      const stdout = (data.stdout || '').trim().replace(/\s/g, '');
      const expected = (activeCase.expectedOutput || '').trim().replace(/\s/g, '');
      const isPass = !data.hasError && (stdout === expected || stdout.includes(expected));

      setTestResult({
        status: data.hasError ? 'error' : isPass ? 'accepted' : 'wrong',
        runtimeMs: data.runtimeMs || 12,
        output: data.stdout || data.output || 'No output',
        expected: activeCase.expectedOutput,
        error: data.stderr || (data.hasError ? data.output : null),
        caseIndex: selectedCaseIdx + 1,
        params: activeCase.params,
      });

      // Record to backend metrics
      try {
        await api.post('/interview/answer', {
          questionId: `${currentQ.number}. ${currentQ.title}`,
          mode: 'code',
          userResponse: { code, language },
        });
      } catch (e) {}

    } catch (err) {
      setTestResult({
        status: 'error',
        error: err.response?.data?.message || 'Execution failed or sandbox offline.',
      });
    } finally {
      setRunning(false);
    }
  };

  // Submit Code against all testcases
  const handleSubmit = async () => {
    if (!code.trim()) return;

    setSubmitting(true);
    setBottomTab('result');
    setTestResult({ status: 'running', message: `Running ${currentQ.testCases.length} Test Suites...` });

    let allPassed = true;
    let failedCase = null;
    let maxRuntime = 0;

    for (let i = 0; i < currentQ.testCases.length; i++) {
      const tc = currentQ.testCases[i];
      const executableCode = buildExecutableDriver(currentQ.id, language, code, tc);

      try {
        const res = await api.post('/code/run', {
          language,
          code: executableCode,
        });

        const data = res.data?.data || {};
        maxRuntime = Math.max(maxRuntime, data.runtimeMs || 10);

        if (data.hasError) {
          allPassed = false;
          failedCase = {
            status: 'error',
            error: data.stderr || data.output,
            caseIndex: i + 1,
          };
          break;
        }

        const stdout = (data.stdout || '').trim().replace(/\s/g, '');
        const expected = (tc.expectedOutput || '').trim().replace(/\s/g, '');
        const isPass = stdout === expected || stdout.includes(expected);

        if (!isPass) {
          allPassed = false;
          failedCase = {
            status: 'wrong',
            output: data.stdout || 'None',
            expected: tc.expectedOutput,
            caseIndex: i + 1,
            params: tc.params,
          };
          break;
        }
      } catch (err) {
        allPassed = false;
        failedCase = {
          status: 'error',
          error: err.response?.data?.message || 'Execution error during test case suite.',
          caseIndex: i + 1,
        };
        break;
      }
    }

    if (allPassed) {
      setTestResult({
        status: 'accepted',
        runtimeMs: maxRuntime || 12,
        isSubmit: true,
        totalCases: currentQ.testCases.length,
      });

      // Update solved state
      const updated = new Set(solvedProblemIds).add(currentQ.id);
      setSolvedProblemIds(updated);
      try {
        localStorage.setItem('solved_coding_problems', JSON.stringify(Array.from(updated)));
      } catch (e) {}

      // Trigger Confetti Celebration
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    } else {
      setTestResult(failedCase);
    }

    setSubmitting(false);
  };

  // Filter Problem Bank for Explorer
  const filteredProblems = CODING_QUESTIONS_BANK.filter((q) => {
    if (selectedTopic !== 'All' && !q.topic.toLowerCase().includes(selectedTopic.toLowerCase())) return false;
    if (selectedCompany !== 'All' && !q.companyTags.some(c => c.toLowerCase().includes(selectedCompany.toLowerCase()))) return false;
    if (selectedDifficulty !== 'All' && q.difficulty !== selectedDifficulty) return false;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchTitle = q.title.toLowerCase().includes(query);
      const matchTopic = q.topic.toLowerCase().includes(query);
      const matchCompany = q.companyTags.some(c => c.toLowerCase().includes(query));
      if (!matchTitle && !matchTopic && !matchCompany) return false;
    }
    return true;
  });

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] overflow-hidden text-slate-200 font-sans -m-4 sm:-m-8">
      
      {/* Top Action Header Bar */}
      <div className="h-14 bg-dark-900 border-b border-white/10 px-4 sm:px-6 flex items-center justify-between gap-3 shrink-0">
        
        {/* Left: Problem Selector & Drawer Button */}
        <div className="flex items-center gap-3">
          
          <button
            onClick={() => setShowProblemDrawer(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-dark-800 hover:bg-dark-700 border border-white/10 text-xs font-semibold text-white transition-all shadow-sm"
          >
            <FolderOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Problem Library</span>
            <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono text-[10px]">
              {CODING_QUESTIONS_BANK.length}
            </span>
          </button>

          {/* Quick Problem Switcher */}
          <div className="flex items-center gap-1 bg-dark-800 rounded-xl p-0.5 border border-white/5">
            <button
              onClick={() => selectQuestion(currentQIndex - 1)}
              title="Previous Problem"
              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-bold px-2 text-slate-300">
              #{currentQ.number}
            </span>
            <button
              onClick={() => selectQuestion(currentQIndex + 1)}
              title="Next Problem"
              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handleShuffle}
            title="Random Placement Problem"
            className="p-1.5 rounded-xl bg-dark-800 hover:bg-purple-500/20 text-slate-400 hover:text-purple-300 border border-white/5 transition-all"
          >
            <Shuffle className="w-3.5 h-3.5" />
          </button>

          {/* Problem of the Day Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold">
            <Calendar className="w-3 h-3 text-purple-400" />
            <span>Daily POTD • {formattedToday}</span>
          </div>

        </div>

        {/* Right: Language Selector & Run/Submit Buttons */}
        <div className="flex items-center gap-3">
          
          {/* Language Selector */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-dark-800 border border-white/10 text-xs font-mono font-semibold text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="cpp">C++ (GCC / C++17)</option>
            <option value="java">Java (OpenJDK 17)</option>
            <option value="python">Python 3 (3.10+)</option>
            <option value="javascript">JavaScript (Node.js)</option>
            <option value="c">C (GCC 11)</option>
          </select>

          {/* Run Code Button */}
          <button
            onClick={handleRun}
            disabled={running || submitting}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-dark-800 hover:bg-dark-700 border border-white/10 text-xs font-semibold text-slate-200 transition-all hover:scale-105 disabled:opacity-40"
          >
            {running ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 text-cyan-400" />
            )}
            <span>Run</span>
          </button>

          {/* Submit Solution Button */}
          <button
            onClick={handleSubmit}
            disabled={running || submitting}
            className="flex items-center gap-1.5 px-5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 transition-all hover:scale-105 disabled:opacity-40"
          >
            {submitting ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span>Submit</span>
          </button>

        </div>

      </div>

      {/* Main Split Layout: Left Problem Statement & Right Monaco IDE */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        
        {/* Left Column: Problem Description & Testcases */}
        <div className="lg:col-span-5 border-r border-white/10 flex flex-col bg-dark-900 overflow-y-auto">
          
          {/* Problem Header Tabs */}
          <div className="h-11 border-b border-white/10 px-4 flex items-center gap-4 text-xs font-semibold text-slate-400 shrink-0">
            {['Description', 'Editorial Hints', 'Company Tags'].map((tab) => (
              <button
                key={tab}
                onClick={() => setLeftTab(tab)}
                className={`h-full border-b-2 transition-all flex items-center gap-1.5 ${
                  leftTab === tab
                    ? 'text-white border-indigo-500'
                    : 'border-transparent hover:text-slate-200'
                }`}
              >
                <span>{tab}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-5 sm:p-6 space-y-6 flex-1 overflow-y-auto">
            
            {leftTab === 'Description' && (
              <div className="space-y-6">
                
                {/* Title & Metadata Badges */}
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-white">
                      {currentQ.number}. {currentQ.title}
                    </span>
                    {solvedProblemIds.has(currentQ.id) && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Solved</span>
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        currentQ.difficulty === 'Easy'
                          ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                          : currentQ.difficulty === 'Medium'
                          ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                          : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {currentQ.difficulty}
                    </span>

                    <span className="px-2.5 py-0.5 rounded-full bg-dark-800 text-slate-300 text-xs font-mono border border-white/5">
                      {currentQ.topic}
                    </span>
                  </div>
                </div>

                {/* Description Body */}
                <div className="text-xs sm:text-sm text-slate-300 leading-relaxed space-y-4 font-light whitespace-pre-line">
                  {currentQ.description}
                </div>

                {/* Example Cases */}
                <div className="space-y-3">
                  <span className="text-xs font-bold text-white uppercase tracking-wider block">
                    Examples:
                  </span>
                  {currentQ.examples.map((ex, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-dark-800/80 border border-white/5 text-xs font-mono space-y-1.5"
                    >
                      <p className="text-slate-400">
                        <strong className="text-slate-300">Input:</strong> {ex.input}
                      </p>
                      <p className="text-emerald-400 font-bold">
                        <strong className="text-slate-300">Output:</strong> {ex.output}
                      </p>
                      {ex.explanation && (
                        <p className="text-slate-400 font-sans text-[11px] pt-1">
                          <strong>Explanation:</strong> {ex.explanation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Constraints */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider block">
                    Constraints:
                  </span>
                  <ul className="list-disc list-inside text-xs font-mono text-slate-400 space-y-1">
                    {currentQ.constraints.map((c, idx) => (
                      <li key={idx}>{c}</li>
                    ))}
                  </ul>
                </div>

              </div>
            )}

            {leftTab === 'Editorial Hints' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 space-y-2">
                  <p className="font-bold flex items-center gap-1.5 text-amber-300">
                    <Lightbulb className="w-4 h-4" />
                    <span>Algorithmic Optimization Hints:</span>
                  </p>
                  {currentQ.hints.map((h, idx) => (
                    <p key={idx} className="leading-relaxed">💡 {h}</p>
                  ))}
                </div>
              </div>
            )}

            {leftTab === 'Company Tags' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-400">
                  This problem was frequently asked in technical coding rounds of:
                </p>
                <div className="flex flex-wrap gap-2">
                  {currentQ.companyTags.map((company, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-xl bg-dark-800 border border-white/10 text-xs font-semibold text-indigo-300 flex items-center gap-1.5"
                    >
                      <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{company}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Right Column: Monaco Code Editor + Output Panel */}
        <div className="lg:col-span-7 flex flex-col bg-[#1e1e1e] overflow-hidden">
          
          {/* Editor Action Header */}
          <div className="h-11 bg-dark-900 border-b border-white/10 px-4 flex items-center justify-between text-xs text-slate-400 shrink-0">
            <div className="flex items-center gap-2 font-mono text-[11px] text-slate-300">
              <Code2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Solution.{language === 'cpp' ? 'cpp' : language === 'java' ? 'java' : language === 'python' ? 'py' : language === 'javascript' ? 'js' : 'c'}</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleCopyCode}
                className="hover:text-white transition-colors flex items-center gap-1"
                title="Copy Solution"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                onClick={handleResetCode}
                className="hover:text-white transition-colors flex items-center gap-1"
                title="Reset Starter Code"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 min-h-[300px] relative">
            <Editor
              height="100%"
              language={getMonacoLanguage(language)}
              value={code}
              onChange={(value) => setCode(value || '')}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                fontFamily: "'Fira Code', 'Courier New', monospace",
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 12 },
              }}
            />
          </div>

          {/* Bottom Testcase & Execution Result Panel */}
          <div className="h-60 border-t border-white/10 bg-dark-900 flex flex-col shrink-0">
            
            {/* Panel Tabs */}
            <div className="h-10 border-b border-white/10 px-4 flex items-center gap-4 text-xs font-semibold text-slate-400 shrink-0">
              <button
                onClick={() => setBottomTab('testcase')}
                className={`h-full border-b-2 transition-all flex items-center gap-1.5 ${
                  bottomTab === 'testcase' ? 'text-white border-cyan-400' : 'border-transparent hover:text-slate-200'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Test Cases ({currentQ.testCases.length})</span>
              </button>

              <button
                onClick={() => setBottomTab('result')}
                className={`h-full border-b-2 transition-all flex items-center gap-1.5 ${
                  bottomTab === 'result' ? 'text-white border-indigo-500' : 'border-transparent hover:text-slate-200'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Test Results</span>
              </button>
            </div>

            {/* Panel Body */}
            <div className="p-4 flex-1 overflow-y-auto font-mono text-xs">
              
              {bottomTab === 'testcase' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {currentQ.testCases.map((tc, idx) => (
                      <button
                        key={tc.id}
                        onClick={() => setSelectedCaseIdx(idx)}
                        className={`px-3 py-1 rounded-xl font-semibold transition-all ${
                          selectedCaseIdx === idx
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                            : 'bg-dark-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        Case {idx + 1}
                      </button>
                    ))}
                  </div>

                  {currentQ.testCases[selectedCaseIdx] && (
                    <div className="space-y-2 p-3 rounded-xl bg-dark-800/60 border border-white/5">
                      {Object.entries(currentQ.testCases[selectedCaseIdx].params).map(([key, val]) => (
                        <div key={key} className="flex items-center gap-2">
                          <span className="text-slate-400">{key} =</span>
                          <span className="text-white font-bold">{val}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {bottomTab === 'result' && (
                <div>
                  {!testResult ? (
                    <p className="text-slate-500 italic">Click "Run" or "Submit" to compile and evaluate code.</p>
                  ) : testResult.status === 'running' ? (
                    <div className="flex items-center gap-2 text-cyan-300">
                      <div className="w-3.5 h-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                      <span>{testResult.message}</span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      
                      {/* Verdict Header */}
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-sm font-black flex items-center gap-1.5 ${
                            testResult.status === 'accepted'
                              ? 'text-emerald-400'
                              : testResult.status === 'wrong'
                              ? 'text-rose-400'
                              : 'text-amber-400'
                          }`}
                        >
                          {testResult.status === 'accepted' ? (
                            <>
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Accepted</span>
                            </>
                          ) : testResult.status === 'wrong' ? (
                            <>
                              <XCircle className="w-4 h-4" />
                              <span>Wrong Answer</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4" />
                              <span>Runtime / Compile Error</span>
                            </>
                          )}
                        </span>

                        {testResult.runtimeMs && (
                          <span className="text-slate-400 text-[11px] flex items-center gap-1">
                            <Clock className="w-3 h-3 text-cyan-400" />
                            <span>Runtime: {testResult.runtimeMs}ms</span>
                          </span>
                        )}
                      </div>

                      {testResult.status === 'accepted' && (
                        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            {testResult.isSubmit ? (
                              <p className="font-semibold">🎉 All {testResult.totalCases} test suites passed! Solution marked as Solved.</p>
                            ) : (
                              <p>Output matches expected: <strong>{testResult.expected}</strong></p>
                            )}
                          </div>
                          <button
                            onClick={() => selectQuestion(currentQIndex + 1)}
                            className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                          >
                            <span>Next Question →</span>
                          </button>
                        </div>
                      )}

                      {testResult.status === 'wrong' && (
                        <div className="space-y-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-200">
                          <p>Failed on Case {testResult.caseIndex}</p>
                          <div className="grid grid-cols-2 gap-2 text-[11px]">
                            <div>
                              <span className="text-slate-400 block">Your Output:</span>
                              <span className="text-rose-300 font-bold">{testResult.output}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block">Expected:</span>
                              <span className="text-emerald-400 font-bold">{testResult.expected}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {testResult.status === 'error' && (
                        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-[11px]">
                          <pre className="whitespace-pre-wrap">{testResult.error}</pre>
                        </div>
                      )}

                    </div>
                  )}
                </div>
              )}

            </div>

          </div>

        </div>

      </div>

      {/* Problem Library Explorer Modal */}
      {showProblemDrawer && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-dark-900 border border-white/10 rounded-3xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-fadeIn">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <FolderOpen className="w-5 h-5 text-indigo-400" />
                  <span>Curated Placement Problem Bank</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select any problem to practice in C++, Java, Python, JavaScript, or C.
                </p>
              </div>

              <button
                onClick={() => setShowProblemDrawer(false)}
                className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Filter Bar */}
            <div className="p-4 border-b border-white/5 bg-dark-800/50 flex flex-wrap items-center gap-3">
              
              {/* Search input */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search problem title, topic, or company..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl glass-input text-xs text-white placeholder-slate-500 focus:outline-none border border-white/10"
                />
              </div>

              {/* Difficulty filter */}
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-3 py-2 rounded-xl bg-dark-800 border border-white/10 text-xs text-white"
              >
                <option value="All">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>

            </div>

            {/* Problem List */}
            <div className="p-4 overflow-y-auto flex-1 divide-y divide-white/5">
              {filteredProblems.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs">
                  No problems match your search criteria.
                </div>
              ) : (
                filteredProblems.map((prob) => {
                  const isCurrent = prob.id === currentQ.id;
                  const isSolved = solvedProblemIds.has(prob.id);
                  const idx = CODING_QUESTIONS_BANK.findIndex(p => p.id === prob.id);

                  return (
                    <div
                      key={prob.id}
                      onClick={() => selectQuestion(idx)}
                      className={`p-4 flex items-center justify-between gap-4 cursor-pointer transition-colors ${
                        isCurrent ? 'bg-indigo-600/15' : 'hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs text-slate-400 w-8">
                          #{prob.number}
                        </span>

                        <div className="space-y-1">
                          <p className="text-sm font-bold text-white flex items-center gap-2">
                            <span>{prob.title}</span>
                            {isSolved && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            )}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                            <span>{prob.topic}</span>
                            <span>•</span>
                            <span className="text-indigo-300">{prob.companyTags.slice(0, 3).join(', ')}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                            prob.difficulty === 'Easy'
                              ? 'bg-emerald-500/10 text-emerald-300'
                              : prob.difficulty === 'Medium'
                              ? 'bg-amber-500/10 text-amber-300'
                              : 'bg-rose-500/10 text-rose-300'
                          }`}
                        >
                          {prob.difficulty}
                        </span>

                        <button className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all">
                          {isCurrent ? 'Current' : 'Solve'}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default CodeInterview;
