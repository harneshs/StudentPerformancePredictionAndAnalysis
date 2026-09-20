import { Student, StudentPerformance, ChatMessage } from '../types';
import { storageService } from './storageService';

export interface AIAnalysisResult {
  content: string;
  source: 'gemini' | 'rule-based-engine';
  disclaimer: string;
}

const ACADEMIC_DISCLAIMER =
  'Notice: AI suggestions are academic risk indicators and pedagogical guidance based on available institutional data, not guaranteed pass/fail predictions.';

/**
 * Format student academic summary for Gemini prompt
 */
function createAcademicSummaryPrompt(
  student: Student,
  performance: StudentPerformance
): string {
  const subjectLines = performance.subjectAnalyses
    .map(
      (s) =>
        `- ${s.subjectName} (${s.subjectCode || 'N/A'}): IA1=${s.convertedIA1 ?? 'N/A'}/100, IA2=${s.convertedIA2 ?? 'N/A'}/100, IA3=${s.convertedIA3 ?? 'N/A'}/100, IA-Trend=${s.iaTrend}, Consolidated=${s.consolidatedInternal ?? 'N/A'}/100, Assignments=${s.assignmentTotal}/15, Attendance=${s.attendancePct}% (${s.periodsAttended}/${s.periodsConducted} periods, ${s.isAttendanceRisk ? 'RISK (<75%)' : 'Eligible'}), Subject Score=${s.subjectScore}/100`
    )
    .join('\n');

  return `STUDENT ACADEMIC PROFILE:
- Name: ${student.name} (Reg No: ${student.registerNo})
- Department: ${student.department} | Year: ${student.year} | Sem: ${student.semester} | Sec: ${student.section}
- Overall Academic Score: ${performance.overallScore}/100
- Performance Classification: ${performance.performanceLevel}
- Overall Attendance: ${performance.overallAttendancePct}% (${performance.hasAttendanceRisk ? 'ATTENDANCE RISK DETECTED' : 'Compliant'})
- Overall IA Momentum/Trend: ${performance.overallIATrend}
- Strongest Subjects: ${performance.strongestSubjects.length ? performance.strongestSubjects.join(', ') : 'None identified'}
- Weakest Subjects: ${performance.weakestSubjects.length ? performance.weakestSubjects.join(', ') : 'None identified'}
- Subjects with Declining Trend: ${performance.decliningSubjects.length ? performance.decliningSubjects.join(', ') : 'None'}
- Subjects with Attendance < 75%: ${performance.lowAttendanceSubjects.length ? performance.lowAttendanceSubjects.join(', ') : 'None'}
- Identified Risk Factors: ${performance.riskFactors.join('; ')}

SUBJECT-BY-SUBJECT METRICS:
${subjectLines}
`;
}

/**
 * Rule-based fallback performance insights generator
 */
function generateLocalPerformanceInsights(
  student: Student,
  performance: StudentPerformance
): string {
  const lines: string[] = [];
  lines.push(
    `### Academic Performance Analysis for ${student.name} (${student.registerNo})`
  );
  lines.push(
    `**Current Classification**: **${performance.performanceLevel}** (Overall Score: **${performance.overallScore}/100**)`
  );
  lines.push('');

  // Performance breakdown
  if (performance.performanceLevel === 'Excellent') {
    lines.push(
      `The student exhibits high academic mastery across subjects, demonstrating disciplined internal assessment preparation and strong submission consistency. Overall attendance stands at an exemplary **${performance.overallAttendancePct}%**.`
    );
  } else if (performance.performanceLevel === 'Good') {
    lines.push(
      `The student maintains reliable foundational comprehension with steady marks across most coursework. There is a viable pathway to the Excellent tier by refining specific low-scoring internal topics.`
    );
  } else if (performance.performanceLevel === 'Average') {
    lines.push(
      `The student currently functions within the moderate performance bracket. While fundamental competencies are evident, variance in IA marks (${performance.overallIATrend} trend) and assignment diligence indicate potential conceptual gaps or uneven study pacing.`
    );
  } else if (performance.performanceLevel === 'At Risk') {
    lines.push(
      `⚠️ **Academic Intervention Needed**: The student has accumulated performance deficits in core examinations and/or attendance thresholds. Prompt faculty advisory is advised.`
    );
  } else {
    lines.push(
      `🚨 **Critical Academic Alert**: Severe aggregate score deficits combined with attendance or multi-subject failures necessitate immediate remedial coaching and guardian notification.`
    );
  }

  lines.push('');
  lines.push('#### Key Observations:');
  if (performance.strongestSubjects.length > 0) {
    lines.push(`- **Core Strengths**: ${performance.strongestSubjects.join(', ')}.`);
  }
  if (performance.weakestSubjects.length > 0) {
    lines.push(`- **Priority Attention Areas**: ${performance.weakestSubjects.join(', ')}.`);
  }
  if (performance.decliningSubjects.length > 0) {
    lines.push(`- **Declining Trends**: Negative IA slope detected in ${performance.decliningSubjects.join(', ')}.`);
  }
  if (performance.lowAttendanceSubjects.length > 0) {
    lines.push(
      `- **Attendance Shortfall (<75%)**: High risk in ${performance.lowAttendanceSubjects.join(', ')}. Institutional hall ticket eligibility may be jeopardized.`
    );
  }

  return lines.join('\n');
}

