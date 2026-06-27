/* ─────────────────────────────────────────────────────────────────────────────
   Answer Validator Agent — Phase 8
   Validates the generated answer for factual correctness against the curriculum.
───────────────────────────────────────────────────────────────────────────── */
import type { AgentInput, AgentResult } from './types';

export async function runAnswerValidatorAgent(input: AgentInput, paper: any): Promise<AgentResult> {
  const start = Date.now();
  const agentName = 'AnswerValidatorAgent';

  if (!input.apiKey) {
    return { agent: agentName, status: 'warning', durationMs: 0, error: 'API key missing' };
  }

  try {
    const allQuestions = paper.sections?.flatMap((s: any) => s.questions) ?? [];
    if (allQuestions.length === 0) {
      return { agent: agentName, status: 'skipped', durationMs: 0 };
    }

    // We only sample the highest-weight questions (e.g., long answers, high marks) for validation
    // to save tokens and time, or we can validate a random sample.
    const questionSample = allQuestions
      .filter((q: any) => q.maxMarks >= 3 || q.type === 'mcq')
      .slice(0, 15) // Validate up to 15 key questions
      .map((q: any) => ({
        qNo: q.qNo,
        type: q.type,
        text: q.questionText,
        answer: q.answer,
        answerSteps: q.answerSteps,
      }));

    if (questionSample.length === 0) {
      return { agent: agentName, status: 'skipped', durationMs: 0, output: { note: 'No questions matched criteria for answer validation' } };
    }

    const validationPrompt = `You are an expert AnswerValidatorAI for the ${input.boardCode} board.
Your job is to strictly evaluate the factual accuracy of the provided answers.

CONTEXT:
Board: ${input.boardCode}
Grade: ${input.grade}
Subject: ${input.subject}
Chapters: ${input.chapters.join(', ')}

QUESTIONS AND ANSWERS TO VALIDATE:
${JSON.stringify(questionSample, null, 2)}

INSTRUCTIONS:
1. For each question, verify if the "answer" (and "answerSteps") is factually 100% correct according to standard textbooks.
2. If an answer is wrong, misleading, or out-of-syllabus, record the qNo and a brief reason.
3. Output MUST be valid JSON only.

OUTPUT FORMAT:
{
  "valid": true,
  "inaccurateQuestions": [
    { "qNo": 5, "reason": "The answer states X, but according to NCERT it should be Y." }
  ],
  "overallAnswerAccuracy": 95
}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${input.apiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: validationPrompt }] }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 2048 },
      }),
    });

    if (!res.ok) {
      return { agent: agentName, status: 'warning', durationMs: Date.now() - start, error: 'Answer validation request failed' };
    }

    const data = await res.json();
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    const jsonStart = raw.indexOf('{');
    const jsonEnd = raw.lastIndexOf('}');
    
    if (jsonStart === -1 || jsonEnd === -1) {
      return { agent: agentName, status: 'warning', durationMs: Date.now() - start, error: 'Invalid JSON from validator' };
    }

    const result = JSON.parse(raw.slice(jsonStart, jsonEnd + 1));
    const issues: string[] = [];

    if (result.inaccurateQuestions && result.inaccurateQuestions.length > 0) {
      for (const iq of result.inaccurateQuestions) {
        issues.push(`Q${iq.qNo} Answer Error: ${iq.reason}`);
      }
    }

    return {
      agent: agentName,
      status: issues.length > 0 ? 'warning' : 'passed',
      durationMs: Date.now() - start,
      output: {
        accuracyScore: result.overallAnswerAccuracy ?? 100,
        inaccurateCount: result.inaccurateQuestions?.length ?? 0,
        issues,
      },
      warnings: issues.length > 0 ? issues : undefined,
    };
  } catch (err: any) {
    return { agent: agentName, status: 'warning', durationMs: Date.now() - start, error: err.message };
  }
}
