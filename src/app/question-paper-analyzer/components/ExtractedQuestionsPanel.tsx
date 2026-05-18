'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2, ArrowRight, RotateCcw, BookOpen, Clock, Award, Hash,
  ChevronDown, ChevronUp, FileText, Pencil, Save, X, Plus, Trash2,
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
  theory:    'bg-blue-50 text-blue-700',
  numerical: 'bg-purple-50 text-purple-700',
  diagram:   'bg-orange-50 text-orange-700',
  mcq:       'bg-green-50 text-green-700',
  short:     'bg-gray-100 text-gray-700',
};

export default function ExtractedQuestionsPanel({ paper, sectionConfig, fileName, onReset, onUpdate, onProceed }: Props) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [editingSec, setEditingSec] = useState<string | null>(null);
  // Per-section override: section name → marks per question
  const [secMarksOverride, setSecMarksOverride] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    sectionConfig.forEach((s) => { init[s.name] = s.marksPerQ; });
    return init;
  });

  const sections = paper.metadata.sections.length > 0
    ? paper.metadata.sections
    : [...new Set(paper.questions.map((q) => q.section))];

  const questionsBySection = sections.reduce<Record<string, ExtractedQuestion[]>>((acc, sec) => {
    acc[sec] = paper.questions.filter((q) => q.section === sec);
    return acc;
  }, {});

  // Apply per-section mark override to all questions in that section
  const applyOverride = (sec: string, newMarksPerQ: number) => {
    const updated: ExtractedPaper = {
      ...paper,
      questions: paper.questions.map((q) =>
        q.section === sec ? { ...q, maxMarks: newMarksPerQ } : q
      ),
    };
    onUpdate(updated);
    setSecMarksOverride((prev) => ({ ...prev, [sec]: newMarksPerQ }));
    setEditingSec(null);
  };

  // Remove an entire section
  const removeSection = (sec: string) => {
    const updated: ExtractedPaper = {
      ...paper,
      metadata: {
        ...paper.metadata,
        sections: paper.metadata.sections.filter((s) => s !== sec),
        totalMarks: paper.questions.filter((q) => q.section !== sec).reduce((s, q) => s + q.maxMarks, 0),
      },
      questions: paper.questions.filter((q) => q.section !== sec),
    };
    onUpdate(updated);
  };

  // Add a blank new section
  const addSection = () => {
    const used = new Set(paper.metadata.sections);
    const next = 'ABCDEFGHIJ'.split('').find((c) => !used.has(c)) ?? 'Z';
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
          <p className="text-xs text-muted-foreground mt-0.5">{fileName} · {paper.questions.length} questions extracted</p>
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
          { icon: Award,    label: 'Total Marks', value: String(paper.questions.reduce((s, q) => s + q.maxMarks, 0)) },
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

      {/* Section overview — editable mark cards */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden mb-6">
        <div className="px-5 py-3 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award size={15} className="text-primary" />
            <span className="font-600 text-foreground text-sm">Section Mark Configuration</span>
          </div>
          <button onClick={addSection}
            className="flex items-center gap-1.5 text-xs font-600 text-primary hover:bg-primary/10 px-2.5 py-1 rounded-lg transition-colors"
          >
            <Plus size={12} /> Add Section
          </button>
        </div>

        <div className="divide-y divide-border">
          {sections.map((sec) => {
            const qs = questionsBySection[sec] || [];
            const constraint = paper.metadata.sectionConstraints?.[sec];
            const marksPerQ = secMarksOverride[sec] ?? (qs[0]?.maxMarks ?? 1);
            const totalSectionMarks = qs.reduce((s, q) => s + q.maxMarks, 0);
            const isEditing = editingSec === sec;

            return (
              <div key={sec} className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/20 transition-colors">
                {/* Section badge */}
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-700 text-primary">{sec}</span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-600 text-foreground">
                    Section {sec}
                    {sectionConfig.find((s) => s.name === sec)?.label && (
                      <span className="ml-2 text-xs font-500 text-muted-foreground">
                        {sectionConfig.find((s) => s.name === sec)?.label}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {qs.length} question{qs.length !== 1 ? 's' : ''}
                    {constraint && <span className="ml-1.5 text-warning font-600">(Attempt any {constraint.attemptAny})</span>}
                  </p>
                </div>

                {/* Marks editor */}
                <div className="flex items-center gap-2 shrink-0">
                  {isEditing ? (
                    <>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number" min={0.5} max={50} step={0.5}
                          defaultValue={marksPerQ}
                          id={`marks-${sec}`}
                          className="w-16 h-8 text-center text-sm font-700 border border-primary rounded-lg outline-none bg-background text-foreground focus:ring-2 focus:ring-primary/30"
                        />
                        <span className="text-xs text-muted-foreground">m/q</span>
                      </div>
                      <button
                        onClick={() => {
                          const el = document.getElementById(`marks-${sec}`) as HTMLInputElement | null;
                          applyOverride(sec, parseFloat(el?.value ?? String(marksPerQ)));
                        }}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
                      >
                        <Save size={12} />
                      </button>
                      <button onClick={() => setEditingSec(null)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-muted text-muted-foreground hover:bg-muted/70 transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="text-right">
                        <span className="text-sm font-700 text-foreground">{totalSectionMarks}m</span>
                        <p className="text-[10px] text-muted-foreground">{marksPerQ}m/q</p>
                      </div>
                      <button onClick={() => setEditingSec(sec)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                        title="Edit marks per question"
                      >
                        <Pencil size={12} />
                      </button>
                      <button onClick={() => removeSection(sec)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Remove section"
                      >
                        <Trash2 size={12} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Questions by section (expandable) */}
      <div className="bg-card border border-border rounded-xl overflow-hidden mb-6">
        <div className="px-5 py-3 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-primary" />
            <span className="font-600 text-foreground text-sm">Extracted Questions</span>
          </div>
          <span className="text-xs text-muted-foreground">{paper.questions.length} total questions</span>
        </div>

        {sections.map((sec) => {
          const qs = questionsBySection[sec] || [];
          const totalSectionMarks = qs.reduce((sum, q) => sum + q.maxMarks, 0);
          const constraint = paper.metadata.sectionConstraints?.[sec];
          const effectiveMarks = constraint
            ? Math.round(constraint.attemptAny * (totalSectionMarks / Math.max(qs.length, 1)) * 100) / 100
            : totalSectionMarks;
          const isExpanded = expandedSection === sec || expandedSection === null;

          return (
            <div key={sec} className="border-b border-border last:border-0">
              <button
                onClick={() => setExpandedSection(isExpanded && expandedSection === sec ? null : sec)}
                className="w-full flex items-center justify-between px-5 py-3 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-700 text-primary">{sec}</span>
                  <span className="font-600 text-foreground text-sm">Section {sec}</span>
                  <span className="text-xs text-muted-foreground">
                    {qs.length} questions · {effectiveMarks} marks
                    {constraint && <span className="ml-1.5 text-warning font-600">(Answer any {constraint.attemptAny})</span>}
                  </span>
                </div>
                {expandedSection === sec
                  ? <ChevronUp size={16} className="text-muted-foreground" />
                  : <ChevronDown size={16} className="text-muted-foreground" />
                }
              </button>

              {(expandedSection === sec || expandedSection === null) && (
                <div className="divide-y divide-border">
                  {qs.map((q) => (
                    <div key={q.qNo} className="flex items-start gap-4 px-5 py-3 hover:bg-muted/10 transition-colors">
                      <span className="text-xs font-700 text-foreground w-10 shrink-0 pt-0.5">Q.{q.qNo}</span>
                      <p className="flex-1 text-sm text-foreground leading-relaxed">{q.questionText}</p>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-xs font-600 px-2 py-0.5 rounded-full ${typeColors[q.type] || 'bg-muted text-muted-foreground'}`}>{q.type}</span>
                        <span className="text-xs font-700 text-foreground bg-muted px-2 py-0.5 rounded-full">{q.maxMarks}m</span>
                      </div>
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