/**
 * Rule-based personalized recommendations
 */
function generateLocalPersonalizedSuggestions(
  _student: Student,
  performance: StudentPerformance
): string {
  const suggestions: string[] = [];
  suggestions.push('### Targeted Action Plan & Pedagogical Interventions');

  if (performance.weakestSubjects.length > 0) {
    suggestions.push(`1. **Targeted Remedial Modules in ${performance.weakestSubjects.join(', ')}**:`);
    suggestions.push(
      `   - Conduct bi-weekly problem-solving doubt-clearing clinics focusing on foundational numerical and theoretical concepts.`
    );
    suggestions.push(
      `   - Assign calibrated practice question banks before the next scheduled assessment.`
    );
  } else {
    suggestions.push(`1. **Advanced Enrichment & Practical Application**:`);
    suggestions.push(
      `   - Channel strong subject foundations into peer tutoring, project-based capstones, or technical paper submissions.`
    );
  }

  if (performance.decliningSubjects.length > 0) {
    suggestions.push(`2. **Trend Reversal Strategy for ${performance.decliningSubjects.join(', ')}**:`);
    suggestions.push(
      `   - Review IA answer scripts with the student to identify whether loss of marks stems from time management, syntax errors, or conceptual misunderstandings.`
    );
    suggestions.push(
      `   - Establish a 15-minute weekly check-in with the course handling staff.`
    );
  }

  if (performance.lowAttendanceSubjects.length > 0) {
    suggestions.push(`3. **Attendance Recovery & Compensation**:`);
    suggestions.push(
      `   - Schedule make-up tutorial periods or technical seminar presentations to satisfy statutory attendance percentage requirements.`
    );
    suggestions.push(
      `   - Issue formal attendance advisory notice to mitigate end-semester hall ticket condonation risk.`
    );
  } else {
    suggestions.push(`3. **Attendance Discipline**:`);
    suggestions.push(
      `   - Maintain the positive classroom engagement level (${performance.overallAttendancePct}%).`
    );
  }

  suggestions.push(`4. **Assignment Dues & Formative Continuous Assessment**:`);
  if (performance.strongAssignmentSubjects.length > 0) {
    suggestions.push(
      `   - Continue the consistent submission rigor observed in ${performance.strongAssignmentSubjects.join(', ')}.`
    );
  } else {
    suggestions.push(
      `   - Emphasize submission deadlines and thorough rubrics for formative assignments to capture full continuous assessment marks (15/15).`
    );
  }

  return suggestions.join('\n');
}

/**
 * Rule-based risk explanation
 */
function generateLocalRiskExplanation(
  _student: Student,
  performance: StudentPerformance
): string {
  return `### Comprehensive Risk Classification Assessment

**Classification Result**: **${performance.performanceLevel}** (Score: ${performance.overallScore}/100)

**Underlying Institutional Evaluation Criteria:**
${performance.riskFactors.map((r, i) => `${i + 1}. ${r}`).join('\n')}

**Evaluation Weighting Breakdown:**
- **Consolidated & Internal Assessments (55%)**: Reflects examination performance across ${performance.subjectAnalyses.length} dynamic courses.
- **Formative Assignment Rigor (20%)**: Evaluates continuous submission quality out of 15 marks per course.
- **Classroom Attendance Compliance (20%)**: Enforces regulatory minimums (>=75% requirement).
- **IA Trend Slope (5%)**: Captures student momentum between IA1, IA2, and IA3.`;
}

