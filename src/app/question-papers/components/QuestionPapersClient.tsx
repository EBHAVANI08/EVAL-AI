'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  BookOpen, Search, Plus, Trash2, ChevronDown, ChevronUp,
  Loader2, Upload, X, FileText, ExternalLink,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { callGeminiVision } from '@/lib/gemini-client';

type Paper = {
  id: string;
  title: string;
  subject: string;
  class: string;
  board: string;
  totalMarks: number;
  questionCount: number;
  createdAt: string;
  questions: { id?: string; questionText: string; marks: number; type?: string }[];
};

const BOARDS = ['CBSE', 'ICSE', 'State Board', 'IB', 'IGCSE'];

export default function QuestionPapersClient() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);

  // Upload form state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadSubject, setUploadSubject] = useState('');
  const [uploadClass, setUploadClass] = useState('');
  const [uploadBoard, setUploadBoard] = useState('CBSE');
  const [extracting, setExtracting] = useState(false);
  const [extractedQuestions, setExtractedQuestions] = useState<Paper['questions'] | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadPapers(); }, []);

  async function loadPapers() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (subjectFilter) params.set('subject', subjectFilter);
      const res = await fetch(`/api/question-papers?${params}`);
      const data = await res.json();
      setPapers(data.papers || []);
    } catch {
      toast.error('Failed to load question papers');
    } finally {
      setLoading(false);
    }
  }

  async function deletePaper(id: string) {
    if (!confirm('Delete this question paper? This cannot be undone.')) return;
    try {
      await fetch(`/api/question-papers/${id}`, { method: 'DELETE' });
      setPapers((prev) => prev.filter((p) => p.id !== id));
      toast.success('Paper deleted');
    } catch {
      toast.error('Failed to delete paper');
    }
  }

  function handleUploadFile(file: File) {
    setUploadFile(file);
    setExtractedQuestions(null);
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setUploadPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setUploadPreview(null);
    }
  }

  async function extractQuestions() {
    if (!uploadFile) { toast.error('Upload a question paper first'); return; }
    setExtracting(true);
    setExtractedQuestions(null);
    try {
      let payload: any;
      if (uploadFile.type.startsWith('image/')) {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve((reader.result as string).split(',')[1]);
          reader.onerror = reject;
          reader.readAsDataURL(uploadFile);
        });
        payload = { mimeType: uploadFile.type, base64Data: base64 };
      } else {
        // PDF — use File API upload
        const formData = new FormData();
        formData.append('file', uploadFile);
        const uploadRes = await fetch('/api/ai/gemini-upload', { method: 'POST', body: formData });
        if (!uploadRes.ok) throw new Error('Upload failed');
        const { base64Data, mimeType } = await uploadRes.json();
        payload = { base64Data, mimeType };
      }

      const prompt = `You are extracting questions from a question paper image or PDF.

Subject: ${uploadSubject || 'Unknown'}
Class: ${uploadClass || 'Unknown'}
Board: ${uploadBoard}

Extract ALL questions from this question paper. For each question include:
- The full question text
- Marks allocated
- Question type (MCQ, Short Answer, Long Answer, Case Study, Diagram, Numerical)

Return ONLY valid JSON (no markdown fences):
{
  "subject": "detected subject name",
  "class": "detected class",
  "totalMarks": <total marks>,
  "questions": [
    {
      "id": "Q1",
      "questionText": "Full question text here",
      "marks": 2,
      "type": "Short Answer"
    }
  ]
}`;

      const { text: rawText } = await callGeminiVision({ ...payload, prompt });
      let text = rawText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
      const parsed = JSON.parse(text);

      if (!uploadSubject && parsed.subject) setUploadSubject(parsed.subject);
      if (!uploadClass && parsed.class) setUploadClass(parsed.class);
      setExtractedQuestions(parsed.questions || []);
      toast.success(`Extracted ${parsed.questions?.length || 0} questions`);
    } catch (err: any) {
      toast.error(err.message || 'Extraction failed');
    } finally {
      setExtracting(false);
    }
  }

  async function savePaper() {
    if (!extractedQuestions || extractedQuestions.length === 0) {
      toast.error('No questions to save'); return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/question-papers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: uploadTitle || `${uploadSubject || 'Untitled'} — ${uploadClass || ''} ${uploadBoard}`,
          subject: uploadSubject,
          class: uploadClass,
          board: uploadBoard,
          questions: extractedQuestions,
        }),
      });
      if (!res.ok) throw new Error('Save failed');
      toast.success('Paper saved to library');
      resetUpload();
      loadPapers();
    } catch (err: any) {
      toast.error(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  function resetUpload() {
    setShowUpload(false);
    setUploadFile(null);
    setUploadPreview(null);
    setUploadTitle('');
    setUploadSubject('');
    setUploadClass('');
    setUploadBoard('CBSE');
    setExtractedQuestions(null);
  }

  const subjects = Array.from(new Set(papers.map((p) => p.subject).filter(Boolean))).sort();

  const filtered = papers.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch = !search || p.title.toLowerCase().includes(q) || p.subject.toLowerCase().includes(q) || p.class.toLowerCase().includes(q);
    const matchSubject = !subjectFilter || p.subject.toLowerCase() === subjectFilter.toLowerCase();
    return matchSearch && matchSubject;
  });

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BookOpen size={22} className="text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Question Papers</h1>
          </div>
          <p className="text-sm text-muted-foreground">Library of question papers with AI-extracted questions</p>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="btn-primary flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-600"
        >
          <Plus size={16} />
          Upload Paper
        </button>
      </div>

      {/* Search + Filters */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search papers..."
            className="pl-8 pr-3 py-2 text-sm input-field"
          />
        </div>
        <select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)} className="input-field w-40 py-2 text-sm">
          <option value="">All Subjects</option>
          {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <p className="text-xs text-muted-foreground">{filtered.length} paper{filtered.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Papers Grid */}
      {loading ? (
        <div className="flex flex-col items-center py-20">
          <Loader2 size={24} className="animate-spin text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">Loading papers…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-16 text-center shadow-card">
          <BookOpen size={48} className="text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-base font-bold text-foreground mb-2">No question papers yet</h3>
          <p className="text-sm text-muted-foreground mb-4">Upload a question paper to extract and save its questions.</p>
          <button onClick={() => setShowUpload(true)} className="btn-primary px-4 py-2.5 rounded-xl text-sm font-600 inline-flex items-center gap-2">
            <Plus size={14} /> Upload First Paper
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((paper) => (
            <div key={paper.id} className="bg-card border border-border rounded-2xl shadow-card card-hover overflow-hidden">
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="font-bold text-foreground text-sm leading-snug">{paper.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{paper.createdAt}</p>
                  </div>
                  <button
                    onClick={() => deletePaper(paper.id)}
                    className="w-7 h-7 rounded-lg hover:bg-negative-bg flex items-center justify-center transition-colors shrink-0"
                  >
                    <Trash2 size={13} className="text-negative" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2 py-0.5 rounded-full bg-secondary text-primary text-xs font-600">{paper.subject || '—'}</span>
                  <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs">{paper.class || '—'}</span>
                  <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs">{paper.board}</span>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-muted/50 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-foreground">{paper.totalMarks}</p>
                    <p className="text-xs text-muted-foreground">Total Marks</p>
                  </div>
                  <div className="bg-muted/50 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-foreground">{paper.questionCount}</p>
                    <p className="text-xs text-muted-foreground">Questions</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setExpanded(expanded === paper.id ? null : paper.id)}
                    className="btn-secondary flex-1 py-2 rounded-xl text-xs font-600 flex items-center justify-center gap-1"
                  >
                    {expanded === paper.id ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    {expanded === paper.id ? 'Hide' : 'View'} Questions
                  </button>
                  <Link
                    href="/answer-sheet-evaluator"
                    className="btn-primary flex-1 py-2 rounded-xl text-xs font-600 flex items-center justify-center gap-1"
                  >
                    <ExternalLink size={12} />
                    Evaluate
                  </Link>
                </div>
              </div>

              {/* Expanded questions */}
              {expanded === paper.id && paper.questions.length > 0 && (
                <div className="border-t border-border px-5 py-4 bg-muted/20">
                  <p className="text-xs font-600 text-muted-foreground uppercase tracking-wider mb-3">Questions</p>
                  <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin">
                    {paper.questions.map((q, i) => (
                      <div key={q.id || i} className="flex items-start gap-2 text-xs">
                        <span className="text-primary font-700 shrink-0 w-5 mt-0.5">{q.id || `Q${i + 1}`}</span>
                        <span className="flex-1 text-foreground leading-relaxed">{q.questionText}</span>
                        <span className="shrink-0 font-700 text-muted-foreground">[{q.marks}m]</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fade-in p-4">
          <div className="bg-card rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-card">
              <h2 className="font-bold text-foreground">Upload Question Paper</h2>
              <button onClick={resetUpload} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                <X size={16} className="text-muted-foreground" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              {/* File upload */}
              <div>
                <label className="block text-sm font-600 text-foreground mb-2">Question Paper File *</label>
                {!uploadFile ? (
                  <div
                    className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
                    onClick={() => fileRef.current?.click()}
                  >
                    <Upload size={28} className="text-muted-foreground/50 mx-auto mb-2" />
                    <p className="text-sm font-500 text-foreground">Click to upload PDF or image</p>
                    <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG supported</p>
                    <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUploadFile(f); }} />
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl border border-border">
                    <FileText size={20} className="text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-600 text-foreground truncate">{uploadFile.name}</p>
                      <p className="text-xs text-muted-foreground">{(uploadFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <button onClick={() => { setUploadFile(null); setUploadPreview(null); setExtractedQuestions(null); }} className="p-1 hover:text-negative transition-colors">
                      <X size={14} className="text-muted-foreground" />
                    </button>
                  </div>
                )}
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-600 text-muted-foreground mb-1">Title (optional)</label>
                  <input type="text" value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)} placeholder="e.g. Class 10 Science Mid-Term 2025" className="input-field text-sm py-2" />
                </div>
                <div>
                  <label className="block text-xs font-600 text-muted-foreground mb-1">Subject</label>
                  <input type="text" value={uploadSubject} onChange={(e) => setUploadSubject(e.target.value)} placeholder="e.g. Mathematics" className="input-field text-sm py-2" />
                </div>
                <div>
                  <label className="block text-xs font-600 text-muted-foreground mb-1">Class</label>
                  <input type="text" value={uploadClass} onChange={(e) => setUploadClass(e.target.value)} placeholder="e.g. Class 10" className="input-field text-sm py-2" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-600 text-muted-foreground mb-1">Board</label>
                  <select value={uploadBoard} onChange={(e) => setUploadBoard(e.target.value)} className="input-field text-sm py-2">
                    {BOARDS.map((b) => <option key={b}>{b}</option>)}
                  </select>
                </div>
              </div>

              {/* Extract button */}
              <button
                onClick={extractQuestions}
                disabled={!uploadFile || extracting}
                className="btn-secondary w-full py-3 rounded-xl text-sm font-600 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {extracting ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
                {extracting ? 'Extracting Questions…' : 'Extract Questions with AI'}
              </button>

              {/* Extracted questions preview */}
              {extractedQuestions && (
                <div>
                  <p className="text-sm font-600 text-foreground mb-2">{extractedQuestions.length} questions extracted:</p>
                  <div className="bg-muted/30 rounded-xl p-3 max-h-48 overflow-y-auto scrollbar-thin space-y-2">
                    {extractedQuestions.map((q, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs">
                        <span className="text-primary font-700 shrink-0 w-6">{q.id || `Q${i + 1}`}</span>
                        <span className="flex-1 text-foreground">{q.questionText}</span>
                        <span className="shrink-0 font-700 text-muted-foreground">[{q.marks}m]</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-border">
              <button onClick={resetUpload} className="btn-secondary flex-1 py-2.5 rounded-xl text-sm font-600">Cancel</button>
              <button
                onClick={savePaper}
                disabled={!extractedQuestions || saving}
                className="btn-primary flex-1 py-2.5 rounded-xl text-sm font-600 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <BookOpen size={14} />}
                Save to Library
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
