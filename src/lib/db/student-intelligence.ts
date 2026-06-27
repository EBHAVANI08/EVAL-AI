/* ─────────────────────────────────────────────────────────────────────────────
   DB helpers — Student Mastery & Assessment Results (Phase 6)
───────────────────────────────────────────────────────────────────────────── */
import { Db, ObjectId } from 'mongodb';
import { getDb } from '@/lib/mongodb';
import { generateId } from '@/lib/tenant';

/* ══ Student Mastery ══════════════════════════════════════════════════════ */
export interface StudentMasteryDoc {
  _id?: ObjectId;
  studentId: string;
  tenantId: string;
  schoolId: string;
  academicYear: string;
  grade: string;
  subjectId: string;
  subject: string;
  topicId: string;
  topic: string;
  learningOutcomeId?: string;
  masteryScore: number;     // 0-100
  attemptCount: number;
  correctCount: number;
  lastAttemptAt: Date;
  updatedAt: Date;
}

/* ══ Assessment Results ══════════════════════════════════════════════════ */
export interface QuestionResult {
  questionId: string;
  marksObtained: number;
  maxMarks: number;
  isCorrect: boolean;
  topicId?: string;
  topic?: string;
  bloomsLevel?: string;
}

export interface AssessmentResultDoc {
  _id?: ObjectId;
  resultId: string;
  tenantId: string;
  schoolId: string;
  assessmentId: string;
  studentId: string;
  studentName: string;
  studentRollNo?: string;
  grade: string;
  subject: string;
  subjectId: string;
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  grade_letter: string;     // A+, A, B+, B, C, D, F
  questionResults: QuestionResult[];
  weakTopics: string[];
  strongTopics: string[];
  bloomsAnalysis: Record<string, { attempted: number; correct: number }>;
  submittedAt: Date;
}

async function masteryCol() {
  const db: Db = await getDb();
  return db.collection<StudentMasteryDoc>('student_mastery');
}

async function resultsCol() {
  const db: Db = await getDb();
  return db.collection<AssessmentResultDoc>('assessment_results');
}

/* ── Grade from percentage ────────────────────────────────────────────────── */
function gradeFromPercent(pct: number): string {
  if (pct >= 91) return 'A+';
  if (pct >= 81) return 'A';
  if (pct >= 71) return 'B+';
  if (pct >= 61) return 'B';
  if (pct >= 51) return 'C';
  if (pct >= 33) return 'D';
  return 'F';
}

/* ── Save assessment result & update mastery ──────────────────────────────── */
export async function saveAssessmentResult(data: {
  tenantId: string;
  schoolId: string;
  assessmentId: string;
  studentId: string;
  studentName: string;
  studentRollNo?: string;
  grade: string;
  subject: string;
  subjectId: string;
  totalMarks: number;
  obtainedMarks: number;
  questionResults: QuestionResult[];
  academicYear: string;
}): Promise<string> {
  const c = await resultsCol();
  const now = new Date();
  const pct = data.totalMarks > 0 ? Math.round((data.obtainedMarks / data.totalMarks) * 100 * 10) / 10 : 0;

  // Analyse weak/strong topics
  const topicMap: Record<string, { correct: number; total: number }> = {};
  for (const qr of data.questionResults) {
    if (!qr.topic) continue;
    if (!topicMap[qr.topic]) topicMap[qr.topic] = { correct: 0, total: 0 };
    topicMap[qr.topic].total++;
    if (qr.isCorrect) topicMap[qr.topic].correct++;
  }

  const weakTopics: string[]   = [];
  const strongTopics: string[] = [];
  for (const [topic, stat] of Object.entries(topicMap)) {
    const ratio = stat.total > 0 ? stat.correct / stat.total : 0;
    if (ratio >= 0.7)      strongTopics.push(topic);
    else if (ratio < 0.4)  weakTopics.push(topic);
  }

  // Bloom's analysis
  const bloomsMap: Record<string, { attempted: number; correct: number }> = {};
  for (const qr of data.questionResults) {
    const bl = (qr as any).bloomsLevel ?? 'Unknown';
    if (!bloomsMap[bl]) bloomsMap[bl] = { attempted: 0, correct: 0 };
    bloomsMap[bl].attempted++;
    if (qr.isCorrect) bloomsMap[bl].correct++;
  }

  const resultId = generateId('RES');
  await c.insertOne({
    resultId,
    tenantId:       data.tenantId,
    schoolId:       data.schoolId,
    assessmentId:   data.assessmentId,
    studentId:      data.studentId,
    studentName:    data.studentName,
    studentRollNo:  data.studentRollNo,
    grade:          data.grade,
    subject:        data.subject,
    subjectId:      data.subjectId,
    totalMarks:     data.totalMarks,
    obtainedMarks:  data.obtainedMarks,
    percentage:     pct,
    grade_letter:   gradeFromPercent(pct),
    questionResults: data.questionResults,
    weakTopics,
    strongTopics,
    bloomsAnalysis: bloomsMap,
    submittedAt: now,
  });

  // Update mastery scores per topic
  await updateMasteryFromResults(data.tenantId, data.schoolId, data.academicYear, data.grade, data.subjectId, data.subject, data.studentId, data.questionResults);

  return resultId;
}

