import React from 'react';
import {
  Users,
  Award,
  CheckCircle,
  AlertTriangle,
  AlertOctagon,
  Clock,
  BookOpen,
  TrendingUp,
  UserPlus,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { Student, SettingsConfig } from '../types';
import { analyzeStudentPerformance } from '../utils/academicCalculations';

interface DashboardViewProps {
  students: Student[];
  settings: SettingsConfig;
  onNavigate: (tab: any, studentId?: string) => void;
  onLoadDemoData: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  students,
  settings,
  onNavigate,
  onLoadDemoData,
}) => {
  // Analyze all students
  const analyzedStudents = students.map((s) => ({
    student: s,
    analysis: analyzeStudentPerformance(s, settings),
  }));

  const totalStudents = students.length;

  const excellentCount = analyzedStudents.filter(
    (a) => a.analysis.performanceLevel === 'Excellent'
  ).length;

  const goodCount = analyzedStudents.filter(
    (a) => a.analysis.performanceLevel === 'Good'
  ).length;

  const averageCount = analyzedStudents.filter(
    (a) => a.analysis.performanceLevel === 'Average'
  ).length;

  const atRiskCount = analyzedStudents.filter(
    (a) =>
      a.analysis.performanceLevel === 'At Risk' ||
      a.analysis.performanceLevel === 'Critical'
  ).length;

  const below75AttendanceCount = analyzedStudents.filter(
    (a) => a.analysis.hasAttendanceRisk
  ).length;

  // Total unique subjects & total subject enrollments
  const allSubjectNames = new Set<string>();
  let totalEnrollments = 0;
  students.forEach((s) => {
    s.subjects.forEach((sub) => {
      if (sub.subjectName) allSubjectNames.add(sub.subjectName.trim().toLowerCase());
      totalEnrollments++;
    });
  });
  const uniqueSubjectsCount = allSubjectNames.size;
  const avgSubjectsPerStudent =
    totalStudents > 0 ? (totalEnrollments / totalStudents).toFixed(1) : '0';

  // Average Overall Score
  const avgOverallScore =
    totalStudents > 0
      ? (
          analyzedStudents.reduce((sum, a) => sum + a.analysis.overallScore, 0) /
          totalStudents
        ).toFixed(1)
      : '0';

  // Urgent attention students (At Risk, Critical, or Attendance Risk)
  const urgentStudents = analyzedStudents
    .filter(
      (a) =>
        a.analysis.performanceLevel === 'At Risk' ||
        a.analysis.performanceLevel === 'Critical' ||
        a.analysis.hasAttendanceRisk
    )
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Academic Performance Overview
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              Active Term
            </span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time analytics engine with dynamic subject tracking, internal assessment trends, and attendance risk indicators.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          {totalStudents === 0 ? (
            <button
              id="dash-load-demo-btn"
              onClick={onLoadDemoData}
              className="inline-flex items-center px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-sm transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              Load Sample Demo Data
            </button>
          ) : (
            <button
              id="dash-add-student-btn"
              onClick={() => onNavigate('add-student')}
              className="inline-flex items-center px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-sm transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5 mr-1.5" />
              + Add New Student
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Students
            </span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{totalStudents}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Avg Score: <strong className="text-slate-700 dark:text-slate-300">{avgOverallScore}%</strong>
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 dark:text-slate-500">
            Enrolled across various branches
          </div>
        </div>

        {/* Excellent Performance */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Excellent (&ge;{settings.thresholds.excellent}%)
            </span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{excellentCount}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {totalStudents > 0 ? Math.round((excellentCount / totalStudents) * 100) : 0}% of cohort
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 dark:text-slate-500">
            Top academic tier
          </div>
        </div>

        {/* Good & Average */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Good &amp; Average
            </span>
            <div className="w-9 h-9 rounded-lg bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {goodCount + averageCount}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Good: {goodCount} • Avg: {averageCount}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 dark:text-slate-500">
            Consistent coursework tracking
          </div>
        </div>

        {/* At Risk & Critical */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              At Risk Students
            </span>
            <div className="w-9 h-9 rounded-lg bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-rose-600 dark:text-rose-400">{atRiskCount}</span>
            <span className="text-xs font-medium text-rose-500 dark:text-rose-400">
              Needs Intervention
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 dark:text-slate-500">
            Score &lt; {settings.thresholds.atRisk}% or critical deficits
          </div>
        </div>
      </div>

      {/* Secondary Metric Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Attendance Risk Alert */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Below 75% Attendance
            </div>
            <div className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-0.5">
              {below75AttendanceCount} Student(s)
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Institutional exam condonation threshold
            </p>
          </div>
        </div>

        {/* Dynamic Subjects Stat */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Dynamic Subjects Tracked
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
              {uniqueSubjectsCount} Unique Courses
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Avg {avgSubjectsPerStudent} subjects per student
            </p>
          </div>
        </div>

        {/* Prediction Engine Status */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Evaluation Engine
            </div>
            <div className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">
              AI-Assisted Engine
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Formula-grounded with Gemini analysis
            </p>
          </div>
        </div>
      </div>

      {/* Cohort Performance Distribution & Urgent Intervention List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Distribution Visual */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm lg:col-span-1 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center justify-between">
              <span>Cohort Performance Tiers</span>
              <TrendingUp className="w-4 h-4 text-slate-400" />
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Distribution based on consolidated marks, IA trend, and attendance
            </p>

            <div className="mt-6 space-y-3.5">
              {/* Excellent */}
              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-emerald-700 dark:text-emerald-400">
                    Excellent (&ge;{settings.thresholds.excellent}%)
                  </span>
                  <span className="text-slate-600 dark:text-slate-300">
                    {excellentCount} ({totalStudents ? Math.round((excellentCount / totalStudents) * 100) : 0}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all"
                    style={{
                      width: `${totalStudents ? (excellentCount / totalStudents) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              {/* Good */}
              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-blue-700 dark:text-blue-400">
                    Good ({settings.thresholds.good}–{settings.thresholds.excellent - 1}%)
                  </span>
                  <span className="text-slate-600 dark:text-slate-300">
                    {goodCount} ({totalStudents ? Math.round((goodCount / totalStudents) * 100) : 0}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{
                      width: `${totalStudents ? (goodCount / totalStudents) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              {/* Average */}
              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-amber-700 dark:text-amber-400">
                    Average ({settings.thresholds.average}–{settings.thresholds.good - 1}%)
                  </span>
                  <span className="text-slate-600 dark:text-slate-300">
                    {averageCount} ({totalStudents ? Math.round((averageCount / totalStudents) * 100) : 0}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                  <div
                    className="bg-amber-500 h-2 rounded-full transition-all"
                    style={{
                      width: `${totalStudents ? (averageCount / totalStudents) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              {/* At Risk & Critical */}
              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-rose-700 dark:text-rose-400">
                    At Risk / Critical (&lt;{settings.thresholds.average}%)
                  </span>
                  <span className="text-slate-600 dark:text-slate-300">
                    {atRiskCount} ({totalStudents ? Math.round((atRiskCount / totalStudents) * 100) : 0}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                  <div
                    className="bg-rose-500 h-2 rounded-full transition-all"
                    style={{
                      width: `${totalStudents ? (atRiskCount / totalStudents) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => onNavigate('students')}
              className="w-full text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 flex items-center justify-center space-x-1"
            >
              <span>View full student roster</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Priority Academic Interventions */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center space-x-2">
                <AlertOctagon className="w-4 h-4 text-rose-500" />
                <span>Immediate Priority Attention</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Students flagged for low IA scores, declining trends, or attendance shortages
              </p>
            </div>
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
              {urgentStudents.length} Flagged
            </span>
          </div>

          {urgentStudents.length === 0 ? (
            <div className="py-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-dashed border-slate-200 dark:border-slate-700">
              <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                All students currently meet baseline academic &amp; attendance standards.
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                No active attendance condonations or critical academic alerts.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {urgentStudents.map(({ student, analysis }) => (
                <div
                  key={student.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50/70 dark:hover:bg-slate-800/50 px-2 rounded-lg transition-colors"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-sm text-slate-900 dark:text-white">
                        {student.name}
                      </span>
                      <span className="font-mono text-xs text-slate-400">
                        ({student.registerNo})
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-semibold uppercase tracking-wider ${
                          analysis.performanceLevel === 'Critical'
                            ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {analysis.performanceLevel}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span>Dept: {student.department}</span>
                      <span>•</span>
                      <span>Overall: <strong>{analysis.overallScore}%</strong></span>
                      <span>•</span>
                      <span
                        className={
                          analysis.hasAttendanceRisk
                            ? 'text-rose-600 dark:text-rose-400 font-semibold'
                            : 'text-slate-600 dark:text-slate-300'
                        }
                      >
                        Attendance: {analysis.overallAttendancePct}%
                      </span>
                      {analysis.lowAttendanceSubjects.length > 0 && (
                        <span className="text-rose-500 text-[11px]">
                          ({analysis.lowAttendanceSubjects.length} sub &lt; 75%)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => onNavigate('performance', student.id)}
                      className="px-2.5 py-1.5 rounded bg-indigo-50 dark:bg-indigo-950/70 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs font-medium transition-colors"
                    >
                      Analyze Profile
                    </button>
                    <button
                      onClick={() => onNavigate('ai-assistant', student.id)}
                      className="px-2.5 py-1.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors"
                    >
                      Ask AI
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
