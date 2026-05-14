'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye, Search, ClipboardList, Clock, CheckCircle2, AlertCircle,
  Loader2, X, BookOpen, Star, TrendingUp, Award, ChevronDown, ChevronUp,
  RefreshCw, Download, MessageSquare, Send, CheckCheck,
} from 'lucide-react';
import { toast } from 'sonner';

type Evaluation = {
  id: string;
  subject: string;
  class: string;
  obtained: number | null;
  maxMarks: number;
  aiConfidence: number | null;
  status: string;
  submittedAt: string;
};

type EvalDetail = {
  id: string;
  status: string;
  studentInfo: Record<string, any>;
  paperInfo: Record<string, any>;
  questions: any[];
  trainingData: Record<string, any>;
  createdAt: string;
};

const statusBadge = (s: string) => {
  const map: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
    finalized: { label: 'Evaluated',   cls: 'bg-green-50 text-green-700 border border-green-200',   icon: <CheckCircle2 size={10} /> },
    review:    { label: 'Under Review',cls: 'bg-amber-50 text-amber-700 border border-amber-200',   icon: <Clock size={10} /> },
    draft:     { label: 'Draft',       cls: 'bg-muted text-muted-foreground border border-border',  icon: <AlertCircle size={10} /> },
  };
  const cfg = map[s] ?? map.draft;
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${cfg.cls}`}>
      {cfg.icon} {cfg.label}
    </span>
  );
};

const gradeFrom = (pct: number) => {
  if (pct >= 90) return { grade: 'A+', cls: 'text-green-600' };
  if (pct >= 80) return { grade: 'A',  cls: 'text-green-500' };
  if (pct >= 70) return { grade: 'B+', cls: 'text-blue-600' };
  if (pct >= 60) return { grade: 'B',  cls: 'text-blue-500' };
  if (pct >= 50) return { grade: 'C',  cls: 'text-amber-600' };
  return { grade: 'F', cls: 'text-red-500' };
};

export default function ResultsPage() {
  const { data: session } = useSession();
  const [evals, setEvals]       = useState<Evaluation[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [detail, setDetail]         = useState<EvalDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [expandedQ, setExpandedQ]   = useState<string | null>(null);
  const [msgOpen, setMsgOpen]       = useState(false);
  const [msgText, setMsgText]       = useState('');
  const [msgSending, setMsgSending] = useState(false);
  const [msgSent, setMsgSent]       = useState(false);

  const rollNo = (session?.user as any)?.rollNo;

  const load = () => {
    setLoading(true);
    const url = rollNo
      ? `/api/evaluations?rollNo=${encodeURIComponent(rollNo)}&limit=50`
      : '/api/evaluations?limit=50';
    fetch(url)
      .then(r => r.json())
      .then(d => setEvals(d.evaluations ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [rollNo]);

  const openDetail = async (id: string) => {
    setDetailLoading(true);
    setDetail(null);
    try {
      const res = await fetch(`/api/evaluations/${id}`);
      const data = await res.json();
      setDetail(data);
    } catch { /* ignore */ }
    finally { setDetailLoading(false); }
  };

  const filtered = evals.filter(e =>
    !search || e.subject.toLowerCase().includes(search.toLowerCase())
  );

  const downloadReport = () => {
    if (!detail) return;
    const obt = detail.trainingData?.totalObtained ?? 0;
    const max = detail.paperInfo?.totalMarks ?? detail.trainingData?.totalMax ?? 0;
    const pct = max > 0 ? Math.round((obt / max) * 100) : 0;
    const { grade } = gradeFrom(pct);
    const lines: string[] = [
      '='.repeat(60),
      '           EVALUATION REPORT — EVAL AI',
      '='.repeat(60),
      '',
      `Student  : ${detail.studentInfo?.name ?? '—'}`,
      `Roll No  : ${detail.studentInfo?.rollNo ?? '—'}`,
      `Subject  : ${detail.studentInfo?.subject ?? detail.paperInfo?.subject ?? '—'}`,
      `Class    : ${detail.studentInfo?.class ?? '—'}`,
      `Date     : ${detail.createdAt ? new Date(detail.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}`,
      `Status   : ${detail.status}`,
      '',
      '-'.repeat(60),
      `Score    : ${obt} / ${max}   (${pct}%)    Grade: ${grade}`,
      `AI Conf. : ${detail.trainingData?.avgAiConfidence ?? '—'}%`,
      '-'.repeat(60),
      '',
      'QUESTION BREAKDOWN',
      '',
      ...(detail.questions ?? []).flatMap((q: any, i: number) => {
        const score = q.teacherScore ?? q.aiScore ?? 0;
        return [
          `Q${i + 1}. ${q.questionText ?? '—'}`,
          `     Score : ${score} / ${q.maxMarks}   (AI: ${q.aiScore})${q.teacherScore != null && q.teacherScore !== q.aiScore ? `  Teacher Override: ${q.teacherScore}` : ''}`,
          q.aiReasoning ? `     Feedback : ${q.aiReasoning}` : '',
          '',
        ];
      }),
      '='.repeat(60),
      '  Generated by Eval AI  |  evalai.school',
      '='.repeat(60),
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `EvalReport_${detail.studentInfo?.rollNo ?? 'student'}_${detail.studentInfo?.subject ?? 'report'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Report downloaded!');
  };

  const sendMessage = async () => {
    if (!detail || !msgText.trim()) return;
    setMsgSending(true);
    try {
      const res = await fetch('/api/evaluations/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evaluationId: detail.id,
          subject: detail.studentInfo?.subject ?? detail.paperInfo?.subject ?? 'General',
          message: msgText.trim(),
        }),
      });
      if (!res.ok) throw new Error('Failed to send');
      setMsgSent(true);
      setMsgText('');
      toast.success('Your message was sent to the teacher!');
      setTimeout(() => { setMsgSent(false); setMsgOpen(false); }, 3000);
    } catch {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setMsgSending(false);
    }
  };

  return (
    <div className="px-8 py-6 max-w-screen-xl mx-auto">
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="font-bold text-foreground">My Evaluated Results</h3>
            <p className="text-xs text-muted-foreground mt-0.5">All evaluated answer sheets will appear here</p>
          </div>
          <div className="flex items-center gap-2">
            <AnimatePresence>
              {searchOpen && (
                <motion.input
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 180, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search subject…"
                  className="text-sm border border-border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background"
                />
              )}
            </AnimatePresence>
            <button
              onClick={() => { setSearchOpen(v => !v); setSearch(''); }}
              className="flex items-center gap-1.5 text-xs text-muted-foreground border border-border px-3 py-1.5 rounded-lg hover:bg-muted transition-colors"
            >
              <Search size={12} /> Search
            </button>
            <button
              onClick={load}
              className="p-1.5 text-muted-foreground border border-border rounded-lg hover:bg-muted transition-colors"
              title="Refresh"
            >
              <RefreshCw size={13} />
            </button>
          </div>
        </div>

        {/* Table header */}
        <div className="px-6 py-3 bg-muted/40 border-b border-border grid grid-cols-6 gap-4">
          {['Subject', 'Exam', 'Date', 'Score', 'Status', 'Action'].map(h => (
            <span key={h} className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</span>
          ))}
        </div>

        {/* Rows */}
        {loading ? (
          <div className="px-6 py-20 text-center">
            <Loader2 size={28} className="animate-spin text-primary/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Loading results…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <ClipboardList size={32} className="text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground font-semibold">No evaluated papers yet</p>
            <p className="text-xs text-muted-foreground mt-1">Your teacher will share results here after evaluation</p>
          </div>
        ) : (
          filtered.map(ev => {
            const pct = ev.maxMarks > 0 && ev.obtained != null ? Math.round((ev.obtained / ev.maxMarks) * 100) : null;
            const { grade, cls } = pct != null ? gradeFrom(pct) : { grade: '—', cls: 'text-muted-foreground' };
            return (
              <div key={ev.id} className="px-6 py-4 grid grid-cols-6 gap-4 items-center border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                <span className="text-sm font-semibold text-foreground">{ev.subject}</span>
                <span className="text-sm text-muted-foreground">{ev.class || 'Term Evaluation'}</span>
                <span className="text-sm text-muted-foreground">{ev.submittedAt}</span>
                <span className="text-sm font-bold text-foreground">
                  {ev.obtained != null ? `${ev.obtained}/${ev.maxMarks}` : '—/—'}
                  {pct != null && <span className="text-xs text-muted-foreground ml-1">({pct}%)</span>}
                </span>
                {statusBadge(ev.status)}
                <button
                  onClick={() => openDetail(ev.id)}
                  className="flex items-center gap-1.5 text-sm text-primary hover:underline font-semibold"
                >
                  <Eye size={14} /> View Report
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Detail drawer */}
      <AnimatePresence>
        {(detail || detailLoading) && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
              onClick={() => { setDetail(null); setExpandedQ(null); }}
            />

            {/* Slide-over panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="fixed right-0 top-0 bottom-0 z-[51] w-full max-w-2xl bg-card shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Panel header */}
              <div className="px-6 py-4 border-b border-border flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <BookOpen size={20} className="text-primary" />
                  </div>
                  <div>
                    <h2 className="font-bold text-foreground">Evaluation Report</h2>
                    {detail && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {detail.studentInfo?.subject ?? detail.paperInfo?.subject ?? 'Subject'} · {detail.studentInfo?.class ?? '—'}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {detail && (
                    <>
                      <button
                        onClick={downloadReport}
                        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors text-muted-foreground"
                        title="Download report"
                      >
                        <Download size={13} /> Download
                      </button>
                      <button
                        onClick={() => { setMsgOpen(v => !v); setMsgSent(false); }}
                        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors text-primary"
                        title="Ask teacher"
                      >
                        <MessageSquare size={13} /> Ask Teacher
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => { setDetail(null); setExpandedQ(null); setMsgOpen(false); }}
                    className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
                  >
                    <X size={16} className="text-muted-foreground" />
                  </button>
                </div>
              </div>

              {detailLoading ? (
                <div className="flex-1 flex items-center justify-center">
                  <Loader2 size={32} className="animate-spin text-primary/40" />
                </div>
              ) : detail ? (
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                  {/* Score summary cards */}
                  {(() => {
                    const obt = detail.trainingData?.totalObtained ?? 0;
                    const max = detail.paperInfo?.totalMarks ?? detail.trainingData?.totalMax ?? 0;
                    const pct = max > 0 ? Math.round((obt / max) * 100) : 0;
                    const { grade, cls } = gradeFrom(pct);
                    return (
                      <div className="grid grid-cols-4 gap-3">
                        <div className="bg-primary/5 border border-primary/15 rounded-2xl p-4 text-center">
                          <p className="text-2xl font-bold text-primary">{obt}</p>
                          <p className="text-xs text-muted-foreground mt-1">Score</p>
                        </div>
                        <div className="bg-muted/50 border border-border rounded-2xl p-4 text-center">
                          <p className="text-2xl font-bold text-foreground">{max}</p>
                          <p className="text-xs text-muted-foreground mt-1">Total</p>
                        </div>
                        <div className="bg-green-50 border border-green-100 rounded-2xl p-4 text-center">
                          <p className={`text-2xl font-bold ${cls}`}>{grade}</p>
                          <p className="text-xs text-muted-foreground mt-1">Grade</p>
                        </div>
                        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-center">
                          <p className="text-2xl font-bold text-amber-600">{pct}%</p>
                          <p className="text-xs text-muted-foreground mt-1">Percentage</p>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Info row */}
                  <div className="bg-muted/40 rounded-xl p-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Student</p>
                      <p className="font-semibold text-foreground mt-0.5">{detail.studentInfo?.name ?? '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Roll No</p>
                      <p className="font-semibold text-foreground mt-0.5">{detail.studentInfo?.rollNo ?? '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Subject</p>
                      <p className="font-semibold text-foreground mt-0.5">{detail.studentInfo?.subject ?? detail.paperInfo?.subject ?? '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Evaluated On</p>
                      <p className="font-semibold text-foreground mt-0.5">
                        {detail.createdAt ? new Date(detail.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Status</p>
                      <div className="mt-0.5">{statusBadge(detail.status)}</div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">AI Confidence</p>
                      <p className="font-semibold text-foreground mt-0.5">{detail.trainingData?.avgAiConfidence ?? '—'}%</p>
                    </div>
                  </div>

                  {/* Per-question breakdown */}
                  {detail.questions?.length > 0 && (
                    <div>
                      <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                        <TrendingUp size={15} className="text-primary" /> Question Breakdown
                      </h3>
                      <div className="space-y-2">
                        {detail.questions.map((q: any, i: number) => {
                          const score = q.teacherScore ?? q.aiScore ?? 0;
                          const pct = q.maxMarks > 0 ? Math.round((score / q.maxMarks) * 100) : 0;
                          const qKey = q.id ?? String(i);
                          const expanded = expandedQ === qKey;
                          return (
                            <div key={qKey} className="border border-border rounded-xl overflow-hidden">
                              <button
                                onClick={() => setExpandedQ(expanded ? null : qKey)}
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors text-left"
                              >
                                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-xs font-bold text-primary">
                                  {i + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-foreground truncate">
                                    {q.questionText || `Question ${i + 1}`}
                                  </p>
                                </div>
                                <div className="text-right shrink-0">
                                  <p className="text-sm font-bold text-primary">{score}/{q.maxMarks}</p>
                                  <p className="text-[10px] text-muted-foreground">{pct}%</p>
                                </div>
                                {expanded ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
                              </button>
                              <AnimatePresence>
                                {expanded && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="px-4 pb-4 pt-1 space-y-3 border-t border-border bg-muted/20">
                                      {q.ocrText && (
                                        <div>
                                          <p className="text-xs font-semibold text-muted-foreground mb-1">Student Answer</p>
                                          <p className="text-sm text-foreground bg-card border border-border rounded-lg p-3 leading-relaxed">{q.ocrText}</p>
                                        </div>
                                      )}
                                      {q.aiAnswer && (
                                        <div>
                                          <p className="text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1"><Star size={10} /> Model Answer</p>
                                          <p className="text-sm text-foreground bg-primary/5 border border-primary/15 rounded-lg p-3 leading-relaxed">{q.aiAnswer}</p>
                                        </div>
                                      )}
                                      {q.aiReasoning && (
                                        <div>
                                          <p className="text-xs font-semibold text-muted-foreground mb-1">AI Feedback</p>
                                          <p className="text-sm text-muted-foreground italic">{q.aiReasoning}</p>
                                        </div>
                                      )}
                                      <div className="flex items-center gap-4 text-xs">
                                        <span className="text-muted-foreground">AI Score: <strong className="text-foreground">{q.aiScore}</strong></span>
                                        {q.teacherScore != null && q.teacherScore !== q.aiScore && (
                                          <span className="text-amber-600">Teacher Override: <strong>{q.teacherScore}</strong></span>
                                        )}
                                        <span className="text-muted-foreground">Confidence: <strong className="text-foreground">{q.aiConfidence}%</strong></span>
                                      </div>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {/* Message teacher section */}
                  <AnimatePresence>
                    {msgOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.22 }}
                        className="overflow-hidden"
                      >
                        <div className="border border-primary/20 rounded-2xl bg-primary/5 p-5">
                          <div className="flex items-center gap-2 mb-3">
                            <MessageSquare size={16} className="text-primary" />
                            <h3 className="font-bold text-foreground text-sm">Ask the Teacher</h3>
                          </div>
                          <p className="text-xs text-muted-foreground mb-3">
                            Have a doubt about this evaluation? Type your question and we'll notify your teacher.
                          </p>
                          {msgSent ? (
                            <div className="flex items-center gap-2 justify-center py-6 text-green-600">
                              <CheckCheck size={20} />
                              <span className="text-sm font-semibold">Message sent to teacher!</span>
                            </div>
                          ) : (
                            <>
                              <textarea
                                value={msgText}
                                onChange={e => setMsgText(e.target.value)}
                                placeholder="e.g. I think question 6 should have partial marks because…"
                                rows={4}
                                className="w-full text-sm border border-border rounded-xl px-4 py-3 bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                              />
                              <div className="flex items-center justify-between mt-3">
                                <span className="text-xs text-muted-foreground">{msgText.length}/500 chars</span>
                                <button
                                  onClick={sendMessage}
                                  disabled={msgSending || !msgText.trim() || msgText.length > 500}
                                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {msgSending
                                    ? <><Loader2 size={14} className="animate-spin" /> Sending…</>
                                    : <><Send size={14} /> Send Message</>
                                  }
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : null}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
