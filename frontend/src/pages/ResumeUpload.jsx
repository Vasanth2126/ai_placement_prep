import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
  FileText,
  Sparkles,
  Cpu,
  Target,
  AlertTriangle,
  Award,
  Zap,
  Code2,
  Mic,
  Terminal,
  RotateCcw,
  XCircle,
  FolderOpen,
  CheckCircle2,
  Check,
  ArrowRight,
  Layers,
} from 'lucide-react';

const ResumeUpload = () => {
  const { user, updateUserProfile } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [targetRole, setTargetRole] = useState(user?.targetRole || 'Full Stack Software Engineer');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [activeResume, setActiveResume] = useState(null);
  const [showActivePrompt, setShowActivePrompt] = useState(false);

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const userKey = user?.email || user?.id || user?._id || 'candidate';

  // Load existing active resume from localStorage on mount
  useEffect(() => {
    try {
      const savedActive = localStorage.getItem(`active_resume_data_${userKey}`);
      if (savedActive) {
        const parsed = JSON.parse(savedActive);
        setActiveResume(parsed);
        // If nothing is currently analyzed in this session, show the active resume
        if (!analysisResult) {
          setAnalysisResult(parsed);
        }
      }
    } catch (e) {}
  }, [userKey]);

  // Handle file selection from local system
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setError('Please select a valid PDF file (.pdf format).');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setError('');
    await runAnalysis(file);
  };

  // Run resume analysis against backend
  const runAnalysis = async (fileToAnalyze) => {
    const targetFile = fileToAnalyze || selectedFile;
    if (!targetFile) {
      setError('Please select a PDF resume file from your computer.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('resume', targetFile);
      formData.append('targetRole', targetRole);

      const res = await api.post('/resume/upload', formData);

      if (res.data?.success && res.data?.data) {
        const data = res.data.data;
        const newAnalysis = {
          fileName: targetFile.name,
          uploadDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          isValidResume: data.isValidResume ?? (data.atsScore > 0),
          warning: data.warning,
          atsScore: data.atsScore ?? 0,
          missingKeywords: data.missingKeywords || [],
          matchVerdict: data.matchVerdict || 'Resume analyzed against industry benchmarks.',
          extractedSkills: data.extractedSkills || {
            languages: [],
            frameworks: [],
            databases: [],
            tools: [],
            concepts: [],
          },
          projects: data.projects || [],
          suggestedQuestions: data.suggestedQuestions || [],
          rawTextLength: data.rawTextLength,
          targetRole: data.targetRole || targetRole,
        };

        setAnalysisResult(newAnalysis);

        // If user already had an active resume, prompt them to choose whether to set this new one as primary
        if (activeResume && activeResume.fileName !== targetFile.name) {
          setShowActivePrompt(true);
        } else {
          // Set as primary active resume automatically
          setAsActiveResume(newAnalysis);
        }
      } else {
        setError(res.data?.message || 'Resume parsing failed.');
      }
    } catch (err) {
      console.warn('Resume upload request error:', err);
      setError(
        err.response?.data?.message ||
        'Failed to connect to backend server. Make sure the backend is running on port 5001.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Set the specified analysis as the primary active resume across the platform
  const setAsActiveResume = (analysis) => {
    setActiveResume(analysis);
    setShowActivePrompt(false);
    try {
      localStorage.setItem(`active_resume_data_${userKey}`, JSON.stringify(analysis));
      localStorage.setItem(`resume_uploaded_${userKey}`, 'true');
    } catch (e) {}

    if (updateUserProfile) {
      updateUserProfile({
        hasUploadedResume: true,
        overallReadinessScore: analysis.atsScore || 75,
        extractedSkills: analysis.extractedSkills,
        targetRole: analysis.targetRole || targetRole,
        activeResumeName: analysis.fileName,
      });
    }
  };

  const handleKeepPreviousActive = () => {
    setShowActivePrompt(false);
  };

  const handleStartInterview = (mode = 'text') => {
    if (analysisResult?.suggestedQuestions && analysisResult.suggestedQuestions.length > 0) {
      sessionStorage.setItem('tailoredQuestions', JSON.stringify(analysisResult.suggestedQuestions));
    }
    navigate(`/interview/${mode}`, {
      state: {
        customQuestions: analysisResult?.suggestedQuestions || [],
        targetRole,
      },
    });
  };

  // Total skills extracted
  const totalSkillsCount = analysisResult?.extractedSkills
    ? Object.values(analysisResult.extractedSkills).reduce((acc, curr) => acc + (curr?.length || 0), 0)
    : 0;

  // SVG Gauge calculations
  const ats = analysisResult?.atsScore ?? 0;
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (ats / 100) * circumference;

  const getScoreColor = (score) => {
    if (score >= 85) return '#10B981'; // emerald
    if (score >= 70) return '#6366F1'; // indigo
    if (score >= 45) return '#F59E0B'; // amber
    return '#EF4444'; // rose
  };

  const getScoreBadgeClass = (score) => {
    if (score >= 85) return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    if (score >= 70) return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
    if (score >= 45) return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
  };

  const isCurrentAnalysisActive =
    activeResume &&
    analysisResult &&
    (activeResume.fileName === analysisResult.fileName || activeResume.atsScore === analysisResult.atsScore);

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto pb-12">
      
      {/* Top Header */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 glow-border">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI Placement Radar • Active Resume Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            ATS Resume Studio & Skill Taxonomy
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl font-light">
            Upload your technical resume (PDF). Our deep NLP engine extracts your verified tech stack, matches ATS keywords against tier-1 standards, and calibrates your Placement Twin dashboard.
          </p>
        </div>

        {/* Target Role Selector */}
        <div className="bg-dark-900/80 p-4 rounded-2xl border border-white/10 flex flex-col gap-2 self-stretch md:self-auto min-w-[260px]">
          <span className="text-xs text-slate-400 font-mono flex items-center gap-1.5 font-semibold">
            <Target className="w-3.5 h-3.5 text-indigo-400" />
            <span>Benchmark Target Role:</span>
          </span>
          <select
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-dark-800 border border-white/10 text-xs font-semibold text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="Full Stack Software Engineer">Full Stack Software Engineer (SDE-1)</option>
            <option value="Backend Software Engineer">Backend Engineer (Node.js / Java / Python)</option>
            <option value="Frontend Software Engineer">Frontend Engineer (React / Next.js)</option>
            <option value="DevOps & Cloud Engineer">DevOps & Cloud Systems Engineer</option>
            <option value="Data Structures & Algorithms Core">DSA & Core Product SDE</option>
          </select>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 flex items-center gap-3 text-rose-300 text-xs sm:text-sm animate-fadeIn">
          <XCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Active Resume Selector & Verification Modal / Banner */}
      {showActivePrompt && analysisResult && activeResume && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-950/80 via-purple-950/60 to-dark-900 border-2 border-indigo-500/50 shadow-2xl space-y-4 animate-fadeIn">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">
                Select Active Resume for Placement Twin Analytics
              </h3>
              <p className="text-xs text-slate-300">
                You analyzed a new resume (<span className="text-indigo-300 font-semibold">{analysisResult.fileName || 'New Resume'}</span> • ATS: <span className="text-emerald-400 font-bold">{analysisResult.atsScore}%</span>).
                Your current active resume is (<span className="text-slate-300 font-semibold">{activeResume.fileName || 'Previous Resume'}</span> • ATS: <span className="text-indigo-400 font-bold">{activeResume.atsScore}%</span>).
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setAsActiveResume(analysisResult)}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Set Newly Uploaded Resume as Primary Active ({analysisResult.atsScore}%)</span>
            </button>

            <button
              onClick={handleKeepPreviousActive}
              className="px-5 py-2.5 rounded-xl bg-dark-800 hover:bg-dark-700 text-slate-300 hover:text-white font-bold text-xs border border-white/10 transition-all cursor-pointer"
            >
              <span>Keep Previous Resume as Active ({activeResume.atsScore}%)</span>
            </button>
          </div>
        </div>
      )}

      {/* Direct System File Upload Panel */}
      <div className="glass-panel rounded-3xl p-8 sm:p-10 border border-white/10 text-center flex flex-col items-center justify-center glow-border space-y-6">
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />

        <div className="w-16 h-16 rounded-3xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-lg shadow-indigo-500/20">
          <FolderOpen className="w-8 h-8" />
        </div>

        <div className="space-y-1.5 max-w-md">
          <h3 className="text-lg sm:text-xl font-bold text-white">
            {selectedFile ? selectedFile.name : 'Upload PDF Resume from Computer'}
          </h3>
          <p className="text-xs text-slate-400">
            {selectedFile
              ? `Selected: ${(selectedFile.size / 1024).toFixed(1)} KB • Click below to analyze`
              : 'Select your PDF resume to extract skills, calculate ATS ranking, and update your Placement Twin.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-1">
          <button
            type="button"
            disabled={loading}
            onClick={() => {
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
                fileInputRef.current.click();
              }
            }}
            className="px-7 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-indigo-600/30 flex items-center gap-2.5 transition-all hover:scale-105 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Parsing & Evaluating Resume...</span>
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                <span>{selectedFile ? 'Choose Different PDF' : 'Browse & Upload Resume (PDF)'}</span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* Analysis Output Section */}
      {analysisResult && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Invalid Resume Warning Card */}
          {(!analysisResult.isValidResume || totalSkillsCount === 0) && (
            <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-rose-500/30 bg-rose-950/20 space-y-4">
              <div className="flex items-start gap-3">
                <XCircle className="w-6 h-6 text-rose-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-rose-300">
                    Unrecognized Document / No Technical Skills Detected
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {analysisResult.warning ||
                      'The uploaded PDF does not contain software engineering skills, programming languages, or standard resume sections. Please ensure you upload your actual technical resume/CV in text-readable PDF format.'}
                  </p>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => {
                    setAnalysisResult(null);
                    setSelectedFile(null);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-rose-600/20 transition-all hover:scale-105"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Upload Different Resume</span>
                </button>
              </div>
            </div>
          )}

          {/* Valid Resume Analysis Showcase */}
          {analysisResult.isValidResume && totalSkillsCount > 0 && (
            <>
              {/* ATS Scorecard Banner */}
              <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 glow-border flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                
                <div className="space-y-2 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getScoreBadgeClass(analysisResult.atsScore)}`}>
                      {analysisResult.atsScore >= 85
                        ? 'Tier-1 Candidate Match'
                        : analysisResult.atsScore >= 70
                        ? 'Competitive Candidate Match'
                        : 'Moderate Placement Foundation'}
                    </span>
                    {isCurrentAnalysisActive ? (
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 font-mono">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Active Primary Resume</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => setAsActiveResume(analysisResult)}
                        className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600 hover:text-white transition-all cursor-pointer"
                      >
                        Set as Active Resume
                      </button>
                    )}
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black text-white">
                    ATS Keyword Match & Placement Score
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
                    {analysisResult.matchVerdict}
                  </p>
                </div>

                {/* Score Circular Gauge */}
                <div className="flex items-center gap-4 bg-dark-900/90 p-4 rounded-3xl border border-white/10 flex-shrink-0 shadow-xl">
                  <div className="relative w-20 h-20 flex items-center justify-center">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <circle
                        className="text-slate-800"
                        strokeWidth="8"
                        stroke="currentColor"
                        fill="transparent"
                        r={radius}
                        cx="50"
                        cy="50"
                      />
                      <circle
                        className="progress-ring-circle transition-all duration-1000 ease-out"
                        strokeWidth="8"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        stroke={getScoreColor(analysisResult.atsScore)}
                        fill="transparent"
                        r={radius}
                        cx="50"
                        cy="50"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-xl font-black text-white font-mono leading-none">
                        {analysisResult.atsScore}%
                      </span>
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold mt-0.5">
                        ATS Match
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-amber-400" />
                      <span>{totalSkillsCount} Skills Extracted</span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {analysisResult.projects?.length || 0} Projects Identified
                    </div>
                  </div>
                </div>

              </div>

              {/* Extracted Skills Taxonomy Matrix */}
              <div className="glass-panel rounded-3xl p-6 sm:p-7 border border-white/10 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2 text-white font-bold text-sm sm:text-base">
                    <Cpu className="w-4 h-4 text-indigo-400" />
                    <span>Extracted Technical Competency Taxonomy</span>
                  </div>
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    {totalSkillsCount} Recognized Technologies
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(analysisResult.extractedSkills || {}).map(([category, skills]) => {
                    if (!skills || skills.length === 0) return null;
                    return (
                      <div key={category} className="p-4 rounded-2xl bg-dark-900/80 border border-white/5 space-y-2">
                        <span className="text-xs font-mono uppercase font-bold text-slate-400 block tracking-wider">
                          {category} ({skills.length})
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {skills.map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Missing Recommended Keywords */}
              {analysisResult.missingKeywords && analysisResult.missingKeywords.length > 0 && (
                <div className="glass-panel rounded-3xl p-6 sm:p-7 border border-amber-500/30 bg-amber-950/10 space-y-3">
                  <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Recommended Placement Keywords to Boost Recruiter Match for {analysisResult.targetRole}</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Adding demonstrated project experience with these competencies will optimize your ATS ranking:
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {analysisResult.missingKeywords.map((kw, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-200 border border-amber-500/30 text-xs font-semibold"
                      >
                        + {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Bar */}
              <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 glow-border space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                      <Zap className="w-4 h-4 text-indigo-400" />
                      <span>Start Tailored Placement Practice</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Questions have been dynamically generated from your extracted tech stack ({analysisResult.extractedSkills?.languages?.slice(0, 3).join(', ')})
                    </p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4 pt-1">
                  <button
                    onClick={() => handleStartInterview('code')}
                    className="p-4 rounded-2xl bg-dark-800 hover:bg-dark-700 border border-cyan-500/30 text-left transition-all hover:scale-105 flex flex-col justify-between space-y-3 group cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
                        <Code2 className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-mono text-cyan-400 font-bold px-2 py-0.5 rounded bg-cyan-500/10">Round 1</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-cyan-300">Live Code Assessment</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">Solve algorithmic problems in C++, Java, or Python.</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleStartInterview('voice')}
                    className="p-4 rounded-2xl bg-dark-800 hover:bg-dark-700 border border-pink-500/30 text-left transition-all hover:scale-105 flex flex-col justify-between space-y-3 group cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="p-2 rounded-xl bg-pink-500/20 text-pink-400">
                        <Mic className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-mono text-pink-400 font-bold px-2 py-0.5 rounded bg-pink-500/10">Round 2</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-pink-300">AI Voice Mock Interview</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">Speech-to-text interactive tech & behavioral evaluation.</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleStartInterview('text')}
                    className="p-4 rounded-2xl bg-dark-800 hover:bg-dark-700 border border-purple-500/30 text-left transition-all hover:scale-105 flex flex-col justify-between space-y-3 group cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
                        <Terminal className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-mono text-purple-400 font-bold px-2 py-0.5 rounded bg-purple-500/10">Round 3</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-purple-300">System Design Challenge</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">Daily written architectural proposal & AI rubric grading.</p>
                    </div>
                  </button>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => {
                      setAnalysisResult(null);
                      setSelectedFile(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-dark-800 hover:bg-dark-700 text-slate-400 hover:text-white text-xs font-semibold border border-white/10 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Upload Another Resume</span>
                  </button>
                </div>

              </div>
            </>
          )}

        </div>
      )}

    </div>
  );
};

export default ResumeUpload;
