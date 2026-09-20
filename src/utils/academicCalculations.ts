import {
  Subject,
  Student,
  SubjectAnalysis,
  StudentPerformance,
  IATrend,
  PerformanceLevel,
  SettingsConfig,
} from '../types';

export const DEFAULT_THRESHOLDS = {
  excellent: 85,
  good: 70,
  average: 55,
  atRisk: 40,
};

/**
 * Converts IA marks obtained out of 50 to 100.
 * Converted IA = (Marks Obtained / 50) * 100
 */
export function convertIAMarks(marks: number | null | undefined): number | null {
  if (marks === null || marks === undefined || isNaN(marks)) return null;
  const clamped = Math.max(0, Math.min(50, marks));
  return Math.round((clamped / 50) * 100 * 10) / 10;
}

/**
 * Calculates Assignment Total out of 15.
 * A1 + A2 + A3 (each 0 - 5)
 */
export function calculateAssignmentTotal(
  a1: number | null | undefined,
  a2: number | null | undefined,
  a3: number | null | undefined
): number {
  const val1 = typeof a1 === 'number' && !isNaN(a1) ? Math.max(0, Math.min(5, a1)) : 0;
  const val2 = typeof a2 === 'number' && !isNaN(a2) ? Math.max(0, Math.min(5, a2)) : 0;
  const val3 = typeof a3 === 'number' && !isNaN(a3) ? Math.max(0, Math.min(5, a3)) : 0;
  return Math.round((val1 + val2 + val3) * 10) / 10;
}

/**
 * Calculates Attendance % = (Periods Attended / Periods Conducted) * 100
 */
export function calculateAttendancePercentage(
  conducted: number,
  attended: number
): { percentage: number; isRisk: boolean; isValid: boolean; error?: string } {
  if (!conducted || conducted <= 0) {
    return { percentage: 0, isRisk: true, isValid: false, error: 'Conducted periods must be > 0' };
  }
  if (attended < 0) {
    return { percentage: 0, isRisk: true, isValid: false, error: 'Attended periods cannot be negative' };
  }
  if (attended > conducted) {
    return { percentage: 100, isRisk: false, isValid: false, error: 'Attended cannot exceed conducted' };
  }

  const percentage = Math.round((attended / conducted) * 10000) / 100;
  return {
    percentage,
    isRisk: percentage < 75,
    isValid: true,
  };
}

/**
 * Analyzes IA Performance Trend (IA1 -> IA2 -> IA3)
 * Detects: Improving, Stable, Declining, Insufficient data
 */
export function analyzeIATrend(
  ia1: number | null | undefined,
  ia2: number | null | undefined,
  ia3: number | null | undefined
): IATrend {
  const scores: number[] = [];
  if (typeof ia1 === 'number' && !isNaN(ia1)) scores.push(ia1);
  if (typeof ia2 === 'number' && !isNaN(ia2)) scores.push(ia2);
  if (typeof ia3 === 'number' && !isNaN(ia3)) scores.push(ia3);

  if (scores.length < 2) {
    return 'Insufficient Data';
  }

  if (scores.length === 2) {
    const diff = scores[1] - scores[0];
    if (diff >= 2.5) return 'Improving';
    if (diff <= -2.5) return 'Declining';
    return 'Stable';
  }

  // scores.length === 3
  const diff1 = scores[1] - scores[0];
  const diff2 = scores[2] - scores[1];
  const overallDiff = scores[2] - scores[0];

  if ((diff1 >= 0 && diff2 > 0) || (diff1 > 0 && diff2 >= 0) || overallDiff >= 4) {
    return 'Improving';
  }
  if ((diff1 <= 0 && diff2 < 0) || (diff1 < 0 && diff2 <= 0) || overallDiff <= -4) {
    return 'Declining';
  }
  return 'Stable';
}

/**
 * Optional helper to calculate default suggested consolidated internal mark
 * from average of available converted IAs.
 */
export function calculateSuggestedConsolidatedMark(
  ia1: number | null | undefined,
  ia2: number | null | undefined,
  ia3: number | null | undefined
): number | null {
  const convertedList: number[] = [];
  const c1 = convertIAMarks(ia1);
  const c2 = convertIAMarks(ia2);
  const c3 = convertIAMarks(ia3);

  if (c1 !== null) convertedList.push(c1);
  if (c2 !== null) convertedList.push(c2);
  if (c3 !== null) convertedList.push(c3);

  if (convertedList.length === 0) return null;
  const sum = convertedList.reduce((a, b) => a + b, 0);
  return Math.round((sum / convertedList.length) * 10) / 10;
}

