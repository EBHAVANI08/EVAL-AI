/* ─────────────────────────────────────────────────────────────────────────────
   Agent Types — Phase 4 Multi-Agent AI Pipeline
───────────────────────────────────────────────────────────────────────────── */

export interface AgentInput {
  /* Tenant context */
  tenantId: string;
  schoolId: string;
  requestedBy: string;

  /* Curriculum context */
  curriculum: string;
  boardCode: string;
  curriculumVersion: string;
  grade: string;
  gradeNum: number;
  domain: string | null;
  domainId: string | null;
  subjectId: string;
  subject: string;
  chapters: string[];
  topics: string[];              // mandatory when available

  /* Paper config */
  examType: string;
  duration: string;
  totalMarks: number;
  numQuestions: number;
  difficulty: string;
  bloomsLevels: string[];
  questionDistribution: string;
  blueprintId?: string;

  /* Paper metadata */
  examTitle: string;
  schoolName?: string;
  academicYear: string;

  /* Options */
  includeNCERT: boolean;
  includeScheme: boolean;
  extractedContent?: string;
  filePayloads?: any[];

  /* API */
  apiKey: string;
}

export interface AgentResult {
  agent: string;
  status: 'passed' | 'failed' | 'skipped' | 'warning';
  durationMs: number;
  output?: any;
  error?: string;
  warnings?: string[];
}

export interface OrchestratorOutput {
  paper: any;
  validation: {
    valid: boolean;
    confidence: number;
    breakdown: {
      subjectAlignment: number;
      topicAlignment: number;
      gradeAlignment: number;
      difficultyAlignment: number;
      duplicateRisk: number;
    };
    issues: string[];
    note?: string;
  };
  agentLog: AgentResult[];
  totalDurationMs: number;
  generationId: string;
}
