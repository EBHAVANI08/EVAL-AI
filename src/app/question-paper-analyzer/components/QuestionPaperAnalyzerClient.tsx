'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import {
  ChevronLeft, Upload, FileText, Loader2, CheckCircle2, AlertTriangle,
  ArrowRight, X, BookOpen, ScanLine, Camera, Plus, Trash2, Settings2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { callGeminiVision } from '@/lib/gemini-client';
import ExtractedQuestionsPanel from './ExtractedQuestionsPanel';
import dynamic from 'next/dynamic';

const ScannerCapture = dynamic(() => import('@/components/ui/ScannerCapture'), { ssr: false });
const CameraScanner = dynamic(() => import('@/components/ui/CameraScanner'), { ssr: false });

export interface ExtractedQuestion {
  qNo: string;
  section: string;
  questionText: string;
  maxMarks: number;
  type: 'theory' | 'numerical' | 'diagram' | 'mcq' | 'short';
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

type Step = 'upload' | 'configure' | 'analyzing' | 'done' | 'error';

function makeSectionId() { return Math.random().toString(36).slice(2, 8); }

const DEFAULT_SECTIONS: SectionConfig[] = [
  { id: makeSectionId(), name: 'A', label: 'Objective / MCQ',   numQuestions: 20, marksPerQ: 1, attemptAny: 0 },
  { id: makeSectionId(), name: 'B', label: 'Short Answer',       numQuestions: 8,  marksPerQ: 2, attemptAny: 0 },
  { id: makeSectionId(), name: 'C', label: 'Long Answer',        numQuestions: 5,  marksPerQ: 5, attemptAny: 0 },
];

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
  const [sections, setSections] = useState<SectionConfig[]>(DEFAULT_SECTIONS);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // ── Section config helpers ────────────────────────────────────────────────
  const updateSection = (id: string, key: keyof SectionConfig, val: any) =>
    setSections((prev) => prev.map((s) => s.id === id ? { ...s, [key]: val } : s));

  const addSection = () => {
    const used = new Set(sections.map((s) => s.name));
    const next = 'ABCDEFGHIJ'.split('').find((c) => !used.has(c)) ?? String.fromCharCode(65 + sections.length);
    setSections((prev) => [
      ...prev,
      { id: makeSectionId(), name: next, label: '', numQuestions: 5, marksPerQ: 2, attemptAny: 0 },
    ]);
  };

  const removeSection = (id: string) => setSections((prev) => prev.filter((s) => s.id !== id));

  // ── Build section hint string for the AI prompt ───────────────────────────
  const buildSectionHint = (): string => {
    if (sections.length === 0) return '';
    const lines = sections.map((s) => {
      const total = s.numQuestions * s.marksPerQ;
      const attempt = s.attemptAny > 0 ? ` (Attempt any ${s.attemptAny} of ${s.numQuestions})` : '';
      return `  - Section ${s.name}${s.label ? ` (${s.label})` : ''}: ${s.numQuestions} questions × ${s.marksPerQ} mark${s.marksPerQ !== 1 ? 's' : ''} = ${total} marks${attempt}`;
    });
    return `\n\nSECTION STRUCTURE (defined by teacher — use this for mark allocation):\n${lines.join('\n')}\nFor each question, assign exactly ${sections.map((s) => `Section ${s.name} → ${s.marksPerQ}m`).join(', ')}.`;
  };

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

    const sectionHint = buildSectionHint();