/**
 * Analyzes a single subject's performance metrics
 */
export function analyzeSubject(subject: Subject): SubjectAnalysis {
  const cIA1 = convertIAMarks(subject.ia1);
  const cIA2 = convertIAMarks(subject.ia2);
  const cIA3 = convertIAMarks(subject.ia3);
  const assignmentTotal = calculateAssignmentTotal(
    subject.assignment1,
    subject.assignment2,
    subject.assignment3
  );

  const att = calculateAttendancePercentage(
    subject.periodsConducted,
    subject.periodsAttended
  );
  const attendancePct = att.percentage;
  const isAttendanceRisk = att.isRisk;
  const iaTrend = analyzeIATrend(subject.ia1, subject.ia2, subject.ia3);

  // Subject Score Calculation:
  // Component 1: Internal mark (weight: 55%). Use consolidatedInternal if available, else average of converted IAs
  let internalMark = subject.consolidatedInternal;
  if (internalMark === null || internalMark === undefined || isNaN(internalMark)) {
    internalMark = calculateSuggestedConsolidatedMark(subject.ia1, subject.ia2, subject.ia3);
  }
  const effectiveInternal = internalMark !== null ? internalMark : 50; // fallback neutral

  // Component 2: Assignment performance (weight: 20%). Assignment total / 15 converted to / 100
  const assignmentScore100 = (assignmentTotal / 15) * 100;

  // Component 3: Attendance performance (weight: 20%)
  const attendanceScore100 = Math.min(100, attendancePct);

  // Component 4: Trend bonus/penalty (weight: 5%)
  let trendAdjustment = 0;
  if (iaTrend === 'Improving') trendAdjustment = 4;
  else if (iaTrend === 'Declining') trendAdjustment = -4;

  const rawSubjectScore =
    effectiveInternal * 0.55 +
    assignmentScore100 * 0.20 +
    attendanceScore100 * 0.20 +
    trendAdjustment;

  const subjectScore = Math.max(0, Math.min(100, Math.round(rawSubjectScore * 10) / 10));

  return {
    subjectId: subject.id,
    subjectName: subject.subjectName,
    subjectCode: subject.subjectCode,
    rawIA1: subject.ia1,
    rawIA2: subject.ia2,
    rawIA3: subject.ia3,
    convertedIA1: cIA1,
    convertedIA2: cIA2,
    convertedIA3: cIA3,
    consolidatedInternal: subject.consolidatedInternal,
    assignmentTotal,
    attendancePct,
    isAttendanceRisk,
    subjectScore,
    iaTrend,
    periodsConducted: subject.periodsConducted,
    periodsAttended: subject.periodsAttended,
  };
}

/**
 * Classifies overall score into Performance Level based on thresholds
 */
export function getPerformanceLevel(
  score: number,
  thresholds = DEFAULT_THRESHOLDS
): PerformanceLevel {
  if (score >= thresholds.excellent) return 'Excellent';
  if (score >= thresholds.good) return 'Good';
  if (score >= thresholds.average) return 'Average';
  if (score >= thresholds.atRisk) return 'At Risk';
  return 'Critical';
}

/**
 * Analyzes overall student performance across all dynamic subjects
 */
