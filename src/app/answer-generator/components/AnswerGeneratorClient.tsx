'use client';

import React, { useState, useEffect } from 'react';
import { Lightbulb, Sparkles, Copy, CheckCircle2, Loader2, BookOpen, Clock, Target, ChevronRight, History, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { callGeminiText } from '@/lib/gemini-client';

// Simple markdown renderer — handles ##, **, *, numbered lists, line breaks
function renderMarkdown(text: string) {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let key = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // ASCII diagram block — render as monospace pre
    if (line.match(/^[\s\|+\-=>v<\[\]\/\\]+$/) && line.trim().length > 3) {
      // Collect consecutive diagram lines
      let block = line;
      while (i + 1 < lines.length && lines[i + 1].match(/^[\s\|+\-=>v<\[\]\/\\A-Za-z0-9_()\[\]{}.,:;!?@#$%^&*]+$/)) {
        i++;
        block += '\n' + lines[i];
      }
      elements.push(
        <pre key={key++} className="bg-slate-900 text-green-400 rounded-xl p-4 text-xs overflow-x-auto font-mono leading-relaxed my-3 border border-slate-700">
          {block}
        </pre>
      );
      continue;
    }

    if (!line.trim()) { elements.push(<div key={key++} className="h-2" />); continue; }

    // H1 ##
    if (line.startsWith('### ')) {
      elements.push(<h3 key={key++} className="text-sm font-bold text-foreground mt-4 mb-1">{line.slice(4)}</h3>);
    } else if (line.startsWith('## ')) {
      elements.push(<h2 key={key++} className="text-base font-bold text-foreground mt-4 mb-1 border-b border-border pb-1">{line.slice(3)}</h2>);
    } else if (line.startsWith('# ')) {
      elements.push(<h1 key={key++} className="text-lg font-bold text-foreground mt-4 mb-2">{line.slice(2)}</h1>);
    } else {
      // Inline bold/italic
      const parts = line.replace(/\*\*(.+?)\*\*/g, '|||BOLD|||$1|||/BOLD|||').split('|||');
      const inline = parts.map((p, pi) => {
        if (p.startsWith('BOLD|||')) return <strong key={pi} className="font-bold">{p.slice(7)}</strong>;
        if (p === '/BOLD|||') return null;
        return p;
      });
      // Numbered list
      if (/^\d+\.\s/.test(line)) {
        elements.push(<div key={key++} className="flex gap-2 text-sm text-foreground my-0.5"><span className="text-primary font-bold shrink-0">{line.match(/^\d+/)![0]}.</span><span>{inline}</span></div>);
      } else if (line.startsWith('- ') || line.startsWith('• ')) {
        elements.push(<div key={key++} className="flex gap-2 text-sm text-foreground my-0.5"><span className="text-primary shrink-0 mt-1">•</span><span>{inline}</span></div>);
      } else {
        elements.push(<p key={key++} className="text-sm text-foreground my-0.5 leading-relaxed">{inline}</p>);
      }
    }
  }
  return elements;
}

type Result = {
  modelAnswer: string;
  keyPoints: string[];
  markingScheme: { point: string; marks: number }[];
  tips: string;
  estimatedTime: string;
};

type HistoryItem = {
  id: string;
  question: string;
  subject: string;
  cls: string;
  marks: string;
  board: string;
  language: string;
  style: string;
  result: Result;
  createdAt: string;
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

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    fetch('/api/generated-answers?limit=10')
      .then((r) => r.json())
      .then((data) => setHistory(data.answers || []))
      .catch(() => {})
      .finally(() => setLoadingHistory(false));
  }, []);

  async function generate() {
    if (!question.trim()) { toast.error('Please enter a question'); return; }
    setLoading(true);
    setResult(null);
    try {
      const prompt = `You are an expert ${board || 'CBSE'} teacher writing model answers for students.

Generate a detailed, well-structured model answer for the following question.

Question: ${question}
Subject: ${subject || 'General'}
Class: ${cls || 'Unknown'}
Marks: ${marks || 'Not specified'}
Answer Style: ${style || 'CBSE Standard (Points)'}
Language: ${language || 'English'}

Requirements:
- Write a complete, exam-ready model answer
- Use clear headings and numbered points where appropriate
- Include ALL key points needed for full marks
- For diagram questions or "Diagram + Notes" style: describe the diagram in a clearly labeled section with all parts, arrows, and labels listed as bullet points (do NOT use ASCII art)
- Match detail level to marks weightage
- Follow ${board || 'CBSE'} conventions for answer writing
- For numerical questions, show complete step-by-step working
- Write in ${language || 'English'}

Return ONLY valid JSON (no markdown fences) in this exact format:
{
  "modelAnswer": "The complete formatted model answer text with proper structure",
  "keyPoints": ["Key point 1 that must be mentioned", "Key point 2", "Key point 3"],
  "markingScheme": [
    {"point": "What earns marks here", "marks": 1}
  ],
  "tips": "Exam tips for writing this answer effectively",
  "estimatedTime": "X minutes"
}`;

      let text = await callGeminiText(prompt, { temperature: 0.3, maxOutputTokens: 8192 });
      text = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();

      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try { data = JSON.parse(jsonMatch[0]); } catch { data = null; }
        }
        if (!data) {
          data = { modelAnswer: text, keyPoints: [], markingScheme: [], tips: '', estimatedTime: '' };
        }
      }
      if (data.modelAnswer && typeof data.modelAnswer === 'object') {
        data.modelAnswer = JSON.stringify(data.modelAnswer, null, 2);
      }
      setResult(data);

      // Auto-save to MongoDB
      try {
        const saveRes = await fetch('/api/generated-answers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question, subject, cls, marks, board, language, style, result: data }),
        });
        if (saveRes.ok) {
          const saved = await saveRes.json();
          const newItem: HistoryItem = {
            id: saved.id,
            question,
            subject,
            cls,
            marks,
            board,
            language,
            style,
            result: data,
            createdAt: new Date().toISOString(),
          };
          setHistory((prev) => [newItem, ...prev.slice(0, 9)]);
        }
      } catch {
        // save failed silently
      }
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

  function loadFromHistory(item: HistoryItem) {
    setQuestion(item.question);
    setSubject(item.subject);
    setCls(item.cls);
    setMarks(item.marks);
    setBoard(item.board);
    setLanguage(item.language);
    setStyle(item.style);
    setResult(item.result);
    setHistoryOpen(false);
    toast.success('Loaded from history');
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Lightbulb size={22} className="text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Answer Generator</h1>
            <p className="text-sm text-muted-foreground">Generate CBSE-style model answers with AI in seconds</p>
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
          <h3 className="font-bold text-foreground mb-3 text-sm">Previously Generated Answers</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-thin">
            {history.map((item) => (
              <button
                key={item.id}
                onClick={() => loadFromHistory(item)}
                className="w-full text-left flex items-center justify-between px-3 py-2.5 rounded-xl border border-border hover:bg-secondary/60 transition-colors gap-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-600 text-foreground truncate">{item.question}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.subject || 'General'} · Class {item.cls} · {item.board} · {new Date(item.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <span className="text-xs font-600 text-muted-foreground shrink-0">{item.marks}M</span>
              </button>
            ))}
          </div>
        </div>
      )}

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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
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
              {!loadingHistory && history.length > 0 && (
                <p className="text-xs text-primary mt-3 font-600">
                  {history.length} previously generated {history.length === 1 ? 'answer' : 'answers'} — click History above to view
                </p>
              )}
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
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-positive font-600">Saved</span>
                    <button
                      onClick={copy}
                      className="flex items-center gap-1.5 text-xs font-600 text-primary hover:bg-secondary px-3 py-1.5 rounded-lg transition-colors"
                    >
                      {copied ? <CheckCircle2 size={12} className="text-positive" /> : <Copy size={12} />}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
                <div className="bg-muted/40 rounded-xl p-4 leading-relaxed">
                  {renderMarkdown(result.modelAnswer)}
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
