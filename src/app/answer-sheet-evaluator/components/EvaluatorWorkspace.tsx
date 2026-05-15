'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Upload, Loader2, CheckCircle2, X, AlertTriangle, Brain, RefreshCw, ScanLine, Camera } from 'lucide-react';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';
import StudentInfoPanel from './StudentInfoPanel';
import EvaluationGrid from './EvaluationGrid';
import ScoreSummaryPanel from './ScoreSummaryPanel';
import type { ExtractedPaper } from '@/app/question-paper-analyzer/components/QuestionPaperAnalyzerClient';

const ScannerCapture = dynamic(() => import('@/components/ui/ScannerCapture'), { ssr: false });
const CameraScanner = dynamic(() => import('@/components/ui/CameraScanner'), { ssr: false });

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


// Compress a dataUrl to a small thumbnail for DB storage (keeps MongoDB doc small)
async function compressThumbnail(dataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const MAX = 700;
      let { width, height } = img;
      if (width > MAX || height > MAX) {
        if (width > height) { height = Math.round((height * MAX) / width); width = MAX; }
        else { width = Math.round((width * MAX) / height); height = MAX; }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.65));
    };
    img.onerror = () => resolve(dataUrl); // fallback: store as-is
    img.src = dataUrl;
  });
}

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

async function uploadPdfToGemini(file: File): Promise<{ base64Data: string; mimeType: string }> {
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

// ── Incremental JSON object extractor ──────────────────────────────────────
// Scans accumulated text for complete {...} objects inside a JSON array and
// returns them so they can be rendered before the full array is complete.
function extractCompleteObjects(text: string, fromPos: number): { objects: any[]; newPos: number } {
  const objects: any[] = [];
  let i = fromPos;

  while (i < text.length) {
    if (text[i] !== '{') { i++; continue; }

    // Walk forward tracking depth to find the matching '}'
    let depth = 0;
    let inStr = false;
    let esc = false;
    let j = i;

    while (j < text.length) {
      const c = text[j];
      if (esc) { esc = false; j++; continue; }
      if (c === '\\' && inStr) { esc = true; j++; continue; }
      if (c === '"') { inStr = !inStr; j++; continue; }
      if (!inStr) {
        if (c === '{') depth++;
        else if (c === '}') { depth--; if (depth === 0) break; }
      }
      j++;
    }

    if (depth !== 0 || j >= text.length) break; // incomplete — wait

    try {
      const obj = JSON.parse(text.slice(i, j + 1));
      objects.push(obj);
      i = j + 1;
    } catch {
      break; // malformed — wait for more data
    }
  }

  return { objects, newPos: i };
}

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
  const [inputMode, setInputMode] = useState<'upload' | 'scan' | 'camera'>('upload');
  const [scannedPages, setScannedPages] = useState<File[]>([]);
  const [isLoadingEval, setIsLoadingEval] = useState(false);
  const [liveQuestions, setLiveQuestions] = useState<QuestionEvaluation[]>([]);
  const [livePageLabel, setLivePageLabel] = useState('');
  const [scannedImages, setScannedImages] = useState<string[]>([]); // saved camera thumbnails
  const [studentInfo, setStudentInfo] = useState<StudentInfo>({
    name: '', rollNo: '', class: '', school: '', subject: '', board: '',
  });
  const [mobilePanel, setMobilePanel] = useState<'student' | 'questions' | 'score'>('questions');
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
        if (Array.isArray(data.scannedImages) && data.scannedImages.length > 0) {
          setScannedImages(data.scannedImages);
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

  // Build vision payload for a file
  const buildVisionPayload = async (file: File): Promise<Record<string, string>> => {
    if (file.type === 'application/pdf') {
      const { base64Data, mimeType } = await uploadPdfToGemini(file);
      return { base64Data, mimeType };
    }
    const dataUri = await compressImage(file);
    const match = dataUri.match(/^data:([^;]+);base64,([\s\S]+)$/);
    if (!match) throw new Error('Failed to process image for AI');
    return { mimeType: match[1], base64Data: match[2] };
  };

  // Evaluate a page by calling Gemini directly from the browser
  const evaluatePage = async (
    visionPayload: Record<string, string>,
    prompt: string,
    onQuestion: (q: any) => void
  ): Promise<void> => {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) throw new Error('Gemini API key not configured');

    const filePart = visionPayload.fileUri
      ? { file_data: { mime_type: visionPayload.mimeType || 'application/pdf', file_uri: visionPayload.fileUri } }
      : { inline_data: { mime_type: visionPayload.mimeType, data: visionPayload.base64Data } };

    const body = {
      contents: [{ parts: [{ text: prompt }, filePart] }],
      generationConfig: { temperature: 0.1, maxOutputTokens: 65536 },
    };

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
    );

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`Gemini error (${res.status}): ${errText.slice(0, 200)}`);
    }

    const data = await res.json();
    const text: string = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    const finishReason: string = data.candidates?.[0]?.finishReason ?? 'STOP';

    if (!text) throw new Error('Gemini returned an empty response.');
    if (finishReason === 'MAX_TOKENS') {
      toast.error('AI response was cut off — some questions may be missing.');
    }

    // Try parsing as full JSON array first
    const arrStart = text.indexOf('[');
    const arrEnd = text.lastIndexOf(']');
    if (arrStart !== -1 && arrEnd !== -1) {
      try {
        const arr = JSON.parse(text.slice(arrStart, arrEnd + 1).replace(/,\s*([}\]])/g, '$1'));
        if (Array.isArray(arr)) { for (const obj of arr) onQuestion(obj); return; }
      } catch { /* fall through to object extraction */ }
    }

    // Extract individual JSON objects from text
    const { objects } = extractCompleteObjects(text, 0);
    for (const obj of objects) onQuestion(obj);
  };

  const handleEvaluate = async (directFiles?: File[], directDataUrls?: string[]) => {
    const filesToProcess = directFiles
      ?? ((inputMode === 'scan' || inputMode === 'camera') ? scannedPages : answerFile ? [answerFile] : []);
    if (filesToProcess.length === 0) return;
    setEvalStep('evaluating');
    setEvalError('');
    setLiveQuestions([]);

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
🚫 CRITICAL — READ THIS CAREFULLY:
  1. You MUST ONLY include questions you can PHYSICALLY SEE written on the answer sheet image.
  2. Do NOT create entries for questions from this reference list unless that question number is VISIBLY WRITTEN on the answer sheet.
  3. Do NOT output "Question text not provided in reference" entries. If you cannot see a question on the sheet, skip it entirely.
  4. This list is a LOOKUP TABLE for correct answers and marks — it is NOT a list of questions to output.
  5. The student may have answered only 5 questions or 30 questions — your output must match EXACTLY what is on the sheet.
Subject: ${extractedPaper.metadata.subject} | Total Marks: ${extractedPaper.metadata.totalMarks}${sectionRules}
Reference questions (lookup only — do NOT output questions not visible on the answer sheet):
${extractedPaper.questions.map((q) => `  Q.${q.qNo} [Sec ${q.section}] [${q.maxMarks}m] [${q.type}]: ${q.questionText.slice(0, 100)}`).join('\n')}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
      }

      const prompt = `You are an expert AI examiner evaluating a student answer sheet.

══════════════════════════════════════════════════════════
RULE #1 — ONLY OUTPUT WHAT YOU SEE ON THE ANSWER SHEET:
══════════════════════════════════════════════════════════
BEFORE you score anything, physically scan EVERY page of the answer sheet image from TOP to BOTTOM.
Count EVERY question number you see WRITTEN ON THE SHEET: Q.1, Q.2, Q.3 ... all the way to the last question.
Your JSON output MUST contain one entry for EVERY question number VISIBLE ON THE SHEET — no more, no less.
If the sheet has 10 questions → return 10 entries.
If the sheet has 37 questions → return 37 entries.
🚫 DO NOT include questions from a reference list that are NOT written on the answer sheet.
🚫 DO NOT create "not provided in reference" entries — if you cannot see the question, do not include it.${paperMarksHint}${knownQuestionsRef}

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
Only include a question if its question NUMBER is WRITTEN on the answer sheet (e.g., "Q.5" or "5." visible on the page).
- Question number is written AND student wrote an answer → score it normally
- Question number is written BUT the answer space is blank/crossed out → maxMarks: 0, aiScore: 0, ocrText: "[No answer]"
- Question number is NOT visible on the answer sheet AT ALL → DO NOT include it in output

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
1. Did I include ONLY questions whose question number is PHYSICALLY VISIBLE on the answer sheet?
2. Did I accidentally include questions from the reference list that are NOT on the answer sheet? If yes → remove them.
3. Do all sub-part marks sum to the correct parent total?
4. Is my output a valid JSON array with NO markdown fences?
Output the JSON array now:`;

      // ── Streaming evaluation — questions appear in real-time ──────────────
      const allRawQuestions: any[] = [];
      let globalIdx = 0;

      const buildLiveQuestion = (q: any, idx: number): QuestionEvaluation => {
        const qKeyPoints: KeyPoint[] = Array.isArray(q.keyPoints) ? q.keyPoints : [];
        const qSemanticSim = typeof q.semanticSimilarity === 'number'
          ? Math.min(100, Math.max(0, Math.round(q.semanticSimilarity))) : 70;
        const qMaxMarks = typeof q.maxMarks === 'number' ? q.maxMarks : 0;
        const qAiScore = typeof q.aiScore === 'number' ? q.aiScore : 0;
        let hybridScore = 0;
        if (qMaxMarks > 0) {
          const kpCoverage = qKeyPoints.length > 0
            ? qKeyPoints.reduce((s: number, kp: KeyPoint) => s + (kp.covered && !kp.partial ? 1 : kp.partial ? 0.5 : 0), 0) / qKeyPoints.length
            : null;
          const semRatio = qSemanticSim / 100;
          const aiRatio = qAiScore / qMaxMarks;
          const hybridRatio = kpCoverage !== null
            ? 0.40 * kpCoverage + 0.35 * semRatio + 0.25 * aiRatio
            : 0.60 * semRatio + 0.40 * aiRatio;
          hybridScore = Math.min(Math.round(hybridRatio * qMaxMarks * 2) / 2, qMaxMarks);
        }
        return {
          id: `q-${String(idx + 1).padStart(3, '0')}`,
          qNo: q.qNo || String(idx + 1),
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
      };

      for (let pageIdx = 0; pageIdx < filesToProcess.length; pageIdx++) {
        const pageLabel = filesToProcess.length > 1
          ? `Page ${pageIdx + 1}/${filesToProcess.length}`
          : 'Scanning…';
        setLivePageLabel(pageLabel);

        const visionPayload = await buildVisionPayload(filesToProcess[pageIdx]);

        await evaluatePage(visionPayload, prompt, (rawQ) => {
          allRawQuestions.push(rawQ);
          const liveQ = buildLiveQuestion(rawQ, globalIdx++);
          setLiveQuestions((prev) => [...prev, liveQ]);
        });
      }

      if (allRawQuestions.length === 0) throw new Error('No questions could be evaluated — try a clearer image.');

      // Re-build final evaluated array using same helper (IDs are now stable)
      const evaluated: QuestionEvaluation[] = allRawQuestions.map((q, i) => buildLiveQuestion(q, i));

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
        // Compress camera thumbnails for storage (only if camera pages were provided)
        let imagesToStore: string[] = [];
        if (directDataUrls && directDataUrls.length > 0) {
          imagesToStore = await Promise.all(directDataUrls.map(compressThumbnail));
          setScannedImages(imagesToStore);
        }

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
            ...(imagesToStore.length > 0 && { scannedImages: imagesToStore }),
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
    setLiveQuestions([]);
    setLivePageLabel('');
    setQuestions([]);
    setEvalError('');
    setEvalId(null);
    setScannedImages([]);
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
      <div className="flex-1 overflow-y-auto p-5 lg:p-8">
        <div className="max-w-2xl mx-auto space-y-5">

          {/* Question paper context banner */}
          {extractedPaper ? (
            <div className="space-y-2">
              <div className="flex items-center gap-3 px-4 py-3 bg-positive-bg border border-positive/20 rounded-xl">
                <CheckCircle2 size={16} className="text-positive shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-600 text-foreground">Question paper loaded</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {extractedPaper.metadata.subject} · {extractedPaper.questions.length} questions · {extractedPaper.metadata.totalMarks} marks
                  </p>
                </div>
                <button
                  onClick={() => { sessionStorage.removeItem('extractedPaper'); setExtractedPaper(null); }}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-muted"
                >
                  <X size={11} /> Clear
                </button>
              </div>
              {extractedPaper.metadata.totalMarks > 0 &&
                extractedPaper.questions.length > 0 &&
                extractedPaper.metadata.totalMarks / extractedPaper.questions.length < 0.5 && (
                <div className="flex items-start gap-2.5 px-4 py-3 bg-warning-bg border border-warning/20 rounded-xl">
                  <AlertTriangle size={13} className="text-warning shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <strong className="text-foreground">Marks may be wrong</strong> — {extractedPaper.metadata.totalMarks} marks for {extractedPaper.questions.length} questions is too low.{' '}
                    <button onClick={() => { sessionStorage.removeItem('extractedPaper'); setExtractedPaper(null); }} className="text-primary underline">Clear and re-analyze</button>.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-start gap-3 px-4 py-3 bg-warning-bg border border-warning/20 rounded-xl">
              <AlertTriangle size={15} className="text-warning shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-600 text-foreground">No question paper loaded</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  AI will evaluate from the answer sheet alone.{' '}
                  <a href="/question-paper-analyzer" className="text-primary underline hover:text-primary/80">Analyze a question paper first</a> for better accuracy.
                </p>
              </div>
            </div>
          )}

          {/* Student info form */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-card">
            <p className="section-header mb-4">Student Information</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { key: 'name',    label: 'Student Name', placeholder: 'e.g. Priya Sharma' },
                { key: 'rollNo',  label: 'Roll Number',  placeholder: 'e.g. 2024001' },
                { key: 'class',   label: 'Class',        placeholder: 'e.g. 10A' },
                { key: 'school',  label: 'School',       placeholder: 'e.g. Delhi Public School' },
                { key: 'subject', label: 'Subject',      placeholder: 'e.g. Mathematics' },
                { key: 'board',   label: 'Board',        placeholder: 'e.g. CBSE' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-600 text-muted-foreground mb-1.5">{label}</label>
                  <input
                    type="text"
                    value={studentInfo[key as keyof StudentInfo]}
                    onChange={(e) => setStudentInfo((prev) => ({ ...prev, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="input-field text-sm"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Input mode tabs */}
          <div className="flex gap-1 p-1 bg-muted rounded-xl">
            {([
              { mode: 'upload', icon: Upload, label: 'Upload File' },
              { mode: 'camera', icon: Camera, label: 'Camera Scan' },
              { mode: 'scan',   icon: ScanLine, label: 'Import Files' },
            ] as { mode: 'upload' | 'camera' | 'scan'; icon: React.ElementType; label: string }[]).map(({ mode, icon: Icon, label }) => (
              <button
                key={mode}
                onClick={() => { setInputMode(mode); setAnswerFile(null); setScannedPages([]); }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-600 transition-all ${
                  inputMode === mode
                    ? 'bg-card shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon size={14} />
                <span className="hidden xs:inline sm:inline">{label}</span>
              </button>
            ))}
          </div>

          {/* Upload mode */}
          {inputMode === 'upload' && (
            <div
              className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all cursor-pointer ${
                dragOver
                  ? 'border-primary bg-primary/5 scale-[1.01]'
                  : answerFile
                  ? 'border-positive bg-positive-bg'
                  : 'border-border hover:border-primary/40 hover:bg-muted/20'
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
                  <div className="w-14 h-14 rounded-2xl bg-positive-bg border border-positive/20 flex items-center justify-center">
                    <CheckCircle2 size={28} className="text-positive" />
                  </div>
                  <div>
                    <p className="font-600 text-foreground text-sm">{answerFile.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{(answerFile.size / 1024 / 1024).toFixed(2)} MB · Ready to evaluate</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setAnswerFile(null); }}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-negative transition-colors"
                  >
                    <X size={11} /> Remove file
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Upload size={26} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-600 text-foreground">Drop answer sheet here</p>
                    <p className="text-sm text-muted-foreground mt-1">or click to browse</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">PDF, JPG, PNG, WebP · Max 20 MB</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Camera mode — auto-evaluates on capture */}
          {inputMode === 'camera' && (
            <CameraScanner
              confirmLabel="Scan & Evaluate Now"
              onCapture={(pages) => {
                const files = pages.map((p) => p.file);
                const dataUrls = pages.map((p) => p.dataUrl);
                setScannedPages(files);
                // Auto-start evaluation immediately — pass dataUrls for DB storage
                handleEvaluate(files, dataUrls);
              }}
            />
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

          {/* Scanned/camera pages ready indicator */}
          {(inputMode === 'scan' || inputMode === 'camera') && scannedPages.length > 0 && (
            <div className="flex items-center gap-3 px-4 py-3 bg-positive-bg border border-positive/20 rounded-xl">
              <CheckCircle2 size={15} className="text-positive shrink-0" />
              <p className="text-sm font-600 text-foreground">
                {scannedPages.length} page{scannedPages.length > 1 ? 's' : ''} captured — AI will evaluate all pages in sequence
              </p>
            </div>
          )}

          {evalError && (
            <div className="flex items-start gap-2.5 px-4 py-3 bg-negative-bg border border-negative/20 rounded-xl">
              <AlertTriangle size={14} className="text-negative shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{evalError}</p>
            </div>
          )}

          <button
            onClick={() => handleEvaluate()}
            disabled={!readyToEvaluate}
            className="btn-primary w-full h-12 text-sm gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Brain size={17} />
            {(inputMode === 'scan' || inputMode === 'camera') && scannedPages.length > 1
              ? `Evaluate ${scannedPages.length} ${inputMode === 'camera' ? 'Camera' : 'Scanned'} Pages with AI`
              : 'Evaluate Answer Sheet with AI'}
          </button>

        </div>
      </div>
    );
  }

  // Evaluating step — real-time streaming display
  if (evalStep === 'evaluating') {
    const liveTotal = liveQuestions.reduce((s, q) => s + q.maxMarks, 0);
    const liveScored = liveQuestions.reduce((s, q) => s + q.aiScore, 0);

    return (
      <div className="flex-1 overflow-y-auto p-5 lg:p-8">
        {/* Header bar */}
        <div className="flex items-center gap-3 mb-6 max-w-3xl mx-auto">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center shrink-0">
            <Loader2 size={20} className="text-primary animate-spin" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-700 text-foreground">
              Real-Time Evaluation {livePageLabel ? `· ${livePageLabel}` : ''}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {liveQuestions.length === 0
                ? 'AI is reading the answer sheet…'
                : `${liveQuestions.length} question${liveQuestions.length > 1 ? 's' : ''} evaluated · ${liveScored}/${liveTotal} marks so far`}
            </p>
          </div>
          {liveQuestions.length > 0 && (
            <div className="text-right shrink-0 bg-primary/5 border border-primary/15 rounded-xl px-3 py-1.5">
              <span className="text-xl font-800 text-primary font-tabular">{liveScored}</span>
              <span className="text-sm text-muted-foreground font-500">/{liveTotal}</span>
            </div>
          )}
        </div>

        {/* Live question cards */}
        {liveQuestions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="flex gap-1.5">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-primary animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">Scanning answer sheet…</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2 max-w-3xl mx-auto pb-6">
            {liveQuestions.map((q, idx) => {
              const pct = q.maxMarks > 0 ? (q.aiScore / q.maxMarks) * 100 : 0;
              const color = pct >= 80 ? 'text-positive' : pct >= 50 ? 'text-warning' : 'text-negative';
              const barColor = pct >= 80 ? 'bg-positive' : pct >= 50 ? 'bg-warning' : 'bg-negative';
              return (
                <div
                  key={q.id}
                  className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl animate-slide-in-bottom"
                  style={{ animationDelay: `${Math.min(idx * 30, 300)}ms` }}
                >
                  <div className="w-10 shrink-0 text-center">
                    <span className="text-xs font-700 text-muted-foreground">Q.{q.qNo}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground truncate">{q.questionText || '—'}</p>
                    <div className="mt-1 h-1 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full ${barColor} rounded-full transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className={`text-sm font-700 ${color}`}>{q.aiScore}</span>
                    <span className="text-xs text-muted-foreground">/{q.maxMarks}</span>
                  </div>
                  <div className="shrink-0 text-xs text-muted-foreground w-12 text-right">
                    {q.aiConfidence}%
                  </div>
                </div>
              );
            })}
            <div className="flex items-center gap-2 py-3 text-xs text-muted-foreground">
              <Loader2 size={11} className="text-primary animate-spin" />
              Evaluating more questions…
            </div>
          </div>
        )}
      </div>
    );
  }

  // Done — show evaluation grid
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Mobile panel tab bar */}
      <div className="lg:hidden flex border-b border-border bg-card shrink-0">
        {([
          { id: 'student', label: 'Student' },
          { id: 'questions', label: 'Questions' },
          { id: 'score', label: 'Score' },
        ] as { id: typeof mobilePanel; label: string }[]).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setMobilePanel(tab.id)}
            className={`flex-1 py-2.5 text-xs font-600 border-b-2 transition-colors ${
              mobilePanel === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Reset button */}
        <div className="absolute top-0 right-0 z-10 p-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground bg-card border border-border px-3 py-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            <RefreshCw size={12} />
            <span className="hidden sm:inline">New Evaluation</span>
          </button>
        </div>

        {/* Left: Student Info Panel */}
        <div className={`lg:flex flex-col ${mobilePanel === 'student' ? 'flex flex-1' : 'hidden'}`}>
          <StudentInfoPanel
            questions={questions}
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            sections={sections}
            studentInfo={studentInfo}
            scannedImages={scannedImages}
            onUpdateStudentInfo={(updated) => setStudentInfo((prev) => ({ ...prev, ...updated }))}
          />
        </div>

        {/* Middle: Questions Grid */}
        <div className={`lg:flex flex-col flex-1 min-w-0 ${mobilePanel === 'questions' ? 'flex' : 'hidden'}`}>
          <EvaluationGrid questions={filteredQuestions} updateQuestion={updateQuestion} />
        </div>

        {/* Right: Score Panel */}
        <div className={`lg:flex flex-col ${mobilePanel === 'score' ? 'flex flex-1' : 'hidden'}`}>
          <ScoreSummaryPanel
            questions={questions}
            paperTotalMarks={extractedPaper?.metadata.totalMarks}
            evalId={evalId}
            studentInfo={studentInfo}
          />
        </div>
      </div>
    </div>
  );
}
