import React, { useState } from 'react';
import {
  Printer,
  Sparkles,
  Award,
  Clock,
  BookOpen,
  FileCheck,
  Download,
  AlertTriangle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { Student, SettingsConfig } from '../types';
import { analyzeStudentPerformance } from '../utils/academicCalculations';
import { aiService, AIAnalysisResult } from '../services/aiService';

interface ReportsViewProps {
  students: Student[];
  selectedStudentId?: string;
  settings: SettingsConfig;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  students,
  selectedStudentId,
  settings,
}) => {
  const [activeStudentId, setActiveStudentId] = useState<string>(
    selectedStudentId || (students.length > 0 ? students[0].id : '')
  );

  const [aiReport, setAiReport] = useState<AIAnalysisResult | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const activeStudent = students.find((s) => s.id === activeStudentId) || students[0];

  if (!activeStudent) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center shadow-sm">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">
          No students registered.
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Please add a student record before generating academic reports.
        </p>
      </div>
    );
  }

  const performance = analyzeStudentPerformance(activeStudent, settings);

  const handleGenerateAiReport = async () => {
    setLoadingAi(true);
    try {
      const res = await aiService.getStudentReport(activeStudent, performance);
      setAiReport(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAi(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Toolbar (Hidden during print) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center space-x-3">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
            Select Student:
          </label>
          <select
            id="report-student-selector"
            value={activeStudent.id}
            onChange={(e) => {
              setActiveStudentId(e.target.value);
              setAiReport(null);
            }}
            className="py-1.5 px-3 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.registerNo}) — {s.department}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <button
            id="generate-ai-report-btn"
            onClick={handleGenerateAiReport}
            disabled={loadingAi}
            className="inline-flex items-center px-3.5 py-1.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-lg text-xs font-medium hover:bg-indigo-100 transition-colors disabled:opacity-50"
          >
            {loadingAi ? (
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
            )}
            <span>Generate AI Executive Analysis</span>
          </button>

          <button
            id="print-report-btn"
            onClick={handlePrint}
            className="inline-flex items-center px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
          >
            <Printer className="w-3.5 h-3.5 mr-1.5" />
            <span>Print Report / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Formal Academic Evaluation Document */}
      <div className="bg-white text-slate-900 rounded-xl border border-slate-300 shadow-md p-8 max-w-4xl mx-auto print:border-none print:shadow-none print:p-0 print:m-0 space-y-6">
        {/* College Institutional Letterhead */}
        <div className="text-center pb-4 border-b-2 border-slate-900">
          <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-0.5">
            {settings.institutionName || 'SNS College of Technology'}
          </div>
          <h1 className="text-xl font-black uppercase tracking-wider text-slate-900">
            Smart Academic Evaluation &amp; Performance Review
          </h1>
          <p className="text-xs font-medium text-slate-600 uppercase tracking-widest mt-1">
            {settings.departmentName || `Department of ${activeStudent.department}`}
          </p>
          <div className="flex justify-center items-center space-x-4 text-[11px] text-slate-500 mt-1">
            <span>Academic Year: {activeStudent.academicYear}</span>
            <span>•</span>
            <span>Date Generated: {new Date().toLocaleDateString()}</span>
          </div>
        </div>

        {/* Student Metadata Table */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs">
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">
              Student Name
            </span>
            <span className="font-bold text-slate-900 text-sm">{activeStudent.name}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">
              Register Number
            </span>
            <span className="font-mono font-bold text-slate-900 text-sm">
              {activeStudent.registerNo}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">
              Program &amp; Class
            </span>
            <span className="font-medium text-slate-800">
              {activeStudent.year} • Sem {activeStudent.semester} ({activeStudent.section})
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">
              Dynamic Courses
            </span>
            <span className="font-medium text-slate-800">
              {activeStudent.subjects.length} Enrolled Courses
            </span>
          </div>
        </div>

        {/* Aggregate Evaluation Status Summary */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">
              Cumulative Academic Score
            </span>
            <span className="text-2xl font-black text-slate-900">
              {performance.overallScore}
            </span>
            <span className="text-xs text-slate-400"> / 100</span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">
              Classification Tier
            </span>
            <span className="text-lg font-bold text-indigo-700 block mt-1">
              {performance.performanceLevel}
            </span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">
              Statutory Attendance
            </span>
            <span
              className={`text-2xl font-black ${
                performance.hasAttendanceRisk ? 'text-rose-600' : 'text-slate-900'
              }`}
            >
              {performance.overallAttendancePct}%
            </span>
            <span className="text-[11px] block text-slate-500">
              {performance.hasAttendanceRisk ? '⚠️ Under 75% Threshold' : 'Eligible'}
            </span>
          </div>
        </div>

        {/* Subject-Wise Assessment Matrix */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Course Continuous Assessment Matrix
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-300">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                <tr>
                  <th className="py-2 px-3">Subject Name</th>
                  <th className="py-2 px-2 text-center">Code</th>
                  <th className="py-2 px-2 text-center">IA1 (/50)</th>
                  <th className="py-2 px-2 text-center">IA2 (/50)</th>
                  <th className="py-2 px-2 text-center">IA3 (/50)</th>
                  <th className="py-2 px-2 text-center">Trend</th>
                  <th className="py-2 px-2 text-center">Consol (/100)</th>
                  <th className="py-2 px-2 text-center">Assign (/15)</th>
                  <th className="py-2 px-2 text-center">Attnd %</th>
                  <th className="py-2 px-3 text-right">Course Index</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {performance.subjectAnalyses.map((sub, i) => (
                  <tr key={sub.subjectId}>
                    <td className="py-2 px-3 font-medium text-slate-900">
                      {sub.subjectName}
                    </td>
                    <td className="py-2 px-2 text-center font-mono text-[11px] text-slate-600">
                      {sub.subjectCode || '—'}
                    </td>
                    <td className="py-2 px-2 text-center text-slate-800">
                      {sub.rawIA1 !== null ? sub.rawIA1 : '—'}
                    </td>
                    <td className="py-2 px-2 text-center text-slate-800">
                      {sub.rawIA2 !== null ? sub.rawIA2 : '—'}
                    </td>
                    <td className="py-2 px-2 text-center text-slate-800">
                      {sub.rawIA3 !== null ? sub.rawIA3 : '—'}
                    </td>
                    <td className="py-2 px-2 text-center text-[11px] font-medium">
                      {sub.iaTrend}
                    </td>
                    <td className="py-2 px-2 text-center font-semibold text-slate-900">
                      {sub.consolidatedInternal !== null ? sub.consolidatedInternal : '—'}
                    </td>
                    <td className="py-2 px-2 text-center text-slate-800">
                      {sub.assignmentTotal}
                    </td>
                    <td
                      className={`py-2 px-2 text-center font-semibold ${
                        sub.isAttendanceRisk ? 'text-rose-600 font-bold' : 'text-slate-800'
                      }`}
                    >
                      {sub.attendancePct}%
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-slate-900">
                      {sub.subjectScore}/100
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI-Generated Executive Academic Summary (if requested) */}
        {aiReport && (
          <div className="p-4 bg-slate-50 border border-slate-300 rounded-lg space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-900 uppercase tracking-wider pb-1 border-b border-slate-200">
              <span className="flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>AI Academic Evaluation &amp; Pedagogical Guidance</span>
              </span>
              <span className="text-[10px] text-slate-500 font-normal">
                Source: {aiReport.source === 'gemini' ? 'Gemini AI' : 'Rule Engine'}
              </span>
            </div>
            <div className="text-xs leading-relaxed text-slate-800 whitespace-pre-line font-sans">
              {aiReport.content}
            </div>
            <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-200">
              {aiReport.disclaimer}
            </div>
          </div>
        )}

        {/* Faculty Mentorship & Action Observations */}
        <div className="border border-slate-200 p-4 rounded-lg space-y-2 text-xs">
          <h4 className="font-bold text-slate-900 uppercase tracking-wider">
            Faculty Observations &amp; Interventions Required:
          </h4>
          <div className="space-y-1 text-slate-700">
            {performance.riskFactors.map((r, idx) => (
              <div key={idx} className="flex items-start space-x-1.5">
                <span>•</span>
                <span>{r}</span>
              </div>
            ))}
            {performance.decliningSubjects.length > 0 && (
              <div className="text-rose-600 font-medium">
                • Requires immediate IA re-evaluation in: {performance.decliningSubjects.join(', ')}.
              </div>
            )}
            {performance.lowAttendanceSubjects.length > 0 && (
              <div className="text-rose-600 font-medium">
                • Notice issued for attendance condonation in: {performance.lowAttendanceSubjects.join(', ')}.
              </div>
            )}
          </div>
        </div>

        {/* Signatures Footer */}
        <div className="pt-10 grid grid-cols-3 gap-6 text-center text-xs">
          <div>
            <div className="border-t border-slate-400 pt-2 font-semibold text-slate-800">
              {settings.professorName || 'Prof. S. R. Ramanathan'}
            </div>
            <span className="text-[10px] text-slate-500">
              {settings.professorRole || 'Course Faculty / Mentor'}
            </span>
          </div>

          <div>
            <div className="border-t border-slate-400 pt-2 font-semibold text-slate-800">
              Academic Coordinator
            </div>
            <span className="text-[10px] text-slate-500">Department Verification</span>
          </div>

          <div>
            <div className="border-t border-slate-400 pt-2 font-semibold text-slate-800">
              Head of Department
            </div>
            <span className="text-[10px] text-slate-500">Approved &amp; Archived</span>
          </div>
        </div>
      </div>
    </div>
  );
};
