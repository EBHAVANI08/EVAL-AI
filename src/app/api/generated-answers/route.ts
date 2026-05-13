import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = await getDb();
    const doc = { ...body, createdAt: new Date() };
    const result = await db.collection('generated_answers').insertOne(doc);
    return NextResponse.json({ id: result.insertedId.toString() }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(20, parseInt(searchParams.get('limit') || '10', 10));
    const db = await getDb();
    const rows = await db
      .collection('generated_answers')
      .find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
    const answers = rows.map((r) => ({ ...r, id: r._id.toString(), _id: undefined }));
    return NextResponse.json({ answers });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
