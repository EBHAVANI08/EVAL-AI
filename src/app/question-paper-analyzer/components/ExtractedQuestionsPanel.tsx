'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, ArrowRight, RotateCcw, BookOpen, Clock, Award, Hash, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import type { ExtractedPaper, ExtractedQuestion } from './QuestionPaperAnalyzerClient';

interface Props {
  paper: ExtractedPaper;
  fileName: string;
  onReset: () => void;
  onProceed: () => void;
}

const typeColors: Record<string, string> = {
  theory: 'bg-blue-50 text-blue-700',
  numerical: 'bg-purple-50 text-purple-700',
  diagram: 'bg-orange-50 text-orange-700',
  mcq: 'bg-green-50 text-green-700',
  short: 'bg-gray-100 text-gray-700',
};

export default function ExtractedQuestionsPanel({ paper, fileName, onReset, onProceed }: Props) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const sections = paper.metadata.sections.length > 0
    ? paper.metadata.sections
    : [...new Set(paper.questions.map((q) => q.section))];

  const questionsBySection = sections.reduce<Record<string, ExtractedQuestion[]>>((acc, sec) => {
    acc[sec] = paper.questions.filter((q) => q.section === sec);
    return acc;
  }, {});

  return (
    <div className="max-w-4xl mx-auto">
      {/* Success banner */}
      <div className="flex items-center gap-3 p-4 bg-positive-bg border border-positive/20 rounded-xl mb-6">
        <CheckCircle2 size={20} className="text-positive shrink-0" />
        <div className="flex-1">
          <p className="font-600 text-foreground text-sm">Question paper analyzed successfully</p>
          <p className="text-xs text-muted-foreground mt-0.5">{fileName} · {paper.questions.length} questions extracted</p>
        </div>
        <Link
          href="/answer-sheet-evaluator"
          onClick={onProceed}
          className="flex items-center gap-1.5 bg-primary text-primary-foreground text-sm font-600 px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors shrink-0"
        >
          Evaluate Answer Sheet
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* Metadata cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { icon: BookOpen, label: 'Subject', value: paper.metadata.subject },
          { icon: Hash, label: 'Class', value: paper.metadata.class },
          { icon: Award, label: 'Total Marks', value: String(paper.metadata.totalMarks) },
          { icon: Clock, label: 'Duration', value: paper.metadata.duration },
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

      {/* Questions by section */}
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
            ? Math.round(constraint.attemptAny * (totalSectionMarks / qs.length) * 100) / 100
            : totalSectionMarks;
          const isExpanded = expandedSection === sec || expandedSection === null;

          return (
            <div key={sec} className="border-b border-border last:border-0">
              <button
                onClick={() => setExpandedSection(isExpanded && expandedSection === sec ? null : sec)}
                className="w-full flex items-center justify-between px-5 py-3 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-700 text-primary">
                    {sec}
                  </span>
                  <span className="font-600 text-foreground text-sm">Section {sec}</span>
                  <span className="text-xs text-muted-foreground">
                    {qs.length} questions · {effectiveMarks} marks
                    {constraint && (
                      <span className="ml-1.5 text-warning font-600">
                        (Answer any {constraint.attemptAny})
                      </span>
                    )}
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
                        <span className={`text-xs font-600 px-2 py-0.5 rounded-full ${typeColors[q.type] || 'bg-muted text-muted-foreground'}`}>
                          {q.type}
                        </span>
                        <span className="text-xs font-700 text-foreground bg-muted px-2 py-0.5 rounded-full">
                          {q.maxMarks}m
                        </span>
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
        <button
          onClick={onReset}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors px-4 py-2 rounded-lg hover:bg-muted"
        >
          <RotateCcw size={14} />
          Analyze Another Paper
        </button>
        <Link
          href="/answer-sheet-evaluator"
          onClick={onProceed}
          className="flex items-center gap-2 bg-primary text-primary-foreground font-600 text-sm px-6 py-2.5 rounded-xl hover:bg-primary/90 transition-colors"
        >
          Proceed to Evaluate Answer Sheet
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
