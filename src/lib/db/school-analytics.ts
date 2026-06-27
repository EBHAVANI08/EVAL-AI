/* ─────────────────────────────────────────────────────────────────────────────
   DB helpers — School Analytics (Phase 7)
───────────────────────────────────────────────────────────────────────────── */
import { Db, ObjectId } from 'mongodb';
import { getDb } from '@/lib/mongodb';
import { getSchoolPerformanceStats } from '@/lib/db/student-intelligence';

export interface SchoolAnalyticsDoc {
  _id?: ObjectId;
  tenantId: string;
  schoolId: string;
  date: Date;
  grade: string;
  subject: string;
  avgScore: number;
  weakTopics: string[];
  papersGenerated: number;
  assessmentsPublished: number;
  studentsAttempted: number;
}

async function col() {
  const db: Db = await getDb();
  return db.collection<SchoolAnalyticsDoc>('school_analytics');
}

/* ── Aggregate daily analytics ────────────────────────────────────────────── */
export async function generateDailySchoolAnalytics(tenantId: string, schoolId: string, date: Date): Promise<void> {
  const c = await col();
  const db: Db = await getDb();

  // Strip time from date to get the day
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  // 1. Get assessment counts
  const publishedAssessments = await db.collection('assessments').countDocuments({
    tenantId, schoolId, publishedAt: { $gte: startOfDay, $lte: endOfDay }
  });

  const papersGenerated = await db.collection('ai_generations').countDocuments({
    tenantId, schoolId, createdAt: { $gte: startOfDay, $lte: endOfDay }
  });

  // 2. Get student performance
  const performance = await getSchoolPerformanceStats(tenantId, schoolId);

  for (const subj of performance.bySubject) {
    await c.updateOne(
      { tenantId, schoolId, date: startOfDay, subject: subj.subject },
      {
        $set: {
          avgScore: subj.avgScore,
          papersGenerated,
          assessmentsPublished: publishedAssessments,
          studentsAttempted: subj.studentCount,
          weakTopics: [], // Would normally aggregate from assessment_results for this day
        }
      },
      { upsert: true }
    );
  }
}

export async function getSchoolAnalytics(tenantId: string, schoolId: string, limit = 30): Promise<SchoolAnalyticsDoc[]> {
  const c = await col();
  return c.find({ tenantId, schoolId }).sort({ date: -1 }).limit(limit).toArray();
}
