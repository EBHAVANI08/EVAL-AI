/* ─────────────────────────────────────────────────────────────────────────────
   DB helpers — Exam Blueprints (Phase 3)
───────────────────────────────────────────────────────────────────────────── */
import { Db, ObjectId } from 'mongodb';
import { getDb } from '@/lib/mongodb';

export interface BlueprintSection {
  name: string;
  questionType: string;
  count: number;
  marksEach: number;
  subtotal: number;
  label?: string;
  instructions?: string;
}

export interface BlueprintDoc {
  _id?: ObjectId;
  blueprintId: string;
  tenantId: string;
  schoolId: string;

  name: string;
  boardCode: string;
  gradeRange?: string;       // e.g. "9-10" or "11-12" or "all"
  examType: string;
  totalMarks: number;
  duration: string;

  sections: BlueprintSection[];

  isOfficial: boolean;       // system-seeded vs teacher-created
  isDefault: boolean;        // shown first in UI

  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

/* ── Default CBSE blueprints (seeded once) ────────────────────────────────── */
export const SYSTEM_BLUEPRINTS: Omit<BlueprintDoc, '_id' | 'createdAt' | 'updatedAt' | 'tenantId' | 'schoolId'>[] = [
  {
    blueprintId: 'BP_WORKSHEET',
    name: 'Worksheet',
    boardCode: 'CBSE',
    gradeRange: 'all',
    examType: 'Worksheet',
    totalMarks: 10,
    duration: '30 min',
    isOfficial: true,
    isDefault: true,
    createdBy: 'system',
    sections: [
      { name: 'A', questionType: 'mcq',   count: 5, marksEach: 1, subtotal: 5,  label: 'Multiple Choice' },
      { name: 'B', questionType: 'fill',  count: 5, marksEach: 1, subtotal: 5,  label: 'Fill in the Blanks' },
    ],
  },
  {
    blueprintId: 'BP_CLASS_TEST',
    name: 'Class Test',
    boardCode: 'CBSE',
    gradeRange: 'all',
    examType: 'Class Test',
    totalMarks: 20,
    duration: '45 min',
    isOfficial: true,
    isDefault: true,
    createdBy: 'system',
    sections: [
      { name: 'A', questionType: 'mcq',   count: 10, marksEach: 1, subtotal: 10, label: 'Multiple Choice' },
      { name: 'B', questionType: 'vsaq',  count: 5,  marksEach: 2, subtotal: 10, label: 'Very Short Answer' },
    ],
  },
  {
    blueprintId: 'BP_UNIT_TEST',
    name: 'Unit Test',
    boardCode: 'CBSE',
    gradeRange: 'all',
    examType: 'Unit Test',
    totalMarks: 25,
    duration: '1 hour',
    isOfficial: true,
    isDefault: true,
    createdBy: 'system',
    sections: [
      { name: 'A', questionType: 'mcq',   count: 10, marksEach: 1, subtotal: 10, label: 'Multiple Choice' },
      { name: 'B', questionType: 'vsaq',  count: 5,  marksEach: 2, subtotal: 10, label: 'Very Short Answer' },
      { name: 'C', questionType: 'short', count: 1,  marksEach: 5, subtotal: 5,  label: 'Short Answer' },
    ],
  },
  {
    blueprintId: 'BP_PERIODIC_TEST',
    name: 'Periodic Test',
    boardCode: 'CBSE',
    gradeRange: 'all',
    examType: 'Periodic Test',
    totalMarks: 40,
    duration: '1.5 hours',
    isOfficial: true,
    isDefault: true,
    createdBy: 'system',
    sections: [
      { name: 'A', questionType: 'mcq',   count: 16, marksEach: 1, subtotal: 16, label: 'Multiple Choice' },
      { name: 'B', questionType: 'vsaq',  count: 4,  marksEach: 2, subtotal: 8,  label: 'Very Short Answer' },
      { name: 'C', questionType: 'short', count: 4,  marksEach: 3, subtotal: 12, label: 'Short Answer' },
      { name: 'D', questionType: 'long',  count: 1,  marksEach: 4, subtotal: 4,  label: 'Long Answer' },
    ],
  },
  {
    blueprintId: 'BP_MID_TERM',
    name: 'Mid Term',
    boardCode: 'CBSE',
    gradeRange: 'all',
    examType: 'Mid Term',
    totalMarks: 80,
    duration: '3 hours',
    isOfficial: true,
    isDefault: true,
    createdBy: 'system',
    sections: [
      { name: 'A', questionType: 'mcq',   count: 20, marksEach: 1, subtotal: 20, label: 'Multiple Choice' },
      { name: 'B', questionType: 'vsaq',  count: 5,  marksEach: 2, subtotal: 10, label: 'Very Short Answer' },
      { name: 'C', questionType: 'short', count: 6,  marksEach: 3, subtotal: 18, label: 'Short Answer' },
      { name: 'D', questionType: 'long',  count: 4,  marksEach: 5, subtotal: 20, label: 'Long Answer' },
      { name: 'E', questionType: 'long',  count: 2,  marksEach: 6, subtotal: 12, label: 'Case-Based / Source-Based' },
    ],
  },
  {
    blueprintId: 'BP_HALF_YEARLY',
    name: 'Half Yearly',
    boardCode: 'CBSE',
    gradeRange: 'all',
    examType: 'Half Yearly',
    totalMarks: 80,
    duration: '3 hours',
    isOfficial: true,
    isDefault: true,
    createdBy: 'system',
    sections: [
      { name: 'A', questionType: 'mcq',   count: 20, marksEach: 1, subtotal: 20, label: 'Multiple Choice' },
      { name: 'B', questionType: 'vsaq',  count: 5,  marksEach: 2, subtotal: 10, label: 'Very Short Answer' },
      { name: 'C', questionType: 'short', count: 6,  marksEach: 3, subtotal: 18, label: 'Short Answer' },
      { name: 'D', questionType: 'long',  count: 4,  marksEach: 5, subtotal: 20, label: 'Long Answer' },
      { name: 'E', questionType: 'long',  count: 2,  marksEach: 6, subtotal: 12, label: 'Case Study' },
    ],
  },
  {
    blueprintId: 'BP_PRE_BOARD',
    name: 'Pre-Board',
    boardCode: 'CBSE',
    gradeRange: '10-12',
    examType: 'Pre-Board',
    totalMarks: 80,
    duration: '3 hours',
    isOfficial: true,
    isDefault: true,
    createdBy: 'system',
    sections: [
      { name: 'A', questionType: 'mcq',   count: 20, marksEach: 1, subtotal: 20 },
      { name: 'B', questionType: 'vsaq',  count: 5,  marksEach: 2, subtotal: 10 },
      { name: 'C', questionType: 'short', count: 6,  marksEach: 3, subtotal: 18 },
      { name: 'D', questionType: 'long',  count: 4,  marksEach: 5, subtotal: 20 },
      { name: 'E', questionType: 'long',  count: 2,  marksEach: 6, subtotal: 12 },
    ],
  },
  {
    blueprintId: 'BP_FINAL_EXAM',
    name: 'Final Exam',
    boardCode: 'CBSE',
    gradeRange: 'all',
    examType: 'Final Exam',
    totalMarks: 100,
    duration: '3 hours',
    isOfficial: true,
    isDefault: true,
    createdBy: 'system',
    sections: [
      { name: 'A', questionType: 'mcq',   count: 20, marksEach: 1, subtotal: 20 },
      { name: 'B', questionType: 'vsaq',  count: 10, marksEach: 2, subtotal: 20 },
      { name: 'C', questionType: 'short', count: 7,  marksEach: 3, subtotal: 21 },
      { name: 'D', questionType: 'long',  count: 4,  marksEach: 5, subtotal: 20 },
      { name: 'E', questionType: 'long',  count: 3,  marksEach: 6, subtotal: 19 },
    ],
  },
  {
    blueprintId: 'BP_OLYMPIAD',
    name: 'Olympiad',
    boardCode: 'all',
    gradeRange: 'all',
    examType: 'Olympiad',
    totalMarks: 50,
    duration: '2 hours',
    isOfficial: true,
    isDefault: false,
    createdBy: 'system',
    sections: [
      { name: 'A', questionType: 'mcq', count: 30, marksEach: 1, subtotal: 30, label: 'Section 1: Science' },
      { name: 'B', questionType: 'mcq', count: 20, marksEach: 1, subtotal: 20, label: 'Section 2: Reasoning' },
    ],
  },
  {
    blueprintId: 'BP_QUIZ',
    name: 'Quiz',
    boardCode: 'all',
    gradeRange: 'all',
    examType: 'Quiz',
    totalMarks: 20,
    duration: '30 min',
    isOfficial: true,
    isDefault: false,
    createdBy: 'system',
    sections: [
      { name: 'A', questionType: 'mcq', count: 10, marksEach: 1, subtotal: 10 },
      { name: 'B', questionType: 'truefalse', count: 10, marksEach: 1, subtotal: 10 },
    ],
  },
];

async function col() {
  const db: Db = await getDb();
  return db.collection<BlueprintDoc>('exam_blueprints');
}

/* ── Seed system blueprints (idempotent) ──────────────────────────────────── */
export async function seedSystemBlueprints(tenantId: string, schoolId: string): Promise<void> {
  const c = await col();
  const now = new Date();
  for (const bp of SYSTEM_BLUEPRINTS) {
    await c.updateOne(
      { blueprintId: bp.blueprintId, tenantId },
      { $setOnInsert: { ...bp, tenantId, schoolId, createdAt: now, updatedAt: now } },
      { upsert: true },
    );
  }
}

/* ── Get blueprints ───────────────────────────────────────────────────────── */
export async function getBlueprints(tenantId: string, boardCode?: string): Promise<BlueprintDoc[]> {
  const c = await col();
  const filter: any = { tenantId };
  if (boardCode) filter.$or = [{ boardCode }, { boardCode: 'all' }];
  return c.find(filter).sort({ isDefault: -1, totalMarks: 1 }).toArray();
}

export async function getBlueprintById(blueprintId: string, tenantId: string): Promise<BlueprintDoc | null> {
  const c = await col();
  return c.findOne({ blueprintId, tenantId });
}

export async function createBlueprint(data: Omit<BlueprintDoc, '_id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const c = await col();
  const now = new Date();
  const result = await c.insertOne({ ...data, createdAt: now, updatedAt: now });
  return result.insertedId.toString();
}
