import { Student, Subject, SettingsConfig, StaffUser, ThemeMode } from '../types';
import { DEFAULT_THRESHOLDS } from '../utils/academicCalculations';

const STORAGE_KEYS = {
  STUDENTS: 'ai_academic_students_v1',
  SETTINGS: 'ai_academic_settings_v1',
  AUTH: 'ai_academic_auth_v1',
  THEME: 'ai_academic_theme_v1',
  STAFF_PROFILE: 'ai_academic_staff_profile_v1',
};

export interface CSVParseResult {
  success: boolean;
  students: Student[];
  errors: string[];
  warnings: string[];
  totalRows: number;
  studentCount: number;
  subjectCount: number;
}

// Realistic Demo Students with differing subject counts (5, 6, 5, 6)
export const DEMO_STUDENTS: Student[] = [
  {
    id: 'std-101',
    registerNo: '710022104001',
    name: 'Aarav Sharma',
    department: 'Computer Science and Engineering',
    year: 'III Year',
    semester: '5',
    section: 'A',
    academicYear: '2024-2025',
    createdAt: '2024-09-01T09:00:00.000Z',
    updatedAt: '2024-11-15T14:30:00.000Z',
    // 5 Subjects - Excellent Performance pattern (~92%)
    subjects: [
      {
        id: 'sub-101-1',
        subjectName: 'Design & Analysis of Algorithms',
        subjectCode: 'CS8501',
        ia1: 44, // 88%
        ia2: 46, // 92%
        ia3: 48, // 96%
        consolidatedInternal: 92,
        assignment1: 5,
        assignment2: 5,
        assignment3: 5,
        periodsConducted: 45,
        periodsAttended: 43, // 95.56%
      },
      {
        id: 'sub-101-2',
        subjectName: 'Database Management Systems',
        subjectCode: 'CS8502',
        ia1: 45,
        ia2: 47,
        ia3: 48,
        consolidatedInternal: 94,
        assignment1: 5,
        assignment2: 4.5,
        assignment3: 5,
        periodsConducted: 48,
        periodsAttended: 46, // 95.83%
      },
      {
        id: 'sub-101-3',
        subjectName: 'Operating Systems',
        subjectCode: 'CS8503',
        ia1: 42,
        ia2: 45,
        ia3: 46,
        consolidatedInternal: 89,
        assignment1: 5,
        assignment2: 5,
        assignment3: 4,
        periodsConducted: 45,
        periodsAttended: 42, // 93.33%
      },
      {
        id: 'sub-101-4',
        subjectName: 'Theory of Computation',
        subjectCode: 'CS8504',
        ia1: 40,
        ia2: 44,
        ia3: 47,
        consolidatedInternal: 88,
        assignment1: 4.5,
        assignment2: 5,
        assignment3: 5,
        periodsConducted: 50,
        periodsAttended: 47, // 94%
      },
      {
        id: 'sub-101-5',
        subjectName: 'Object Oriented Software Engineering',
        subjectCode: 'CS8505',
        ia1: 43,
        ia2: 45,
        ia3: 47,
        consolidatedInternal: 91,
        assignment1: 5,
        assignment2: 5,
        assignment3: 5,
        periodsConducted: 40,
        periodsAttended: 38, // 95%
      },
    ],
  },
  {
    id: 'std-102',
    registerNo: '710022104042',
    name: 'Priya Narayanan',
    department: 'Computer Science and Engineering',
    year: 'III Year',
    semester: '5',
    section: 'B',
    academicYear: '2024-2025',
    createdAt: '2024-09-02T10:15:00.000Z',
    updatedAt: '2024-11-18T16:20:00.000Z',
    // 6 Subjects - Good Performance pattern (~78%)
    subjects: [
      {
        id: 'sub-102-1',
        subjectName: 'Design & Analysis of Algorithms',
        subjectCode: 'CS8501',
        ia1: 36, // 72%
        ia2: 38, // 76%
        ia3: 41, // 82%
        consolidatedInternal: 78,
        assignment1: 4,
        assignment2: 4.5,
        assignment3: 4,
        periodsConducted: 45,
        periodsAttended: 39, // 86.67%
      },
      {
        id: 'sub-102-2',
        subjectName: 'Database Management Systems',
        subjectCode: 'CS8502',
        ia1: 41,
        ia2: 42,
        ia3: 40,
        consolidatedInternal: 82,
        assignment1: 4.5,
        assignment2: 5,
        assignment3: 4.5,
        periodsConducted: 48,
        periodsAttended: 42, // 87.5%
      },
      {
        id: 'sub-102-3',
        subjectName: 'Operating Systems',
        subjectCode: 'CS8503',
        ia1: 34,
        ia2: 37,
        ia3: 38,
        consolidatedInternal: 74,
        assignment1: 4,
        assignment2: 4,
        assignment3: 4,
        periodsConducted: 45,
        periodsAttended: 38, // 84.44%
      },
      {
        id: 'sub-102-4',
        subjectName: 'Theory of Computation',
        subjectCode: 'CS8504',
        ia1: 35,
        ia2: 37,
        ia3: 39,
        consolidatedInternal: 75,
        assignment1: 3.5,
        assignment2: 4,
        assignment3: 4,
        periodsConducted: 50,
        periodsAttended: 41, // 82%
      },
      {
        id: 'sub-102-5',
        subjectName: 'Web Technologies',
        subjectCode: 'CS8506',
        ia1: 40,
        ia2: 43,
        ia3: 44,
        consolidatedInternal: 85,
        assignment1: 5,
        assignment2: 4.5,
        assignment3: 5,
        periodsConducted: 42,
        periodsAttended: 37, // 88.1%
      },
      {
        id: 'sub-102-6',
        subjectName: 'Professional Ethics in Engineering',
        subjectCode: 'GE8076',
        ia1: 38,
        ia2: 39,
        ia3: 41,
        consolidatedInternal: 79,
        assignment1: 4.5,
        assignment2: 4,
        assignment3: 4.5,
        periodsConducted: 36,
        periodsAttended: 31, // 86.11%
      },
    ],
  },
  {
    id: 'std-103',
    registerNo: '710022104088',
    name: 'Karthik Raja',
    department: 'Information Technology',
    year: 'II Year',
    semester: '3',
    section: 'A',
    academicYear: '2024-2025',
    createdAt: '2024-09-03T11:00:00.000Z',
    updatedAt: '2024-11-20T11:45:00.000Z',
    // 5 Subjects - Average Performance pattern (~62%)
    subjects: [
      {
        id: 'sub-103-1',
        subjectName: 'Data Structures',
        subjectCode: 'CS8391',
        ia1: 29, // 58%
        ia2: 31, // 62%
        ia3: 32, // 64%
        consolidatedInternal: 62,
        assignment1: 3,
        assignment2: 3.5,
        assignment3: 3.5,
        periodsConducted: 45,
        periodsAttended: 35, // 77.78%
      },
      {
        id: 'sub-103-2',
        subjectName: 'Digital Principles & System Design',
        subjectCode: 'EC8395',
        ia1: 27,
        ia2: 29,
        ia3: 30,
        consolidatedInternal: 58,
        assignment1: 3,
        assignment2: 3,
        assignment3: 3,
        periodsConducted: 48,
        periodsAttended: 37, // 77.08%
      },
      {
        id: 'sub-103-3',
        subjectName: 'Object Oriented Programming',
        subjectCode: 'CS8392',
        ia1: 32,
        ia2: 33,
        ia3: 34,
        consolidatedInternal: 66,
        assignment1: 4,
        assignment2: 3.5,
        assignment3: 4,
        periodsConducted: 45,
        periodsAttended: 36, // 80%
      },
      {
        id: 'sub-103-4',
        subjectName: 'Discrete Mathematics',
        subjectCode: 'MA8351',
        ia1: 25,
        ia2: 28,
        ia3: 29,
        consolidatedInternal: 56,
        assignment1: 3,
        assignment2: 3,
        assignment3: 2.5,
        periodsConducted: 52,
        periodsAttended: 40, // 76.92%
      },
      {
        id: 'sub-103-5',
        subjectName: 'Analog & Digital Communication',
        subjectCode: 'EC8394',
        ia1: 30,
        ia2: 32,
        ia3: 33,
        consolidatedInternal: 64,
        assignment1: 3.5,
        assignment2: 3.5,
        assignment3: 3.5,
        periodsConducted: 40,
        periodsAttended: 31, // 77.5%
      },
    ],
  },
  {
    id: 'std-104',
    registerNo: '710022104112',
    name: 'Vikas Sundaram',
    department: 'Computer Science and Engineering',
    year: 'III Year',
    semester: '5',
    section: 'C',
    academicYear: '2024-2025',
    createdAt: '2024-09-04T14:20:00.000Z',
    updatedAt: '2024-11-22T09:10:00.000Z',
    // 6 Subjects - At Risk Performance pattern (~47%), declining trend, 2 subjects below 75% attendance!
    subjects: [
      {
        id: 'sub-104-1',
        subjectName: 'Theory of Computation',
        subjectCode: 'CS8504',
        ia1: 24, // 48%
        ia2: 20, // 40%
        ia3: 16, // 32% (Declining!)
        consolidatedInternal: 38,
        assignment1: 2,
        assignment2: 2,
        assignment3: 1.5,
        periodsConducted: 50,
        periodsAttended: 32, // 64% - ATTENDANCE RISK!
      },
      {
        id: 'sub-104-2',
        subjectName: 'Design & Analysis of Algorithms',
        subjectCode: 'CS8501',
        ia1: 26,
        ia2: 22,
        ia3: 18, // Declining
        consolidatedInternal: 42,
        assignment1: 2.5,
        assignment2: 2,
        assignment3: 2,
        periodsConducted: 45,
        periodsAttended: 31, // 68.89% - ATTENDANCE RISK!
      },
      {
        id: 'sub-104-3',
        subjectName: 'Database Management Systems',
        subjectCode: 'CS8502',
        ia1: 28,
        ia2: 25,
        ia3: 22,
        consolidatedInternal: 48,
        assignment1: 3,
        assignment2: 2.5,
        assignment3: 2,
        periodsConducted: 48,
        periodsAttended: 37, // 77.08%
      },
      {
        id: 'sub-104-4',
        subjectName: 'Operating Systems',
        subjectCode: 'CS8503',
        ia1: 25,
        ia2: 24,
        ia3: 21,
        consolidatedInternal: 44,
        assignment1: 2.5,
        assignment2: 2.5,
        assignment3: 2,
        periodsConducted: 45,
        periodsAttended: 34, // 75.56%
      },
      {
        id: 'sub-104-5',
        subjectName: 'Computer Networks',
        subjectCode: 'CS8591',
        ia1: 30,
        ia2: 26,
        ia3: 23,
        consolidatedInternal: 51,
        assignment1: 3,
        assignment2: 2.5,
        assignment3: 2.5,
        periodsConducted: 44,
        periodsAttended: 33, // 75%
      },
      {
        id: 'sub-104-6',
        subjectName: 'Microprocessors & Microcontrollers',
        subjectCode: 'EC8691',
        ia1: 23,
        ia2: 21,
        ia3: 19,
        consolidatedInternal: 40,
        assignment1: 2,
        assignment2: 2,
        assignment3: 1.5,
        periodsConducted: 42,
        periodsAttended: 29, // 69.05% - ATTENDANCE RISK!
      },
    ],
  },
];

