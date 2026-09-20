import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Filter,
  ArrowUpDown,
  Edit2,
  Trash2,
  Eye,
  Bot,
  AlertTriangle,
  FileSpreadsheet,
  CheckCircle2,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import { Student, SettingsConfig } from '../types';
import { analyzeStudentPerformance } from '../utils/academicCalculations';

interface StudentsListViewProps {
  students: Student[];
  settings: SettingsConfig;
  onNavigate: (tab: any, studentId?: string) => void;
  onEditStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
  onLoadDemoData: () => void;
}

export const StudentsListView: React.FC<StudentsListViewProps> = ({
  students,
  settings,
  onNavigate,
  onEditStudent,
  onDeleteStudent,
  onLoadDemoData,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [levelFilter, setLevelFilter] = useState('ALL');
  const [attendanceRiskOnly, setAttendanceRiskOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'registerNo' | 'score' | 'attendance'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  // Pre-calculate performance analysis for each student
  const studentData = useMemo(() => {
    return students.map((student) => ({
      student,
      analysis: analyzeStudentPerformance(student, settings),
    }));
  }, [students, settings]);

  // Extract unique departments for filter dropdown
  const departments = useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => {
      if (s.department) set.add(s.department.trim());
    });
    return Array.from(set).sort();
  }, [students]);

  // Filter & Sort
  const filteredStudents = useMemo(() => {
    return studentData.filter(({ student, analysis }) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        student.name.toLowerCase().includes(q) ||
        student.registerNo.toLowerCase().includes(q) ||
        student.department.toLowerCase().includes(q);

      const matchesDept =
        departmentFilter === 'ALL' || student.department === departmentFilter;

      const matchesLevel =
        levelFilter === 'ALL' || analysis.performanceLevel === levelFilter;

      const matchesAttendance =
        !attendanceRiskOnly || analysis.hasAttendanceRisk;

      return matchesSearch && matchesDept && matchesLevel && matchesAttendance;
    }).sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') {
        comparison = a.student.name.localeCompare(b.student.name);
      } else if (sortBy === 'registerNo') {
        comparison = a.student.registerNo.localeCompare(b.student.registerNo);
      } else if (sortBy === 'score') {
        comparison = a.analysis.overallScore - b.analysis.overallScore;
      } else if (sortBy === 'attendance') {
        comparison = a.analysis.overallAttendancePct - b.analysis.overallAttendancePct;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [
    studentData,
    searchTerm,
    departmentFilter,
    levelFilter,
    attendanceRiskOnly,
    sortBy,
    sortOrder,
  ]);

  const confirmDelete = () => {
    if (studentToDelete) {
      onDeleteStudent(studentToDelete.id);
      setStudentToDelete(null);
    }
  };

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'Excellent':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'Good':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'Average':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'At Risk':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border-rose-200 dark:border-rose-800 font-semibold';
      case 'Critical':
        return 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200 border-red-300 dark:border-red-900 font-bold';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300';
    }
  };

  return (
    <div className="space-y-5">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Student Academic Records
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage student registrations, dynamic subjects, marks, and attendance.
          </p>
        </div>
        <div className="flex items-center space-x-2.5">
          {students.length === 0 && (
            <button
              onClick={onLoadDemoData}
              className="inline-flex items-center px-3 py-2 border border-slate-300 dark:border-slate-700 text-xs font-medium rounded-lg text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              Load Demo Data
            </button>
          )}
          <button
            id="add-student-btn"
            onClick={() => onNavigate('add-student')}
            className="inline-flex items-center px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Student
          </button>
        </div>
      </div>

      {/* Search & Filters Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              id="student-search-input"
              type="text"
              placeholder="Search by student name, register number, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Department Filter */}
          <div>
            <select
              id="filter-department-select"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full py-1.5 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Performance Level Filter */}
          <div>
            <select
              id="filter-level-select"
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="w-full py-1.5 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Performance Tiers</option>
              <option value="Excellent">Excellent</option>
              <option value="Good">Good</option>
              <option value="Average">Average</option>
              <option value="At Risk">At Risk</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
        </div>

        {/* Sorting & Quick Toggles */}
        <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-1.5 cursor-pointer text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
              <input
                id="attendance-risk-checkbox"
                type="checkbox"
                checked={attendanceRiskOnly}
                onChange={(e) => setAttendanceRiskOnly(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="font-medium text-rose-600 dark:text-rose-400">
                Show only Attendance Risk (&lt;75%)
              </span>
            </label>
          </div>

          <div className="flex items-center space-x-2 text-slate-500">
            <span className="text-[11px] uppercase tracking-wider font-semibold">Sort By:</span>
            <select
              id="sort-by-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="py-1 px-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-700 dark:text-slate-300"
            >
              <option value="name">Name</option>
              <option value="registerNo">Register No</option>
              <option value="score">Overall Score</option>
              <option value="attendance">Attendance %</option>
            </select>
            <button
              id="sort-order-btn"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
              title={`Toggle sort order: currently ${sortOrder}`}
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filteredStudents.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center shadow-sm">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Filter className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            {students.length === 0 ? 'No student records available.' : 'No matching students found.'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            {students.length === 0
              ? 'Get started by creating your first student record or load sample college demo data.'
              : 'Try adjusting your search criteria or clearing filters.'}
          </p>
          <div className="mt-5 flex items-center justify-center space-x-3">
            {students.length === 0 ? (
              <>
                <button
                  id="empty-add-first-btn"
                  onClick={() => onNavigate('add-student')}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white rounded-lg shadow-sm"
                >
                  + Add First Student
                </button>
                <button
                  id="empty-load-demo-btn"
                  onClick={onLoadDemoData}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-lg border border-slate-700"
                >
                  Load Sample Demo Data
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setDepartmentFilter('ALL');
                  setLevelFilter('ALL');
                  setAttendanceRiskOnly(false);
                }}
                className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 rounded-md"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Students Table */
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Register No &amp; Student</th>
                  <th className="py-3 px-3">Department &amp; Class</th>
                  <th className="py-3 px-3 text-center">Subjects</th>
                  <th className="py-3 px-3 text-center">IA Trend</th>
                  <th className="py-3 px-3 text-center">Attendance</th>
                  <th className="py-3 px-3 text-center">Overall Score</th>
                  <th className="py-3 px-3 text-center">Classification</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredStudents.map(({ student, analysis }) => (
                  <tr
                    key={student.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    {/* Reg No & Name */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {student.name}
                      </div>
                      <div className="font-mono text-[11px] text-slate-400">
                        {student.registerNo}
                      </div>
                    </td>

                    {/* Department */}
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                      <div className="truncate max-w-[180px]" title={student.department}>
                        {student.department}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {student.year} • Sem {student.semester} ({student.section})
                      </div>
                    </td>

                    {/* Subjects Count (Dynamic) */}
                    <td className="py-3 px-3 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                        {student.subjects.length} Subjects
                      </span>
                    </td>

                    {/* IA Trend */}
                    <td className="py-3 px-3 text-center">
                      {analysis.overallIATrend === 'Improving' && (
                        <span className="inline-flex items-center text-emerald-600 dark:text-emerald-400 text-xs font-medium">
                          <TrendingUp className="w-3.5 h-3.5 mr-1" /> Improving
                        </span>
                      )}
                      {analysis.overallIATrend === 'Declining' && (
                        <span className="inline-flex items-center text-rose-600 dark:text-rose-400 text-xs font-medium">
                          <TrendingDown className="w-3.5 h-3.5 mr-1" /> Declining
                        </span>
                      )}
                      {analysis.overallIATrend === 'Stable' && (
                        <span className="inline-flex items-center text-slate-500 dark:text-slate-400 text-xs font-medium">
                          <Minus className="w-3.5 h-3.5 mr-1" /> Stable
                        </span>
                      )}
                      {analysis.overallIATrend === 'Insufficient Data' && (
                        <span className="text-slate-400 text-[11px]">N/A</span>
                      )}
                    </td>

                    {/* Attendance */}
                    <td className="py-3 px-3 text-center">
                      <div
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          analysis.hasAttendanceRisk
                            ? 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 font-bold'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {analysis.hasAttendanceRisk && (
                          <AlertTriangle className="w-3 h-3 mr-1 text-rose-500" />
                        )}
                        <span>{analysis.overallAttendancePct}%</span>
                      </div>
                      {analysis.lowAttendanceSubjects.length > 0 && (
                        <div className="text-[10px] text-rose-500 mt-0.5">
                          {analysis.lowAttendanceSubjects.length} sub &lt; 75%
                        </div>
                      )}
                    </td>

                    {/* Overall Score */}
                    <td className="py-3 px-3 text-center">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {analysis.overallScore}
                      </span>
                      <span className="text-slate-400 text-[11px]">/100</span>
                    </td>

                    {/* Classification */}
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getLevelBadge(
                          analysis.performanceLevel
                        )}`}
                      >
                        {analysis.performanceLevel}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => onNavigate('performance', student.id)}
                          className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                          title="View In-Depth Performance Analysis"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onNavigate('ai-assistant', student.id)}
                          className="p-1.5 rounded hover:bg-indigo-50 dark:hover:bg-indigo-950 text-indigo-600 dark:text-indigo-400"
                          title="Chat with AI Academic Assistant"
                        >
                          <Bot className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onNavigate('reports', student.id)}
                          className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                          title="Generate Formal Report"
                        >
                          <FileSpreadsheet className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEditStudent(student)}
                          className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-blue-600 dark:text-blue-400"
                          title="Edit Student Information & Marks"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setStudentToDelete(student)}
                          className="p-1.5 rounded hover:bg-rose-50 dark:hover:bg-rose-950 text-rose-600 dark:text-rose-400"
                          title="Delete Student Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>
              Showing {filteredStudents.length} of {students.length} student records
            </span>
            <span className="text-[11px] text-slate-400">
              *Attendance under 75% highlighted in red
            </span>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-950 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Confirm Student Deletion
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  This operation cannot be undone.
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              Are you sure you want to permanently delete the academic record for{' '}
              <strong className="text-slate-900 dark:text-white">
                {studentToDelete.name}
              </strong>{' '}
              (Register No: <span className="font-mono">{studentToDelete.registerNo}</span>)?
              All {studentToDelete.subjects.length} associated subject records and assessment scores will be removed.
            </p>

            <div className="flex items-center justify-end space-x-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setStudentToDelete(null)}
                className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                id="confirm-delete-btn"
                onClick={confirmDelete}
                className="px-3.5 py-1.5 bg-rose-600 text-white text-xs font-medium rounded-lg hover:bg-rose-500 shadow-sm"
              >
                Delete Student Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
