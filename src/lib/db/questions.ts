/* ─────────────────────────────────────────────────────────────────────────────
   DB helpers — Questions (Phase 2)
───────────────────────────────────────────────────────────────────────────── */
import { Db, ObjectId, Filter } from 'mongodb';
import { getDb } from '@/lib/mongodb';
import { generateQuestionFingerprint, computeSimilarityScore } from '@/lib/question-fingerprint';

export type QuestionStatus  = 'draft' | 'validated' | 'approved' | 'published' | 'archived';
export type QuestionSourceType = 'AI_GENERATED' | 'TEACHER_CREATED' | 'PREVIOUS_YEAR' | 'IMPORTED' | 'BOARD_SAMPLE';

export interface QuestionDoc {
  _id?: ObjectId;
  questionId: string;
  questionFingerprint: string;

  tenantId: string;
  schoolId: string;

  boardCode: string;
  curriculumVersion: string;

  grade: string;
  domain: string | null;
  domainId: string | null;

  subjectId: string;
  subject: string;
  chapterId?: string;
  chapter: string;
  topicId?: string;
  topic: string | null;

  learningOutcomeIds: string[];

  questionText: string;
  options: string[];
  type: string;
  marks: number;

  bloomsLevel: string;
  difficultyLabel: 'Easy' | 'Medium' | 'Hard';
  difficultyScore: number;

  qualityScore: number | null;
  reviewedBy: string | null;
  reviewedAt: Date | null;

  sourceType: QuestionSourceType;
  status: QuestionStatus;

  similarityScore: number | null;
  duplicateOf: string | null;

  tags: string[];

  answer: string;
  answerSteps: string[];
  ncertRef?: string;

