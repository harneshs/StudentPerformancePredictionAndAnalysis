import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Search,
  BookOpen,
  Award,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Printer,
  Share2,
  Copy,
  Check,
  ArrowLeft,
  Calendar,
  Sparkles,
  UserCheck,
  TrendingUp,
  TrendingDown,
  Minus,
  FileCheck,
} from 'lucide-react';
import { Student, SettingsConfig } from '../types';
import { analyzeStudentPerformance } from '../utils/academicCalculations';

interface StudentParentPortalViewProps {
  students: Student[];
  settings: SettingsConfig;
  onBackToStaff: () => void;
  initialRegNo?: string;
}

export const StudentParentPortalView: React.FC<StudentParentPortalViewProps> = ({
  students,
  settings,
  onBackToStaff,
  initialRegNo = '',
}) => {
  const [searchRegNo, setSearchRegNo] = useState(initialRegNo);
  const [activeStudent, setActiveStudent] = useState<Student | null>(null);
  const [searched, setSearched] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // If initialRegNo is provided, auto-select that student
  useEffect(() => {
    if (initialRegNo && students.length > 0) {
      const found = students.find(
        (s) => s.registerNo.toLowerCase() === initialRegNo.toLowerCase().trim()
      );
      if (found) {
        setActiveStudent(found);
        setSearchRegNo(found.registerNo);
        setSearched(true);
      }
    } else if (!activeStudent && students.length > 0) {
      // Default to first student so page is never blank
      setActiveStudent(students[0]);
      setSearchRegNo(students[0].registerNo);
    }
  }, [initialRegNo, students]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchRegNo.trim().toLowerCase();
    if (!query) return;

    setSearched(true);
    const found = students.find(
      (s) =>
        s.registerNo.toLowerCase() === query ||
        s.name.toLowerCase().includes(query)
    );
    setActiveStudent(found || null);
  };

  const handleSelectStudent = (st: Student) => {
    setActiveStudent(st);
    setSearchRegNo(st.registerNo);
    setSearched(true);
  };

  const handleCopyLink = () => {
    if (!activeStudent) return;
    const url = new URL(window.location.href);
    url.searchParams.set('portal', 'student');
    url.searchParams.set('reg', activeStudent.registerNo);
    navigator.clipboard.writeText(url.toString());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const performance = activeStudent
    ? analyzeStudentPerformance(activeStudent, settings.thresholds)
    : null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-6 px-4 sm:px-6 lg:px-8">
      {/* Top Portal Navigation Header */}
      <div className="max-w-5xl mx-auto mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                Student &amp; Parent Academic Portal
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                Live Grades &amp; Attendance
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {settings.institutionName || 'SNS College of Technology'} • Transparent Internal Assessments &amp; Advisory
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            id="back-to-staff-portal-btn"
            onClick={onBackToStaff}
            className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 transition-colors shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
            <span>Staff Login Portal</span>
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto space-y-6">
        {/* Search Bar / Register Number Lookup Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 items-center">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                id="portal-regno-input"
                type="text"
                placeholder="Enter Register Number (e.g. 710022104001 or Student Name)"
                value={searchRegNo}
                onChange={(e) => setSearchRegNo(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              id="portal-search-btn"
              type="submit"
              className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-xs transition-colors whitespace-nowrap"
            >
              Search Records
            </button>
          </form>

          {/* Quick Demo Student Pills */}
          {students.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <span className="text-[11px] text-slate-400 mr-1 font-medium">Quick Cohort Select:</span>
              {students.slice(0, 5).map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleSelectStudent(s)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                    activeStudent?.id === s.id
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {s.name.split(' ')[0]} ({s.registerNo})
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Not Found Alert */}
        {searched && !activeStudent && (
          <div className="p-8 bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60 rounded-xl text-center space-y-3">
            <AlertTriangle className="w-8 h-8 mx-auto text-rose-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              No Student Record Found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              We couldn't locate any student matching &quot;{searchRegNo}&quot;. Please verify the University Register Number with the academic department or select from the quick list above.
            </p>
          </div>
        )}

        {/* Student Academic Record Card */}
        {activeStudent && performance && (
          <div className="space-y-6">
            {/* Student Identity Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 font-bold text-lg">
                    {activeStudent.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h2 className="text-base font-bold text-slate-900 dark:text-white">
                        {activeStudent.name}
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-700">
                        {activeStudent.registerNo}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {activeStudent.department} • {activeStudent.year} (Sem {activeStudent.semester}) • Sec {activeStudent.section}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Academic Year: {activeStudent.academicYear} • Enrolled in {activeStudent.subjects.length} dynamic courses
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    id="copy-parent-link-btn"
                    onClick={handleCopyLink}
                    className="inline-flex items-center px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 transition-colors"
                    title="Copy unique link to this student scorecard"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                        <span className="text-emerald-600 dark:text-emerald-400">Link Copied</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-3.5 h-3.5 mr-1 text-slate-500" />
                        <span>Share Scorecard</span>
                      </>
                    )}
                  </button>

                  <button
                    id="print-parent-report-btn"
                    onClick={handlePrint}
                    className="inline-flex items-center px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5 mr-1.5" />
                    <span>Print Grade Card</span>
                  </button>
                </div>
              </div>

              {/* High-Level Metric Tiles */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5">
                {/* Overall Score */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                    Cumulative IA Score
                  </div>
                  <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                    {performance.overallScore}%
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Internal assessments weighted
                  </div>
                </div>

                {/* Academic Standing Tier */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                    Current Academic Tier
                  </div>
                  <div
                    className={`text-base font-bold uppercase tracking-tight ${
                      performance.performanceLevel === 'Excellent'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : performance.performanceLevel === 'Good'
                        ? 'text-blue-600 dark:text-blue-400'
                        : performance.performanceLevel === 'Average'
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {performance.performanceLevel}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Tier cutoff: &ge;
                    {performance.performanceLevel === 'Excellent'
                      ? settings.thresholds.excellent
                      : performance.performanceLevel === 'Good'
                      ? settings.thresholds.good
                      : performance.performanceLevel === 'Average'
                      ? settings.thresholds.average
                      : settings.thresholds.atRisk}%
                  </div>
                </div>

                {/* Overall Attendance */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                    Overall Attendance
                  </div>
                  <div
                    className={`text-xl font-bold ${
                      performance.overallAttendancePct >= 75
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {performance.overallAttendancePct}%
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {performance.overallAttendancePct >= 75
                      ? '✓ Above 75% statutory rule'
                      : '⚠ Below 75% exam cutoff'}
                  </div>
                </div>

                {/* IA Progress Trend */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                    Internal Test Trajectory
                  </div>
                  <div className="flex items-center space-x-1 text-sm font-bold text-slate-800 dark:text-slate-200">
                    {performance.overallIATrend === 'Improving' && (
                      <>
                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                        <span className="text-emerald-600 dark:text-emerald-400">Upward Trend</span>
                      </>
                    )}
                    {performance.overallIATrend === 'Declining' && (
                      <>
                        <TrendingDown className="w-4 h-4 text-rose-500" />
                        <span className="text-rose-600 dark:text-rose-400">Needs Attention</span>
                      </>
                    )}
                    {performance.overallIATrend === 'Stable' && (
                      <>
                        <Minus className="w-4 h-4 text-slate-400" />
                        <span>Consistent Marks</span>
                      </>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Comparing IA1 &rarr; IA2 &rarr; IA3
                  </div>
                </div>
              </div>
            </div>

            {/* Attendance Statutory Status Notice */}
            {performance.hasAttendanceRisk ? (
              <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 rounded-xl text-xs flex items-start space-x-3 text-rose-800 dark:text-rose-200">
                <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-rose-900 dark:text-rose-100 block mb-0.5">
                    Parent Advisory: Statutory Attendance Shortage
                  </span>
                  University regulations mandate a minimum of 75% attendance to qualify for End-Semester Examinations without condonation penalties. The student has low attendance in:{' '}
                  <strong className="underline">{performance.lowAttendanceSubjects.join(', ')}</strong>. Please consult the mentor immediately.
                </div>
              </div>
            ) : (
              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs flex items-center space-x-3 text-emerald-800 dark:text-emerald-200">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <div>
                  <span className="font-semibold text-emerald-900 dark:text-emerald-100">
                    Attendance Status: Full University Eligibility
                  </span>{' '}
                  The student has maintained statutory attendance across all enrolled subjects (&ge;75%).
                </div>
              </div>
            )}

            {/* Comprehensive Subject Evaluation Table */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                  <BookOpen className="w-4 h-4 text-indigo-500" />
                  <span>Enrolled Courses &amp; Continuous Internal Assessment (CIA)</span>
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {activeStudent.subjects.length} Subjects Evaluated
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="px-4 py-3">Course Details</th>
                      <th className="px-3 py-3 text-center">IA1 (/50)</th>
                      <th className="px-3 py-3 text-center">IA2 (/50)</th>
                      <th className="px-3 py-3 text-center">IA3 (/50)</th>
                      <th className="px-3 py-3 text-center">Internal (/100)</th>
                      <th className="px-3 py-3 text-center">Assignments</th>
                      <th className="px-3 py-3 text-center">Attendance</th>
                      <th className="px-3 py-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {activeStudent.subjects.map((sub, i) => {
                      const attPct = Math.round((sub.periodsAttended / (sub.periodsConducted || 1)) * 100);
                      const isLowAtt = attPct < 75;
                      return (
                        <tr key={sub.id || i} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                          <td className="px-4 py-3">
                            <div className="font-bold text-slate-900 dark:text-white">
                              {sub.subjectName}
                            </div>
                            {sub.subjectCode && (
                              <div className="text-[10px] font-mono text-slate-400">
                                {sub.subjectCode}
                              </div>
                            )}
                          </td>
                          <td className="px-3 py-3 text-center font-medium">
                            {sub.ia1 !== null ? `${sub.ia1}/50` : '-'}
                          </td>
                          <td className="px-3 py-3 text-center font-medium">
                            {sub.ia2 !== null ? `${sub.ia2}/50` : '-'}
                          </td>
                          <td className="px-3 py-3 text-center font-medium">
                            {sub.ia3 !== null ? `${sub.ia3}/50` : '-'}
                          </td>
                          <td className="px-3 py-3 text-center font-bold text-indigo-600 dark:text-indigo-400">
                            {sub.consolidatedInternal !== null ? `${sub.consolidatedInternal}/100` : '-'}
                          </td>
                          <td className="px-3 py-3 text-center text-[11px]">
                            {sub.assignment1 ?? '-'}/{sub.assignment2 ?? '-'}/{sub.assignment3 ?? '-'}
                          </td>
                          <td className="px-3 py-3 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                                isLowAtt
                                  ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                                  : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                              }`}
                            >
                              {attPct}%
                            </span>
                            <span className="block text-[10px] text-slate-400 mt-0.5">
                              {sub.periodsAttended}/{sub.periodsConducted} hrs
                            </span>
                          </td>
                          <td className="px-3 py-3 text-center">
                            {(sub.consolidatedInternal || 0) >= 50 ? (
                              <span className="inline-flex items-center text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold">
                                <Check className="w-3 h-3 mr-0.5" /> Clear
                              </span>
                            ) : (
                              <span className="inline-flex items-center text-rose-600 dark:text-rose-400 text-[11px] font-semibold">
                                Arrear Risk
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Academic Advisory Notes for Parents & Students */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>Mentor &amp; Faculty Academic Advisory:</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <div className="font-semibold text-emerald-700 dark:text-emerald-400 flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Areas of Strength:</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                    Strongest performance observed in{' '}
                    <strong>{performance.strongestSubjects.join(', ') || 'Core Subjects'}</strong>. Keep up the high internal score consistency into university end-semester examinations.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <div className="font-semibold text-amber-700 dark:text-amber-400 flex items-center space-x-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Focus &amp; Remedial Recommendation:</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                    {performance.attentionSubjects.length > 0 ? (
                      <>
                        Special remedial practice recommended for{' '}
                        <strong>{performance.attentionSubjects.join(', ')}</strong>. Attend tutorial hours and submit assignments on time.
                      </>
                    ) : (
                      'Maintain regular study habits across all engineering subjects to maximize CGPA.'
                    )}
                  </p>
                </div>
              </div>

              {/* Department Contact / Faculty Footer */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <div>
                  Faculty Mentor:{' '}
                  <strong className="text-slate-700 dark:text-slate-300">
                    {settings.professorName || 'Prof. S. R. Ramanathan'}
                  </strong>{' '}
                  ({settings.professorRole || 'Senior Academic Coordinator & Staff'})
                </div>
                <div>
                  {settings.departmentName || 'Department of Computer Science & Engineering'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
