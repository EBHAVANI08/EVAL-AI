'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2, ArrowRight, RotateCcw, BookOpen, Clock, Award, Hash,
  ChevronDown, ChevronUp, FileText, Plus, Trash2, AlertTriangle,
} from 'lucide-react';
import type { ExtractedPaper, ExtractedQuestion, SectionConfig } from './QuestionPaperAnalyzerClient';

interface Props {
  paper: ExtractedPaper;
  sectionConfig: SectionConfig[];
  fileName: string;
  onReset: () => void;
  onUpdate: (updated: ExtractedPaper) => void;
  onProceed: () => void;
}

const typeColors: Record<string, string> = {
  mcq:              'bg-green-50 text-green-700',
  'assertion-reason': 'bg-teal-50 text-teal-700',
  short:            'bg-gray-100 text-gray-700',
  theory:           'bg-blue-50 text-blue-700',
  numerical:        'bg-purple-50 text-purple-700',
  diagram:          'bg-orange-50 text-orange-700',
  'case-study':     'bg-pink-50 text-pink-700',
};

// Editable row state per section
interface SectionRow {
  sec: string;
  label: string;
  marksPerQ: number;
  attemptAny: number;     // 0 = all required
  detectedQCount: number; // AI-detected question count (editable for corrections)
}

