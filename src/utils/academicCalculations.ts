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
 * If absent, returns 0.
 * If empty or null, returns null.
 */
export function convertIAMarks(
  marks: number | null | undefined,
  isAbsent = false
): number | null {
  if (isAbsent) return 0;
  if (marks === null || marks === undefined || isNaN(marks) || String(marks).trim() === '') return null;
  const clamped = Math.max(0, Math.min(50, Number(marks)));
  return Math.round((clamped / 50) * 100 * 10) / 10;
}

/**
 * Calculates Assignment Total out of 15.
 * A1 + A2 + A3 (each 0 - 5).
 * If no values entered, consider as 0.
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
  conducted: number | null | undefined,
  attended: number | null | undefined
): { percentage: number; isRisk: boolean; isValid: boolean; error?: string } {
  const c = typeof conducted === 'number' && !isNaN(conducted) ? Math.max(0, conducted) : 0;
  const a = typeof attended === 'number' && !isNaN(attended) ? Math.max(0, attended) : 0;

  if (c <= 0) {
    return { percentage: 0, isRisk: false, isValid: true };
  }
  if (a < 0) {
    return { percentage: 0, isRisk: true, isValid: false, error: 'Attended periods cannot be negative' };
  }
  if (a > c) {
    return { percentage: 100, isRisk: false, isValid: false, error: 'Attended cannot exceed conducted' };
  }

  const percentage = Math.round((a / c) * 10000) / 100;
  return {
    percentage,
    isRisk: percentage < 75,
    isValid: true,
  };
}

/**
 * Calculates consolidated mark as average of evaluated IA exams.
 * - If only two IA marks are entered, calculate only for 2 IA.
 * - If two IA marks and absent for 3rd IA, calculate for 3 IA (absent counts as 0).
 * - If three IA marks entered, average of three exams.
 * - If no values entered, consider as 0.
 */
export function calculateConsolidatedMark(
  ia1: number | null | undefined,
  ia2: number | null | undefined,
  ia3: number | null | undefined,
  ia1Absent = false,
  ia2Absent = false,
  ia3Absent = false
): number {
  const evaluatedExams: number[] = [];

  // IA 1
  if (ia1Absent) {
    evaluatedExams.push(0);
  } else {
    const c1 = convertIAMarks(ia1, false);
    if (c1 !== null) evaluatedExams.push(c1);
  }

  // IA 2
  if (ia2Absent) {
    evaluatedExams.push(0);
  } else {
    const c2 = convertIAMarks(ia2, false);
    if (c2 !== null) evaluatedExams.push(c2);
  }

  // IA 3
  if (ia3Absent) {
    evaluatedExams.push(0);
  } else {
    const c3 = convertIAMarks(ia3, false);
    if (c3 !== null) evaluatedExams.push(c3);
  }

  // If no values entered, consider as 0
  if (evaluatedExams.length === 0) {
    return 0;
  }

  const sum = evaluatedExams.reduce((acc, v) => acc + v, 0);
  return Math.round((sum / evaluatedExams.length) * 10) / 10;
}

/**
 * Backward compatibility alias for calculateConsolidatedMark
 */
export function calculateSuggestedConsolidatedMark(
  ia1: number | null | undefined,
  ia2: number | null | undefined,
  ia3: number | null | undefined,
  ia1Absent = false,
  ia2Absent = false,
  ia3Absent = false
): number {
  return calculateConsolidatedMark(ia1, ia2, ia3, ia1Absent, ia2Absent, ia3Absent);
}

/**
 * Analyzes IA Performance Trend (IA1 -> IA2 -> IA3)
 * Detects: Improving, Stable, Declining, Insufficient data.
 * Absent exams count as 0 mark in trend trajectory.
 */
export function analyzeIATrend(
  ia1: number | null | undefined,
  ia2: number | null | undefined,
  ia3: number | null | undefined,
  ia1Absent = false,
  ia2Absent = false,
  ia3Absent = false
): IATrend {
  const scores: number[] = [];

  if (ia1Absent) scores.push(0);
  else if (ia1 !== null && ia1 !== undefined && !isNaN(ia1) && String(ia1).trim() !== '') {
    scores.push(Math.max(0, Math.min(50, Number(ia1))));
  }

  if (ia2Absent) scores.push(0);
  else if (ia2 !== null && ia2 !== undefined && !isNaN(ia2) && String(ia2).trim() !== '') {
    scores.push(Math.max(0, Math.min(50, Number(ia2))));
  }

  if (ia3Absent) scores.push(0);
  else if (ia3 !== null && ia3 !== undefined && !isNaN(ia3) && String(ia3).trim() !== '') {
    scores.push(Math.max(0, Math.min(50, Number(ia3))));
  }

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
 * Analyzes a single subject's performance metrics
 */
export function analyzeSubject(subject: Subject): SubjectAnalysis {
  const cIA1 = convertIAMarks(subject.ia1, subject.ia1Absent);
  const cIA2 = convertIAMarks(subject.ia2, subject.ia2Absent);
  const cIA3 = convertIAMarks(subject.ia3, subject.ia3Absent);
  const assignmentTotal = calculateAssignmentTotal(
    subject.assignment1,
    subject.assignment2,
    subject.assignment3
  );

  const conducted = typeof subject.periodsConducted === 'number' && !isNaN(subject.periodsConducted) ? subject.periodsConducted : 0;
  const attended = typeof subject.periodsAttended === 'number' && !isNaN(subject.periodsAttended) ? subject.periodsAttended : 0;

  const att = calculateAttendancePercentage(conducted, attended);
  const attendancePct = att.percentage;
  const isAttendanceRisk = conducted > 0 ? att.isRisk : false;
  const iaTrend = analyzeIATrend(
    subject.ia1,
    subject.ia2,
    subject.ia3,
    subject.ia1Absent,
    subject.ia2Absent,
    subject.ia3Absent
  );

  // Subject Score Calculation:
  // Component 1: Internal mark (weight: 55%). Use consolidatedInternal if available, else average of evaluated IAs
  let internalMark = subject.consolidatedInternal;
  if (internalMark === null || internalMark === undefined || isNaN(internalMark)) {
    internalMark = calculateConsolidatedMark(
      subject.ia1,
      subject.ia2,
      subject.ia3,
      subject.ia1Absent,
      subject.ia2Absent,
      subject.ia3Absent
    );
  }
  // If no values entered, consider as 0
  const effectiveInternal = internalMark !== null && !isNaN(internalMark) ? internalMark : 0;

  // Component 2: Assignment performance (weight: 20%). Assignment total / 15 converted to / 100
  const assignmentScore100 = (assignmentTotal / 15) * 100;

  // Component 3: Attendance performance (weight: 20%)
  const attendanceScore100 = conducted > 0 ? Math.min(100, attendancePct) : 0;

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
    rawIA1: subject.ia1Absent ? null : subject.ia1,
    rawIA2: subject.ia2Absent ? null : subject.ia2,
    rawIA3: subject.ia3Absent ? null : subject.ia3,
    ia1Absent: subject.ia1Absent,
    ia2Absent: subject.ia2Absent,
    ia3Absent: subject.ia3Absent,
    convertedIA1: cIA1,
    convertedIA2: cIA2,
    convertedIA3: cIA3,
    consolidatedInternal: subject.consolidatedInternal,
    assignmentTotal,
    attendancePct,
    isAttendanceRisk,
    subjectScore,
    iaTrend,
    periodsConducted: conducted,
    periodsAttended: attended,
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
