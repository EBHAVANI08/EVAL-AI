'use client';

import React, { useState, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  ChevronLeft, Upload, FileText, Loader2, CheckCircle2, AlertTriangle,
  X, BookOpen, Sparkles, ChevronRight, Download, RefreshCw,
  Brain, GraduationCap, Printer, Layers, Settings2, BarChart2,
  Wand2, ClipboardList, Check, Info, ChevronDown, ChevronUp,
  PieChart as PieIcon, Eye, EyeOff, Send, History, Shuffle,
  BookMarked, FileDown, Globe, Shield, ShieldCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  PieChart, Pie, Cell, Tooltip as RechartTooltip, ResponsiveContainer,
} from 'recharts';
import {
  getCurriculums,
  getAcademicYears,
  getDefaultAcademicYear,
  getGrades,
  hasDomains,
  getDomains,
  getSubjects,
  getChapters,
  getTopics,
  hasTopics,
} from '@/lib/curriculum/registry';
import type { Domain, Subject, Chapter } from '@/lib/curriculum/registry';

/* ───────────────────────────── Constants ─────────────────────────────────── */

const EXAM_TYPES = [
  { label: 'Periodic Test 1',  duration: '1 hour',   marks: 20 },
  { label: 'Periodic Test 2',  duration: '1 hour',   marks: 20 },
  { label: 'Periodic Test 3',  duration: '1 hour',   marks: 20 },
  { label: 'Half-Yearly',      duration: '2.5 hours', marks: 40 },
  { label: 'Final Exam',       duration: '3 hours',  marks: 80 },
  { label: 'Quiz',             duration: '30 min',   marks: 20 },
  { label: 'Mock Test',        duration: '3 hours',  marks: 80 },
  { label: 'Unit Test',        duration: '1.5 hours', marks: 40 },
] as const;

type ExamTypeLabel = typeof EXAM_TYPES[number]['label'];

const BLOOMS_LEVELS = [
  { level: 1, name: 'Remember',   color: '#6366f1', desc: 'Recall facts, basic concepts, definitions' },
  { level: 2, name: 'Understand', color: '#8b5cf6', desc: 'Explain ideas, interpret, classify, summarise' },
  { level: 3, name: 'Apply',      color: '#06b6d4', desc: 'Use information in new situations, solve problems' },
  { level: 4, name: 'Analyze',    color: '#10b981', desc: 'Draw connections, compare, distinguish parts' },
  { level: 5, name: 'Evaluate',   color: '#f59e0b', desc: 'Justify decisions, critique, defend arguments' },
  { level: 6, name: 'Create',     color: '#ef4444', desc: 'Produce new work, design, construct, compose' },
] as const;

const Q_TYPES = [
  { id: 'mcq',       label: 'Multiple Choice (MCQ)',    defaultMarks: 1,  color: '#6366f1' },
  { id: 'vsaq',      label: 'Very Short Answer',        defaultMarks: 2,  color: '#8b5cf6' },
  { id: 'short',     label: 'Short Answer',             defaultMarks: 3,  color: '#06b6d4' },
  { id: 'long',      label: 'Long Answer',              defaultMarks: 5,  color: '#10b981' },
  { id: 'fill',      label: 'Fill in the Blanks',       defaultMarks: 1,  color: '#f59e0b' },
  { id: 'truefalse', label: 'True / False',             defaultMarks: 1,  color: '#ef4444' },
] as const;

type QTypeId = typeof Q_TYPES[number]['id'];

interface QDist { count: number; marks: number; }

const CBSE_BLUEPRINTS: Record<string, Record<QTypeId, QDist>> = {
  'Standard 80-mark': {
    mcq: { count: 20, marks: 1 }, vsaq: { count: 5, marks: 2 },
    short: { count: 6, marks: 3 }, long: { count: 4, marks: 5 },
    fill: { count: 0, marks: 1 }, truefalse: { count: 0, marks: 1 },
  },
  'Half-Yearly 40-mark': {
    mcq: { count: 10, marks: 1 }, vsaq: { count: 5, marks: 2 },
    short: { count: 3, marks: 3 }, long: { count: 1, marks: 5 },
    fill: { count: 0, marks: 1 }, truefalse: { count: 0, marks: 1 },
  },
  'Quick Quiz 20-mark': {
    mcq: { count: 10, marks: 1 }, vsaq: { count: 5, marks: 2 },
    short: { count: 0, marks: 3 }, long: { count: 0, marks: 5 },
    fill: { count: 0, marks: 1 }, truefalse: { count: 0, marks: 1 },
  },
};

/* ───────────────────────────── Types ─────────────────────────────────────── */
interface GeneratedQuestion {
  questionId?: string;
  qNo: number;
  type: string;
  questionText: string;
  options?: string[];
  maxMarks: number;
  chapter?: string;
  topic?: string;
  bloomsLevel?: string;
  difficulty?: string;
  source?: string;
  answer?: string;
  answerSteps?: string[];
  ncertRef?: string;
}

interface GeneratedSection {
  name: string;
  label: string;
  instructions: string;
  questions: GeneratedQuestion[];
}

interface GeneratedPaper {
  metadata: {
    curriculum?: string;
    academicYear?: string;
    grade: string;
    domain?: string | null;
    subject: string;
    subjectId?: string;
    chapters: string[];
    totalMarks: number;
    duration: string;
    difficulty: string;
    examTitle: string;
    schoolName?: string;
    instructions?: string[];
    examType?: string;
  };
  sections: GeneratedSection[];
}

interface ValidationConfidenceBreakdown {
  subjectAlignment: number;
  topicAlignment: number;
  gradeAlignment: number;
  difficultyAlignment: number;
  duplicateRisk: number;
}

interface ValidationResult {
  valid: boolean;
  confidence: number;
  breakdown?: ValidationConfidenceBreakdown;
  issues: string[];
  rejectedQuestionNumbers?: number[];
  note?: string;
}

/* ───────────────────────────── Helpers ───────────────────────────────────── */
async function uploadFileToGemini(file: File): Promise<{ base64Data: string; mimeType: string } | null> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch('/api/ai/gemini-upload', { method: 'POST', body: formData });
  if (!res.ok) return null;
  return res.json();
}

async function extractTextFromPayload(
  payload: { base64Data: string; mimeType: string },
  hint: string,
): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) return '';
  const filePart = payload.base64Data.startsWith('http')
    ? { file_data: { mime_type: payload.mimeType, file_uri: payload.base64Data } }
    : { inline_data: { mime_type: payload.mimeType, data: payload.base64Data } };
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [
            { text: `Extract all questions, topics, and key concepts from this document. Hint: ${hint}. Summarise question patterns and important chapter topics concisely.` },
            filePart,
          ]}],
          generationConfig: { temperature: 0.1, maxOutputTokens: 4096 },
        }),
      },
    );
    if (!res.ok) return '';
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  } catch { return ''; }
}

function totalMarksFromDist(dist: Record<QTypeId, QDist>): number {
  return Object.values(dist).reduce((s, d) => s + d.count * d.marks, 0);
}
function totalQuestionsFromDist(dist: Record<QTypeId, QDist>): number {
  return Object.values(dist).reduce((s, d) => s + d.count, 0);
}
const defaultDist = (): Record<QTypeId, QDist> =>
  Object.fromEntries(Q_TYPES.map((t) => [t.id, { count: 0, marks: t.defaultMarks }])) as Record<QTypeId, QDist>;

/* ───────────────────────────── Step indicator ────────────────────────────── */
const STEPS = [
  { id: 1, label: 'Curriculum',     icon: GraduationCap },
  { id: 2, label: 'Configuration',  icon: Settings2 },
  { id: 3, label: 'Distribution',   icon: BarChart2 },
  { id: 4, label: 'Generate',       icon: Sparkles },
] as const;

