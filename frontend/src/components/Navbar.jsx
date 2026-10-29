import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import {
  Sparkles,
  LayoutDashboard,
  Flame,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Briefcase,
  Users,
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isOpen, toggleSidebar } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isLanding = location.pathname === '/';
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const showSidebarToggle = Boolean(user && !isLanding && !isAuthPage);

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-white/10 px-4 lg:px-8 py-3.5 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Left Side: Sidebar Toggle + Brand Logo */}
        <div className="flex items-center gap-3">
          {showSidebarToggle && (
            <button
              onClick={toggleSidebar}
              className={`p-2 rounded-xl border transition-all duration-200 flex items-center justify-center cursor-pointer ${
                isOpen
                  ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40 hover:bg-indigo-600/30'
                  : 'bg-dark-800 text-slate-300 border-white/15 hover:text-white hover:bg-dark-700'
              }`}
              title="Toggle Navigation Sidebar [Ctrl+B]"
              aria-label="Toggle Sidebar"
            >
              {isOpen ? (
                <PanelLeftClose className="w-5 h-5 text-indigo-400" />
              ) : (
                <PanelLeftOpen className="w-5 h-5 text-indigo-300 animate-pulse" />
              )}
            </button>
          )}

          {/* Brand Logo */}
          <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full bg-dark-900 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white font-sans">
                  Placement<span className="text-gradient">360 AI</span>
                </span>
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                  MERN
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Right CTA / Auth Status */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              {/* Shortcut buttons */}
              <Link
                to="/gd"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-950/50 hover:bg-indigo-900/50 border border-indigo-500/30 text-indigo-300 text-xs font-semibold transition-all"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Live GD</span>
              </Link>

              <Link
                to="/jobs"
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/50 hover:bg-emerald-900/50 border border-emerald-500/30 text-emerald-300 text-xs font-semibold transition-all"
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>ZyncRole Jobs</span>
              </Link>

              {/* User Avatar */}
              <div className="flex items-center gap-2.5 pl-2 border-l border-white/10">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-xs text-white shadow-inner">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'C'}
                </div>
                <div className="hidden lg:block text-left leading-tight">
                  <p className="text-xs font-semibold text-white max-w-[120px] truncate">{user.name || 'Candidate'}</p>
                  <span className="text-[9px] text-indigo-300 uppercase tracking-wide font-mono">
                    {user.targetRole || 'Candidate'}
                  </span>
                </div>
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                title="Logout"
                className="p-2 rounded-xl bg-dark-800 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-white/5 transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm font-medium text-slate-300 hover:text-white px-3 py-2 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="relative inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white transition-all bg-indigo-600 rounded-xl hover:bg-indigo-500 shadow-lg shadow-indigo-600/30"
              >
                Get Started Free
              </Link>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

export default Navbar;
