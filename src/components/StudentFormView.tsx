import React, { useState } from 'react';
import {
  Save,
  ArrowLeft,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Calculator,
  RotateCcw,
  BookOpen,
  Info,
} from 'lucide-react';
import { Student, Subject } from '../types';
import {
  convertIAMarks,
  calculateAssignmentTotal,
  calculateAttendancePercentage,
  calculateConsolidatedMark,
} from '../utils/academicCalculations';

interface StudentFormViewProps {
  initialStudent?: Student | null;
  onSave: (student: Student) => void;
  onCancel: () => void;
}

const DEPARTMENTS = [
  'Computer Science and Engineering',
  'Information Technology',
  'Electronics and Communication Engineering',
  'Electrical and Electronics Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Artificial Intelligence & Data Science',
  'Biomedical Engineering',
];

const YEARS = ['I Year', 'II Year', 'III Year', 'IV Year'];
const SEMESTERS = ['1', '2', '3', '4', '5', '6', '7', '8'];
const SECTIONS = ['A', 'B', 'C', 'D'];

export const StudentFormView: React.FC<StudentFormViewProps> = ({
  initialStudent,
  onSave,
  onCancel,
}) => {
  const isEditing = !!initialStudent;

  // Basic Information
  const [registerNo, setRegisterNo] = useState(initialStudent?.registerNo || '');
  const [name, setName] = useState(initialStudent?.name || '');
  const [department, setDepartment] = useState(
    initialStudent?.department || DEPARTMENTS[0]
  );
  const [year, setYear] = useState(initialStudent?.year || YEARS[2]);
  const [semester, setSemester] = useState(initialStudent?.semester || '5');
  const [section, setSection] = useState(initialStudent?.section || 'A');
  const [academicYear, setAcademicYear] = useState(
    initialStudent?.academicYear || '2024-2025'
  );

  // Dynamic Subjects List:
  // When adding student manually, subjects list MUST be empty initially.
  const [subjects, setSubjects] = useState<Subject[]>(() => {
    if (initialStudent && initialStudent.subjects && initialStudent.subjects.length > 0) {
      return JSON.parse(JSON.stringify(initialStudent.subjects));
    }
    return [];
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Dynamic Subject Add: Starts completely empty
  const addSubject = () => {
    const newSub: Subject = {
      id: 'sub-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      subjectName: '',
      subjectCode: '',
      ia1: null,
      ia2: null,
      ia3: null,
      ia1Absent: false,
      ia2Absent: false,
      ia3Absent: false,
      consolidatedInternal: null,
      isConsolidatedManual: false,
      assignment1: null,
      assignment2: null,
      assignment3: null,
      periodsConducted: 0,
      periodsAttended: 0,
    };
    setSubjects((prev) => [...prev, newSub]);
    // Clear subjects error if any
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy.subjects;
      return copy;
    });
  };

  // Delete Subject
  const removeSubject = (index: number) => {
    setSubjects((prev) => prev.filter((_, i) => i !== index));
  };

  // Reorder Subjects
  const moveSubject = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === subjects.length - 1) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    setSubjects((prev) => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[targetIdx];
      updated[targetIdx] = temp;
      return updated;
    });
  };

  // Update specific subject field with automatic consolidated mark calculation
  const updateSubjectField = (
    index: number,
    field: keyof Subject,
    value: any
  ) => {
    setSubjects((prev) => {
      const updated = [...prev];
      const current = { ...updated[index], [field]: value };

      // If modifying IA marks, auto-calculate consolidated mark if not manually overridden
      if (
        (field === 'ia1' || field === 'ia2' || field === 'ia3') &&
        !current.isConsolidatedManual
      ) {
        current.consolidatedInternal = calculateConsolidatedMark(
          current.ia1,
          current.ia2,
          current.ia3,
          current.ia1Absent,
          current.ia2Absent,
          current.ia3Absent
        );
      }

      updated[index] = current;
      return updated;
    });
  };

  // Toggle Absent option for an IA exam
  const toggleIAAbsent = (index: number, iaNumber: 1 | 2 | 3) => {
    setSubjects((prev) => {
      const updated = [...prev];
      const current = { ...updated[index] };
      const absentKey = `ia${iaNumber}Absent` as 'ia1Absent' | 'ia2Absent' | 'ia3Absent';
      const markKey = `ia${iaNumber}` as 'ia1' | 'ia2' | 'ia3';

      const isNowAbsent = !current[absentKey];
      current[absentKey] = isNowAbsent;

      // When absent, clear the mark number
      if (isNowAbsent) {
        current[markKey] = null;
      }

      // Auto update consolidated mark if not manually overridden
      if (!current.isConsolidatedManual) {
        current.consolidatedInternal = calculateConsolidatedMark(
          current.ia1,
          current.ia2,
          current.ia3,
          current.ia1Absent,
          current.ia2Absent,
          current.ia3Absent
        );
      }

      updated[index] = current;
      return updated;
    });
  };

  // Manual change of consolidated internal mark
  const handleConsolidatedManualChange = (index: number, valueStr: string) => {
    setSubjects((prev) => {
      const updated = [...prev];
      const current = { ...updated[index] };
      const parsed = valueStr === '' ? null : parseFloat(valueStr);
      current.consolidatedInternal = parsed;
      current.isConsolidatedManual = true; // Flag manual override
      updated[index] = current;
      return updated;
    });
  };

  // Reset / Recalculate consolidated mark to automatic average
  const handleRecalculateConsolidated = (index: number) => {
    setSubjects((prev) => {
      const updated = [...prev];
      const current = { ...updated[index] };
      const autoVal = calculateConsolidatedMark(
        current.ia1,
        current.ia2,
        current.ia3,
        current.ia1Absent,
        current.ia2Absent,
        current.ia3Absent
      );
      current.consolidatedInternal = autoVal;
      current.isConsolidatedManual = false; // Remove manual override
      updated[index] = current;
      return updated;
    });
  };

  // Validate entire form
  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!registerNo.trim()) {
      newErrors.registerNo = 'Register Number is required.';
    }
    if (!name.trim()) {
      newErrors.name = 'Student Name is required.';
    }
    if (subjects.length === 0) {
      newErrors.subjects = 'Please add at least one subject for the student.';
    }

    subjects.forEach((sub, idx) => {
      if (!sub.subjectName.trim()) {
        newErrors[`subjectName_${idx}`] = `Subject #${idx + 1} name is required.`;
      }

      // IA Validation (0 - 50) when not absent
      if (!sub.ia1Absent && sub.ia1 !== null && sub.ia1 !== undefined) {
        if (sub.ia1 < 0 || sub.ia1 > 50) {
          newErrors[`ia1_${idx}`] = 'IA1 mark must be between 0 and 50.';
        }
      }
      if (!sub.ia2Absent && sub.ia2 !== null && sub.ia2 !== undefined) {
        if (sub.ia2 < 0 || sub.ia2 > 50) {
          newErrors[`ia2_${idx}`] = 'IA2 mark must be between 0 and 50.';
        }
      }
      if (!sub.ia3Absent && sub.ia3 !== null && sub.ia3 !== undefined) {
        if (sub.ia3 < 0 || sub.ia3 > 50) {
          newErrors[`ia3_${idx}`] = 'IA3 mark must be between 0 and 50.';
        }
      }

      // Consolidated (0 - 100)
      if (
        sub.consolidatedInternal !== null &&
        sub.consolidatedInternal !== undefined
      ) {
        if (sub.consolidatedInternal < 0 || sub.consolidatedInternal > 100) {
          newErrors[`consolidated_${idx}`] =
            'Consolidated mark must be between 0 and 100.';
        }
      }

      // Assignments (0 - 5)
      [
        { name: 'assignment1', val: sub.assignment1, label: 'Assignment 1' },
        { name: 'assignment2', val: sub.assignment2, label: 'Assignment 2' },
        { name: 'assignment3', val: sub.assignment3, label: 'Assignment 3' },
      ].forEach((a) => {
        if (a.val !== null && a.val !== undefined) {
          if (a.val < 0 || a.val > 5) {
            newErrors[`${a.name}_${idx}`] = `${a.label} must be between 0 and 5.`;
          }
        }
      });

      // Attendance validation
      if (sub.periodsConducted < 0) {
        newErrors[`conducted_${idx}`] = 'Conducted periods cannot be negative.';
      }
      if (sub.periodsAttended < 0) {
        newErrors[`attended_${idx}`] = 'Attended periods cannot be negative.';
      }
      if (sub.periodsConducted > 0 && sub.periodsAttended > sub.periodsConducted) {
        newErrors[`attended_${idx}`] = 'Attended periods cannot exceed conducted periods.';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      alert(`Please resolve validation errors before saving.`);
      return;
    }

    // Clean and normalize all subjects before saving:
    // If no values entered, consider as 0!
    const cleanedSubjects: Subject[] = subjects.map((sub, idx) => {
      const autoConsolidated = calculateConsolidatedMark(
        sub.ia1,
        sub.ia2,
        sub.ia3,
        sub.ia1Absent,
        sub.ia2Absent,
        sub.ia3Absent
      );

      // Final consolidated mark: use manual value if entered, else auto-calculated average
      const finalConsolidated =
        sub.consolidatedInternal !== null &&
        sub.consolidatedInternal !== undefined &&
        !isNaN(sub.consolidatedInternal)
          ? sub.consolidatedInternal
          : autoConsolidated;

      return {
        id: sub.id || `sub-${Date.now()}-${idx}`,
        subjectName: sub.subjectName.trim(),
        subjectCode: sub.subjectCode ? sub.subjectCode.trim() : undefined,
        ia1: sub.ia1Absent ? null : (sub.ia1 !== null && !isNaN(sub.ia1) ? sub.ia1 : null),
        ia2: sub.ia2Absent ? null : (sub.ia2 !== null && !isNaN(sub.ia2) ? sub.ia2 : null),
        ia3: sub.ia3Absent ? null : (sub.ia3 !== null && !isNaN(sub.ia3) ? sub.ia3 : null),
        ia1Absent: !!sub.ia1Absent,
        ia2Absent: !!sub.ia2Absent,
        ia3Absent: !!sub.ia3Absent,
        consolidatedInternal: finalConsolidated,
        isConsolidatedManual: !!sub.isConsolidatedManual,
        // If no values entered, consider as 0
        assignment1: sub.assignment1 !== null && !isNaN(sub.assignment1) ? sub.assignment1 : 0,
        assignment2: sub.assignment2 !== null && !isNaN(sub.assignment2) ? sub.assignment2 : 0,
        assignment3: sub.assignment3 !== null && !isNaN(sub.assignment3) ? sub.assignment3 : 0,
        periodsConducted: sub.periodsConducted !== null && !isNaN(sub.periodsConducted) ? sub.periodsConducted : 0,
        periodsAttended: sub.periodsAttended !== null && !isNaN(sub.periodsAttended) ? sub.periodsAttended : 0,
      };
    });

    const studentRecord: Student = {
      id: initialStudent?.id || 'std-' + Date.now(),
      registerNo: registerNo.trim(),
      name: name.trim(),
      department,
      year,
      semester,
      section,
      academicYear: academicYear.trim() || '2024-2025',
      subjects: cleanedSubjects,
      createdAt: initialStudent?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(studentRecord);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Back to Student Roster
          </button>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {isEditing ? `Edit Student: ${name}` : 'Register New Student'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Configure dynamic courses, IA evaluations, assignments, and attendance logs.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            id="save-student-btn"
            className="inline-flex items-center px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white rounded-lg shadow-sm transition-colors"
          >
            <Save className="w-3.5 h-3.5 mr-1.5" />
            {isEditing ? 'Save Changes' : 'Create Student Record'}
          </button>
        </div>
      </div>

      {/* Basic Student Information Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center space-x-2">
          <BookOpen className="w-4 h-4 text-indigo-600" />
          <span>Basic Student Information</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          {/* Register Number */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Register Number <span className="text-rose-500">*</span>
            </label>
            <input
              id="student-regno-input"
              type="text"
              required
              placeholder="e.g. 710022104001"
              value={registerNo}
              onChange={(e) => setRegisterNo(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            />
            {errors.registerNo && (
              <span className="text-[11px] text-rose-500 block mt-0.5">
                {errors.registerNo}
              </span>
            )}
          </div>

          {/* Student Name */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Full Student Name <span className="text-rose-500">*</span>
            </label>
            <input
              id="student-name-input"
              type="text"
              required
              placeholder="e.g. Aarav Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            />
            {errors.name && (
              <span className="text-[11px] text-rose-500 block mt-0.5">
                {errors.name}
              </span>
            )}
          </div>

          {/* Department */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Department <span className="text-rose-500">*</span>
            </label>
            <select
              id="student-dept-select"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            >
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Academic Year */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Academic Year
            </label>
            <input
              id="student-acad-year-input"
              type="text"
              placeholder="e.g. 2024-2025"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Year */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Year of Study
            </label>
            <select
              id="student-year-select"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            >
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Semester */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Semester
            </label>
            <select
              id="student-sem-select"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            >
              {SEMESTERS.map((s) => (
                <option key={s} value={s}>
                  Semester {s}
                </option>
              ))}
            </select>
          </div>

          {/* Section */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Section
            </label>
            <select
              id="student-sec-select"
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            >
              {SECTIONS.map((sec) => (
                <option key={sec} value={sec}>
                  Section {sec}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* DYNAMIC SUBJECT MANAGEMENT HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Dynamic Subject Management ({subjects.length} {subjects.length === 1 ? 'Subject' : 'Subjects'})
            </h3>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              Student Specific
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Add subjects one by one. Marks, IA absence, consolidated averages, and attendance can be filled or calculated.
          </p>
        </div>

        <button
          type="button"
          id="add-subject-btn"
          onClick={addSubject}
          className="inline-flex items-center px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white rounded-lg shadow-sm transition-colors shrink-0"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          + Add Subject
        </button>
      </div>

      {errors.subjects && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950 border border-rose-300 dark:border-rose-800 rounded-xl text-xs text-rose-800 dark:text-rose-200">
          {errors.subjects}
        </div>
      )}

      {/* EMPTY SUBJECT STATE */}
      {subjects.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-800 p-8 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              No Subjects Added Yet
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
              Subjects are empty initially. Click &quot;+ Add Subject&quot; above or below to add courses one by one with their respective IA marks, assignments, and attendance.
            </p>
          </div>
          <button
            type="button"
            onClick={addSubject}
            id="empty-add-subject-btn"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            + Add First Subject
          </button>
        </div>
      ) : (
        /* SUBJECT CARDS */
        <div className="space-y-4">
          {subjects.map((sub, idx) => {
            const cIA1 = convertIAMarks(sub.ia1, sub.ia1Absent);
            const cIA2 = convertIAMarks(sub.ia2, sub.ia2Absent);
            const cIA3 = convertIAMarks(sub.ia3, sub.ia3Absent);
            const autoConsolidated = calculateConsolidatedMark(
              sub.ia1,
              sub.ia2,
              sub.ia3,
              sub.ia1Absent,
              sub.ia2Absent,
              sub.ia3Absent
            );
            const currentConsolidated = sub.consolidatedInternal ?? autoConsolidated;
            const assignmentTotal = calculateAssignmentTotal(
              sub.assignment1,
              sub.assignment2,
              sub.assignment3
            );
            const attCalc = calculateAttendancePercentage(
              sub.periodsConducted,
              sub.periodsAttended
            );

            return (
              <div
                key={sub.id}
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4 relative"
              >
                {/* Subject Title & Ordering Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center space-x-2.5 flex-1">
                    <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <input
                          id={`subject-name-${idx}`}
                          type="text"
                          required
                          placeholder="Subject Name (e.g. Design & Analysis of Algorithms)"
                          value={sub.subjectName}
                          onChange={(e) =>
                            updateSubjectField(idx, 'subjectName', e.target.value)
                          }
                          className="w-full px-3 py-1 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                        />
                        {errors[`subjectName_${idx}`] && (
                          <span className="text-[10px] text-rose-500 block mt-0.5">
                            {errors[`subjectName_${idx}`]}
                          </span>
                        )}
                      </div>
                      <div>
                        <input
                          id={`subject-code-${idx}`}
                          type="text"
                          placeholder="Course Code (e.g. CS8501 - Optional)"
                          value={sub.subjectCode || ''}
                          onChange={(e) =>
                            updateSubjectField(idx, 'subjectCode', e.target.value)
                          }
                          className="w-full px-3 py-1 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Reorder and Delete Controls */}
                  <div className="flex items-center space-x-1 shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => moveSubject(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-white disabled:opacity-30"
                      title="Move subject up"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveSubject(idx, 'down')}
                      disabled={idx === subjects.length - 1}
                      className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-white disabled:opacity-30"
                      title="Move subject down"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      id={`delete-subject-${idx}`}
                      onClick={() => removeSubject(idx)}
                      className="p-1 rounded text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950"
                      title="Delete Subject"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Three Evaluation Pillars Grid: Internal Assessments, Assignments, Attendance */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 text-xs">
                  {/* 1. Internal Assessments (IA) */}
                  <div className="bg-slate-50/80 dark:bg-slate-800/40 p-3.5 rounded-lg border border-slate-200/80 dark:border-slate-700/80 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        Internal Assessments (/50)
                      </span>
                      <span className="text-[10px] text-slate-400">Converted to /100</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {/* IA 1 */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                            IA 1 (/50)
                          </label>
                        </div>
                        <input
                          type="number"
                          min="0"
                          max="50"
                          step="0.5"
                          placeholder={sub.ia1Absent ? 'AB' : '0-50'}
                          disabled={sub.ia1Absent}
                          value={sub.ia1Absent ? '' : (sub.ia1 ?? '')}
                          onChange={(e) =>
                            updateSubjectField(
                              idx,
                              'ia1',
                              e.target.value === '' ? null : parseFloat(e.target.value)
                            )
                          }
                          className={`w-full px-2 py-1 text-xs border rounded transition-colors ${
                            sub.ia1Absent
                              ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-600 dark:text-amber-400 font-bold placeholder-amber-500 cursor-not-allowed'
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white'
                          }`}
                        />
                        <div className="flex items-center justify-between pt-0.5">
                          <button
                            type="button"
                            onClick={() => toggleIAAbsent(idx, 1)}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                              sub.ia1Absent
                                ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-600 hover:text-amber-600'
                            }`}
                            title="Toggle Absent status for IA1"
                          >
                            {sub.ia1Absent ? '✓ Absent' : 'Absent'}
                          </button>
                          <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
                            {sub.ia1Absent
                              ? '0/100'
                              : cIA1 !== null
                              ? `${cIA1}/100`
                              : '—'}
                          </span>
                        </div>
                        {errors[`ia1_${idx}`] && (
                          <span className="text-[10px] text-rose-500 block">
                            {errors[`ia1_${idx}`]}
                          </span>
                        )}
                      </div>

                      {/* IA 2 */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                            IA 2 (/50)
                          </label>
                        </div>
                        <input
                          type="number"
                          min="0"
                          max="50"
                          step="0.5"
                          placeholder={sub.ia2Absent ? 'AB' : '0-50'}
                          disabled={sub.ia2Absent}
                          value={sub.ia2Absent ? '' : (sub.ia2 ?? '')}
                          onChange={(e) =>
                            updateSubjectField(
                              idx,
                              'ia2',
                              e.target.value === '' ? null : parseFloat(e.target.value)
                            )
                          }
                          className={`w-full px-2 py-1 text-xs border rounded transition-colors ${
                            sub.ia2Absent
                              ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-600 dark:text-amber-400 font-bold placeholder-amber-500 cursor-not-allowed'
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white'
                          }`}
                        />
                        <div className="flex items-center justify-between pt-0.5">
                          <button
                            type="button"
                            onClick={() => toggleIAAbsent(idx, 2)}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                              sub.ia2Absent
                                ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-600 hover:text-amber-600'
                            }`}
                            title="Toggle Absent status for IA2"
                          >
                            {sub.ia2Absent ? '✓ Absent' : 'Absent'}
                          </button>
                          <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
                            {sub.ia2Absent
                              ? '0/100'
                              : cIA2 !== null
                              ? `${cIA2}/100`
                              : '—'}
                          </span>
                        </div>
                        {errors[`ia2_${idx}`] && (
                          <span className="text-[10px] text-rose-500 block">
                            {errors[`ia2_${idx}`]}
                          </span>
                        )}
                      </div>

                      {/* IA 3 */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                            IA 3 (/50)
                          </label>
                        </div>
                        <input
                          type="number"
                          min="0"
                          max="50"
                          step="0.5"
                          placeholder={sub.ia3Absent ? 'AB' : '0-50'}
                          disabled={sub.ia3Absent}
                          value={sub.ia3Absent ? '' : (sub.ia3 ?? '')}
                          onChange={(e) =>
                            updateSubjectField(
                              idx,
                              'ia3',
                              e.target.value === '' ? null : parseFloat(e.target.value)
                            )
                          }
                          className={`w-full px-2 py-1 text-xs border rounded transition-colors ${
                            sub.ia3Absent
                              ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-600 dark:text-amber-400 font-bold placeholder-amber-500 cursor-not-allowed'
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white'
                          }`}
                        />
                        <div className="flex items-center justify-between pt-0.5">
                          <button
                            type="button"
                            onClick={() => toggleIAAbsent(idx, 3)}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                              sub.ia3Absent
                                ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-600 hover:text-amber-600'
                            }`}
                            title="Toggle Absent status for IA3"
                          >
                            {sub.ia3Absent ? '✓ Absent' : 'Absent'}
                          </button>
                          <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
                            {sub.ia3Absent
                              ? '0/100'
                              : cIA3 !== null
                              ? `${cIA3}/100`
                              : '—'}
                          </span>
                        </div>
                        {errors[`ia3_${idx}`] && (
                          <span className="text-[10px] text-rose-500 block">
                            {errors[`ia3_${idx}`]}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Consolidated Internal Mark Field: Auto Calculated + Allowed Manual Entry */}
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                          Consolidated Mark (/100)
                        </label>
                        <div className="flex items-center space-x-1.5">
                          {sub.isConsolidatedManual ? (
                            <span className="text-[9px] px-1.5 py-0.2 rounded font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                              Manual Entry
                            </span>
                          ) : (
                            <span className="text-[9px] px-1.5 py-0.2 rounded font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                              Auto-Calculated
                            </span>
                          )}
                          {sub.isConsolidatedManual && (
                            <button
                              type="button"
                              onClick={() => handleRecalculateConsolidated(idx)}
                              className="inline-flex items-center text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline"
                              title="Reset to calculated average of exams"
                            >
                              <RotateCcw className="w-2.5 h-2.5 mr-0.5" />
                              Auto ({autoConsolidated})
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.5"
                          placeholder={`Auto average: ${autoConsolidated}/100`}
                          value={
                            sub.consolidatedInternal !== null && sub.consolidatedInternal !== undefined
                              ? sub.consolidatedInternal
                              : autoConsolidated !== null
                              ? autoConsolidated
                              : ''
                          }
                          onChange={(e) => handleConsolidatedManualChange(idx, e.target.value)}
                          className="w-full px-2 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white font-semibold"
                        />
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span>
                          Exam Average: <strong className="text-slate-700 dark:text-slate-300">{autoConsolidated}/100</strong>
                        </span>
                        <span className="italic">
                          Auto-averaged or freely editable
                        </span>
                      </div>
                      {errors[`consolidated_${idx}`] && (
                        <span className="text-[10px] text-rose-500 block">
                          {errors[`consolidated_${idx}`]}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 2. Assignments (0 - 5 each, Max 15) */}
                  <div className="bg-slate-50/80 dark:bg-slate-800/40 p-3.5 rounded-lg border border-slate-200/80 dark:border-slate-700/80 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        Assignments (out of 5)
                      </span>
                      <span className="text-[11px] font-bold text-slate-900 dark:text-white bg-slate-200/80 dark:bg-slate-700 px-2 py-0.5 rounded">
                        Total: {assignmentTotal} / 15
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {/* A1 */}
                      <div>
                        <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-0.5">
                          Assign 1 (/5)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="5"
                          step="0.5"
                          placeholder="0-5"
                          value={sub.assignment1 ?? ''}
                          onChange={(e) =>
                            updateSubjectField(
                              idx,
                              'assignment1',
                              e.target.value === '' ? null : parseFloat(e.target.value)
                            )
                          }
                          className="w-full px-2 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white"
                        />
                      </div>

                      {/* A2 */}
                      <div>
                        <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-0.5">
                          Assign 2 (/5)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="5"
                          step="0.5"
                          placeholder="0-5"
                          value={sub.assignment2 ?? ''}
                          onChange={(e) =>
                            updateSubjectField(
                              idx,
                              'assignment2',
                              e.target.value === '' ? null : parseFloat(e.target.value)
                            )
                          }
                          className="w-full px-2 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white"
                        />
                      </div>

                      {/* A3 */}
                      <div>
                        <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-0.5">
                          Assign 3 (/5)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="5"
                          step="0.5"
                          placeholder="0-5"
                          value={sub.assignment3 ?? ''}
                          onChange={(e) =>
                            updateSubjectField(
                              idx,
                              'assignment3',
                              e.target.value === '' ? null : parseFloat(e.target.value)
                            )
                          }
                          className="w-full px-2 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="pt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                      <span>Max assignment total: 15 marks.</span>
                      <span className="italic">Empty fields count as 0.</span>
                    </div>
                  </div>

                  {/* 3. Subject-wise Attendance */}
                  <div className="bg-slate-50/80 dark:bg-slate-800/40 p-3.5 rounded-lg border border-slate-200/80 dark:border-slate-700/80 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        Subject Attendance
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          sub.periodsConducted > 0
                            ? attCalc.isRisk
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-300'
                        }`}
                      >
                        {sub.periodsConducted > 0
                          ? `${attCalc.percentage}% (${attCalc.isRisk ? 'Risk <75%' : 'Eligible'})`
                          : 'Not tracked (0%)'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-0.5">
                          Periods Conducted
                        </label>
                        <input
                          type="number"
                          min="0"
                          placeholder="0"
                          value={sub.periodsConducted || ''}
                          onChange={(e) =>
                            updateSubjectField(
                              idx,
                              'periodsConducted',
                              e.target.value === '' ? 0 : parseInt(e.target.value, 10) || 0
                            )
                          }
                          className="w-full px-2 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white"
                        />
                        {errors[`conducted_${idx}`] && (
                          <span className="text-[10px] text-rose-500 block mt-0.5">
                            {errors[`conducted_${idx}`]}
                          </span>
                        )}
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-0.5">
                          Periods Attended
                        </label>
                        <input
                          type="number"
                          min="0"
                          max={sub.periodsConducted || undefined}
                          placeholder="0"
                          value={sub.periodsAttended || ''}
                          onChange={(e) =>
                            updateSubjectField(
                              idx,
                              'periodsAttended',
                              e.target.value === '' ? 0 : parseInt(e.target.value, 10) || 0
                            )
                          }
                          className="w-full px-2 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white"
                        />
                        {errors[`attended_${idx}`] && (
                          <span className="text-[10px] text-rose-500 block mt-0.5">
                            {errors[`attended_${idx}`]}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Display: <strong>{sub.periodsAttended || 0} / {sub.periodsConducted || 0} periods</strong> ({attCalc.percentage}%)
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom Save & Cancel Bar */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <button
          type="button"
          onClick={addSubject}
          className="inline-flex items-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          <Plus className="w-4 h-4 mr-1" />
          + Add Another Subject
        </button>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            id="bottom-save-student-btn"
            className="inline-flex items-center px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white rounded-lg shadow-sm transition-colors"
          >
            <Save className="w-4 h-4 mr-1.5" />
            {isEditing ? 'Update Student Record' : 'Save Student Record'}
          </button>
        </div>
      </div>
    </form>
  );
};