/**
 * Rule-based comprehensive report generator
 */
function generateLocalReportSummary(
  student: Student,
  performance: StudentPerformance
): string {
  return `# ACADEMIC PERFORMANCE EVALUATION REPORT
**Institution**: Department of ${student.department}
**Academic Year**: ${student.academicYear} | **Semester**: ${student.semester} (Sec ${student.section})
**Student**: ${student.name} | **Register No**: ${student.registerNo}
--------------------------------------------------------------------------------

### 1. Executive Academic Summary
The student has completed internal assessments and continuous evaluations across ${student.subjects.length} registered subjects. The overall cumulative performance index is **${performance.overallScore}/100**, placing the student in the **${performance.performanceLevel}** academic performance bracket with an aggregate attendance of **${performance.overallAttendancePct}%**.

### 2. Subject Evaluation Matrix
${performance.subjectAnalyses
  .map(
    (s) =>
      `• **${s.subjectName}** [${s.subjectCode || 'N/A'}]
   - IA Marks: IA1: ${s.convertedIA1 ?? 'N/A'}% | IA2: ${s.convertedIA2 ?? 'N/A'}% | IA3: ${s.convertedIA3 ?? 'N/A'}% (Trend: ${s.iaTrend})
   - Consolidated Internal: ${s.consolidatedInternal ?? 'N/A'}/100 | Assignments: ${s.assignmentTotal}/15
   - Attendance: ${s.attendancePct}% (${s.periodsAttended}/${s.periodsConducted} periods) - ${s.isAttendanceRisk ? '⚠️ ATTENDANCE SHORTAGE' : 'Eligible'}
   - Computed Course Index: ${s.subjectScore}/100`
  )
  .join('\n\n')}

### 3. Faculty Recommendation & Academic Action Plan
- **Primary Strengths**: ${performance.strongestSubjects.join(', ') || 'Consistent moderate capability across registered subjects.'}
- **Subjects Needing Mentorship**: ${performance.weakestSubjects.join(', ') || 'No immediate deficit courses.'}
- **Mandatory Attendance Follow-up**: ${performance.lowAttendanceSubjects.join(', ') || 'All subjects satisfy regulatory minimums (>=75%).'}

*Generated via AI-Assisted Academic Performance Analysis Engine.*`;
}

/**
 * Rule-based chat answer for local queries
 */