    const prompt = `You are an expert exam paper analyzer. Read this ENTIRE paper from the first page to the last page and extract every question from every section.${sectionHint}

Return ONLY valid JSON (no markdown, no explanation):
{
  "metadata": {
    "subject": "string",
    "class": "string",
    "board": "string",
    "totalMarks": number,
    "duration": "string",
    "sections": ["A","B","C","D","E"],
    "sectionConstraints": {
      "B": { "attemptAny": 5, "totalQuestions": 8 }
    }
  },
  "questions": [
    { "qNo": "1", "section": "A", "questionText": "...", "maxMarks": 1, "type": "mcq" }
  ]
}

STRICT RULES:
1. SCAN ALL SECTIONS: go through Section A, then B, then C, then D, then E (and any others). Do NOT stop after the first section.
2. Every question from every section must appear in the "questions" array with the correct "section" value.
3. Sub-parts: if a question has (a)(b)(c) or (i)(ii)(iii) parts, add each as a separate entry. Their maxMarks must sum to the parent total.
4. Case studies (e.g. CBSE Sec E): each sub-part is a separate entry; divide parent marks equally if not stated.
5. MCQ options: include all 4 options in questionText.
6. questionText: max 150 characters.
7. type must be one of: mcq | short | theory | numerical | diagram
8. sectionConstraints: if a section says "Attempt any X of Y questions", set attemptAny=X and totalQuestions=Y.
9. Return ONLY the JSON object. No markdown fences. No extra text.`;

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
          const secMarks = sections.find((s) => s.name === sec)?.marksPerQ ?? 1;
          const sectionPrompt = `Extract ONLY the questions from Section ${sec} of this exam paper. Each question is worth ${secMarks} mark${secMarks !== 1 ? 's' : ''}.

Return ONLY a valid JSON array (no markdown):
[
  { "qNo": "19", "section": "${sec}", "questionText": "...(max 150 chars)", "maxMarks": ${secMarks}, "type": "short" }
]

Rules:
- Section ${sec} questions only — include all of them
- Sub-parts (a)(b)(c) or (i)(ii)(iii) = separate entries with marks divided
- questionText: max 150 chars
- type: mcq | short | theory | numerical | diagram
- Return ONLY the JSON array`;
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
    setExtractedPaper(null); setErrorMsg(''); setSections(DEFAULT_SECTIONS);
  };

  const readyToEvaluate = inputMode === 'upload' ? !!file : cameraPages.length > 0;

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
          {step === 'configure' && <><span className="text-muted-foreground/40">/</span><span className="text-sm font-600 text-primary">Configure Sections</span></>}
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

                <button onClick={() => { if (file) setStep('configure'); }}
                  disabled={!file}
                  className="mt-6 w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-600 py-3 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Settings2 size={18} /> Configure Sections &amp; Analyze
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
                  <button onClick={() => setStep('configure')}
                    className="mt-4 w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-600 py-3 rounded-xl hover:bg-primary/90 transition-colors text-sm"
                  >
                    <Settings2 size={18} /> Configure Sections &amp; Analyze
                  </button>
                )}
              </>
            )}

            {/* Scan mode */}
            {inputMode === 'scan' && (
              <ScannerCapture confirmLabel="Analyze Scanned Paper with AI"
                onCapture={(scannedPages) => {
                  setFile(scannedPages[0]); setInputMode('upload');
                  toast.success(`${scannedPages.length} page${scannedPages.length > 1 ? 's' : ''} scanned — ready to configure`);
                }}
              />
            )}

            {/* Info cards */}
            <div className="mt-8 grid grid-cols-3 gap-4">
              {[
                { icon: FileText,   title: 'Auto-Extraction', desc: 'Extracts all questions, sections, and marks automatically' },
                { icon: Settings2,  title: 'Section Config',  desc: 'Define each section\'s marks before AI analysis for precision' },
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

        {/* ── CONFIGURE SECTIONS STEP ──────────────────────────────────────── */}
        {step === 'configure' && (
          <div className="max-w-3xl mx-auto">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1">
                <Settings2 size={20} className="text-primary" />
                <h1 className="text-2xl font-700 text-foreground">Configure Paper Sections</h1>
              </div>
              <p className="text-muted-foreground text-sm">
                Define your paper's section structure before AI analysis. The AI will use this to assign accurate marks to each question.
              </p>
            </div>

            {/* File info banner */}
            <div className="flex items-center gap-3 px-4 py-3 bg-positive-bg border border-positive/20 rounded-xl mb-6">
              <CheckCircle2 size={15} className="text-positive shrink-0" />
              <p className="text-sm font-600 text-foreground flex-1 truncate">
                {file?.name ?? `${cameraPages.length} camera page${cameraPages.length !== 1 ? 's' : ''}`}
              </p>
              <button onClick={() => setStep('upload')} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                <X size={12} /> Change file
              </button>
            </div>

            {/* Section table */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden mb-5">
              {/* Table header */}
              <div className="grid grid-cols-[48px_1fr_140px_100px_90px_100px_40px] gap-3 px-5 py-3 bg-muted/50 border-b border-border text-[10px] font-700 text-muted-foreground uppercase tracking-wider">
                <span>Sec</span>
                <span>Label / Description</span>
                <span>Questions</span>
                <span>Marks / Q</span>
                <span>Total</span>
                <span>Attempt Any</span>
                <span></span>
              </div>

              {/* Section rows */}
              {sections.map((sec) => {
                const total = sec.numQuestions * sec.marksPerQ;
                return (
                  <div key={sec.id} className="grid grid-cols-[48px_1fr_140px_100px_90px_100px_40px] gap-3 items-center px-5 py-3 border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    {/* Section name */}
                    <input
                      value={sec.name}
                      onChange={(e) => updateSection(sec.id, 'name', e.target.value.toUpperCase().slice(0, 2))}
                      className="w-10 h-9 text-center text-sm font-700 text-primary border border-border rounded-lg bg-primary/5 outline-none focus:border-primary"
                    />
                    {/* Label */}
                    <input
                      value={sec.label}
                      onChange={(e) => updateSection(sec.id, 'label', e.target.value)}
                      placeholder="e.g. Objective Questions"
                      className="w-full h-9 text-sm text-foreground border border-border rounded-lg px-3 bg-background outline-none focus:border-primary"
                    />
                    {/* Num questions */}
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number" min={1} max={200}
                        value={sec.numQuestions}
                        onChange={(e) => updateSection(sec.id, 'numQuestions', Math.max(1, Number(e.target.value)))}
                        className="w-full h-9 text-sm font-600 text-center text-foreground border border-border rounded-lg bg-background outline-none focus:border-primary"
                      />
                      <span className="text-xs text-muted-foreground shrink-0">qs</span>
                    </div>
                    {/* Marks per Q */}
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number" min={0.5} max={50} step={0.5}
                        value={sec.marksPerQ}
                        onChange={(e) => updateSection(sec.id, 'marksPerQ', Math.max(0.5, Number(e.target.value)))}
                        className="w-full h-9 text-sm font-600 text-center text-foreground border border-border rounded-lg bg-background outline-none focus:border-primary"
                      />
                      <span className="text-xs text-muted-foreground shrink-0">m</span>
                    </div>
                    {/* Total (read-only) */}
                    <div className="h-9 flex items-center justify-center rounded-lg bg-muted/50 border border-border">
                      <span className="text-sm font-700 text-foreground">{total}</span>
                    </div>
                    {/* Attempt any */}
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number" min={0} max={sec.numQuestions}
                        value={sec.attemptAny === 0 ? '' : sec.attemptAny}
                        placeholder="All"
                        onChange={(e) => updateSection(sec.id, 'attemptAny', e.target.value === '' ? 0 : Math.max(0, Number(e.target.value)))}
                        className="w-full h-9 text-sm font-600 text-center text-foreground border border-border rounded-lg bg-background outline-none focus:border-primary placeholder:text-muted-foreground/60"
                      />
                    </div>
                    {/* Delete */}
                    <button onClick={() => removeSection(sec.id)}
                      disabled={sections.length <= 1}
                      className="w-9 h-9 flex items-center justify-center rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-30"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })}

              {/* Totals row */}
              <div className="grid grid-cols-[48px_1fr_140px_100px_90px_100px_40px] gap-3 items-center px-5 py-3 bg-muted/30 border-t border-border">
                <span></span>
                <span className="text-xs font-700 text-muted-foreground uppercase tracking-wider">Total</span>
                <span className="text-center text-sm font-700 text-foreground">
                  {sections.reduce((s, x) => s + x.numQuestions, 0)} qs
                </span>
                <span></span>
                <span className="text-center text-sm font-700 text-primary">
                  {sections.reduce((s, x) => s + x.numQuestions * x.marksPerQ, 0)} m
                </span>
                <span></span>
                <span></span>
              </div>
            </div>

            {/* Add section button */}
            <button onClick={addSection}
              className="flex items-center gap-2 text-sm font-600 text-primary hover:text-primary/80 px-4 py-2.5 rounded-xl border-2 border-dashed border-primary/30 hover:border-primary/60 hover:bg-primary/5 transition-all w-full justify-center mb-6"
            >
              <Plus size={15} /> Add Another Section
            </button>

            {/* Attempt any hint */}
            <div className="flex items-start gap-2.5 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl mb-6 text-sm text-amber-800">
              <AlertTriangle size={14} className="shrink-0 mt-0.5" />
              <p><strong>Attempt Any:</strong> Enter a number if students must answer only X out of Y questions in a section (e.g., any 5 of 8). Leave blank if all questions are required.</p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button onClick={() => setStep('upload')}
                className="flex items-center gap-2 px-5 py-3 rounded-xl border border-border text-sm font-600 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <ChevronLeft size={15} /> Back
              </button>
              <button onClick={handleAnalyze}
                disabled={sections.length === 0}
                className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground font-700 py-3 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-40 text-sm"
              >
                <BookOpen size={17} />
                Analyze with AI ({sections.length} section{sections.length !== 1 ? 's' : ''} · {sections.reduce((s, x) => s + x.numQuestions * x.marksPerQ, 0)} marks)
              </button>
            </div>
          </div>
        )}

        {/* ── ANALYZING STEP ───────────────────────────────────────────────── */}
        {step === 'analyzing' && (
          <div className="max-w-2xl mx-auto flex flex-col items-center justify-center py-24 gap-6">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Loader2 size={36} className="text-primary animate-spin" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-700 text-foreground mb-2">Analyzing Question Paper…</h2>
              <p className="text-muted-foreground text-sm">
                AI is reading sections with your mark configuration. This may take a few seconds.
              </p>
            </div>
            <div className="flex flex-col gap-2 w-full max-w-sm">
              {['Reading document structure', 'Applying section mark config', 'Extracting marks allocation', 'Classifying question types'].map((s, i) => (
                <div key={s} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 size={12} className="text-primary animate-spin shrink-0" style={{ animationDelay: `${i * 0.2}s` }} />
                  {s}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── DONE STEP ────────────────────────────────────────────────────── */}
        {step === 'done' && extractedPaper && (
          <ExtractedQuestionsPanel
            paper={extractedPaper}
            sectionConfig={sections}
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
