'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import {
  Download, FileDown, Loader2, RefreshCw, BookOpen,
  CheckCircle2, Clock, AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { downloadEvalReport } from '@/lib/generateEvalReport';

type EvalSummary = {
  id: string; subject: string; class: string;
  obtained: number | null; maxMarks: number;
  status: string; submittedAt: string;
};

function gradeFrom(pct: number) {
  if (pct >= 90) return { grade: 'A+', color: 'text-green-600' };
  if (pct >= 80) return { grade: 'A',  color: 'text-green-600' };
  if (pct >= 70) return { grade: 'B+', color: 'text-blue-600' };
  if (pct >= 60) return { grade: 'B',  color: 'text-blue-600' };
  if (pct >= 50) return { grade: 'C',  color: 'text-amber-600' };
  return { grade: 'F', color: 'text-red-600' };
}

export default function DownloadsPage() {
  const { data: session } = useSession();
  const [evals, setEvals]         = useState<EvalSummary[]>([]);
  const [loading, setLoading]     = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);

  const rollNo = (session?.user as any)?.rollNo;
  const email  = session?.user?.email;

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ limit: '50' });
    if (rollNo) params.set('rollNo', rollNo);
    if (email)  params.set('email', email);
    fetch(`/api/evaluations?${params}`)
      .then((r) => r.json())
      .then((d) => setEvals(d.evaluations ?? []))
      .catch(() => toast.error('Failed to load downloads'))
      .finally(() => setLoading(false));
  }, [rollNo, email]);

  useEffect(() => { load(); }, [load]);

  const handleDownload = async (ev: EvalSummary) => {
    setDownloading(ev.id);
    try {
      const res  = await fetch(`/api/evaluations/${ev.id}`);
      const data = await res.json();
      downloadEvalReport(data, data.scannedImages);
      toast.success('Report opened — use "Save as PDF" or Print to download.');
    } catch {
      toast.error('Failed to load report. Try again.');
    } finally {
      setDownloading(null);
    }
  };

  const finalized = evals.filter((e) => e.status === 'finalized');
  const pending   = evals.filter((e) => e.status !== 'finalized');

  return (
    <div className="px-8 py-6 max-w-screen-xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-[#0A0F1E]">Downloads</h2>
          <p className="text-sm text-[#64748B] mt-0.5">Download your corrected answer sheets with full evaluation report</p>
        </div>
        <button onClick={load} className="p-2.5 rounded-xl border border-border hover:bg-muted transition-colors" title="Refresh">
          <RefreshCw size={15} className={`text-muted-foreground ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Evaluated — downloadable */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-border flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center">
            <FileDown size={18} className="text-green-600" />
          </div>
          <div>
            <h3 className="font-bold text-foreground text-sm">Evaluated Papers</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Corrected answer sheet + full analysis report</p>
          </div>
        </div>

        {/* Table header */}
        <div className="px-6 py-3 bg-muted/40 border-b border-border grid grid-cols-6 gap-3">
          {['Subject', 'Class', 'Date', 'Score', 'Grade', 'Download'].map((h) => (
            <span key={h} className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{h}</span>
          ))}
        </div>

        {loading ? (
          <div className="px-6 py-16 text-center">
            <Loader2 size={24} className="animate-spin text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Loading…</p>
          </div>
        ) : finalized.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <BookOpen size={28} className="text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-sm font-semibold text-muted-foreground">No evaluated papers yet</p>
            <p className="text-xs text-muted-foreground mt-1">Reports will appear here once your teacher finalises the grading.</p>
          </div>
        ) : (
          finalized.map((ev, i) => {
            const pct = ev.maxMarks > 0 && ev.obtained != null ? Math.round((ev.obtained / ev.maxMarks) * 100) : null;
            const { grade, color } = pct != null ? gradeFrom(pct) : { grade: '—', color: 'text-muted-foreground' };
            return (
              <motion.div key={ev.id}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="px-6 py-4 grid grid-cols-6 gap-3 items-center border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
              >
                <span className="text-sm font-semibold text-foreground">{ev.subject}</span>
                <span className="text-sm text-muted-foreground">{ev.class || '—'}</span>
                <span className="text-xs text-muted-foreground">{ev.submittedAt}</span>
                <span className="text-sm font-bold text-foreground">
                  {ev.obtained != null ? `${ev.obtained}/${ev.maxMarks}` : '—'}
                </span>
                <span className={`text-sm font-black ${color}`}>{grade} {pct != null ? `(${pct}%)` : ''}</span>
                <motion.button
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => handleDownload(ev)}
                  disabled={downloading === ev.id}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold shadow-sm hover:brightness-105 disabled:opacity-60 transition-all"
                >
                  {downloading === ev.id
                    ? <><Loader2 size={13} className="animate-spin" /> Loading…</>
                    : <><Download size={13} /> Download Report</>}
                </motion.button>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Pending / under review */}
      {pending.length > 0 && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-border flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
              <Clock size={18} className="text-amber-500" />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-sm">Pending / Under Review</h3>
              <p className="text-xs text-muted-foreground mt-0.5">These will be downloadable once your teacher evaluates them</p>
            </div>
          </div>
          {pending.map((ev) => (
            <div key={ev.id} className="px-6 py-4 flex items-center justify-between border-b border-border last:border-0">
              <div>
                <p className="text-sm font-semibold text-foreground">{ev.subject}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{ev.submittedAt}</p>
              </div>
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                ev.status === 'under_review' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {ev.status === 'under_review' ? 'Under Review' : 'Pending'}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Info note */}
      <div className="flex items-start gap-3 px-5 py-4 bg-blue-50/60 border border-blue-100 rounded-2xl">
        <AlertCircle size={16} className="text-blue-500 shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700">
          The downloaded report includes your <strong>corrected answer sheet images</strong> and a full <strong>question-by-question analysis</strong> with marks, teacher feedback, strengths and areas to improve. Save it as PDF using the print dialog.
        </p>
      </div>
    </div>
  );
}
