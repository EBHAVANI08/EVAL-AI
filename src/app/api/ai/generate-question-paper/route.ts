import { NextRequest, NextResponse } from 'next/server';
import { getTenantContext } from '@/lib/tenant';
import { runOrchestrator } from '@/lib/agents/orchestrator';
import type { AgentInput } from '@/lib/agents/types';

export const dynamic = 'force-dynamic';
export const maxDuration = 120; // Allow enough time for 7 agents

export async function POST(req: NextRequest) {
  try {
    const tenantCtx = await getTenantContext();
    const body = await req.json();

    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 });
    }

    const input: AgentInput = {
      tenantId:          tenantCtx.tenantId,
      schoolId:          tenantCtx.schoolId,
      requestedBy:       tenantCtx.userEmail ?? 'anonymous@school.com',

      curriculum:        body.curriculum ?? 'CBSE',
      boardCode:         body.boardCode ?? 'CBSE',
      curriculumVersion: body.academicYear ?? '2025-26',
      grade:             body.grade ?? '',
      gradeNum:          parseInt((body.grade ?? '').replace('Class ', '').trim(), 10) || 10,
      domain:            body.domain ?? null,
      domainId:          body.domainId ?? null,
      subjectId:         body.subjectId ?? '',
      subject:           body.subject ?? '',
      chapters:          body.chapters ?? [],
      topics:            body.topics ?? [],

      examType:          body.examType ?? 'Unit Test',
      duration:          body.duration ?? '3 hours',
      totalMarks:        body.totalMarks ?? 80,
      numQuestions:      body.numQuestions ?? 35,
      difficulty:        body.difficulty ?? 'Mixed',
      bloomsLevels:      body.bloomsLevels ?? [],
      questionDistribution: body.questionDistribution ?? '',
      blueprintId:       body.blueprintId,

      examTitle:         body.examTitle ?? `${body.subject} — ${body.examType ?? 'Unit Test'}`,
      schoolName:        body.schoolName,
      academicYear:      body.academicYear ?? '2025-26',

      includeNCERT:      !!body.includeNCERT,
      includeScheme:     !!body.includeScheme,
      extractedContent:  body.extractedContent,
      filePayloads:      body.filePayloads,

      apiKey,
    };

    // Run the full 7-phase agent pipeline
    const orchestratorResult = await runOrchestrator(input);

    if (!orchestratorResult.paper) {
      const errorMsg = orchestratorResult.validation.issues?.[0] ?? 'Orchestrator failed to generate paper';
      return NextResponse.json({ error: errorMsg, agentLog: orchestratorResult.agentLog }, { status: 500 });
    }

    // Pass the paper, validation, and execution log back to the UI
    return NextResponse.json({
      paper:        orchestratorResult.paper,
      validation:   orchestratorResult.validation,
      generationId: orchestratorResult.generationId,
      agentLog:     orchestratorResult.agentLog,
    });

  } catch (err: any) {
    console.error('[generate-question-paper]', err);
    return NextResponse.json({ error: err.message ?? 'Internal server error' }, { status: 500 });
  }
}