export default function ExtractedQuestionsPanel({ paper, sectionConfig, fileName, onReset, onUpdate, onProceed }: Props) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const rawSections = paper.metadata.sections.length > 0
    ? paper.metadata.sections
    : [...new Set(paper.questions.map((q) => q.section))];

  // Build initial rows from AI-detected data + teacher's original config
  const [rows, setRows] = useState<SectionRow[]>(() =>
    rawSections.map((sec) => {
      const qs = paper.questions.filter((q) => q.section === sec);
      // OR alternatives don't add to question count — they're choices for the same slot
      const mainQs = qs.filter((q) => !q.isChoiceAlt);
      const cfgRow = sectionConfig.find((s) => s.name === sec);
      const constraint = paper.metadata.sectionConstraints?.[sec];
      const aiLabel = paper.metadata.sectionLabels?.[sec] ?? '';
      const aiMarksPerQ = paper.metadata.sectionMarksPerQ?.[sec] ?? mainQs[0]?.maxMarks ?? 1;
      return {
        sec,
        label: cfgRow?.label ?? aiLabel,
        marksPerQ: cfgRow?.marksPerQ ?? aiMarksPerQ,
        attemptAny: constraint?.attemptAny ?? cfgRow?.attemptAny ?? 0,
        detectedQCount: mainQs.length,   // OR alternatives excluded — they share a slot
      };
    })
  );

  const sections = rows.map((r) => r.sec);

  const questionsBySection = sections.reduce<Record<string, ExtractedQuestion[]>>((acc, sec) => {
    acc[sec] = paper.questions.filter((q) => q.section === sec);
    return acc;
  }, {});

  // Compute the actual exam total marks respecting "attempt any" constraints
  const computeExamTotal = (currentRows: SectionRow[]) =>
    currentRows.reduce((s, r) => s + (r.attemptAny > 0 ? r.attemptAny : r.detectedQCount) * r.marksPerQ, 0);

  // Update a single row field and propagate ALL changes to the questions array + metadata
  const updateRow = (sec: string, field: keyof SectionRow, val: string | number) => {
    // Build projected rows (what rows will look like after this update)
    const projectedRows = rows.map((r) => r.sec === sec ? { ...r, [field]: val } : r);
    setRows(projectedRows);

    if (field === 'marksPerQ') {
      const newMarks = Number(val);
      const sectionQs = paper.questions.filter((q) => q.section === sec);
      // For sub-parts: divide marksPerQ equally among siblings of each parent
      const updatedQuestions = paper.questions.map((q) => {
        if (q.section !== sec) return q;
        if (q.parentQNo) {
          const siblingCount = sectionQs.filter((sq) => sq.parentQNo === q.parentQNo).length;
          const perSubPart = siblingCount > 1 ? Math.round((newMarks / siblingCount) * 2) / 2 : newMarks;
          return { ...q, maxMarks: perSubPart };
        }
        return { ...q, maxMarks: newMarks };
      });
      const newTotal = computeExamTotal(projectedRows);
      onUpdate({ ...paper, questions: updatedQuestions, metadata: { ...paper.metadata, totalMarks: newTotal } });
    }

    if (field === 'attemptAny') {
      const n = Number(val);
      const currentConstraints = { ...(paper.metadata.sectionConstraints ?? {}) };
      const secTotal = paper.questions.filter((q) => q.section === sec && !q.parentQNo).length;
      if (n > 0) {
        currentConstraints[sec] = { attemptAny: n, totalQuestions: secTotal };
      } else {
        delete currentConstraints[sec];
      }
      const newTotal = computeExamTotal(projectedRows);
      onUpdate({ ...paper, metadata: { ...paper.metadata, sectionConstraints: currentConstraints, totalMarks: newTotal } });
    }

    if (field === 'detectedQCount') {
      const newTotal = computeExamTotal(projectedRows);
      onUpdate({ ...paper, metadata: { ...paper.metadata, totalMarks: newTotal } });
    }
  };

  // Remove an entire section
  const removeSection = (sec: string) => {
    const newRows = rows.filter((r) => r.sec !== sec);
    setRows(newRows);
    const newTotal = computeExamTotal(newRows);
    const updated: ExtractedPaper = {
      ...paper,
      metadata: {
        ...paper.metadata,
        sections: paper.metadata.sections.filter((s) => s !== sec),
        totalMarks: newTotal,
      },
      questions: paper.questions.filter((q) => q.section !== sec),
    };
    onUpdate(updated);
  };

  // Add a blank new section row
  const addSection = () => {
    const used = new Set(rows.map((r) => r.sec));
    const next = 'ABCDEFGHIJ'.split('').find((c) => !used.has(c)) ?? 'Z';
    setRows((prev) => [...prev, { sec: next, label: '', marksPerQ: 1, attemptAny: 0, detectedQCount: 0 }]);
    const updated: ExtractedPaper = {
      ...paper,
      metadata: { ...paper.metadata, sections: [...paper.metadata.sections, next] },
    };
    onUpdate(updated);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Success banner */}
      <div className="flex items-center gap-3 p-4 bg-positive-bg border border-positive/20 rounded-xl mb-6">
        <CheckCircle2 size={20} className="text-positive shrink-0" />
        <div className="flex-1">
          <p className="font-600 text-foreground text-sm">Question paper analyzed successfully</p>
          <p className="text-xs text-muted-foreground mt-0.5">
          {fileName} · {paper.questions.filter((q) => !q.isChoiceAlt).length} questions extracted
          {paper.questions.some((q) => q.isChoiceAlt) && ` · ${paper.questions.filter((q) => q.isChoiceAlt).length} OR choices`}
        </p>
        </div>
        <Link href="/answer-sheet-evaluator" onClick={onProceed}
          className="flex items-center gap-1.5 bg-primary text-primary-foreground text-sm font-600 px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors shrink-0"
        >
          Evaluate Answer Sheet <ArrowRight size={14} />
        </Link>
      </div>

      {/* Metadata cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { icon: BookOpen, label: 'Subject',     value: paper.metadata.subject },
          { icon: Hash,     label: 'Class',       value: paper.metadata.class },
          { icon: Award,    label: 'Total Marks', value: String(rows.reduce((s, r) => s + (r.attemptAny > 0 ? r.attemptAny : r.detectedQCount) * r.marksPerQ, 0)) },
          { icon: Clock,    label: 'Duration',    value: paper.metadata.duration },
        ].map((item) => (
          <div key={item.label} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-1.5 mb-1">
              <item.icon size={14} className="text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{item.label}</span>
            </div>
            <p className="font-700 text-foreground text-sm truncate">{item.value || '—'}</p>
          </div>
        ))}
      </div>

      {/* ── AI-Detected Section Configuration Table ── */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden mb-6">
        {/* Table header */}
        <div className="px-5 py-3.5 border-b border-border flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-2">
            <Award size={15} className="text-primary" />
            <span className="font-700 text-foreground text-sm">AI-Detected Section Configuration</span>
            <span className="text-[10px] font-600 bg-primary/10 text-primary px-2 py-0.5 rounded-full">Verify &amp; Edit</span>
          </div>
          <button onClick={addSection}
            className="flex items-center gap-1.5 text-xs font-600 text-primary hover:bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20 hover:border-primary/40 transition-colors"
          >
            <Plus size={12} /> Add Section
          </button>
        </div>

        {/* Column headers */}
        <div className="grid grid-cols-[44px_1fr_88px_84px_200px_80px_32px] gap-2 px-5 py-2.5 bg-muted/50 border-b border-border">
          {[
            'SEC',
            'LABEL / DESCRIPTION',
            'AVAILABLE',
            'MARKS / Q',
            'ATTEMPT RULE',
            'SECTION TOTAL',
            '',
          ].map((h) => (
            <span key={h} className="text-[10px] font-700 text-muted-foreground uppercase tracking-wider">{h}</span>
          ))}
        </div>

        {/* Section rows */}
        <div className="divide-y divide-border">
          {rows.map((row) => {
            const attemptCount = row.attemptAny > 0 ? row.attemptAny : row.detectedQCount;
            const sectionTotal = attemptCount * row.marksPerQ;
            const isConstrained = row.attemptAny > 0;
            return (
              <div key={row.sec} className="grid grid-cols-[44px_1fr_88px_84px_200px_80px_32px] gap-2 items-center px-5 py-3 hover:bg-muted/10 transition-colors">

                {/* SEC badge */}
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-700 text-primary">{row.sec}</span>
                </div>

                {/* Label */}
                <input
                  value={row.label}
                  onChange={(e) => updateRow(row.sec, 'label', e.target.value)}
                  placeholder="e.g. Objective / MCQ"
                  className="h-9 w-full text-sm text-foreground border border-border rounded-lg px-3 bg-background outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground/50"
                />

                {/* Available questions — editable */}
                <div className="flex flex-col items-center gap-0.5">
                  <div className="flex items-center gap-1 w-full">
                    <input
                      type="number" min={1} max={200}
                      value={row.detectedQCount}
                      onChange={(e) => updateRow(row.sec, 'detectedQCount', Math.max(1, parseInt(e.target.value) || 1))}
                      className="h-8 flex-1 text-center text-sm font-600 text-foreground border border-border rounded-lg bg-background outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                    <span className="text-[11px] text-muted-foreground shrink-0">qs</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">available</span>
                </div>

                {/* Marks / Q — editable */}
                <div className="flex flex-col items-center gap-0.5">
                  <div className="flex items-center gap-1 w-full">
                    <input
                      type="number" min={0.5} max={50} step={0.5}
                      value={row.marksPerQ}
                      onChange={(e) => updateRow(row.sec, 'marksPerQ', Math.max(0.5, parseFloat(e.target.value) || 0.5))}
                      className="h-8 flex-1 text-center text-sm font-600 text-foreground border border-border rounded-lg bg-background outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                    <span className="text-[11px] text-muted-foreground shrink-0">m</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">per question</span>
                </div>

                {/* Attempt Rule — key redesigned column */}
                <div className={`flex flex-col gap-1 px-3 py-2 rounded-xl border ${isConstrained ? 'bg-amber-50/60 border-amber-200' : 'bg-muted/30 border-border'}`}>
                  {/* Instruction line */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-[10px] font-700 px-1.5 py-0.5 rounded-full ${isConstrained ? 'bg-amber-100 text-amber-700' : 'bg-primary/10 text-primary'}`}>
                      {isConstrained ? 'ATTEMPT ANY' : 'ATTEMPT ALL'}
                    </span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number" min={0} max={row.detectedQCount || 999}
                        value={row.attemptAny === 0 ? '' : row.attemptAny}
                        placeholder={String(row.detectedQCount)}
                        onChange={(e) => updateRow(row.sec, 'attemptAny', e.target.value === '' ? 0 : Math.max(0, parseInt(e.target.value) || 0))}
                        className={`h-6 w-10 text-center text-xs font-700 border rounded-md bg-white outline-none focus:ring-1 ${isConstrained ? 'border-amber-300 text-amber-800 focus:ring-amber-300' : 'border-border text-foreground focus:ring-primary/40'}`}
                      />
                      <span className="text-[11px] text-muted-foreground">of {row.detectedQCount} qs</span>
                    </div>
                  </div>
                  {/* Formula */}
                  <p className={`text-[10px] font-600 ${isConstrained ? 'text-amber-600' : 'text-muted-foreground'}`}>
                    → {attemptCount} × {row.marksPerQ}m = <span className="font-700">{sectionTotal}m</span>
                    {isConstrained && <span className="font-400 text-amber-500 ml-1">(out of {row.detectedQCount * row.marksPerQ}m)</span>}
                  </p>
                </div>

                {/* Section Total */}
                <div className={`flex flex-col items-center justify-center py-2 rounded-xl border ${isConstrained ? 'bg-amber-50 border-amber-200' : 'bg-primary/5 border-primary/15'}`}>
                  <span className={`text-base font-700 ${isConstrained ? 'text-amber-700' : 'text-primary'}`}>{sectionTotal}m</span>
                  <span className="text-[10px] text-muted-foreground mt-0.5">
                    {isConstrained ? `${row.attemptAny} of ${row.detectedQCount} qs` : `all ${row.detectedQCount} qs`}
                  </span>
                </div>

                {/* Delete */}
                <button onClick={() => removeSection(row.sec)}
                  disabled={rows.length <= 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-30"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            );
          })}
        </div>

        {/* Totals row */}
        {(() => {
          const totalQs       = rows.reduce((s, r) => s + r.detectedQCount, 0);
          const attemptedQs   = rows.reduce((s, r) => s + (r.attemptAny > 0 ? r.attemptAny : r.detectedQCount), 0);
          const examMarks     = rows.reduce((s, r) => s + (r.attemptAny > 0 ? r.attemptAny : r.detectedQCount) * r.marksPerQ, 0);
          const allMarks      = rows.reduce((s, r) => s + r.detectedQCount * r.marksPerQ, 0);
          const hasConstraints = rows.some((r) => r.attemptAny > 0);
          return (
            <div className="grid grid-cols-[44px_1fr_88px_84px_200px_80px_32px] gap-2 items-center px-5 py-3 bg-muted/30 border-t border-border">
              <span />
              <span className="text-xs font-700 text-muted-foreground uppercase tracking-wider">Paper Total</span>
              {/* Available total */}
              <div className="flex flex-col items-center">
                <span className="text-sm font-700 text-foreground">{totalQs} qs</span>
                <span className="text-[10px] text-muted-foreground">available</span>
              </div>
              <span />
              {/* Attempt summary */}
              <div className="flex flex-col gap-0.5 px-3">
                <span className="text-xs font-700 text-foreground">
                  {hasConstraints ? `${attemptedQs} of ${totalQs} qs to attempt` : `All ${totalQs} qs required`}
                </span>
                {hasConstraints && allMarks !== examMarks && (
                  <span className="text-[10px] text-muted-foreground">→ {examMarks}m out of {allMarks}m total</span>
                )}
              </div>
              {/* Exam total marks */}
              <div className="flex flex-col items-center">
                <span className="text-base font-700 text-primary">{examMarks}m</span>
                <span className="text-[10px] text-muted-foreground">exam total</span>
              </div>
              <span />
            </div>
          );
        })()}

        {/* Hint */}
        <div className="flex items-start gap-2.5 px-5 py-3 bg-amber-50 border-t border-amber-100 text-xs text-amber-800">
          <AlertTriangle size={13} className="shrink-0 mt-0.5" />
          <p><strong>Verify:</strong> AI has pre-filled sections from your paper. Edit any value if it doesn&apos;t match. In <strong>Attempt Rule</strong>, type how many questions must be answered (leave blank = all required). Amber = constrained by &quot;attempt any&quot;; Blue = all required.</p>
        </div>
      </div>

      {/* Questions by section (expandable) */}
      <div className="bg-card border border-border rounded-xl overflow-hidden mb-6">
        <div className="px-5 py-3 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-primary" />
            <span className="font-600 text-foreground text-sm">Extracted Questions</span>
          </div>
          <span className="text-xs text-muted-foreground">
            {paper.questions.filter((q) => !q.parentQNo).length} questions
            {paper.questions.some((q) => q.parentQNo) && ` · ${paper.questions.length} entries`}
          </span>
        </div>

        {rows.map((row) => {
          const sec = row.sec;
          const qs = questionsBySection[sec] || [];
          // Main questions only — OR alternatives don't add marks/count
          const mainQs = qs.filter((q) => !q.isChoiceAlt);
          const orCount = qs.filter((q) => q.isChoiceAlt).length;
          const sectionMarks = (row.attemptAny > 0 ? row.attemptAny : mainQs.length) * row.marksPerQ;
          const isExpanded = expandedSection === sec || expandedSection === null;

          // Group questions: each main question + its OR alternative (if any)
          type QGroup = { main: ExtractedQuestion; orAlt: ExtractedQuestion | null };
          const grouped: QGroup[] = mainQs.map((main) => ({
            main,
            orAlt: qs.find((alt) => alt.isChoiceAlt && alt.qNo === main.qNo + 'OR') ?? null,
          }));

          return (
            <div key={sec} className="border-b border-border last:border-0">
              <button
                onClick={() => setExpandedSection(isExpanded && expandedSection === sec ? null : sec)}
                className="w-full flex items-center justify-between px-5 py-3 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-700 text-primary">{sec}</span>
                  <span className="font-600 text-foreground text-sm">Section {sec}{row.label ? ` — ${row.label}` : ''}</span>
                  <span className="text-xs text-muted-foreground">
                    {mainQs.length} questions
                    {orCount > 0 && <span className="ml-1 text-amber-600 font-600">· {orCount} with OR choice</span>}
                    {' · '}{sectionMarks}m
                    {row.attemptAny > 0 && <span className="ml-1.5 text-warning font-600">(Answer any {row.attemptAny})</span>}
                  </span>
                </div>
                {expandedSection === sec
                  ? <ChevronUp size={16} className="text-muted-foreground" />
                  : <ChevronDown size={16} className="text-muted-foreground" />
                }
              </button>

              {(expandedSection === sec || expandedSection === null) && (
                <div className="divide-y divide-border">
                  {grouped.map(({ main, orAlt }) => (
                    <div key={main.qNo}>
                      {/* If this question has an OR alternative, wrap both in a choice container */}
                      {orAlt ? (
                        <div className="mx-4 my-2 border border-amber-200 rounded-xl overflow-hidden">
                          {/* Choice header */}
                          <div className="px-4 py-1.5 bg-amber-50 border-b border-amber-200 flex items-center gap-2">
                            <span className="text-[10px] font-700 text-amber-700 uppercase tracking-wide">Student attempts ONE of the following</span>
                            <span className="text-[10px] text-amber-500">({main.maxMarks}m — pick either option)</span>
                          </div>
                          {/* Main question (option A) */}
                          <div className={`flex items-start gap-4 px-4 py-3 bg-white ${main.parentQNo ? 'pl-8' : ''}`}>
                            <span className="text-xs font-700 text-foreground w-12 shrink-0 pt-0.5">Q.{main.qNo}</span>
                            <p className="flex-1 text-sm text-foreground leading-relaxed">{main.questionText}</p>
                            <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                              {main.parentQNo && <span className="text-[10px] font-600 px-1.5 py-0.5 rounded bg-muted text-muted-foreground">sub-part</span>}
                              <span className={`text-xs font-600 px-2 py-0.5 rounded-full ${typeColors[main.type] || 'bg-muted text-muted-foreground'}`}>{main.type}</span>
                              <span className="text-xs font-700 text-foreground bg-muted px-2 py-0.5 rounded-full">{main.maxMarks}m</span>
                            </div>
                          </div>
                          {/* OR divider */}
                          <div className="flex items-center gap-3 px-4 py-1 bg-amber-50 border-y border-amber-100">
                            <span className="text-xs font-700 text-amber-700">OR</span>
                            <div className="flex-1 border-t border-amber-200" />
                            <span className="text-[10px] text-amber-500">choose this instead</span>
                          </div>
                          {/* OR alternative (option B) */}
                          <div className="flex items-start gap-4 px-4 py-3 bg-amber-50/30">
                            <span className="text-xs font-700 text-amber-600 w-12 shrink-0 pt-0.5">Q.{orAlt.qNo.replace('OR', '')}b</span>
                            <p className="flex-1 text-sm text-foreground leading-relaxed">{orAlt.questionText}</p>
                            <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                              <span className="text-[10px] font-700 px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">OR CHOICE</span>
                              <span className={`text-xs font-600 px-2 py-0.5 rounded-full ${typeColors[orAlt.type] || 'bg-muted text-muted-foreground'}`}>{orAlt.type}</span>
                              <span className="text-xs font-700 text-foreground bg-muted px-2 py-0.5 rounded-full">{orAlt.maxMarks}m</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Regular question — no OR alternative */
                        <div className={`flex items-start gap-4 px-5 py-3 hover:bg-muted/10 transition-colors ${main.parentQNo ? 'pl-10 bg-muted/5' : ''}`}>
                          <span className="text-xs font-700 text-foreground w-12 shrink-0 pt-0.5">Q.{main.qNo}</span>
                          <p className="flex-1 text-sm text-foreground leading-relaxed">{main.questionText}</p>
                          <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                            {main.parentQNo && <span className="text-[10px] font-600 px-1.5 py-0.5 rounded bg-muted text-muted-foreground">sub-part</span>}
                            <span className={`text-xs font-600 px-2 py-0.5 rounded-full ${typeColors[main.type] || 'bg-muted text-muted-foreground'}`}>{main.type}</span>
                            <span className="text-xs font-700 text-foreground bg-muted px-2 py-0.5 rounded-full">{main.maxMarks}m</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button onClick={onReset}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors px-4 py-2 rounded-lg hover:bg-muted"
        >
          <RotateCcw size={14} /> Analyze Another Paper
        </button>
        <Link href="/answer-sheet-evaluator" onClick={onProceed}
          className="flex items-center gap-2 bg-primary text-primary-foreground font-600 text-sm px-6 py-2.5 rounded-xl hover:bg-primary/90 transition-colors"
        >
          Proceed to Evaluate Answer Sheet <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
