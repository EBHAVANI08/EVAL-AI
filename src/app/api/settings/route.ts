import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

const SETTINGS_ID = 'global_settings';

const defaults = {
  institutionName: '',
  board: 'CBSE',
  academicYear: '2025-26',
  principalName: '',
  contactEmail: '',
  address: '',
  passingThreshold: 33,
  gradingScheme: [
    { grade: 'A+', min: 91, max: 100 },
    { grade: 'A', min: 81, max: 90 },
    { grade: 'B+', min: 71, max: 80 },
    { grade: 'B', min: 61, max: 70 },
    { grade: 'C', min: 51, max: 60 },
    { grade: 'D', min: 33, max: 50 },
    { grade: 'F', min: 0, max: 32 },
  ],
  defaultLanguage: 'English',
  autoSaveEvaluations: true,
  showAiConfidence: true,
  requireTeacherReview: false,
  maxTokens: 65536,
  temperature: 0.1,
};

export async function GET() {
  try {
    const db = await getDb();
    const doc = await db.collection('settings').findOne({ _id: SETTINGS_ID as any });
    if (!doc) return NextResponse.json(defaults);
    const { _id, ...rest } = doc as any;
    return NextResponse.json({ ...defaults, ...rest });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = await getDb();
    await db.collection('settings').updateOne(
      { _id: SETTINGS_ID as any },
      { $set: { ...body, updatedAt: new Date() } },
      { upsert: true }
    );
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
