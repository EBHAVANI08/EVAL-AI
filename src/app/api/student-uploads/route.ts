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
    const { subject, grade, base64Data, mimeType, fileName, files } = body;

    if (!subject || !grade) {
      return NextResponse.json({ error: 'subject and grade are required' }, { status: 400 });
    }

    // Support multi-file: `files` array takes priority over single base64Data
    const fileList: { base64Data: string; mimeType: string; fileName: string }[] =
      Array.isArray(files) && files.length > 0
        ? files
        : base64Data
          ? [{ base64Data, mimeType: mimeType ?? 'application/pdf', fileName: fileName ?? 'answer_sheet' }]
          : [];

    if (fileList.length === 0) {
      return NextResponse.json({ error: 'At least one file is required' }, { status: 400 });
    }

    const db = await getDb();

    // Display name: first file name + page count if multiple
    const displayName = fileList.length === 1
      ? fileList[0].fileName
      : `${fileList[0].fileName} +${fileList.length - 1} more (${fileList.length} pages)`;

    const doc = {
      studentName:  session.user.name ?? 'Student',
      studentEmail: session.user.email,
      rollNo:       (session.user as any).rollNo ?? 'N/A',
      subject,
      grade,
      // Primary file (for backward compat with existing evaluator)
      mimeType:   fileList[0].mimeType,
      fileName:   displayName,
      base64Data: fileList[0].base64Data,
      // All pages stored for multi-page evaluation
      files: fileList,
      pageCount: fileList.length,
      status:    'pending',
      createdAt: new Date(),
    };

    const result = await db.collection('student_uploads').insertOne(doc);

    return NextResponse.json({ id: result.insertedId.toString(), ...doc, base64Data: undefined }, { status: 201 });
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
        id:           u._id.toString(),
        studentName:  u.studentName,
        studentEmail: u.studentEmail,
        rollNo:       u.rollNo,
        subject:      u.subject,
        grade:        u.grade,
        mimeType:     u.mimeType,
        fileName:     u.fileName,
        pageCount:    u.pageCount ?? 1,
        status:       u.status,
        createdAt:    u.createdAt?.toISOString?.() ?? String(u.createdAt),
        // Only include image data for teachers/admins
        ...(role !== 'student' && u.base64Data ? { base64Data: u.base64Data, files: u.files } : {}),
      })),
    });
  } catch (err: any) {
    console.error('GET /api/student-uploads error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
