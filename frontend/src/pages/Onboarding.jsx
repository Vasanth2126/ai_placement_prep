import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Target,
  Building,
  GraduationCap,
  Clock,
  ArrowRight,
  CheckCircle2,
  Check,
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const ROLES = [
  'Full Stack Software Engineer',
  'Software Development Engineer (SDE-1)',
  'Backend Software Engineer',
  'Machine Learning Engineer',
  'Data Scientist & Analytics',
  'Frontend Engineer (React / Next.js)',
  'DevOps & Cloud Systems Engineer',
];

const COMPANIES = ['Google', 'Microsoft', 'Amazon', 'Atlassian', 'Swiggy', 'Zomato', 'PhonePe', 'Uber', 'Goldman Sachs', 'Zoho', 'TCS Digital'];

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, updateUserProfile } = useAuth();

  const [targetRole, setTargetRole] = useState(user?.targetRole || 'Full Stack Software Engineer');
  const [selectedCompanies, setSelectedCompanies] = useState(
    user?.targetCompanies || ['Google', 'Microsoft', 'Amazon']
  );
  const [degree, setDegree] = useState('B.Tech');
  const [branch, setBranch] = useState('Computer Science & Engineering');
  const [gradYear, setGradYear] = useState('2025');
  const [dailyMinutes, setDailyMinutes] = useState(90);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const toggleCompany = (company) => {
    setSelectedCompanies((prev) =>
      prev.includes(company) ? prev.filter((c) => c !== company) : [...prev, company]
    );
  };

  const handleCompleteOnboarding = async () => {
    try {
      setSaving(true);
      
      const payload = {
        targetRole,
        targetCompanies: selectedCompanies,
        personalInfo: { degree, branch, graduationYear: gradYear },
        availableDailyMinutes: Number(dailyMinutes),
      };

      try {
        await api.put('/profile', payload);
      } catch (e) {
        console.warn('Backend profile update note:', e.message);
      }

      if (updateUserProfile) {
        updateUserProfile({
          targetRole,
          targetCompany: selectedCompanies.slice(0, 3).join(' / '),
          targetCompanies: selectedCompanies,
        });
      }

      setSavedSuccess(true);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });

      setTimeout(() => {
        navigate('/dashboard');
      }, 800);
    } catch (err) {
      console.error('Onboarding update failed', err);
      navigate('/dashboard');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-8 animate-fadeIn">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold font-mono">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Placement Twin Calibration Wizard</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Define Your <span className="text-gradient">Placement Target</span>
        </h1>
        <p className="text-sm text-slate-400 max-w-lg mx-auto">
          Placement360 AI calibrates your 7-dimension readiness dial and Next Best Action bottlenecks based on your specific dream target.
        </p>
      </div>

      <div className="p-8 rounded-3xl bg-dark-800/80 border border-white/10 space-y-8">
        
        {/* Step 1: Target Role */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-2">
            <Target className="w-4 h-4 text-indigo-400" />
            <span>1. Select Primary Target Engineering Role</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {ROLES.map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setTargetRole(role)}
                className={`p-3.5 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer ${
                  targetRole === role
                    ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-600/30'
                    : 'bg-dark-900 border-white/10 text-slate-300 hover:border-indigo-500/40'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Target Companies */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-2">
            <Building className="w-4 h-4 text-purple-400" />
            <span>2. Target Dream Companies (Select Multiple)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {COMPANIES.map((comp) => {
              const isSelected = selectedCompanies.includes(comp);
              return (
                <button
                  key={comp}
                  type="button"
                  onClick={() => toggleCompany(comp)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-600/30'
                      : 'bg-dark-900 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  {comp}
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 3: Academic Background */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 font-mono">Degree</label>
            <input
              type="text"
              value={degree}
              onChange={(e) => setDegree(e.target.value)}
              className="w-full p-3 rounded-xl bg-dark-900 border border-white/10 text-white text-xs font-mono focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 font-mono">Branch</label>
            <input
              type="text"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="w-full p-3 rounded-xl bg-dark-900 border border-white/10 text-white text-xs font-mono focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 font-mono">Graduation Year</label>
            <input
              type="text"
              value={gradYear}
              onChange={(e) => setGradYear(e.target.value)}
              className="w-full p-3 rounded-xl bg-dark-900 border border-white/10 text-white text-xs font-mono focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Step 4: Daily Minutes Commitment */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>4. Available Daily Prep Time</span>
            </label>
            <span className="text-xs font-bold text-cyan-400 font-mono">{dailyMinutes} Minutes / Day</span>
          </div>
          <input
            type="range"
            min={30}
            max={180}
            step={15}
            value={dailyMinutes}
            onChange={(e) => setDailyMinutes(Number(e.target.value))}
            className="w-full accent-indigo-500 cursor-pointer"
          />
        </div>

        {/* Complete Wizard Button */}
        <button
          onClick={handleCompleteOnboarding}
          disabled={saving}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          {savedSuccess ? (
            <>
              <Check className="w-4 h-4" />
              <span>Placement Twin Calibrated! Redirecting...</span>
            </>
          ) : saving ? (
            <span>Calibrating Placement Twin...</span>
          ) : (
            <>
              <span>Launch Placement Twin Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Onboarding;
