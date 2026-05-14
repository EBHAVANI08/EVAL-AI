import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function GET() {
  try {
    const db = await getDb();

    const [
      totalEvaluations,
      flaggedCount,
      uniqueStudents,
      uniqueSubjects
    ] = await Promise.all([
      db.collection('evaluations').countDocuments(),
      db.collection('evaluations').countDocuments({ status: 'review' }),
      db.collection('evaluations').distinct('studentInfo.rollNo'),
      db.collection('evaluations').distinct('studentInfo.subject')
    ]);

    // For a real app, these would be in their own collections
    // For now, we estimate based on evaluations
    const estimatedTeachers = Math.max(1, Math.round(uniqueSubjects.length / 2));
    const estimatedSchools = 1; 

    return NextResponse.json({
      totalTeachers: estimatedTeachers,
      totalStudents: uniqueStudents.length,
      totalSchools: estimatedSchools,
      totalEvaluations,
      activeSessions: Math.round(totalEvaluations * 0.05), // Fake metric
      flaggedReviews: flaggedCount
    });
  } catch (err: any) {
    console.error('GET /api/admin/stats error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
