import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  Terminal,
  Code2,
  Mic,
  FileText,
  TrendingUp,
  ShieldCheck,
  Zap,
  ArrowRight,
  CheckCircle,
  Play,
  Cpu,
  Building2,
  Award,
  Layers,
} from 'lucide-react';

const LandingPage = () => {
  const { user } = useAuth();

  return (
    <div className="relative min-h-screen text-slate-100 overflow-hidden">
      
      {/* Hero Section */}
      <section className="relative pt-16 sm:pt-20 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
        
        {/* Placement Season Badge */}
        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full glass-panel border border-indigo-500/40 text-indigo-300 text-xs sm:text-sm font-semibold mb-8 animate-float shadow-lg shadow-indigo-500/20">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>Campus Placement Season 2026 • Real-Time AI Evaluator</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight max-w-5xl font-sans leading-[1.1]">
          Master Your Placement Technical Rounds with <span className="text-gradient">Real-Time AI</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-lg lg:text-xl text-slate-300 max-w-3xl font-light leading-relaxed">
          The all-in-one placement preparation platform: <strong className="text-white font-semibold">ATS PDF Resume Scanner</strong>, <strong className="text-white font-semibold">Monaco Multi-Language Code Compiler</strong>, and <strong className="text-white font-semibold">Live Speech-to-Text Voice Mock Studio</strong> with instant rubric scoring.
        </p>

        {/* Hero CTA Button */}
        <div className="mt-10 flex items-center justify-center">
          <Link
            to={user ? '/dashboard' : '/register'}
            className="flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base shadow-xl shadow-indigo-600/40 hover:shadow-indigo-600/60 transition-all hover:scale-105"
          >
            <span>Start Placement Practice</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Target Companies Ticker */}
        <div className="mt-16 pt-8 border-t border-white/10 w-full max-w-4xl">
          <p className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-5 flex items-center justify-center gap-2">
            <Building2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Curated Placement Tracks For Industry Leaders</span>
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-slate-300 font-semibold text-xs sm:text-sm">
            <span className="px-3 py-1.5 rounded-xl bg-dark-800/80 border border-white/10 hover:text-white transition-colors">Google SDE</span>
            <span className="px-3 py-1.5 rounded-xl bg-dark-800/80 border border-white/10 hover:text-white transition-colors">Amazon OA</span>
            <span className="px-3 py-1.5 rounded-xl bg-dark-800/80 border border-white/10 hover:text-white transition-colors">Microsoft Core</span>
            <span className="px-3 py-1.5 rounded-xl bg-dark-800/80 border border-white/10 hover:text-white transition-colors">Goldman Sachs</span>
            <span className="px-3 py-1.5 rounded-xl bg-dark-800/80 border border-white/10 hover:text-white transition-colors">Zoho Product</span>
            <span className="px-3 py-1.5 rounded-xl bg-dark-800/80 border border-white/10 hover:text-white transition-colors">TCS Digital</span>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Comprehensive Placement Preparation Engine
          </h2>
          <p className="mt-3 text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
            From resume ATS scoring to real-time execution sandboxes and telemetric skill radar charts.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          
          {/* Card 1: Resume Radar */}
          <div className="glass-panel glass-panel-hover rounded-3xl p-8 border border-white/10 flex flex-col justify-between glow-border">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-6 shadow-lg shadow-indigo-500/20">
                <FileText className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">ATS Resume Match & Radar</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
                Upload your PDF resume to extract skills, calculate ATS parsability match percentage, discover missing industry keywords, and generate custom question sets.
              </p>
            </div>
            <div className="pt-4 border-t border-white/5 flex items-center gap-2 text-xs text-indigo-400 font-mono">
              <Cpu className="w-4 h-4" />
              <span>pdf-parse + ATS Keyword Taxonomy</span>
            </div>
          </div>

          {/* Card 2: Live Code IDE */}
          <div className="glass-panel glass-panel-hover rounded-3xl p-8 border border-white/10 flex flex-col justify-between relative glow-border">
            <div className="absolute top-4 right-4 text-[10px] uppercase font-mono px-2 py-1 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Monaco + Native Sandbox
            </div>
            <div>
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-6 shadow-lg shadow-cyan-500/20">
                <Code2 className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Live Compiler & OA Testing</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
                Solve DSA problems with full syntax highlighting in JS, Python & Java. Run automated test cases, custom stdin parameters, and receive instant Big-O analysis.
              </p>
            </div>
            <div className="pt-4 border-t border-white/5 flex items-center gap-2 text-xs text-cyan-400 font-mono">
              <Terminal className="w-4 h-4" />
              <span>Real-time Stdin & Sandbox Execution</span>
            </div>
          </div>

          {/* Card 3: Voice Mock Interview */}
          <div className="glass-panel glass-panel-hover rounded-3xl p-8 border border-white/10 flex flex-col justify-between glow-border">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400 mb-6 shadow-lg shadow-pink-500/20">
                <Mic className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Voice Mock & Proctoring Lab</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
                Simulate real campus interview rounds with an animated AI speaking avatar, audio wave spectrums, webcam framing guidance, and anti-tab switch detection.
              </p>
            </div>
            <div className="pt-4 border-t border-white/5 flex items-center gap-2 text-xs text-pink-400 font-mono">
              <Sparkles className="w-4 h-4" />
              <span>Web Speech API + STAR Coaching</span>
            </div>
          </div>

        </div>
      </section>

      {/* Metrics & Highlights Section */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="glass-panel rounded-3xl p-8 sm:p-12 border border-indigo-500/20 grid grid-cols-2 md:grid-cols-4 gap-8 text-center glow-border">
          <div>
            <span className="text-3xl sm:text-5xl font-black text-indigo-400 font-mono">100%</span>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">Zero-Cost Offline/Online Architecture</p>
          </div>
          <div>
            <span className="text-3xl sm:text-5xl font-black text-cyan-400 font-mono">3 Tracks</span>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">Code OA, Voice Mock & System Design</p>
          </div>
          <div>
            <span className="text-3xl sm:text-5xl font-black text-pink-400 font-mono">&lt;200ms</span>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">Instant Compiler & AI Rubrics</p>
          </div>
          <div>
            <span className="text-3xl sm:text-5xl font-black text-emerald-400 font-mono">Top 5%</span>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">Placement Readiness Standard</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-white/10 text-center text-xs text-slate-500">
        <p>© 2026 AI-Powered Placement Interview Preparation Platform | Production Grade</p>
      </footer>
    </div>
  );
};

export default LandingPage;

