'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Upload, Loader2, CheckCircle2, X, AlertTriangle, Brain, RefreshCw, ScanLine } from 'lucide-react';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';
import StudentInfoPanel from './StudentInfoPanel';
import EvaluationGrid from './EvaluationGrid';
import ScoreSummaryPanel from './ScoreSummaryPanel';
import type { ExtractedPaper } from '@/app/question-paper-analyzer/components/QuestionPaperAnalyzerClient';

const ScannerCapture = dynamic(() => import('@/components/ui/ScannerCapture'), { ssr: false });

export type KeyPoint = {
  point: string;        // e.g. "Mentions Newton's second law"
  covered: boolean;     // did the student cover this?
  partial: boolean;     // partial credit for this point?
};

export type QuestionEvaluation = {
  id: string;
  qNo: string;
  section: string;
  questionText: string;
  aiAnswer: string;
  ocrText: string;
  maxMarks: number;
  aiScore: number;
  aiConfidence: number;
  aiReasoning: string;
  keyPoints: KeyPoint[];
  semanticSimilarity: number;  // 0-100, Gemini-rated semantic match between model and student answer
  hybridScore: number;          // weighted blend: 40% keyPoints + 35% semantic + 25% AI score
  teacherScore: number | null;
  comment: string;
  hasDiagram: boolean;
  language: string;
  status: 'pending' | 'reviewed' | 'flagged';
};

export type StudentInfo = {
  name: string;
  rollNo: string;
  class: string;
  school: string;
  subject: string;
  board: string;
};


async function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      // Keep high resolution for handwriting OCR accuracy
      const MAX_SIDE = 2000;
      let { width, height } = img;
      if (width > MAX_SIDE || height > MAX_SIDE) {
        if (width > height) { height = Math.round((height * MAX_SIDE) / width); width = MAX_SIDE; }
        else { width = Math.round((width * MAX_SIDE) / height); height = MAX_SIDE; }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('Canvas context unavailable')); return; }
      ctx.drawImage(img, 0, 0, width, height);
      // Use 0.92 quality — handwriting needs high fidelity for OCR
      resolve(canvas.toDataURL('image/jpeg', 0.92));
    };

    img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error('Failed to load image')); };
    img.src = objectUrl;
  });
}

async function uploadPdfToGemini(file: File): Promise<{ fileUri: string; mimeType: string }> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch('/api/ai/gemini-upload', { method: 'POST', body: formData });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `Upload failed: ${res.status}` }));
    throw new Error(err.error || `PDF upload failed: ${res.status}`);
  }
  return res.json();
}

type EvalStep = 'upload' | 'evaluating' | 'done';

