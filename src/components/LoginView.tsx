import React, { useState } from 'react';
import {
  GraduationCap,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  Users,
  Sun,
  Moon,
  School,
  ArrowRight,
} from 'lucide-react';
import { authService } from '../services/authService';
import { StaffUser, ThemeMode } from '../types';

interface LoginViewProps {
  onLoginSuccess: (user: StaffUser) => void;
  onOpenStudentPortal?: () => void;
  currentTheme?: ThemeMode;
  onThemeChange?: (theme: ThemeMode) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLoginSuccess,
  onOpenStudentPortal,
  currentTheme = 'dark',
  onThemeChange,
}) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    setTimeout(() => {
      const res = authService.login(username, password);
      setLoading(false);
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setError(res.error || 'Authentication failed.');
      }
    }, 250);
  };

  const fillDemoAccount = () => {
    setUsername('admin');
    setPassword('admin123');
    setError(null);
  };

  const cycleTheme = () => {
    if (!onThemeChange) return;
    const themeCycle: ThemeMode[] = ['dark', 'light', 'navy', 'emerald'];
    const idx = themeCycle.findIndex((t) => t === currentTheme);
    const nextTheme: ThemeMode = themeCycle[(idx + 1) % themeCycle.length] || 'dark';
    onThemeChange(nextTheme);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px]" />

      {/* Top Bar with Theme Switcher */}
      <div className="absolute top-4 right-4 z-20 flex items-center space-x-2">
        {onThemeChange && (
          <button
            onClick={cycleTheme}
            className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors shadow-sm"
            title={`Toggle Theme (Current: ${currentTheme})`}
          >
            {currentTheme === 'light' && <Sun className="w-4 h-4 text-amber-400" />}
            {currentTheme === 'dark' && <Moon className="w-4 h-4 text-indigo-400" />}
            {currentTheme === 'navy' && <School className="w-4 h-4 text-blue-400" />}
            {currentTheme === 'emerald' && <Sparkles className="w-4 h-4 text-emerald-400" />}
          </button>
        )}
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
            <GraduationCap className="w-8 h-8" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-white">
          Smart Academic Information Portal
        </h2>
        <p className="mt-1 text-center text-sm text-slate-400">
          Student Performance Prediction &amp; Academic Assistant
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0 space-y-4">
        {/* Student & Parent Quick Access Banner */}
        {onOpenStudentPortal && (
          <div className="bg-gradient-to-r from-indigo-950/80 to-slate-900 border border-indigo-800/80 p-4 rounded-xl shadow-md flex items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Are you a Student or Parent?</div>
                <div className="text-[11px] text-indigo-200">
                  Check marks &amp; attendance using your Register No
                </div>
              </div>
            </div>
            <button
              id="student-parent-portal-link"
              type="button"
              onClick={onOpenStudentPortal}
              className="inline-flex items-center px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shrink-0 shadow-xs transition-colors"
            >
              <span>View Grades</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>
        )}

        {/* Staff Login Box */}
        <div className="bg-slate-900 py-8 px-6 shadow-xl rounded-xl border border-slate-800 sm:px-10">
          <div className="mb-4 text-center">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Faculty &amp; Staff Sign In
            </h3>
            <p className="text-[11px] text-slate-400">
              For professors, academic coordinators, and department mentors
            </p>
          </div>

          {/* Prototype Security Notice */}
          <div className="mb-5 p-3.5 bg-amber-950/40 border border-amber-800/60 rounded-lg flex items-start space-x-3">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-200">
              <span className="font-semibold text-amber-300 block mb-0.5">
                Prototype Authentication Notice
              </span>
              This system uses client-side prototype authentication for academic demonstration.
            </div>
          </div>

          {error && (
            <div className="mb-5 p-3 bg-rose-950/50 border border-rose-800 text-rose-200 text-xs rounded-lg flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="username-input"
                className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1"
              >
                Staff Username
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <User className="h-4 w-4" />
                </div>
                <input
                  id="username-input"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter staff username"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password-input"
                className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1"
              >
                Password
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password-input"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-9 pr-10 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  id="toggle-password-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                id="login-submit-btn"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors shadow-sm disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Sign In to Staff Portal'}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>Demo Staff Account:</span>
              <span className="font-mono text-indigo-300">admin / admin123</span>
            </div>
            <button
              type="button"
              id="fill-demo-btn"
              onClick={fillDemoAccount}
              className="w-full py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-md text-xs font-medium transition-colors flex items-center justify-center space-x-1"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Use Default Demo Account</span>
            </button>
          </div>
        </div>

        <div className="mt-4 text-center text-xs text-slate-500">
          Powered by Gemini AI • Browser Local Storage • Dynamic Subject Tracking
        </div>
      </div>
    </div>
  );
};