function answerChatLocally(
  question: string,
  student: Student,
  performance: StudentPerformance
): string {
  const q = question.toLowerCase();

  if (q.includes('risk') || q.includes('why') && q.includes('risk')) {
    return `**Academic Risk Analysis for ${student.name}:**
Current Level: **${performance.performanceLevel}** (Score: ${performance.overallScore}/100).
Identified Risk Factors:
${performance.riskFactors.map((r) => `• ${r}`).join('\n')}
${
  performance.lowAttendanceSubjects.length > 0
    ? `\nAttendance Shortage Alert (<75%): ${performance.lowAttendanceSubjects.join(', ')}`
    : ''
}`;
  }

  if (q.includes('weak') || q.includes('lowest') || q.includes('struggl')) {
    if (performance.weakestSubjects.length > 0) {
      return `**Weakest Subjects for ${student.name}:**
The lowest performing courses (<60% score) are:
${performance.subjectAnalyses
  .filter((s) => s.subjectScore < 60)
  .map(
    (s) =>
      `• **${s.subjectName}**: Score ${s.subjectScore}/100 (IA Trend: ${s.iaTrend}, Attendance: ${s.attendancePct}%, Internal: ${s.consolidatedInternal ?? 'N/A'})`
  )
  .join('\n')}`;
    }
    return `${student.name} does not have any subjects scoring below 60%. The relatively lowest scoring subject is ${performance.subjectAnalyses[performance.subjectAnalyses.length - 1]?.subjectName || 'None'}.`;
  }

  if (q.includes('strong') || q.includes('best') || q.includes('highest')) {
    if (performance.strongestSubjects.length > 0) {
      return `**Strongest Subjects for ${student.name}:**
${performance.subjectAnalyses
  .filter((s) => s.subjectScore >= 70)
  .map(
    (s) =>
      `• **${s.subjectName}**: Score ${s.subjectScore}/100 (Attendance: ${s.attendancePct}%, Assignment Total: ${s.assignmentTotal}/15)`
  )
  .join('\n')}`;
    }
    return `The highest scoring subject for ${student.name} is ${performance.subjectAnalyses[0]?.subjectName || 'None'} with a score of ${performance.subjectAnalyses[0]?.subjectScore || 0}/100.`;
  }

  if (q.includes('declining') || q.includes('trend')) {
    if (performance.decliningSubjects.length > 0) {
      return `**Declining Performance Trend Alert:**
The following courses show downward performance progression across IA1 -> IA2 -> IA3:
${performance.subjectAnalyses
  .filter((s) => s.iaTrend === 'Declining')
  .map(
    (s) =>
      `• **${s.subjectName}**: IA1=${s.convertedIA1 ?? 'N/A'}% → IA2=${s.convertedIA2 ?? 'N/A'}% → IA3=${s.convertedIA3 ?? 'N/A'}% (Current Score: ${s.subjectScore}/100)`
  )
  .join('\n')}`;
    }
    return `Overall IA Trend for ${student.name} is **${performance.overallIATrend}**. No critical negative slope detected across continuous assessment exams.`;
  }

  if (q.includes('attend') || q.includes('75') || q.includes('period')) {
    return `**Attendance Summary for ${student.name}:**
Overall Attendance: **${performance.overallAttendancePct}%** (${performance.hasAttendanceRisk ? '⚠️ ATTENDANCE DEFICIT' : 'Compliant'}).
${
  performance.lowAttendanceSubjects.length > 0
    ? `Subjects with <75% attendance:\n${performance.subjectAnalyses
        .filter((s) => s.isAttendanceRisk)
        .map((s) => `• ${s.subjectName}: ${s.attendancePct}% (${s.periodsAttended}/${s.periodsConducted} periods)`)
        .join('\n')}`
    : 'All enrolled subjects have 75% or higher attendance.'
}`;
  }

  if (q.includes('improve') || q.includes('recommend') || q.includes('action') || q.includes('plan')) {
    return generateLocalPersonalizedSuggestions(student, performance);
  }

  if (q.includes('summar') || q.includes('overview') || q.includes('profile')) {
    return generateLocalPerformanceInsights(student, performance);
  }

  // Default response
  return `**Academic Profile Overview for ${student.name} (${student.registerNo}):**
• Overall Performance Index: **${performance.overallScore}/100** (${performance.performanceLevel})
• Overall Attendance: **${performance.overallAttendancePct}%**
• Number of Registered Courses: **${student.subjects.length}**
• Identified Primary Strengths: ${performance.strongestSubjects.join(', ') || 'None'}
• Subjects Needing Mentorship: ${performance.weakestSubjects.join(', ') || 'None'}
• IA Performance Momentum: **${performance.overallIATrend}**

You can ask me specific questions regarding risk factors, weakest subjects, attendance compliance, or customized academic improvement plans.`;
}

