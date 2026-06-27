/* ─────────────────────────────────────────────────────────────────────────────
   Duplicate Checker Agent — Agent 6 of 7
   Checks generated questions against the existing question bank for duplicates.
───────────────────────────────────────────────────────────────────────────── */
import type { AgentInput, AgentResult } from './types';
import { generateQuestionFingerprint, computeSimilarityScore } from '@/lib/question-fingerprint';
import { getDb } from '@/lib/mongodb';

export async function runDuplicateCheckerAgent(input: AgentInput, paper: any): Promise<AgentResult> {
  const start = Date.now();
  const agentName = 'DuplicateCheckerAgent';

  try {
    const allQuestions = paper.sections?.flatMap((s: any) => s.questions) ?? [];
    if (allQuestions.length === 0) {
      return { agent: agentName, status: 'skipped', durationMs: 0, output: { duplicatesFound: 0 } };
    }

    const db = await getDb();
    const questionsCol = db.collection('questions');

    // Load recent questions from the same subject for this tenant
    const existing = await questionsCol
      .find({
        tenantId: input.tenantId,
        subjectId: input.subjectId,
      })
      .sort({ createdAt: -1 })
      .limit(500)
      .project({ questionId: 1, questionText: 1, questionFingerprint: 1 })
      .toArray();

    if (existing.length === 0) {
      return {
        agent: agentName, status: 'passed', durationMs: Date.now() - start,
        output: { duplicatesFound: 0, checkedAgainst: 0, note: 'No existing questions in bank' },
      };
    }

    const existingFingerprints = new Map<string, string>();
    for (const eq of existing) {
      if (eq.questionFingerprint) existingFingerprints.set(eq.questionFingerprint, eq.questionId);
    }

    let exactDuplicates = 0;
    let nearDuplicates = 0;
    const duplicateDetails: Array<{ qNo: number; existingId: string; score: number }> = [];

    for (const q of allQuestions) {
      const fp = generateQuestionFingerprint(q.questionText ?? '');

      // Exact match
      if (existingFingerprints.has(fp)) {
        exactDuplicates++;
        duplicateDetails.push({ qNo: q.qNo, existingId: existingFingerprints.get(fp)!, score: 100 });
        continue;
      }

      // Near-match — only check top 100 for performance
      for (const eq of existing.slice(0, 100)) {
        const sim = computeSimilarityScore(q.questionText ?? '', eq.questionText ?? '');
        if (sim >= 80) {
          nearDuplicates++;
          duplicateDetails.push({ qNo: q.qNo, existingId: eq.questionId, score: sim });
          break;
        }
      }
    }

    const totalDuplicates = exactDuplicates + nearDuplicates;
    const status = totalDuplicates === 0 ? 'passed'
      : totalDuplicates <= 3 ? 'warning'
      : 'failed';

    const issues: string[] = [];
    if (exactDuplicates > 0) issues.push(`${exactDuplicates} exact duplicate(s) found in question bank`);
    if (nearDuplicates > 0)  issues.push(`${nearDuplicates} near-duplicate(s) found (≥80% similarity)`);

    return {
      agent: agentName,
      status,
      durationMs: Date.now() - start,
      output: {
        duplicatesFound: totalDuplicates,
        exactDuplicates,
        nearDuplicates,
        checkedAgainst: existing.length,
        details: duplicateDetails.slice(0, 10),
      },
      warnings: issues.length > 0 ? issues : undefined,
    };
  } catch (err: any) {
    // Non-fatal
    return {
      agent: agentName, status: 'warning', durationMs: Date.now() - start,
      output: { duplicatesFound: 0, note: 'Duplicate check failed — proceeding' },
      error: err.message,
    };
  }
}
