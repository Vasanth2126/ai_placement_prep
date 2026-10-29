import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, Lightbulb, ChevronDown, ChevronUp, Sparkles, Clock, Layers, Award } from 'lucide-react';

const FeedbackCard = ({ feedback }) => {
  const [showModelAnswer, setShowModelAnswer] = useState(false);

  if (!feedback) return null;

  const {
    overallScore = 75,
    correctnessScore = 75,
    clarityScore = 75,
    complexityScore = 70,
    timeComplexity = 'N/A',
    spaceComplexity = 'N/A',
    strengths = [],
    improvements = [],
    detailedAnalysis = '',
    modelAnswer = '',
  } = feedback;

  const getScoreColor = (score) => {
    if (score >= 85) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (score >= 70) return 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10';
    return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-6 animate-fadeIn">
      
      {/* Header & Overall Score */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              AI Evaluation & Performance Report
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </h3>
            <p className="text-xs text-slate-400">Graded against tier-1 company rubric standards</p>
          </div>
        </div>

        <div className={`flex items-center gap-2.5 px-4 py-2 rounded-xl border ${getScoreColor(overallScore)} font-mono`}>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">Overall Score</span>
          <span className="text-2xl font-black">{overallScore}/100</span>
        </div>
      </div>

      {/* Metric Breakdown Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-dark-800/80 border border-white/5">
          <span className="text-xs text-slate-400 block mb-1">Correctness</span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-emerald-400 font-mono">{correctnessScore}%</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-dark-800/80 border border-white/5">
          <span className="text-xs text-slate-400 block mb-1">Clarity & Flow</span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-indigo-400 font-mono">{clarityScore}%</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-dark-800/80 border border-white/5">
          <span className="text-xs text-slate-400 block mb-1">Big-O Time</span>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-cyan-400 font-mono">{timeComplexity}</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-dark-800/80 border border-white/5">
          <span className="text-xs text-slate-400 block mb-1">Big-O Space</span>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-pink-400 font-mono">{spaceComplexity}</span>
          </div>
        </div>
      </div>

      {/* Detailed Analysis Note */}
      {detailedAnalysis && (
        <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-sm text-indigo-200/90 leading-relaxed">
          <p>{detailedAnalysis}</p>
        </div>
      )}

      {/* Strengths & Improvements */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Strengths */}
        <div className="p-4 rounded-xl bg-dark-800/60 border border-emerald-500/20 space-y-2.5">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
            <CheckCircle2 className="w-4 h-4" />
            <span>Key Strengths</span>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-300">
            {strengths.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Improvements */}
        <div className="p-4 rounded-xl bg-dark-800/60 border border-amber-500/20 space-y-2.5">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>Actionable Coaching Points</span>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-300">
            {improvements.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Model Exemplary Answer Toggle */}
      {modelAnswer && (
        <div className="pt-2">
          <button
            onClick={() => setShowModelAnswer(!showModelAnswer)}
            className="flex items-center justify-between w-full p-3.5 rounded-xl bg-dark-800/90 hover:bg-dark-700 border border-white/10 text-sm font-medium text-slate-200 transition-all"
          >
            <div className="flex items-center gap-2 text-indigo-400">
              <Lightbulb className="w-4 h-4" />
              <span>View AI Exemplary Model Answer</span>
            </div>
            {showModelAnswer ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showModelAnswer && (
            <div className="mt-3 p-4 rounded-xl bg-dark-900/90 border border-indigo-500/30 text-xs sm:text-sm text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
              {modelAnswer}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FeedbackCard;
