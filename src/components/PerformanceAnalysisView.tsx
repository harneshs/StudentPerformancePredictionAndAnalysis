import React, { useState, useEffect } from 'react';
import {
  Award,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  AlertOctagon,
  Clock,
  Sparkles,
  CheckCircle2,
  FileText,
  HelpCircle,
  BookOpen,
  Info,
  Loader2,
  ArrowRight,
  Bot,
  Search,
  UserCheck,
} from 'lucide-react';
import { Student, SettingsConfig } from '../types';
import { analyzeStudentPerformance } from '../utils/academicCalculations';
import { aiService, AIAnalysisResult } from '../services/aiService';

interface PerformanceAnalysisViewProps {
  students: Student[];
  selectedStudentId?: string;
  settings: SettingsConfig;
  onNavigate: (tab: any, studentId?: string) => void;
}

export const PerformanceAnalysisView: React.FC<PerformanceAnalysisViewProps> = ({
  students,
  selectedStudentId,
  settings,
  onNavigate,
}) => {
  const [activeStudentId, setActiveStudentId] = useState<string>(
    selectedStudentId || ''
  );
  const [searchQuery, setSearchQuery] = useState('');

  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
  const [activeAiTab, setActiveAiTab] = useState<
    'insights' | 'suggestions' | 'risk' | 'report' | null
  >(null);
  const [showFormulaModal, setShowFormulaModal] = useState(false);

  useEffect(() => {
    setActiveStudentId(selectedStudentId || '');
    setAiResult(null);
    setActiveAiTab(null);
  }, [selectedStudentId]);

  const activeStudent = students.find((s) => s.id === activeStudentId);

  // If no students in system at all
  if (students.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center shadow-sm max-w-2xl mx-auto">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">
          No students registered yet.
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Please add a student record or load sample data to view academic performance analysis.
        </p>
        <button
          onClick={() => onNavigate('add-student')}
          className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white rounded-lg shadow-sm"
        >
          + Add Student
        </button>
      </div>
    );
  }

  // WAITING STATE: If no student has been chosen yet, show search & dropdown selection
  if (!activeStudent) {
    const query = searchQuery.toLowerCase().trim();
    const matchingStudents = students.filter((s) => {
      if (!query) return true;
      return (
        s.name.toLowerCase().includes(query) ||
        s.registerNo.toLowerCase().includes(query) ||
        s.department.toLowerCase().includes(query)
      );
    });

    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Award className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Academic Performance &amp; CIA Analysis
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
              Please choose a student from the dropdown or search by name / register number below to view their detailed performance analytics.
            </p>
          </div>

          <div className="max-w-xl mx-auto space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name, register number or branch..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <select
                id="waiting-analysis-dropdown"
                value={activeStudentId}
                onChange={(e) => {
                  setActiveStudentId(e.target.value);
                  setAiResult(null);
                  setActiveAiTab(null);
                }}
                className="py-2 px-3 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">-- Choose Student from Dropdown --</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.registerNo}) — {s.department}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Student Cards List for Quick One-Click Selection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Registered Students ({matchingStudents.length} of {students.length})
            </span>
            <span className="text-[11px] text-slate-400">
              Click any student to view complete metrics
            </span>
          </div>

          {matchingStudents.length === 0 ? (
            <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-center text-xs text-slate-500">
              No students match &quot;{searchQuery}&quot;. Please verify the register number or name.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {matchingStudents.map((s) => {
                const perf = analyzeStudentPerformance(s, settings);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setActiveStudentId(s.id);
                      setAiResult(null);
                      setActiveAiTab(null);
                    }}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-500 hover:shadow-md transition-all text-left flex flex-col justify-between group cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                          {s.name}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {s.registerNo}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                        {s.department}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {s.year} • Sem {s.semester} • {s.subjects?.length || 0} subjects
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        Score: {perf.overallScore}/100
                      </span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold group-hover:underline flex items-center">
                        Select &rarr;
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  const performance = analyzeStudentPerformance(activeStudent, settings);

  const handleRequestAI = async (
    type: 'insights' | 'suggestions' | 'risk' | 'report'
  ) => {
    setActiveAiTab(type);
    setAiLoading(true);
    setAiResult(null);

    try {
      let result: AIAnalysisResult;
      if (type === 'insights') {
        result = await aiService.getPerformanceInsights(activeStudent, performance);
      } else if (type === 'suggestions') {
        result = await aiService.getPersonalizedSuggestions(activeStudent, performance);
      } else if (type === 'risk') {
        result = await aiService.getRiskExplanation(activeStudent, performance);
      } else {
        result = await aiService.getStudentReport(activeStudent, performance);
      }
      setAiResult(result);
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Excellent':
        return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-800';
      case 'Good':
        return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 border-blue-300 dark:border-blue-800';
      case 'Average':
        return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/80 border-amber-300 dark:border-amber-800';
      case 'At Risk':
        return 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/80 border-rose-300 dark:border-rose-800 font-semibold';
      case 'Critical':
        return 'text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-950 border-red-400 dark:border-red-900 font-bold';
      default:
        return 'text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Student Selector & Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">
            Active Student:
          </label>
          <select
            id="analysis-student-selector"
            value={activeStudent.id}
            onChange={(e) => {
              setActiveStudentId(e.target.value);
              setAiResult(null);
              setActiveAiTab(null);
            }}
            className="py-1.5 px-3 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">-- Switch Student --</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.registerNo}) — {s.department}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => {
              setActiveStudentId('');
              setAiResult(null);
              setActiveAiTab(null);
            }}
            className="text-[11px] text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 underline whitespace-nowrap"
          >
            Change Student
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowFormulaModal(true)}
            className="inline-flex items-center px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <Info className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
            Calculation Formula
          </button>
          <button
            onClick={() => onNavigate('ai-assistant', activeStudent.id)}
            className="inline-flex items-center px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-medium hover:bg-indigo-100 transition-colors"
          >
            <Bot className="w-3.5 h-3.5 mr-1.5" />
            Chat With AI About Student
          </button>
        </div>
      </div>

      {/* Core Student Performance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Profile Card */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm md:col-span-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Student Profile
          </span>
          <h3 className="text-base font-bold text-slate-900 dark:text-white truncate" title={activeStudent.name}>
            {activeStudent.name}
          </h3>
          <div className="font-mono text-xs text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5">
            {activeStudent.registerNo}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1 text-xs text-slate-600 dark:text-slate-300">
            <div>
              <span className="text-slate-400">Department:</span> {activeStudent.department}
            </div>
            <div>
              <span className="text-slate-400">Class:</span> {activeStudent.year} • Sem {activeStudent.semester} ({activeStudent.section})
            </div>
            <div>
              <span className="text-slate-400">Academic Year:</span> {activeStudent.academicYear}
            </div>
            <div>
              <span className="text-slate-400">Dynamic Subjects:</span>{' '}
              <strong className="text-purple-600 dark:text-purple-400">
                {activeStudent.subjects.length} Enrolled
              </strong>
            </div>
          </div>
        </div>

        {/* Overall Score & Tier Card */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Overall Performance Index
              </span>
              <Award className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {performance.overallScore}
              </span>
              <span className="text-xs text-slate-400">/ 100</span>
            </div>
          </div>
          <div className="mt-4">
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getLevelColor(
                performance.performanceLevel
              )}`}
            >
              Tier: {performance.performanceLevel}
            </span>
          </div>
        </div>

        {/* Overall Attendance Card */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Overall Attendance
              </span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="mt-2 flex items-baseline space-x-2">
              <span
                className={`text-3xl font-extrabold ${
                  performance.hasAttendanceRisk
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-slate-900 dark:text-white'
                }`}
              >
                {performance.overallAttendancePct}%
              </span>
              <span className="text-xs text-slate-400">
                ({performance.totalAttendedPeriods}/{performance.totalConductedPeriods} periods)
              </span>
            </div>
          </div>
          <div className="mt-4">
            {performance.hasAttendanceRisk ? (
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-900">
                <AlertTriangle className="w-3.5 h-3.5 mr-1 text-rose-500" />
                Attendance Risk (&lt;75%)
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-900">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                Compliant (&ge;75%)
              </span>
            )}
          </div>
        </div>

        {/* IA Trend & Momentum */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                IA Momentum Trend
              </span>
              {performance.overallIATrend === 'Improving' ? (
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              ) : performance.overallIATrend === 'Declining' ? (
                <TrendingDown className="w-4 h-4 text-rose-500" />
              ) : (
                <Minus className="w-4 h-4 text-slate-400" />
              )}
            </div>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                {performance.overallIATrend}
              </span>
            </div>
          </div>
          <div className="mt-4 text-xs text-slate-500 dark:text-slate-400">
            Based on progression slope across IA1 &rarr; IA2 &rarr; IA3
          </div>
        </div>
      </div>

      {/* Identified Risk Factors / Strengths Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Identified Risk Factors */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
          <h4 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-1.5">
            <AlertOctagon className="w-4 h-4 text-rose-500" />
            <span>Academic Risk Diagnostic Indicators</span>
          </h4>
          <ul className="space-y-2 text-xs">
            {performance.riskFactors.map((factor, idx) => (
              <li
                key={idx}
                className="flex items-start space-x-2 text-slate-700 dark:text-slate-300"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                <span>{factor}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Strengths & Focus Areas Matrix */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
          <h4 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Strengths &amp; Subject Focus Matrix</span>
          </h4>
          <div className="space-y-2 text-xs">
            <div className="flex items-start justify-between">
              <span className="text-slate-500">Strongest Subjects:</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 text-right">
                {performance.strongestSubjects.length > 0
                  ? performance.strongestSubjects.join(', ')
                  : 'None identified'}
              </span>
            </div>
            <div className="flex items-start justify-between">
              <span className="text-slate-500">Weakest Subjects:</span>
              <span className="font-semibold text-rose-600 dark:text-rose-400 text-right">
                {performance.weakestSubjects.length > 0
                  ? performance.weakestSubjects.join(', ')
                  : 'None below 60%'}
              </span>
            </div>
            <div className="flex items-start justify-between">
              <span className="text-slate-500">Attendance &lt; 75%:</span>
              <span className="font-semibold text-amber-600 dark:text-amber-400 text-right">
                {performance.lowAttendanceSubjects.length > 0
                  ? performance.lowAttendanceSubjects.join(', ')
                  : 'None (All &ge; 75%)'}
              </span>
            </div>
            <div className="flex items-start justify-between">
              <span className="text-slate-500">Declining IA Trend:</span>
              <span className="font-semibold text-rose-600 dark:text-rose-400 text-right">
                {performance.decliningSubjects.length > 0
                  ? performance.decliningSubjects.join(', ')
                  : 'None'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Subjects Performance Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden space-y-3 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-indigo-500" />
              <span>Dynamic Course Assessment Breakdown ({activeStudent.subjects.length} Courses)</span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Computed per subject: Internal marks (55%), Assignments (20%), Attendance (20%), and Trend Adjustment (5%).
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-semibold border-y border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Subject Name &amp; Code</th>
                <th className="py-2.5 px-2 text-center">IA 1 (/50 &rarr; /100)</th>
                <th className="py-2.5 px-2 text-center">IA 2 (/50 &rarr; /100)</th>
                <th className="py-2.5 px-2 text-center">IA 3 (/50 &rarr; /100)</th>
                <th className="py-2.5 px-2 text-center">Trend</th>
                <th className="py-2.5 px-2 text-center">Consolidated (/100)</th>
                <th className="py-2.5 px-2 text-center">Assign Total (/15)</th>
                <th className="py-2.5 px-3 text-center">Attendance</th>
                <th className="py-2.5 px-3 text-right">Course Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {performance.subjectAnalyses.map((sub, i) => (
                <tr
                  key={sub.subjectId}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {sub.subjectName}
                    </div>
                    <div className="font-mono text-[11px] text-slate-400">
                      {sub.subjectCode || `SUB-${i + 1}`}
                    </div>
                  </td>

                  {/* IA1 */}
                  <td className="py-3 px-2 text-center">
                    <div>
                      {sub.ia1Absent ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          Absent (0)
                        </span>
                      ) : sub.rawIA1 !== null ? (
                        `${sub.rawIA1}/50`
                      ) : (
                        '—'
                      )}
                    </div>
                    <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
                      {!sub.ia1Absent && sub.convertedIA1 !== null ? `(${sub.convertedIA1}%)` : ''}
                    </div>
                  </td>

                  {/* IA2 */}
                  <td className="py-3 px-2 text-center">
                    <div>
                      {sub.ia2Absent ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          Absent (0)
                        </span>
                      ) : sub.rawIA2 !== null ? (
                        `${sub.rawIA2}/50`
                      ) : (
                        '—'
                      )}
                    </div>
                    <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
                      {!sub.ia2Absent && sub.convertedIA2 !== null ? `(${sub.convertedIA2}%)` : ''}
                    </div>
                  </td>

                  {/* IA3 */}
                  <td className="py-3 px-2 text-center">
                    <div>
                      {sub.ia3Absent ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          Absent (0)
                        </span>
                      ) : sub.rawIA3 !== null ? (
                        `${sub.rawIA3}/50`
                      ) : (
                        '—'
                      )}
                    </div>
                    <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
                      {!sub.ia3Absent && sub.convertedIA3 !== null ? `(${sub.convertedIA3}%)` : ''}
                    </div>
                  </td>

                  {/* IA Trend */}
                  <td className="py-3 px-2 text-center">
                    {sub.iaTrend === 'Improving' && (
                      <span className="inline-flex items-center text-emerald-600 text-[11px] font-medium">
                        <TrendingUp className="w-3 h-3 mr-0.5" /> Improving
                      </span>
                    )}
                    {sub.iaTrend === 'Declining' && (
                      <span className="inline-flex items-center text-rose-600 text-[11px] font-medium">
                        <TrendingDown className="w-3 h-3 mr-0.5" /> Declining
                      </span>
                    )}
                    {sub.iaTrend === 'Stable' && (
                      <span className="text-slate-400 text-[11px]">Stable</span>
                    )}
                    {sub.iaTrend === 'Insufficient Data' && (
                      <span className="text-slate-400 text-[11px]">N/A</span>
                    )}
                  </td>

                  {/* Consolidated Internal */}
                  <td className="py-3 px-2 text-center font-semibold text-slate-800 dark:text-slate-200">
                    {sub.consolidatedInternal !== null
                      ? `${sub.consolidatedInternal}/100`
                      : '—'}
                  </td>

                  {/* Assignment Total */}
                  <td className="py-3 px-2 text-center">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {sub.assignmentTotal}
                    </span>
                    <span className="text-slate-400 text-[11px]">/15</span>
                  </td>

                  {/* Attendance */}
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                        sub.isAttendanceRisk
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {sub.attendancePct}%
                    </span>
                    <div className="text-[10px] text-slate-400">
                      {sub.periodsAttended}/{sub.periodsConducted} periods
                    </div>
                  </td>

                  {/* Computed Score */}
                  <td className="py-3 px-3 text-right">
                    <span className="font-bold text-sm text-indigo-600 dark:text-indigo-400">
                      {sub.subjectScore}
                    </span>
                    <span className="text-slate-400 text-[10px]">/100</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI-POWERED INSIGHTS & ACTIONS SECTION */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>AI-Powered Academic Advisory &amp; Actionable Insights</span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Generate AI-grounded academic diagnostic insights, personalized interventions, and formal reports.
            </p>
          </div>

          <span className="text-[11px] text-slate-400">
            Powered by Gemini AI with Offline Fallback Engine
          </span>
        </div>

        {/* 4 Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            id="ai-btn-insights"
            disabled={aiLoading}
            onClick={() => handleRequestAI('insights')}
            className={`p-3 rounded-xl border text-left transition-all ${
              activeAiTab === 'insights'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white hover:bg-slate-100'
            }`}
          >
            <div className="font-semibold text-xs flex items-center justify-between">
              <span>Performance Insights</span>
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <p
              className={`text-[11px] mt-1 ${
                activeAiTab === 'insights' ? 'text-indigo-100' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              Concise qualitative summary of current coursework.
            </p>
          </button>

          <button
            id="ai-btn-suggestions"
            disabled={aiLoading}
            onClick={() => handleRequestAI('suggestions')}
            className={`p-3 rounded-xl border text-left transition-all ${
              activeAiTab === 'suggestions'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white hover:bg-slate-100'
            }`}
          >
            <div className="font-semibold text-xs flex items-center justify-between">
              <span>Personalized Suggestions</span>
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <p
              className={`text-[11px] mt-1 ${
                activeAiTab === 'suggestions' ? 'text-indigo-100' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              Action plan targeting weak subjects and IA trends.
            </p>
          </button>

          <button
            id="ai-btn-risk"
            disabled={aiLoading}
            onClick={() => handleRequestAI('risk')}
            className={`p-3 rounded-xl border text-left transition-all ${
              activeAiTab === 'risk'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white hover:bg-slate-100'
            }`}
          >
            <div className="font-semibold text-xs flex items-center justify-between">
              <span>Risk Classification</span>
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
            <p
              className={`text-[11px] mt-1 ${
                activeAiTab === 'risk' ? 'text-indigo-100' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              Detailed breakdown of why this student is in their tier.
            </p>
          </button>

          <button
            id="ai-btn-report"
            disabled={aiLoading}
            onClick={() => handleRequestAI('report')}
            className={`p-3 rounded-xl border text-left transition-all ${
              activeAiTab === 'report'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white hover:bg-slate-100'
            }`}
          >
            <div className="font-semibold text-xs flex items-center justify-between">
              <span>Student Academic Report</span>
              <FileText className="w-3.5 h-3.5" />
            </div>
            <p
              className={`text-[11px] mt-1 ${
                activeAiTab === 'report' ? 'text-indigo-100' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              Generate printable formal evaluation summary.
            </p>
          </button>
        </div>

        {/* AI Loading State */}
        {aiLoading && (
          <div className="py-10 text-center bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600 mx-auto" />
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Generating academic insights for {activeStudent.name}...
            </p>
            <p className="text-[11px] text-slate-400">
              Evaluating dynamic courses, continuous assessment marks, and attendance records
            </p>
          </div>
        )}

        {/* AI Result Container */}
        {aiResult && !aiLoading && (
          <div className="p-5 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                  Analysis Results
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                    aiResult.source === 'gemini'
                      ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-300'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300'
                  }`}
                >
                  {aiResult.source === 'gemini'
                    ? '✨ Gemini 3.8 Flash (Server-Side)'
                    : '⚡ Smart Academic Expert Engine (Local)'}
                </span>
              </div>
              <button
                onClick={() => onNavigate('reports', activeStudent.id)}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center"
              >
                <span>Open Printable Report View</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </button>
            </div>

            {/* Formatted Markdown/Text Render */}
            <div className="text-xs leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-line space-y-2 font-sans">
              {aiResult.content}
            </div>

            {/* Mandatory Academic Disclaimer */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700/80 text-[11px] text-slate-500 dark:text-slate-400 flex items-start space-x-2">
              <Info className="w-4 h-4 shrink-0 text-slate-400 mt-0.5" />
              <span>{aiResult.disclaimer}</span>
            </div>
          </div>
        )}
      </div>

      {/* Transparent Calculation Formula Explanation Modal */}
      {showFormulaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-xl w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Info className="w-4 h-4 text-indigo-600" />
                <span>Transparent Academic Calculation Formula</span>
              </h3>
              <button
                onClick={() => setShowFormulaModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <p>
                The academic prediction engine computes individual course scores and overall performance levels using an objective weighted continuous evaluation model:
              </p>

              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 space-y-1.5 font-mono text-[11px]">
                <div>1. Converted IA = (Raw Mark / 50) &times; 100 (Absent = 0)</div>
                <div>2. Consolidated Mark = Average of evaluated IAs (e.g. 2 IAs = avg of 2; 2 IAs + Absent = avg of 3 with 0 for absent; none = 0)</div>
                <div>3. IA Part (55%) = (Consolidated Internal / 100) &times; 55</div>
                <div>4. Assignment Part (20%) = (Assignment Total / 15) &times; 20 (empty = 0)</div>
                <div>5. Attendance Part (20%) = (Periods Attended / Conducted) &times; 20</div>
                <div>6. IA Trend Adjustment (5%):</div>
                <div className="pl-4 text-emerald-600 dark:text-emerald-400">+4 marks if Improving</div>
                <div className="pl-4 text-rose-600 dark:text-rose-400">-4 marks if Declining</div>
                <div className="pl-4 text-slate-500">0 marks for Stable or Insufficient data</div>
                <div>Course Index = IA Part + Assignment Part + Attendance Part + Trend Adj (0-100)</div>
              </div>

              <h4 className="font-semibold text-slate-900 dark:text-white pt-1">
                Classification Tiers:
              </h4>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Excellent:</strong> Score &ge; {settings.thresholds.excellent}%</li>
                <li><strong>Good:</strong> {settings.thresholds.good}% &ndash; {settings.thresholds.excellent - 1}%</li>
                <li><strong>Average:</strong> {settings.thresholds.average}% &ndash; {settings.thresholds.good - 1}%</li>
                <li><strong>At Risk:</strong> {settings.thresholds.atRisk}% &ndash; {settings.thresholds.average - 1}%</li>
                <li><strong>Critical:</strong> Score &lt; {settings.thresholds.atRisk}%</li>
              </ul>

              <h4 className="font-semibold text-slate-900 dark:text-white pt-1">
                Regulatory Attendance Requirement:
              </h4>
              <p>
                Overall and subject-wise attendance must satisfy <strong>&ge; 75%</strong>. Shortages trigger mandatory academic risk flags for institutional condonation review.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setShowFormulaModal(false)}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
