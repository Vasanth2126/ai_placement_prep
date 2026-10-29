import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  ShieldAlert,
  FileCheck,
  Zap,
  Briefcase,
  Code2,
  Mic,
  Terminal,
  FileText,
  BarChart3,
  Target,
  Sparkles,
  PanelLeftClose,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';

const Sidebar = () => {
  const { user } = useAuth();
  const { isOpen, closeSidebar, toggleSidebar } = useSidebar();

  const navItems = [
    { name: 'Placement Twin', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Live Peer GD Rooms', path: '/gd', icon: Users },
    { name: 'AI Project Defense', path: '/interview/project-defense', icon: ShieldAlert },
    { name: 'Skill Gap Diagnostic', path: '/assessment', icon: FileCheck },
    { name: '15-Min Micro-Sprints', path: '/learning', icon: Zap },
    { name: 'ZyncRole Live Jobs', path: '/jobs', icon: Briefcase },
    { name: 'Live Code Editor', path: '/interview/code', icon: Code2 },
    { name: 'Voice Mock AI', path: '/interview/voice', icon: Mic },
    { name: 'Text Interview AI', path: '/interview/text', icon: Terminal },
    { name: 'ATS Resume Studio', path: '/resume', icon: FileText },
    { name: 'Growth & Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Target Onboarding', path: '/onboarding', icon: Target },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={closeSidebar}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden transition-opacity duration-300"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-[65px] left-0 z-40 h-[calc(100vh-65px)] glass-panel border-r border-white/10 flex flex-col justify-between p-3.5 transition-all duration-300 ease-in-out ${
          isOpen
            ? 'w-64 translate-x-0 opacity-100 pointer-events-auto overflow-y-auto'
            : '-translate-x-full md:translate-x-0 md:w-0 md:p-0 md:border-r-0 opacity-0 md:opacity-0 pointer-events-none overflow-hidden'
        }`}
      >
        <div className="space-y-4 min-w-[224px]">
          {/* Header Row */}
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
              Placement360 Suite
            </span>
            <button
              onClick={toggleSidebar}
              className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Collapse Sidebar [Ctrl+B]"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Items */}
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 border border-indigo-400/30 font-semibold'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
                    }`
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </div>
                </NavLink>
              );
            })}
          </div>
        </div>

        {/* Bottom Target Card */}
        <div className="p-3 rounded-xl bg-dark-800/80 border border-white/5 text-xs text-slate-400 min-w-[224px] mt-4">
          <div className="flex items-center gap-1.5 text-indigo-400 font-medium mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="text-[11px] font-mono uppercase">Placement Twin Target</span>
          </div>
          <p className="text-white font-semibold truncate">{user?.targetRole || 'Full Stack SDE'}</p>
          <p className="text-[10px] text-slate-500 truncate">{user?.targetCompany || 'Tier-1 Engineering'}</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
