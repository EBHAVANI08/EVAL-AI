'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Languages, Upload, X, Zap, Loader2, Globe, FileText, CheckCircle2, AlertCircle, History, ChevronDown, ChevronUp, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { callGeminiVision } from '@/lib/gemini-client';

type Result = {
  detectedLanguage: string;
  confidence: number;
  ocrText: string;
  englishTranslation: string;
  score: number;
  maxMarks: number;
  pointsEarned: string[];
  pointsMissed: string[];
  feedbackInEnglish: string;
  feedbackInNativeLanguage: string;
};

type HistoryItem = {
  id: string;
  subject: string;
  question: string;
  maxMarks: string;
  language: string;
  result: Result;
  createdAt: string;
};

const LANGUAGES = [
  'Auto-detect', 'English', 'Hindi', 'Telugu', 'Tamil',
  'Kannada', 'Marathi', 'Bengali', 'Gujarati', 'Malayalam', 'Punjabi',
];

const LANG_FLAGS: Record<string, string> = {
  English: '🇬🇧', Hindi: '🇮🇳', Telugu: '🇮🇳', Tamil: '🇮🇳',
  Kannada: '🇮🇳', Marathi: '🇮🇳', Bengali: '🇮🇳', Gujarati: '🇮🇳',
  Malayalam: '🇮🇳', Punjabi: '🇮🇳',
};

