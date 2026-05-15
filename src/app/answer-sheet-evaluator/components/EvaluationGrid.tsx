'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, AlertTriangle, CheckCircle2, XCircle, MinusCircle, ScanLine, Globe, Brain, MessageSquare, Lightbulb, PenLine, ListChecks, Zap, GitMerge } from 'lucide-react';
import type { QuestionEvaluation, KeyPoint } from './EvaluatorWorkspace';

interface EvaluationGridProps {
  questions: QuestionEvaluation[];
  updateQuestion: (id: string, field: 'teacherScore' | 'comment', value: number | string | null) => void;
}

function ConfidencePill({ value }: { value: number }) {
  const color = value >= 85
    ? 'bg-positive-bg text-green-700'
    : value >= 70
    ? 'bg-warning-bg text-amber-700'
    : 'bg-negative-bg text-red-700';
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-700 font-tabular ${color}`}>
      <Brain size={10} />
      {value}%
    </span>
  );
}

function ScoreBadge({ score, max, overridden }: { score: number; max: number; overridden: boolean }) {
  const pct = max > 0 ? score / max : 0;
  const color = pct >= 0.7 ? 'text-positive' : pct >= 0.4 ? 'text-warning' : 'text-negative';
  return (
    <span className={`text-sm font-700 font-tabular ${overridden ? 'text-primary' : color}`}>
      {score}<span className="text-muted-foreground font-400">/{max}</span>
    </span>
  );
}

function SemanticSimilarityBar({ value }: { value: number }) {
  const color = value >= 80 ? 'bg-positive' : value >= 60 ? 'bg-warning' : 'bg-negative';
  const textColor = value >= 80 ? 'text-positive' : value >= 60 ? 'text-warning' : 'text-negative';
  const label = value >= 80 ? 'High semantic match' : value >= 60 ? 'Moderate match' : 'Low match';
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <GitMerge size={13} className="text-primary" />
        <p className="text-xs font-700 text-muted-foreground uppercase tracking-wider">Semantic Similarity</p>
        <span className={`ml-auto text-xs font-700 font-tabular ${textColor}`}>{value}%</span>
      </div>
      <div className="bg-secondary/50 border border-primary/10 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className={`text-sm font-600 ${textColor}`}>{label}</span>
          <span className={`text-lg font-700 font-tabular ${textColor}`}>{value}%</span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${value}%` }} />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Measures how closely the student's answer matches the model answer in <em>meaning</em> — same idea in different words still scores high.
        </p>
      </div>
    </div>
  );
}

function HybridScoreCard({ q }: { q: QuestionEvaluation }) {
  if (q.maxMarks === 0) return null;
  const keyPoints = q.keyPoints ?? [];
  const kpTotal = keyPoints.length;
  const kpCovered = keyPoints.filter((k) => k.covered && !k.partial).length;
  const kpPartial = keyPoints.filter((k) => k.partial).length;
  const kpPct = kpTotal > 0 ? Math.round(((kpCovered + kpPartial * 0.5) / kpTotal) * 100) : null;
  const aiPct = Math.round((q.aiScore / q.maxMarks) * 100);
  const hybridPct = Math.round((q.hybridScore / q.maxMarks) * 100);

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Zap size={13} className="text-primary" />
        <p className="text-xs font-700 text-muted-foreground uppercase tracking-wider">Hybrid Score</p>
        <span className="ml-auto text-sm font-700 text-primary">
          {q.hybridScore}<span className="text-xs text-muted-foreground font-400">/{q.maxMarks}</span>
        </span>
      </div>
      <div className="bg-gradient-to-br from-primary/5 to-secondary/40 border border-primary/15 rounded-xl p-4">
        <div className={`grid gap-2 text-center mb-3 ${kpPct !== null ? 'grid-cols-3' : 'grid-cols-2'}`}>
          {kpPct !== null && (
            <div className="bg-background/70 rounded-lg p-2.5">
              <p className="text-base font-700 text-foreground">{kpPct}%</p>
              <p className="text-xs text-muted-foreground leading-tight mt-0.5">Key Points</p>
              <p className="text-xs text-muted-foreground/60">×40%</p>
            </div>
          )}
          <div className="bg-background/70 rounded-lg p-2.5">
            <p className="text-base font-700 text-foreground">{q.semanticSimilarity}%</p>
            <p className="text-xs text-muted-foreground leading-tight mt-0.5">Semantic</p>
            <p className="text-xs text-muted-foreground/60">{kpPct !== null ? '×35%' : '×60%'}</p>
          </div>
          <div className="bg-background/70 rounded-lg p-2.5">
            <p className="text-base font-700 text-foreground">{aiPct}%</p>
            <p className="text-xs text-muted-foreground leading-tight mt-0.5">AI Score</p>
            <p className="text-xs text-muted-foreground/60">{kpPct !== null ? '×25%' : '×40%'}</p>
          </div>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden mb-1.5">
          <div className="h-full bg-primary rounded-full" style={{ width: `${hybridPct}%` }} />
        </div>
        <p className="text-xs text-center text-muted-foreground">
          {kpPct !== null
            ? 'Hybrid = (0.40 × KeyPoints) + (0.35 × Semantic) + (0.25 × AI)'
            : 'Hybrid = (0.60 × Semantic) + (0.40 × AI)  — no key points data'}
        </p>
      </div>
    </div>
  );
}

