import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const rollNo = decodeURIComponent(id);
    const db = await getDb();

    const evaluations = await db
      .collection('evaluations')
      .find({ 'studentInfo.rollNo': rollNo })
      .sort({ createdAt: -1 })
      .toArray();

    const formatted = evaluations.map((ev) => ({
      id: ev._id.toString(),
      subject: ev.studentInfo?.subject || ev.paperInfo?.subject || '—',
      class: ev.studentInfo?.class || '—',
      obtained: ev.trainingData?.totalObtained ?? null,
      maxMarks: ev.paperInfo?.totalMarks ?? ev.trainingData?.totalMax ?? 0,
      aiConfidence: ev.trainingData?.avgAiConfidence ?? null,
      overrides: ev.trainingData?.overrideCount ?? 0,
      status: ev.status,
      evaluatedAt: ev.createdAt
        ? new Date(ev.createdAt).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })
        : '—',
    }));

    return NextResponse.json({ evaluations: formatted });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!ObjectId.isValid(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    const db = await getDb();
    await db.collection('students').deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