export default function MultilingualClient() {
  const [inputMode, setInputMode] = useState<'image' | 'pdf'>('image');
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [language, setLanguage] = useState('Auto-detect');
  const [subject, setSubject] = useState('');
  const [question, setQuestion] = useState('');
  const [maxMarks, setMaxMarks] = useState('10');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [dragging, setDragging] = useState(false);
  const [showNative, setShowNative] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const pdfRef = useRef<HTMLInputElement>(null);

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    fetch('/api/multilingual-evaluations?limit=10')
      .then((r) => r.json())
      .then((data) => setHistory(data.evaluations || []))
      .catch(() => {})
      .finally(() => setLoadingHistory(false));
  }, []);

  function handleFile(file: File) {
    if (!file.type.startsWith('image/')) { toast.error('Please upload an image file'); return; }
    setImage(file);
    setResult(null);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  function handlePdf(file: File) {
    if (file.type !== 'application/pdf') { toast.error('Please upload a PDF file'); return; }
    if (file.size > 50 * 1024 * 1024) { toast.error('PDF must be under 50 MB'); return; }
    setPdfFile(file);
    setResult(null);
  }

  function removeImage() { setImage(null); setPreview(null); setResult(null); }
  function removePdf() { setPdfFile(null); setResult(null); }

  async function analyze() {
    const hasInput = inputMode === 'image' ? !!image : !!pdfFile;
    if (!hasInput) { toast.error(inputMode === 'image' ? 'Please upload an answer sheet image' : 'Please upload a PDF file'); return; }
    setLoading(true);
    setResult(null);
    try {
      const langInstruction = language !== 'Auto-detect'
        ? `The student wrote in ${language}. Evaluate accordingly.`
        : 'Auto-detect the language from the handwriting/text.';

      const prompt = `You are a multilingual answer sheet evaluator for Indian school exams.

${langInstruction}

Subject: ${subject || 'General'}
Question to evaluate against: ${question || 'General answer quality evaluation'}
Maximum Marks: ${maxMarks}

Tasks:
1. Detect the language this answer is written in
2. Extract and transcribe the written text (OCR)
3. Evaluate the answer quality against the question
4. Provide feedback in both English and the student's language

Return ONLY valid JSON (no markdown fences):
{
  "detectedLanguage": "Language name (e.g. Hindi, Telugu, English)",
  "confidence": <0-100, detection confidence>,
  "ocrText": "The full transcribed text as written by the student",
  "englishTranslation": "Complete English translation of the answer",
  "score": <number 0 to ${maxMarks}>,
  "maxMarks": ${maxMarks},
  "pointsEarned": ["Specific point that earned marks 1", "Point 2"],
  "pointsMissed": ["Missing concept 1", "Missing concept 2"],
  "feedbackInEnglish": "Detailed feedback paragraph in English",
  "feedbackInNativeLanguage": "Same feedback translated to the student's language (if not English)"
}`;

      let filePayload: { base64Data: string; mimeType: string };

      if (inputMode === 'pdf' && pdfFile) {
        const formData = new FormData();
        formData.append('file', pdfFile);
        const uploadRes = await fetch('/api/ai/gemini-upload', { method: 'POST', body: formData });
        if (!uploadRes.ok) {
          const e = await uploadRes.json().catch(() => ({ error: 'PDF upload failed' }));
          throw new Error(e.error || 'PDF upload failed');
        }
        filePayload = await uploadRes.json();
      } else {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve((reader.result as string).split(',')[1]);
          reader.onerror = reject;
          reader.readAsDataURL(image!);
        });
        filePayload = { mimeType: image!.type, base64Data: base64 };
      }

      const { text: rawText } = await callGeminiVision({ ...filePayload, prompt });
      let text = rawText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();

      let parsed: Result;
      try {
        parsed = JSON.parse(text);
      } catch {
        throw new Error('Could not parse AI response. Please try again.');
      }

      setResult(parsed);

      // Auto-save to MongoDB
      try {
        const saveRes = await fetch('/api/multilingual-evaluations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subject, question, maxMarks, language, result: parsed }),
        });
        if (saveRes.ok) {
          const saved = await saveRes.json();
          const newItem: HistoryItem = {
            id: saved.id,
            subject,
            question,
            maxMarks,
            language,
            result: parsed,
            createdAt: new Date().toISOString(),
          };
          setHistory((prev) => [newItem, ...prev.slice(0, 9)]);
        }
      } catch {
        // save failed silently
      }
    } catch (err: any) {
      toast.error(err.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  }

  function loadFromHistory(item: HistoryItem) {
    setSubject(item.subject);
    setQuestion(item.question);
    setMaxMarks(item.maxMarks);
    setLanguage(item.language);
    setResult(item.result);
    setImage(null);
    setPreview(null);
    setHistoryOpen(false);
    toast.success('Loaded from history');
  }

  const scorePercent = result ? Math.round((result.score / result.maxMarks) * 100) : 0;
  const scoreColor = scorePercent >= 75 ? 'text-positive' : scorePercent >= 50 ? 'text-warning' : 'text-negative';

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Languages size={22} className="text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Multilingual Engine</h1>
            <p className="text-sm text-muted-foreground">Evaluate answer sheets written in any Indian language</p>
          </div>
        </div>
        {history.length > 0 && (
          <button
            onClick={() => setHistoryOpen(!historyOpen)}
            className="flex items-center gap-2 text-sm font-600 text-primary hover:bg-secondary px-3 py-2 rounded-xl transition-colors border border-border"
          >
            <History size={15} />
            History ({history.length})
            {historyOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        )}
      </div>

      {/* History panel */}
      {historyOpen && history.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-4 shadow-card mb-6 animate-slide-up">
          <h3 className="font-bold text-foreground mb-3 text-sm">Previous Evaluations</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-thin">
            {history.map((item) => {
              const pct = Math.round((item.result.score / item.result.maxMarks) * 100);
              const color = pct >= 75 ? 'text-positive' : pct >= 50 ? 'text-warning' : 'text-negative';
              return (
                <button
                  key={item.id}
                  onClick={() => loadFromHistory(item)}
                  className="w-full text-left flex items-center justify-between px-3 py-2.5 rounded-xl border border-border hover:bg-secondary/60 transition-colors gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-600 text-foreground truncate">
                      {LANG_FLAGS[item.result.detectedLanguage] || '🌐'} {item.result.detectedLanguage} · {item.subject || 'General'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {item.question || 'General evaluation'} · {new Date(item.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <span className={`text-sm font-bold font-tabular shrink-0 ${color}`}>
                    {item.result.score}/{item.result.maxMarks}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Feature info cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          { icon: Globe, title: 'Auto Language Detection', desc: 'Detects 10+ Indian languages from handwriting', color: 'text-primary', bg: 'bg-primary/10' },
          { icon: FileText, title: 'Native Evaluation', desc: 'Scores answers in the student\'s own language', color: 'text-positive', bg: 'bg-positive/10' },
          { icon: Languages, title: 'Bilingual Feedback', desc: 'Feedback in English + student\'s language', color: 'text-warning', bg: 'bg-warning/10' },
        ].map(({ icon: Icon, title, desc, color, bg }) => (
          <div key={title} className="bg-card border border-border rounded-2xl p-4 shadow-card flex items-start gap-3">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
              <Icon size={18} className={color} />
            </div>
            <div>
              <p className="text-sm font-700 text-foreground">{title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Left: Upload + Config */}
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-2xl p-5 shadow-card">
            {/* Mode tabs */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => { setInputMode('image'); removePdf(); }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-700 transition-colors ${inputMode === 'image' ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}
              >
                <ImageIcon size={13} /> Image
              </button>
              <button
                onClick={() => { setInputMode('pdf'); removeImage(); }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-700 transition-colors ${inputMode === 'pdf' ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}
              >
                <FileText size={13} /> PDF
              </button>
            </div>

            {inputMode === 'image' ? (
              !preview ? (
                <div
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${dragging ? 'border-primary bg-secondary/40' : 'border-border hover:border-primary/50 hover:bg-muted/40'}`}
                  onClick={() => fileRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
                >
                  <Upload size={32} className="text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-sm font-500 text-foreground mb-1">Drop answer sheet here or click to upload</p>
                  <p className="text-xs text-muted-foreground">JPG, PNG supported</p>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
                </div>
              ) : (
                <div className="relative rounded-xl overflow-hidden border border-border">
                  <img src={preview} alt="Answer sheet" className="w-full max-h-64 object-contain bg-muted/20" />
                  <button onClick={removeImage} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-card border border-border flex items-center justify-center shadow hover:bg-negative-bg transition-colors">
                    <X size={14} className="text-negative" />
                  </button>
                </div>
              )
            ) : (
              !pdfFile ? (
                <div
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${dragging ? 'border-primary bg-secondary/40' : 'border-border hover:border-primary/50 hover:bg-muted/40'}`}
                  onClick={() => pdfRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handlePdf(f); }}
                >
                  <FileText size={32} className="text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-sm font-500 text-foreground mb-1">Drop PDF here or click to upload</p>
                  <p className="text-xs text-muted-foreground">PDF up to 50 MB</p>
                  <input ref={pdfRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePdf(f); }} />
                </div>
              ) : (
                <div className="flex items-center justify-between bg-muted/40 rounded-xl px-4 py-3 border border-border">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <FileText size={16} className="text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-600 text-foreground truncate">{pdfFile.name}</p>
                      <p className="text-xs text-muted-foreground">{(pdfFile.size / 1024 / 1024).toFixed(1)} MB</p>
                    </div>
                  </div>
                  <button onClick={removePdf} className="w-7 h-7 rounded-full bg-card border border-border flex items-center justify-center shadow hover:bg-negative-bg transition-colors shrink-0 ml-2">
                    <X size={14} className="text-negative" />
                  </button>
                </div>
              )
            )}
          </div>

          <div className="bg-card border border-border rounded-2xl p-5 shadow-card space-y-4">
            <h3 className="font-bold text-foreground">Configuration</h3>
            <div>
              <label className="block text-xs font-600 text-muted-foreground mb-1">Language Override</label>
              <select value={language} onChange={(e) => setLanguage(e.target.value)} className="input-field text-sm py-2">
                {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-600 text-muted-foreground mb-1">Subject</label>
              <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Hindi Literature" className="input-field text-sm py-2" />
            </div>
            <div>
              <label className="block text-xs font-600 text-muted-foreground mb-1">Question (optional)</label>
              <textarea value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Enter the question for better evaluation..." rows={2} className="input-field text-sm resize-none" />
            </div>
            <div>
              <label className="block text-xs font-600 text-muted-foreground mb-1">Max Marks</label>
              <input type="number" min={1} max={50} value={maxMarks} onChange={(e) => setMaxMarks(e.target.value)} className="input-field text-sm py-2" />
            </div>
            <button
              onClick={analyze}
              disabled={loading || (inputMode === 'image' ? !image : !pdfFile)}
              className="btn-primary w-full py-3 rounded-xl text-sm font-600 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
              {loading ? 'Detecting & Evaluating…' : 'Detect Language & Evaluate'}
            </button>
          </div>
        </div>

        {/* Right: Results */}
        <div>
          {!result && !loading && (
            <div className="bg-card border border-border rounded-2xl p-10 shadow-card flex flex-col items-center justify-center text-center min-h-[400px]">
              <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
                <Languages size={28} className="text-primary" />
              </div>
              <h3 className="text-base font-bold text-foreground mb-2">Upload to begin</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Upload any answer sheet — written in Hindi, Telugu, Tamil, or any Indian language — and let AI evaluate it.
              </p>
              {!loadingHistory && history.length > 0 && (
                <p className="text-xs text-primary mt-3 font-600">
                  {history.length} previous {history.length === 1 ? 'evaluation' : 'evaluations'} saved — click History above to view
                </p>
              )}
            </div>
          )}

          {loading && (
            <div className="bg-card border border-border rounded-2xl p-10 shadow-card flex flex-col items-center justify-center min-h-[400px]">
              <Loader2 size={32} className="animate-spin text-primary mb-4" />
              <p className="text-sm font-500 text-foreground mb-1">Detecting language & evaluating…</p>
              <p className="text-xs text-muted-foreground">OCR + translation + evaluation in progress</p>
            </div>
          )}

          {result && (
            <div className="space-y-4 animate-slide-up">
              {/* Language + Score */}
              <div className="bg-card border border-border rounded-2xl p-5 shadow-card">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{LANG_FLAGS[result.detectedLanguage] || '🌐'}</span>
                    <div>
                      <p className="text-xs text-muted-foreground">Detected Language</p>
                      <p className="font-bold text-foreground">{result.detectedLanguage}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2.5 py-1 rounded-full bg-secondary text-primary font-600">
                      {result.confidence}% confidence
                    </span>
                    <span className="text-xs text-positive font-600">Saved</span>
                  </div>
                </div>
                <div className="flex items-end gap-2">
                  <span className={`text-4xl font-bold font-tabular ${scoreColor}`}>{result.score}</span>
                  <span className="text-xl text-muted-foreground mb-0.5">/ {result.maxMarks}</span>
                  <span className={`text-base font-600 mb-0.5 ${scoreColor}`}>({scorePercent}%)</span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5 mt-2">
                  <div className="h-1.5 rounded-full" style={{ width: `${scorePercent}%`, backgroundColor: scorePercent >= 75 ? 'var(--positive)' : scorePercent >= 50 ? 'var(--warning)' : 'var(--negative)' }} />
                </div>
              </div>

              {/* OCR Text */}
              <div className="bg-card border border-border rounded-2xl p-5 shadow-card">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-foreground">Extracted Text (OCR)</h3>
                  <button onClick={() => setShowNative(!showNative)} className="text-xs font-600 text-primary hover:bg-secondary px-2 py-1 rounded-lg transition-colors">
                    {showNative ? 'Show English' : 'Show Native'}
                  </button>
                </div>
                <div className="bg-muted/40 rounded-xl p-3 text-sm text-foreground whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto scrollbar-thin">
                  {showNative ? result.ocrText : result.englishTranslation}
                </div>
              </div>

              {/* Points earned/missed */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {result.pointsEarned?.length > 0 && (
                  <div className="bg-card border border-border rounded-2xl p-4 shadow-card">
                    <div className="flex items-center gap-1.5 mb-2">
                      <CheckCircle2 size={14} className="text-positive" />
                      <span className="text-xs font-700 text-positive">Points Earned</span>
                    </div>
                    <ul className="space-y-1.5">
                      {result.pointsEarned.map((pt, i) => (
                        <li key={i} className="text-xs text-foreground flex items-start gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-positive mt-1 shrink-0" />
                          {pt}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {result.pointsMissed?.length > 0 && (
                  <div className="bg-card border border-border rounded-2xl p-4 shadow-card">
                    <div className="flex items-center gap-1.5 mb-2">
                      <AlertCircle size={14} className="text-negative" />
                      <span className="text-xs font-700 text-negative">Points Missed</span>
                    </div>
                    <ul className="space-y-1.5">
                      {result.pointsMissed.map((pt, i) => (
                        <li key={i} className="text-xs text-foreground flex items-start gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-negative mt-1 shrink-0" />
                          {pt}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Feedback */}
              <div className="bg-card border border-border rounded-2xl p-5 shadow-card">
                <h3 className="font-bold text-foreground mb-2">Feedback</h3>
                <p className="text-sm text-foreground leading-relaxed mb-3">{result.feedbackInEnglish}</p>
                {result.feedbackInNativeLanguage && result.feedbackInNativeLanguage !== result.feedbackInEnglish && (
                  <div className="border-t border-border pt-3">
                    <p className="text-xs font-600 text-muted-foreground mb-1">{result.detectedLanguage} feedback:</p>
                    <p className="text-sm text-foreground leading-relaxed">{result.feedbackInNativeLanguage}</p>
                  </div>
                )}
              </div>

              <button onClick={() => { setResult(null); setImage(null); setPreview(null); setPdfFile(null); }} className="btn-secondary w-full py-2.5 rounded-xl text-sm font-600">
                Evaluate Another Sheet
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
