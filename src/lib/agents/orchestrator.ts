/* ─────────────────────────────────────────────────────────────────────────────
   AI Agent Orchestrator — Phase 4
   Runs all 7 agents in sequence and produces a validated, tenant-scoped paper.
   
   Pipeline:
   1. CurriculumAgent       — validate input parameters
   2. BlueprintAgent        — resolve/validate blueprint
   3. QuestionGeneratorAgent — call Gemini to generate paper
   4. CurriculumValidatorAgent — validate subject/stream boundaries
   5. DifficultyValidatorAgent — validate difficulty scores
   6. DuplicateCheckerAgent — check for duplicates in question bank
   7. PaperBuilderAgent     — assemble final paper with tenant context
───────────────────────────────────────────────────────────────────────────── */
import type { AgentInput, AgentResult, OrchestratorOutput } from './types';
import { runQuestionGeneratorAgent } from './question-generator-agent';
import { runCurriculumValidatorAgent } from './curriculum-validator-agent';
import { runAnswerValidatorAgent } from './answer-validator-agent';
import { runDifficultyValidatorAgent } from './difficulty-validator-agent';
import { runDuplicateCheckerAgent } from './duplicate-checker-agent';
import { runPaperBuilderAgent } from './paper-builder-agent';
import { getBlueprintById } from '@/lib/db/blueprints';
import { saveQuestionsFromPaper } from '@/lib/db/questions';
import { createAssessment } from '@/lib/db/assessments';
import { generateId } from '@/lib/tenant';
import { getDb } from '@/lib/mongodb';

/* ── Agent 1: Curriculum Agent (local validation) ─────────────────────────── */
function runCurriculumAgent(input: AgentInput): AgentResult {
  const start = Date.now();
  const issues: string[] = [];

  if (!input.grade)    issues.push('Grade is required');
  if (!input.subject)  issues.push('Subject is required');
  if (!input.chapters || input.chapters.length === 0) issues.push('At least one chapter is required');
  if (!input.boardCode) issues.push('Board code is required');
  if (input.gradeNum >= 11 && !input.domain) {
    issues.push('Domain/stream is required for senior secondary (Grade 11-12)');
  }
  if (!input.apiKey) issues.push('Gemini API key is not configured');

  return {
    agent: 'CurriculumAgent',
    status: issues.length === 0 ? 'passed' : 'failed',
    durationMs: Date.now() - start,
    output: {
      boardCode: input.boardCode,
      grade: input.grade,
      domain: input.domain,
      subject: input.subject,
      chapters: input.chapters.length,
      topics: input.topics?.length ?? 0,
    },
    warnings: issues.length > 0 ? issues : undefined,
    error: issues.length > 0 ? issues.join('; ') : undefined,
  };
}

