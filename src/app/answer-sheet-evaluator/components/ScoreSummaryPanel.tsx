'use client';

import React, { useState } from 'react';
import { Download, CheckCircle2, Save, AlertTriangle, BarChart2, Loader2, FileDown } from 'lucide-react';
import { toast } from 'sonner';
import ConfirmModal from '@/components/ui/ConfirmModal';
import type { QuestionEvaluation, StudentInfo } from './EvaluatorWorkspace';
import dynamic from 'next/dynamic';
import { downloadEvalReport } from '@/lib/generateEvalReport';

const SubjectBreakdownChart = dynamic(
  () => import('./SubjectBreakdownChart'),
  { ssr: false, loading: () => <div className="skeleton-pulse h-[140px] rounded-xl" /> }
);

interface ScoreSummaryPanelProps {
  questions: QuestionEvaluation[];
  paperTotalMarks?: number;
  evalId: string | null;
  studentInfo: StudentInfo;
  scannedImages?: string[];
  behaviorAnalysis?: any;
}

export default function ScoreSummaryPanel({ questions, paperTotalMarks, evalId, studentInfo, scannedImages = [], behaviorAnalysis }: ScoreSummaryPanelProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);

  const totalMax     = questions.reduce((a, q) => a + q.maxMarks, 0);
  const displayMax   = paperTotalMarks ?? totalMax;
  const totalObtained = questions.reduce((a, q) => {
    const score = q.teacherScore !== null ? q.teacherScore : q.aiScore;
    return a + score;
  }, 0);
  const percentage    = displayMax > 0 ? Math.round((totalObtained / displayMax) * 100) : 0;
  const overrideCount = questions.filter((q) => q.teacherScore !== null).length;
  const flaggedCount  = questions.filter((q) => q.status === 'flagged').length;
  const reviewedCount = questions.filter((q) => q.teacherScore !== null || q.status === 'reviewed').length;
  const avgConfidence = questions.length > 0
    ? Math.round(questions.reduce((a, q) => a + q.aiConfidence, 0) / questions.length)
    : 0;

  const gradeLabel = percentage >= 90 ? 'A+' : percentage >= 80 ? 'A' : percentage >= 70 ? 'B+' : percentage >= 60 ? 'B' : percentage >= 50 ? 'C' : percentage >= 40 ? 'D' : 'F';
  const gradeColor = percentage >= 70 ? 'text-positive' : percentage >= 50 ? 'text-warning' : 'text-negative';
  const barColor   = percentage >= 70 ? 'bg-positive' : percentage >= 50 ? 'bg-warning' : 'bg-negative';

  const sectionBreakdown = Array.from(new Set(questions.map((q) => q.section))).map((sec) => {
    const secQs       = questions.filter((q) => q.section === sec);
    const secMax      = secQs.reduce((a, q) => a + q.maxMarks, 0);
    const secObtained = secQs.reduce((a, q) => {
      const score = q.teacherScore !== null ? q.teacherScore : q.aiScore;
      return a + score;
    }, 0);
    return { section: sec, obtained: secObtained, max: secMax, pct: secMax > 0 ? Math.round((secObtained / secMax) * 100) : 0 };
  });

  const handleSaveDraft = async () => {
    if (!evalId) { toast.error('No evaluation ID — wait for auto-save to finish.'); return; }
    setIsSaving(true);
    try {
      const res = await fetch(`/api/evaluations/${evalId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions, studentInfo }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Save failed' }));
        throw new Error(err.error);
      }
      toast.success('Draft saved — teacher scores preserved');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save draft');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFinalize = async () => {
    setShowFinalizeModal(false);
    if (!evalId) { toast.error('No evaluation ID — cannot finalize.'); return; }
    try {
      const res = await fetch(`/api/evaluations/${evalId}/finalize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Finalize failed' }));
        throw new Error(err.error);
      }
      toast.success('Evaluation finalized — scores are locked.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to finalize');
    }
  };

  const handleExport = () => {
    const rows = [
      ['Q No', 'Section', 'Question', 'OCR Text', 'AI Score', 'Teacher Score', 'Max Marks', 'AI Confidence', 'Status', 'Comment'],
      ...questions.map((q) => [
        q.qNo, q.section,
        `"${q.questionText.replace(/"/g, '""')}"`,
        `"${q.ocrText.replace(/"/g, '""')}"`,
        q.aiScore, q.teacherScore ?? '', q.maxMarks, q.aiConfidence, q.status,
        `"${q.comment.replace(/"/g, '""')}"`,
      ]),
    ];
    const csv  = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `evaluation_${studentInfo.name || 'student'}_${studentInfo.rollNo || 'unknown'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV report downloaded');
  };

  const handleDownloadReport = () => {
    const totalObtained = questions.reduce((s, q) => s + (q.teacherScore !== null ? q.teacherScore! : q.aiScore), 0);
    const totalMax = questions.reduce((s, q) => s + q.maxMarks, 0);
    const avgAiConfidence = questions.length > 0 ? Math.round(questions.reduce((s, q) => s + q.aiConfidence, 0) / questions.length) : 0;
    downloadEvalReport({
      studentInfo: { name: studentInfo.name, rollNo: studentInfo.rollNo, class: studentInfo.class, school: studentInfo.school, subject: studentInfo.subject, board: studentInfo.board },
      paperInfo:   { totalMarks: paperTotalMarks ?? totalMax },
      questions:   questions.map((q) => ({ qNo: q.qNo, section: q.section, questionText: q.questionText, aiAnswer: q.aiAnswer, ocrText: q.ocrText, aiScore: q.aiScore, teacherScore: q.teacherScore, maxMarks: q.maxMarks, aiReasoning: q.comment || q.aiReasoning || undefined, aiConfidence: q.aiConfidence, keyPoints: q.keyPoints, hasDiagram: q.hasDiagram, language: q.language, status: q.status })),
      trainingData: { totalObtained, totalMax, avgAiConfidence },
      scannedImages,
      behaviorAnalysis,
    }, scannedImages);
    toast.success('Report opened — save as PDF using the print button.');
  };

  return (
    <>
      <aside className="w-full lg:w-64 xl:w-72 lg:shrink-0 border-l border-border bg-card overflow-y-auto scrollbar-thin flex flex-col">

        {/* ── Actions — pinned at TOP ───────────────────────────── */}
        <div className="p-4 border-b border-border space-y-2 bg-card sticky top-0 z-10">
          <button
            onClick={() => setShowFinalizeModal(true)}
            disabled={!evalId}
            className="btn-primary w-full h-10 text-sm gap-2 disabled:opacity-60"
          >
            <CheckCircle2 size={14} />
            Finalize Evaluation
          </button>

          <div className="flex gap-2">
            <button
              onClick={handleSaveDraft}
              disabled={isSaving || !evalId}
              className="btn-secondary flex-1 h-9 text-sm gap-1.5 disabled:opacity-60"
            >
              {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
              {isSaving ? 'Saving…' : 'Save Draft'}
            </button>

            <button
              onClick={handleExport}
              className="btn-ghost flex-1 h-9 text-sm gap-1.5"
            >
              <Download size={13} />
              Export CSV
            </button>
          </div>

          <button
            onClick={handleDownloadReport}
            className="btn-ghost w-full h-9 text-sm gap-1.5 border border-dashed border-orange-300 text-orange-600 hover:bg-orange-50"
          >
            <FileDown size={13} />
            Download Full Report + Answer Sheet
          </button>

          <p className="text-[11px] text-muted-foreground text-center">
            Finalizing locks all scores and generates the final report.
          </p>
        </div>

        {/* ── Score hero ───────────────────────────────────────── */}
        <div className="p-5 border-b border-border">
          <p className="panel-section-label mb-3">Running Score</p>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="metric-hero text-foreground font-tabular">{totalObtained}</span>
            <span className="text-base text-muted-foreground font-500">/ {displayMax}</span>
            <span className={`text-xl font-700 ml-auto ${gradeColor}`}>{gradeLabel}</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden mt-3 mb-2">
            <div
              className={`h-full rounded-full transition-all duration-700 ${barColor}`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">{percentage}% scored</span>
            <span className="text-xs text-muted-foreground">{displayMax - totalObtained} dropped</span>
          </div>
          {evalId && (
            <p className="text-xs text-positive mt-2.5 flex items-center gap-1 font-500">
              <CheckCircle2 size={11} /> Auto-saved to database
            </p>
          )}
        </div>

        {/* ── Quick stats ──────────────────────────────────────── */}
        <div className="p-4 border-b border-border grid grid-cols-2 gap-2.5">
          {[
            { label: 'Reviewed',      value: `${reviewedCount}/${questions.length}`, color: 'text-positive' },
            { label: 'Overridden',    value: overrideCount,   color: overrideCount > 0 ? 'text-primary' : 'text-muted-foreground' },
            { label: 'Flagged',       value: flaggedCount,    color: flaggedCount > 0  ? 'text-warning' : 'text-muted-foreground' },
            { label: 'Avg Confidence',value: `${avgConfidence}%`, color: avgConfidence >= 85 ? 'text-positive' : avgConfidence >= 70 ? 'text-warning' : 'text-negative' },
          ].map((stat) => (
            <div key={stat.label} className="bg-muted/50 rounded-xl p-3 text-center border border-border/40">
              <p className={`text-base font-700 font-tabular ${stat.color}`}>{stat.value}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5 font-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* ── Section breakdown ────────────────────────────────── */}
        <div className="p-5 border-b border-border">
          <div className="flex items-center gap-2 mb-3">
            <BarChart2 size={13} className="text-muted-foreground" />
            <p className="panel-section-label">Section Breakdown</p>
          </div>
          <div className="space-y-3">
            {sectionBreakdown.map((sec) => {
              const secColor = sec.pct >= 70 ? 'bg-positive' : sec.pct >= 50 ? 'bg-warning' : 'bg-negative';
              return (
                <div key={sec.section}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-600 text-foreground">Section {sec.section}</span>
                    <span className="text-xs font-700 text-foreground font-tabular">{sec.obtained}/{sec.max}</span>
                  </div>
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${secColor}`} style={{ width: `${sec.pct}%` }} />
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5 text-right">{sec.pct}%</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Confidence chart ─────────────────────────────────── */}
        <div className="p-5 border-b border-border">
          <p className="panel-section-label mb-3">AI Confidence by Question</p>
          <SubjectBreakdownChart questions={questions} />
        </div>

        {/* ── Flags / warnings ─────────────────────────────────── */}
        {flaggedCount > 0 && (
          <div className="mx-4 my-3 bg-warning-bg border border-warning/25 rounded-xl p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle size={13} className="text-warning mt-0.5 shrink-0" />
              <p className="text-xs text-amber-700 leading-relaxed">
                <span className="font-700">{flaggedCount} questions need review</span> before finalizing.
              </p>
            </div>
          </div>
        )}

      </aside>

      <ConfirmModal
        isOpen={showFinalizeModal}
        title="Finalize this evaluation?"
        description={`This will lock all scores (${totalObtained}/${displayMax} marks) and generate the final report. ${flaggedCount > 0 ? `Warning: ${flaggedCount} questions are still flagged.` : 'All questions reviewed.'} This action cannot be undone.`}
        confirmLabel="Yes, Finalize"
        cancelLabel="Continue Reviewing"
        variant="primary"
        onConfirm={handleFinalize}
        onCancel={() => setShowFinalizeModal(false)}
      />
    </>
  );
}
