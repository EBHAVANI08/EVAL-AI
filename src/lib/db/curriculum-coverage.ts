/* ─────────────────────────────────────────────────────────────────────────────
   DB helpers — Curriculum Coverage Tracking (Phase 5)
───────────────────────────────────────────────────────────────────────────── */
import { Db, ObjectId } from 'mongodb';
import { getDb } from '@/lib/mongodb';

export type TopicCoverageStatus = 'not_started' | 'in_progress' | 'completed' | 'skipped';

export interface TopicCoverage {
  topicId: string;
  name: string;
  status: TopicCoverageStatus;
  completedAt?: Date;
}

export interface ChapterCoverage {
  chapterId: string;
  chapterName: string;
  status: TopicCoverageStatus;
  completedAt?: Date;
  topics: TopicCoverage[];
}

export interface CurriculumCoverageDoc {
  _id?: ObjectId;
  tenantId: string;
  schoolId: string;
  academicYear: string;
  grade: string;
  domain: string | null;
  domainId: string | null;
  subjectId: string;
  subject: string;
  teacherEmail: string;

  chapters: ChapterCoverage[];

  completedTopicIds: string[];
  pendingTopicIds: string[];
  inProgressTopicIds: string[];

  totalTopics: number;
  completedCount: number;
  coveragePercent: number;

  lastUpdatedAt: Date;
  createdAt: Date;
}

async function col() {
  const db: Db = await getDb();
  return db.collection<CurriculumCoverageDoc>('curriculum_coverage');
}

/* ── Upsert (create if doesn't exist, merge chapters if exists) ───────────── */
export async function upsertCoverage(
  data: Omit<CurriculumCoverageDoc, '_id' | 'createdAt' | 'lastUpdatedAt'>,
): Promise<void> {
  const c = await col();
  const now = new Date();
  const filter = {
    tenantId:    data.tenantId,
    schoolId:    data.schoolId,
    academicYear: data.academicYear,
    grade:       data.grade,
    subjectId:   data.subjectId,
    teacherEmail: data.teacherEmail,
  };
  await c.updateOne(
    filter,
    {
      $set:         { ...data, lastUpdatedAt: now },
      $setOnInsert: { createdAt: now },
    },
    { upsert: true },
  );
}

/* ── Mark a topic as completed ────────────────────────────────────────────── */
export async function markTopicCompleted(
  tenantId: string,
  schoolId: string,
  academicYear: string,
  grade: string,
  subjectId: string,
  teacherEmail: string,
  topicId: string,
): Promise<void> {
  const c = await col();
  const now = new Date();
  const filter = { tenantId, schoolId, academicYear, grade, subjectId, teacherEmail };
  await c.updateOne(filter, {
    $set: {
      'chapters.$[ch].topics.$[tp].status': 'completed',
      'chapters.$[ch].topics.$[tp].completedAt': now,
      lastUpdatedAt: now,
    },
    $addToSet: { completedTopicIds: topicId },
    $pull:     { pendingTopicIds: topicId, inProgressTopicIds: topicId } as any,
  }, {
    arrayFilters: [
      { 'ch.topics.topicId': topicId },
      { 'tp.topicId': topicId },
    ],
  });
  // Recalculate coverage percent
  await recalculateCoverage(tenantId, schoolId, academicYear, grade, subjectId, teacherEmail);
}

/* ── Recalculate coverage percent ────────────────────────────────────────── */
async function recalculateCoverage(
  tenantId: string, schoolId: string, academicYear: string,
  grade: string, subjectId: string, teacherEmail: string,
): Promise<void> {
  const c = await col();
  const doc = await c.findOne({ tenantId, schoolId, academicYear, grade, subjectId, teacherEmail });
  if (!doc) return;

  const allTopics = doc.chapters.flatMap(ch => ch.topics);
  const total = allTopics.length;
  const completed = allTopics.filter(t => t.status === 'completed').length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  await c.updateOne(
    { tenantId, schoolId, academicYear, grade, subjectId, teacherEmail },
    { $set: { totalTopics: total, completedCount: completed, coveragePercent: pct } },
  );
}

/* ── Get coverage ─────────────────────────────────────────────────────────── */
export async function getCoverage(
  tenantId: string,
  schoolId: string,
  academicYear: string,
  grade?: string,
  teacherEmail?: string,
): Promise<CurriculumCoverageDoc[]> {
  const c = await col();
  const filter: any = { tenantId, schoolId, academicYear };
  if (grade) filter.grade = grade;
  if (teacherEmail) filter.teacherEmail = teacherEmail;
  return c.find(filter).sort({ subject: 1 }).toArray();
}

export async function getCoverageBySubject(
  tenantId: string, schoolId: string, academicYear: string,
  grade: string, subjectId: string, teacherEmail: string,
): Promise<CurriculumCoverageDoc | null> {
  const c = await col();
  return c.findOne({ tenantId, schoolId, academicYear, grade, subjectId, teacherEmail });
}

/* ── Get completed topic IDs (for AI generation — block future chapters) ─── */
export async function getCompletedTopicIds(
  tenantId: string, schoolId: string, academicYear: string,
  grade: string, subjectId: string,
): Promise<string[]> {
  const c = await col();
  const docs = await c.find({ tenantId, schoolId, academicYear, grade, subjectId }).toArray();
  const all = docs.flatMap(d => d.completedTopicIds ?? []);
  return [...new Set(all)];
}
