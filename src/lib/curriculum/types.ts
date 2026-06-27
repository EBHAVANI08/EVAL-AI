/* ─────────────────────────────────────────────────────────────────────────────
   Curriculum Registry — Type Definitions (v2)
   Production-grade academic knowledge graph types for AI Examiner Pro.
   Hierarchy: Curriculum → AcademicYear → Grade → Domain → Subject → Chapter → Topic → LO
───────────────────────────────────────────────────────────────────────────── */

/* ── Learning Outcomes ────────────────────────────────────────────────────── */
export interface LearningOutcome {
  /** Globally unique ID e.g. PHY_CE_LO_001 — used for analytics, mastery tracking */
  id: string;
  verb: string;         // Bloom's action verb e.g. "Apply", "Calculate"
  description: string;  // Full LO text e.g. "Apply Ohm's Law to solve circuit problems"
  bloomsLevel: 1 | 2 | 3 | 4 | 5 | 6;
}

/* ── Topic ────────────────────────────────────────────────────────────────── */
export interface Topic {
  id: string;
  name: string;
  learningOutcomes: LearningOutcome[];
  /** Optional topic tags for search e.g. ["electricity", "ohm-law", "numerical"] */
  tags?: string[];
}

/* ── Chapter ──────────────────────────────────────────────────────────────── */
export interface Chapter {
  id: string;
  name: string;
  topics: Topic[];
}

/* ── Subject ──────────────────────────────────────────────────────────────── */
export interface Subject {
  /** Unique canonical ID e.g. CBSE_12_SCI_PHY */
  id: string;
  name: string;
  /** Short code for display e.g. PHY */
  code: string;
  chapters: Chapter[];
  /** Subject-level tags for search */
  tags?: string[];
}

/* ── Domain ───────────────────────────────────────────────────────────────── */
export interface Domain {
  id: string;           // e.g. "sci" | "com" | "hum" | "voc"
  label: string;        // e.g. "Science"
  icon: string;         // emoji e.g. "🔬"
  description: string;  // short desc
  color: string;        // hex color for UI
  status: 'active' | 'coming_soon';
  subjects: Subject[];
}

/* ── Grade ────────────────────────────────────────────────────────────────── */
export interface Grade {
  value: string;        // e.g. "1" | "11" | "12"
  label: string;        // e.g. "Class 1" | "Class 12"
  /** True only for Grades 11 & 12 where streams exist */
  hasDomains: boolean;
  /** Only present when hasDomains = false (Grades 1–10) */
  subjects?: Subject[];
  /** Only present when hasDomains = true (Grades 11–12) */
  domains?: Domain[];
}

/* ── AcademicYear ─────────────────────────────────────────────────────────── */
export interface AcademicYear {
  year: string;           // e.g. "2025-26"
  label: string;          // e.g. "Academic Year 2025–26"
  isDefault: boolean;
  grades: Grade[];
}

/* ── Curriculum ───────────────────────────────────────────────────────────── */
export interface Curriculum {
  id: string;           // e.g. "cbse" | "icse" | "cambridge" | "ib"
  /** Unique short board code e.g. "CBSE", "ICSE", "CAIE", "IB" */
  boardCode: string;
  name: string;         // Full name
  shortName: string;    // e.g. "CBSE"
  country: string;
  flag: string;         // emoji flag
  status: 'active' | 'coming_soon';
  description: string;
  academicYears: AcademicYear[];
}

/* ── Question Status ──────────────────────────────────────────────────────── */
export type QuestionStatus = 'draft' | 'validated' | 'approved' | 'published' | 'archived';

/* ── Question Source Type ─────────────────────────────────────────────────── */
export type QuestionSourceType =
  | 'AI_GENERATED'
  | 'TEACHER_CREATED'
  | 'PREVIOUS_YEAR'
  | 'IMPORTED'
  | 'BOARD_SAMPLE';

/* ── Difficulty ───────────────────────────────────────────────────────────── */
export interface DifficultyInfo {
  /** Human-readable label */
  label: 'Easy' | 'Medium' | 'Hard';
  /**
   * Numeric score 1-100. Calibrated against student performance data.
   * Easy: 1-35, Medium: 36-65, Hard: 66-100
   */
  score: number;
}

/* ── Validation Confidence Breakdown ─────────────────────────────────────── */
export interface ValidationConfidenceBreakdown {
  /** How well each question aligns to declared subject (0–100) */
  subjectAlignment: number;
  /** How well topics match declared topics (0–100) */
  topicAlignment: number;
  /** How age/grade-appropriate the content is (0–100) */
  gradeAlignment: number;
  /** How close declared vs actual difficulty (0–100) */
  difficultyAlignment: number;
  /** Risk of generating questions already in question bank (0–100, lower = higher risk) */
  duplicateRisk: number;
}

export interface ValidationResult {
  valid: boolean;
  /** Weighted score: subject(40%) + topic(25%) + grade(15%) + difficulty(10%) + duplicate(10%) */
  confidence: number;
  breakdown: ValidationConfidenceBreakdown;
  issues: string[];
  rejectedQuestionNumbers?: number[];
  note?: string;
}

/* ── Exam Blueprint ───────────────────────────────────────────────────────── */
export interface ExamBlueprintEntry {
  questionType: string;
  count: number;
  marksEach: number;
  subtotal: number;
}

export interface ExamBlueprint {
  /** Unique blueprint ID e.g. CBSE_CLASS12_FINAL */
  blueprintId: string;
  name: string;
  boardCode: string;
  gradeValue: string;
  examType: string;
  totalMarks: number;
  duration: string;
  sections: ExamBlueprintEntry[];
  isOfficial: boolean;  // Official board-prescribed blueprint vs custom
  createdBy?: string;
}

/* ── Question Metadata ────────────────────────────────────────────────────── */
export interface QuestionMetadata {
  /** Unique question ID e.g. CBSE_12_SCI_PHY_Q001 */
  questionId: string;
  /** SHA-256 fingerprint of questionText for duplicate/similarity detection */
  questionFingerprint?: string;
  boardCode: string;
  curriculumVersion: string;    // Academic year e.g. "2025-26"
  grade: string;
  domain: string | null;
  domainLabel: string | null;
  subjectId: string;
  subject: string;
  chapter: string;
  /** Specific topic within chapter — mandatory when available */
  topic: string | null;
  /** Learning Outcome IDs covered by this question — for analytics */
  learningOutcomeIds?: string[];
  difficulty: DifficultyInfo;
  bloomsLevel: string;
  marks: number;
  status: QuestionStatus;
  sourceType: QuestionSourceType;
  /** Free-text searchable tags e.g. ["electricity", "ohm-law", "numerical"] */
  tags?: string[];
}
