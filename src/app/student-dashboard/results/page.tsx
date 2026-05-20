'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, ClipboardList, Clock, CheckCircle2, AlertCircle, XCircle,
  Loader2, BookOpen, TrendingUp, Award, ChevronDown, ChevronUp,
  RefreshCw, Download, MessageSquare, Send, CheckCheck, ArrowLeft,
  Lightbulb, Star, ChevronRight, Zap, BarChart2, LineChart as LineIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import BehaviorAnalysisPanel from '@/app/answer-sheet-evaluator/components/BehaviorAnalysisPanel';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, ReferenceLine, Legend,
} from 'recharts';

/* ── Types ─────────────────────────────────────────────── */
type Evaluation = {
  id: string; subject: string; class: string;
  obtained: number | null; maxMarks: number;
  aiConfidence: number | null; status: string; submittedAt: string;
};
type EvalDetail = {
  id: string; status: string;
  studentInfo: Record<string, any>;
  paperInfo: Record<string, any>;
  questions: any[];
  trainingData: Record<string, any>;
  behaviorAnalysis?: any;
  createdAt: string;
};

/* ── Helpers ───────────────────────────────────────────── */
const gradeFrom = (pct: number) => {
  if (pct >= 90) return { grade: 'A+', color: '#059669' };
  if (pct >= 80) return { grade: 'A',  color: '#059669' };
  if (pct >= 70) return { grade: 'B+', color: '#1A6BFF' };
  if (pct >= 60) return { grade: 'B',  color: '#1A6BFF' };
  if (pct >= 50) return { grade: 'C',  color: '#D97706' };
  return { grade: 'F', color: '#DC2626' };
};

const STOP_WORDS = new Set([
  'the','a','an','if','is','are','what','find','which','of','and','in','for','to','that',
  'then','given','let','be','where','such','show','prove','when','on','with','by','from',
  'it','at','as','or','using','hence','also','can','has','have','its','this','these','those',
  'will','would','should','may','might','do','does','did','not','no','more','than','only',
  'both','each','all','any','between','into','but','so','two','one','three','four','five',
]);

/** Extract a concise technical skill label from a question */
function extractSkill(q: any): string {
  // 1. Try to extract concept from aiReasoning (strip "Correctly/Incorrectly" prefix)
  const reasoning = (q.aiReasoning || '').trim();
  const rClean = reasoning
    .replace(/^(correctly|incorrectly|partially correct[ly]*|student)\s+/i, '')
    .replace(/^(found|identified|applied|wrote|calculated|derived|solved|stated|used|described|answered|named|drew|explained)\s+/i, '')
    .trim();
  if (rClean.length > 4 && rClean.length < 65) {
    const phrase = rClean.split(/[,.\-–]/)[0].trim();
    if (phrase.length > 4 && phrase.length < 55 && !/\bselected\b|\boption\b/i.test(phrase)) {
      return phrase.charAt(0).toUpperCase() + phrase.slice(1);
    }
  }
  // 2. Smart keyword extraction from question text
  const words = (q.questionText || '')
    .split(/\s+/)
    .map((w: string) => w.replace(/[^a-zA-Z]/g, ''))
    .filter((w: string) => w.length > 3 && !STOP_WORDS.has(w.toLowerCase()));
  if (words.length > 0) return words.slice(0, 3).join(' ');
  return `Q${q.qNo ?? '?'}`;
}