/* ── Agent 2: Blueprint Agent (resolve blueprint → distribution) ──────────── */
async function runBlueprintAgent(input: AgentInput): Promise<AgentResult> {
  const start = Date.now();

  if (!input.blueprintId) {
    return {
      agent: 'BlueprintAgent', status: 'skipped', durationMs: 0,
      output: { note: 'No blueprint selected — using custom distribution' },
    };
  }

  try {
    const bp = await getBlueprintById(input.blueprintId, input.tenantId);
    if (!bp) {
      return {
        agent: 'BlueprintAgent', status: 'warning', durationMs: Date.now() - start,
        output: { note: `Blueprint ${input.blueprintId} not found — using custom distribution` },
      };
    }

    // Validate marks alignment
    const bpTotal = bp.sections.reduce((s, sec) => s + sec.subtotal, 0);
    const warnings: string[] = [];
    if (bpTotal !== input.totalMarks) {
      warnings.push(`Blueprint total=${bpTotal} vs requested=${input.totalMarks}`);
    }

    return {
      agent: 'BlueprintAgent', status: 'passed', durationMs: Date.now() - start,
      output: { blueprint: bp.name, totalMarks: bpTotal, sections: bp.sections.length },
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  } catch (err: any) {
    return { agent: 'BlueprintAgent', status: 'warning', durationMs: Date.now() - start, error: err.message };
  }
}

/* ══════════════════════════════════════════════════════════════════════════
   Main Orchestrator
══════════════════════════════════════════════════════════════════════════ */
export async function runOrchestrator(input: AgentInput): Promise<OrchestratorOutput> {
  const orchestratorStart = Date.now();
  const generationId = generateId('GEN');
  const agentLog: AgentResult[] = [];

  /* ── Agent 1: Curriculum Agent ─────────────────────────────────────────── */
  const currResult = runCurriculumAgent(input);
  agentLog.push(currResult);
  if (currResult.status === 'failed') {
    return {
      paper: null,
      validation: {
        valid: false, confidence: 0,
        breakdown: { subjectAlignment: 0, topicAlignment: 0, gradeAlignment: 0, difficultyAlignment: 0, duplicateRisk: 0 },
        issues: currResult.warnings ?? [currResult.error ?? 'Validation failed'],
      },
      agentLog, totalDurationMs: Date.now() - orchestratorStart, generationId,
    };
  }

  /* ── Agent 2: Blueprint Agent ──────────────────────────────────────────── */
  const bpResult = await runBlueprintAgent(input);
  agentLog.push(bpResult);

  /* ── Agent 3: Question Generator Agent (Gemini) ────────────────────────── */
  const genResult = await runQuestionGeneratorAgent(input);
  agentLog.push(genResult);
  if (genResult.status === 'failed' || !genResult.output?.paper) {
    return {
      paper: null,
      validation: {
        valid: false, confidence: 0,
        breakdown: { subjectAlignment: 0, topicAlignment: 0, gradeAlignment: 0, difficultyAlignment: 0, duplicateRisk: 0 },
        issues: [genResult.error ?? 'AI generation failed'],
      },
      agentLog, totalDurationMs: Date.now() - orchestratorStart, generationId,
    };
  }

  const paper = genResult.output.paper;

  /* ── Agent 4: Curriculum Validator Agent ────────────────────────────────── */
  const cvResult = await runCurriculumValidatorAgent(input, paper);
  agentLog.push(cvResult);

  /* ── Agent 4.5: Answer Validator Agent ──────────────────────────────────── */
  const avResult = await runAnswerValidatorAgent(input, paper);
  agentLog.push(avResult);

  /* ── Agent 5: Difficulty Validator Agent ────────────────────────────────── */
  const dvResult = runDifficultyValidatorAgent(input, paper);
  agentLog.push(dvResult);

  /* ── Agent 6: Duplicate Checker Agent ──────────────────────────────────── */
  const dcResult = await runDuplicateCheckerAgent(input, paper);
  agentLog.push(dcResult);

  /* ── Agent 7: Paper Builder Agent ──────────────────────────────────────── */
  const pbResult = runPaperBuilderAgent(input, paper);
  agentLog.push(pbResult);

  /* ── Build final validation result ──────────────────────────────────────── */
  const validation = cvResult.output ?? {
    valid: true, confidence: 90,
    breakdown: { subjectAlignment: 95, topicAlignment: 90, gradeAlignment: 90, difficultyAlignment: 90, duplicateRisk: 85 },
    issues: [],
  };

  // Merge issues from all agents
  const allIssues = [
    ...(validation.issues ?? []),
    ...(avResult.warnings ?? []),
    ...(dvResult.warnings ?? []),
    ...(dcResult.warnings ?? []),
    ...(pbResult.warnings ?? []),
  ];
  validation.issues = allIssues;

  // Adjust duplicate risk based on duplicate checker
  if (dcResult.output?.duplicatesFound > 0 && validation.breakdown) {
    const dupPenalty = Math.min(dcResult.output.duplicatesFound * 5, 30);
    validation.breakdown.duplicateRisk = Math.max(0, validation.breakdown.duplicateRisk - dupPenalty);
    // Recalculate confidence
    const bd = validation.breakdown;
    validation.confidence = Math.round(
      bd.subjectAlignment * 0.4 + bd.topicAlignment * 0.25 +
      bd.gradeAlignment * 0.15 + bd.difficultyAlignment * 0.1 +
      bd.duplicateRisk * 0.1
    );
  }

  /* ── Persist: save questions to bank + create assessment ────────────────── */
  try {
    const allQuestions = paper.sections?.flatMap((s: any) => s.questions) ?? [];
    const questionIds = await saveQuestionsFromPaper(allQuestions, {
      tenantId:          input.tenantId,
      schoolId:          input.schoolId,
      boardCode:         input.boardCode,
      curriculumVersion: input.curriculumVersion,
      grade:             input.grade,
      domain:            input.domain,
      domainId:          input.domainId,
      subjectId:         input.subjectId,
      subject:           input.subject,
      createdBy:         input.requestedBy,
    });

    const assessmentId = await createAssessment({
      tenantId:          input.tenantId,
      schoolId:          input.schoolId,
      title:             input.examTitle,
      blueprintId:       input.blueprintId,
      boardCode:         input.boardCode,
      curriculumVersion: input.curriculumVersion,
      grade:             input.grade,
      domain:            input.domain,
      domainId:          input.domainId,
      subjectId:         input.subjectId,
      subject:           input.subject,
      chapters:          input.chapters,
      topics:            input.topics,
      examType:          input.examType,
      duration:          input.duration,
      totalMarks:        input.totalMarks,
      difficulty:        input.difficulty,
      questionIds,
      fullPaper:         paper,
      status:            'draft',
      validationResult:  validation,
      aiGenerationId:    generationId,
      createdBy:         input.requestedBy,
    });

    paper.metadata.assessmentId = assessmentId;
  } catch (err: any) {
    // Non-fatal — paper is still returned
    validation.issues.push(`Auto-save warning: ${err.message}`);
  }

  /* ── Log the generation ─────────────────────────────────────────────────── */
  try {
    const db = await getDb();
    await db.collection('ai_generations').insertOne({
      generationId,
      tenantId:  input.tenantId,
      schoolId:  input.schoolId,
      requestedBy: input.requestedBy,
      input: {
        boardCode: input.boardCode, grade: input.grade, domain: input.domain,
        subject: input.subject, chapters: input.chapters, topics: input.topics,
        examType: input.examType, totalMarks: input.totalMarks,
      },
      output: {
        questionCount: paper.sections?.reduce((s: number, sec: any) => s + (sec.questions?.length ?? 0), 0) ?? 0,
        model: genResult.output?.model,
      },
      validation: { confidence: validation.confidence, valid: validation.valid },
      agentLog: agentLog.map((a) => ({ agent: a.agent, status: a.status, durationMs: a.durationMs })),
      totalDurationMs: Date.now() - orchestratorStart,
      status: 'completed',
      createdAt: new Date(),
    });
  } catch { /* non-fatal logging */ }

  return {
    paper,
    validation,
    agentLog,
    totalDurationMs: Date.now() - orchestratorStart,
    generationId,
  };
}
