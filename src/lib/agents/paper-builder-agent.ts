/* ─────────────────────────────────────────────────────────────────────────────
   Paper Builder Agent — Agent 7 of 7
   Assembles the final paper, injects tenantId/schoolId/fingerprints into
   every question, calculates totals, and applies post-processing.
───────────────────────────────────────────────────────────────────────────── */
import type { AgentInput, AgentResult } from './types';
import { generateQuestionFingerprint } from '@/lib/question-fingerprint';

export function runPaperBuilderAgent(input: AgentInput, paper: any): AgentResult {
  const start = Date.now();
  const agentName = 'PaperBuilderAgent';

  try {
    if (!paper || !paper.sections) {
      return { agent: agentName, status: 'failed', durationMs: 0, error: 'No paper to build' };
    }

    // Inject tenant context + fingerprints + ensure metadata consistency
    let globalQNo = 0;
    let calculatedTotalMarks = 0;

    for (const section of paper.sections) {
      for (const q of section.questions ?? []) {
        globalQNo++;
        q.qNo = globalQNo;

        // Ensure fingerprint
        if (!q.questionFingerprint && q.questionText) {
          q.questionFingerprint = generateQuestionFingerprint(q.questionText);
        }

        // Ensure required metadata fields
        q.sourceType = q.sourceType || 'AI_GENERATED';
        q.status     = q.status     || 'draft';
        q.tags       = q.tags       || [];
        q.answerSteps = q.answerSteps || [];
        q.learningOutcomeIds = q.learningOutcomeIds || [];

        // Normalise difficulty score
        if (q.difficultyScore === undefined || q.difficultyScore === null) {
          q.difficultyScore = q.difficulty === 'Easy' ? 20
            : q.difficulty === 'Medium' ? 50
            : q.difficulty === 'Hard' ? 75
            : 50;
        }

        // Inject tenant/school context
        q.tenantId = input.tenantId;
        q.schoolId = input.schoolId;
        q.boardCode = input.boardCode;
        q.curriculumVersion = input.curriculumVersion;
        q.subjectId = input.subjectId;

        calculatedTotalMarks += (q.maxMarks ?? 0);
      }
    }

    // Inject tenant metadata into paper
    paper.metadata = {
      ...paper.metadata,
      tenantId:          input.tenantId,
      schoolId:          input.schoolId,
      boardCode:         input.boardCode,
      curriculumVersion: input.curriculumVersion,
      calculatedMarks:   calculatedTotalMarks,
    };

    // Warnings
    const warnings: string[] = [];
    const declaredMarks = paper.metadata.totalMarks ?? input.totalMarks;
    if (calculatedTotalMarks !== declaredMarks) {
      warnings.push(`Marks mismatch: declared=${declaredMarks}, calculated=${calculatedTotalMarks}`);
    }
    if (globalQNo < (input.numQuestions * 0.7)) {
      warnings.push(`Too few questions: expected ~${input.numQuestions}, got ${globalQNo}`);
    }

    return {
      agent: agentName,
      status: warnings.length === 0 ? 'passed' : 'warning',
      durationMs: Date.now() - start,
      output: {
        totalQuestions: globalQNo,
        calculatedMarks: calculatedTotalMarks,
        sectionCount: paper.sections.length,
      },
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  } catch (err: any) {
    return { agent: agentName, status: 'failed', durationMs: Date.now() - start, error: err.message };
  }
}
