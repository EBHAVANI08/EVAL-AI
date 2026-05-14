'use client';

import React, { useState } from 'react';
import { BookOpen, Calendar, Hash, Globe, CheckCircle2, Clock, Camera, X, ZoomIn } from 'lucide-react';
import type { QuestionEvaluation, StudentInfo } from './EvaluatorWorkspace';
import StatusBadge from '@/components/ui/StatusBadge';


interface StudentInfoPanelProps {
  questions: QuestionEvaluation[];
  activeSection: string;
  setActiveSection: (s: string) => void;
  sections: string[];
  studentInfo: StudentInfo;
  scannedImages?: string[];
}

export default function StudentInfoPanel({ questions, activeSection, setActiveSection, sections, studentInfo, scannedImages = [] }: StudentInfoPanelProps) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const reviewed = questions.filter((q) => q.teacherScore !== null || q.status === 'reviewed').length;
  const flagged = questions.filter((q) => q.status === 'flagged').length;
  const progress = Math.round((reviewed / questions.length) * 100);
  const initials = studentInfo.name
    ? studentInfo.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '—';

  return (
    <aside className="w-full lg:w-64 xl:w-72 lg:shrink-0 border-r border-border bg-card overflow-y-auto scrollbar-thin">
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

        {/* Scanned pages (camera captures saved with evaluation) */}
        {scannedImages.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center gap-2 mb-2">
              <Camera size={13} className="text-primary" />
              <p className="text-xs font-600 text-muted-foreground uppercase tracking-wider">
                Scanned Pages ({scannedImages.length})
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {scannedImages.map((src, idx) => (
                <button
                  key={idx}
                  onClick={() => setLightboxIdx(idx)}
                  className="relative group w-16 h-20 rounded-lg overflow-hidden border border-border hover:border-primary transition-colors"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={`Page ${idx + 1}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <ZoomIn size={14} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <span className="absolute bottom-0.5 right-1 text-xs font-700 text-white drop-shadow">{idx + 1}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxIdx !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
          onClick={() => setLightboxIdx(null)}
        >
          <div className="relative max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-white text-sm font-600">Page {lightboxIdx + 1} of {scannedImages.length}</span>
              <button onClick={() => setLightboxIdx(null)} className="text-white hover:text-gray-300">
                <X size={20} />
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={scannedImages[lightboxIdx]} alt={`Page ${lightboxIdx + 1}`} className="w-full rounded-xl border border-border" />
            {scannedImages.length > 1 && (
              <div className="flex justify-center gap-3 mt-3">
                <button
                  disabled={lightboxIdx === 0}
                  onClick={() => setLightboxIdx((i) => Math.max(0, (i ?? 0) - 1))}
                  className="px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm disabled:opacity-30 transition-colors"
                >
                  ← Prev
                </button>
                <button
                  disabled={lightboxIdx === scannedImages.length - 1}
                  onClick={() => setLightboxIdx((i) => Math.min(scannedImages.length - 1, (i ?? 0) + 1))}
                  className="px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm disabled:opacity-30 transition-colors"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
