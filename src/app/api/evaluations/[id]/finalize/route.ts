import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// POST /api/evaluations/:id/finalize — lock scores and mark as finalized
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid evaluation ID' }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const { questions } = body;

    const db = await getDb();
    const updateFields: Record<string, any> = {
      status: 'finalized',
      finalizedAt: new Date(),
      updatedAt: new Date(),
    };

    // Save latest question state if provided
    if (questions && Array.isArray(questions)) {
      updateFields.questions = questions;
      // Recompute training data at finalization for accuracy
      const overriddenQuestions = questions
        .filter((q: any) => q.teacherScore !== null && q.teacherScore !== q.aiScore)
        .map((q: any) => ({
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
      const totalObtained = questions.reduce((sum: number, q: any) => {
        return sum + (q.teacherScore !== null ? q.teacherScore : q.aiScore);
      }, 0);
      const totalMax = questions.reduce((sum: number, q: any) => sum + q.maxMarks, 0);
      const avgAiConfidence =
        questions.length > 0
          ? Math.round(
              questions.reduce((sum: number, q: any) => sum + q.aiConfidence, 0) / questions.length
            )
          : 0;

      updateFields.trainingData = {
        avgAiConfidence,
        overrideCount: overriddenQuestions.length,
        flaggedCount: questions.filter((q: any) => q.status === 'flagged').length,
        totalObtained,
        totalMax,
        overriddenQuestions,
        flaggedQuestions: questions
          .filter((q: any) => q.status === 'flagged')
          .map((q: any) => ({
            questionId: q.id,
            questionText: q.questionText,
            ocrText: q.ocrText,
            aiScore: q.aiScore,
            aiConfidence: q.aiConfidence,
            language: q.language,
            hasDiagram: q.hasDiagram,
          })),
      };
    }

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
    console.error('POST /api/evaluations/[id]/finalize error:', err);
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