export const aiService = {
  /**
   * Request AI Performance Insights
   */
  async getPerformanceInsights(
    student: Student,
    performance: StudentPerformance
  ): Promise<AIAnalysisResult> {
    const settings = storageService.getSettings();
    const prompt = `Provide an objective and clear Academic Performance Insight for this student based on their institutional marks, IA trend, and attendance:\n\n${createAcademicSummaryPrompt(
      student,
      performance
    )}`;

    try {
      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          customKey: settings.customApiKey || undefined,
          systemInstruction:
            'You are a senior academic advisor. Provide a concise, professional analysis of the student\'s performance, highlighting strengths, weaknesses, and key trends. Present this as academic guidance, not guaranteed predictions.',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.text) {
          return {
            content: data.text,
            source: 'gemini',
            disclaimer: ACADEMIC_DISCLAIMER,
          };
        }
      }
    } catch (err) {
      console.warn('Gemini API call failed, using intelligent rule engine:', err);
    }

    // Fallback to local rule engine
    return {
      content: generateLocalPerformanceInsights(student, performance),
      source: 'rule-based-engine',
      disclaimer: ACADEMIC_DISCLAIMER,
    };
  },

  /**
   * Request Personalized Suggestions
   */
  async getPersonalizedSuggestions(
    student: Student,
    performance: StudentPerformance
  ): Promise<AIAnalysisResult> {
    const settings = storageService.getSettings();
    const prompt = `Generate tailored, actionable academic recommendations and pedagogical intervention steps for staff to support this student. Do NOT give generic advice like 'study harder'. Focus on their specific weak subjects, IA trend, assignment performance, and attendance:\n\n${createAcademicSummaryPrompt(
      student,
      performance
    )}`;

    try {
      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          customKey: settings.customApiKey || undefined,
          systemInstruction:
            'You are a college academic counselor. Suggest specific, practical intervention steps for teachers and the student based strictly on the provided coursework numbers.',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.text) {
          return {
            content: data.text,
            source: 'gemini',
            disclaimer: ACADEMIC_DISCLAIMER,
          };
        }
      }
    } catch (err) {
      console.warn('Gemini API call failed, using intelligent rule engine:', err);
    }

    return {
      content: generateLocalPersonalizedSuggestions(student, performance),
      source: 'rule-based-engine',
      disclaimer: ACADEMIC_DISCLAIMER,
    };
  },

  /**
   * Request Risk Explanation
   */
  async getRiskExplanation(
    student: Student,
    performance: StudentPerformance
  ): Promise<AIAnalysisResult> {
    const settings = storageService.getSettings();
    const prompt = `Explain why this student is classified as '${
      performance.performanceLevel
    }' (Score: ${performance.overallScore}/100), referencing attendance, continuous assessments, and IA trend:\n\n${createAcademicSummaryPrompt(
      student,
      performance
    )}`;

    try {
      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          customKey: settings.customApiKey || undefined,
          systemInstruction:
            'You are an institutional academic analytics coordinator. Explain the mathematical and educational factors contributing to the student\'s risk tier.',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.text) {
          return {
            content: data.text,
            source: 'gemini',
            disclaimer: ACADEMIC_DISCLAIMER,
          };
        }
      }
    } catch (err) {
      console.warn('Gemini API call failed, using intelligent rule engine:', err);
    }

    return {
      content: generateLocalRiskExplanation(student, performance),
      source: 'rule-based-engine',
      disclaimer: ACADEMIC_DISCLAIMER,
    };
  },

  /**
   * Generate Full Academic Report Summary
   */
  async getStudentReport(
    student: Student,
    performance: StudentPerformance
  ): Promise<AIAnalysisResult> {
    const settings = storageService.getSettings();
    const prompt = `Generate a formal college academic evaluation report for staff records for this student:\n\n${createAcademicSummaryPrompt(
      student,
      performance
    )}`;

    try {
      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          customKey: settings.customApiKey || undefined,
          systemInstruction:
            'You are the college head of academic evaluation. Produce a formal, structured evaluation report for the department.',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.text) {
          return {
            content: data.text,
            source: 'gemini',
            disclaimer: ACADEMIC_DISCLAIMER,
          };
        }
      }
    } catch (err) {
      console.warn('Gemini API call failed, using intelligent rule engine:', err);
    }

    return {
      content: generateLocalReportSummary(student, performance),
      source: 'rule-based-engine',
      disclaimer: ACADEMIC_DISCLAIMER,
    };
  },

  /**
   * Chat with AI Academic Assistant with Student Context
   */
  async chatWithAssistant(
    message: string,
    student: Student,
    performance: StudentPerformance,
    history: ChatMessage[]
  ): Promise<AIAnalysisResult> {
    const settings = storageService.getSettings();
    const studentContext = createAcademicSummaryPrompt(student, performance);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          studentContext,
          history,
          customKey: settings.customApiKey || undefined,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.text) {
          return {
            content: data.text,
            source: 'gemini',
            disclaimer: ACADEMIC_DISCLAIMER,
          };
        }
      }
    } catch (err) {
      console.warn('Gemini Chat API call failed, using intelligent rule engine:', err);
    }

    return {
      content: answerChatLocally(message, student, performance),
      source: 'rule-based-engine',
      disclaimer: ACADEMIC_DISCLAIMER,
    };
  },
};
