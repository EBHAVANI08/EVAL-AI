import { NextRequest, NextResponse } from 'next/server';
import { getTenantContext } from '@/lib/tenant';
import { getBlueprints, createBlueprint, seedSystemBlueprints } from '@/lib/db/blueprints';

export async function GET(req: NextRequest) {
  try {
    const ctx = await getTenantContext();
    const { searchParams } = new URL(req.url);
    const boardCode = searchParams.get('boardCode') || undefined;

    const bps = await getBlueprints(ctx.tenantId, boardCode);

    // If zero blueprints found for tenant, auto-seed defaults
    if (bps.length === 0) {
      await seedSystemBlueprints(ctx.tenantId, ctx.schoolId);
      const seeded = await getBlueprints(ctx.tenantId, boardCode);
      return NextResponse.json({ blueprints: seeded });
    }

    return NextResponse.json({ blueprints: bps });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await getTenantContext();
    const body = await req.json();

    const blueprintId = await createBlueprint({
      ...body,
      tenantId: ctx.tenantId,
      schoolId: ctx.schoolId,
      createdBy: ctx.userEmail ?? 'system',
      isOfficial: false,
      isDefault: false,
    });

    return NextResponse.json({ blueprintId }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