export const storageService = {
  /**
   * Load all students from LocalStorage with safe fallbacks
   */
  getStudents(): Student[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.STUDENTS);
      if (!raw) {
        // Initialize with DEMO_STUDENTS on first run if empty
        this.saveAllStudents(DEMO_STUDENTS);
        return DEMO_STUDENTS;
      }
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      return [];
    } catch (e) {
      console.error('Failed to read students from LocalStorage:', e);
      return DEMO_STUDENTS;
    }
  },

  /**
   * Save array of all students
   */
  saveAllStudents(students: Student[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    } catch (e) {
      console.error('Failed to write students to LocalStorage:', e);
    }
  },

  /**
   * Save or update a single student
   */
  saveStudent(student: Student): Student {
    const students = this.getStudents();
    const existingIndex = students.findIndex((s) => s.id === student.id);
    const now = new Date().toISOString();

    let updatedStudent: Student;
    if (existingIndex >= 0) {
      updatedStudent = {
        ...student,
        updatedAt: now,
      };
      students[existingIndex] = updatedStudent;
    } else {
      updatedStudent = {
        ...student,
        createdAt: student.createdAt || now,
        updatedAt: now,
      };
      students.unshift(updatedStudent);
    }

    this.saveAllStudents(students);
    return updatedStudent;
  },

  /**
   * Delete a student by ID
   */
  deleteStudent(id: string): boolean {
    const students = this.getStudents();
    const filtered = students.filter((s) => s.id !== id);
    if (filtered.length !== students.length) {
      this.saveAllStudents(filtered);
      return true;
    }
    return false;
  },

  /**
   * Get single student by ID
   */
  getStudentById(id: string): Student | null {
    const students = this.getStudents();
    return students.find((s) => s.id === id) || null;
  },

  /**
   * Clear all students
   */
  clearAllStudents(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.STUDENTS);
    } catch (e) {
      console.error('Failed to clear students from LocalStorage:', e);
    }
  },

  /**
   * Reset to default demo data
   */
  resetDemoData(): Student[] {
    this.saveAllStudents(DEMO_STUDENTS);
    return DEMO_STUDENTS;
  },

  /**
   * Export students data as JSON string
   */
  exportData(): string {
    const data = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      studentCount: this.getStudents().length,
      students: this.getStudents(),
    };
    return JSON.stringify(data, null, 2);
  },

  /**
   * Import students JSON data with structure validation
   */
  importData(jsonString: string): { success: boolean; count: number; message: string } {
    try {
      const parsed = JSON.parse(jsonString);
      let studentList: Student[] = [];

      if (Array.isArray(parsed)) {
        studentList = parsed;
      } else if (parsed && Array.isArray(parsed.students)) {
        studentList = parsed.students;
      } else {
        return { success: false, count: 0, message: 'Invalid JSON schema: No students list found.' };
      }

      // Basic validation
      const validStudents = studentList.filter(
        (s) => s && s.id && s.name && Array.isArray(s.subjects)
      );

      if (validStudents.length === 0) {
        return { success: false, count: 0, message: 'No valid student records found in imported file.' };
      }

      this.saveAllStudents(validStudents);
      return {
        success: true,
        count: validStudents.length,
        message: `Successfully imported ${validStudents.length} student records.`,
      };
    } catch (e: any) {
      return { success: false, count: 0, message: `JSON parsing error: ${e?.message || 'Invalid format'}` };
    }
  },

  /**
   * Reset / Load demo data alias
   */
  loadDemoData(): Student[] {
    return this.resetDemoData();
  },

  /**
   * Export students data as JSON string alias
   */
  exportDataAsJSON(): string {
    return this.exportData();
  },

  /**
   * Import students JSON data alias
   */
  importDataFromJSON(jsonString: string): { success: boolean; count: number; error?: string } {
    const res = this.importData(jsonString);
    return {
      success: res.success,
      count: res.count,
      error: res.success ? undefined : res.message,
    };
  },

  /**
   * Save array of students alias
   */
  saveStudents(students: Student[]): void {
    this.saveAllStudents(students);
  },

  /**
   * Settings management
   */
  getSettings(): SettingsConfig {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!raw) {
        return {
          thresholds: { ...DEFAULT_THRESHOLDS },
        };
      }
      const parsed = JSON.parse(raw);
      return {
        thresholds: parsed.thresholds || { ...DEFAULT_THRESHOLDS },
        customApiKey: parsed.customApiKey || '',
        theme: parsed.theme || 'dark',
        professorName: parsed.professorName || 'Prof. S. R. Ramanathan',
        professorRole: parsed.professorRole || 'Senior Academic Coordinator & Staff',
        departmentName: parsed.departmentName || 'Department of Computer Science and Engineering',
        institutionName: parsed.institutionName || 'SNS College of Technology',
      };
    } catch {
      return {
        thresholds: { ...DEFAULT_THRESHOLDS },
        theme: 'dark',
        professorName: 'Prof. S. R. Ramanathan',
        professorRole: 'Senior Academic Coordinator & Staff',
        departmentName: 'Department of Computer Science and Engineering',
        institutionName: 'SNS College of Technology',
      };
    }
  },

  saveSettings(settings: SettingsConfig): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
      if (settings.theme) {
        this.saveTheme(settings.theme);
      }
      if (settings.professorName || settings.professorRole) {
        this.saveStaffProfile({
          name: settings.professorName,
          role: settings.professorRole,
          department: settings.departmentName,
          institution: settings.institutionName,
        });
      }
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  },

  /**
   * Theme configuration
   */
  getTheme(): ThemeMode {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.THEME) as ThemeMode | null;
      if (stored && ['light', 'dark', 'navy', 'emerald'].includes(stored)) {
        return stored;
      }
      return 'dark';
    } catch {
      return 'dark';
    }
  },

  applyTheme(theme: ThemeMode): void {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.classList.remove('dark', 'theme-navy', 'theme-emerald', 'theme-light');
    if (theme === 'light') {
      root.classList.add('theme-light');
    } else if (theme === 'navy') {
      root.classList.add('dark', 'theme-navy');
    } else if (theme === 'emerald') {
      root.classList.add('dark', 'theme-emerald');
    } else {
      root.classList.add('dark');
    }
  },

  saveTheme(theme: ThemeMode): void {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
      this.applyTheme(theme);
    } catch (e) {
      console.error('Failed to save theme:', e);
    }
  },

  /**
   * Staff Profile management (Professor Name, Role, Dept)
   */
  getStaffProfile(): {
    name: string;
    role: string;
    department: string;
    institution: string;
  } {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.STAFF_PROFILE);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          name: parsed.name || 'Prof. S. R. Ramanathan',
          role: parsed.role || 'Senior Academic Coordinator & Staff',
          department: parsed.department || 'Department of Computer Science and Engineering',
          institution: parsed.institution || 'SNS College of Technology',
        };
      }
    } catch (e) {
      console.error('Error loading staff profile:', e);
    }
    return {
      name: 'Prof. S. R. Ramanathan',
      role: 'Senior Academic Coordinator & Staff',
      department: 'Department of Computer Science and Engineering',
      institution: 'SNS College of Technology',
    };
  },

  saveStaffProfile(profile: Partial<StaffUser>): void {
    try {
      const current = this.getStaffProfile();
      const updated = {
        ...current,
        ...profile,
      };
      localStorage.setItem(STORAGE_KEYS.STAFF_PROFILE, JSON.stringify(updated));

      // Also update existing active auth session if one is logged in
      const session = this.getAuthSession();
      if (session) {
        this.setAuthSession({
          ...session,
          name: updated.name,
          role: updated.role,
          department: updated.department,
          institution: updated.institution,
        });
      }
    } catch (e) {
      console.error('Failed to save staff profile:', e);
    }
  },

  /**
   * Generate downloadable sample CSV template for bulk student import
   */
  generateCSVTemplate(): string {
    const headers = [
      'RegisterNo',
      'Name',
      'Department',
      'Year',
      'Semester',
      'Section',
      'AcademicYear',
      'SubjectName',
      'SubjectCode',
      'IA1',
      'IA2',
      'IA3',
      'ConsolidatedInternal',
      'Assignment1',
      'Assignment2',
      'Assignment3',
      'PeriodsConducted',
      'PeriodsAttended',
    ];

    const sampleRows = [
      '710022104006,Karthik Raja,Computer Science and Engineering,III Year,5,A,2024-2025,Design & Analysis of Algorithms,CS8501,42,45,46,91,5,5,5,45,43',
      '710022104006,Karthik Raja,Computer Science and Engineering,III Year,5,A,2024-2025,Database Management Systems,CS8502,38,40,42,80,4,4,5,48,42',
      '710022104006,Karthik Raja,Computer Science and Engineering,III Year,5,A,2024-2025,Operating Systems,CS8503,40,44,45,88,5,5,4,45,44',
      '710022104007,Sneha Priya,Computer Science and Engineering,III Year,5,B,2024-2025,Design & Analysis of Algorithms,CS8501,26,28,24,52,3,3,4,45,31',
      '710022104007,Sneha Priya,Computer Science and Engineering,III Year,5,B,2024-2025,Database Management Systems,CS8502,29,31,28,60,4,3,3,48,34',
      '710022104007,Sneha Priya,Computer Science and Engineering,III Year,5,B,2024-2025,Operating Systems,CS8503,22,24,20,44,3,2,3,45,29',
    ];

    return [headers.join(','), ...sampleRows].join('\n');
  },

  /**
   * Parse CSV string into Student array with intelligent grouping and validation
   */
  parseCSVStudents(csvText: string): CSVParseResult {
    const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
    const errors: string[] = [];
    const warnings: string[] = [];

    if (lines.length < 2) {
      return {
        success: false,
        students: [],
        errors: ['CSV file is empty or does not contain header and data rows.'],
        warnings: [],
        totalRows: 0,
        studentCount: 0,
        subjectCount: 0,
      };
    }

    // Helper to parse CSV line respecting quotes
    const parseLine = (line: string): string[] => {
      const parts: string[] = [];
      let cur = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const c = line[i];
        if (c === '"' || c === "'") {
          inQuotes = !inQuotes;
        } else if (c === ',' && !inQuotes) {
          parts.push(cur.trim());
          cur = '';
        } else {
          cur += c;
        }
      }
      parts.push(cur.trim());
      return parts;
    };

    const rawHeader = parseLine(lines[0]);
    const headerMap: { [key: string]: number } = {};
    rawHeader.forEach((h, idx) => {
      const clean = h.toLowerCase().replace(/[\s_\-]/g, '');
      headerMap[clean] = idx;
    });

    // Check mandatory columns
    const findCol = (...aliases: string[]): number => {
      for (const a of aliases) {
        const clean = a.toLowerCase().replace(/[\s_\-]/g, '');
        if (headerMap[clean] !== undefined) return headerMap[clean];
      }
      return -1;
    };

    const regNoCol = findCol('registerno', 'regno', 'rollno', 'register_no', 'id');
    const nameCol = findCol('name', 'studentname', 'student_name');

    if (regNoCol === -1 || nameCol === -1) {
      return {
        success: false,
        students: [],
        errors: [
          'Missing required columns: CSV must contain at least "RegisterNo" and "Name" columns.',
        ],
        warnings: [],
        totalRows: lines.length - 1,
        studentCount: 0,
        subjectCount: 0,
      };
    }

    const deptCol = findCol('department', 'dept', 'branch', 'course');
    const yearCol = findCol('year', 'classyear');
    const semCol = findCol('semester', 'sem');
    const secCol = findCol('section', 'sec');
    const ayCol = findCol('academicyear', 'ay', 'yearofstudy');

    const subNameCol = findCol('subjectname', 'subject', 'coursename');
    const subCodeCol = findCol('subjectcode', 'code', 'coursecode');
    const ia1Col = findCol('ia1', 'internal1', 'ia_1');
    const ia2Col = findCol('ia2', 'internal2', 'ia_2');
    const ia3Col = findCol('ia3', 'internal3', 'ia_3');
    const consolCol = findCol('consolidatedinternal', 'consolidated', 'internal');
    const a1Col = findCol('assignment1', 'assign1', 'a1');
    const a2Col = findCol('assignment2', 'assign2', 'a2');
    const a3Col = findCol('assignment3', 'assign3', 'a3');
    const condCol = findCol('periodsconducted', 'conducted', 'totalperiods', 'totalhours');
    const attCol = findCol('periodsattended', 'attended', 'attendedperiods', 'attendedhours');

    // Group rows by RegisterNo
    const studentMap = new Map<
      string,
      {
        registerNo: string;
        name: string;
        department: string;
        year: string;
        semester: string;
        section: string;
        academicYear: string;
        subjects: Subject[];
      }
    >();

    let totalDataRows = 0;
    let totalSubjectsParsed = 0;

    for (let r = 1; r < lines.length; r++) {
      const line = lines[r];
      if (!line.trim()) continue;
      totalDataRows++;
      const cols = parseLine(line);

      const regNo = (cols[regNoCol] || '').trim();
      const name = (cols[nameCol] || '').trim();

      if (!regNo || !name) {
        warnings.push(`Row ${r + 1}: Skipped row due to missing RegisterNo or Name.`);
        continue;
      }

      const department = deptCol !== -1 && cols[deptCol] ? cols[deptCol].trim() : 'Computer Science and Engineering';
      const year = yearCol !== -1 && cols[yearCol] ? cols[yearCol].trim() : 'III Year';
      const semester = semCol !== -1 && cols[semCol] ? cols[semCol].trim() : '5';
      const section = secCol !== -1 && cols[secCol] ? cols[secCol].trim() : 'A';
      const academicYear = ayCol !== -1 && cols[ayCol] ? cols[ayCol].trim() : '2024-2025';

      let student = studentMap.get(regNo);
      if (!student) {
        student = {
          registerNo: regNo,
          name,
          department,
          year,
          semester,
          section,
          academicYear,
          subjects: [],
        };
        studentMap.set(regNo, student);
      }

      // Subject extraction
      const subjectName =
        subNameCol !== -1 && cols[subNameCol]
          ? cols[subNameCol].trim()
          : `Course ${student.subjects.length + 1}`;
      const subjectCode =
        subCodeCol !== -1 && cols[subCodeCol] ? cols[subCodeCol].trim() : undefined;

      const numOrNull = (val: string | undefined, max: number): number | null => {
        if (!val || val.trim() === '' || val.trim() === '-' || val.trim() === 'NA') return null;
        const n = parseFloat(val);
        if (isNaN(n)) return null;
        return Math.max(0, Math.min(max, Math.round(n * 10) / 10));
      };

      const numOrDefault = (val: string | undefined, def: number, max?: number): number => {
        if (!val || val.trim() === '') return def;
        const n = parseFloat(val);
        if (isNaN(n)) return def;
        let clamped = Math.max(0, n);
        if (max !== undefined) clamped = Math.min(max, clamped);
        return Math.round(clamped);
      };

      const ia1 = ia1Col !== -1 ? numOrNull(cols[ia1Col], 50) : null;
      const ia2 = ia2Col !== -1 ? numOrNull(cols[ia2Col], 50) : null;
      const ia3 = ia3Col !== -1 ? numOrNull(cols[ia3Col], 50) : null;

      // Consolidated calculation if not present
      let consolidated: number | null = null;
      if (consolCol !== -1 && cols[consolCol]) {
        consolidated = numOrNull(cols[consolCol], 100);
      }
      if (consolidated === null) {
        const validIAs = [ia1, ia2, ia3].filter((x): x is number => x !== null);
        if (validIAs.length > 0) {
          const avgScaled = (validIAs.reduce((a, b) => a + b, 0) / validIAs.length) * 2;
          consolidated = Math.round(avgScaled);
        }
      }

      const assignment1 = a1Col !== -1 ? numOrNull(cols[a1Col], 5) : 4;
      const assignment2 = a2Col !== -1 ? numOrNull(cols[a2Col], 5) : 4;
      const assignment3 = a3Col !== -1 ? numOrNull(cols[a3Col], 5) : 4;

      const conducted = condCol !== -1 ? numOrDefault(cols[condCol], 45) : 45;
      const attendedRaw = attCol !== -1 ? numOrDefault(cols[attCol], Math.round(conducted * 0.85)) : Math.round(conducted * 0.85);
      const attended = Math.min(conducted, attendedRaw);

      student.subjects.push({
        id: `sub-csv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        subjectName,
        subjectCode,
        ia1,
        ia2,
        ia3,
        consolidatedInternal: consolidated,
        assignment1,
        assignment2,
        assignment3,
        periodsConducted: conducted,
        periodsAttended: attended,
      });
      totalSubjectsParsed++;
    }

    // Convert map to Student[] array
    const parsedStudents: Student[] = [];
    studentMap.forEach((s) => {
      // Ensure at least 1 subject
      if (s.subjects.length === 0) {
        s.subjects.push({
          id: `sub-default-${Date.now()}`,
          subjectName: 'Core Engineering Subject',
          ia1: 35,
          ia2: 38,
          ia3: 40,
          consolidatedInternal: 76,
          assignment1: 4,
          assignment2: 4,
          assignment3: 4,
          periodsConducted: 45,
          periodsAttended: 40,
        });
      }

      parsedStudents.push({
        id: `std-csv-${s.registerNo.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        registerNo: s.registerNo,
        name: s.name,
        department: s.department,
        year: s.year,
        semester: s.semester,
        section: s.section,
        academicYear: s.academicYear,
        subjects: s.subjects,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    });

    return {
      success: parsedStudents.length > 0,
      students: parsedStudents,
      errors,
      warnings,
      totalRows: totalDataRows,
      studentCount: parsedStudents.length,
      subjectCount: totalSubjectsParsed,
    };
  },

  /**
   * Bulk import students into storage with configurable merge mode
   */
  bulkImport(
    imported: Student[],
    mode: 'merge' | 'replace' | 'append' = 'merge'
  ): { added: number; updated: number; total: number } {
    const existing = this.getStudents();
    let finalStudents: Student[] = [];
    let added = 0;
    let updated = 0;

    if (mode === 'replace') {
      finalStudents = [...imported];
      added = imported.length;
    } else if (mode === 'append') {
      const existingRegs = new Set(existing.map((s) => s.registerNo.toLowerCase()));
      finalStudents = [...existing];
      imported.forEach((s) => {
        if (!existingRegs.has(s.registerNo.toLowerCase())) {
          finalStudents.push(s);
          added++;
        }
      });
    } else {
      // 'merge' mode
      const map = new Map<string, Student>();
      existing.forEach((s) => map.set(s.registerNo.toLowerCase(), s));

      imported.forEach((newS) => {
        const key = newS.registerNo.toLowerCase();
        const oldS = map.get(key);
        if (oldS) {
          map.set(key, {
            ...oldS,
            ...newS,
            id: oldS.id,
            subjects: newS.subjects.length > 0 ? newS.subjects : oldS.subjects,
            updatedAt: new Date().toISOString(),
          });
          updated++;
        } else {
          map.set(key, newS);
          added++;
        }
      });

      finalStudents = Array.from(map.values());
    }

    this.saveAllStudents(finalStudents);
    return { added, updated, total: finalStudents.length };
  },

  /**
   * Staff Auth session management
   */
  getAuthSession(): StaffUser | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.AUTH);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed.isLoggedIn ? parsed : null;
    } catch {
      return null;
    }
  },

  setAuthSession(user: StaffUser | null): void {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEYS.AUTH);
      }
    } catch (e) {
      console.error('Failed to set auth session:', e);
    }
  },
};
