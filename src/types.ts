export interface Subject {
  id: string;
  subjectName: string;
  subjectCode?: string;
  ia1: number | null; // 0 - 50
  ia2: number | null; // 0 - 50
  ia3: number | null; // 0 - 50
  consolidatedInternal: number | null; // 0 - 100
  assignment1: number | null; // 0 - 5
  assignment2: number | null; // 0 - 5
  assignment3: number | null; // 0 - 5
  periodsConducted: number; // > 0
  periodsAttended: number; // >= 0 and <= conducted
}

export interface Student {
  id: string;
  registerNo: string;
  name: string;
  department: string;
  year: string;
  semester: string;
  section: string;
  academicYear: string;
  subjects: Subject[];
  createdAt: string;
  updatedAt: string;
}

export type PerformanceLevel = 'Excellent' | 'Good' | 'Average' | 'At Risk' | 'Critical';
export type IATrend = 'Improving' | 'Stable' | 'Declining' | 'Insufficient Data';

export interface SubjectAnalysis {
  subjectId: string;
  subjectName: string;
  subjectCode?: string;
  rawIA1: number | null; // 0 - 50
  rawIA2: number | null; // 0 - 50
  rawIA3: number | null; // 0 - 50
  convertedIA1: number | null; // 0 - 100
  convertedIA2: number | null; // 0 - 100
  convertedIA3: number | null; // 0 - 100
  consolidatedInternal: number | null; // 0 - 100
  assignmentTotal: number; // 0 - 15
  attendancePct: number; // 0 - 100%
  isAttendanceRisk: boolean; // attendancePct < 75%
  subjectScore: number; // 0 - 100
  iaTrend: IATrend;
  periodsConducted: number;
  periodsAttended: number;
}

export interface StudentPerformance {
  studentId: string;
  overallScore: number; // 0 - 100
  performanceLevel: PerformanceLevel;
  overallAttendancePct: number;
  totalConductedPeriods: number;
  totalAttendedPeriods: number;
  hasAttendanceRisk: boolean;
  lowAttendanceSubjects: string[];
  strongestSubjects: string[];
  weakestSubjects: string[];
  decliningSubjects: string[];
  strongAssignmentSubjects: string[];
  attentionSubjects: string[];
  overallIATrend: IATrend;
  riskFactors: string[];
  subjectAnalyses: SubjectAnalysis[];
}

export type ThemeMode = 'light' | 'dark' | 'navy' | 'emerald';

export interface SettingsConfig {
  thresholds: {
    excellent: number; // Default 85
    good: number;      // Default 70
    average: number;   // Default 55
    atRisk: number;    // Default 40
  };
  customApiKey?: string;
  theme?: ThemeMode;
  professorName?: string;
  professorRole?: string;
  departmentName?: string;
  institutionName?: string;
}

export interface StaffUser {
  username: string;
  role: string;
  name: string;
  department?: string;
  institution?: string;
  isLoggedIn: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  isVoiceInput?: boolean;
}
