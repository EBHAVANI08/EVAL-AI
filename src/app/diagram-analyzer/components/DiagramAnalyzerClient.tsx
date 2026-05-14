'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ScanLine, Upload, X, Brain, CheckCircle2, AlertCircle, Loader2, Target, History, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';

type Result = {
  score: number;
  aiConfidence: number;
  correct: string[];
  missing: string[];
  improvements: string[];
  labelAccuracy: number;
  feedback: string;
};

type HistoryItem = {
  id: string;
  description: string;
  subject: string;
  maxMarks: string;
  result: Result;
  createdAt: string;
};

export default function DiagramAnalyzerClient() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [maxMarks, setMaxMarks] = useState('5');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    fetch('/api/diagram-analyses?limit=10')
      .then((r) => r.json())
      .then((data) => setHistory(data.analyses || []))
      .catch(() => {})
      .finally(() => setLoadingHistory(false));
  }, []);

  function handleFile(file: File) {
    if (!file.type.startsWith('image/')) { toast.error('Please upload an image file (JPG, PNG, WEBP)'); return; }
    setImage(file);
    setResult(null);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  function removeImage() { setImage(null); setPreview(null); setResult(null); }

  async function analyze() {
    if (!image || !description.trim()) { toast.error('Upload an image and describe what the diagram should show'); return; }
    setLoading(true);
    setResult(null);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(image);
      });

      const prompt = `You are evaluating a student-drawn diagram for an exam.

Diagram question/description: ${description}
Subject: ${subject || 'General Science'}
Maximum marks: ${maxMarks}

Carefully analyze this student-drawn diagram and evaluate it. Consider:
- Accuracy of the drawing
- Correctness and completeness of labels
- Neatness and clarity
- Whether all required components are present
- Proportions and spatial relationships

Return ONLY valid JSON (no markdown fences):
{
  "score": <number from 0 to ${maxMarks}>,
  "aiConfidence": <0-100, your confidence in this evaluation>,
  "correct": ["Element drawn correctly 1", "Element drawn correctly 2"],
  "missing": ["Missing element 1", "Incorrect element 1"],
  "improvements": ["Specific suggestion 1", "Specific suggestion 2"],
  "labelAccuracy": <0-100, percentage of labels that are correct>,
  "feedback": "Overall feedback paragraph for the student"
}`;

      const res = await fetch('/api/ai/gemini-vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mimeType: image.type, base64Data: base64, prompt }),
      });

      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.error || 'Analysis failed');
      }

      const data = await res.json();
      let text = data.text || '';
      text = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();

      let parsed: Result;
      try {
        parsed = JSON.parse(text);
      } catch {
        throw new Error('Could not parse AI response. Please try again.');
      }

      setResult(parsed);

      // Auto-save to MongoDB
      try {
        const saveRes = await fetch('/api/diagram-analyses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ description, subject, maxMarks, result: parsed }),
        });
        if (saveRes.ok) {
          const saved = await saveRes.json();
          const newItem: HistoryItem = {
            id: saved.id,
            description,
            subject,
            maxMarks,
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
    setDescription(item.description);
    setSubject(item.subject);
    setMaxMarks(item.maxMarks);
    setResult(item.result);
    setImage(null);
    setPreview(null);
    setHistoryOpen(false);
    toast.success('Loaded from history');
  }

  const scorePercent = result ? Math.round((result.score / Number(maxMarks)) * 100) : 0;
  const scoreColor = scorePercent >= 75 ? 'text-positive' : scorePercent >= 50 ? 'text-warning' : 'text-negative';

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <ScanLine size={22} className="text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Diagram Analyzer</h1>
            <p className="text-sm text-muted-foreground">AI-powered evaluation of student-drawn diagrams</p>
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
          <h3 className="font-bold text-foreground mb-3 text-sm">Previous Analyses</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-thin">
            {history.map((item) => {
              const pct = Math.round((item.result.score / Number(item.maxMarks)) * 100);
              const color = pct >= 75 ? 'text-positive' : pct >= 50 ? 'text-warning' : 'text-negative';
              return (
                <button
                  key={item.id}
                  onClick={() => loadFromHistory(item)}
                  className="w-full text-left flex items-center justify-between px-3 py-2.5 rounded-xl border border-border hover:bg-secondary/60 transition-colors gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-600 text-foreground truncate">{item.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.subject || 'General'} · {new Date(item.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <span className={`text-sm font-bold font-tabular shrink-0 ${color}`}>
                    {item.result.score}/{item.maxMarks}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Left: Upload + Config */}
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-2xl p-5 shadow-card">
            <h3 className="font-bold text-foreground mb-4">Upload Diagram</h3>

            {!preview ? (
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${dragging ? 'border-primary bg-secondary/40' : 'border-border hover:border-primary/50 hover:bg-muted/40'}`}
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
              >
                <Upload size={32} className="text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-sm font-500 text-foreground mb-1">Drop image here or click to upload</p>
                <p className="text-xs text-muted-foreground">JPG, PNG, WEBP supported</p>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
              </div>
            ) : (
              <div className="relative rounded-xl overflow-hidden border border-border">
                <img src={preview} alt="Diagram" className="w-full max-h-72 object-contain bg-muted/20" />
                <button
                  onClick={removeImage}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-card border border-border flex items-center justify-center shadow hover:bg-negative-bg transition-colors"
                >
                  <X size={14} className="text-negative" />
                </button>
              </div>
            )}
          </div>

          <div className="bg-card border border-border rounded-2xl p-5 shadow-card space-y-4">
            <h3 className="font-bold text-foreground">Evaluation Config</h3>
            <div>
              <label className="block text-xs font-600 text-muted-foreground mb-1">What should this diagram show? *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Labeled diagram of the human heart showing four chambers, major blood vessels, and direction of blood flow"
                rows={3}
                className="input-field text-sm resize-none"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-600 text-muted-foreground mb-1">Subject</label>
                <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Biology" className="input-field text-sm py-2" />
              </div>
              <div>
                <label className="block text-xs font-600 text-muted-foreground mb-1">Max Marks</label>
                <input type="number" min={1} max={20} value={maxMarks} onChange={(e) => setMaxMarks(e.target.value)} className="input-field text-sm py-2" />
              </div>
            </div>
            <button
              onClick={analyze}
              disabled={loading || !image || !description.trim()}
              className="btn-primary w-full py-3 rounded-xl text-sm font-600 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Brain size={16} />}
              {loading ? 'Analyzing…' : 'Analyze Diagram'}
            </button>
          </div>
        </div>

        {/* Right: Results */}
        <div>
          {!result && !loading && (
            <div className="bg-card border border-border rounded-2xl p-10 shadow-card flex flex-col items-center justify-center text-center min-h-[400px]">
              <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
                <Brain size={28} className="text-primary" />
              </div>
              <h3 className="text-base font-bold text-foreground mb-2">Upload & Analyze</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Upload a student's diagram and describe what it should show. AI will score it and provide detailed feedback.
              </p>
              {!loadingHistory && history.length > 0 && (
                <p className="text-xs text-primary mt-3 font-600">
                  {history.length} previous {history.length === 1 ? 'analysis' : 'analyses'} saved — click History above to view
                </p>
              )}
            </div>
          )}

          {loading && (
            <div className="bg-card border border-border rounded-2xl p-10 shadow-card flex flex-col items-center justify-center min-h-[400px]">
              <Loader2 size={32} className="animate-spin text-primary mb-4" />
              <p className="text-sm font-500 text-foreground mb-1">Analyzing diagram…</p>
              <p className="text-xs text-muted-foreground">Gemini is examining the drawing</p>
            </div>
          )}

          {result && (
            <div className="space-y-4 animate-slide-up">
              {/* Score */}
              <div className="bg-card border border-border rounded-2xl p-5 shadow-card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-foreground">Score</h3>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-secondary text-primary font-600">
                    AI Confidence: {result.aiConfidence}%
                  </span>
                </div>
                <div className="flex items-end gap-3 mb-3">
                  <span className={`text-5xl font-bold font-tabular ${scoreColor}`}>{result.score}</span>
                  <span className="text-2xl text-muted-foreground mb-1">/ {maxMarks}</span>
                  <span className={`text-lg font-600 mb-1 ${scoreColor}`}>({scorePercent}%)</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{ width: `${scorePercent}%`, backgroundColor: scorePercent >= 75 ? 'var(--positive)' : scorePercent >= 50 ? 'var(--warning)' : 'var(--negative)' }}
                  />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground">Label Accuracy: <strong>{result.labelAccuracy}%</strong></span>
                  <span className="text-xs text-positive font-600">Saved</span>
                </div>
              </div>

              {/* Correct */}
              {result.correct?.length > 0 && (
                <div className="bg-card border border-border rounded-2xl p-5 shadow-card">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 size={16} className="text-positive" />
                    <h3 className="font-bold text-foreground">Drawn Correctly</h3>
                  </div>
                  <ul className="space-y-2">
                    {result.correct.map((pt, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                        <span className="w-1.5 h-1.5 rounded-full bg-positive mt-2 shrink-0" />
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Missing */}
              {result.missing?.length > 0 && (
                <div className="bg-card border border-border rounded-2xl p-5 shadow-card">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle size={16} className="text-negative" />
                    <h3 className="font-bold text-foreground">Missing / Incorrect</h3>
                  </div>
                  <ul className="space-y-2">
                    {result.missing.map((pt, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                        <span className="w-1.5 h-1.5 rounded-full bg-negative mt-2 shrink-0" />
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Improvements */}
              {result.improvements?.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Target size={16} className="text-warning" />
                    <h3 className="font-bold text-amber-900">How to Improve</h3>
                  </div>
                  <ul className="space-y-2">
                    {result.improvements.map((pt, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-amber-800">
                        <span className="font-bold shrink-0">{i + 1}.</span>
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Overall feedback */}
              {result.feedback && (
                <div className="bg-card border border-border rounded-2xl p-5 shadow-card">
                  <h3 className="font-bold text-foreground mb-2">Overall Feedback</h3>
                  <p className="text-sm text-foreground leading-relaxed">{result.feedback}</p>
                </div>
              )}

              <button onClick={() => { setResult(null); setImage(null); setPreview(null); }} className="btn-secondary w-full py-2.5 rounded-xl text-sm font-600">
                Analyze Another Diagram
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
