import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

function buildTrainingData(questions: any[]) {
  const overriddenQuestions = questions
    .filter((q) => q.teacherScore !== null && q.teacherScore !== q.aiScore)
    .map((q) => ({
      questionId: q.id,
      questionText: q.questionText,
      ocrText: q.ocrText,
      aiAnswer: q.aiAnswer,
      aiScore: q.aiScore,
      teacherScore: q.teacherScore,
      scoreDifference: q.teacherScore - q.aiScore,
      aiConfidence: q.aiConfidence,
      aiReasoning: q.aiReasoning,
      language: q.language,
      hasDiagram: q.hasDiagram,
    }));

  const flaggedQuestions = questions
    .filter((q) => q.status === 'flagged')
    .map((q) => ({
      questionId: q.id,
      questionText: q.questionText,
      ocrText: q.ocrText,
      aiScore: q.aiScore,
      aiConfidence: q.aiConfidence,
      language: q.language,
      hasDiagram: q.hasDiagram,
    }));

  const totalObtained = questions.reduce((sum, q) => {
    const score = q.teacherScore !== null ? q.teacherScore : q.aiScore;
    return sum + score;
  }, 0);
  const totalMax = questions.reduce((sum, q) => sum + q.maxMarks, 0);
  const avgAiConfidence = Math.round(
    questions.reduce((sum, q) => sum + q.aiConfidence, 0) / questions.length
  );

  return {
    avgAiConfidence,
    overrideCount: overriddenQuestions.length,
    flaggedCount: flaggedQuestions.length,
    totalObtained,
    totalMax,
    overriddenQuestions,
    flaggedQuestions,
  };
}

// POST /api/evaluations — create a new evaluation record after AI finishes
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentInfo, paperInfo, questions, scannedImages } = body;

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ error: 'questions array is required' }, { status: 400 });
    }

    const db = await getDb();
    const now = new Date();

    const doc: Record<string, any> = {
      status: 'draft',
      createdAt: now,
      updatedAt: now,
      studentInfo: studentInfo || {},
      paperInfo: paperInfo || {},
      questions,
      trainingData: buildTrainingData(questions),
    };

    if (Array.isArray(scannedImages) && scannedImages.length > 0) {
      doc.scannedImages = scannedImages;
    }

    const result = await db.collection('evaluations').insertOne(doc);
    return NextResponse.json({ id: result.insertedId.toString() }, { status: 201 });
  } catch (err: any) {
    console.error('POST /api/evaluations error:', err);
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}

// GET /api/evaluations — list evaluations for the dashboard
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, parseInt(searchParams.get('limit') || '20', 10));
    const skip = (page - 1) * limit;

    const db = await getDb();
    const [rows, total] = await Promise.all([
      db
        .collection('evaluations')
        .find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      db.collection('evaluations').countDocuments(),
    ]);

    const evaluations = rows.map((ev) => ({
      id: ev._id.toString(),
      studentName: ev.studentInfo?.name || '—',
      rollNo: ev.studentInfo?.rollNo || '—',
      subject: ev.studentInfo?.subject || ev.paperInfo?.subject || '—',
      class: ev.studentInfo?.class || '—',
      obtained: ev.trainingData?.totalObtained ?? null,
      maxMarks: ev.paperInfo?.totalMarks ?? ev.trainingData?.totalMax ?? 0,
      aiConfidence: ev.trainingData?.avgAiConfidence ?? null,
      overrides: ev.trainingData?.overrideCount ?? 0,
      status: ev.status === 'finalized' ? 'finalized' : 'review',
      submittedAt: ev.createdAt
        ? new Date(ev.createdAt).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })
        : '—',
    }));

    return NextResponse.json({ evaluations, total, page, limit });
  } catch (err: any) {
    console.error('GET /api/evaluations error:', err);
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
