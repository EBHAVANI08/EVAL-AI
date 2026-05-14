import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

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
  const avgAiConfidence =
    questions.length > 0
      ? Math.round(questions.reduce((sum, q) => sum + q.aiConfidence, 0) / questions.length)
      : 0;

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

// GET /api/evaluations/:id — fetch a single evaluation for the edit/view screen
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid evaluation ID' }, { status: 400 });
    }
    const db = await getDb();
    const doc = await db.collection('evaluations').findOne({ _id: new ObjectId(id) });
    if (!doc) {
      return NextResponse.json({ error: 'Evaluation not found' }, { status: 404 });
    }
    return NextResponse.json({
      id: doc._id.toString(),
      status: doc.status,
      studentInfo: doc.studentInfo || {},
      paperInfo: doc.paperInfo || {},
      questions: doc.questions || [],
      trainingData: doc.trainingData || {},
      scannedImages: doc.scannedImages || [],
      createdAt: doc.createdAt,
      finalizedAt: doc.finalizedAt || null,
    });
  } catch (err: any) {
    console.error('GET /api/evaluations/[id] error:', err);
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}

// DELETE /api/evaluations/:id — permanently delete an evaluation
export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid evaluation ID' }, { status: 400 });
    }
    const db = await getDb();
    const result = await db.collection('evaluations').deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Evaluation not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('DELETE /api/evaluations/[id] error:', err);
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}

// PATCH /api/evaluations/:id — save draft with updated questions + teacher scores
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid evaluation ID' }, { status: 400 });
    }

    const body = await request.json();
    const { questions, studentInfo } = body;

    if (!questions || !Array.isArray(questions)) {
      return NextResponse.json({ error: 'questions array is required' }, { status: 400 });
    }

    const db = await getDb();
    const updateFields: Record<string, any> = {
      questions,
      trainingData: buildTrainingData(questions),
      updatedAt: new Date(),
    };
    if (studentInfo) updateFields.studentInfo = studentInfo;

    const result = await db.collection('evaluations').updateOne(
      { _id: new ObjectId(id), status: { $ne: 'finalized' } },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Evaluation not found or already finalized' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('PATCH /api/evaluations/[id] error:', err);
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
