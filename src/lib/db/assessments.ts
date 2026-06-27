/* ─────────────────────────────────────────────────────────────────────────────
   DB helpers — Assessments (Phase 3)
───────────────────────────────────────────────────────────────────────────── */
import { Db, ObjectId } from 'mongodb';
import { getDb } from '@/lib/mongodb';
import { generateId } from '@/lib/tenant';

export type AssessmentStatus = 'draft' | 'published' | 'closed' | 'archived';

export interface AssessmentDoc {
  _id?: ObjectId;
  assessmentId: string;
  tenantId: string;
  schoolId: string;

  title: string;
  blueprintId?: string;

  boardCode: string;
  curriculumVersion: string;
  grade: string;
  domain: string | null;
  domainId: string | null;
  subjectId: string;
  subject: string;
  chapters: string[];
  topics?: string[];

  examType: string;
  duration: string;
  totalMarks: number;
  difficulty: string;

  questionIds: string[];
  fullPaper: any;                  // full JSON from generator

  status: AssessmentStatus;
  publishedAt?: Date;
  scheduledFor?: Date;
  closedAt?: Date;

  validationResult?: any;

  aiGenerationId?: string;         // link to ai_generations record

  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

async function col() {
  const db: Db = await getDb();
  return db.collection<AssessmentDoc>('assessments');
}

/* ── Create ───────────────────────────────────────────────────────────────── */
export async function createAssessment(
  data: Omit<AssessmentDoc, '_id' | 'assessmentId' | 'createdAt' | 'updatedAt'>,
): Promise<string> {
  const c = await col();
  const now = new Date();
  const assessmentId = generateId('ASS');
  await c.insertOne({ ...data, assessmentId, createdAt: now, updatedAt: now });
  return assessmentId;
}

/* ── Publish ──────────────────────────────────────────────────────────────── */
export async function publishAssessment(assessmentId: string, tenantId: string): Promise<void> {
  const c = await col();
  await c.updateOne(
    { assessmentId, tenantId },
    { $set: { status: 'published', publishedAt: new Date(), updatedAt: new Date() } },
  );
}

/* ── Get by tenant ────────────────────────────────────────────────────────── */
export async function getAssessments(tenantId: string, schoolId?: string, limit = 50): Promise<AssessmentDoc[]> {
  const c = await col();
  const filter: any = { tenantId };
  if (schoolId) filter.schoolId = schoolId;
  return c.find(filter).sort({ createdAt: -1 }).limit(limit).toArray();
}

export async function getAssessmentById(assessmentId: string, tenantId: string): Promise<AssessmentDoc | null> {
  const c = await col();
  return c.findOne({ assessmentId, tenantId });
}

/* ── Update ───────────────────────────────────────────────────────────────── */
export async function updateAssessment(assessmentId: string, tenantId: string, updates: Partial<AssessmentDoc>): Promise<void> {
  const c = await col();
  await c.updateOne({ assessmentId, tenantId }, { $set: { ...updates, updatedAt: new Date() } });
}