export default function EvaluatorWorkspace() {
  const searchParams = useSearchParams();
  const [questions, setQuestions] = useState<QuestionEvaluation[]>([]);
  const [activeSection, setActiveSection] = useState<string>('all');
  const [evalStep, setEvalStep] = useState<EvalStep>('upload');
  const [answerFile, setAnswerFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [extractedPaper, setExtractedPaper] = useState<ExtractedPaper | null>(null);
  const [evalError, setEvalError] = useState('');
  const [evalId, setEvalId] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<'upload' | 'scan'>('upload');
  const [scannedPages, setScannedPages] = useState<File[]>([]);
  const [isLoadingEval, setIsLoadingEval] = useState(false);
  const [studentInfo, setStudentInfo] = useState<StudentInfo>({
    name: '', rollNo: '', class: '', school: '', subject: '', board: '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // If ?id= is in the URL, load the saved evaluation instead of showing upload screen
  useEffect(() => {
    const id = searchParams.get('id');
    if (!id) return;
    setIsLoadingEval(true);
    fetch(`/api/evaluations/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error('Evaluation not found');
        return r.json();
      })
      .then((data) => {
        setEvalId(data.id);
        setQuestions(data.questions || []);
        if (data.studentInfo) {
          setStudentInfo({
            name: data.studentInfo.name || '',
            rollNo: data.studentInfo.rollNo || '',
            class: data.studentInfo.class || '',
            school: data.studentInfo.school || '',
            subject: data.studentInfo.subject || '',
            board: data.studentInfo.board || '',
          });
        }
        setEvalStep('done');
      })
      .catch(() => {
        toast.error('Could not load evaluation — please try again');
      })
      .finally(() => setIsLoadingEval(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load extracted paper from sessionStorage (set by Question Paper Analyzer)
  useEffect(() => {
    const stored = sessionStorage.getItem('extractedPaper');
    if (stored) {
      try {
        const parsed: ExtractedPaper = JSON.parse(stored);
        setExtractedPaper(parsed);
        // Pre-fill student info from paper metadata
        setStudentInfo((prev) => ({
          ...prev,
          subject: parsed.metadata.subject || '',
          class: parsed.metadata.class || '',
          board: parsed.metadata.board || '',
        }));
      } catch {
        // ignore
      }
    }
  }, []);

  const handleFile = (f: File) => {
    const valid = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!valid.includes(f.type)) {
      toast.error('Please upload a PDF or image file');
      return;
    }
    const maxMB = f.type === 'application/pdf' ? 50 : 20;
    if (f.size > maxMB * 1024 * 1024) {
      toast.error(`File size must be under ${maxMB} MB`);
      return;
    }
    setAnswerFile(f);
  };

  // Evaluate a single file via Gemini and return the parsed question array
  const evaluateSingleFile = async (file: File, prompt: string): Promise<any[]> => {
    const isPdf = file.type === 'application/pdf';
    let visionPayload: Record<string, string>;

    if (isPdf) {
      const { fileUri, mimeType } = await uploadPdfToGemini(file);
      visionPayload = { fileUri, mimeType };
    } else {
      const dataUri = await compressImage(file);
      const match = dataUri.match(/^data:([^;]+);base64,([\s\S]+)$/);
      if (!match) throw new Error('Failed to process image for AI');
      visionPayload = { mimeType: match[1], base64Data: match[2] };
    }

    const response = await fetch('/api/ai/gemini-vision', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...visionPayload, prompt }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
      throw new Error(err.error || `Gemini request failed: ${response.status}`);
    }
    const { text: raw } = await response.json();

    const start = raw.indexOf('[');
    if (start === -1) throw new Error('No JSON array found in AI response');

    let parsed: any[] | null = null;
    const fullEnd = raw.lastIndexOf(']');
    if (fullEnd > start) {
      try {
        const cleaned = raw.slice(start, fullEnd + 1).replace(/,\s*([}\]])/g, '$1');
        const attempt = JSON.parse(cleaned);
        if (Array.isArray(attempt) && attempt.length > 0) parsed = attempt;
      } catch { /* fall through */ }
    }
    if (!parsed) {
      const partial = raw.slice(start);
      const lastComplete = partial.lastIndexOf('},');
      if (lastComplete > 0) {
        try {
          const salvaged = (partial.slice(0, lastComplete + 1) + ']').replace(/,\s*([}\]])/g, '$1');
          const attempt = JSON.parse(salvaged);
          if (Array.isArray(attempt) && attempt.length > 0) {
            parsed = attempt;
            toast.error(`Page truncated — recovered ${attempt.length} questions. Some may be missing.`);
          }
        } catch { /* ignore */ }
      }
    }
    if (!parsed || parsed.length === 0) throw new Error('No questions found on this page');
    return parsed;
  };

  const handleEvaluate = async () => {
    const filesToProcess = inputMode === 'scan' ? scannedPages : answerFile ? [answerFile] : [];
    if (filesToProcess.length === 0) return;
    setEvalStep('evaluating');
    setEvalError('');

    try {

      // Build section constraints text (only used for answer-any rules, NOT for limiting question count)
      let sectionRules = '';
      let paperMarksHint = '';
      let knownQuestionsRef = '';

      if (extractedPaper) {
        const constraints = extractedPaper.metadata.sectionConstraints || {};
        const constraintLines = Object.entries(constraints)
          .map(([sec, c]) => `  Section ${sec}: Answer any ${c.attemptAny} of ${c.totalQuestions} questions`)
          .join('\n');
        if (constraintLines) sectionRules = `\nSECTION ANSWER-ANY RULES:\n${constraintLines}`;

        paperMarksHint = `\nPaper subject: ${extractedPaper.metadata.subject} | Total marks: ${extractedPaper.metadata.totalMarks}`;

        // Provide questions as a reference lookup ONLY — explicitly warn it is partial
        knownQuestionsRef = `
\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
QUESTION PAPER REFERENCE — USE ONLY FOR CORRECT ANSWERS AND MARKS
⚠️ WARNING: This list has ${extractedPaper.questions.length} questions but the full paper may have 35+ questions.
⚠️ DO NOT use this count to decide how many questions to return.
⚠️ Your output MUST be based on what you READ on the answer sheet image, not this list.
Subject: ${extractedPaper.metadata.subject} | Total Marks: ${extractedPaper.metadata.totalMarks}${sectionRules}
Reference questions (partial — answer sheet may have more):
${extractedPaper.questions.map((q) => `  Q.${q.qNo} [Sec ${q.section}] [${q.maxMarks}m] [${q.type}]: ${q.questionText.slice(0, 100)}`).join('\n')}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
      }

      const prompt = `You are an expert AI examiner evaluating a student answer sheet.

══════════════════════════════════════════════════════════
RULE #1 — NO LIMITS ON QUESTION COUNT (MOST IMPORTANT):
══════════════════════════════════════════════════════════
BEFORE you score anything, physically scan EVERY page of the answer sheet image from TOP to BOTTOM.
Count EVERY question number you see written: Q.1, Q.2, Q.3 ... Q.18, Q.19, Q.20, Q.21 ... all the way to the last question.
Your JSON output MUST contain one entry for EVERY question number you find on the sheet.
If the sheet has 37 questions → return 37+ entries.
If the sheet has 20 questions → return 20+ entries.
THERE IS NO MAXIMUM. DO NOT STOP EARLY. DO NOT SKIP ANY QUESTION.${paperMarksHint}${knownQuestionsRef}

══════════════════════════════════════════════════════════
RULE #2 — CASE STUDY / MULTI-PART QUESTIONS:
══════════════════════════════════════════════════════════
Questions like Q.36, Q.37, Q.38 (worth 4 marks each in CBSE Section E) have sub-parts like (i) (ii) (iii)(a) (iii)(b).
The stated marks (e.g., 4) is the TOTAL for the whole parent question — NOT for each sub-part.
DIVIDE the total equally unless the paper shows explicit per-sub-part marks:
- 4 marks, 4 sub-parts → 1 mark each
- 4 marks, 2 sub-parts → 2 marks each
- 4 marks, 3 sub-parts → 1+1+2
VERIFY: sum of sub-part maxMarks MUST equal the parent total (Q.36 sub-parts must add up to 4, never 16).

══════════════════════════════════════════════════════════
RULE #3 — UNATTEMPTED / SKIPPED QUESTIONS:
══════════════════════════════════════════════════════════
Indian board exams allow "Answer any X of Y" choices. Students skip some questions.
- Student wrote an answer → score it, set maxMarks to the correct value
- Question is blank or skipped → maxMarks: 0, aiScore: 0, ocrText: "[No answer]"

══════════════════════════════════════════════════════════
OUTPUT FORMAT — return ONLY this JSON array, nothing else:
══════════════════════════════════════════════════════════
[
  {
    "qNo": "36(i)",
    "section": "E",
    "questionText": "Sub-question text (max 120 chars)",
    "aiAnswer": "Correct model answer (max 40 words)",
    "ocrText": "EXACT text student wrote — transcribe character by character",
    "maxMarks": 1,
    "aiScore": 1,
    "aiConfidence": 95,
    "semanticSimilarity": 82,
    "aiReasoning": "One sentence: why this score was given",
    "keyPoints": [
      { "point": "Key concept or fact required for marks", "covered": true, "partial": false },
      { "point": "Second key concept required", "covered": false, "partial": false }
    ],
    "hasDiagram": false,
    "language": "English",
    "status": "pending"
  }
]

RULES FOR semanticSimilarity:
- Rate 0-100 how closely the student's answer matches the model answer in MEANING, not just keywords
- 90-100: near-identical meaning, same concepts and depth
- 70-89: mostly correct, minor gaps or paraphrasing
- 50-69: partial understanding, significant concepts missing or wrong
- 30-49: some relevant content but mostly incorrect or incomplete
- 0-29: wrong answer, off-topic, blank, or "[No answer]"
- Same idea in different words = high score (e.g., "brain controls body" ≈ "nervous system regulator" → 75+)
- Unattempted (maxMarks: 0): always 0

RULES FOR keyPoints:
- List every distinct concept/fact that earns marks in the model answer
- For MCQ (1 mark): one entry like {"point": "Correct option is (B)", "covered": true/false, "partial": false}
- For 2-mark questions: 2 entries (one per mark)
- For 5-mark questions: 4-6 entries covering all main points
- covered: true if the student clearly stated this point
- covered: false if the student missed or got it wrong
- partial: true if the student mentioned it but incompletely (earns half credit)
- Keep each "point" under 10 words — be specific (e.g. "Names mitochondria as powerhouse" not "biology fact")

OCR RULES:
- For MCQ: transcribe exactly which option letter the student circled/ticked/wrote (e.g. "(B)" or "C")
- For maths: transcribe symbols exactly — ∫, Σ, ∞, √, fractions, superscripts
- For Hindi/regional language: transcribe in the actual script, do not translate
- For diagrams: write "[Diagram drawn: brief description]"
- Blank/skipped: write "[No answer]"

SCORING:
- Full marks for fully correct, partial for partially correct, 0 for wrong/blank
- aiConfidence < 75 OR handwriting unclear OR diagram present → set status: "flagged"
- hasDiagram: true only if the student actually drew something

FINAL COMPLETENESS CHECK before outputting:
1. Did I evaluate every question from Q.1 to the last question visible on the sheet?
2. Do all sub-part marks sum to the correct parent total?
3. Is my output a valid JSON array with NO markdown fences?
Output the JSON array now:`;

      // Evaluate all pages sequentially and merge results
      let allRawQuestions: any[] = [];
      for (let pageIdx = 0; pageIdx < filesToProcess.length; pageIdx++) {
        if (filesToProcess.length > 1) {
          toast.loading(`Evaluating page ${pageIdx + 1} of ${filesToProcess.length}…`, { id: 'page-progress' });
        }
        const pageRaw = await evaluateSingleFile(filesToProcess[pageIdx], prompt);
        allRawQuestions = [...allRawQuestions, ...pageRaw];
      }
      if (filesToProcess.length > 1) toast.dismiss('page-progress');

      if (allRawQuestions.length === 0) throw new Error('No questions could be evaluated — response may be too large. Try splitting the answer sheet into fewer pages.');

      const parsed = allRawQuestions;

      const evaluated: QuestionEvaluation[] = parsed.map((q: any, i: number) => {
        const qKeyPoints: KeyPoint[] = Array.isArray(q.keyPoints) ? q.keyPoints : [];
        const qSemanticSim = typeof q.semanticSimilarity === 'number'
          ? Math.min(100, Math.max(0, Math.round(q.semanticSimilarity))) : 70;
        const qMaxMarks = typeof q.maxMarks === 'number' ? q.maxMarks : 0;
        const qAiScore = typeof q.aiScore === 'number' ? q.aiScore : 0;

        // Hybrid score: weighted blend of key-point coverage + semantic similarity + AI score
        let hybridScore = 0;
        if (qMaxMarks > 0) {
          const kpCoverage = qKeyPoints.length > 0
            ? qKeyPoints.reduce((s, kp) => s + (kp.covered && !kp.partial ? 1 : kp.partial ? 0.5 : 0), 0) / qKeyPoints.length
            : null;
          const semRatio = qSemanticSim / 100;
          const aiRatio = qAiScore / qMaxMarks;
          const hybridRatio = kpCoverage !== null
            ? 0.40 * kpCoverage + 0.35 * semRatio + 0.25 * aiRatio
            : 0.60 * semRatio + 0.40 * aiRatio;
          hybridScore = Math.min(Math.round(hybridRatio * qMaxMarks * 2) / 2, qMaxMarks);
        }

        return {
          id: `q-${String(i + 1).padStart(3, '0')}`,
          qNo: q.qNo || String(i + 1),
          section: q.section || 'A',
          questionText: q.questionText || '',
          aiAnswer: q.aiAnswer || '',
          ocrText: q.ocrText || '',
          maxMarks: qMaxMarks,
          aiScore: qAiScore,
          aiConfidence: q.aiConfidence || 70,
          aiReasoning: q.aiReasoning || '',
          keyPoints: qKeyPoints,
          semanticSimilarity: qSemanticSim,
          hybridScore,
          teacherScore: null,
          comment: '',
          hasDiagram: q.hasDiagram || false,
          language: q.language || 'English',
          status: q.status || 'pending',
        };
      });

      // === Enforce section caps ONLY for explicit "answer any X of Y" constraints ===
      // Do NOT apply caps derived purely from paper question count — the extracted paper
      // may be incomplete, and capping would zero out valid questions from the answer sheet.
      if (extractedPaper) {
        const constraints = extractedPaper.metadata.sectionConstraints || {};

        for (const [sec, c] of Object.entries(constraints)) {
          const secPaperQs = extractedPaper.questions.filter(
            (pq) => String(pq.section) === String(sec)
          );
          if (secPaperQs.length === 0) continue;

          const avgMarksPerQ =
            secPaperQs.reduce((sum, q) => sum + q.maxMarks, 0) / secPaperQs.length;
          const sectionMax = c.attemptAny * avgMarksPerQ;

          const sectionQs = evaluated
            .map((q, idx) => ({ q, idx }))
            .filter(({ q }) => String(q.section) === String(sec) && q.maxMarks > 0);

          const sectionAllocated = sectionQs.reduce((sum, { q }) => sum + q.maxMarks, 0);

          if (sectionAllocated > sectionMax + 0.001) {
            sectionQs.sort((a, b) => b.q.aiScore - a.q.aiScore);
            let remaining = sectionMax;
            for (const { idx } of sectionQs) {
              if (remaining >= evaluated[idx].maxMarks - 0.001) {
                remaining = Math.round((remaining - evaluated[idx].maxMarks) * 100) / 100;
              } else {
                evaluated[idx].aiScore = 0;
                evaluated[idx].maxMarks = 0;
                evaluated[idx].aiReasoning += ' [Excess attempt — not counted per section rule]';
              }
            }
          }
        }
      }

      setQuestions(evaluated);
      setEvalStep('done');
      toast.success(`Evaluated ${evaluated.length} questions successfully!`);

      // Auto-save to MongoDB right after AI evaluation
      try {
        const saveRes = await fetch('/api/evaluations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentInfo,
            paperInfo: extractedPaper
              ? {
                  subject: extractedPaper.metadata.subject,
                  totalMarks: extractedPaper.metadata.totalMarks,
                  duration: extractedPaper.metadata.duration,
                  board: extractedPaper.metadata.board,
                  class: extractedPaper.metadata.class,
                }
              : {},
            questions: evaluated,
          }),
        });
        if (saveRes.ok) {
          const { id } = await saveRes.json();
          setEvalId(id);
          toast.success('Evaluation saved to database', { id: 'db-save' });
        }
      } catch {
        // Non-fatal — user can still review and manually save draft
        toast.error('Could not auto-save to database. Use "Save Draft" to retry.');
      }
    } catch (err: any) {
      const msg: string = err?.message || 'Evaluation failed';
      setEvalError(msg);
      setEvalStep('upload');
      if (msg.toLowerCase().includes('rate limit') || msg.includes('429')) {
        toast.error('Gemini rate limit — wait 30–60 seconds then retry.');
      } else if (msg.toLowerCase().includes('server error') || msg.includes('500') || msg.includes('503')) {
        toast.error('Gemini server error — try a smaller or clearer image and retry.');
      } else {
        toast.error('Evaluation failed. Please try again.');
      }
    }
  };

  const handleReset = () => {
    setEvalStep('upload');
    setAnswerFile(null);
    setScannedPages([]);
    setInputMode('upload');
    setQuestions([]);
    setEvalError('');
    setEvalId(null);
  };

  const updateQuestion = (id: string, field: 'teacherScore' | 'comment', value: number | string | null) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === id
          ? { ...q, [field]: value, status: field === 'teacherScore' ? 'reviewed' : q.status }
          : q
      )
    );
  };

  const sections = ['all', ...Array.from(new Set(questions.map((q) => q.section)))];
  const filteredQuestions = activeSection === 'all'
    ? questions
    : questions.filter((q) => q.section === activeSection);

  // Loading saved evaluation from DB
  if (isLoadingEval) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 gap-4">
        <Loader2 size={36} className="text-primary animate-spin" />
        <p className="text-muted-foreground text-sm">Loading evaluation…</p>
      </div>
    );
  }

  // Upload step
  if (evalStep === 'upload') {
    const readyToEvaluate = inputMode === 'upload' ? !!answerFile : scannedPages.length > 0;

    return (
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="max-w-2xl mx-auto">

          {/* Question paper context indicator */}
          {extractedPaper ? (
            <div className="flex items-center gap-3 p-4 bg-positive-bg border border-positive/20 rounded-xl mb-6">
              <CheckCircle2 size={18} className="text-positive shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-600 text-foreground">Question paper loaded</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {extractedPaper.metadata.subject} · {extractedPaper.questions.length} questions · {extractedPaper.metadata.totalMarks} marks
                </p>
              </div>
              <button
                onClick={() => { sessionStorage.removeItem('extractedPaper'); setExtractedPaper(null); }}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <X size={12} /> Clear
              </button>
            </div>
          ) : (
            <div className="flex items-start gap-3 p-4 bg-warning-bg border border-warning/20 rounded-xl mb-6">
              <AlertTriangle size={18} className="text-warning shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-600 text-foreground">No question paper loaded</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  AI will evaluate based on the answer sheet content alone. For better accuracy,{' '}
                  <a href="/question-paper-analyzer" className="text-primary underline">analyze the question paper first</a>.
                </p>
              </div>
            </div>
          )}

          {/* Student info form */}
          <div className="mb-6 p-4 border border-border rounded-xl bg-card">
            <p className="text-sm font-700 text-foreground mb-3">Student Information</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'name', label: 'Student Name', placeholder: 'e.g. Priya Sharma' },
                { key: 'rollNo', label: 'Roll Number', placeholder: 'e.g. 2024001' },
                { key: 'class', label: 'Class', placeholder: 'e.g. 10A' },
                { key: 'school', label: 'School', placeholder: 'e.g. Delhi Public School' },
                { key: 'subject', label: 'Subject', placeholder: 'e.g. Mathematics' },
                { key: 'board', label: 'Board', placeholder: 'e.g. CBSE' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-600 text-muted-foreground mb-1">{label}</label>
                  <input
                    type="text"
                    value={studentInfo[key as keyof StudentInfo]}
                    onChange={(e) => setStudentInfo((prev) => ({ ...prev, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full px-3 py-2 text-sm input-field rounded-lg"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Input mode tabs */}
          <div className="flex gap-1 p-1 bg-muted rounded-xl mb-5">
            <button
              onClick={() => { setInputMode('upload'); setScannedPages([]); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-600 transition-colors ${
                inputMode === 'upload' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Upload size={15} />
              Upload File
            </button>
            <button
              onClick={() => { setInputMode('scan'); setAnswerFile(null); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-600 transition-colors ${
                inputMode === 'scan' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <ScanLine size={15} />
              Import Scanned Pages
            </button>
          </div>

          {/* Upload mode */}
          {inputMode === 'upload' && (
            <>
              <div
                className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors cursor-pointer ${
                  dragOver ? 'border-primary bg-primary/5' : answerFile ? 'border-positive bg-positive-bg' : 'border-border hover:border-primary/50 hover:bg-muted/30'
                }`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                />
                {answerFile ? (
                  <div className="flex flex-col items-center gap-3">
                    <CheckCircle2 size={40} className="text-positive" />
                    <div>
                      <p className="font-600 text-foreground">{answerFile.name}</p>
                      <p className="text-sm text-muted-foreground mt-1">{(answerFile.size / 1024 / 1024).toFixed(2)} MB · Ready to evaluate</p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setAnswerFile(null); }}
                      className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                    >
                      <X size={12} /> Remove file
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Upload size={28} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-600 text-foreground">Drop answer sheet here</p>
                      <p className="text-sm text-muted-foreground mt-1">or click to browse · PDF, JPG, PNG, WebP · Max 20 MB</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Scan mode */}
          {inputMode === 'scan' && (
            <ScannerCapture
              confirmLabel="Evaluate Scanned Pages with AI"
              onCapture={(pages) => {
                setScannedPages(pages);
                toast.success(`${pages.length} page${pages.length > 1 ? 's' : ''} ready — click Evaluate below`);
              }}
            />
          )}

          {/* Scanned pages ready indicator */}
          {inputMode === 'scan' && scannedPages.length > 0 && (
            <div className="mt-4 flex items-center gap-3 p-3 bg-positive-bg border border-positive/20 rounded-xl">
              <CheckCircle2 size={16} className="text-positive shrink-0" />
              <p className="text-sm font-600 text-foreground">
                {scannedPages.length} page{scannedPages.length > 1 ? 's' : ''} captured — AI will evaluate all pages in sequence
              </p>
            </div>
          )}

          {evalError && (
            <div className="mt-4 flex items-start gap-2 p-4 bg-negative-bg rounded-lg text-sm text-red-700">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              <span>{evalError}</span>
            </div>
          )}

          <button
            onClick={handleEvaluate}
            disabled={!readyToEvaluate}
            className="mt-6 w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-600 py-3 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Brain size={18} />
            {inputMode === 'scan' && scannedPages.length > 1
              ? `Evaluate ${scannedPages.length} Scanned Pages with AI`
              : 'Evaluate Answer Sheet with AI'}
          </button>
        </div>
      </div>
    );
  }

  // Evaluating step
  if (evalStep === 'evaluating') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 gap-6">
        <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Loader2 size={36} className="text-primary animate-spin" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-700 text-foreground mb-2">Evaluating Answer Sheet…</h2>
          <p className="text-muted-foreground text-sm max-w-md">
            AI is reading the answer sheet, mapping answers to questions, and generating scores with reasoning.
          </p>
        </div>
        <div className="flex flex-col gap-2 w-full max-w-sm">
          {['Extracting text via OCR', 'Mapping answers to questions', 'Scoring each answer', 'Generating AI reasoning', 'Detecting diagrams & language'].map((s, i) => (
            <div key={s} className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 size={12} className="text-primary animate-spin shrink-0" style={{ animationDelay: `${i * 0.15}s` }} />
              {s}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Done — show evaluation grid
  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Reset button overlay */}
      <div className="absolute top-0 right-0 z-10 p-2">
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground bg-card border border-border px-3 py-1.5 rounded-lg hover:bg-muted transition-colors"
        >
          <RefreshCw size={12} />
          New Evaluation
        </button>
      </div>
      <StudentInfoPanel
        questions={questions}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        sections={sections}
        studentInfo={studentInfo}
      />
      <EvaluationGrid questions={filteredQuestions} updateQuestion={updateQuestion} />
      <ScoreSummaryPanel
        questions={questions}
        paperTotalMarks={extractedPaper?.metadata.totalMarks}
        evalId={evalId}
        studentInfo={studentInfo}
      />
    </div>
  );
}