function KeyPointsPanel({ keyPoints, maxMarks, aiScore }: { keyPoints: KeyPoint[]; maxMarks: number; aiScore: number }) {
  const covered = keyPoints.filter((k) => k.covered && !k.partial).length;
  const partial = keyPoints.filter((k) => k.partial).length;
  const missed = keyPoints.filter((k) => !k.covered && !k.partial).length;

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <ListChecks size={13} className="text-primary" />
        <p className="text-xs font-700 text-muted-foreground uppercase tracking-wider">Key Points Analysis</p>
        <span className="text-xs text-muted-foreground ml-1">
          {covered} covered · {partial} partial · {missed} missed
        </span>
      </div>
      <div className="bg-muted/40 border border-border/50 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {keyPoints.map((kp, i) => {
          const Icon = kp.covered && !kp.partial ? CheckCircle2 : kp.partial ? MinusCircle : XCircle;
          const color = kp.covered && !kp.partial
            ? 'text-positive'
            : kp.partial
            ? 'text-warning'
            : 'text-negative';
          const bg = kp.covered && !kp.partial
            ? 'bg-positive-bg/60'
            : kp.partial
            ? 'bg-warning-bg/60'
            : 'bg-negative-bg/40';
          return (
            <div key={i} className={`flex items-start gap-2 rounded-lg px-3 py-2 ${bg}`}>
              <Icon size={13} className={`${color} shrink-0 mt-0.5`} />
              <span className="text-xs text-foreground leading-snug">{kp.point}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function QuestionRow({ q, updateQuestion }: { q: QuestionEvaluation; updateQuestion: EvaluationGridProps['updateQuestion'] }) {
  const [expanded, setExpanded] = useState(false);
  const [localScore, setLocalScore] = useState<string>(q.teacherScore !== null ? String(q.teacherScore) : '');
  const [localComment, setLocalComment] = useState(q.comment);
  const [scoreError, setScoreError] = useState('');

  const effectiveScore = q.teacherScore !== null ? q.teacherScore : q.hybridScore;
  const isOverridden = q.teacherScore !== null;
  const isUnattempted = q.maxMarks === 0;

  const handleScoreChange = (val: string) => {
    setLocalScore(val);
    setScoreError('');
    const num = parseFloat(val);
    if (val === '') {
      updateQuestion(q.id, 'teacherScore', null);
    } else if (isNaN(num) || num < 0) {
      setScoreError('Must be 0 or more');
    } else if (num > q.maxMarks) {
      setScoreError(`Max is ${q.maxMarks}`);
    } else {
      updateQuestion(q.id, 'teacherScore', num);
    }
  };

  const statusDot = {
    pending: 'bg-muted-foreground/30',
    reviewed: 'bg-positive',
    flagged: 'bg-warning',
  }[q.status];

  return (
    <div className={`border-b border-border last:border-0 transition-colors ${
      q.status === 'flagged' ? 'bg-warning-bg/20' : isUnattempted ? 'bg-muted/20' : 'bg-card hover:bg-muted/10'
    }`}>
      {/* ── Compact header row ── */}
      <div
        className="flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-3 cursor-pointer select-none"
        onClick={() => setExpanded(!expanded)}
      >
        <span className={`w-2 h-2 rounded-full shrink-0 ${statusDot}`} />

        {/* Q label */}
        <div className="w-12 sm:w-14 shrink-0">
          <p className="text-xs font-700 text-foreground leading-none">Q.{q.qNo}</p>
          <p className="text-xs text-muted-foreground mt-0.5">§{q.section}</p>
        </div>

        {/* Question text — full, wraps naturally */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-foreground font-500 leading-snug">{q.questionText || '—'}</p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {isUnattempted && (
              <span className="text-xs text-muted-foreground italic">Not attempted</span>
            )}
            {q.hasDiagram && !isUnattempted && (
              <span className="inline-flex items-center gap-1 text-xs text-accent font-600">
                <ScanLine size={10} /> Diagram
              </span>
            )}
            {q.language && q.language !== 'English' && (
              <span className="inline-flex items-center gap-1 text-xs text-purple-600 font-600">
                <Globe size={10} /> {q.language}
              </span>
            )}
          </div>
        </div>

        {/* AI score */}
        <div className="shrink-0 text-center w-16 sm:w-20">
          <p className="text-xs text-muted-foreground mb-0.5">AI Score</p>
          <p className={`text-sm font-700 font-tabular ${isOverridden ? 'line-through text-muted-foreground/50' : ''}`}>
            {q.aiScore}/{q.maxMarks}
          </p>
        </div>

        {/* Confidence + Semantic — hidden on mobile */}
        <div className="hidden md:flex shrink-0 w-20 flex-col items-center gap-0.5">
          {!isUnattempted && <ConfidencePill value={q.aiConfidence} />}
          {!isUnattempted && (
            <span className="text-xs text-muted-foreground font-tabular">~{q.semanticSimilarity}% sim</span>
          )}
        </div>

        {/* Teacher override — hidden on mobile */}
        <div className="hidden sm:block shrink-0 w-24 md:w-28" onClick={(e) => e.stopPropagation()}>
          <p className="text-xs text-muted-foreground mb-0.5">Your Score</p>
          <div className="flex items-center gap-1">
            <input
              type="number"
              min="0"
              max={q.maxMarks}
              step="0.5"
              value={localScore}
              disabled={isUnattempted}
              onChange={(e) => handleScoreChange(e.target.value)}
              placeholder={isUnattempted ? '—' : String(q.aiScore)}
              className={`input-field text-sm font-700 w-16 text-center py-1 px-2 disabled:opacity-40 ${isOverridden ? 'border-primary/50 bg-secondary/60' : ''}`}
            />
            <span className="text-xs text-muted-foreground">/{q.maxMarks}</span>
          </div>
          {scoreError && <p className="text-xs text-negative mt-0.5">{scoreError}</p>}
        </div>

        {/* Hybrid / Final */}
        <div className="shrink-0 w-14 sm:w-16 text-center">
          <p className="text-xs text-muted-foreground mb-0.5">{isOverridden ? 'Final' : 'Hybrid'}</p>
          <ScoreBadge score={effectiveScore} max={q.maxMarks} overridden={isOverridden} />
        </div>

        {/* Toggle */}
        <button className="shrink-0 w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center transition-colors">
          {expanded
            ? <ChevronUp size={14} className="text-muted-foreground" />
            : <ChevronDown size={14} className="text-muted-foreground" />}
        </button>
      </div>

      {/* ── Expanded detail ── */}
      <AnimatePresence initial={false}>
      {expanded && (
        <motion.div
          key="detail"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          style={{ overflow: 'hidden' }}
        >
        <div className="border-t border-border/50 px-5 pb-5 pt-4 space-y-4">

          {/* Row 1: AI Ideal Answer | Student's Written Answer */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* AI Ideal Answer */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb size={13} className="text-primary" />
                <p className="text-xs font-700 text-muted-foreground uppercase tracking-wider">Model Answer</p>
              </div>
              <div className="bg-primary/5 border border-primary/15 rounded-xl p-4 text-sm text-foreground leading-relaxed min-h-[72px]">
                {q.aiAnswer
                  ? q.aiAnswer
                  : <span className="text-muted-foreground italic">No model answer generated</span>}
              </div>
            </div>

            {/* Student's Handwritten Answer (OCR) */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <PenLine size={13} className="text-accent" />
                <p className="text-xs font-700 text-muted-foreground uppercase tracking-wider">Student's Answer (OCR)</p>
                {q.language && q.language !== 'English' && (
                  <span className="text-xs text-purple-600 font-600">({q.language})</span>
                )}
              </div>
              <div className="bg-muted/60 border border-border/50 rounded-xl p-4 text-sm text-foreground leading-relaxed font-mono whitespace-pre-wrap min-h-[72px]">
                {isUnattempted
                  ? <span className="text-muted-foreground italic">Question not attempted by student</span>
                  : q.ocrText || <span className="text-muted-foreground italic">No text extracted</span>}
              </div>
              {q.hasDiagram && (
                <div className="mt-2 bg-accent/5 border border-accent/20 rounded-xl p-3 flex items-center gap-2">
                  <ScanLine size={13} className="text-accent shrink-0" />
                  <p className="text-xs text-accent font-600">Diagram detected — verify manually for full credit</p>
                </div>
              )}
            </div>
          </div>

          {/* Row 2: Key Points Analysis (full width) */}
          {!isUnattempted && q.keyPoints && q.keyPoints.length > 0 && (
            <KeyPointsPanel keyPoints={q.keyPoints} maxMarks={q.maxMarks} aiScore={q.aiScore} />
          )}

          {/* Row 3: Semantic Similarity + Hybrid Score Breakdown */}
          {!isUnattempted && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <SemanticSimilarityBar value={q.semanticSimilarity} />
              <HybridScoreCard q={q} />
            </div>
          )}

          {/* Row 4: AI Reasoning + Teacher Comment */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* AI Reasoning */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Brain size={13} className="text-primary" />
                <p className="text-xs font-700 text-muted-foreground uppercase tracking-wider">AI Evaluation</p>
                {!isUnattempted && <ConfidencePill value={q.aiConfidence} />}
              </div>
              <div className="bg-secondary/50 border border-primary/10 rounded-xl p-4 text-sm text-foreground leading-relaxed min-h-[56px]">
                {isUnattempted
                  ? <span className="text-muted-foreground italic">Not scored — question not attempted</span>
                  : q.aiReasoning || <span className="text-muted-foreground italic">No reasoning provided</span>}
              </div>
            </div>

            {/* Teacher Comment */}
            <div onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare size={13} className="text-muted-foreground" />
                <p className="text-xs font-700 text-muted-foreground uppercase tracking-wider">Teacher Comment</p>
                <span className="text-xs text-muted-foreground">(optional)</span>
              </div>
              <textarea
                rows={2}
                value={localComment}
                onChange={(e) => {
                  setLocalComment(e.target.value);
                  updateQuestion(q.id, 'comment', e.target.value);
                }}
                placeholder="Add partial credit reasoning, feedback, or notes for the student..."
                className="input-field text-sm resize-none leading-relaxed w-full"
              />
            </div>
          </div>
        </div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}

export default function EvaluationGrid({ questions, updateQuestion }: EvaluationGridProps) {
  const flagged = questions.filter((q) => q.status === 'flagged');

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin bg-background">

      {/* Flagged alert banner */}
      {flagged.length > 0 && (
        <div className="mx-4 mt-4 bg-warning-bg border border-warning/25 rounded-xl px-4 py-3 flex items-start gap-3">
          <AlertTriangle size={15} className="text-warning mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-700 text-amber-800">
              {flagged.length} question{flagged.length > 1 ? 's' : ''} flagged for review
            </p>
            <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
              Q.{flagged.map((q) => q.qNo).join(', Q.')} — low confidence or diagram detected. Verify before finalizing.
            </p>
          </div>
        </div>
      )}

      {/* Column headers */}
      <div className="flex items-center gap-2 px-3 sm:px-5 py-2.5 mt-4 bg-muted/60 border-y border-border sticky top-0 z-10 backdrop-blur-sm">
        <div className="w-2 shrink-0" />
        <div className="w-12 sm:w-14 shrink-0">
          <span className="panel-section-label">Q No.</span>
        </div>
        <div className="flex-1">
          <span className="panel-section-label">Question</span>
        </div>
        <div className="w-16 sm:w-20 shrink-0 text-center">
          <span className="panel-section-label">AI Score</span>
        </div>
        <div className="hidden md:block w-20 shrink-0 text-center">
          <span className="panel-section-label">Confidence</span>
        </div>
        <div className="hidden sm:block w-24 md:w-28 shrink-0">
          <span className="panel-section-label">Override</span>
        </div>
        <div className="w-14 sm:w-16 shrink-0 text-center">
          <span className="panel-section-label">Final</span>
        </div>
        <div className="w-7 shrink-0" />
      </div>

      {/* Question rows */}
      <div>
        {questions.map((q) => (
          <QuestionRow key={q.id} q={q} updateQuestion={updateQuestion} />
        ))}
      </div>

      {questions.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center px-8">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <CheckCircle2 size={26} className="text-muted-foreground/40" />
          </div>
          <p className="text-sm font-600 text-muted-foreground">No questions in this section</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Select a different section from the left panel</p>
        </div>
      )}
    </div>
  );
}
