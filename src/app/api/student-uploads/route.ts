import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { auth } from '@/auth';

/* ── POST /api/student-uploads ─────────────────────────────────────────
   Student submits an uploaded answer sheet (fileUri from Gemini).
   Saved to `student_uploads` collection.
──────────────────────────────────────────────────────────────────────── */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { subject, grade, base64Data, mimeType, fileName } = body;

    if (!subject || !grade || !base64Data) {
      return NextResponse.json({ error: 'subject, grade and base64Data are required' }, { status: 400 });
    }

    const db = await getDb();

    const doc = {
      studentName: session.user.name ?? 'Student',
      studentEmail: session.user.email,
      rollNo: (session.user as any).rollNo ?? 'N/A',
      subject,
      grade,
      mimeType: mimeType ?? 'application/pdf',
      fileName: fileName ?? 'answer_sheet',
      base64Data: base64Data ?? '',   // store so teachers can evaluate
      status: 'pending', // pending | under_review | evaluated
      createdAt: new Date(),
    };

    const result = await db.collection('student_uploads').insertOne(doc);

    return NextResponse.json({ id: result.insertedId.toString(), ...doc }, { status: 201 });
  } catch (err: any) {
    console.error('POST /api/student-uploads error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/* ── GET /api/student-uploads ──────────────────────────────────────────
   Students see their own uploads.
   Teachers/admins see all uploads (optionally filtered by subject/status).
──────────────────────────────────────────────────────────────────────── */
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const db = await getDb();
    const role = (session.user as any).role as string;

    const query: Record<string, any> = {};

    if (role === 'student') {
      query.rollNo = (session.user as any).rollNo;
    }

    const subject = searchParams.get('subject');
    if (subject) query.subject = subject;

    const status = searchParams.get('status');
    if (status) query.status = status;

    const uploads = await db
      .collection('student_uploads')
      .find(query)
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();

    return NextResponse.json({
      uploads: uploads.map((u) => ({
        id: u._id.toString(),
        studentName: u.studentName,
        studentEmail: u.studentEmail,
        rollNo: u.rollNo,
        subject: u.subject,
        grade: u.grade,
        mimeType: u.mimeType,
        fileName: u.fileName,
        status: u.status,
        createdAt: u.createdAt?.toISOString?.() ?? String(u.createdAt),
        // Only include image data for teachers/admins (students don't need it back)
        ...(role !== 'student' && u.base64Data ? { base64Data: u.base64Data } : {}),
      })),
    });
  } catch (err: any) {
    console.error('GET /api/student-uploads error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