const getParentQNo = (qNo: string) => qNo.replace(/[\s]*[\[(].*/g, '').trim();

/* ── Score ring ────────────────────────────────────────── */
function ScoreRing({ pct }: { pct: number }) {
  const r = 68; const circ = 2 * Math.PI * r;
  const off = circ * (1 - pct / 100);
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={170} height={170} style={{ transform: 'rotate(-90deg)' }}>
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7C3AED" /><stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
        </defs>
        <circle cx={85} cy={85} r={r} fill="none" stroke="#EEF4FF" strokeWidth={14} />
        <circle cx={85} cy={85} r={r} fill="none" stroke="url(#ringGrad)" strokeWidth={14}
          strokeDasharray={circ} strokeDashoffset={off} strokeLinecap="round" />
      </svg>
      <div className="absolute text-center">
        <p className="text-4xl font-black text-[#7C3AED]">{pct}%</p>
        <p className="text-[11px] text-[#94A3B8] font-medium mt-0.5">Overall Score</p>
      </div>
    </div>
  );
}

/* ── Status badge ──────────────────────────────────────── */
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
    finalized: { label: 'Completed',    cls: 'bg-green-50 text-green-700 border-green-200',  icon: <CheckCircle2 size={10} /> },
    review:    { label: 'Under Review', cls: 'bg-amber-50 text-amber-700 border-amber-200',  icon: <Clock size={10} /> },
    draft:     { label: 'Draft',        cls: 'bg-slate-50 text-slate-500 border-slate-200',  icon: <AlertCircle size={10} /> },
  };
  const cfg = map[status] ?? map.draft;
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${cfg.cls}`}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

/* ── QIcon ─────────────────────────────────────────────── */
function QIcon({ score, max }: { score: number; max: number }) {
  const pct = max > 0 ? (score / max) * 100 : 0;
  if (pct >= 80) return <CheckCircle2 size={16} className="text-green-500 shrink-0" />;
  if (pct >= 50) return <AlertCircle  size={16} className="text-amber-500 shrink-0" />;
  return              <XCircle       size={16} className="text-red-500 shrink-0" />;
}

/* ── Custom Tooltip ────────────────────────────────────── */
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[#E8EFFE] rounded-xl px-3 py-2 shadow-lg text-xs">
      <p className="font-bold text-[#0A0F1E] mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">
          {p.name}: {p.value}{p.unit ?? ''}
        </p>
      ))}
    </div>
  );
}

/* ── Performance Charts ────────────────────────────────── */
function PerformanceCharts({ qs, evals }: { qs: any[]; evals: Evaluation[] }) {
  const [tab, setTab] = useState<'exam' | 'subjects'>('exam');

  // Section breakdown
  const sections = Array.from(new Set(qs.map((q) => q.section))).sort();
  const sectionData = sections.map((sec) => {
    const secQs     = qs.filter((q) => q.section === sec);
    const obtained  = secQs.reduce((s, q) => s + (q.teacherScore ?? q.aiScore ?? 0), 0);
    const max       = secQs.reduce((s, q) => s + q.maxMarks, 0);
    return { name: `Sec ${sec}`, Obtained: obtained, Max: max, Pct: max > 0 ? Math.round((obtained / max) * 100) : 0 };
  });

  // Q-by-Q line data (group sub-questions by parent)
  const parentNos = [...new Set(qs.map((q) => getParentQNo(q.qNo)))];
  const lineData = parentNos.slice(0, 40).map((pNo) => {
    const pQs      = qs.filter((q) => getParentQNo(q.qNo) === pNo);
    const obtained = pQs.reduce((s, q) => s + (q.teacherScore ?? q.aiScore ?? 0), 0);
    const max      = pQs.reduce((s, q) => s + q.maxMarks, 0);
    return { name: `Q${pNo}`, Score: max > 0 ? Math.round((obtained / max) * 100) : 0 };
  });

  // All subjects bar
  const subjectData = evals.map((ev) => ({
    name: ev.subject.length > 10 ? ev.subject.slice(0, 10) + '…' : ev.subject,
    fullName: ev.subject,
    Score: ev.maxMarks > 0 && ev.obtained != null ? Math.round((ev.obtained / ev.maxMarks) * 100) : 0,
    Marks: `${ev.obtained ?? 0}/${ev.maxMarks}`,
  }));

  const PURPLE = '#7C3AED'; const CYAN = '#06B6D4'; const LIGHT = '#EEF4FF';

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
      className="bg-white border border-[#E8EFFE] rounded-2xl p-5 shadow-sm mb-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart2 size={15} className="text-[#7C3AED]" />
          <h3 className="text-sm font-bold text-[#0A0F1E]">Performance Charts</h3>
        </div>
        <div className="flex bg-[#F5F3FF] rounded-lg p-0.5">
          {([{ id: 'exam', label: 'This Exam' }, { id: 'subjects', label: 'All Subjects' }] as const).map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${tab === t.id ? 'bg-white text-[#7C3AED] shadow-sm' : 'text-[#94A3B8] hover:text-[#7C3AED]'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {tab === 'exam' ? (
          <motion.div key="exam" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.18 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Section bar chart */}
            <div>
              <p className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <BarChart2 size={11} /> Section Performance (Obtained vs Max)
              </p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={sectionData} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11, color: '#94A3B8' }} />
                  <Bar dataKey="Max"      fill={LIGHT}   radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Obtained" fill={PURPLE}  radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* Q-by-Q line chart */}
            <div>
              <p className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <LineIcon size={11} /> Question Score % (per question)
              </p>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#94A3B8' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} unit="%" />
                  <Tooltip content={<ChartTooltip />} />
                  <ReferenceLine y={80} stroke="#059669" strokeDasharray="4 4" label={{ value: '80%', position: 'insideTopRight', fill: '#059669', fontSize: 9 }} />
                  <ReferenceLine y={60} stroke="#D97706" strokeDasharray="4 4" label={{ value: '60%', position: 'insideTopRight', fill: '#D97706', fontSize: 9 }} />
                  <Line type="monotone" dataKey="Score" stroke={PURPLE} strokeWidth={2.5} dot={{ fill: PURPLE, r: 3 }} activeDot={{ r: 5, fill: CYAN }} unit="%" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        ) : (
          <motion.div key="subjects" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.18 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Subject bar chart */}
            <div>
              <p className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <BarChart2 size={11} /> Score by Subject (%)
              </p>
              {subjectData.length === 0 ? (
                <div className="h-[200px] flex items-center justify-center text-xs text-[#94A3B8]">No other subjects yet</div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={subjectData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} unit="%" />
                    <Tooltip content={<ChartTooltip />} />
                    <ReferenceLine y={80} stroke="#059669" strokeDasharray="4 4" />
                    <Bar dataKey="Score" fill={PURPLE} radius={[4, 4, 0, 0]} unit="%" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
            {/* Subject line trend */}
            <div>
              <p className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <LineIcon size={11} /> Score Trend — All Evaluations
              </p>
              {subjectData.length < 2 ? (
                <div className="h-[200px] flex flex-col items-center justify-center gap-2 text-xs text-[#94A3B8]">
                  <LineIcon size={22} className="opacity-20" />
                  Complete more evaluations to see your trend
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={subjectData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} unit="%" />
                    <Tooltip content={<ChartTooltip />} />
                    <ReferenceLine y={80} stroke="#059669" strokeDasharray="4 4" />
                    <Line type="monotone" dataKey="Score" stroke={CYAN} strokeWidth={2.5} dot={{ fill: CYAN, r: 4 }} activeDot={{ r: 6 }} unit="%" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ── Main page ─────────────────────────────────────────── */
export default function ResultsPage() {
  const { data: session } = useSession();
  const [evals, setEvals]                 = useState<Evaluation[]>([]);
  const [loading, setLoading]             = useState(true);
  const [search, setSearch]               = useState('');
  const [searchOpen, setSearchOpen]       = useState(false);
  const [detail, setDetail]               = useState<EvalDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [expandedQ, setExpandedQ]         = useState<string | null>(null);
  const [mistakesOnly, setMistakesOnly]   = useState(false);
  const [qPanelRef]                       = useState(() => React.createRef<HTMLDivElement>());
  const [msgOpen, setMsgOpen]             = useState(false);
  const [msgText, setMsgText]             = useState('');
  const [msgSending, setMsgSending]       = useState(false);
  const [msgSent, setMsgSent]             = useState(false);

  const rollNo = (session?.user as any)?.rollNo;
  const email  = session?.user?.email;

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: '50' });
    if (rollNo) params.set('rollNo', rollNo);
    if (email)  params.set('email', email);
    fetch(`/api/evaluations?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => setEvals(d.evaluations ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [rollNo]);

  // Auto-open an evaluation if navigated from dashboard
  useEffect(() => {
    const autoId = sessionStorage.getItem('autoOpenEvalId');
    if (autoId) {
      sessionStorage.removeItem('autoOpenEvalId');
      openDetail(autoId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openDetail = async (id: string) => {
    setDetailLoading(true);
    setDetail(null);
    try {
      const res  = await fetch(`/api/evaluations/${id}`);
      const data = await res.json();
      setDetail(data);
    } catch { /* ignore */ }
    finally { setDetailLoading(false); }
  };

  const filtered = evals.filter((e) =>
    !search || e.subject.toLowerCase().includes(search.toLowerCase())
  );

  const downloadReport = () => {
    if (!detail) return;
    const obt  = detail.trainingData?.totalObtained ?? 0;
    const max  = detail.paperInfo?.totalMarks ?? detail.trainingData?.totalMax ?? 0;
    const pct  = max > 0 ? Math.round((obt / max) * 100) : 0;
    const { grade } = gradeFrom(pct);
    const lines = [
      '='.repeat(60), '           EVALUATION REPORT — GRADE.AI', '='.repeat(60), '',
      `Student  : ${detail.studentInfo?.name ?? '—'}`,
      `Roll No  : ${detail.studentInfo?.rollNo ?? '—'}`,
      `Subject  : ${detail.studentInfo?.subject ?? detail.paperInfo?.subject ?? '—'}`,
      `Score    : ${obt} / ${max}   (${pct}%)    Grade: ${grade}`, '',
      'QUESTION BREAKDOWN', '',
      ...(detail.questions ?? []).flatMap((q: any, i: number) => {
        const score = q.teacherScore ?? q.aiScore ?? 0;
        return [`Q${i + 1}. ${q.questionText ?? '—'}`, `     Score : ${score} / ${q.maxMarks}`, q.aiReasoning ? `     Feedback : ${q.aiReasoning}` : '', ''];
      }),
      '='.repeat(60), '  Generated by Eval AI', '='.repeat(60),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `EvalReport_${detail.studentInfo?.rollNo ?? 'student'}.txt`;
    a.click(); URL.revokeObjectURL(url);
    toast.success('Report downloaded!');
  };

  const sendMessage = async () => {
    if (!detail || !msgText.trim()) return;
    setMsgSending(true);
    try {
      const res = await fetch('/api/evaluations/message', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ evaluationId: detail.id, subject: detail.studentInfo?.subject ?? 'General', message: msgText.trim() }),
      });
      if (res.status === 401) {
        toast.error('Please log in to your student account to message the teacher.');
        return;
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Server error ${res.status}`);
      }
      setMsgSent(true); setMsgText('');
      toast.success('Message sent to teacher!');
      setTimeout(() => { setMsgSent(false); setMsgOpen(false); }, 3000);
    } catch (e: any) { toast.error(e.message || 'Failed to send. Try again.'); }
    finally { setMsgSending(false); }
  };

  /* ── Loading state ──────────────────────────────────── */
  if (detailLoading) {
    return (
      <div className="flex-1 flex items-center justify-center py-32">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
          <Loader2 size={36} className="text-[#7C3AED]/40" />
        </motion.div>
      </div>
    );
  }

  /* ── Detail view ─────────────────────────────────────── */
  if (detail) {
    const obt     = detail.trainingData?.totalObtained ?? 0;
    // Use totalMax from actual evaluated questions (authoritative), not extracted paper's declared total
    // which may be inflated by OR alternatives counted twice
    const max     = detail.trainingData?.totalMax ?? detail.paperInfo?.totalMarks ?? 0;
    const pct     = max > 0 ? Math.round((obt / max) * 100) : 0;
    const { grade, color: gradeColor } = gradeFrom(pct);
    const subject = detail.studentInfo?.subject ?? detail.paperInfo?.subject ?? 'Evaluation';
    const dateStr = detail.createdAt
      ? new Date(detail.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
      : '—';
    const qs = detail.questions ?? [];

    // Derive strengths / weaknesses using technical skill extraction
    const strengths  = qs
      .filter((q: any) => { const s = q.teacherScore ?? q.aiScore ?? 0; return q.maxMarks > 0 && (s / q.maxMarks) >= 0.8; })
      .map(extractSkill)
      .filter((s, i, arr) => arr.indexOf(s) === i) // deduplicate
      .slice(0, 5);
    const weaknesses = qs
      .filter((q: any) => { const s = q.teacherScore ?? q.aiScore ?? 0; return q.maxMarks > 0 && (s / q.maxMarks) < 0.6; })
      .map(extractSkill)
      .filter((s, i, arr) => arr.indexOf(s) === i)
      .slice(0, 4);

    const panelAnim = (delay: number) => ({
      initial: { opacity: 0, y: 16 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.35, delay },
    });

    return (
      <div className="px-8 py-6 max-w-screen-xl mx-auto">

        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
          onClick={() => { setDetail(null); setExpandedQ(null); setMistakesOnly(false); setMsgOpen(false); }}
          className="flex items-center gap-1.5 text-sm text-[#64748B] hover:text-[#7C3AED] font-semibold mb-5 transition-colors"
        >
          <ArrowLeft size={15} /> Back to Results
        </motion.button>

        {/* Title row */}
        <motion.div {...panelAnim(0.05)} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-black text-[#0A0F1E]">{subject}</h1>
              <StatusBadge status={detail.status} />
            </div>
            <p className="text-sm text-[#94A3B8] mt-1">Completed on {dateStr}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { setMsgOpen((v) => !v); setMsgSent(false); }}
              className="flex items-center gap-1.5 h-9 px-4 rounded-xl border border-[#7C3AED]/30 bg-[#7C3AED]/5 text-[#7C3AED] text-sm font-semibold hover:bg-[#7C3AED]/10 transition-colors">
              <MessageSquare size={14} /> Ask Teacher
            </button>
            <button onClick={downloadReport}
              className="flex items-center gap-1.5 h-9 px-4 rounded-xl bg-[#7C3AED] text-white text-sm font-semibold hover:bg-[#6D28D9] transition-colors shadow-sm">
              <Download size={14} /> Download Report
            </button>
          </div>
        </motion.div>

        {/* 3-column panels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">

          {/* Panel 1: Your Score */}
          <motion.div {...panelAnim(0.1)} className="bg-white border border-[#E8EFFE] rounded-2xl p-6 shadow-sm flex flex-col items-center">
            <h3 className="text-sm font-bold text-[#0A0F1E] self-start mb-4">Your Score</h3>
            <ScoreRing pct={pct} />
            <p className="text-sm text-[#64748B] text-center mt-4 leading-relaxed">
              Great job! You scored higher than{' '}
              <strong className="text-[#7C3AED]">{pct}%</strong> of the class.
            </p>
            <div className="w-full grid grid-cols-3 gap-2 mt-5">
              {[
                { label: 'Total Marks', value: `${obt} / ${max}`, color: '#0A0F1E' },
                { label: 'Percentile', value: `${pct}th`, color: '#7C3AED' },
                { label: 'Grade', value: grade, color: gradeColor },
              ].map((s) => (
                <div key={s.label} className="bg-[#F5F3FF] rounded-xl p-3 text-center">
                  <p className="text-xs text-[#94A3B8] mb-1">{s.label}</p>
                  <p className="text-sm font-black" style={{ color: s.color }}>{s.value}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Panel 2: Question Breakdown */}
          <motion.div ref={qPanelRef} {...panelAnim(0.15)} className="bg-white border border-[#E8EFFE] rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E8EFFE] flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#0A0F1E]">Question Breakdown</h3>
              {mistakesOnly && (
                <button onClick={() => setMistakesOnly(false)}
                  className="text-[11px] text-[#7C3AED] font-semibold hover:underline">
                  Show All
                </button>
              )}
            </div>
            {qs.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <ClipboardList size={28} className="text-[#94A3B8]/30 mx-auto mb-2" />
                <p className="text-xs text-[#94A3B8]">No question data available</p>
              </div>
            ) : (
              <div className="overflow-y-auto" style={{ maxHeight: 360 }}>
                <div className="px-5 py-2.5 bg-[#F8F7FF] border-b border-[#E8EFFE] grid grid-cols-12 gap-2">
                  <span className="col-span-6 text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">Question</span>
                  <span className="col-span-3 text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider text-center">Score</span>
                  <span className="col-span-3 text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider text-center">Status</span>
                </div>
                {(mistakesOnly
                  ? qs.filter((q: any) => {
                      const s = q.teacherScore ?? q.aiScore ?? 0;
                      return q.maxMarks > 0 && s < q.maxMarks;
                    })
                  : qs
                ).map((q: any, i: number) => {
                  const score   = q.teacherScore ?? q.aiScore ?? 0;
                  const qKey    = q.id ?? String(i);
                  const expanded = expandedQ === qKey;
                  return (
                    <motion.div key={qKey}
                      initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: Math.min(i * 0.02, 0.4) }}
                      className="border-b border-[#E8EFFE] last:border-0"
                    >
                      <button onClick={() => setExpandedQ(expanded ? null : qKey)}
                        className="w-full grid grid-cols-12 gap-2 px-5 py-3 hover:bg-[#F8F7FF] transition-colors text-left">
                        <div className="col-span-6 flex items-center gap-2 min-w-0">
                          <span className="text-[10px] font-bold text-[#7C3AED] shrink-0">Q{q.qNo ?? i + 1}</span>
                          <span className="text-xs text-[#0A0F1E] truncate">{q.questionText || `Question ${i + 1}`}</span>
                        </div>
                        <span className="col-span-3 text-xs font-bold text-[#0A0F1E] text-center self-center">{score} / {q.maxMarks}</span>
                        <div className="col-span-3 flex items-center justify-center gap-1">
                          <QIcon score={score} max={q.maxMarks} />
                          {expanded ? <ChevronUp size={12} className="text-[#94A3B8]" /> : <ChevronDown size={12} className="text-[#94A3B8]" />}
                        </div>
                      </button>
                      <AnimatePresence>
                        {expanded && (
                          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                            transition={{ duration: 0.18 }} className="overflow-hidden">
                            <div className="px-5 pb-3 pt-1 bg-[#FAF9FF] space-y-2 border-t border-[#E8EFFE]">
                              {q.aiReasoning && (
                                <p className="text-xs text-[#64748B] italic leading-relaxed">{q.aiReasoning}</p>
                              )}
                              <div className="flex items-center gap-3 text-[10px] text-[#94A3B8]">
                                <span>AI: <strong className="text-[#0A0F1E]">{q.aiScore}</strong></span>
                                {q.teacherScore != null && q.teacherScore !== q.aiScore &&
                                  <span className="text-amber-600">Override: <strong>{q.teacherScore}</strong></span>}
                                <span>Confidence: <strong>{q.aiConfidence}%</strong></span>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Panel 3: AI Feedback */}
          <motion.div {...panelAnim(0.2)} className="bg-white border border-[#E8EFFE] rounded-2xl p-5 shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[#7C3AED]">✦</span>
              <h3 className="text-sm font-bold text-[#0A0F1E]">AI Feedback</h3>
            </div>

            <div className="flex items-start gap-3 p-3 bg-[#F5F3FF] rounded-xl">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] flex items-center justify-center shrink-0">
                <Zap size={18} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#0A0F1E] mb-1">
                  Great work, {detail.studentInfo?.name?.split(' ')[0] ?? 'Student'}! 🎉
                </p>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  You have a strong understanding of most topics.
                  {weaknesses.length > 0 && ` Focus on improving: ${weaknesses.slice(0, 2).join(', ')}.`}
                </p>
              </div>
            </div>

            {strengths.length > 0 && (
              <div>
                <p className="text-xs font-bold text-[#0A0F1E] mb-2 flex items-center gap-1.5">
                  <Star size={12} className="text-[#7C3AED]" /> Strengths
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {strengths.map((s, i) => (
                    <motion.span key={i}
                      initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.25 + i * 0.06 }}
                      className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]"
                    >{s}</motion.span>
                  ))}
                </div>
              </div>
            )}

            {weaknesses.length > 0 && (
              <div>
                <p className="text-xs font-bold text-[#0A0F1E] mb-2 flex items-center gap-1.5">
                  <TrendingUp size={12} className="text-[#7C3AED]" /> Areas to Improve
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {weaknesses.map((w, i) => (
                    <motion.span key={i}
                      initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 + i * 0.06 }}
                      className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#FFF7ED] text-[#D97706] border border-[#FED7AA]"
                    >{w}</motion.span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-start gap-2.5 p-3 bg-[#F8F7FF] rounded-xl border border-[#E8EFFE] mt-auto">
              <Lightbulb size={14} className="text-[#7C3AED] shrink-0 mt-0.5" />
              <p className="text-xs text-[#64748B] leading-relaxed">
                <strong className="text-[#0A0F1E]">Tip:</strong> Review the detailed explanations and try practice questions on weak areas.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-[10px] font-semibold text-[#94A3B8]">AI Confidence</p>
                <p className="text-[10px] font-bold text-[#7C3AED]">{detail.trainingData?.avgAiConfidence ?? '—'}%</p>
              </div>
              <div className="h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }} animate={{ width: `${detail.trainingData?.avgAiConfidence ?? 0}%` }}
                  transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
                  className="h-full rounded-full bg-gradient-to-r from-[#7C3AED] to-[#06B6D4]"
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Performance Charts */}
        <PerformanceCharts qs={qs} evals={evals} />

        {/* Learning Behavior Intelligence Report */}
        {detail.behaviorAnalysis && (
          <div className="mb-5">
            <BehaviorAnalysisPanel analysis={detail.behaviorAnalysis} isLoading={false} />
          </div>
        )}

        {/* Ask Teacher */}
        <AnimatePresence>
          {msgOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden mb-5">
              <div className="bg-white border border-[#7C3AED]/20 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare size={15} className="text-[#7C3AED]" />
                  <h3 className="font-bold text-[#0A0F1E] text-sm">Ask the Teacher</h3>
                </div>
                {msgSent ? (
                  <div className="flex items-center gap-2 justify-center py-6 text-green-600">
                    <CheckCheck size={20} /><span className="text-sm font-semibold">Message sent!</span>
                  </div>
                ) : (
                  <>
                    <textarea value={msgText} onChange={(e) => setMsgText(e.target.value)}
                      placeholder="e.g. I think question 6 should have partial marks because…"
                      rows={3} className="w-full text-sm border border-[#E8EFFE] rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 resize-none" />
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-[#94A3B8]">{msgText.length}/500</span>
                      <button onClick={sendMessage} disabled={msgSending || !msgText.trim() || msgText.length > 500}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#7C3AED] text-white text-sm font-semibold hover:bg-[#6D28D9] transition-all disabled:opacity-50">
                        {msgSending ? <><Loader2 size={14} className="animate-spin" /> Sending…</> : <><Send size={14} /> Send</>}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Next Steps */}
        <motion.div {...panelAnim(0.3)} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-[#E8EFFE] rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-[#0A0F1E] mb-1">Next Steps</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">Keep up the good work! Practice more to improve your weak areas and aim for a higher score next time.</p>
          </div>
          {[
            { icon: BookOpen, title: 'Review Mistakes', sub: 'Go through your incorrect answers', onClick: () => {
              setMistakesOnly(true);
              setExpandedQ(null);
              setTimeout(() => qPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
            }},
            { icon: Award,    title: 'Download Report',  sub: 'Save your evaluation report',        onClick: downloadReport },
          ].map((card) => (
            <motion.button key={card.title} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={card.onClick}
              className="bg-white border border-[#E8EFFE] rounded-2xl p-5 shadow-sm flex items-center gap-4 hover:border-[#7C3AED]/30 hover:shadow-md transition-all text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-[#F5F3FF] flex items-center justify-center shrink-0">
                <card.icon size={18} className="text-[#7C3AED]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[#0A0F1E]">{card.title}</p>
                <p className="text-xs text-[#94A3B8]">{card.sub}</p>
              </div>
              <ChevronRight size={16} className="text-[#94A3B8] shrink-0" />
            </motion.button>
          ))}
        </motion.div>
      </div>
    );
  }

  /* ── Results list view ───────────────────────────────── */
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-8 py-6 max-w-screen-xl mx-auto">
      <div className="bg-white border border-[#E8EFFE] rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-[#E8EFFE] flex items-center justify-between">
          <div>
            <h3 className="font-bold text-[#0A0F1E]">My Evaluated Results</h3>
            <p className="text-xs text-[#94A3B8] mt-0.5">All evaluated answer sheets will appear here</p>
          </div>
          <div className="flex items-center gap-2">
            <AnimatePresence>
              {searchOpen && (
                <motion.input initial={{ width: 0, opacity: 0 }} animate={{ width: 180, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
                  value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search subject…"
                  className="text-sm border border-[#E8EFFE] rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 bg-white" />
              )}
            </AnimatePresence>
            <button onClick={() => { setSearchOpen((v) => !v); setSearch(''); }}
              className="flex items-center gap-1.5 text-xs text-[#64748B] border border-[#E8EFFE] px-3 py-1.5 rounded-lg hover:bg-[#F8F7FF] transition-colors">
              <Search size={12} /> Search
            </button>
            <button onClick={load} className="p-1.5 text-[#64748B] border border-[#E8EFFE] rounded-lg hover:bg-[#F8F7FF] transition-colors">
              <RefreshCw size={13} />
            </button>
          </div>
        </div>

        <div className="px-6 py-3 bg-[#F8F7FF] border-b border-[#E8EFFE] grid grid-cols-6 gap-4">
          {['Subject', 'Exam', 'Date', 'Score', 'Status', 'Action'].map((h) => (
            <span key={h} className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">{h}</span>
          ))}
        </div>

        {loading ? (
          <div className="px-6 py-20 text-center">
            <Loader2 size={28} className="animate-spin text-[#7C3AED]/30 mx-auto mb-3" />
            <p className="text-sm text-[#94A3B8]">Loading results…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <ClipboardList size={32} className="text-[#94A3B8]/30 mx-auto mb-3" />
            <p className="text-sm text-[#94A3B8] font-semibold">No evaluated papers yet</p>
            <p className="text-xs text-[#94A3B8] mt-1">Your teacher will share results here after evaluation</p>
          </div>
        ) : (
          filtered.map((ev, i) => {
            const pct = ev.maxMarks > 0 && ev.obtained != null ? Math.round((ev.obtained / ev.maxMarks) * 100) : null;
            const { grade, color } = pct != null ? gradeFrom(pct) : { grade: '—', color: '#94A3B8' };
            return (
              <motion.div key={ev.id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="px-6 py-4 grid grid-cols-6 gap-4 items-center border-b border-[#E8EFFE] last:border-0 hover:bg-[#FAF9FF] transition-colors"
              >
                <span className="text-sm font-semibold text-[#0A0F1E]">{ev.subject}</span>
                <span className="text-sm text-[#64748B]">{ev.class || 'Term Evaluation'}</span>
                <span className="text-sm text-[#64748B]">{ev.submittedAt}</span>
                <div>
                  <span className="text-sm font-bold text-[#0A0F1E]">
                    {ev.obtained != null ? `${ev.obtained}/${ev.maxMarks}` : '—/—'}
                  </span>
                  {pct != null && (
                    <span className="text-xs font-black ml-1.5 px-1.5 py-0.5 rounded-md" style={{ color, background: `${color}15` }}>
                      {grade}
                    </span>
                  )}
                </div>
                <StatusBadge status={ev.status} />
                <button onClick={() => openDetail(ev.id)}
                  className="flex items-center gap-1.5 text-sm text-[#7C3AED] hover:underline font-semibold hover:text-[#6D28D9] transition-colors">
                  View Report <ChevronRight size={13} />
                </button>
              </motion.div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}