/* ── Update mastery ───────────────────────────────────────────────────────── */
async function updateMasteryFromResults(
  tenantId: string, schoolId: string, academicYear: string, grade: string,
  subjectId: string, subject: string, studentId: string, results: QuestionResult[],
): Promise<void> {
  const c = await masteryCol();
  const now = new Date();

  // Group by topicId
  const topicMap: Record<string, { topicId: string; topic: string; correct: number; total: number }> = {};
  for (const r of results) {
    if (!r.topicId || !r.topic) continue;
    if (!topicMap[r.topicId]) topicMap[r.topicId] = { topicId: r.topicId, topic: r.topic, correct: 0, total: 0 };
    topicMap[r.topicId].total++;
    if (r.isCorrect) topicMap[r.topicId].correct++;
  }

  for (const [topicId, stat] of Object.entries(topicMap)) {
    const existing = await c.findOne({ tenantId, studentId, subjectId, topicId, academicYear });
    if (existing) {
      const newAttempts = existing.attemptCount + stat.total;
      const newCorrect  = existing.correctCount + stat.correct;
      const mastery     = Math.round((newCorrect / newAttempts) * 100);
      await c.updateOne(
        { tenantId, studentId, subjectId, topicId, academicYear },
        { $set: { attemptCount: newAttempts, correctCount: newCorrect, masteryScore: mastery, lastAttemptAt: now, updatedAt: now } },
      );
    } else {
      const mastery = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0;
      await c.insertOne({
        studentId, tenantId, schoolId, academicYear, grade,
        subjectId, subject,
        topicId, topic: stat.topic,
        masteryScore: mastery,
        attemptCount: stat.total,
        correctCount: stat.correct,
        lastAttemptAt: now, updatedAt: now,
      });
    }
  }
}

/* ── Get mastery for a student ────────────────────────────────────────────── */
export async function getStudentMastery(
  tenantId: string, studentId: string, subjectId?: string, academicYear?: string,
): Promise<StudentMasteryDoc[]> {
  const c = await masteryCol();
  const filter: any = { tenantId, studentId };
  if (subjectId)    filter.subjectId    = subjectId;
  if (academicYear) filter.academicYear = academicYear;
  return c.find(filter).sort({ masteryScore: 1 }).toArray();
}

/* ── Get assessment results ───────────────────────────────────────────────── */
export async function getAssessmentResults(tenantId: string, assessmentId: string): Promise<AssessmentResultDoc[]> {
  const c = await resultsCol();
  return c.find({ tenantId, assessmentId }).sort({ percentage: -1 }).toArray();
}

export async function getStudentResults(
  tenantId: string, studentId: string, limit = 20,
): Promise<AssessmentResultDoc[]> {
  const c = await resultsCol();
  return c.find({ tenantId, studentId }).sort({ submittedAt: -1 }).limit(limit).toArray();
}

/* ── School analytics aggregation ────────────────────────────────────────── */
export async function getSchoolPerformanceStats(tenantId: string, schoolId: string, grade?: string): Promise<any> {
  const db: Db = await getDb();
  const match: any = { tenantId, schoolId };
  if (grade) match.grade = grade;

  const [subjectAgg, gradeAgg] = await Promise.all([
    db.collection('assessment_results').aggregate([
      { $match: match },
      { $group: {
        _id: '$subject',
        avgScore: { $avg: '$percentage' },
        totalStudents: { $addToSet: '$studentId' },
        assessments: { $addToSet: '$assessmentId' },
      }},
      { $project: { subject: '$_id', avgScore: { $round: ['$avgScore', 1] }, studentCount: { $size: '$totalStudents' }, assessmentCount: { $size: '$assessments' } } },
      { $sort: { avgScore: -1 } },
    ]).toArray(),

    db.collection('assessment_results').aggregate([
      { $match: match },
      { $group: {
        _id: '$grade_letter',
        count: { $sum: 1 },
      }},
      { $sort: { _id: 1 } },
    ]).toArray(),
  ]);

  return { bySubject: subjectAgg, gradeDistribution: gradeAgg };
}
