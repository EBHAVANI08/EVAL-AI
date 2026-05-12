'use client';

import React, { useState } from 'react';
import { Lightbulb, Sparkles, Copy, CheckCircle2, Loader2, BookOpen, Clock, Target, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

type Result = {
  modelAnswer: string;
  keyPoints: string[];
  markingScheme: { point: string; marks: number }[];
  tips: string;
  estimatedTime: string;
};

const EXAMPLES = [
  'Explain the process of photosynthesis with a labeled diagram.',
  'What is the difference between mitosis and meiosis? Give examples.',
  "State and explain Newton's three laws of motion with real-life examples.",
];

const CLASSES = ['6', '7', '8', '9', '10', '11', '12'];
const BOARDS = ['CBSE', 'ICSE', 'State Board', 'IB', 'IGCSE'];
const LANGUAGES = ['English', 'Hindi', 'Telugu', 'Tamil', 'Kannada', 'Marathi'];
const STYLES = [
  'CBSE Standard (Points)',
  'Essay Format',
  'Diagram + Notes',
  'Numerical Working',
  'Short Answer',
];

export default function AnswerGeneratorClient() {
  const [question, setQuestion] = useState('');
  const [subject, setSubject] = useState('');
  const [cls, setCls] = useState('10');
  const [marks, setMarks] = useState('5');
  const [board, setBoard] = useState('CBSE');
  const [language, setLanguage] = useState('English');
  const [style, setStyle] = useState('CBSE Standard (Points)');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [copied, setCopied] = useState(false);

  async function generate() {
    if (!question.trim()) { toast.error('Please enter a question'); return; }
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/ai/generate-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, subject, class: cls, board, marks: Number(marks), style, language }),
      });
      if (res.status === 429) { toast.error('Rate limit reached. Please wait 30-60 seconds and try again.'); return; }
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Failed'); }
      setResult(await res.json());
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate answer');
    } finally {
      setLoading(false);
    }
  }

  async function copy() {
    if (!result) return;
    await navigator.clipboard.writeText(result.modelAnswer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Copied to clipboard');
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Lightbulb size={22} className="text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Answer Generator</h1>
          <p className="text-sm text-muted-foreground">Generate CBSE-style model answers with AI in seconds</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Left: Input */}
        <div className="xl:col-span-2 space-y-4">
          <div className="bg-card border border-border rounded-2xl p-5 shadow-card">
            <label className="block text-sm font-600 text-foreground mb-2">Question *</label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Enter the exam question here..."
              rows={5}
              className="input-field text-sm resize-none"
            />

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div>
                <label className="block text-xs font-600 text-muted-foreground mb-1">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Biology"
                  className="input-field text-sm py-2"
                />
              </div>
              <div>
                <label className="block text-xs font-600 text-muted-foreground mb-1">Class</label>
                <select value={cls} onChange={(e) => setCls(e.target.value)} className="input-field text-sm py-2">
                  {CLASSES.map((c) => <option key={c} value={c}>Class {c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-600 text-muted-foreground mb-1">Marks</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={marks}
                  onChange={(e) => setMarks(e.target.value)}
                  className="input-field text-sm py-2"
                />
              </div>
              <div>
                <label className="block text-xs font-600 text-muted-foreground mb-1">Board</label>
                <select value={board} onChange={(e) => setBoard(e.target.value)} className="input-field text-sm py-2">
                  {BOARDS.map((b) => <option key={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-600 text-muted-foreground mb-1">Language</label>
                <select value={language} onChange={(e) => setLanguage(e.target.value)} className="input-field text-sm py-2">
                  {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-600 text-muted-foreground mb-1">Style</label>
                <select value={style} onChange={(e) => setStyle(e.target.value)} className="input-field text-sm py-2">
                  {STYLES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <button
              onClick={generate}
              disabled={loading || !question.trim()}
              className="btn-primary w-full mt-5 py-3 rounded-xl text-sm font-600 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              {loading ? 'Generating…' : 'Generate Model Answer'}
            </button>
          </div>

          {/* Quick examples */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-card">
            <p className="text-xs font-600 text-muted-foreground uppercase tracking-wider mb-3">Quick Examples</p>
            <div className="space-y-2">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  onClick={() => setQuestion(ex)}
                  className="w-full text-left px-3 py-2.5 rounded-xl border border-border hover:bg-secondary/60 hover:border-primary/30 transition-colors group text-sm"
                >
                  <div className="flex items-start gap-2">
                    <ChevronRight size={14} className="text-primary mt-0.5 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                    <span className="text-foreground leading-snug">{ex}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Result */}
        <div className="xl:col-span-3">
          {!result && !loading && (
            <div className="bg-card border border-border rounded-2xl p-10 shadow-card flex flex-col items-center justify-center text-center h-full min-h-[400px]">
              <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
                <Sparkles size={28} className="text-primary" />
              </div>
              <h3 className="text-base font-bold text-foreground mb-2">Ready to generate</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Enter a question on the left and click Generate to get a full model answer with marking scheme.
              </p>
            </div>
          )}

          {loading && (
            <div className="bg-card border border-border rounded-2xl p-10 shadow-card flex flex-col items-center justify-center min-h-[400px]">
              <Loader2 size={32} className="animate-spin text-primary mb-4" />
              <p className="text-sm font-500 text-foreground mb-1">Generating model answer…</p>
              <p className="text-xs text-muted-foreground">Using Gemini 2.5 Flash — takes 5-15 seconds</p>
            </div>
          )}

          {result && (
            <div className="space-y-4 animate-slide-up">
              {/* Model Answer */}
              <div className="bg-card border border-border rounded-2xl p-5 shadow-card">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <BookOpen size={16} className="text-primary" />
                    <h3 className="font-bold text-foreground">Model Answer</h3>
                    {result.estimatedTime && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        <Clock size={10} />
                        {result.estimatedTime}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={copy}
                    className="flex items-center gap-1.5 text-xs font-600 text-primary hover:bg-secondary px-3 py-1.5 rounded-lg transition-colors"
                  >
                    {copied ? <CheckCircle2 size={12} className="text-positive" /> : <Copy size={12} />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <div className="bg-muted/40 rounded-xl p-4 text-sm text-foreground whitespace-pre-wrap leading-relaxed font-mono">
                  {result.modelAnswer}
                </div>
              </div>

              {/* Key Points */}
              {result.keyPoints?.length > 0 && (
                <div className="bg-card border border-border rounded-2xl p-5 shadow-card">
                  <div className="flex items-center gap-2 mb-3">
                    <Target size={16} className="text-positive" />
                    <h3 className="font-bold text-foreground">Key Points to Include</h3>
                  </div>
                  <ol className="space-y-2">
                    {result.keyPoints.map((pt, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-700 flex items-center justify-center mt-0.5">
                          {i + 1}
                        </span>
                        {pt}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Marking Scheme */}
              {result.markingScheme?.length > 0 && (
                <div className="bg-card border border-border rounded-2xl p-5 shadow-card">
                  <h3 className="font-bold text-foreground mb-3">Marking Scheme</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="pb-2 text-left text-xs font-600 text-muted-foreground">Point</th>
                          <th className="pb-2 text-right text-xs font-600 text-muted-foreground w-16">Marks</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.markingScheme.map((row, i) => (
                          <tr key={i} className="border-b border-border/50 last:border-0">
                            <td className="py-2 pr-4 text-foreground">{row.point}</td>
                            <td className="py-2 text-right font-700 font-tabular text-primary">{row.marks}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tips */}
              {result.tips && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb size={16} className="text-warning" />
                    <h3 className="font-bold text-amber-900">Exam Tips</h3>
                  </div>
                  <p className="text-sm text-amber-800">{result.tips}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setResult(null)}
                  className="btn-secondary flex-1 py-2.5 rounded-xl text-sm font-600"
                >
                  Clear
                </button>
                <button
                  onClick={generate}
                  className="btn-primary flex-1 py-2.5 rounded-xl text-sm font-600 flex items-center justify-center gap-2"
                >
                  <Sparkles size={14} />
                  Generate Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
