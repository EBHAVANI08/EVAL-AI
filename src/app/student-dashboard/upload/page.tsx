'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, FileText, CheckCircle2, Loader2, X, Clock,
  BookOpen, GraduationCap, RefreshCw, AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Geography', 'Computer Science', 'Economics', 'Other'];
const GRADES   = ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];

type UploadStatus = 'idle' | 'uploading' | 'saving' | 'done' | 'error';

type Submission = {
  id: string; subject: string; grade: string; fileName: string;
  status: string; createdAt: string;
};

export default function StudentUploadPage() {
  const { data: session } = useSession();
  const [subject, setSubject] = useState('');
  const [grade, setGrade]     = useState('');
  const [file, setFile]       = useState<File | null>(null);
  const [drag, setDrag]       = useState(false);
  const [status, setStatus]   = useState<UploadStatus>('idle');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loadingSubs, setLoadingSubs] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  /* Load past submissions */
  useEffect(() => {
    fetch('/api/student-uploads')
      .then((r) => r.json())
      .then((d) => { if (d.uploads) setSubmissions(d.uploads); })
      .catch(() => {})
      .finally(() => setLoadingSubs(false));
  }, []);

  const handleFile = (f: File) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(f.type)) { toast.error('Only PDF, JPG, PNG or WEBP files are allowed.'); return; }
    if (f.size > 20 * 1024 * 1024) { toast.error('File must be under 20 MB.'); return; }
    setFile(f);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDrag(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const onSubmit = async () => {
    if (!file || !subject || !grade) {
      toast.error('Please select subject, grade and a file before uploading.');
      return;
    }

    try {
      /* 1. Upload file to Gemini File API */
      setStatus('uploading');
      const fd = new FormData();
      fd.append('file', file);
      const uploadRes = await fetch('/api/ai/gemini-upload', { method: 'POST', body: fd });
      if (!uploadRes.ok) throw new Error('File upload to storage failed');
      const { fileUri, mimeType } = await uploadRes.json();

      /* 2. Save submission record to MongoDB */
      setStatus('saving');
      const saveRes = await fetch('/api/student-uploads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, grade, fileUri, mimeType, fileName: file.name }),
      });
      if (!saveRes.ok) throw new Error('Failed to save submission');
      const saved = await saveRes.json();

      setSubmissions((prev) => [saved, ...prev]);
      setStatus('done');
      toast.success('Answer sheet submitted successfully! Your teacher will evaluate it soon.');
      setFile(null);
      setSubject('');
      setGrade('');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err: any) {
      setStatus('error');
      toast.error(err.message ?? 'Upload failed — please try again.');
      setTimeout(() => setStatus('idle'), 3000);
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
                Upload a PDF or image — your teacher will receive it instantly for evaluation.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Subject + Grade row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <BookOpen size={12} /> Subject
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="input-field text-sm"
              >
                <option value="">Select subject…</option>
                {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <GraduationCap size={12} /> Grade / Class
              </label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="input-field text-sm"
              >
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
            onClick={() => !file && inputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-2xl transition-all duration-200 cursor-pointer ${
              drag ? 'border-orange-400 bg-orange-50/60' : file ? 'border-green-400 bg-green-50/40' : 'border-border hover:border-orange-300 hover:bg-orange-50/30'
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />

            <AnimatePresence mode="wait">
              {file ? (
                <motion.div
                  key="file"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-4 px-6 py-5"
                >
                  <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                    <FileText size={22} className="text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                    className="w-8 h-8 rounded-full bg-muted hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-colors"
                  >
                    <X size={14} />
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-10 px-6 text-center"
                >
                  <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center mb-3">
                    <Upload size={24} className="text-orange-400" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">Drop your answer sheet here</p>
                  <p className="text-xs text-muted-foreground mt-1">or <span className="text-orange-500 font-semibold">click to browse</span> — PDF, JPG, PNG up to 20 MB</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Submit button */}
          <motion.button
            onClick={onSubmit}
            disabled={status === 'uploading' || status === 'saving' || status === 'done'}
            whileTap={{ scale: 0.98 }}
            className={`w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              status === 'done'
                ? 'bg-green-500 text-white'
                : status === 'error'
                ? 'bg-red-500 text-white'
                : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:brightness-105 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm'
            }`}
          >
            {status === 'uploading' && <><Loader2 size={16} className="animate-spin" />Uploading file…</>}
            {status === 'saving'    && <><Loader2 size={16} className="animate-spin" />Saving submission…</>}
            {status === 'done'      && <><CheckCircle2 size={16} />Submitted successfully!</>}
            {status === 'error'     && <><AlertCircle size={16} />Upload failed — try again</>}
            {status === 'idle'      && <><Upload size={16} />Submit Answer Sheet</>}
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
          <button
            onClick={() => {
              setLoadingSubs(true);
              fetch('/api/student-uploads').then((r) => r.json()).then((d) => { if (d.uploads) setSubmissions(d.uploads); }).finally(() => setLoadingSubs(false));
            }}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw size={14} className="text-muted-foreground" />
          </button>
        </div>

        {/* Header row */}
        <div className="px-6 py-3 bg-muted/40 border-b border-border grid grid-cols-5 gap-4">
          {['Subject', 'Grade', 'File', 'Submitted', 'Status'].map((h) => (
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
            <div key={s.id} className="px-6 py-4 grid grid-cols-5 gap-4 items-center border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
              <span className="text-sm font-semibold text-foreground">{s.subject}</span>
              <span className="text-sm text-muted-foreground">{s.grade}</span>
              <span className="text-xs text-muted-foreground truncate max-w-[140px]">{s.fileName}</span>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock size={11} />
                {new Date(s.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
              {statusBadge(s.status)}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
