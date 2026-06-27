import { NextRequest, NextResponse } from 'next/server';
import { getTenantContext } from '@/lib/tenant';
import { getAssessments, createAssessment } from '@/lib/db/assessments';

export async function GET(req: NextRequest) {
  try {
    const ctx = await getTenantContext();
    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get('limit')) || 50;

    const assessments = await getAssessments(ctx.tenantId, ctx.schoolId, limit);
    return NextResponse.json({ assessments });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await getTenantContext();
    const body = await req.json();

    const assessmentId = await createAssessment({
      ...body,
      tenantId: ctx.tenantId,
      schoolId: ctx.schoolId,
      createdBy: ctx.userEmail ?? 'system',
      status: 'draft',
    });

    return NextResponse.json({ assessmentId }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
