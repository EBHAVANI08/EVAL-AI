'use client';

import React from 'react';
import { BookOpen, Calendar, Hash, Globe, CheckCircle2, Clock } from 'lucide-react';
import type { QuestionEvaluation, StudentInfo } from './EvaluatorWorkspace';
import StatusBadge from '@/components/ui/StatusBadge';


interface StudentInfoPanelProps {
  questions: QuestionEvaluation[];
  activeSection: string;
  setActiveSection: (s: string) => void;
  sections: string[];
  studentInfo: StudentInfo;
}

export default function StudentInfoPanel({ questions, activeSection, setActiveSection, sections, studentInfo }: StudentInfoPanelProps) {
  const reviewed = questions.filter((q) => q.teacherScore !== null || q.status === 'reviewed').length;
  const flagged = questions.filter((q) => q.status === 'flagged').length;
  const progress = Math.round((reviewed / questions.length) * 100);
  const initials = studentInfo.name
    ? studentInfo.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '—';

  return (
    <aside className="w-64 xl:w-72 shrink-0 border-r border-border bg-card overflow-y-auto scrollbar-thin">
      {/* Student card */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
            <span className="text-sm font-bold text-primary">{initials}</span>
          </div>
          <div>
            <p className="text-sm font-700 text-foreground">{studentInfo.name || '—'}</p>
            <p className="text-xs text-muted-foreground">{studentInfo.rollNo || 'No roll number'}</p>
          </div>
        </div>
        <StatusBadge variant="review" />

        <div className="mt-3 space-y-2">
          {[
            { icon: BookOpen, label: 'Subject', value: studentInfo.subject },
            { icon: Hash, label: 'Class', value: studentInfo.class },
            { icon: Globe, label: 'Board', value: studentInfo.board },
            { icon: Calendar, label: 'School', value: studentInfo.school },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={`info-${item.label}`} className="flex items-center gap-2">
                <Icon size={13} className="text-muted-foreground shrink-0" />
                <span className="text-xs text-muted-foreground">{item.label}:</span>
                <span className="text-xs font-600 text-foreground">{item.value || '—'}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-600 text-muted-foreground uppercase tracking-wider">Review Progress</p>
          <span className="text-xs font-700 text-foreground font-tabular">{progress}%</span>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-2">
          <div className="flex items-center gap-1">
            <CheckCircle2 size={11} className="text-positive" />
            <span className="text-xs text-muted-foreground">{reviewed} reviewed</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={11} className="text-warning" />
            <span className="text-xs text-muted-foreground">{questions.length - reviewed} left</span>
          </div>
        </div>
        {flagged > 0 && (
          <div className="mt-2 bg-warning-bg border border-warning/30 rounded-lg px-3 py-2 flex items-center gap-2">
            <span className="text-xs font-600 text-amber-700">{flagged} questions flagged for review</span>
          </div>
        )}
      </div>

      {/* Section navigator */}
      <div className="p-4">
        <p className="text-xs font-600 text-muted-foreground uppercase tracking-wider mb-2">Sections</p>
        <div className="space-y-1">
          {sections.map((sec) => {
            const count = sec === 'all' ? questions.length : questions.filter((q) => q.section === sec).length;
            const reviewedInSec = sec === 'all'
              ? reviewed
              : questions.filter((q) => q.section === sec && (q.teacherScore !== null || q.status === 'reviewed')).length;
            const isActive = activeSection === sec;
            return (
              <button
                key={`sec-${sec}`}
                onClick={() => setActiveSection(sec)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive ? 'bg-secondary text-primary font-600' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <span>{sec === 'all' ? 'All Questions' : `Section ${sec}`}</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-tabular">{reviewedInSec}/{count}</span>
                  {reviewedInSec === count && (
                    <CheckCircle2 size={11} className="text-positive" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Paper info */}
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs font-600 text-muted-foreground uppercase tracking-wider mb-2">Question Paper</p>
          <div className="bg-muted rounded-xl p-3">
            <div className="flex items-start gap-2">
              <BookOpen size={14} className="text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-600 text-foreground leading-tight">{studentInfo.subject || 'Unknown subject'}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {questions.length} questions · {questions.reduce((a, q) => a + q.maxMarks, 0)} total marks
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
