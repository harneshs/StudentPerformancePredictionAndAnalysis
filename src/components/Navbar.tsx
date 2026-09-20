import React, { useState } from 'react';
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  UserPlus,
  LineChart,
  Bot,
  FileSpreadsheet,
  Database,
  Settings,
  LogOut,
  Sparkles,
  Palette,
  Sun,
  Moon,
  School,
  ExternalLink,
  Edit2,
} from 'lucide-react';
import { StaffUser, ThemeMode } from '../types';

export type NavTab =
  | 'dashboard'
  | 'students'
  | 'add-student'
  | 'performance'
  | 'ai-assistant'
  | 'reports'
  | 'backup'
  | 'settings';

interface NavbarProps {
  currentTab: NavTab;
  setCurrentTab: (tab: NavTab) => void;
  staffUser: StaffUser | null;
  onLogout: () => void;
  studentCount: number;
  currentTheme?: ThemeMode;
  onThemeChange?: (theme: ThemeMode) => void;
  onOpenStudentPortal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  staffUser,
  onLogout,
  studentCount,
  currentTheme = 'dark',
  onThemeChange,
  onOpenStudentPortal,
}) => {
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  const navItems: { id: NavTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'add-student', label: 'Add Student', icon: UserPlus },
    { id: 'performance', label: 'Performance Analysis', icon: LineChart },
    { id: 'ai-assistant', label: 'AI Assistant', icon: Bot },
    { id: 'reports', label: 'Reports', icon: FileSpreadsheet },
    { id: 'backup', label: 'Data Backup', icon: Database },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const cycleTheme = () => {
    if (!onThemeChange) return;
    const themeCycle: ThemeMode[] = ['dark', 'light', 'navy', 'emerald'];
    const idx = themeCycle.findIndex((t) => t === currentTheme);
    const nextTheme: ThemeMode = themeCycle[(idx + 1) % themeCycle.length] || 'dark';
    onThemeChange(nextTheme);
  };

  return (
    <header id="main-header" className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Portal Branding */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentTab('dashboard')}>
            <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-inner">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-lg text-slate-100 tracking-tight">Smart Academic Portal</span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-950 text-indigo-300 border border-indigo-800">
                  <Sparkles className="w-3 h-3 mr-1 text-indigo-400" /> AI-Powered
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Performance Prediction &amp; Academic Assistant</p>
            </div>
          </div>

          {/* Quick Actions, Theme Switcher & User info */}
          <div className="flex items-center space-x-2.5">
            {/* Student & Parent Portal Switcher */}
            {onOpenStudentPortal && (
              <button
                id="navbar-student-portal-btn"
                onClick={onOpenStudentPortal}
                className="hidden sm:inline-flex items-center px-2.5 py-1.5 rounded-md text-xs font-semibold bg-indigo-950/70 hover:bg-indigo-900 text-indigo-300 border border-indigo-800/80 transition-colors shadow-xs"
                title="Open Student & Parent View"
              >
                <ExternalLink className="w-3.5 h-3.5 mr-1 text-indigo-400" />
                <span>Student/Parent Portal</span>
              </button>
            )}

            {/* Theme Toggle Button */}
            {onThemeChange && (
              <div className="relative">
                <button
                  id="navbar-theme-toggle-btn"
                  onClick={cycleTheme}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setShowThemeMenu(!showThemeMenu);
                  }}
                  className="p-1.5 rounded-md text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
                  title={`Current Theme: ${currentTheme.toUpperCase()} (Click to toggle theme)`}
                >
                  {currentTheme === 'light' && <Sun className="w-4 h-4 text-amber-400" />}
                  {currentTheme === 'dark' && <Moon className="w-4 h-4 text-indigo-400" />}
                  {currentTheme === 'navy' && <School className="w-4 h-4 text-blue-400" />}
                  {currentTheme === 'emerald' && <Sparkles className="w-4 h-4 text-emerald-400" />}
                </button>
              </div>
            )}

            <span className="hidden md:inline-block h-6 w-px bg-slate-800" />

            {/* Professor / Staff Info (Clickable to Edit) */}
            <div
              id="navbar-prof-profile"
              onClick={() => setCurrentTab('settings')}
              className="hidden md:flex flex-col text-right cursor-pointer hover:bg-slate-800/60 px-2 py-1 rounded transition-colors group"
              title="Click to edit Professor Profile in Settings"
            >
              <div className="flex items-center space-x-1 justify-end">
                <span className="text-xs font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors">
                  {staffUser?.name || 'Prof. S. R. Ramanathan'}
                </span>
                <Edit2 className="w-3 h-3 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <span className="text-[10px] text-slate-400 group-hover:text-slate-300">
                {staffUser?.role || 'Academic Staff'}
              </span>
            </div>

            <span className="hidden md:inline-block h-6 w-px bg-slate-800" />

            {/* Logout */}
            <button
              id="logout-btn"
              onClick={onLogout}
              className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium text-slate-300 bg-slate-800 hover:bg-rose-950 hover:text-rose-300 hover:border-rose-800 border border-slate-700 transition-colors"
              title="Logout from Staff Portal"
            >
              <LogOut className="w-3.5 h-3.5 mr-1.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <nav className="flex space-x-1 overflow-x-auto py-2 scrollbar-none border-t border-slate-800/80">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => setCurrentTab(item.id)}
                className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 mr-1.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.id === 'students' && studentCount > 0 && (
                  <span
                    className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] ${
                      isActive ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {studentCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
