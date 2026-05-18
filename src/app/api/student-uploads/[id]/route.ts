import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { status } = await req.json();
    const allowed = ['pending', 'under_review', 'evaluated'];
    if (!allowed.includes(status)) return NextResponse.json({ error: 'Invalid status' }, { status: 400 });

    const db = await getDb();
    await db.collection('student_uploads').updateOne(
      { _id: new ObjectId(id) },
      { $set: { status, updatedAt: new Date() } }
    );
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
