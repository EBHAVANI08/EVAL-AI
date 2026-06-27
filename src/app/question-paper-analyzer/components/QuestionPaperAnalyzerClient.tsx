'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  ChevronLeft, Upload, FileText, Loader2, CheckCircle2, AlertTriangle,
  ArrowRight, X, BookOpen, ScanLine, Camera, Settings2,
  Sparkles, Brain, Layers, Tags,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { callGeminiVision } from '@/lib/gemini-client';
import ExtractedQuestionsPanel from './ExtractedQuestionsPanel';
import dynamic from 'next/dynamic';

const ScannerCapture = dynamic(() => import('@/components/ui/ScannerCapture'), { ssr: false });
const CameraScanner = dynamic(() => import('@/components/ui/CameraScanner'), { ssr: false });

export interface ExtractedQuestion {
  qNo: string;           // e.g. "1", "36a", "36(i)"
  section: string;       // "A", "B", "C", "D", "E"
  questionText: string;
  maxMarks: number;
  type: 'mcq' | 'assertion-reason' | 'short' | 'theory' | 'numerical' | 'diagram' | 'case-study';
  isChoiceAlt?: boolean; // true = this is an OR/internal-choice alternative
  parentQNo?: string;    // for sub-parts: e.g. "36" for sub-parts "36(i)", "36(ii)"
}

export interface SectionConstraint {
  attemptAny: number;
  totalQuestions: number;
}

export interface PaperMetadata {
  subject: string;
  class: string;
  board: string;
  totalMarks: number;
  duration: string;
  sections: string[];
  sectionConstraints?: Record<string, SectionConstraint>;
  sectionLabels?: Record<string, string>;    // e.g. { "A": "MCQ", "B": "Short Answer" }
  sectionMarksPerQ?: Record<string, number>; // authoritative marks-per-Q from paper heading
}

export interface ExtractedPaper {
  metadata: PaperMetadata;
  questions: ExtractedQuestion[];
}

export type SectionConfig = {
  id: string;
  name: string;       // "A", "B", "C"
  label: string;      // "Objective Questions", "Short Answer", etc.
  numQuestions: number;
  marksPerQ: number;
  attemptAny: number; // 0 = all questions required
};

type Step = 'upload' | 'analyzing' | 'done' | 'error';


async function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const MAX_SIDE = 1600;
      let { width, height } = img;
      if (width > MAX_SIDE || height > MAX_SIDE) {
        if (width > height) { height = Math.round((height * MAX_SIDE) / width); width = MAX_SIDE; }
        else { width = Math.round((width * MAX_SIDE) / height); height = MAX_SIDE; }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('Canvas context unavailable')); return; }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
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

