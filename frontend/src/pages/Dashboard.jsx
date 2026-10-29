import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Zap,
  Target,
  Users,
  ShieldAlert,
  FileCheck,
  BookOpen,
  Briefcase,
  FileText,
  TrendingUp,
  Award,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Code2,
  Mic,
  RotateCcw,
  ChevronRight,
  Upload,
  AlertCircle,
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recalibrating, setRecalibrating] = useState(false);
  const [activeResumeData, setActiveResumeData] = useState(null);

  const userKey = user?.email || user?.id || user?._id || 'candidate';

  useEffect(() => {
    fetchProfileData();
    loadActiveResume();
  }, [userKey]);

  const loadActiveResume = () => {
    try {
      const saved = localStorage.getItem(`active_resume_data_${userKey}`);
      if (saved) {
        setActiveResumeData(JSON.parse(saved));
      } else {
        setActiveResumeData(null);
      }
    } catch (e) {
      setActiveResumeData(null);
    }
  };

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/profile');
      setProfile(res.data.data);
    } catch (err) {
      console.error('Failed to load profile data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRecalibrate = async () => {
    try {
      setRecalibrating(true);
      const res = await api.post('/profile/recalibrate');
      setProfile((prev) => ({
        ...prev,
        readiness: res.data.data.readiness,
        nextBestAction: res.data.data.nextBestAction,
      }));
      loadActiveResume();
    } catch (err) {
      console.error('Recalibration failed', err);
    } finally {
      setRecalibrating(false);
    }
  };

  // Has the user uploaded an active resume?
  const hasResume = Boolean(
    activeResumeData ||
    (user?.hasUploadedResume && user?.extractedSkills && Object.values(user.extractedSkills).some(arr => arr?.length > 0)) ||
    (profile?.rawResumeText && profile.rawResumeText.length > 20)
  );

  // Derive dynamic skills based on active resume + test scores
  const getDynamicSkills = () => {
    if (!hasResume) {
      return [];
    }

    const extracted = activeResumeData?.extractedSkills || user?.extractedSkills || {};
    const skillList = [];

    if (extracted.languages?.length > 0) {
      skillList.push({
        id: 'sk-lang',
        name: `Core Languages (${extracted.languages.slice(0, 3).join(', ')})`,
        category: 'Languages',
        level: 'Strong',
        score: Math.min(95, (activeResumeData?.atsScore || 75) + 8),
        subskills: extracted.languages.map((l, i) => ({ id: `l-${i}`, name: l, status: 'mastered' })),
      });
    }

    if (extracted.frameworks?.length > 0) {
      skillList.push({
        id: 'sk-frameworks',
        name: `Frameworks (${extracted.frameworks.slice(0, 3).join(', ')})`,
        category: 'Frameworks',
        level: 'Strong',
        score: Math.min(92, (activeResumeData?.atsScore || 70) + 4),
        subskills: extracted.frameworks.map((f, i) => ({ id: `f-${i}`, name: f, status: 'mastered' })),
      });
    }

    if (extracted.databases?.length > 0) {
      skillList.push({
        id: 'sk-db',
        name: `Databases (${extracted.databases.slice(0, 3).join(', ')})`,
        category: 'Databases',
        level: 'Good',
        score: Math.min(88, (activeResumeData?.atsScore || 65)),
        subskills: extracted.databases.map((d, i) => ({ id: `d-${i}`, name: d, status: 'practicing' })),
      });
    }

    if (extracted.tools?.length > 0) {
      skillList.push({
        id: 'sk-tools',
        name: `Tools & Cloud (${extracted.tools.slice(0, 3).join(', ')})`,
        category: 'Tools',
        level: 'Needs Practice',
        score: Math.max(45, (activeResumeData?.atsScore || 60) - 15),
        subskills: extracted.tools.map((t, i) => ({ id: `t-${i}`, name: t, status: 'practicing' })),
      });
    }

    if (extracted.concepts?.length > 0) {
      skillList.push({
        id: 'sk-concepts',
        name: `Core CS & Concepts (${extracted.concepts.slice(0, 3).join(', ')})`,
        category: 'Core CS',
        level: 'Good',
        score: Math.min(90, (activeResumeData?.atsScore || 68)),
        subskills: extracted.concepts.map((c, i) => ({ id: `c-${i}`, name: c, status: 'mastered' })),
      });
    }

    return skillList.length > 0 ? skillList : profile?.skills || [];
  };

  const skills = getDynamicSkills();

  // Dynamic Readiness calculations
  const readiness = hasResume
    ? {
        overall: activeResumeData?.atsScore || profile?.readiness?.overall || 75,
        skills: Math.min(95, (activeResumeData?.atsScore || 70) + 5),
        assessment: profile?.readiness?.assessment || 65,
        interview: profile?.readiness?.interview || 60,
        gd: profile?.readiness?.gd || 55,
        communication: profile?.readiness?.communication || 70,
        resume: activeResumeData?.atsScore || 80,
        roleAlignment: Math.min(95, (activeResumeData?.atsScore || 75) + 3),
      }
    : {
        overall: 0,
        skills: 0,
        assessment: 0,
        interview: 0,
        gd: 0,
        communication: 0,
        resume: 0,
        roleAlignment: 0,
      };

  const missingKw = activeResumeData?.missingKeywords?.[0] || 'SQL Multi-Table JOINs & Indexing';

  const nba = hasResume
    ? {
        title: `Master ${missingKw} Sprint`,
        description: `Close the single biggest technical gap identified in your active resume (${activeResumeData?.fileName || 'Active Resume'}) for ${profile?.targetRole || 'Full Stack Developer'}.`,
        why: `Target campus hiring benchmarks require demonstrated hands-on mastery in ${missingKw}.`,
        timeEstimate: '15 minutes',
        priority: 'High',
        actionUrl: '/learning',
        actionText: 'Start 15-Min Focused Sprint',
      }
    : {
        title: 'Upload Resume to Calibrate Placement Twin',
        description: 'Upload your technical resume in ATS Resume Studio to unlock automated skill gap extraction, ATS ranking, and personalized interview practice.',
        why: 'Your 7-factor Placement Twin dial requires your verified resume skills and target role calibration.',
        timeEstimate: '2 minutes',
        priority: 'Critical',
        actionUrl: '/resume',
        actionText: 'Upload Resume in ATS Studio',
      };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-fadeIn">
      
      {/* Top Banner: Placement Twin Status */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950/70 via-purple-950/50 to-dark-900 border border-indigo-500/20 p-6 sm:p-8 backdrop-blur-xl">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                <span>Placement Twin • {hasResume ? 'Active Resume Calibrated' : 'Awaiting Resume'}</span>
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Target: {profile?.targetRole || user?.targetRole || 'Full Stack Software Engineer'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              Welcome Back, <span className="text-gradient">{profile?.personalInfo?.name || user?.name || 'Candidate'}</span>
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Your Placement Twin tracks real-time hiring readiness across 7 weighted dimensions, diagnosing bottlenecks and prescribing 15-minute micro-sprints based on your active resume.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            {hasResume && (
              <button
                onClick={handleRecalibrate}
                disabled={recalibrating}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-dark-900/80 hover:bg-dark-900 text-slate-300 hover:text-white border border-white/10 text-xs font-mono font-semibold transition-all shadow-md cursor-pointer"
              >
                <RotateCcw className={`w-3.5 h-3.5 text-indigo-400 ${recalibrating ? 'animate-spin' : ''}`} />
                <span>{recalibrating ? 'Recalibrating...' : 'Recalibrate Twin'}</span>
              </button>
            )}

            <Link
              to="/resume"
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{hasResume ? 'ATS Resume Studio' : 'Upload Resume (0% Initial)'}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Resume Missing Alert Callout */}
      {!hasResume && (
        <div className="p-6 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-pulse">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-300 font-mono uppercase tracking-wider">
                Action Required: Upload Resume to Unlock Placement Analysis
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Your Placement Twin score is currently at <strong>0%</strong> because no active resume has been uploaded yet. Upload your PDF resume in ATS Studio to extract your verified tech stack.
              </p>
            </div>
          </div>

          <Link
            to="/resume"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg shadow-amber-600/30 transition-all shrink-0 self-start sm:self-auto"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Resume Now</span>
          </Link>
        </div>
      )}

      {/* 2-Way Market-to-Learning Demand Loop Alert */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-indigo-950/40 to-dark-900 border border-cyan-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center shrink-0">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-cyan-300 uppercase font-mono tracking-wider">
              2-Way Market Demand Loop Active
            </span>
            <p className="text-xs text-slate-300 mt-0.5">
              Live recruiter demand for Docker & SQL JOINs jumped 18% this week. Targeted micro-modules have been prioritized below.
            </p>
          </div>
        </div>

        <Link
          to="/jobs"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md shadow-cyan-600/20 transition-all self-start sm:self-auto shrink-0"
        >
          <span>View Verified Jobs</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Hero Section: 7-Factor Readiness Dial + Next Best Action (NBA) Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Next Best Action Card (7 cols) */}
        <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-900/40 via-purple-900/20 to-dark-800 border border-indigo-500/30 relative overflow-hidden flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold font-mono">
                <Flame className="w-3.5 h-3.5 text-rose-400" />
                <span>Next Best Action • Priority {nba.priority || 'High'}</span>
              </span>
              <span className="text-xs text-indigo-300 font-mono flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {nba.timeEstimate || '15 mins'}
              </span>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                {nba.title}
              </h2>
              <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                {nba.description}
              </p>
            </div>

            {/* Why Needed Callout */}
            <div className="p-4 rounded-2xl bg-dark-900/80 border border-white/5 space-y-1">
              <span className="text-[11px] font-bold text-indigo-400 uppercase font-mono tracking-wider">
                Why this is your #1 Bottleneck:
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {nba.why}
              </p>
            </div>
          </div>

          <Link
            to={nba.actionUrl || '/learning'}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 group"
          >
            <span>{nba.actionText || 'Start 15-Min Focused Practice'}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* 7-Factor Placement Readiness Dial (5 cols) */}
        <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-dark-800/80 border border-white/10 flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase font-mono tracking-wider">Placement Twin Dial</span>
            <span className="text-xs font-bold text-emerald-400 font-mono">Tier-1 Threshold: 75%</span>
          </div>

          <div className="flex flex-col items-center justify-center text-center space-y-2 py-2">
            <div className="relative flex items-center justify-center">
              {/* Circular Gauge Representation */}
              <div className="w-36 h-36 rounded-full border-8 border-dark-950 flex items-center justify-center relative bg-dark-900/50 shadow-inner">
                <div
                  className="absolute inset-0 rounded-full border-8 border-transparent border-t-indigo-500 border-r-purple-500 transition-all duration-1000"
                  style={{ transform: `rotate(${readiness.overall * 3.6}deg)` }}
                />
                <div className="text-center">
                  <div className="text-3xl font-black text-white font-mono">{readiness.overall}%</div>
                  <span className="text-[10px] text-slate-400 font-mono uppercase">Readiness</span>
                </div>
              </div>
            </div>
            <span className="text-xs font-semibold text-indigo-300">
              {!hasResume
                ? '⚠️ Upload Resume to Calibrate Score'
                : readiness.overall >= 75
                ? '🔥 Campus Placement Ready'
                : '⚡ Bottlenecks Identified from Active Resume'}
            </span>
          </div>

          {/* 7-Factor Weighted Breakdown Bars */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Technical Skills (25%)</span>
              <span className="font-mono text-white font-bold">{readiness.skills}%</span>
            </div>
            <div className="w-full bg-dark-950 h-1.5 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full transition-all duration-1000" style={{ width: `${readiness.skills}%` }} />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-slate-400">Adaptive Assessments (15%)</span>
              <span className="font-mono text-white font-bold">{readiness.assessment}%</span>
            </div>
            <div className="w-full bg-dark-950 h-1.5 rounded-full overflow-hidden">
              <div className="h-full bg-cyan-500 rounded-full transition-all duration-1000" style={{ width: `${readiness.assessment}%` }} />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-slate-400">Project Defense & Mock (15%)</span>
              <span className="font-mono text-white font-bold">{readiness.interview}%</span>
            </div>
            <div className="w-full bg-dark-950 h-1.5 rounded-full overflow-hidden">
              <div className="h-full bg-rose-500 rounded-full transition-all duration-1000" style={{ width: `${readiness.interview}%` }} />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-slate-400">Group Discussion PREP (10%)</span>
              <span className="font-mono text-white font-bold">{readiness.gd}%</span>
            </div>
            <div className="w-full bg-dark-950 h-1.5 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full transition-all duration-1000" style={{ width: `${readiness.gd}%` }} />
            </div>
          </div>
        </div>

      </div>

      {/* Quick Launch Practice Arenas */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider font-mono">
          Comprehensive Training Arenas
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/gd"
            className="p-5 rounded-2xl bg-dark-800/80 border border-white/10 hover:border-indigo-500/40 transition-all flex flex-col justify-between space-y-3 group"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">
                Live WebRTC
              </span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                Peer & AI GD Rooms
              </h4>
              <p className="text-xs text-slate-400 mt-1">Practice turn-taking & PREP scoring</p>
            </div>
          </Link>

          <Link
            to="/interview/project-defense"
            className="p-5 rounded-2xl bg-dark-800/80 border border-white/10 hover:border-rose-500/40 transition-all flex flex-col justify-between space-y-3 group"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono">
                Panel Pressure
              </span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white group-hover:text-rose-300 transition-colors">
                AI Project Defense
              </h4>
              <p className="text-xs text-slate-400 mt-1">Interrogate architecture & metrics</p>
            </div>
          </Link>

          <Link
            to="/interview/code"
            className="p-5 rounded-2xl bg-dark-800/80 border border-white/10 hover:border-cyan-500/40 transition-all flex flex-col justify-between space-y-3 group"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                <Code2 className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono">
                Live Compiler
              </span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                Live Code Editor
              </h4>
              <p className="text-xs text-slate-400 mt-1">Monaco multi-language executions</p>
            </div>
          </Link>

          <Link
            to="/assessment"
            className="p-5 rounded-2xl bg-dark-800/80 border border-white/10 hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-3 group"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                <FileCheck className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">
                Skill Diagnostic
              </span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                Skill Gap Diagnostics
              </h4>
              <p className="text-xs text-slate-400 mt-1">Target company benchmark gaps</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Dynamic Skill Gap Matrix with Subskills */}
      <div className="p-6 sm:p-8 rounded-3xl bg-dark-800/80 border border-white/10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-black text-white">Dynamic Skill Gap Matrix</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {hasResume
                ? `Derived from active resume (${activeResumeData?.fileName || 'Verified Resume'}) for ${profile?.targetRole || 'Full Stack Software Engineer'}`
                : 'Awaiting resume upload in ATS Studio to calibrate skills'}
            </p>
          </div>

          <Link
            to="/learning"
            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 font-mono flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Explore All Micro-Sprints</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {skills.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-dark-900/60 border border-white/5 space-y-3">
            <Upload className="w-10 h-10 mx-auto text-slate-500" />
            <h4 className="text-sm font-bold text-slate-300">No Resume Skills Loaded</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Please upload your technical resume in ATS Resume Studio to automatically populate this matrix with your verified skills.
            </p>
            <Link
              to="/resume"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all"
            >
              <span>Upload Resume</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {skills.map((skill) => (
              <div
                key={skill.id}
                className="p-5 rounded-2xl bg-dark-900/90 border border-white/5 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white truncate max-w-[160px]">{skill.name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md font-mono ${
                      skill.level === 'Strong' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {skill.level} ({skill.score}%)
                    </span>
                  </div>

                  <div className="w-full bg-dark-950 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${skill.score >= 75 ? 'bg-emerald-500' : skill.score >= 60 ? 'bg-indigo-500' : 'bg-amber-500'}`}
                      style={{ width: `${skill.score}%` }}
                    />
                  </div>

                  {/* Subskills Pills */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {skill.subskills?.map((sub) => (
                      <span
                        key={sub.id}
                        className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                          sub.status === 'mastered'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : sub.status === 'practicing'
                            ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20'
                            : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                        }`}
                      >
                        {sub.name}
                      </span>
                    ))}
                  </div>
                </div>

                <Link
                  to="/learning"
                  className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 pt-2 border-t border-white/5 flex items-center justify-between"
                >
                  <span>Practice Module</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
