'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, Upload, FileText, Loader2, CheckCircle2, AlertTriangle, ArrowRight, X, BookOpen, ScanLine, Camera } from 'lucide-react';
import toast from 'react-hot-toast';
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

export default function QuestionPaperAnalyzerClient() {
  const [step, setStep] = useState<Step>('upload');
  const [inputMode, setInputMode] = useState<'upload' | 'scan' | 'camera'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [cameraPages, setCameraPages] = useState<File[]>([]); // only files needed for analysis
  const [dragOver, setDragOver] = useState(false);
  const [extractedPaper, setExtractedPaper] = useState<ExtractedPaper | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    const valid = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!valid.includes(f.type)) {
      toast.error('Please upload a PDF or image file (JPG, PNG, WebP)');
      return;
    }
    const maxMB = f.type === 'application/pdf' ? 50 : 20;
    if (f.size > maxMB * 1024 * 1024) {
      toast.error(`File size must be under ${maxMB} MB`);
      return;
    }
    setFile(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  // Analyze a single file and return structured paper data
  const analyzeFile = async (f: File, visionPayload?: Record<string, string>): Promise<ExtractedPaper> => {
    if (!visionPayload) {
      const isPdf = f.type === 'application/pdf';
      if (isPdf) {
        const { fileUri, mimeType } = await uploadPdfToGemini(f);
        visionPayload = { fileUri, mimeType };
      } else {
        const dataUri = await compressImage(f);
        const match = dataUri.match(/^data:([^;]+);base64,([\s\S]+)$/);
        if (!match) throw new Error('Failed to process image for AI');
        visionPayload = { mimeType: match[1], base64Data: match[2] };
      }
    }

    const prompt = `You are an expert exam paper analyzer. Read this ENTIRE paper from the first page to the last page and extract every question from every section.

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

STRICT RULES — follow every one:
1. SCAN ALL SECTIONS: go through Section A, then B, then C, then D, then E (and any others). Do NOT stop after the first section.
2. Every question from every section must appear in the "questions" array with the correct "section" value.
3. Sub-parts: if a question has (a)(b)(c) or (i)(ii)(iii) parts, add each as a separate entry. Their maxMarks must sum to the parent total.
4. Case studies (e.g. CBSE Sec E): each sub-part is a separate entry; divide parent marks equally if not stated.
5. MCQ options: include all 4 options in questionText.
6. questionText: max 150 characters — truncate long text but NEVER omit a question entirely.
7. type must be one of: mcq | short | theory | numerical | diagram
8. sectionConstraints: if a section says "Attempt any X of Y questions", set attemptAny=X and totalQuestions=Y.
9. Return ONLY the JSON object. No markdown fences. No extra text.`;

    const response = await fetch('/api/ai/gemini-vision', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...visionPayload, prompt }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
      throw new Error(err.error || `Gemini request failed: ${response.status}`);
    }

    const { text: raw, finishReason } = await response.json();

    const start = raw.indexOf('{');
    if (start === -1) throw new Error(`No JSON found in AI response. Raw (first 300 chars): ${raw.slice(0, 300)}`);

    let parsed: ExtractedPaper | null = null;

    const fullEnd = raw.lastIndexOf('}');
    if (fullEnd > start) {
      try {
        const cleaned = raw.slice(start, fullEnd + 1).replace(/,\s*([}\]])/g, '$1');
        const attempt = JSON.parse(cleaned);
        if (attempt.questions && Array.isArray(attempt.questions) && attempt.questions.length > 0) {
          parsed = attempt;
        }
      } catch { /* fall through */ }
    }

    if (!parsed) {
      const partial = raw.slice(start);
      const lastQ = partial.lastIndexOf('},');
      if (lastQ > 0) {
        try {
          const salvaged = (partial.slice(0, lastQ + 1) + ']}').replace(/,\s*([}\]])/g, '$1');
          const attempt = JSON.parse(salvaged);
          if (attempt.questions && Array.isArray(attempt.questions) && attempt.questions.length > 0) {
            parsed = attempt;
          }
        } catch { /* ignore */ }
      }
    }

    if (!parsed || !Array.isArray(parsed.questions) || parsed.questions.length === 0) {
      throw new Error('Could not extract questions from AI response. Try uploading a clearer image or fewer pages.');
    }

    if (finishReason === 'MAX_TOKENS') {
      toast.error('AI response was cut off — running section-by-section recovery...');
    }

    // Multi-pass: fill missing sections
    const emptySections = (parsed.metadata.sections || []).filter(
      (sec) => !parsed!.questions.some((q) => q.section === sec)
    );

    if (emptySections.length > 0) {
      toast.loading(`Extracting missing sections: ${emptySections.join(', ')}…`, { id: 'section-refetch' });
      for (const sec of emptySections) {
        try {
          const sectionPrompt = `Extract ONLY the questions from Section ${sec} of this exam paper.

Return ONLY a valid JSON array (no markdown):
[
  { "qNo": "19", "section": "${sec}", "questionText": "...(max 150 chars)", "maxMarks": 2, "type": "short" }
]

Rules:
- Section ${sec} questions only — include all of them
- Sub-parts (a)(b)(c) or (i)(ii)(iii) = separate entries with marks divided
- questionText: max 150 chars
- type: mcq | short | theory | numerical | diagram
- Return ONLY the JSON array`;

          const secRes = await fetch('/api/ai/gemini-vision', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...visionPayload, prompt: sectionPrompt }),
          });
          if (!secRes.ok) continue;
          const { text: secRaw } = await secRes.json();
          const arrStart = secRaw.indexOf('[');
          const arrEnd = secRaw.lastIndexOf(']');
          if (arrStart === -1 || arrEnd === -1) continue;
          const secQuestions = JSON.parse(secRaw.slice(arrStart, arrEnd + 1).replace(/,\s*([}\]])/g, '$1'));
          if (Array.isArray(secQuestions) && secQuestions.length > 0) {
            parsed.questions.push(...secQuestions);
          }
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
        if (filesToProcess.length > 1) {
          toast.loading(`Analyzing page ${i + 1} of ${filesToProcess.length}…`, { id: 'page-progress' });
        }
        const result = await analyzeFile(filesToProcess[i]);

        if (!merged) {
          merged = result;
        } else {
          // Merge additional pages: keep metadata from first page, append questions
          merged.questions.push(...result.questions);
        }
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
    setStep('upload');
    setFile(null);
    setCameraPages([]);
    setExtractedPaper(null);
    setErrorMsg('');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 lg:px-8 xl:px-10 py-4 bg-card border-b border-border flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/teacher-dashboard"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft size={16} />
            <span>Dashboard</span>
          </Link>
          <span className="text-muted-foreground/40">/</span>
          <span className="text-sm font-600 text-foreground">Question Paper Analyzer</span>
        </div>
        <div className="flex items-center gap-2">
          {step === 'done' && extractedPaper && (
            <Link
              href={{
                pathname: '/answer-sheet-evaluator',
              }}
              onClick={() => {
                if (extractedPaper) {
                  sessionStorage.setItem('extractedPaper', JSON.stringify(extractedPaper));
                }
              }}
              className="flex items-center gap-1.5 text-sm font-600 bg-primary text-primary-foreground px-4 py-1.5 rounded-lg hover:bg-primary/90 transition-colors"
            >
              <span>Evaluate Answer Sheet</span>
              <ArrowRight size={14} />
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
        {(step === 'upload' || step === 'error') && (
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-700 text-foreground mb-2">Question Paper Analyzer</h1>
              <p className="text-muted-foreground text-sm">
                Upload or scan a question paper and AI will extract all questions, sections, marks, and structure automatically.
              </p>
            </div>

            {/* Input mode tabs */}
            <div className="flex gap-1 p-1 bg-muted rounded-xl mb-6">
              <button
                onClick={() => { setInputMode('upload'); setFile(null); setCameraPages([]); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-600 transition-colors ${
                  inputMode === 'upload' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Upload size={15} />
                Upload File
              </button>
              <button
                onClick={() => { setInputMode('camera'); setFile(null); setCameraPages([]); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-600 transition-colors ${
                  inputMode === 'camera' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Camera size={15} />
                Camera Scan
              </button>
              <button
                onClick={() => { setInputMode('scan'); setFile(null); setCameraPages([]); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-600 transition-colors ${
                  inputMode === 'scan' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <ScanLine size={15} />
                Import Files
              </button>
            </div>

            {/* Upload mode */}
            {inputMode === 'upload' && (
              <>
                <div
                  className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors cursor-pointer ${
                    dragOver
                      ? 'border-primary bg-primary/5'
                      : file
                      ? 'border-positive bg-positive-bg'
                      : 'border-border hover:border-primary/50 hover:bg-muted/30'
                  }`}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                  />
                  {file ? (
                    <div className="flex flex-col items-center gap-3">
                      <CheckCircle2 size={40} className="text-positive" />
                      <div>
                        <p className="font-600 text-foreground">{file.name}</p>
                        <p className="text-sm text-muted-foreground mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB · Ready to analyze</p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setFile(null); }}
                        className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mt-1"
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
                        <p className="font-600 text-foreground">Drop your question paper here</p>
                        <p className="text-sm text-muted-foreground mt-1">or click to browse · PDF, JPG, PNG, WebP · Max 20 MB</p>
                      </div>
                    </div>
                  )}
                </div>

                {step === 'error' && (
                  <div className="mt-4 flex items-start gap-2 p-4 bg-negative-bg rounded-lg text-sm text-red-700">
                    <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <button
                  onClick={handleAnalyze}
                  disabled={!file}
                  className="mt-6 w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-600 py-3 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <BookOpen size={18} />
                  Analyze Question Paper with AI
                </button>
              </>
            )}

            {/* Camera mode */}
            {inputMode === 'camera' && (
              <>
                <CameraScanner
                  confirmLabel="Use These Pages for Analysis"
                  onCapture={(pages) => {
                    setCameraPages(pages.map((p) => p.file));
                    toast.success(`${pages.length} page${pages.length > 1 ? 's' : ''} captured — click Analyze below`);
                  }}
                />
                {cameraPages.length > 0 && (
                  <>
                    {step === 'error' && (
                      <div className="mt-4 flex items-start gap-2 p-4 bg-negative-bg rounded-lg text-sm text-red-700">
                        <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                        <span>{errorMsg}</span>
                      </div>
                    )}
                    <button
                      onClick={handleAnalyze}
                      className="mt-4 w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-600 py-3 rounded-xl hover:bg-primary/90 transition-colors text-sm"
                    >
                      <BookOpen size={18} />
                      Analyze {cameraPages.length} Camera Page{cameraPages.length > 1 ? 's' : ''} with AI
                    </button>
                  </>
                )}
              </>
            )}

            {/* Scan mode */}
            {inputMode === 'scan' && (
              <ScannerCapture
                confirmLabel="Analyze Scanned Paper with AI"
                onCapture={(scannedPages) => {
                  setFile(scannedPages[0]);
                  setInputMode('upload');
                  toast.success(`${scannedPages.length} page${scannedPages.length > 1 ? 's' : ''} scanned — ready to analyze`);
                }}
              />
            )}

            {/* Info cards */}
            <div className="mt-8 grid grid-cols-3 gap-4">
              {[
                { icon: FileText, title: 'Auto-Extraction', desc: 'Extracts all questions, sections, and marks automatically' },
                { icon: BookOpen, title: 'Smart Structure', desc: 'Detects question types: theory, numerical, MCQ, diagram' },
                { icon: ArrowRight, title: 'Seamless Flow', desc: 'Directly proceed to evaluate answer sheets with context' },
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

        {step === 'analyzing' && (
          <div className="max-w-2xl mx-auto flex flex-col items-center justify-center py-24 gap-6">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Loader2 size={36} className="text-primary animate-spin" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-700 text-foreground mb-2">Analyzing Question Paper…</h2>
              <p className="text-muted-foreground text-sm">AI is reading and extracting all questions, sections, and marks. This may take a few seconds.</p>
            </div>
            <div className="flex flex-col gap-2 w-full max-w-sm">
              {['Reading document structure', 'Identifying sections & questions', 'Extracting marks allocation', 'Classifying question types'].map((s, i) => (
                <div key={s} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 size={12} className="text-primary animate-spin shrink-0" style={{ animationDelay: `${i * 0.2}s` }} />
                  {s}
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 'done' && extractedPaper && (
          <ExtractedQuestionsPanel
            paper={extractedPaper}
            fileName={file?.name || ''}
            onReset={handleReset}
            onProceed={() => {
              sessionStorage.setItem('extractedPaper', JSON.stringify(extractedPaper));
            }}
          />
        )}
      </div>
    </div>
  );
}