export default function QuestionPaperAnalyzerClient() {
  const [step, setStep] = useState<Step>('upload');
  const [inputMode, setInputMode] = useState<'upload' | 'scan' | 'camera'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [cameraPages, setCameraPages] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [extractedPaper, setExtractedPaper] = useState<ExtractedPaper | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeSubStep, setActiveSubStep] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Drive the sequential step animation while analyzing
  useEffect(() => {
    if (step !== 'analyzing') { setActiveSubStep(0); return; }
    setActiveSubStep(0);
    const delays = [0, 1400, 2900, 4500]; // ms when each step becomes active
    const timers = delays.map((d, i) => setTimeout(() => setActiveSubStep(i), d));
    return () => timers.forEach(clearTimeout);
  }, [step]);

  const handleFile = (f: File) => {
    const valid = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!valid.includes(f.type)) { toast.error('Please upload a PDF or image file (JPG, PNG, WebP)'); return; }
    const maxMB = f.type === 'application/pdf' ? 50 : 20;
    if (f.size > maxMB * 1024 * 1024) { toast.error(`File size must be under ${maxMB} MB`); return; }
    setFile(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  // No section config needed — AI auto-detects everything from the paper

  // ── Analyze a single file ─────────────────────────────────────────────────
  const analyzeFile = async (f: File, visionPayload?: Record<string, string>): Promise<ExtractedPaper> => {
    if (!visionPayload) {
      if (f.type === 'application/pdf') {
        const { base64Data, mimeType } = await uploadPdfToGemini(f);
        visionPayload = { base64Data, mimeType };
      } else {
        const dataUri = await compressImage(f);
        const match = dataUri.match(/^data:([^;]+);base64,([\s\S]+)$/);
        if (!match) throw new Error('Failed to process image for AI');
        visionPayload = { mimeType: match[1], base64Data: match[2] };
      }
    }

    const prompt = `You are an expert exam paper analyzer for Indian and international boards (CBSE, ICSE, State Board, IB, IGCSE, university papers, etc.). Read this ENTIRE paper from page 1 to the last page. Auto-detect the paper format — do NOT assume any fixed structure.

═══════════════════════════════════════════════════
OUTPUT — Return ONLY valid JSON, no markdown fences:
═══════════════════════════════════════════════════
{
  "metadata": {
    "subject": "Physics",
    "class": "Class 12",
    "board": "CBSE",
    "totalMarks": 80,
    "duration": "3 hours",
    "sections": ["A","B","C","D","E"],
    "sectionLabels": {
      "A": "Multiple Choice Questions (MCQ)",
      "B": "Very Short Answer (VSA)",
      "C": "Short Answer (SA)",
      "D": "Long Answer (LA)",
      "E": "Case Study Based Questions"
    },
    "sectionMarksPerQ": { "A": 1, "B": 2, "C": 3, "D": 5, "E": 4 },
    "sectionConstraints": {
      "B": { "attemptAny": 5, "totalQuestions": 8 }
    }
  },
  "questions": [
    { "qNo": "1",    "section": "A", "questionText": "...(A) opt1 (B) opt2 (C) opt3 (D) opt4", "maxMarks": 1, "type": "mcq" },
    { "qNo": "19",   "section": "A", "questionText": "Assertion (A): ... Reason (R): ...", "maxMarks": 1, "type": "assertion-reason" },
    { "qNo": "21",   "section": "B", "questionText": "...", "maxMarks": 2, "type": "short" },
    { "qNo": "26",   "section": "C", "questionText": "...", "maxMarks": 3, "type": "theory" },
    { "qNo": "36i",  "section": "E", "questionText": "(i) ...", "maxMarks": 2, "type": "case-study", "parentQNo": "36" },
    { "qNo": "36ii", "section": "E", "questionText": "(ii) ...", "maxMarks": 2, "type": "case-study", "parentQNo": "36" },
    { "qNo": "21OR", "section": "B", "questionText": "OR: ...", "maxMarks": 2, "type": "short", "isChoiceAlt": true }
  ]
}

═══════════════════════════════════════════════════
STRICT EXTRACTION RULES:
═══════════════════════════════════════════════════

RULE 1 — SCAN ALL PAGES AND SECTIONS COMPLETELY:
  Read every page. Process sections in printed order. Never skip or truncate any section.
  After extracting all questions, verify: count of questions per section must match the paper.

RULE 2 — sectionLabels (MANDATORY — must fill for EVERY section):
  Read the heading text printed above each section. Use the EXACT wording from the paper when available.
  If the paper says "Section A: Multiple Choice Questions" → label = "Multiple Choice Questions (MCQ)"
  If no heading text, infer from question type and marks per question:
    • 1 mark, choose from options (A)(B)(C)(D)     → "Multiple Choice Questions (MCQ)"
    • 1 mark, Assertion-Reason format               → "Assertion-Reason Questions"
    • 1 mark, very short / one-line answer          → "Very Short Answer (VSA)"
    • 2 marks, 2–3 sentence answers                 → "Short Answer I (SA-I)"
    • 3 marks, paragraph answers                    → "Short Answer II (SA-II)"
    • 4 marks, detailed answer or case study        → "Long Answer I / Case Study"
    • 5 marks, full derivation / essay              → "Long Answer (LA)"
    • Passage + sub-questions                       → "Case Study Based Questions"
    • Fill in the blanks                            → "Fill in the Blanks"
    • Match the column                              → "Match the Following"
  NEVER leave a sectionLabel blank. Every section MUST have a label.

RULE 3 — sectionMarksPerQ (MANDATORY):
  For each section, read the marks per question from the section heading or question list.
  The heading usually shows it as "(N × M = Total)" or "each question carries M marks".
  Set sectionMarksPerQ[sec] = M (the marks per question in that section).

RULE 4 — QUESTION TYPES (assign accurately):
  • mcq             → Multiple Choice Questions (4 options A/B/C/D)
  • assertion-reason → "Assertion (A): ... Reason (R): ..." format
  • short            → Very Short Answer, 1-2 sentence answers
  • theory           → Short/Long Answer needing explanation or derivation
  • numerical        → Calculation/problem solving
  • diagram          → Requires drawing a circuit/graph/figure/diagram
  • case-study       → Sub-part of a case study / passage-based question

RULE 5 — SUB-PARTS (CRITICAL):
  If a question number (e.g. Q.36) has sub-parts (i)(ii)(iii) or (a)(b)(c):
  → Create a SEPARATE entry for EACH sub-part
  → qNo format: "36i", "36ii" OR "36a", "36b"
  → Set parentQNo = parent question number ("36")
  → Distribute marks equally unless stated otherwise
  → Do NOT create a parent entry — only sub-part entries

RULE 6 — CASE STUDY SECTIONS:
  → Extract EACH sub-question as a separate entry with type "case-study"
  → Mark split: use stated marks per sub-part; if not stated, divide equally
  → Include the passage context in the first sub-part's questionText
  → Set parentQNo for all sub-parts

RULE 7 — INTERNAL CHOICES (OR questions):
  → Add the main question normally
  → Add the OR version with qNo suffix "OR" (e.g. "21OR") and isChoiceAlt: true
  → Both get the same maxMarks
  → Never add OR between sub-parts

RULE 8 — MCQ OPTIONS:
  Include all 4 options in questionText: "question text (A) opt1 (B) opt2 (C) opt3 (D) opt4"
  Truncate to 200 chars total but keep all 4 options visible.

RULE 9 — MARKS ACCURACY (CRITICAL):
  Read marks from the paper — they are always printed next to the question number or in the section heading.
  Sub-parts must sum to the parent question's total marks.
  Never guess marks — always read from the paper.
  sectionMarksPerQ must match what you actually see printed.

RULE 9b — totalMarks MUST be the ACTUAL EXAM TOTAL (not the sum-of-all-questions total):
  For sections with "attempt any N" constraint:   contribution = N × marksPerQ
  For sections where all questions are required:  contribution = totalQuestions × marksPerQ
  metadata.totalMarks = SUM of each section's contribution.
  Example: Section A (20 MCQ, all required, 1m each) = 20; Section B (8 qs, attempt any 5, 2m each) = 10
  → totalMarks = 20 + 10 = 30, NOT 20 + 16 = 36.

RULE 10 — sectionConstraints (CRITICAL — read section instructions carefully):
  For EVERY section, look for the instruction line near the section heading. Common patterns:
    • "Answer any FIVE of the following"        → attemptAny: 5
    • "Answer any TWO of the following"         → attemptAny: 2
    • "Answer any THREE of the following"       → attemptAny: 3
    • "Answer ALL the following questions"      → do NOT add a constraint (all required)
    • "All Parts are compulsory"                → do NOT add a constraint (all required)
    • "(5 × 2 = 10)" means 5 attempted × 2 marks → attemptAny: 5, even if more questions are listed
    • "(2 × 5 = 10)" means 2 attempted × 5 marks → attemptAny: 2
  Cross-check: "(N × M = total)" → N is attemptAny, count actually printed questions → totalQuestions.
  Indian State Board papers frequently use "Answer any X" — never skip reading this line.
  Only add a sectionConstraint entry when there is an explicit "Answer any X" instruction.

RULE 11 — ACCURACY SELF-CHECK before outputting:
  For each section, verify:
    a) Count of questions in the questions array matches the count printed in the paper
    b) marks per question matches sectionMarksPerQ
    c) sectionLabel is filled with a meaningful description (not empty)
    d) If "(N × M = total)" appears in heading, N is in sectionConstraints.attemptAny
  If any check fails, correct it before outputting.

RULE 12 — Return ONLY the JSON object. No markdown. No explanation. No extra text.`;

    const { text: raw, finishReason } = await callGeminiVision({ ...visionPayload, prompt });

    const start = raw.indexOf('{');
    if (start === -1) throw new Error(`No JSON found in AI response. Raw (first 300 chars): ${raw.slice(0, 300)}`);

    let parsed: ExtractedPaper | null = null;
    const fullEnd = raw.lastIndexOf('}');
    if (fullEnd > start) {
      try {
        const cleaned = raw.slice(start, fullEnd + 1).replace(/,\s*([}\]])/g, '$1');
        const attempt = JSON.parse(cleaned);
        if (attempt.questions && Array.isArray(attempt.questions) && attempt.questions.length > 0) parsed = attempt;
      } catch { /* fall through */ }
    }

    if (!parsed) {
      const partial = raw.slice(start);
      const lastQ = partial.lastIndexOf('},');
      if (lastQ > 0) {
        try {
          const salvaged = (partial.slice(0, lastQ + 1) + ']}').replace(/,\s*([}\]])/g, '$1');
          const attempt = JSON.parse(salvaged);
          if (attempt.questions && Array.isArray(attempt.questions) && attempt.questions.length > 0) parsed = attempt;
        } catch { /* ignore */ }
      }
    }

    if (!parsed || !Array.isArray(parsed.questions) || parsed.questions.length === 0) {
      throw new Error('Could not extract questions from AI response. Try uploading a clearer image or fewer pages.');
    }

    if (finishReason === 'MAX_TOKENS') toast.error('AI response was cut off — running section-by-section recovery...');

    // Multi-pass: fill missing sections
    const emptySections = (parsed.metadata.sections || []).filter(
      (sec) => !parsed!.questions.some((q) => q.section === sec)
    );
    if (emptySections.length > 0) {
      toast.loading(`Extracting missing sections: ${emptySections.join(', ')}…`, { id: 'section-refetch' });
      for (const sec of emptySections) {
        try {
          const sectionPrompt = `Extract ONLY the questions from Section ${sec} of this exam paper.
Read the marks for each question directly from the paper (printed next to question number).

Return ONLY a valid JSON array (no markdown fences):
[
  { "qNo": "19", "section": "${sec}", "questionText": "...(max 200 chars)", "maxMarks": 2, "type": "short" }
]

RULES:
1. Section ${sec} questions ONLY — include every single one.
2. Read marks from paper — do NOT guess.
3. type: mcq | assertion-reason | short | theory | numerical | diagram | case-study
4. If question has sub-parts (i)(ii) or (a)(b): separate entry per sub-part, set parentQNo to parent number.
5. OR/internal choices: add main question, then OR version with qNo suffix "OR" and isChoiceAlt: true.
6. MCQ: include all 4 options in questionText.
7. questionText: max 200 chars.
8. Return ONLY the JSON array. No explanation.`;
          const { text: secRaw } = await callGeminiVision({ ...visionPayload, prompt: sectionPrompt });
          const arrStart = secRaw.indexOf('[');
          const arrEnd = secRaw.lastIndexOf(']');
          if (arrStart === -1 || arrEnd === -1) continue;
          const secQuestions = JSON.parse(secRaw.slice(arrStart, arrEnd + 1).replace(/,\s*([}\]])/g, '$1'));
          if (Array.isArray(secQuestions) && secQuestions.length > 0) parsed.questions.push(...secQuestions);
        } catch { /* skip */ }
      }
      toast.dismiss('section-refetch');
    }

    return parsed;
  };

  const handleAnalyze = async () => {
    const filesToProcess = inputMode === 'camera' ? cameraPages : file ? [file] : [];
    if (filesToProcess.length === 0) return;
    setStep('analyzing');
    setErrorMsg('');
    try {
      let merged: ExtractedPaper | null = null;
      for (let i = 0; i < filesToProcess.length; i++) {
        if (filesToProcess.length > 1) toast.loading(`Analyzing page ${i + 1} of ${filesToProcess.length}…`, { id: 'page-progress' });
        const result = await analyzeFile(filesToProcess[i]);
        if (!merged) { merged = result; } else { merged.questions.push(...result.questions); }
      }
      if (filesToProcess.length > 1) toast.dismiss('page-progress');
      if (!merged) throw new Error('No data extracted');
      setExtractedPaper(merged);
      setStep('done');
      toast.success(`Extracted ${merged.questions.length} questions successfully!`);
    } catch (err: any) {
      const msg: string = err?.message || 'Failed to analyze question paper';
      setErrorMsg(msg);
      setStep('error');
      if (msg.toLowerCase().includes('rate limit') || msg.includes('429')) {
        toast.error('Gemini rate limit — wait 30–60 seconds and try again.');
      } else if (msg.toLowerCase().includes('server error') || msg.includes('500')) {
        toast.error('Gemini server error — try a smaller/clearer image and retry.');
      } else {
        toast.error('Analysis failed. Please try again.');
      }
    }
  };

  const handleReset = () => {
    setStep('upload'); setFile(null); setCameraPages([]);
    setExtractedPaper(null); setErrorMsg('');
  };

  const readyToAnalyze = inputMode === 'upload' ? !!file : cameraPages.length > 0;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 lg:px-8 xl:px-10 py-4 bg-card border-b border-border flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/teacher-dashboard" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft size={16} /><span>Dashboard</span>
          </Link>
          <span className="text-muted-foreground/40">/</span>
          <span className="text-sm font-600 text-foreground">Question Paper Analyzer</span>
        </div>
        <div className="flex items-center gap-2">
          {step === 'done' && extractedPaper && (
            <Link href="/answer-sheet-evaluator"
              onClick={() => { if (extractedPaper) sessionStorage.setItem('extractedPaper', JSON.stringify(extractedPaper)); }}
              className="flex items-center gap-1.5 text-sm font-600 bg-primary text-primary-foreground px-4 py-1.5 rounded-lg hover:bg-primary/90 transition-colors"
            >
              <span>Evaluate Answer Sheet</span><ArrowRight size={14} />
            </Link>
          )}
          <div className="flex items-center gap-1.5 bg-positive-bg text-positive text-xs font-600 px-3 py-1.5 rounded-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-positive inline-block animate-pulse" />
            AI Engine Active
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">

        {/* ── UPLOAD STEP ──────────────────────────────────────────────────── */}
        {(step === 'upload' || step === 'error') && (
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-700 text-foreground mb-2">Question Paper Analyzer</h1>
              <p className="text-muted-foreground text-sm">Upload or scan a question paper. Then configure sections and marks before AI analysis.</p>
            </div>

            {/* Input mode tabs */}
            <div className="flex gap-1 p-1 bg-muted rounded-xl mb-6">
              {([
                { mode: 'upload', icon: Upload,   label: 'Upload File' },
                { mode: 'camera', icon: Camera,   label: 'Camera Scan' },
                { mode: 'scan',   icon: ScanLine, label: 'Import Files' },
              ] as { mode: 'upload' | 'camera' | 'scan'; icon: React.ElementType; label: string }[]).map(({ mode, icon: Icon, label }) => (
                <button key={mode}
                  onClick={() => { setInputMode(mode); setFile(null); setCameraPages([]); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-600 transition-colors ${inputMode === mode ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <Icon size={15} />{label}
                </button>
              ))}
            </div>

            {/* Upload mode */}
            {inputMode === 'upload' && (
              <>
                <div
                  className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors cursor-pointer ${dragOver ? 'border-primary bg-primary/5' : file ? 'border-positive bg-positive-bg' : 'border-border hover:border-primary/50 hover:bg-muted/30'}`}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
                  {file ? (
                    <div className="flex flex-col items-center gap-3">
                      <CheckCircle2 size={40} className="text-positive" />
                      <div>
                        <p className="font-600 text-foreground">{file.name}</p>
                        <p className="text-sm text-muted-foreground mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB · Ready to configure</p>
                      </div>
                      <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null); }}
                        className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mt-1">
                        <X size={12} /> Remove file
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <Upload size={28} className="text-primary" />
                      </div>
                      <div>
                        <p className="font-600 text-foreground">Drop your question paper here</p>
                        <p className="text-sm text-muted-foreground mt-1">or click to browse · PDF, JPG, PNG, WebP · Max 20 MB</p>
                      </div>
                    </div>
                  )}
                </div>

                {step === 'error' && (
                  <div className="mt-4 flex items-start gap-2 p-4 bg-negative-bg rounded-lg text-sm text-red-700">
                    <AlertTriangle size={16} className="shrink-0 mt-0.5" /><span>{errorMsg}</span>
                  </div>
                )}

                <button onClick={() => { if (file) handleAnalyze(); }}
                  disabled={!file}
                  className="mt-6 w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-600 py-3 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <BookOpen size={18} /> Analyze with AI
                </button>
              </>
            )}

            {/* Camera mode */}
            {inputMode === 'camera' && (
              <>
                <CameraScanner confirmLabel="Use These Pages for Analysis"
                  onCapture={(pages) => {
                    setCameraPages(pages.map((p) => p.file));
                    toast.success(`${pages.length} page${pages.length > 1 ? 's' : ''} captured`);
                  }}
                />
                {cameraPages.length > 0 && (
                  <button onClick={handleAnalyze}
                    className="mt-4 w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-600 py-3 rounded-xl hover:bg-primary/90 transition-colors text-sm"
                  >
                    <BookOpen size={18} /> Analyze with AI ({cameraPages.length} page{cameraPages.length !== 1 ? 's' : ''})
                  </button>
                )}
              </>
            )}

            {/* Scan mode */}
            {inputMode === 'scan' && (
              <ScannerCapture confirmLabel="Analyze Scanned Paper with AI"
                onCapture={(scannedPages) => {
                  setFile(scannedPages[0]); setInputMode('upload');
                  toast.success(`${scannedPages.length} page${scannedPages.length > 1 ? 's' : ''} scanned — ready to analyze`);
                }}
              />
            )}

            {/* Info cards */}
            <div className="mt-8 grid grid-cols-3 gap-4">
              {[
                { icon: FileText,   title: 'Auto-Extraction', desc: 'Extracts all questions, sections, and marks automatically' },
                { icon: Settings2,  title: 'AI Auto-Detect',  desc: 'Sections, marks, and question types detected automatically from the paper' },
                { icon: ArrowRight, title: 'Seamless Flow',   desc: 'Directly proceed to evaluate answer sheets with full context' },
              ].map((card) => (
                <div key={card.title} className="p-4 bg-card border border-border rounded-xl">
                  <card.icon size={20} className="text-primary mb-2" />
                  <p className="text-sm font-600 text-foreground">{card.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── ANALYZING STEP ───────────────────────────────────────────────── */}
        {step === 'analyzing' && (() => {
          const STEPS = [
            {
              icon: FileText,
              label: 'Reading Document Structure',
              desc: 'Scanning pages, headers, and layout patterns',
            },
            {
              icon: Layers,
              label: 'Applying Section Mark Config',
              desc: 'Mapping your defined marks to each section',
            },
            {
              icon: Brain,
              label: 'Extracting Marks Allocation',
              desc: 'Identifying every question with correct marks',
            },
            {
              icon: Tags,
              label: 'Classifying Question Types',
              desc: 'Categorising MCQ, theory, numerical, diagram',
            },
          ];
          const completedCount = activeSubStep; // steps before activeSubStep are done
          const progressPct = Math.round((completedCount / STEPS.length) * 100);

          return (
            <div className="max-w-xl mx-auto py-16 px-4 flex flex-col items-center gap-8">
              {/* Hero icon */}
              <div className="relative">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center shadow-lg">
                  <Sparkles size={38} className="text-primary" />
                </div>
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <Loader2 size={12} className="text-white animate-spin" />
                </span>
              </div>

              {/* Title */}
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-800 text-foreground tracking-tight">Analyzing Question Paper</h2>
                <p className="text-base text-muted-foreground max-w-sm leading-relaxed">
                  AI is reading your paper and applying your section configuration to extract every question precisely.
                </p>
              </div>

              {/* Progress bar */}
              <div className="w-full max-w-sm space-y-1.5">
                <div className="flex justify-between text-xs font-600 text-muted-foreground">
                  <span>Progress</span>
                  <span>{progressPct}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-700 ease-out"
                    style={{ width: `${Math.max(progressPct, 6)}%` }}
                  />
                </div>
              </div>

              {/* Step cards */}
              <div className="w-full max-w-sm flex flex-col gap-3">
                {STEPS.map((s, i) => {
                  const isDone = i < activeSubStep;
                  const isActive = i === activeSubStep;
                  const isPending = i > activeSubStep;
                  return (
                    <div
                      key={s.label}
                      className={`flex items-center gap-4 px-5 py-4 rounded-2xl border transition-all duration-500 ${
                        isDone
                          ? 'bg-green-50 border-green-200'
                          : isActive
                          ? 'bg-primary/5 border-primary/30 shadow-sm'
                          : 'bg-muted/40 border-border opacity-50'
                      }`}
                    >
                      {/* Icon bubble */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-500 ${
                        isDone ? 'bg-green-100' : isActive ? 'bg-primary/10' : 'bg-muted'
                      }`}>
                        {isDone ? (
                          <CheckCircle2 size={20} className="text-green-600" />
                        ) : isActive ? (
                          <Loader2 size={20} className="text-primary animate-spin" />
                        ) : (
                          <s.icon size={18} className="text-muted-foreground" />
                        )}
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-700 leading-tight ${
                          isDone ? 'text-green-700' : isActive ? 'text-foreground' : 'text-muted-foreground'
                        }`}>
                          {s.label}
                        </p>
                        <p className={`text-xs mt-0.5 leading-tight ${
                          isDone ? 'text-green-600/80' : isActive ? 'text-muted-foreground' : 'text-muted-foreground/60'
                        }`}>
                          {isDone ? 'Completed' : s.desc}
                        </p>
                      </div>

                      {/* Status pill */}
                      <span className={`text-[10px] font-700 px-2.5 py-1 rounded-full shrink-0 ${
                        isDone ? 'bg-green-100 text-green-700' : isActive ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                      }`}>
                        {isDone ? 'Done' : isActive ? 'Active' : 'Waiting'}
                      </span>
                    </div>
                  );
                })}
              </div>

              <p className="text-xs text-muted-foreground/60 text-center">
                Powered by Gemini · This may take 10–30 seconds for large papers
              </p>
            </div>
          );
        })()}

        {/* ── DONE STEP ────────────────────────────────────────────────────── */}
        {step === 'done' && extractedPaper && (
          <ExtractedQuestionsPanel
            paper={extractedPaper}
            sectionConfig={[]}
            fileName={file?.name || ''}
            onReset={handleReset}
            onUpdate={(updated) => setExtractedPaper(updated)}
            onProceed={() => { sessionStorage.setItem('extractedPaper', JSON.stringify(extractedPaper)); }}
          />
        )}
      </div>
    </div>
  );
}
