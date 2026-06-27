import { NextRequest, NextResponse } from 'next/server';
import { getTenantContext } from '@/lib/tenant';
import { searchQuestions } from '@/lib/db/questions';

export async function GET(req: NextRequest) {
  try {
    const ctx = await getTenantContext();
    const { searchParams } = new URL(req.url);

    const questions = await searchQuestions({
      tenantId:   ctx.tenantId,
      boardCode:  searchParams.get('boardCode') || undefined,
      grade:      searchParams.get('grade') || undefined,
      subjectId:  searchParams.get('subjectId') || undefined,
      chapter:    searchParams.get('chapter') || undefined,
      topic:      searchParams.get('topic') || undefined,
      type:       searchParams.get('type') || undefined,
      status:     (searchParams.get('status') as any) || undefined,
      limit:      Number(searchParams.get('limit')) || 50,
      skip:       Number(searchParams.get('skip')) || 0,
    });

    return NextResponse.json({ questions });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
