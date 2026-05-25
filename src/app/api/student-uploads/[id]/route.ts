import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { auth } from '@/auth';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = await getDb();
    const upload = await db.collection('student_uploads').findOne({ _id: new ObjectId(params.id) });
    if (!upload) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json({
      id:           upload._id.toString(),
      studentName:  upload.studentName,
      studentEmail: upload.studentEmail,
      rollNo:       upload.rollNo,
      subject:      upload.subject,
      grade:        upload.grade,
      mimeType:     upload.mimeType,
      fileName:     upload.fileName,
      base64Data:   upload.base64Data ?? '',
      files:        upload.files ?? [{ base64Data: upload.base64Data ?? '', mimeType: upload.mimeType, fileName: upload.fileName }],
      pageCount:    upload.pageCount ?? 1,
      status:       upload.status,
      createdAt:    upload.createdAt?.toISOString?.() ?? String(upload.createdAt),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

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

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = await getDb();
    const upload = await db.collection('student_uploads').findOne({ _id: new ObjectId(params.id) });
    if (!upload) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Students can only delete their own pending submissions
    const userRole = (session.user as any).role;
    const userRollNo = (session.user as any).rollNo;
    if (userRole === 'student') {
      if (upload.rollNo !== userRollNo && upload.studentEmail !== session.user.email) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      if (upload.status !== 'pending') {
        return NextResponse.json({ error: 'Only pending submissions can be deleted' }, { status: 400 });
      }
    }

    await db.collection('student_uploads').deleteOne({ _id: new ObjectId(params.id) });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
