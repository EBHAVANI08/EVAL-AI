/* ─────────────────────────────────────────────────────────────────────────────
   Difficulty Validator Agent — Agent 5 of 7
   Checks that declared difficultyScore values are calibrated correctly.
───────────────────────────────────────────────────────────────────────────── */
import type { AgentInput, AgentResult } from './types';

export async function runDifficultyValidatorAgent(input: AgentInput, paper: any): Promise<AgentResult> {
  const start = Date.now();
  const agentName = 'DifficultyValidatorAgent';

  try {
    const allQuestions = paper.sections?.flatMap((s: any) => s.questions) ?? [];

    // Local validation — no API call needed
    const issues: string[] = [];
    let wrongScoreCount = 0;
    let missingScoreCount = 0;

    for (const q of allQuestions) {
      if (q.difficultyScore === undefined || q.difficultyScore === null) {
        missingScoreCount++;
        continue;
      }
      const label  = q.difficulty?.toLowerCase();
      const score  = q.difficultyScore as number;
      const valid  = (label === 'easy' && score >= 1 && score <= 35)
                  || (label === 'medium' && score >= 36 && score <= 65)
                  || (label === 'hard' && score >= 66 && score <= 100);
      if (!valid) {
        wrongScoreCount++;
        issues.push(`Q${q.qNo}: difficulty="${q.difficulty}" but score=${score} is out of range`);
      }
    }

    // Count distribution
    const easy   = allQuestions.filter((q: any) => q.difficulty === 'Easy').length;
    const medium = allQuestions.filter((q: any) => q.difficulty === 'Medium').length;
    const hard   = allQuestions.filter((q: any) => q.difficulty === 'Hard').length;
    const total  = allQuestions.length;

    const easyPct   = total > 0 ? Math.round((easy / total) * 100)   : 0;
    const mediumPct = total > 0 ? Math.round((medium / total) * 100) : 0;
    const hardPct   = total > 0 ? Math.round((hard / total) * 100)   : 0;

    // Check if declared difficulty matches distribution
    const declaredDifficulty = input.difficulty?.toLowerCase();
    if (declaredDifficulty === 'mixed') {
      if (easyPct > 50)   issues.push(`Too many Easy questions (${easyPct}%) for Mixed difficulty`);
      if (hardPct > 40)   issues.push(`Too many Hard questions (${hardPct}%) for Mixed difficulty`);
    } else if (declaredDifficulty === 'easy' && hardPct > 20) {
      issues.push(`Found ${hardPct}% Hard questions in an Easy paper`);
    } else if (declaredDifficulty === 'hard' && easyPct > 30) {
      issues.push(`Found ${easyPct}% Easy questions in a Hard paper`);
    }

    const passed = issues.length === 0 && wrongScoreCount === 0;

    return {
      agent: agentName,
      status: passed ? 'passed' : 'warning',
      durationMs: Date.now() - start,
      output: {
        distribution: { easy, medium, hard, easyPct, mediumPct, hardPct },
        wrongScoreCount,
        missingScoreCount,
        issues,
      },
      warnings: issues.length > 0 ? issues : undefined,
    };
  } catch (err: any) {
    return { agent: agentName, status: 'warning', durationMs: Date.now() - start, error: err.message };
  }
}
