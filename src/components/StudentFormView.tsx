import React, { useState } from 'react';
import {
  Save,
  ArrowLeft,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Calculator,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  BookOpen,
} from 'lucide-react';
import { Student, Subject } from '../types';
import {
  convertIAMarks,
  calculateAssignmentTotal,
  calculateAttendancePercentage,
  calculateSuggestedConsolidatedMark,
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

  // Dynamic Subjects List
  const [subjects, setSubjects] = useState<Subject[]>(() => {
    if (initialStudent && initialStudent.subjects && initialStudent.subjects.length > 0) {
      return JSON.parse(JSON.stringify(initialStudent.subjects));
    }
    // Default to 5 starting subjects
    return [
      {
        id: 'sub-' + Date.now() + '-1',
        subjectName: 'Design & Analysis of Algorithms',
        subjectCode: 'CS8501',
        ia1: 38,
        ia2: 42,
        ia3: 45,
        consolidatedInternal: 84,
        assignment1: 4.5,
        assignment2: 4,
        assignment3: 5,
        periodsConducted: 45,
        periodsAttended: 41,
      },
      {
        id: 'sub-' + Date.now() + '-2',
        subjectName: 'Database Management Systems',
        subjectCode: 'CS8502',
        ia1: 40,
        ia2: 43,
        ia3: 46,
        consolidatedInternal: 86,
        assignment1: 5,
        assignment2: 4.5,
        assignment3: 4.5,
        periodsConducted: 48,
        periodsAttended: 44,
      },
      {
        id: 'sub-' + Date.now() + '-3',
        subjectName: 'Operating Systems',
        subjectCode: 'CS8503',
        ia1: 35,
        ia2: 38,
        ia3: 40,
        consolidatedInternal: 76,
        assignment1: 4,
        assignment2: 4,
        assignment3: 4,
        periodsConducted: 45,
        periodsAttended: 38,
      },
      {
        id: 'sub-' + Date.now() + '-4',
        subjectName: 'Theory of Computation',
        subjectCode: 'CS8504',
        ia1: 36,
        ia2: 39,
        ia3: 42,
        consolidatedInternal: 78,
        assignment1: 4,
        assignment2: 4,
        assignment3: 4.5,
        periodsConducted: 50,
        periodsAttended: 42,
      },
      {
        id: 'sub-' + Date.now() + '-5',
        subjectName: 'Computer Networks',
        subjectCode: 'CS8591',
        ia1: 42,
        ia2: 44,
        ia3: 46,
        consolidatedInternal: 88,
        assignment1: 5,
        assignment2: 5,
        assignment3: 4.5,
        periodsConducted: 45,
        periodsAttended: 40,
      },
    ];
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Dynamic Subject Add
  const addSubject = () => {
    const newSub: Subject = {
      id: 'sub-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      subjectName: '',
      subjectCode: '',
      ia1: null,
      ia2: null,
      ia3: null,
      consolidatedInternal: null,
      assignment1: null,
      assignment2: null,
      assignment3: null,
      periodsConducted: 45,
      periodsAttended: 40,
    };
    setSubjects([...subjects, newSub]);
  };

  // Delete Subject
  const removeSubject = (index: number) => {
    if (subjects.length <= 1) {
      alert('A student must have at least one registered subject.');
      return;
    }
    const updated = subjects.filter((_, i) => i !== index);
    setSubjects(updated);
  };

  // Reorder Subjects
  const moveSubject = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === subjects.length - 1) return;
    const updated = [...subjects];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setSubjects(updated);
  };

  // Update specific subject field
  const updateSubjectField = (
    index: number,
    field: keyof Subject,
    value: any
  ) => {
    const updated = [...subjects];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setSubjects(updated);
  };

  // Helper calculation for Consolidated Internal Mark
  const handleCalculateConsolidated = (index: number) => {
    const sub = subjects[index];
    const suggested = calculateSuggestedConsolidatedMark(sub.ia1, sub.ia2, sub.ia3);
    if (suggested === null) {
      alert('Enter at least one IA mark (out of 50) to calculate a suggested consolidated mark.');
      return;
    }

    if (
      sub.consolidatedInternal !== null &&
      sub.consolidatedInternal !== undefined &&
      sub.consolidatedInternal !== suggested
    ) {
      const confirmed = window.confirm(
        `Current Consolidated Mark is ${sub.consolidatedInternal}/100.\nDo you want to overwrite it with the calculated average of converted IAs (${suggested}/100)?`
      );
      if (!confirmed) return;
    }

    updateSubjectField(index, 'consolidatedInternal', suggested);
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
      newErrors.subjects = 'At least one subject must be added.';
    }

    subjects.forEach((sub, idx) => {
      if (!sub.subjectName.trim()) {
        newErrors[`subjectName_${idx}`] = `Subject #${idx + 1} name is required.`;
      }

      // IA Validation (0 - 50)
      [
        { name: 'ia1', val: sub.ia1, label: 'IA1' },
        { name: 'ia2', val: sub.ia2, label: 'IA2' },
        { name: 'ia3', val: sub.ia3, label: 'IA3' },
      ].forEach((ia) => {
        if (ia.val !== null && ia.val !== undefined) {
          if (ia.val < 0 || ia.val > 50) {
            newErrors[`${ia.name}_${idx}`] = `${ia.label} must be between 0 and 50.`;
          }
        }
      });

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
      if (!sub.periodsConducted || sub.periodsConducted <= 0) {
        newErrors[`conducted_${idx}`] = 'Conducted periods must be greater than 0.';
      }
      if (sub.periodsAttended < 0) {
        newErrors[`attended_${idx}`] = 'Attended periods cannot be negative.';
      }
      if (sub.periodsAttended > sub.periodsConducted) {
        newErrors[`attended_${idx}`] = 'Attended periods cannot exceed conducted periods.';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      const firstKey = Object.keys(errors)[0];
      alert(`Please resolve validation errors before saving.`);
      return;
    }

    const studentRecord: Student = {
      id: initialStudent?.id || 'std-' + Date.now(),
      registerNo: registerNo.trim(),
      name: name.trim(),
      department,
      year,
      semester,
      section,
      academicYear,
      subjects,
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
              Dynamic Subject Management ({subjects.length} Subjects)
            </h3>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              Student Specific
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Each student has an independent subject count. Add, edit, remove, or reorder courses.
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

      {/* SUBJECT CARDS */}
      <div className="space-y-4">
        {subjects.map((sub, idx) => {
          const cIA1 = convertIAMarks(sub.ia1);
          const cIA2 = convertIAMarks(sub.ia2);
          const cIA3 = convertIAMarks(sub.ia3);
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
                    <input
                      id={`subject-name-${idx}`}
                      type="text"
                      required
                      placeholder="Subject Name (e.g. Design & Analysis of Algorithms)"
                      value={sub.subjectName}
                      onChange={(e) =>
                        updateSubjectField(idx, 'subjectName', e.target.value)
                      }
                      className="px-3 py-1 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    />
                    <input
                      id={`subject-code-${idx}`}
                      type="text"
                      placeholder="Course Code (e.g. CS8501)"
                      value={sub.subjectCode || ''}
                      onChange={(e) =>
                        updateSubjectField(idx, 'subjectCode', e.target.value)
                      }
                      className="px-3 py-1 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    />
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
                      Internal Assessments (out of 50)
                    </span>
                    <span className="text-[10px] text-slate-400">Converted to /100</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {/* IA 1 */}
                    <div>
                      <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-0.5">
                        IA 1 (/50)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        step="0.5"
                        placeholder="0-50"
                        value={sub.ia1 ?? ''}
                        onChange={(e) =>
                          updateSubjectField(
                            idx,
                            'ia1',
                            e.target.value === '' ? null : parseFloat(e.target.value)
                          )
                        }
                        className="w-full px-2 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white"
                      />
                      <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium mt-0.5">
                        {cIA1 !== null ? `${cIA1}/100` : '—'}
                      </div>
                    </div>

                    {/* IA 2 */}
                    <div>
                      <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-0.5">
                        IA 2 (/50)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        step="0.5"
                        placeholder="0-50"
                        value={sub.ia2 ?? ''}
                        onChange={(e) =>
                          updateSubjectField(
                            idx,
                            'ia2',
                            e.target.value === '' ? null : parseFloat(e.target.value)
                          )
                        }
                        className="w-full px-2 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white"
                      />
                      <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium mt-0.5">
                        {cIA2 !== null ? `${cIA2}/100` : '—'}
                      </div>
                    </div>

                    {/* IA 3 */}
                    <div>
                      <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-0.5">
                        IA 3 (/50)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        step="0.5"
                        placeholder="0-50"
                        value={sub.ia3 ?? ''}
                        onChange={(e) =>
                          updateSubjectField(
                            idx,
                            'ia3',
                            e.target.value === '' ? null : parseFloat(e.target.value)
                          )
                        }
                        className="w-full px-2 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white"
                      />
                      <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium mt-0.5">
                        {cIA3 !== null ? `${cIA3}/100` : '—'}
                      </div>
                    </div>
                  </div>

                  {/* Consolidated Internal Mark Field */}
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                        Consolidated Internal Mark (/100)
                      </label>
                      <button
                        type="button"
                        onClick={() => handleCalculateConsolidated(idx)}
                        className="inline-flex items-center text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline"
                        title="Calculate average from converted IA marks"
                      >
                        <Calculator className="w-3 h-3 mr-0.5" />
                        Calculate
                      </button>
                    </div>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.5"
                      placeholder="0-100 (Separate record)"
                      value={sub.consolidatedInternal ?? ''}
                      onChange={(e) =>
                        updateSubjectField(
                          idx,
                          'consolidatedInternal',
                          e.target.value === '' ? null : parseFloat(e.target.value)
                        )
                      }
                      className="w-full px-2 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white font-semibold"
                    />
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Stored separately for institution-specific calculations
                    </span>
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

                  <div className="pt-2 text-[11px] text-slate-500 dark:text-slate-400">
                    Maximum possible continuous assignment score: 15 marks.
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
                        attCalc.isRisk
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300'
                      }`}
                    >
                      {attCalc.percentage}% ({attCalc.isRisk ? 'Risk <75%' : 'Eligible'})
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-0.5">
                        Periods Conducted (&gt;0)
                      </label>
                      <input
                        type="number"
                        min="1"
                        placeholder="e.g. 45"
                        value={sub.periodsConducted || ''}
                        onChange={(e) =>
                          updateSubjectField(
                            idx,
                            'periodsConducted',
                            parseInt(e.target.value, 10) || 0
                          )
                        }
                        className="w-full px-2 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-0.5">
                        Periods Attended
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={sub.periodsConducted}
                        placeholder="e.g. 41"
                        value={sub.periodsAttended ?? ''}
                        onChange={(e) =>
                          updateSubjectField(
                            idx,
                            'periodsAttended',
                            parseInt(e.target.value, 10) || 0
                          )
                        }
                        className="w-full px-2 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Display: <strong>{sub.periodsAttended} / {sub.periodsConducted} periods</strong> ({attCalc.percentage}%)
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

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