export function analyzeStudentPerformance(
  student: Student,
  settings?: SettingsConfig
): StudentPerformance {
  const thresholds = settings?.thresholds || DEFAULT_THRESHOLDS;
  const subjects = student.subjects || [];

  if (subjects.length === 0) {
    return {
      studentId: student.id,
      overallScore: 0,
      performanceLevel: 'Critical',
      overallAttendancePct: 0,
      totalConductedPeriods: 0,
      totalAttendedPeriods: 0,
      hasAttendanceRisk: false,
      lowAttendanceSubjects: [],
      strongestSubjects: [],
      weakestSubjects: [],
      decliningSubjects: [],
      strongAssignmentSubjects: [],
      attentionSubjects: [],
      overallIATrend: 'Insufficient Data',
      riskFactors: ['No subjects enrolled yet.'],
      subjectAnalyses: [],
    };
  }

  const analyses = subjects.map(analyzeSubject);

  // Overall Attendance: total attended / total conducted
  const totalConducted = subjects.reduce((sum, s) => sum + (s.periodsConducted || 0), 0);
  const totalAttended = subjects.reduce((sum, s) => sum + (s.periodsAttended || 0), 0);
  const overallAttendancePct =
    totalConducted > 0 ? Math.round((totalAttended / totalConducted) * 10000) / 100 : 0;
  const hasAttendanceRisk = overallAttendancePct < 75 || analyses.some((a) => a.isAttendanceRisk);

  // Subject groups
  const lowAttendanceSubjects = analyses
    .filter((a) => a.isAttendanceRisk)
    .map((a) => a.subjectName);

  const decliningSubjects = analyses
    .filter((a) => a.iaTrend === 'Declining')
    .map((a) => a.subjectName);

  const strongAssignmentSubjects = analyses
    .filter((a) => a.assignmentTotal >= 12)
    .map((a) => a.subjectName);

  // Sort by subjectScore
  const sortedByScore = [...analyses].sort((a, b) => b.subjectScore - a.subjectScore);
  const strongestSubjects = sortedByScore
    .filter((a) => a.subjectScore >= 70)
    .slice(0, 3)
    .map((a) => a.subjectName);

  const weakestSubjects = sortedByScore
    .filter((a) => a.subjectScore < 60)
    .map((a) => a.subjectName);

  // Subjects requiring immediate staff attention
  const attentionSubjects = analyses
    .filter(
      (a) =>
        a.subjectScore < 55 ||
        a.isAttendanceRisk ||
        a.iaTrend === 'Declining' ||
        (a.consolidatedInternal !== null && a.consolidatedInternal < 50)
    )
    .map((a) => a.subjectName);

  // Overall IA Trend aggregate
  const improvingCount = analyses.filter((a) => a.iaTrend === 'Improving').length;
  const decliningCount = analyses.filter((a) => a.iaTrend === 'Declining').length;
  let overallIATrend: IATrend = 'Stable';
  if (improvingCount > decliningCount && improvingCount >= 2) overallIATrend = 'Improving';
  else if (decliningCount > improvingCount && decliningCount >= 2) overallIATrend = 'Declining';
  else if (improvingCount === 0 && decliningCount === 0) overallIATrend = 'Insufficient Data';

  // Overall Score = average of subject scores, minus penalty if overall attendance is < 75
  const avgScore =
    analyses.reduce((sum, a) => sum + a.subjectScore, 0) / (analyses.length || 1);
  let attendancePenalty = 0;
  if (overallAttendancePct < 75) {
    attendancePenalty = Math.min(8, ((75 - overallAttendancePct) / 10) * 3);
  }
  const overallScore = Math.max(0, Math.min(100, Math.round((avgScore - attendancePenalty) * 10) / 10));
  const performanceLevel = getPerformanceLevel(overallScore, thresholds);

  // Identify Risk Factors
  const riskFactors: string[] = [];
  if (overallAttendancePct < 75) {
    riskFactors.push(`Overall attendance is ${overallAttendancePct}%, which is below the mandatory 75% threshold.`);
  }
  if (lowAttendanceSubjects.length > 0) {
    riskFactors.push(`Attendance risk in ${lowAttendanceSubjects.length} subject(s): ${lowAttendanceSubjects.join(', ')}.`);
  }
  if (decliningSubjects.length > 0) {
    riskFactors.push(`Declining IA trend observed in: ${decliningSubjects.join(', ')}.`);
  }
  if (weakestSubjects.length > 0) {
    riskFactors.push(`Low academic scoring (<60%) in: ${weakestSubjects.join(', ')}.`);
  }
  const lowInternalCount = analyses.filter(
    (a) => a.consolidatedInternal !== null && a.consolidatedInternal < 50
  ).length;
  if (lowInternalCount > 0) {
    riskFactors.push(`${lowInternalCount} subject(s) have consolidated internal marks below 50.`);
  }
  if (riskFactors.length === 0) {
    riskFactors.push('No critical academic or attendance risks identified.');
  }

  return {
    studentId: student.id,
    overallScore,
    performanceLevel,
    overallAttendancePct,
    totalConductedPeriods: totalConducted,
    totalAttendedPeriods: totalAttended,
    hasAttendanceRisk,
    lowAttendanceSubjects,
    strongestSubjects,
    weakestSubjects,
    decliningSubjects,
    strongAssignmentSubjects,
    attentionSubjects,
    overallIATrend,
    riskFactors,
    subjectAnalyses: analyses,
  };
}
