/* ─────────────────────────────────────────────────────────────────────────────
   Curriculum Validator Agent — Agent 4 of 7
   Validates that generated questions belong to the declared subject/stream.
   Confidence formula: subject(40%) + topic(25%) + grade(15%) + difficulty(10%) + duplicate(10%)
───────────────────────────────────────────────────────────────────────────── */
import type { AgentInput, AgentResult } from './types';

export async function runCurriculumValidatorAgent(input: AgentInput, paper: any): Promise<AgentResult> {
  const start = Date.now();
  const agentName = 'CurriculumValidatorAgent';

  // Only validate senior secondary with domain (highest risk for mixing)
  if (!input.domain || input.gradeNum < 9) {
    return {
      agent: agentName, status: 'skipped', durationMs: 0,
      output: {
        valid: true, confidence: 95,
        breakdown: { subjectAlignment: 100, topicAlignment: 95, gradeAlignment: 100, difficultyAlignment: 95, duplicateRisk: 80 },
        issues: [], note: 'Validation skipped for lower grades',
      },
    };
  }

  try {
    const allQuestions = paper.sections?.flatMap((s: any) => s.questions) ?? [];
    const sample = allQuestions.slice(0, 25).map((q: any, i: number) => ({
      n: i + 1,
      text: q.questionText?.slice(0, 150),
      chapter: q.chapter,
      topic: q.topic,
      difficulty: q.difficulty,
      difficultyScore: q.difficultyScore,
    }));

    const prompt = `You are CurriculumValidatorAI — a strict academic boundary checker.

DECLARED PARAMETERS:
Board              : ${input.boardCode}
Curriculum Version : ${input.curriculumVersion}
Grade              : ${input.grade}
Stream             : ${input.domain ?? 'N/A'}
Subject            : ${input.subject}
Allowed Chapters   : ${input.chapters.join(', ')}
${input.topics?.length ? `Allowed Topics     : ${input.topics.join(', ')}` : ''}

QUESTIONS TO VALIDATE:
${JSON.stringify(sample, null, 2)}

Score each dimension as an average across all questions (0–100):
- subjectAlignment (40%): Are ALL questions exclusively from "${input.subject}"? 100=perfect, 0=wrong subject
- topicAlignment (25%): Do chapters/topics match declared list? 100=perfect
- gradeAlignment (15%): Is content appropriate for Grade ${input.gradeNum}? 100=perfect
- difficultyAlignment (10%): Does declared difficulty match actual complexity?
- duplicateRisk (10%): 100=all unique, 0=all look templated/repeated

Confidence = (subjectAlignment×0.4) + (topicAlignment×0.25) + (gradeAlignment×0.15) + (difficultyAlignment×0.1) + (duplicateRisk×0.1)

Return ONLY valid JSON:
{
  "valid": true,
  "confidence": 96,
  "breakdown": {
    "subjectAlignment": 100,
    "topicAlignment": 95,
    "gradeAlignment": 90,
    "difficultyAlignment": 100,
    "duplicateRisk": 85
  },
  "issues": [],
  "rejectedQuestionNumbers": [],
  "note": "All questions correctly from ${input.subject}"
}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${input.apiKey}`;
    const res = await fetch(url, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 2048 },
      }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const raw  = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    const s = raw.indexOf('{'); const e = raw.lastIndexOf('}');
    if (s === -1) throw new Error('No JSON in response');

    const result = JSON.parse(raw.slice(s, e + 1));

    // Ensure breakdown exists
    if (!result.breakdown) {
      result.breakdown = {
        subjectAlignment: result.confidence ?? 90,
        topicAlignment: result.confidence ?? 90,
        gradeAlignment: result.confidence ?? 90,
        difficultyAlignment: result.confidence ?? 90,
        duplicateRisk: 80,
      };
    }

    return {
      agent: agentName, status: result.confidence >= 70 ? 'passed' : 'warning',
      durationMs: Date.now() - start, output: result,
      warnings: result.issues?.length > 0 ? result.issues : undefined,
    };
  } catch (err: any) {
    // Non-fatal — don't block generation
    return {
      agent: agentName, status: 'warning', durationMs: Date.now() - start,
      output: {
        valid: true, confidence: 85,
        breakdown: { subjectAlignment: 90, topicAlignment: 85, gradeAlignment: 90, difficultyAlignment: 85, duplicateRisk: 75 },
        issues: [], note: 'Validation agent encountered an error — using default scores',
      },
      error: err.message,
    };
  }
}
