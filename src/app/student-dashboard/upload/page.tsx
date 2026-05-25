'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, FileText, CheckCircle2, Loader2, X, Clock,
  BookOpen, GraduationCap, RefreshCw, AlertCircle, Trash2,
  AlertTriangle, FilePlus, Image as ImageIcon, FileType,
} from 'lucide-react';
import { toast } from 'sonner';

const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Geography', 'Computer Science', 'Economics', 'Other'];
const GRADES   = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];

type FileStatus = 'idle' | 'uploading' | 'saving' | 'done' | 'error';

type QueueFile = {
  id: string;
  file: File;
  status: FileStatus;
  error?: string;
};

type Submission = {
  id: string; subject: string; grade: string; fileName: string;
  status: string; createdAt: string; studentName?: string; rollNo?: string;
};

function fileIcon(file: File) {
  if (file.type === 'application/pdf') return <FileType size={18} className="text-red-500" />;
  return <ImageIcon size={18} className="text-blue-500" />;
}

function fmtSize(bytes: number) {
  return bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(0)} KB`
    : `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export default function StudentUploadPage() {
  const { data: session } = useSession();
  const [subject, setSubject] = useState('');
  const [grade, setGrade]     = useState('');
  const [queue, setQueue]     = useState<QueueFile[]>([]);
  const [drag, setDrag]       = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loadingSubs, setLoadingSubs] = useState(true);
  const [deletingId, setDeletingId]   = useState<string | null>(null);
  const [confirmId, setConfirmId]     = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadSubmissions = useCallback(() => {
    setLoadingSubs(true);
    fetch('/api/student-uploads')
      .then((r) => r.json())
      .then((d) => { if (d.uploads) setSubmissions(d.uploads); })
      .catch(() => toast.error('Failed to load submissions'))
      .finally(() => setLoadingSubs(false));
  }, []);

  useEffect(() => { loadSubmissions(); }, [loadSubmissions]);

  /* ── File validation & add to queue ───────────────────── */
  const addFiles = (incoming: File[]) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    const valid: QueueFile[] = [];
    for (const f of incoming) {
      if (!allowed.includes(f.type)) { toast.error(`${f.name}: only PDF, JPG, PNG or WEBP allowed.`); continue; }
      if (f.size > 20 * 1024 * 1024) { toast.error(`${f.name}: must be under 20 MB.`); continue; }
      // Avoid exact duplicates by name+size
      const already = queue.some((q) => q.file.name === f.name && q.file.size === f.size);
      if (already) { toast.error(`${f.name} is already in the queue.`); continue; }
      valid.push({ id: `${f.name}-${f.size}-${Date.now()}-${Math.random()}`, file: f, status: 'idle' });
    }
    if (valid.length) setQueue((prev) => [...prev, ...valid]);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDrag(false);
    addFiles(Array.from(e.dataTransfer.files));
  };

  const removeFromQueue = (id: string) =>
    setQueue((prev) => prev.filter((q) => q.id !== id));

  const updateStatus = (id: string, status: FileStatus, error?: string) =>
    setQueue((prev) => prev.map((q) => q.id === id ? { ...q, status, error } : q));

  /* ── Submit all queued files ───────────────────────────── */
  const onSubmit = async () => {
    if (!subject || !grade) { toast.error('Please select subject and grade first.'); return; }
    if (queue.length === 0) { toast.error('Add at least one file before submitting.'); return; }

    const pending = queue.filter((q) => q.status === 'idle' || q.status === 'error');
    if (!pending.length) { toast.error('All files are already submitted.'); return; }

    setSubmitting(true);
    let successCount = 0;

    for (const item of pending) {
      try {
        updateStatus(item.id, 'uploading');
        const fd = new FormData();
        fd.append('file', item.file);
        const uploadRes = await fetch('/api/ai/gemini-upload', { method: 'POST', body: fd });
        if (!uploadRes.ok) throw new Error('File upload to storage failed');
        const { base64Data, mimeType } = await uploadRes.json();

        updateStatus(item.id, 'saving');
        const saveRes = await fetch('/api/student-uploads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subject, grade, base64Data, mimeType, fileName: item.file.name }),
        });
        if (!saveRes.ok) throw new Error('Failed to save submission');
        const saved = await saveRes.json();

        updateStatus(item.id, 'done');
        setSubmissions((prev) => [saved, ...prev]);
        successCount++;
      } catch (err: any) {
        updateStatus(item.id, 'error', err.message ?? 'Upload failed');
      }
    }

    setSubmitting(false);

    if (successCount > 0) {
      toast.success(`${successCount} file${successCount > 1 ? 's' : ''} submitted! Your teacher will evaluate them soon.`);
      // Remove done files from queue after 3s
      setTimeout(() => setQueue((prev) => prev.filter((q) => q.status !== 'done')), 3000);
    }
    if (successCount < pending.length) {
      toast.error(`${pending.length - successCount} file(s) failed — check errors below and retry.`);
    }
  };

  /* ── Delete submission ─────────────────────────────────── */
  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setConfirmId(null);
    try {
      const res = await fetch(`/api/student-uploads/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Delete failed');
      setSubmissions((prev) => prev.filter((s) => s.id !== id));
      toast.success('Submission deleted.');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const statusBadge = (s: string) => {
    const map: Record<string, { label: string; className: string }> = {
      pending:      { label: 'Pending',      className: 'bg-amber-50 text-amber-700 border border-amber-200' },
      under_review: { label: 'Under Review', className: 'bg-blue-50 text-blue-700 border border-blue-200' },
      evaluated:    { label: 'Evaluated',    className: 'bg-green-50 text-green-700 border border-green-200' },
    };
    const cfg = map[s] ?? { label: s, className: 'bg-muted text-muted-foreground' };
    return <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${cfg.className}`}>{cfg.label}</span>;
  };

  const canDelete = (s: Submission) => s.status === 'pending';

  const fileStatusIcon = (status: FileStatus) => {
    if (status === 'uploading' || status === 'saving') return <Loader2 size={14} className="animate-spin text-orange-500" />;
    if (status === 'done')  return <CheckCircle2 size={14} className="text-green-500" />;
    if (status === 'error') return <AlertCircle size={14} className="text-red-500" />;
    return null;
  };

  const allDoneOrError = queue.length > 0 && queue.every((q) => q.status === 'done' || q.status === 'error');
  const anyPending     = queue.some((q) => q.status === 'idle' || q.status === 'error');

  return (
    <div className="px-8 py-6 max-w-4xl mx-auto space-y-6">

      {/* Upload card */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center">
              <Upload size={18} className="text-orange-500" />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-sm">Submit Your Answer Sheet</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Upload multiple PDFs or images — your teacher will receive them instantly.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Subject + Grade */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <BookOpen size={12} /> Subject
              </label>
              <select value={subject} onChange={(e) => setSubject(e.target.value)} className="input-field text-sm">
                <option value="">Select subject…</option>
                {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <GraduationCap size={12} /> Grade / Class
              </label>
              <select value={grade} onChange={(e) => setGrade(e.target.value)} className="input-field text-sm">
                <option value="">Select grade…</option>
                {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>

          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-2xl transition-all duration-200 cursor-pointer ${
              drag ? 'border-orange-400 bg-orange-50/60' : 'border-border hover:border-orange-300 hover:bg-orange-50/30'
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              className="hidden"
              onChange={(e) => { if (e.target.files) addFiles(Array.from(e.target.files)); e.target.value = ''; }}
            />
            <div className="flex flex-col items-center justify-center py-8 px-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center mb-3">
                <FilePlus size={24} className="text-orange-400" />
              </div>
              <p className="text-sm font-semibold text-foreground">Drop files here or click to browse</p>
              <p className="text-xs text-muted-foreground mt-1">
                PDF, JPG, PNG, WEBP · up to 20 MB each · <span className="text-orange-500 font-semibold">multiple files supported</span>
              </p>
            </div>
          </div>

          {/* File queue */}
          <AnimatePresence>
            {queue.length > 0 && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-muted-foreground">{queue.length} file{queue.length > 1 ? 's' : ''} queued</p>
                  {queue.some((q) => q.status === 'idle') && (
                    <button onClick={() => setQueue([])}
                      className="text-xs text-red-500 hover:text-red-600 font-semibold transition-colors">
                      Clear all
                    </button>
                  )}
                </div>

                {queue.map((item) => (
                  <motion.div key={item.id}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                      item.status === 'done'  ? 'bg-green-50 border-green-200' :
                      item.status === 'error' ? 'bg-red-50 border-red-200' :
                      item.status === 'uploading' || item.status === 'saving' ? 'bg-orange-50 border-orange-200' :
                      'bg-muted/30 border-border'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shrink-0 shadow-sm">
                      {fileIcon(item.file)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{item.file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {fmtSize(item.file.size)}
                        {item.status === 'uploading' && ' · Uploading…'}
                        {item.status === 'saving'    && ' · Saving…'}
                        {item.status === 'done'      && ' · Submitted ✓'}
                        {item.status === 'error'     && ` · Error: ${item.error}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {fileStatusIcon(item.status)}
                      {(item.status === 'idle' || item.status === 'error') && !submitting && (
                        <button onClick={(e) => { e.stopPropagation(); removeFromQueue(item.id); }}
                          className="w-6 h-6 rounded-full bg-muted hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-colors">
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit button */}
          <motion.button
            onClick={onSubmit}
            disabled={submitting || queue.length === 0 || !anyPending}
            whileTap={{ scale: 0.98 }}
            className={`w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              allDoneOrError && !anyPending
                ? 'bg-green-500 text-white'
                : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:brightness-105 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm'
            }`}
          >
            {submitting
              ? <><Loader2 size={16} className="animate-spin" />Submitting {queue.filter((q) => q.status === 'uploading' || q.status === 'saving').length > 0 ? `file…` : '…'}</>
              : !anyPending && queue.length > 0
                ? <><CheckCircle2 size={16} />All files submitted!</>
                : <><Upload size={16} />Submit {queue.length > 0 ? `${queue.filter((q) => q.status === 'idle' || q.status === 'error').length} ` : ''}Answer Sheet{queue.filter((q) => q.status === 'idle' || q.status === 'error').length !== 1 ? 's' : ''}</>
            }
          </motion.button>
        </div>
      </div>

      {/* My submissions table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="font-bold text-foreground text-sm">My Submissions</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Track the evaluation status of your uploaded sheets</p>
          </div>
          <button onClick={loadSubmissions} className="p-2 hover:bg-muted rounded-lg transition-colors" title="Refresh">
            <RefreshCw size={14} className={`text-muted-foreground ${loadingSubs ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Table header */}
        <div className="px-6 py-3 bg-muted/40 border-b border-border grid grid-cols-6 gap-3">
          {['Subject', 'Grade', 'File', 'Submitted', 'Status', ''].map((h) => (
            <span key={h} className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</span>
          ))}
        </div>

        {loadingSubs ? (
          <div className="px-6 py-12 text-center">
            <Loader2 size={24} className="animate-spin text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Loading submissions…</p>
          </div>
        ) : submissions.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Upload size={28} className="text-muted-foreground/25 mx-auto mb-2" />
            <p className="text-sm font-semibold text-muted-foreground">No submissions yet</p>
            <p className="text-xs text-muted-foreground mt-1">Upload your first answer sheet above.</p>
          </div>
        ) : (
          submissions.map((s) => (
            <div key={s.id}>
              <div className="px-6 py-4 grid grid-cols-6 gap-3 items-center border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                <span className="text-sm font-semibold text-foreground">{s.subject}</span>
                <span className="text-sm text-muted-foreground">{s.grade}</span>
                <span className="text-xs text-muted-foreground truncate max-w-[120px]" title={s.fileName}>{s.fileName}</span>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock size={11} />
                  {new Date(s.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
                <div>{statusBadge(s.status)}</div>

                <div className="flex justify-end">
                  {canDelete(s) ? (
                    confirmId === s.id ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleDelete(s.id)}
                          disabled={deletingId === s.id}
                          className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-60 flex items-center gap-1"
                        >
                          {deletingId === s.id ? <Loader2 size={10} className="animate-spin" /> : null}
                          Confirm
                        </button>
                        <button
                          onClick={() => setConfirmId(null)}
                          className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmId(s.id)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Delete submission"
                      >
                        <Trash2 size={14} />
                      </button>
                    )
                  ) : (
                    <span className="text-[10px] text-muted-foreground/40 italic">
                      {s.status === 'evaluated' ? 'Evaluated' : 'In review'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}

        {submissions.some((s) => s.status !== 'pending') && (
          <div className="px-6 py-3 bg-amber-50/50 border-t border-amber-100 flex items-center gap-2">
            <AlertTriangle size={12} className="text-amber-500 shrink-0" />
            <p className="text-[10px] text-amber-700">Only <strong>pending</strong> submissions can be deleted. Submissions under review or evaluated are locked.</p>
          </div>
        )}
      </div>
    </div>
  );
}
