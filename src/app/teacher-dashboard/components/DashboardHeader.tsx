'use client';

import React from 'react';
import Link from 'next/link';
import { Plus, Upload, Lightbulb, RefreshCw } from 'lucide-react';

export default function DashboardHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
      <div>
        <h1 className="page-title">Teacher Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1 font-500">
          Manage evaluations, review AI scores, and track student progress.
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0 flex-wrap">
        <button className="btn-ghost h-9 px-3 text-sm gap-1.5">
          <RefreshCw size={14} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
        <button className="btn-ghost h-9 px-3 text-sm gap-1.5">
          <Upload size={14} />
          <span>Upload Paper</span>
        </button>
        <button className="btn-secondary h-9 px-3 text-sm gap-1.5" style={{ color: 'var(--accent)', backgroundColor: 'rgba(6,182,212,0.10)' }}>
          <Lightbulb size={14} />
          <span>Generate Answers</span>
        </button>
        <Link href="/answer-sheet-evaluator" className="btn-primary h-9 px-4 text-sm gap-1.5">
          <Plus size={14} />
          <span>New Evaluation</span>
        </Link>
      </div>
    </div>
  );
}