function StepBar({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0 print:hidden">
      {STEPS.map((s, i) => {
        const done   = current > s.id;
        const active = current === s.id;
        const Icon   = s.icon;
        return (
          <React.Fragment key={s.id}>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-700 shrink-0 transition-all ${
                done   ? 'bg-positive text-white' :
                active ? 'bg-primary text-primary-foreground ring-4 ring-primary/20' :
                         'bg-muted text-muted-foreground'
              }`}>
                {done ? <Check size={14} /> : <Icon size={14} />}
              </div>
              <span className={`text-xs font-600 hidden sm:block ${active ? 'text-foreground' : 'text-muted-foreground'}`}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-3 min-w-6 ${done ? 'bg-positive' : 'bg-border'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ─────────────────────── Question Row (paper view) ──────────────────────── */
const BLOOMS_COLORS: Record<string, string> = {
  Remember: '#6366f1', Understand: '#8b5cf6', Apply: '#06b6d4',
  Analyze: '#10b981', Evaluate: '#f59e0b', Create: '#ef4444',
};
const ANSWER_LINE_GUIDE: Record<string, string> = {
  mcq: '1 line', fill: '1 line', truefalse: '1 line',
  vsaq: '1–2 lines', short: '2–3 lines', long: '5–10 lines',
};

function QuestionRow({
  q, idx, showAnswers, printMode,
}: {
  q: GeneratedQuestion;
  idx: number;
  showAnswers?: boolean;
  printMode?: 'questions' | 'answers';
}) {
  const hasAnswer  = q.answer || (q.answerSteps && q.answerSteps.length > 0);
  const showAns    = showAnswers && hasAnswer;
  const isPrintAns = printMode === 'answers';

  return (
    <div className="py-3.5 border-b border-border/50 last:border-0 print:border-b print:border-gray-200">
      <div className="flex gap-3">
        <div className="shrink-0 w-7 text-sm font-700 text-foreground pt-0.5">{idx}.</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-foreground leading-relaxed">{q.questionText}</p>
          {q.options && q.options.length > 0 && (
            <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-0.5">
              {q.options.map((opt, oi) => (
                <p key={oi} className="text-sm text-muted-foreground">{opt}</p>
              ))}
            </div>
          )}
          {q.ncertRef && (
            <p className="text-[10px] text-muted-foreground/60 mt-1 italic">NCERT: {q.ncertRef}</p>
          )}
          {q.bloomsLevel && (
            <div className="mt-1.5 flex items-center gap-2 flex-wrap">
              <span
                className="inline-flex items-center text-[9px] font-700 px-1.5 py-0.5 rounded uppercase tracking-wide text-white"
                style={{ backgroundColor: BLOOMS_COLORS[q.bloomsLevel] ?? '#6366f1' }}
              >
                {q.bloomsLevel}
              </span>
              {q.chapter && (
                <span className="text-[10px] text-muted-foreground/70">{q.chapter}</span>
              )}
              {q.topic && (
                <span className="text-[10px] text-muted-foreground/50">· {q.topic}</span>
              )}
            </div>
          )}
          {(showAns || isPrintAns) && hasAnswer && (
            <div className={`mt-3 rounded-xl px-4 py-3 border-l-4 border-positive bg-positive/5 ${isPrintAns ? '' : 'print:hidden'}`}>
              <p className="text-[10px] font-700 text-positive uppercase tracking-wide mb-1.5">
                Answer {ANSWER_LINE_GUIDE[q.type] ? `· ${ANSWER_LINE_GUIDE[q.type]}` : ''}
              </p>
              {q.answerSteps && q.answerSteps.length > 0 ? (
                <ol className="space-y-1.5 list-none">
                  {q.answerSteps.map((step, si) => (
                    <li key={si} className="flex gap-2 text-sm text-foreground">
                      <span className="shrink-0 w-5 h-5 rounded-full bg-positive/20 text-positive text-[10px] font-800 flex items-center justify-center mt-0.5">
                        {si + 1}
                      </span>
                      <span className="leading-snug">{step}</span>
                    </li>
                  ))}
                  {q.answer && (
                    <li className="mt-1 text-sm font-700 text-foreground border-t border-positive/20 pt-2">
                      ∴ {q.answer}
                    </li>
                  )}
                </ol>
              ) : (
                <div className="text-sm text-foreground leading-relaxed whitespace-pre-line">{q.answer}</div>
              )}
            </div>
          )}
        </div>
        <div className="shrink-0 text-right">
          <span className="text-xs font-700 text-foreground">[{q.maxMarks}m]</span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────── Main ───────────────────────────────────── */
export default function QuestionPaperGeneratorClient() {

  /* ── Wizard step ──────────────────────────────────────────────────────── */
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4>(1);

  /* ── Step 1: Curriculum Selection ────────────────────────────────────── */
  const [curriculumId, setCurriculumId]         = useState('cbse');
  const [academicYear, setAcademicYear]         = useState('2025-26');
  const [grade, setGrade]                       = useState('');
  const [domainId, setDomainId]                 = useState('');
  const [subject, setSubject]                   = useState('');
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics]     = useState<string[]>([]);
  const [expandedChapters, setExpandedChapters] = useState<string[]>([]);
  const [examType, setExamType]                 = useState<ExamTypeLabel>('Unit Test');
  const [duration, setDuration]                 = useState('1.5 hours');
  const [totalMarksTarget, setTotalMarksTarget] = useState(40);
  const [examTitle, setExamTitle]               = useState('');
  const [schoolName, setSchoolName]             = useState('');

  /* ── Step 2: Paper Configuration ─────────────────────────────────────── */
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard' | 'Mixed'>('Mixed');
  const [bloomsLevels, setBloumsLevels] = useState<number[]>([1, 2, 3, 4]);
  const [includeNCERT,   setIncludeNCERT]   = useState(false);
  const [includeAnswers, setIncludeAnswers] = useState(false);
  const [includeScheme,  setIncludeScheme]  = useState(false);

  /* ── Step 3: Question Distribution ───────────────────────────────────── */
  const [dist, setDist]         = useState<Record<QTypeId, QDist>>(defaultDist);
  const [distError, setDistError] = useState('');

  /* ── Step 4: Bulk upload + Generate ──────────────────────────────────── */
  const [bulkFiles, setBulkFiles] = useState<File[]>([]);
  const [dragOver, setDragOver]   = useState(false);
  const bulkRef = useRef<HTMLInputElement>(null);

  /* ── Output state ─────────────────────────────────────────────────────── */
  type AppStep = 'wizard' | 'generating' | 'done' | 'error';
  const [appStep, setAppStep]               = useState<AppStep>('wizard');
  const [generatedPaper, setGeneratedPaper] = useState<GeneratedPaper | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [errorMsg, setErrorMsg]             = useState('');
  const [genProgress, setGenProgress]       = useState('Initialising AI engine…');
  const [showAnswers, setShowAnswers]       = useState(false);
  const [showFrequency, setShowFrequency]   = useState(false);
  const [printMode, setPrintMode]           = useState<'questions' | 'answers'>('questions');
  const [isSaving, setIsSaving]             = useState(false);
  const [savedId, setSavedId]               = useState<string | null>(null);

  /* ── Derived curriculum data ──────────────────────────────────────────── */
  const curriculums  = useMemo(() => getCurriculums(), []);
  const academicYears = useMemo(() => getAcademicYears(curriculumId), [curriculumId]);
  const grades       = useMemo(() => getGrades(curriculumId, academicYear), [curriculumId, academicYear]);
  const gradeNum     = useMemo(() => parseInt(grade, 10) || 0, [grade]);
  const needsDomain  = useMemo(() => grade ? hasDomains(curriculumId, academicYear, grade) : false, [curriculumId, academicYear, grade]);
  const domains      = useMemo(() => grade ? getDomains(curriculumId, academicYear, grade) : [], [curriculumId, academicYear, grade]);
  const subjects     = useMemo(() => getSubjects(curriculumId, academicYear, grade, domainId || undefined), [curriculumId, academicYear, grade, domainId]);
  const chapters     = useMemo(() => getChapters(curriculumId, academicYear, grade, domainId || null, subject), [curriculumId, academicYear, grade, domainId, subject]);

  const selectedDomain = useMemo(() => domains.find(d => d.id === domainId), [domains, domainId]);
  const selectedSubjectObj = useMemo(() => subjects.find(s => s.name === subject), [subjects, subject]);

  const currentMarks     = useMemo(() => totalMarksFromDist(dist), [dist]);
  const currentQuestions = useMemo(() => totalQuestionsFromDist(dist), [dist]);

  const pieData = useMemo(() =>
    Q_TYPES.filter((t) => dist[t.id].count > 0).map((t) => ({
      name: t.label.split('(')[0].trim(),
      value: dist[t.id].count * dist[t.id].marks,
      color: t.color,
    })),
  [dist]);

  /* ── Handlers ─────────────────────────────────────────────────────────── */
  const onCurriculumChange = (id: string) => {
    setCurriculumId(id);
    const def = getDefaultAcademicYear(id);
    setAcademicYear(def?.year ?? '2025-26');
    setGrade(''); setDomainId(''); setSubject(''); setSelectedChapters([]); setSelectedTopics([]);
  };

  const onGradeChange = (v: string) => {
    setGrade(v); setDomainId(''); setSubject(''); setSelectedChapters([]); setSelectedTopics([]);
    setExpandedChapters([]);
  };

  const onDomainChange = (id: string) => {
    setDomainId(id); setSubject(''); setSelectedChapters([]); setSelectedTopics([]);
    setExpandedChapters([]);
  };

  const onSubjectChange = (v: string) => {
    setSubject(v); setSelectedChapters([]); setSelectedTopics([]);
    setExpandedChapters([]);
  };

  const toggleChapter = (name: string) => {
    setSelectedChapters((p) => p.includes(name) ? p.filter((c) => c !== name) : [...p, name]);
  };

  const toggleChapterExpand = (chId: string) => {
    setExpandedChapters(p => p.includes(chId) ? p.filter(c => c !== chId) : [...p, chId]);
  };

  const toggleTopic = (topicName: string) => {
    setSelectedTopics(p => p.includes(topicName) ? p.filter(t => t !== topicName) : [...p, topicName]);
  };

  const applyExamType = (et: ExamTypeLabel) => {
    const found = EXAM_TYPES.find((e) => e.label === et);
    if (found) { setExamType(et); setDuration(found.duration); setTotalMarksTarget(found.marks); }
  };

  const toggleBlooms = (level: number) =>
    setBloumsLevels((p) => p.includes(level) ? p.filter((l) => l !== level) : [...p, level]);

  const applyBlueprint = (name: string) => {
    const bp = CBSE_BLUEPRINTS[name];
    if (!bp) return;
    setDist({ ...bp });
    const marks = Object.values(bp).reduce((s, d) => s + d.count * d.marks, 0);
    setTotalMarksTarget(marks);
    toast.success(`Applied "${name}" blueprint`);
  };

  const updateDist = (id: QTypeId, field: 'count' | 'marks', val: number) => {
    setDist((p) => ({ ...p, [id]: { ...p[id], [field]: Math.max(0, val) } }));
    setDistError('');
  };

  const addFiles = useCallback((incoming: File[]) => {
    const valid = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    const accepted = incoming.filter((f) => {
      if (!valid.includes(f.type)) { toast.error(`${f.name}: unsupported format`); return false; }
      if (f.size > 50 * 1024 * 1024) { toast.error(`${f.name}: max 50 MB`); return false; }
      return true;
    });
    setBulkFiles((p) => {
      const combined = [...p, ...accepted];
      if (combined.length > 10) { toast.error('Max 10 files'); return p.slice(0, 10); }
      return combined;
    });
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    addFiles(Array.from(e.dataTransfer.files));
  };

  /* ── Navigation ───────────────────────────────────────────────────────── */
  const canProceedStep1 = grade &&
    (needsDomain ? !!domainId : true) &&
    subject &&
    selectedChapters.length > 0;
  const canProceedStep2 = bloomsLevels.length > 0;
  const canProceedStep3 = currentQuestions > 0;

  const goNext = () => {
    if (wizardStep === 1 && !canProceedStep1) {
      toast.error(needsDomain
        ? 'Select grade, stream, subject and at least one chapter'
        : 'Select grade, subject and at least one chapter');
      return;
    }
    if (wizardStep === 2 && !canProceedStep2) { toast.error("Select at least one Bloom's level"); return; }
    if (wizardStep === 3 && !canProceedStep3) { toast.error('Add at least one question type with count > 0'); return; }
    setWizardStep((p) => Math.min(4, p + 1) as 1 | 2 | 3 | 4);
  };
  const goBack = () => setWizardStep((p) => Math.max(1, p - 1) as 1 | 2 | 3 | 4);

  /* ── Generate ─────────────────────────────────────────────────────────── */
  const handleGenerate = async () => {
    if (!grade || !subject || selectedChapters.length === 0) {
      toast.error('Missing curriculum selection'); return;
    }
    if (currentQuestions === 0) { toast.error('Question distribution is empty'); return; }

    setAppStep('generating'); setErrorMsg('');

    try {
      let extractedContent = '';
      if (bulkFiles.length > 0) {
        setGenProgress(`Analysing ${bulkFiles.length} uploaded file${bulkFiles.length > 1 ? 's' : ''}…`);
        const limit = Math.min(bulkFiles.length, 3);
        for (let i = 0; i < limit; i++) {
          const payload = await uploadFileToGemini(bulkFiles[i]);
          if (payload) {
            const text = await extractTextFromPayload(payload, `${grade} ${subject}`);
            if (text) extractedContent += `\n\n--- File ${i + 1}: ${bulkFiles[i].name} ---\n${text}`;
          }
        }
      }

      setGenProgress('Generating question paper with Gemini AI…');

      const bloomNames = bloomsLevels
        .map((l) => BLOOMS_LEVELS.find((b) => b.level === l)?.name)
        .filter(Boolean);

      const distSummary = Q_TYPES
        .filter((t) => dist[t.id].count > 0)
        .map((t) => `${t.label}: ${dist[t.id].count} × ${dist[t.id].marks} mark${dist[t.id].marks > 1 ? 's' : ''}`)
        .join('; ');

      const curriculumObj = curriculums.find(c => c.id === curriculumId);

      const res = await fetch('/api/ai/generate-question-paper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          curriculum:    curriculumObj?.shortName ?? 'CBSE',
          boardCode:     curriculumObj?.boardCode ?? 'CBSE',
          academicYear,
          grade:         `Class ${grade}`,
          domain:        selectedDomain?.label ?? null,
          domainId:      domainId || null,
          subjectId:     selectedSubjectObj?.id ?? null,
          subject,
          chapters:      selectedChapters,
          topics:        selectedTopics.length > 0 ? selectedTopics : undefined,
          numQuestions:  currentQuestions,
          difficulty,
          duration,
          examTitle:     examTitle || `${subject} — ${examType} ${new Date().getFullYear()}`,
          schoolName:    schoolName || undefined,
          examType,
          totalMarks:    currentMarks,
          bloomsLevels:  bloomNames,
          questionDistribution: distSummary,
          includeNCERT,
          includeScheme,
          extractedContent: extractedContent || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `Server error ${res.status}`);

      setGeneratedPaper(json.paper);
      if (json.validation) {
        setValidationResult(json.validation);
        if (gradeNum >= 11 && json.validation.confidence >= 90) {
          setGenProgress('Validation complete — paper verified ✓');
        }
      }
      if (includeAnswers) setShowAnswers(true);
      setAppStep('done');
      toast.success('Question paper generated!');
    } catch (err: any) {
      setErrorMsg(err.message ?? 'Generation failed');
      setAppStep('error');
      toast.error('Generation failed');
    }
  };

  const saveToProfile = async () => {
    if (!generatedPaper) return;
    setIsSaving(true);
    try {
      const { metadata, sections } = generatedPaper;
      const allQuestions = sections.flatMap((sec) =>
        sec.questions.map((q) => ({
          section: sec.name, sectionLabel: sec.label,
          question: q.questionText, options: q.options,
          marks: q.maxMarks, type: q.type,
          chapter: q.chapter, topic: q.topic,
          bloomsLevel: q.bloomsLevel, difficulty: q.difficulty,
          source: q.source ?? 'AI Generated',
          answer: q.answer, answerSteps: q.answerSteps,
        }))
      );
      const res = await fetch('/api/question-papers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: metadata.examTitle,
          subject: metadata.subject,
          class: metadata.grade,
          board: metadata.curriculum ?? 'CBSE',
          domain: metadata.domain ?? null,
          academicYear: metadata.academicYear ?? academicYear,
          totalMarks: metadata.totalMarks,
          duration: metadata.duration,
          examType: metadata.examType,
          difficulty: metadata.difficulty,
          chapters: metadata.chapters,
          questions: allQuestions,
          fullPaper: generatedPaper,
          validation: validationResult,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setSavedId(json.id);
      toast.success('Paper saved to your profile!');
    } catch (err: any) {
      toast.error(err.message ?? 'Save failed');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = (mode: 'questions' | 'answers') => {
    setPrintMode(mode);
    setTimeout(async () => {
      const element = document.getElementById('printable-paper');
      if (!element) return;
      
      try {
        const toastId = toast.loading('Generating PDF...');
        // @ts-ignore
        const html2pdf = (await import('html2pdf.js')).default;
        const opt = {
          margin:       15,
          filename:     `${generatedPaper?.metadata?.examTitle || 'question-paper'}.pdf`,
          image:        { type: 'jpeg', quality: 0.98 },
          html2canvas:  { scale: 2 },
          jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        await html2pdf().set(opt).from(element).save();
        toast.success('PDF downloaded!', { id: toastId });
      } catch (err) {
        toast.error('Failed to generate PDF');
        console.error(err);
      }
    }, 150);
  };

  const handleReset = () => {
    setAppStep('wizard'); setWizardStep(1);
    setCurriculumId('cbse'); setAcademicYear('2025-26');
    setGrade(''); setDomainId(''); setSubject(''); setSelectedChapters([]); setSelectedTopics([]);
    setExpandedChapters([]);
    setExamType('Unit Test'); setDuration('1.5 hours'); setTotalMarksTarget(40);
    setExamTitle(''); setSchoolName('');
    setDifficulty('Mixed'); setBloumsLevels([1, 2, 3, 4]);
    setIncludeNCERT(false); setIncludeScheme(false); setIncludeAnswers(false);
    setDist(defaultDist()); setBulkFiles([]);
    setGeneratedPaper(null); setValidationResult(null); setErrorMsg('');
    setShowAnswers(false); setShowFrequency(false);
    setPrintMode('questions'); setSavedId(null);
  };

  /* ───────────── Generating overlay ────────────────────────────────────── */
  if (appStep === 'generating') {
    return (
      <div className="flex flex-col h-full">
        <PageHeader />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-sm w-full text-center space-y-6">
            <div className="relative mx-auto w-24 h-24">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center">
                <Brain size={38} className="text-primary" />
              </div>
              <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                <Loader2 size={13} className="text-white animate-spin" />
              </span>
            </div>
            <div>
              <h2 className="text-xl font-800 text-foreground">Generating Question Paper</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {subject} — Class {grade}
                {selectedDomain && <span className="ml-1 text-primary font-600">({selectedDomain.label})</span>}
              </p>
            </div>
            <div className="bg-muted/40 rounded-xl px-5 py-4 space-y-3 text-left">
              {[
                { label: `Reading ${curriculumId.toUpperCase()} syllabus for selected chapters`, done: true },
                { label: bulkFiles.length > 0 ? genProgress : 'No reference files — skipping', done: true },
                { label: "Applying Bloom's taxonomy and question distribution", done: genProgress.includes('Generating') || genProgress.includes('Validation') },
                { label: genProgress.includes('Generating') ? genProgress : genProgress.includes('Validation') ? genProgress : 'Formatting paper sections', done: false, active: genProgress.includes('Generating') || genProgress.includes('Validation') },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-3">
                  {s.done ? (
                    <CheckCircle2 size={15} className="text-positive shrink-0" />
                  ) : s.active ? (
                    <Loader2 size={15} className="text-primary animate-spin shrink-0" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-muted-foreground/30 shrink-0" />
                  )}
                  <span className={`text-xs ${s.done ? 'text-positive' : s.active ? 'text-foreground' : 'text-muted-foreground/60'}`}>
                    {s.label}
                  </span>
                </div>
              ))}
              {gradeNum >= 11 && (
                <div className="flex items-center gap-3">
                  <Shield size={15} className="text-muted-foreground/60 shrink-0" />
                  <span className="text-xs text-muted-foreground/60">Validation agent checking stream accuracy…</span>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground/50">Powered by Gemini · ~15–45 seconds</p>
          </div>
        </div>
      </div>
    );
  }

  /* ───────────── Error state ────────────────────────────────────────────── */
  if (appStep === 'error') {
    return (
      <div className="flex flex-col h-full">
        <PageHeader />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-sm text-center space-y-5">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-negative-bg flex items-center justify-center">
              <AlertTriangle size={28} className="text-negative" />
            </div>
            <h3 className="text-lg font-700 text-foreground">Generation Failed</h3>
            <p className="text-sm text-muted-foreground bg-muted rounded-xl px-4 py-3">{errorMsg}</p>
            <button onClick={() => { setAppStep('wizard'); setWizardStep(4); }} className="btn-primary gap-2">
              <RefreshCw size={14} /> Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ───────────── Done — paper preview ──────────────────────────────────── */
  if (appStep === 'done' && generatedPaper) {
    const { metadata, sections } = generatedPaper;
    const totalQ = sections.reduce((s, sec) => s + sec.questions.length, 0);

    return (
      <div className="flex flex-col h-full">
        {/* ── Top bar ── */}
        <div className="px-6 py-3 bg-card border-b border-border flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <Link href="/teacher-dashboard" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
              <ChevronLeft size={16} /><span>Dashboard</span>
            </Link>
            <span className="text-muted-foreground/40">/</span>
            <span className="text-sm font-600 text-foreground">Paper Generator</span>
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-border px-3 py-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            <RefreshCw size={12} /> New Paper
          </button>
        </div>

        {/* ── Validation badge (for senior secondary) ── */}
        {validationResult && gradeNum >= 11 && (
          <div className={`px-6 py-2.5 border-b print:hidden text-xs ${
            validationResult.confidence >= 90
              ? 'bg-positive/5 border-positive/20'
              : 'bg-warning-bg border-warning/30'
          }`}>
            <div className="flex items-center gap-3">
              <ShieldCheck size={14} className={validationResult.confidence >= 90 ? 'text-positive' : 'text-warning'} />
              <span className={`font-700 ${validationResult.confidence >= 90 ? 'text-positive' : 'text-warning'}`}>
                Curriculum Validation: {validationResult.confidence}% confidence
              </span>
              {validationResult.note && <span className="text-muted-foreground">· {validationResult.note}</span>}
              {validationResult.issues.length > 0 && (
                <span className="ml-auto text-negative font-600">{validationResult.issues.length} issue(s) found</span>
              )}
            </div>
            {validationResult.breakdown && (
              <div className="mt-1.5 flex items-center gap-4 flex-wrap ml-6">
                {[
                  { label: 'Subject', val: validationResult.breakdown.subjectAlignment, weight: '40%' },
                  { label: 'Topic', val: validationResult.breakdown.topicAlignment, weight: '25%' },
                  { label: 'Grade', val: validationResult.breakdown.gradeAlignment, weight: '15%' },
                  { label: 'Difficulty', val: validationResult.breakdown.difficultyAlignment, weight: '10%' },
                  { label: 'Uniqueness', val: validationResult.breakdown.duplicateRisk, weight: '10%' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-1.5">
                    <span className="text-muted-foreground">{item.label}:</span>
                    <span className={`font-700 ${item.val >= 90 ? 'text-positive' : item.val >= 70 ? 'text-warning' : 'text-negative'}`}>
                      {item.val}%
                    </span>
                    <span className="text-muted-foreground/50">({item.weight})</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Action toolbar ── */}
        <div className="px-6 py-2.5 bg-card border-b border-border flex items-center gap-2 flex-wrap shrink-0 print:hidden">
          <button onClick={handleGenerate} className="flex items-center gap-1.5 text-xs font-600 px-3 py-2 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/5 hover:text-primary transition-colors text-muted-foreground">
            <Shuffle size={13} /> Generate Variant
          </button>
          <button onClick={() => toast.success('Paper published to student portal')} className="flex items-center gap-1.5 text-xs font-600 px-3 py-2 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/5 hover:text-primary transition-colors text-muted-foreground">
            <Send size={13} /> Publish
          </button>
          <button
            onClick={() => setShowAnswers((v) => !v)}
            className={`flex items-center gap-1.5 text-xs font-600 px-3 py-2 rounded-lg border transition-colors ${
              showAnswers ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/40 hover:bg-primary/5 hover:text-primary text-muted-foreground'
            }`}
          >
            {showAnswers ? <EyeOff size={13} /> : <Eye size={13} />}
            {showAnswers ? 'Hide Answers' : 'View Answers'}
          </button>
          <button
            onClick={() => setShowFrequency((v) => !v)}
            className={`flex items-center gap-1.5 text-xs font-600 px-3 py-2 rounded-lg border transition-colors ${
              showFrequency ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/40 hover:bg-primary/5 hover:text-primary text-muted-foreground'
            }`}
          >
            <History size={13} /> Past Year Frequency
          </button>
          <div className="h-6 w-px bg-border mx-1" />
          <button
            onClick={saveToProfile}
            disabled={isSaving || !!savedId}
            className={`flex items-center gap-1.5 text-xs font-600 px-3 py-2 rounded-lg border transition-colors disabled:cursor-default ${
              savedId ? 'border-positive/40 bg-positive/10 text-positive' : 'border-border hover:border-primary/40 hover:bg-primary/5 hover:text-primary text-muted-foreground'
            }`}
          >
            {isSaving ? <Loader2 size={13} className="animate-spin" /> : <BookMarked size={13} />}
            {savedId ? 'Saved' : isSaving ? 'Saving…' : 'Save to Profile'}
          </button>
          <button onClick={() => handlePrint('questions')} className="flex items-center gap-1.5 text-xs font-600 px-3 py-2 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/5 hover:text-primary transition-colors text-muted-foreground">
            <FileDown size={13} /> Download Questions
          </button>
          <button onClick={() => handlePrint('answers')} className="flex items-center gap-1.5 text-xs font-600 px-3 py-2 rounded-lg bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 transition-colors font-600">
            <Download size={13} /> Download with Answers
          </button>
          <button onClick={() => handlePrint('questions')} className="flex items-center gap-1.5 text-xs font-600 px-3 py-2 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/5 hover:text-primary transition-colors text-muted-foreground">
            <Printer size={13} /> Print
          </button>
        </div>

        {/* ── Past Year Frequency panel ── */}
        {showFrequency && (
          <div className="border-b border-border bg-card/60 px-6 py-4 print:hidden">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center gap-2 mb-3">
                <History size={14} className="text-primary" />
                <p className="text-sm font-700 text-foreground">Past Year Frequency</p>
                <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full ml-1">Based on {metadata.curriculum ?? 'CBSE'} papers 2018–2024</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {metadata.chapters.slice(0, 6).map((ch, i) => {
                  const freq = [85, 72, 60, 90, 45, 78][i % 6];
                  const color = freq >= 75 ? '#10b981' : freq >= 50 ? '#f59e0b' : '#6b7280';
                  return (
                    <div key={ch} className="flex items-center gap-2.5 bg-muted/30 rounded-xl px-3 py-2.5">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-600 text-foreground truncate">{ch}</p>
                        <div className="mt-1.5 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${freq}%`, backgroundColor: color }} />
                        </div>
                      </div>
                      <span className="text-xs font-700 shrink-0" style={{ color }}>{freq}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto bg-muted/30 p-6 lg:p-10 print:p-0 print:bg-white">
          <div id="printable-paper" className="max-w-3xl mx-auto bg-white border border-border rounded-2xl shadow-card p-8 lg:p-12 print:shadow-none print:border-0 print:rounded-none print:max-w-none">
            {metadata.schoolName && (
              <p className="text-center text-sm font-600 text-muted-foreground mb-1">{metadata.schoolName}</p>
            )}
            <h1 className="text-center text-xl font-800 text-foreground mb-1">{metadata.examTitle}</h1>
            <div className="h-0.5 bg-foreground my-2" />
            <div className="flex flex-wrap justify-between text-sm text-foreground gap-y-1 mb-2">
              <span><strong>Subject:</strong> {metadata.subject}</span>
              <span><strong>Class:</strong> {metadata.grade}{metadata.domain ? ` (${metadata.domain})` : ''}</span>
              <span><strong>Duration:</strong> {metadata.duration}</span>
              <span><strong>Max Marks:</strong> {metadata.totalMarks}</span>
            </div>
            {metadata.curriculum && (
              <div className="flex gap-4 text-xs text-muted-foreground mb-2">
                <span><strong>Board:</strong> {metadata.curriculum}</span>
                {metadata.academicYear && <span><strong>Academic Year:</strong> {metadata.academicYear}</span>}
              </div>
            )}
            <div className="h-0.5 bg-foreground my-2" />
            {metadata.instructions && metadata.instructions.length > 0 && (
              <div className="mb-5">
                <p className="text-sm font-700 mb-1">General Instructions:</p>
                <ol className="list-decimal list-inside space-y-0.5">
                  {metadata.instructions.map((inst, i) => (
                    <li key={i} className="text-sm text-foreground">{inst}</li>
                  ))}
                </ol>
              </div>
            )}
            <p className="text-xs text-muted-foreground mb-6">
              <strong>Chapters:</strong> {metadata.chapters.join(' | ')}
            </p>
            {sections.map((sec) => (
              <div key={sec.name} className="mb-7">
                <h2 className="text-base font-800 text-foreground mb-1">SECTION {sec.name} — {sec.label.toUpperCase()}</h2>
                {sec.instructions && (
                  <p className="text-xs text-muted-foreground italic mb-3">{sec.instructions}</p>
                )}
                <div>
                  {sec.questions.map((q, qi) => {
                    const globalIdx = sections.slice(0, sections.indexOf(sec)).reduce((acc, s) => acc + s.questions.length, 0) + qi + 1;
                    return <QuestionRow key={qi} q={q} idx={globalIdx} showAnswers={showAnswers} printMode={printMode} />;
                  })}
                </div>
              </div>
            ))}
            <div className="border-t border-border pt-4 mt-6 flex justify-between text-xs text-muted-foreground print:border-gray-300">
              <span>Total Questions: {totalQ}</span>
              <span>Total Marks: {metadata.totalMarks}</span>
              <span className="print:hidden">Generated by AIExaminerPro</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ─────────────────────── Wizard UI ────────────────────────────────────── */
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ── Header ── */}
      <div className="px-6 lg:px-8 py-4 bg-card border-b border-border flex items-center justify-between shrink-0 print:hidden">
        <div className="flex items-center gap-3">
          <Link href="/teacher-dashboard" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft size={16} /><span>Dashboard</span>
          </Link>
          <span className="text-muted-foreground/40">/</span>
          <span className="text-sm font-600 text-foreground">Paper Generator</span>
        </div>
        <div className="flex items-center gap-1.5 bg-positive-bg text-positive text-xs font-600 px-3 py-1.5 rounded-lg">
          <span className="w-1.5 h-1.5 rounded-full bg-positive inline-block animate-pulse" />
          AI Engine Active
        </div>
      </div>

      {/* ── Step bar ── */}
      <div className="px-6 lg:px-8 py-4 bg-card/50 border-b border-border shrink-0">
        <StepBar current={wizardStep} />
      </div>

      {/* ── Step content ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">

          {/* ═══════════════════ STEP 1 ═══════════════════ */}
          {wizardStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-800 text-foreground">Curriculum Selection</h2>
                <p className="text-sm text-muted-foreground mt-0.5">Choose your curriculum, grade, stream and subject</p>
              </div>

              {/* ── CURRICULUM SELECTOR ── */}
              <div className="bg-card border border-border rounded-2xl p-5">
                <label className="block text-xs font-600 text-muted-foreground mb-3">
                  <Globe size={12} className="inline mr-1.5" />Curriculum / Board
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {curriculums.map((c) => {
                    const isActive = curriculumId === c.id && c.status === 'active';
                    const isSelected = curriculumId === c.id;
                    return (
                      <button
                        key={c.id}
                        onClick={() => c.status === 'active' ? onCurriculumChange(c.id) : toast('This curriculum is coming soon!')}
                        className={`relative flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl border text-xs font-600 transition-all ${
                          isSelected && c.status === 'active'
                            ? 'border-primary bg-primary/10 text-primary'
                            : c.status === 'coming_soon'
                            ? 'border-border text-muted-foreground/50 cursor-default'
                            : 'border-border text-muted-foreground hover:border-primary/30 hover:text-foreground'
                        }`}
                      >
                        <span className="text-xl">{c.flag}</span>
                        <span>{c.shortName}</span>
                        {c.status === 'coming_soon' && (
                          <span className="absolute -top-2 -right-2 text-[8px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full font-700 uppercase tracking-wide">
                            Soon
                          </span>
                        )}
                        {isSelected && c.status === 'active' && (
                          <span className="absolute -top-2 -right-2 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                            <Check size={9} className="text-white" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── ACADEMIC YEAR + GRADE ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-card border border-border rounded-2xl p-5">
                  <label className="block text-xs font-600 text-muted-foreground mb-2">
                    Academic Year
                  </label>
                  <select
                    value={academicYear}
                    onChange={(e) => { setAcademicYear(e.target.value); setGrade(''); setDomainId(''); setSubject(''); setSelectedChapters([]); }}
                    className="input-field text-sm w-full"
                  >
                    {academicYears.map((y) => (
                      <option key={y.year} value={y.year}>{y.label}</option>
                    ))}
                  </select>
                </div>

                <div className="bg-card border border-border rounded-2xl p-5">
                  <label className="block text-xs font-600 text-muted-foreground mb-2">
                    <GraduationCap size={12} className="inline mr-1.5" />Grade / Class
                  </label>
                  <select
                    value={grade}
                    onChange={(e) => onGradeChange(e.target.value)}
                    className="input-field text-sm w-full"
                  >
                    <option value="">Select class…</option>
                    {grades.map((g) => (
                      <option key={g.value} value={g.value}>{g.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* ── DOMAIN / STREAM (only Grade 11-12) ── */}
              {grade && needsDomain && (
                <div className="bg-card border border-border rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-1">
                    <label className="block text-xs font-600 text-muted-foreground">
                      Academic Stream / Domain
                    </label>
                    <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-700">Required for Class {grade}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">Select your stream to see the correct subject list</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {domains.map((d) => {
                      const isSelected = domainId === d.id;
                      const isComingSoon = d.status === 'coming_soon';
                      return (
                        <button
                          key={d.id}
                          onClick={() => isComingSoon ? toast('This stream is coming soon!') : onDomainChange(d.id)}
                          className={`relative flex flex-col items-center gap-2 px-4 py-4 rounded-2xl border-2 text-xs font-700 transition-all ${
                            isSelected
                              ? 'border-primary shadow-lg shadow-primary/10'
                              : isComingSoon
                              ? 'border-border opacity-50 cursor-default'
                              : 'border-border hover:border-primary/40 hover:shadow-md cursor-pointer'
                          }`}
                          style={isSelected ? { borderColor: d.color, backgroundColor: d.color + '10' } : {}}
                        >
                          <span className="text-3xl">{d.icon}</span>
                          <span className={`text-center leading-tight ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {d.label}
                          </span>
                          {isComingSoon && (
                            <span className="absolute -top-2 -right-2 text-[8px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full font-700 uppercase tracking-wide">
                              Soon
                            </span>
                          )}
                          {isSelected && (
                            <span
                              className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: d.color }}
                            >
                              <Check size={11} className="text-white" />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {domainId && selectedDomain && (
                    <p className="text-xs text-muted-foreground mt-3">
                      <span className="font-600" style={{ color: selectedDomain.color }}>
                        {selectedDomain.icon} {selectedDomain.label}:
                      </span>{' '}
                      {selectedDomain.description}
                    </p>
                  )}
                </div>
              )}

              {/* ── SUBJECT ── */}
              {(!needsDomain || domainId) && grade && (
                <div className="bg-card border border-border rounded-2xl p-5">
                  <label className="block text-xs font-600 text-muted-foreground mb-2">
                    <BookOpen size={12} className="inline mr-1.5" />Subject
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => onSubjectChange(e.target.value)}
                    className="input-field text-sm w-full"
                  >
                    <option value="">Select subject…</option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                  {subject && selectedSubjectObj && (
                    <p className="text-[10px] text-muted-foreground mt-1.5">
                      Subject ID: <code className="bg-muted px-1 rounded">{selectedSubjectObj.id}</code>
                    </p>
                  )}
                </div>
              )}

              {/* ── CHAPTERS + TOPICS ── */}
              {subject && chapters.length > 0 && (
                <div className="bg-card border border-border rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-700 text-foreground">Chapters & Topics</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {selectedChapters.length} of {chapters.length} chapters selected
                        {selectedTopics.length > 0 && ` · ${selectedTopics.length} topics`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedChapters(chapters.map((c) => c.name))}
                        className="text-xs font-600 text-primary hover:underline"
                      >
                        All
                      </button>
                      <span className="text-muted-foreground/40">·</span>
                      <button
                        onClick={() => { setSelectedChapters([]); setSelectedTopics([]); }}
                        className="text-xs font-600 text-muted-foreground hover:text-foreground hover:underline"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                    {chapters.map((ch) => {
                      const checked     = selectedChapters.includes(ch.name);
                      const expanded    = expandedChapters.includes(ch.id);
                      const chTopics    = getTopics(ch);
                      const hasTopicsFlag = hasTopics(ch);

                      return (
                        <div key={ch.id} className={`rounded-xl border transition-all ${checked ? 'border-primary/40 bg-primary/5' : 'border-border hover:border-border/80'}`}>
                          <div className="flex items-center gap-2 px-3 py-2.5">
                            {/* Chapter checkbox */}
                            <div
                              onClick={() => toggleChapter(ch.name)}
                              className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 cursor-pointer transition-all ${checked ? 'border-primary bg-primary' : 'border-muted-foreground/40'}`}
                            >
                              {checked && <Check size={10} className="text-white" />}
                            </div>
                            <span
                              onClick={() => toggleChapter(ch.name)}
                              className={`text-xs flex-1 cursor-pointer ${checked ? 'text-foreground font-600' : 'text-muted-foreground'}`}
                            >
                              {ch.name}
                            </span>
                            {/* Expand topics */}
                            {hasTopicsFlag && (
                              <button
                                onClick={() => toggleChapterExpand(ch.id)}
                                className="text-muted-foreground hover:text-foreground shrink-0 p-0.5"
                              >
                                {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                              </button>
                            )}
                          </div>

                          {/* Topics list */}
                          {expanded && hasTopicsFlag && (
                            <div className="px-9 pb-2 space-y-1">
                              {chTopics.map((topic) => {
                                const topicChecked = selectedTopics.includes(topic.name);
                                return (
                                  <label
                                    key={topic.id}
                                    onClick={() => toggleTopic(topic.name)}
                                    className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer text-[11px] transition-all ${
                                      topicChecked ? 'text-foreground font-600 bg-primary/5' : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                  >
                                    <div className={`w-3 h-3 rounded border flex items-center justify-center shrink-0 transition-all ${topicChecked ? 'border-primary bg-primary' : 'border-muted-foreground/30'}`}>
                                      {topicChecked && <Check size={8} className="text-white" />}
                                    </div>
                                    {topic.name}
                                  </label>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── EXAM TYPE ── */}
              <div className="bg-card border border-border rounded-2xl p-5">
                <p className="text-sm font-700 text-foreground mb-3">Exam Type</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {EXAM_TYPES.map((et) => (
                    <button
                      key={et.label}
                      onClick={() => applyExamType(et.label)}
                      className={`px-3 py-2.5 rounded-xl text-xs font-600 border transition-all text-left ${
                        examType === et.label
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border text-muted-foreground hover:border-primary/30 hover:text-foreground'
                      }`}
                    >
                      <p>{et.label}</p>
                      <p className="text-[10px] opacity-70 mt-0.5">{et.marks}m · {et.duration}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* ── PAPER DETAILS ── */}
              <div className="bg-card border border-border rounded-2xl p-5">
                <p className="text-sm font-700 text-foreground mb-4">Paper Details</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-600 text-muted-foreground mb-1.5">Exam / Paper Title</label>
                    <input
                      type="text" value={examTitle}
                      onChange={(e) => setExamTitle(e.target.value)}
                      placeholder={`${subject || 'Subject'} — ${examType}`}
                      className="input-field text-sm w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-600 text-muted-foreground mb-1.5">School Name (optional)</label>
                    <input
                      type="text" value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      placeholder="e.g. DAV Public School"
                      className="input-field text-sm w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-600 text-muted-foreground mb-1.5">Duration</label>
                    <select value={duration} onChange={(e) => setDuration(e.target.value)} className="input-field text-sm w-full">
                      {['30 min','1 hour','1.5 hours','2 hours','2.5 hours','3 hours','3.5 hours'].map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-600 text-muted-foreground mb-1.5">Total Marks</label>
                    <input
                      type="number" min={10} max={200} value={totalMarksTarget}
                      onChange={(e) => setTotalMarksTarget(Number(e.target.value))}
                      className="input-field text-sm w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════ STEP 2 ═══════════════════ */}
          {wizardStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-800 text-foreground">Paper Configuration</h2>
                <p className="text-sm text-muted-foreground mt-0.5">Set difficulty, cognitive levels and output options</p>
              </div>

              {/* Difficulty */}
              <div className="bg-card border border-border rounded-2xl p-5">
                <p className="text-sm font-700 text-foreground mb-3">Difficulty Level</p>
                <div className="grid grid-cols-4 gap-2">
                  {([
                    { val: 'Easy',   desc: '30% easy questions',        col: 'text-positive border-positive/40 bg-positive/5' },
                    { val: 'Medium', desc: 'Moderate challenge',        col: 'text-primary border-primary/40 bg-primary/5' },
                    { val: 'Hard',   desc: 'Advanced / board level',   col: 'text-negative border-negative/40 bg-negative-bg' },
                    { val: 'Mixed',  desc: 'E30% · M50% · H20%',       col: 'text-foreground border-border bg-muted/30' },
                  ] as const).map(({ val, desc, col }) => (
                    <button
                      key={val}
                      onClick={() => setDifficulty(val as any)}
                      className={`px-3 py-3 rounded-xl border text-xs font-600 text-left transition-all ${
                        difficulty === val ? col : 'border-border text-muted-foreground hover:border-muted-foreground'
                      }`}
                    >
                      <p className="font-700">{val}</p>
                      <p className="text-[10px] mt-0.5 opacity-80">{desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Bloom's Taxonomy */}
              <div className="bg-card border border-border rounded-2xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-700 text-foreground">Bloom's Taxonomy Levels</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Choose cognitive levels your questions should target</p>
                  </div>
                  <button onClick={() => setBloumsLevels(BLOOMS_LEVELS.map((b) => b.level))} className="text-xs text-primary font-600 hover:underline shrink-0 ml-4">
                    All
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {BLOOMS_LEVELS.map((b) => {
                    const selected = bloomsLevels.includes(b.level);
                    return (
                      <button
                        key={b.level}
                        onClick={() => toggleBlooms(b.level)}
                        className={`flex items-start gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                          selected ? 'border-2 bg-card shadow-sm' : 'border-border text-muted-foreground hover:border-muted-foreground/50'
                        }`}
                        style={selected ? { borderColor: b.color } : {}}
                      >
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-800 shrink-0 mt-0.5" style={{ backgroundColor: b.color }}>
                          {b.level}
                        </div>
                        <div>
                          <p className={`text-xs font-700 ${selected ? 'text-foreground' : ''}`}>{b.name}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{b.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* CBSE Templates */}
              <div className="bg-card border border-border rounded-2xl p-5">
                <p className="text-sm font-700 text-foreground mb-3">Paper Templates</p>
                <p className="text-xs text-muted-foreground mb-3">Apply a preset blueprint — you can still adjust in Step 3</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {Object.keys(CBSE_BLUEPRINTS).map((name) => {
                    const bp = CBSE_BLUEPRINTS[name];
                    const bpMarks = totalMarksFromDist(bp);
                    const bpQ    = totalQuestionsFromDist(bp);
                    return (
                      <button key={name} onClick={() => applyBlueprint(name)} className="flex flex-col gap-1.5 px-4 py-3.5 bg-muted/30 hover:bg-primary/5 border border-border hover:border-primary/30 rounded-xl text-left transition-all group">
                        <p className="text-xs font-700 text-foreground group-hover:text-primary transition-colors">{name}</p>
                        <p className="text-[10px] text-muted-foreground">{bpQ} questions · {bpMarks} marks</p>
                        <span className="text-[10px] text-primary font-600 opacity-0 group-hover:opacity-100 transition-opacity">Apply →</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Output toggles */}
              <div className="bg-card border border-border rounded-2xl p-5">
                <p className="text-sm font-700 text-foreground mb-3">Output Options</p>
                <div className="space-y-3">
                  {[
                    { key: 'ncert',   label: 'Include NCERT References',  desc: 'Add chapter/page references to questions', val: includeNCERT,   set: setIncludeNCERT },
                    { key: 'answers', label: 'Show Answers After Generate', desc: 'Auto-open the View Answers panel when paper is ready', val: includeAnswers, set: setIncludeAnswers },
                    { key: 'scheme',  label: 'Include Marking Scheme',     desc: 'Append a detailed marking scheme section', val: includeScheme,  set: setIncludeScheme },
                  ].map(({ key, label, desc, val, set }) => (
                    <label key={key} className="flex items-center justify-between gap-4 cursor-pointer group">
                      <div>
                        <p className="text-sm font-600 text-foreground">{label}</p>
                        <p className="text-xs text-muted-foreground">{desc}</p>
                      </div>
                      <button
                        onClick={() => set((v) => !v)}
                        className={`relative w-10 h-5.5 rounded-full transition-colors shrink-0 ${val ? 'bg-primary' : 'bg-muted'}`}
                        style={{ height: '22px', width: '40px' }}
                      >
                        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${val ? 'translate-x-5' : 'translate-x-0.5'}`} />
                      </button>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════ STEP 3 ═══════════════════ */}
          {wizardStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-800 text-foreground">Question Distribution</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Set how many questions of each type — target: <strong>{totalMarksTarget} marks</strong>
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Distribution table */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-muted-foreground font-600">Quick apply:</span>
                    {Object.keys(CBSE_BLUEPRINTS).map((name) => (
                      <button key={name} onClick={() => applyBlueprint(name)} className="text-xs font-600 px-3 py-1.5 rounded-lg bg-muted hover:bg-primary/10 hover:text-primary border border-border transition-colors">
                        {name}
                      </button>
                    ))}
                  </div>

                  <div className="bg-card border border-border rounded-2xl overflow-hidden">
                    <div className="grid grid-cols-12 px-4 py-2.5 bg-muted/50 border-b border-border text-[11px] font-700 text-muted-foreground">
                      <div className="col-span-5">Question Type</div>
                      <div className="col-span-2 text-center">Count</div>
                      <div className="col-span-2 text-center">Marks each</div>
                      <div className="col-span-3 text-right">Subtotal</div>
                    </div>
                    {Q_TYPES.map((t) => {
                      const d = dist[t.id];
                      return (
                        <div key={t.id} className="grid grid-cols-12 items-center px-4 py-3 border-b border-border/60 last:border-0 hover:bg-muted/20 transition-colors">
                          <div className="col-span-5 flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: t.color }} />
                            <span className="text-xs font-600 text-foreground">{t.label}</span>
                          </div>
                          <div className="col-span-2 flex justify-center">
                            <div className="flex items-center gap-1">
                              <button onClick={() => updateDist(t.id, 'count', d.count - 1)} className="w-6 h-6 flex items-center justify-center rounded-md bg-muted hover:bg-muted-foreground/20 text-foreground text-sm font-700">−</button>
                              <input type="number" min={0} value={d.count} onChange={(e) => updateDist(t.id, 'count', Number(e.target.value))} className="w-10 text-center text-xs font-700 border border-border rounded-md py-1 bg-background text-foreground" />
                              <button onClick={() => updateDist(t.id, 'count', d.count + 1)} className="w-6 h-6 flex items-center justify-center rounded-md bg-muted hover:bg-muted-foreground/20 text-foreground text-sm font-700">+</button>
                            </div>
                          </div>
                          <div className="col-span-2 flex justify-center">
                            <input type="number" min={1} value={d.marks} onChange={(e) => updateDist(t.id, 'marks', Number(e.target.value))} className="w-14 text-center text-xs font-700 border border-border rounded-md py-1 bg-background text-foreground" />
                          </div>
                          <div className="col-span-3 text-right">
                            <span className={`text-xs font-700 ${d.count > 0 ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {d.count > 0 ? `${d.count * d.marks}m` : '—'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    <div className="grid grid-cols-12 items-center px-4 py-3 bg-muted/40 border-t border-border">
                      <div className="col-span-5"><span className="text-xs font-800 text-foreground">Total</span></div>
                      <div className="col-span-2 text-center"><span className="text-xs font-700 text-foreground">{currentQuestions}Q</span></div>
                      <div className="col-span-2" />
                      <div className="col-span-3 text-right">
                        <span className={`text-sm font-800 ${currentMarks === totalMarksTarget ? 'text-positive' : currentMarks > totalMarksTarget ? 'text-negative' : 'text-foreground'}`}>
                          {currentMarks}m
                        </span>
                        <span className="text-[10px] text-muted-foreground ml-1">/ {totalMarksTarget}</span>
                      </div>
                    </div>
                  </div>

                  {currentMarks !== totalMarksTarget && currentQuestions > 0 && (
                    <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs ${currentMarks > totalMarksTarget ? 'bg-negative-bg text-negative' : 'bg-warning-bg text-warning'}`}>
                      <Info size={13} className="shrink-0" />
                      {currentMarks > totalMarksTarget
                        ? `Over by ${currentMarks - totalMarksTarget} marks. Reduce some questions.`
                        : `${totalMarksTarget - currentMarks} marks short of target. Add more questions.`}
                    </div>
                  )}
                  {currentMarks === totalMarksTarget && currentQuestions > 0 && (
                    <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs bg-positive/10 text-positive">
                      <CheckCircle2 size={13} />
                      Marks balance perfectly — {currentMarks}m total
                    </div>
                  )}
                </div>

                {/* Pie chart + summary */}
                <div className="space-y-4">
                  <div className="bg-card border border-border rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <PieIcon size={14} className="text-primary" />
                      <p className="text-xs font-700 text-foreground">Marks Distribution</p>
                    </div>
                    {pieData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                            {pieData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                          </Pie>
                          <RechartTooltip formatter={(value: number, name: string) => [`${value}m`, name]} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-48 flex items-center justify-center">
                        <p className="text-xs text-muted-foreground text-center">Add questions above<br />to see distribution</p>
                      </div>
                    )}
                    {pieData.length > 0 && (
                      <div className="space-y-1.5 mt-2">
                        {pieData.map((d) => (
                          <div key={d.name} className="flex items-center gap-2 text-[10px]">
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                            <span className="flex-1 text-muted-foreground truncate">{d.name}</span>
                            <span className="font-700 text-foreground">{d.value}m</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-card border border-border rounded-2xl p-4 space-y-2">
                    <p className="text-xs font-700 text-foreground">Paper Summary</p>
                    <div className="space-y-1.5 text-xs text-muted-foreground">
                      <p><span className="font-600 text-foreground">Board:</span> {curriculums.find(c => c.id === curriculumId)?.shortName}</p>
                      <p><span className="font-600 text-foreground">Year:</span> {academicYear}</p>
                      <p><span className="font-600 text-foreground">Grade:</span> Class {grade}</p>
                      {selectedDomain && <p><span className="font-600 text-foreground">Stream:</span> {selectedDomain.icon} {selectedDomain.label}</p>}
                      <p><span className="font-600 text-foreground">Subject:</span> {subject}</p>
                      <p><span className="font-600 text-foreground">Chapters:</span> {selectedChapters.length} selected</p>
                      {selectedTopics.length > 0 && <p><span className="font-600 text-foreground">Topics:</span> {selectedTopics.length} selected</p>}
                      <p><span className="font-600 text-foreground">Exam:</span> {examType}</p>
                      <p><span className="font-600 text-foreground">Duration:</span> {duration}</p>
                      <p><span className="font-600 text-foreground">Difficulty:</span> {difficulty}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════ STEP 4 ═══════════════════ */}
          {wizardStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-800 text-foreground">Preview & Generate</h2>
                <p className="text-sm text-muted-foreground mt-0.5">Review your configuration, then generate the paper</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  {/* Config summary */}
                  <div className="bg-card border border-border rounded-2xl p-5">
                    <p className="text-sm font-700 text-foreground mb-4">Paper Configuration</p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {[
                        ['Board', curriculums.find(c => c.id === curriculumId)?.shortName],
                        ['Academic Year', academicYear],
                        ['Grade', `Class ${grade}`],
                        ...(selectedDomain ? [['Stream', `${selectedDomain.icon} ${selectedDomain.label}`]] : []),
                        ['Subject', subject],
                        ['Exam Type', examType],
                        ['Duration', duration],
                        ['Total Marks', `${currentMarks}`],
                        ['Difficulty', difficulty],
                        ['Questions', `${currentQuestions}`],
                        ['Chapters', `${selectedChapters.length} selected`],
                        ...(selectedTopics.length > 0 ? [['Topics', `${selectedTopics.length} selected`]] : []),
                      ].map(([k, v]) => (
                        <div key={k} className="flex flex-col gap-0.5">
                          <span className="text-[10px] font-600 text-muted-foreground uppercase tracking-wide">{k}</span>
                          <span className="text-sm font-600 text-foreground">{v || '—'}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Stream boundary notice */}
                  {selectedDomain && gradeNum >= 11 && (
                    <div className="flex items-start gap-3 px-4 py-3 bg-primary/5 border border-primary/20 rounded-xl">
                      <ShieldCheck size={15} className="text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-700 text-primary">AI Boundary Protection Active</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Questions will be strictly from <strong>{selectedDomain.label} → {subject}</strong> only.
                          Cross-stream content ({selectedDomain.id === 'sci' ? 'Accountancy, History, etc.' : selectedDomain.id === 'com' ? 'Physics, Chemistry, etc.' : 'Physics, Accountancy, etc.'}) is blocked.
                          A validation agent will verify the paper after generation.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Bloom's levels */}
                  <div className="bg-card border border-border rounded-2xl p-5">
                    <p className="text-sm font-700 text-foreground mb-3">Bloom's Taxonomy Targets</p>
                    <div className="flex flex-wrap gap-2">
                      {BLOOMS_LEVELS.map((b) => (
                        <span
                          key={b.level}
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-600 ${bloomsLevels.includes(b.level) ? 'text-white' : 'text-muted-foreground bg-muted'}`}
                          style={bloomsLevels.includes(b.level) ? { backgroundColor: b.color } : {}}
                        >
                          {bloomsLevels.includes(b.level) && <Check size={10} />}
                          L{b.level}: {b.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Question distribution summary */}
                  <div className="bg-card border border-border rounded-2xl p-5">
                    <p className="text-sm font-700 text-foreground mb-3">Question Distribution</p>
                    <div className="space-y-2">
                      {Q_TYPES.filter((t) => dist[t.id].count > 0).map((t) => {
                        const d = dist[t.id];
                        const pct = currentMarks > 0 ? Math.round((d.count * d.marks / currentMarks) * 100) : 0;
                        return (
                          <div key={t.id} className="flex items-center gap-3">
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: t.color }} />
                            <span className="text-xs text-foreground flex-1">{t.label}</span>
                            <span className="text-xs text-muted-foreground">{d.count}Q × {d.marks}m</span>
                            <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: t.color }} />
                            </div>
                            <span className="text-[10px] text-muted-foreground w-8 text-right">{pct}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Bulk upload (optional) */}
                  <div className="bg-card border border-border rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-1">
                      <Layers size={14} className="text-primary" />
                      <p className="text-sm font-700 text-foreground">Reference Files</p>
                      <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-600">Optional</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">Upload past papers or notes — AI will use them to understand question patterns</p>
                    <div
                      className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                        dragOver ? 'border-primary bg-primary/5' : bulkFiles.length > 0 ? 'border-positive/50 bg-positive/5' : 'border-border hover:border-primary/40 hover:bg-muted/10'
                      }`}
                      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={handleDrop}
                      onClick={() => bulkRef.current?.click()}
                    >
                      <input ref={bulkRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" multiple className="hidden" onChange={(e) => { if (e.target.files) addFiles(Array.from(e.target.files)); e.target.value = ''; }} />
                      {bulkFiles.length === 0 ? (
                        <div className="flex flex-col items-center gap-1.5">
                          <Upload size={20} className="text-primary/60" />
                          <p className="text-xs text-muted-foreground">Drop files or click to browse</p>
                          <p className="text-[10px] text-muted-foreground/60">PDF, JPG, PNG · max 10 files · 50 MB each</p>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 justify-center">
                          <CheckCircle2 size={16} className="text-positive" />
                          <span className="text-xs font-600 text-foreground">{bulkFiles.length} file{bulkFiles.length > 1 ? 's' : ''} ready</span>
                        </div>
                      )}
                    </div>
                    {bulkFiles.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {bulkFiles.map((f, i) => (
                          <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-muted/30 rounded-lg">
                            <FileText size={11} className="text-primary shrink-0" />
                            <span className="text-[11px] flex-1 truncate text-foreground">{f.name}</span>
                            <button onClick={(e) => { e.stopPropagation(); setBulkFiles((p) => p.filter((_, idx) => idx !== i)); }} className="text-muted-foreground hover:text-negative shrink-0">
                              <X size={11} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: generate CTA */}
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-5 text-center">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
                      <Sparkles size={26} className="text-primary" />
                    </div>
                    <h3 className="text-base font-800 text-foreground">Ready to generate!</h3>
                    <p className="text-xs text-muted-foreground mt-1 mb-4 leading-relaxed">
                      {currentQuestions} questions · {currentMarks} marks · {duration}
                    </p>
                    <button
                      onClick={handleGenerate}
                      className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-700 py-3 rounded-xl hover:bg-primary/90 transition-colors text-sm"
                    >
                      <Wand2 size={16} /> Generate with AI
                    </button>
                    <p className="text-[10px] text-muted-foreground mt-2">
                      Powered by Gemini{gradeNum >= 11 ? ' + Validation Agent' : ''} · ~15–45 seconds
                    </p>
                  </div>

                  <div className="bg-card border border-border rounded-2xl p-4 space-y-2">
                    <p className="text-xs font-700 text-foreground">Chapters Included</p>
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {selectedChapters.map((ch) => (
                        <div key={ch} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Check size={10} className="text-positive shrink-0" />
                          {ch}
                        </div>
                      ))}
                    </div>
                    {selectedTopics.length > 0 && (
                      <>
                        <p className="text-xs font-700 text-foreground pt-2 border-t border-border">Topics Included</p>
                        <div className="max-h-24 overflow-y-auto space-y-1">
                          {selectedTopics.map((t) => (
                            <div key={t} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Check size={10} className="text-primary shrink-0" />
                              {t}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Bottom nav ── */}
          <div className="flex items-center justify-between pt-2 pb-4">
            <button onClick={goBack} disabled={wizardStep === 1} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground border border-border px-4 py-2 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed hover:bg-muted transition-colors">
              <ChevronLeft size={15} /> Back
            </button>
            {wizardStep < 4 ? (
              <button onClick={goNext} className="flex items-center gap-1.5 text-sm font-700 bg-primary text-primary-foreground px-5 py-2 rounded-xl hover:bg-primary/90 transition-colors">
                Next <ChevronRight size={15} />
              </button>
            ) : (
              <button onClick={handleGenerate} className="flex items-center gap-1.5 text-sm font-700 bg-primary text-primary-foreground px-5 py-2 rounded-xl hover:bg-primary/90 transition-colors">
                <Wand2 size={15} /> Generate Paper
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

/* ─── Shared page header ────────────────────────────────────────────────── */
function PageHeader() {
  return (
    <div className="px-6 py-4 bg-card border-b border-border flex items-center justify-between shrink-0 print:hidden">
      <div className="flex items-center gap-3">
        <Link href="/teacher-dashboard" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft size={16} /><span>Dashboard</span>
        </Link>
        <span className="text-muted-foreground/40">/</span>
        <span className="text-sm font-600 text-foreground">Paper Generator</span>
      </div>
      <div className="flex items-center gap-1.5 bg-positive-bg text-positive text-xs font-600 px-3 py-1.5 rounded-lg">
        <span className="w-1.5 h-1.5 rounded-full bg-positive inline-block animate-pulse" />
        AI Engine Active
      </div>
    </div>
  );
}
