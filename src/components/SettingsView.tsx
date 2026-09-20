import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Save,
  Key,
  Sliders,
  ShieldCheck,
  CheckCircle2,
  Server,
  User,
  Palette,
  Sun,
  Moon,
  School,
  Sparkles,
} from 'lucide-react';
import { SettingsConfig, ThemeMode } from '../types';
import { storageService } from '../services/storageService';

interface SettingsViewProps {
  settings: SettingsConfig;
  onUpdateSettings: (newSettings: SettingsConfig) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
}) => {
  const [excellent, setExcellent] = useState(settings.thresholds.excellent);
  const [good, setGood] = useState(settings.thresholds.good);
  const [average, setAverage] = useState(settings.thresholds.average);
  const [atRisk, setAtRisk] = useState(settings.thresholds.atRisk);
  const [customKey, setCustomKey] = useState(settings.customApiKey || '');

  // Theme state
  const [theme, setTheme] = useState<ThemeMode>(settings.theme || storageService.getTheme());

  // Staff profile state (Professor Name, Role, Department, Institution)
  const [professorName, setProfessorName] = useState(
    settings.professorName || storageService.getStaffProfile().name
  );
  const [professorRole, setProfessorRole] = useState(
    settings.professorRole || storageService.getStaffProfile().role
  );
  const [departmentName, setDepartmentName] = useState(
    settings.departmentName || storageService.getStaffProfile().department
  );
  const [institutionName, setInstitutionName] = useState(
    settings.institutionName || storageService.getStaffProfile().institution
  );

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [serverStatus, setServerStatus] = useState<string>('Checking...');

  useEffect(() => {
    // Check server status
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'ok') {
          setServerStatus(
            data.geminiKeyConfigured
              ? 'Server Online (Gemini API Configured)'
              : 'Server Online (Running Offline/Intelligent Rule Engine)'
          );
        } else {
          setServerStatus('Offline / Local Only');
        }
      })
      .catch(() => {
        setServerStatus('Offline (Using Local Academic Engine)');
      });
  }, []);

  const handleSelectTheme = (selectedTheme: ThemeMode) => {
    setTheme(selectedTheme);
    storageService.saveTheme(selectedTheme);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (excellent <= good || good <= average || average <= atRisk || atRisk <= 0) {
      alert(
        'Threshold values must be strictly descending:\nExcellent > Good > Average > At Risk > 0.'
      );
      return;
    }

    const updated: SettingsConfig = {
      thresholds: {
        excellent,
        good,
        average,
        atRisk,
      },
      customApiKey: customKey.trim() || undefined,
      theme,
      professorName: professorName.trim() || 'Prof. S. R. Ramanathan',
      professorRole: professorRole.trim() || 'Senior Academic Coordinator & Staff',
      departmentName: departmentName.trim() || 'Department of Computer Science and Engineering',
      institutionName: institutionName.trim() || 'SNS College of Technology',
    };

    storageService.saveSettings(updated);
    storageService.saveTheme(theme);
    storageService.saveStaffProfile({
      name: updated.professorName,
      role: updated.professorRole,
      department: updated.departmentName,
      institution: updated.institutionName,
    });

    onUpdateSettings(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleResetDefaults = () => {
    setExcellent(85);
    setGood(70);
    setAverage(55);
    setAtRisk(40);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
            <SettingsIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              System Settings, Profile &amp; Themes
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Personalize Professor &amp; Faculty credentials, UI themes, classification cutoffs, and AI configurations.
            </p>
          </div>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Profile, Theme, and Settings saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* SECTION 1: FACULTY & PROFESSOR PROFILE */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <User className="w-4 h-4 text-indigo-500" />
              <span>Faculty &amp; Professor Profile</span>
            </h3>
            <span className="text-[11px] text-slate-400">
              Reflected on reports, portal navbar &amp; letters
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="professor-name-input"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
              >
                Professor / Staff Name
              </label>
              <input
                id="professor-name-input"
                type="text"
                required
                value={professorName}
                onChange={(e) => setProfessorName(e.target.value)}
                placeholder="e.g. Prof. S. R. Ramanathan"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label
                htmlFor="professor-role-input"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
              >
                Academic Title &amp; Role
              </label>
              <input
                id="professor-role-input"
                type="text"
                required
                value={professorRole}
                onChange={(e) => setProfessorRole(e.target.value)}
                placeholder="e.g. Senior Academic Coordinator & Staff"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label
                htmlFor="department-name-input"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
              >
                Department
              </label>
              <input
                id="department-name-input"
                type="text"
                value={departmentName}
                onChange={(e) => setDepartmentName(e.target.value)}
                placeholder="e.g. Department of Computer Science & Engineering"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label
                htmlFor="institution-name-input"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
              >
                College / Institution Name
              </label>
              <input
                id="institution-name-input"
                type="text"
                value={institutionName}
                onChange={(e) => setInstitutionName(e.target.value)}
                placeholder="e.g. SNS College of Technology"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: THEMES FOR UI */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Palette className="w-4 h-4 text-indigo-500" />
              <span>UI Themes &amp; Color Schemes</span>
            </h3>
            <span className="text-[11px] text-slate-400">
              Instant live preview
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Select your preferred visual environment for faculty dashboard and evaluations.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            {/* Dark Slate */}
            <button
              type="button"
              id="theme-dark-btn"
              onClick={() => handleSelectTheme('dark')}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                theme === 'dark'
                  ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-sm bg-slate-800/80 text-white'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center space-x-2 mb-2">
                <Moon className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold">Dark Slate</span>
              </div>
              <div className="flex space-x-1.5 mt-2">
                <div className="w-4 h-4 rounded-full bg-slate-950 border border-slate-700" />
                <div className="w-4 h-4 rounded-full bg-slate-800 border border-slate-700" />
                <div className="w-4 h-4 rounded-full bg-indigo-600" />
              </div>
              <span className="text-[10px] text-slate-400 block mt-2">
                Default eye-safe mode
              </span>
            </button>

            {/* Light Academic */}
            <button
              type="button"
              id="theme-light-btn"
              onClick={() => handleSelectTheme('light')}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                theme === 'light'
                  ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-sm bg-white text-slate-900'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center space-x-2 mb-2">
                <Sun className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-bold">Light Academic</span>
              </div>
              <div className="flex space-x-1.5 mt-2">
                <div className="w-4 h-4 rounded-full bg-slate-100 border border-slate-300" />
                <div className="w-4 h-4 rounded-full bg-white border border-slate-300" />
                <div className="w-4 h-4 rounded-full bg-indigo-600" />
              </div>
              <span className="text-[10px] text-slate-400 block mt-2">
                Clean high-contrast paper
              </span>
            </button>

            {/* Campus Navy */}
            <button
              type="button"
              id="theme-navy-btn"
              onClick={() => handleSelectTheme('navy')}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                theme === 'navy'
                  ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-sm bg-slate-900 text-white'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center space-x-2 mb-2">
                <School className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold">Campus Navy</span>
              </div>
              <div className="flex space-x-1.5 mt-2">
                <div className="w-4 h-4 rounded-full bg-[#080d1d] border border-blue-900" />
                <div className="w-4 h-4 rounded-full bg-[#0f1c3f] border border-blue-900" />
                <div className="w-4 h-4 rounded-full bg-blue-600" />
              </div>
              <span className="text-[10px] text-slate-400 block mt-2">
                Midnight university blue
              </span>
            </button>

            {/* Emerald Academic */}
            <button
              type="button"
              id="theme-emerald-btn"
              onClick={() => handleSelectTheme('emerald')}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                theme === 'emerald'
                  ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm bg-slate-900 text-white'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center space-x-2 mb-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold">Emerald Campus</span>
              </div>
              <div className="flex space-x-1.5 mt-2">
                <div className="w-4 h-4 rounded-full bg-[#03120d] border border-emerald-900" />
                <div className="w-4 h-4 rounded-full bg-[#09261c] border border-emerald-900" />
                <div className="w-4 h-4 rounded-full bg-emerald-600" />
              </div>
              <span className="text-[10px] text-slate-400 block mt-2">
                Ivy prestige green
              </span>
            </button>
          </div>
        </div>

        {/* SECTION 3: PERFORMANCE THRESHOLDS */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-indigo-500" />
              <span>Performance Tier Classification Thresholds (Score /100)</span>
            </h3>
            <button
              type="button"
              onClick={handleResetDefaults}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Reset to Defaults
            </button>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Adjust the minimum score required to reach each academic classification tier.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            {/* Excellent */}
            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
              <label className="block text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
                Excellent Tier (&ge;)
              </label>
              <input
                id="threshold-excellent-input"
                type="number"
                min="50"
                max="100"
                value={excellent}
                onChange={(e) => setExcellent(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-900 dark:text-white"
              />
              <span className="text-[10px] text-slate-400 block mt-1">Default: &ge;85</span>
            </div>

            {/* Good */}
            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
              <label className="block text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">
                Good Tier (&ge;)
              </label>
              <input
                id="threshold-good-input"
                type="number"
                min="40"
                max="90"
                value={good}
                onChange={(e) => setGood(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-900 dark:text-white"
              />
              <span className="text-[10px] text-slate-400 block mt-1">Default: &ge;70</span>
            </div>

            {/* Average */}
            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
              <label className="block text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1">
                Average Tier (&ge;)
              </label>
              <input
                id="threshold-average-input"
                type="number"
                min="30"
                max="80"
                value={average}
                onChange={(e) => setAverage(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-900 dark:text-white"
              />
              <span className="text-[10px] text-slate-400 block mt-1">Default: &ge;55</span>
            </div>

            {/* At Risk */}
            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
              <label className="block text-xs font-semibold text-rose-600 dark:text-rose-400 mb-1">
                At Risk Tier (&ge;)
              </label>
              <input
                id="threshold-atrisk-input"
                type="number"
                min="20"
                max="70"
                value={atRisk}
                onChange={(e) => setAtRisk(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-900 dark:text-white"
              />
              <span className="text-[10px] text-slate-400 block mt-1">
                Score &lt; {atRisk} is Critical
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 4: SERVER & GEMINI AI CONFIGURATION */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Server className="w-4 h-4 text-indigo-500" />
            <span>AI Model &amp; Server Infrastructure</span>
          </h3>

          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
            <span className="text-slate-600 dark:text-slate-300">Backend Server Status:</span>
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">
              {serverStatus}
            </span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Custom Gemini API Key Override (Optional)
            </label>
            <div className="relative">
              <Key className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                id="custom-api-key-input"
                type="password"
                placeholder="AIzaSy... (Leave empty to use server default)"
                value={customKey}
                onChange={(e) => setCustomKey(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white font-mono"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              Notice: The application securely proxies Gemini calls through its backend server. Supplying an optional key here saves it to your local browser storage for client-specific requests. If no key is set or available, the system automatically uses its built-in rule engine.
            </p>
          </div>
        </div>

        {/* SECTION 5: PROTOTYPE CREDENTIALS */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Prototype Staff Credentials</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            For demonstration and project presentation purposes, default staff login is:
          </p>
          <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-700 dark:text-slate-300 space-y-1">
            <div>Username: <strong className="text-indigo-600 dark:text-indigo-400">admin</strong></div>
            <div>Password: <strong className="text-indigo-600 dark:text-indigo-400">admin123</strong></div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            id="save-settings-btn"
            className="inline-flex items-center px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-sm transition-colors"
          >
            <Save className="w-4 h-4 mr-1.5" />
            <span>Save All Configurations</span>
          </button>
        </div>
      </form>
    </div>
  );
};
