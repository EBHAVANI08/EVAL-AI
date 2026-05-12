'use client';

import React from 'react';
import Link from 'next/link';
import { Plus, Upload, Lightbulb, RefreshCw } from 'lucide-react';

export default function DashboardHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="page-title">Teacher Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage evaluations, review AI scores, and track student progress.
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0 flex-wrap">
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-600 text-muted-foreground hover:bg-muted border border-border transition-colors">
          <RefreshCw size={14} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-600 btn-secondary border border-primary/30">
          <Upload size={14} />
          <span>Upload Paper</span>
        </button>
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-600 text-white bg-accent hover:bg-cyan-600 transition-colors active:scale-95">
          <Lightbulb size={14} />
          <span>Generate Answers</span>
        </button>
        <Link
          href="/answer-sheet-evaluator"
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-600 btn-primary"
        >
          <Plus size={14} />
          <span>New Evaluation</span>
        </Link>
      </div>
    </div>
  );
}