  usageCount: number;
  lastUsedAt: Date | null;

  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

async function col() {
  const db: Db = await getDb();
  return db.collection<QuestionDoc>('questions');
}

/* ── Save questions from a generated paper ────────────────────────────────── */
export async function saveQuestionsFromPaper(
  questions: any[],
  meta: {
    tenantId: string;
    schoolId: string;
    boardCode: string;
    curriculumVersion: string;
    grade: string;
    domain: string | null;
    domainId: string | null;
    subjectId: string;
    subject: string;
    createdBy: string;
  },
): Promise<string[]> {
  const c = await col();
  const now = new Date();
  const insertedIds: string[] = [];

  for (const q of questions) {
    const fingerprint = generateQuestionFingerprint(q.questionText ?? '');

    // Check for exact duplicate
    const existing = await c.findOne({ questionFingerprint: fingerprint, tenantId: meta.tenantId });
    if (existing) {
      insertedIds.push(existing.questionId);
      continue;
    }

    const doc: QuestionDoc = {
      questionId:          q.questionId ?? `Q_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,
      questionFingerprint: fingerprint,
      tenantId:            meta.tenantId,
      schoolId:            meta.schoolId,
      boardCode:           meta.boardCode,
      curriculumVersion:   meta.curriculumVersion,
      grade:               meta.grade,
      domain:              meta.domain,
      domainId:            meta.domainId,
      subjectId:           meta.subjectId,
      subject:             meta.subject,
      chapter:             q.chapter ?? '',
      topic:               q.topic ?? null,
      learningOutcomeIds:  q.learningOutcomeIds ?? [],
      questionText:        q.questionText ?? '',
      options:             q.options ?? [],
      type:                q.type ?? 'short',
      marks:               q.maxMarks ?? 1,
      bloomsLevel:         q.bloomsLevel ?? 'Remember',
      difficultyLabel:     q.difficulty ?? 'Medium',
      difficultyScore:     q.difficultyScore ?? 50,
      qualityScore:        null,
      reviewedBy:          null,
      reviewedAt:          null,
      sourceType:          'AI_GENERATED',
      status:              'draft',
      similarityScore:     null,
      duplicateOf:         null,
      tags:                q.tags ?? [],
      answer:              q.answer ?? '',
      answerSteps:         q.answerSteps ?? [],
      ncertRef:            q.ncertRef,
      usageCount:          0,
      lastUsedAt:          null,
      createdBy:           meta.createdBy,
      createdAt:           now,
      updatedAt:           now,
    };

    const result = await c.insertOne(doc);
    insertedIds.push(doc.questionId);
  }

  return insertedIds;
}

/* ── Search questions ─────────────────────────────────────────────────────── */
export interface QuestionSearchParams {
  tenantId: string;
  schoolId?: string;
  boardCode?: string;
  grade?: string;
  subjectId?: string;
  chapter?: string;
  topic?: string;
  type?: string;
  status?: QuestionStatus;
  bloomsLevel?: string;
  difficulty?: string;
  tags?: string[];
  limit?: number;
  skip?: number;
}

export async function searchQuestions(params: QuestionSearchParams): Promise<QuestionDoc[]> {
  const c = await col();
  const filter: Filter<QuestionDoc> = { tenantId: params.tenantId };

  if (params.schoolId)   filter.schoolId   = params.schoolId;
  if (params.boardCode)  filter.boardCode  = params.boardCode;
  if (params.grade)      filter.grade      = params.grade;
  if (params.subjectId)  filter.subjectId  = params.subjectId;
  if (params.chapter)    filter.chapter    = { $regex: params.chapter, $options: 'i' } as any;
  if (params.topic)      filter.topic      = { $regex: params.topic,   $options: 'i' } as any;
  if (params.type)       filter.type       = params.type;
  if (params.status)     filter.status     = params.status;
  if (params.bloomsLevel) filter.bloomsLevel = params.bloomsLevel;
  if (params.difficulty) filter.difficultyLabel = params.difficulty as any;
  if (params.tags?.length) filter.tags = { $all: params.tags } as any;

  return c
    .find(filter)
    .sort({ createdAt: -1 })
    .skip(params.skip ?? 0)
    .limit(params.limit ?? 50)
    .toArray();
}

/* ── Get question by ID ───────────────────────────────────────────────────── */
export async function getQuestionById(questionId: string, tenantId: string): Promise<QuestionDoc | null> {
  const c = await col();
  return c.findOne({ questionId, tenantId });
}

/* ── Find similar/duplicate questions ────────────────────────────────────── */
export async function findSimilarQuestions(
  questionText: string,
  tenantId: string,
  thresholdScore = 70,
): Promise<Array<{ questionId: string; similarityScore: number; questionText: string }>> {
  const c = await col();
  const fingerprint = generateQuestionFingerprint(questionText);

  // 1. Exact match
  const exact = await c.findOne({ questionFingerprint: fingerprint, tenantId });
  if (exact) {
    return [{ questionId: exact.questionId, similarityScore: 100, questionText: exact.questionText }];
  }

  // 2. Near-match via Jaccard (sample last 500 questions from same tenant)
  const recent = await c.find({ tenantId }).sort({ createdAt: -1 }).limit(500).toArray();
  const similar: Array<{ questionId: string; similarityScore: number; questionText: string }> = [];

  for (const q of recent) {
    const score = computeSimilarityScore(questionText, q.questionText);
    if (score >= thresholdScore) {
      similar.push({ questionId: q.questionId, similarityScore: score, questionText: q.questionText });
    }
  }

  return similar.sort((a, b) => b.similarityScore - a.similarityScore).slice(0, 10);
}

/* ── Update question status ───────────────────────────────────────────────── */
export async function updateQuestionStatus(
  questionId: string,
  tenantId: string,
  status: QuestionStatus,
): Promise<void> {
  const c = await col();
  await c.updateOne(
    { questionId, tenantId },
    { $set: { status, updatedAt: new Date() } },
  );
}

/* ── Review a question ────────────────────────────────────────────────────── */
export async function reviewQuestion(
  questionId: string,
  tenantId: string,
  reviewedBy: string,
  qualityScore: number,
  status: QuestionStatus,
): Promise<void> {
  const c = await col();
  const now = new Date();
  await c.updateOne(
    { questionId, tenantId },
    { $set: { qualityScore, reviewedBy, reviewedAt: now, status, updatedAt: now } },
  );

  // Log the review
  const db: Db = await getDb();
  await db.collection('question_reviews').insertOne({
    questionId, tenantId, reviewedBy, qualityScore, status, reviewedAt: now,
  });
}

/* ── Increment usage count ────────────────────────────────────────────────── */
export async function incrementQuestionUsage(questionId: string, tenantId: string): Promise<void> {
  const c = await col();
  await c.updateOne(
    { questionId, tenantId },
    { $inc: { usageCount: 1 }, $set: { lastUsedAt: new Date(), updatedAt: new Date() } },
  );
}

/* ── Question bank stats ──────────────────────────────────────────────────── */
export async function getQuestionBankStats(tenantId: string): Promise<{
  total: number; byStatus: Record<string, number>; bySubject: Record<string, number>;
}> {
  const db: Db = await getDb();
  const [statusAgg, subjectAgg] = await Promise.all([
    db.collection('questions').aggregate([
      { $match: { tenantId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]).toArray(),
    db.collection('questions').aggregate([
      { $match: { tenantId } },
      { $group: { _id: '$subject', count: { $sum: 1 } } },
      { $sort: { count: -1 } }, { $limit: 10 },
    ]).toArray(),
  ]);

  const total = statusAgg.reduce((s, d) => s + d.count, 0);
  const byStatus  = Object.fromEntries(statusAgg.map((d) => [d._id ?? 'unknown', d.count]));
  const bySubject = Object.fromEntries(subjectAgg.map((d) => [d._id ?? 'unknown', d.count]));

  return { total, byStatus, bySubject };
}
