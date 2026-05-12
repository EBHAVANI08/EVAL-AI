import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const subject = searchParams.get('subject') || '';

    const db = await getDb();
    const query: any = {};
    if (subject) query.subject = { $regex: subject, $options: 'i' };

    const papers = await db
      .collection('question_papers')
      .find(query)
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    const filtered = search
      ? papers.filter(
          (p) =>
            p.title?.toLowerCase().includes(search.toLowerCase()) ||
            p.subject?.toLowerCase().includes(search.toLowerCase()) ||
            p.class?.toLowerCase().includes(search.toLowerCase())
        )
      : papers;

    return NextResponse.json({
      papers: filtered.map((p) => ({
        id: p._id.toString(),
        title: p.title || 'Untitled Paper',
        subject: p.subject || '—',
        class: p.class || '—',
        board: p.board || 'CBSE',
        totalMarks: p.totalMarks || 0,
        questionCount: Array.isArray(p.questions) ? p.questions.length : 0,
        createdAt: p.createdAt
          ? new Date(p.createdAt).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })
          : '—',
        questions: p.questions || [],
      })),
    });
  } catch (err: any) {
    console.error('GET /api/question-papers error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, subject, class: cls, board, totalMarks, questions } = body;
    if (!questions || !Array.isArray(questions)) {
      return NextResponse.json({ error: 'questions array required' }, { status: 400 });
    }
    const db = await getDb();
    const now = new Date();
    const computedTotal =
      totalMarks ||
      questions.reduce((s: number, q: any) => s + (Number(q.marks) || 0), 0);
    const result = await db.collection('question_papers').insertOne({
      title: title || `${subject || 'Untitled'} Paper — ${new Date().toLocaleDateString('en-IN')}`,
      subject: subject || '',
      class: cls || '',
      board: board || 'CBSE',
      totalMarks: computedTotal,
      questions,
      createdAt: now,
      updatedAt: now,
    });
    return NextResponse.json({ id: result.insertedId.toString() }, { status: 201 });
  } catch (err: any) {
    console.error('POST /api/question-papers error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
