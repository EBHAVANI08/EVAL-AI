import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { auth } from '@/auth';

/* POST /api/evaluations/message
   Student sends a doubt/query to the teacher about an evaluation. */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { evaluationId, subject, message } = await req.json();
    if (!evaluationId || !message?.trim()) {
      return NextResponse.json({ error: 'evaluationId and message are required' }, { status: 400 });
    }

    const db = await getDb();
    const doc = {
      evaluationId,
      subject: subject ?? 'General',
      studentName:  session.user.name ?? 'Student',
      studentEmail: session.user.email,
      rollNo: (session.user as any).rollNo ?? null,
      message: message.trim(),
      read: false,
      createdAt: new Date(),
    };
    await db.collection('student_messages').insertOne(doc);
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err: any) {
    console.error('POST /api/evaluations/message error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/* PATCH /api/evaluations/message  — mark one or all messages as read
   Body: { id?: string }  — omit id to mark all unread as read */
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const db = await getDb();

    if (body.id) {
      const { ObjectId } = await import('mongodb');
      await db.collection('student_messages').updateOne(
        { _id: new ObjectId(body.id) },
        { $set: { read: true } },
      );
    } else {
      await db.collection('student_messages').updateMany(
        { read: false },
        { $set: { read: true } },
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('PATCH /api/evaluations/message error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/* GET /api/evaluations/message?evaluationId=xxx
   Teacher fetches messages for a given evaluation. */
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const evaluationId = searchParams.get('evaluationId');
    const db = await getDb();

    const query: Record<string, any> = {};
    if (evaluationId) query.evaluationId = evaluationId;

    // Students can only see their own messages
    const role = (session.user as any).role as string;
    if (role === 'student') {
      query.studentEmail = session.user.email;
    }

    const messages = await db
      .collection('student_messages')
      .find(query)
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    return NextResponse.json({
      messages: messages.map(m => ({
        id:           m._id.toString(),
        evaluationId: m.evaluationId,
        subject:      m.subject,
        studentName:  m.studentName,
        rollNo:       m.rollNo,
        message:      m.message,
        read:         m.read,
        createdAt:    m.createdAt?.toISOString?.() ?? String(m.createdAt),
      })),
    });
  } catch (err: any) {
    console.error('GET /api/evaluations/message error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
