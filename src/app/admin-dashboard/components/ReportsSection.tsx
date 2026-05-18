'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, Users, BookOpen, School, BarChart3, Loader2, CheckCircle2 } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import toast from 'react-hot-toast';

type ReportStatus = 'idle' | 'loading' | 'done';

function downloadCSV(rows: string[][], filename: string) {
  const csv = rows.map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function ReportsSection() {
  const [statuses, setStatuses] = useState<Record<string, ReportStatus>>({});

  const setStatus = (key: string, s: ReportStatus) => setStatuses(prev => ({ ...prev, [key]: s }));

  const generateAllEvaluations = async () => {
    setStatus('all', 'loading');
    try {
      const res = await fetch('/api/evaluations?limit=1000');
      const data = await res.json();
      const evals = data.evaluations ?? [];
      const rows: string[][] = [['Student Name', 'Roll No', 'Subject', 'Class', 'Score', 'Max Marks', 'Percentage', 'AI Confidence', 'Overrides', 'Status', 'Date']];
      evals.forEach((e: any) => rows.push([`"${e.studentName}"`, e.rollNo, e.subject, e.class, String(e.obtained ?? ''), String(e.maxMarks), e.obtained ? `${Math.round((e.obtained / e.maxMarks) * 100)}%` : '—', e.aiConfidence ? `${e.aiConfidence}%` : '—', String(e.overrides ?? 0), e.status, e.submittedAt]));
      downloadCSV(rows, `all_evaluations_${new Date().toISOString().slice(0,10)}.csv`);
      setStatus('all', 'done'); toast.success('Report downloaded');
      setTimeout(() => setStatus('all', 'idle'), 2000);
    } catch { setStatus('all', 'idle'); toast.error('Failed to generate report'); }
  };

  const generateStudentReport = async () => {
    setStatus('students', 'loading');
    try {
      const res = await fetch('/api/students');
      const data = await res.json();
      const students = data.students ?? [];
      const rows: string[][] = [['Student Name', 'Roll No', 'Class', 'Evaluations', 'Avg Score %', 'Best Subject', 'Last Evaluated']];
      students.forEach((s: any) => rows.push([`"${s.name}"`, s.rollNo, s.class, String(s.evalCount), s.avgScore ? `${s.avgScore}%` : '—', '—', s.lastEvaluated ? new Date(s.lastEvaluated).toLocaleDateString() : '—']));
      downloadCSV(rows, `student_performance_${new Date().toISOString().slice(0,10)}.csv`);
      setStatus('students', 'done'); toast.success('Report downloaded');
      setTimeout(() => setStatus('students', 'idle'), 2000);
    } catch { setStatus('students', 'idle'); toast.error('Failed'); }
  };

  const generateSubjectReport = async () => {
    setStatus('subjects', 'loading');
    try {
      const res = await fetch('/api/analytics');
      const data = await res.json();
      const rows: string[][] = [['Subject', 'Evaluations', 'Avg Score %', 'Avg Confidence %', 'Total Overrides']];
      (data.subjectStats ?? []).forEach((s: any) => rows.push([s.subject, String(s.count), `${s.avgScore}%`, `${s.avgConfidence}%`, String(s.overrides)]));
      downloadCSV(rows, `subject_performance_${new Date().toISOString().slice(0,10)}.csv`);
      setStatus('subjects', 'done'); toast.success('Report downloaded');
      setTimeout(() => setStatus('subjects', 'idle'), 2000);
    } catch { setStatus('subjects', 'idle'); toast.error('Failed'); }
  };

  const generateSchoolReport = async () => {
    setStatus('schools', 'loading');
    try {
      const res = await fetch('/api/admin/schools');
      const data = await res.json();
      const rows: string[][] = [['School Name', 'Students', 'Evaluations', 'Avg Score %', 'Finalized']];
      (data.schools ?? []).forEach((s: any) => rows.push([`"${s.name}"`, String(s.studentCount), String(s.evalCount), s.avgScore ? `${s.avgScore}%` : '—', String(s.finalized)]));
      downloadCSV(rows, `school_report_${new Date().toISOString().slice(0,10)}.csv`);
      setStatus('schools', 'done'); toast.success('Report downloaded');
      setTimeout(() => setStatus('schools', 'idle'), 2000);
    } catch { setStatus('schools', 'idle'); toast.error('Failed'); }
  };

  const generateSubmissionsReport = async () => {
    setStatus('submissions', 'loading');
    try {
      const res = await fetch('/api/student-uploads');
      const data = await res.json();
      const rows: string[][] = [['Student', 'Roll No', 'Email', 'Subject', 'Grade', 'File Name', 'Status', 'Submitted Date']];
      (data.uploads ?? []).forEach((s: any) => rows.push([`"${s.studentName}"`, s.rollNo, s.studentEmail, s.subject, s.grade, `"${s.fileName}"`, s.status, new Date(s.createdAt).toLocaleDateString()]));
      downloadCSV(rows, `submissions_report_${new Date().toISOString().slice(0,10)}.csv`);
      setStatus('submissions', 'done'); toast.success('Report downloaded');
      setTimeout(() => setStatus('submissions', 'idle'), 2000);
    } catch { setStatus('submissions', 'idle'); toast.error('Failed'); }
  };

  const reports = [
    { key: 'all', title: 'All Evaluations', desc: 'Complete list of every evaluation with scores, confidence, and status', icon: FileText, color: '#1A6BFF', bg: 'bg-blue-50', action: generateAllEvaluations },
    { key: 'students', title: 'Student Performance', desc: 'Per-student averages, evaluation count, and last activity', icon: Users, color: '#059669', bg: 'bg-green-50', action: generateStudentReport },
    { key: 'subjects', title: 'Subject Analytics', desc: 'Average scores, AI confidence, and overrides per subject', icon: BookOpen, color: '#7C3AED', bg: 'bg-purple-50', action: generateSubjectReport },
    { key: 'schools', title: 'School Report', desc: 'School-wise student count, evaluation count, and average score', icon: School, color: '#F59E0B', bg: 'bg-amber-50', action: generateSchoolReport },
    { key: 'submissions', title: 'Student Submissions', desc: 'All answer sheets uploaded by students with status', icon: BarChart3, color: '#06B6D4', bg: 'bg-cyan-50', action: generateSubmissionsReport },
  ];

  return (
    <motion.div key="reports" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div>
        <h2 className="text-3xl font-black text-[#0A0F1E] tracking-tighter">Reports</h2>
        <p className="text-[#64748B] font-bold mt-1">Download CSV reports for offline analysis</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {reports.map((r, i) => {
          const Icon = r.icon;
          const status = statuses[r.key] ?? 'idle';
          return (
            <motion.div key={r.key} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <GlassCard className="flex flex-col gap-5 h-full">
                <div className={`w-14 h-14 rounded-2xl ${r.bg} flex items-center justify-center shadow-inner`}>
                  <Icon size={26} style={{ color: r.color }} />
                </div>
                <div className="flex-1">
                  <h3 className="font-black text-[#0A0F1E] text-base">{r.title}</h3>
                  <p className="text-sm text-[#64748B] font-medium mt-1 leading-relaxed">{r.desc}</p>
                </div>
                <button
                  onClick={r.action}
                  disabled={status === 'loading'}
                  className={`w-full py-3.5 rounded-2xl text-sm font-black flex items-center justify-center gap-2.5 transition-all disabled:opacity-60 ${status === 'done' ? 'bg-green-50 text-green-700 border-2 border-green-200' : 'bg-[#0A0F1E] text-white hover:opacity-90 shadow-lg active:scale-98'}`}
                >
                  {status === 'loading' && <><Loader2 size={16} className="animate-spin" /> Generating…</>}
                  {status === 'done' && <><CheckCircle2 size={16} /> Downloaded!</>}
                  {status === 'idle' && <><Download size={16} /> Download CSV</>}
                </button>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
