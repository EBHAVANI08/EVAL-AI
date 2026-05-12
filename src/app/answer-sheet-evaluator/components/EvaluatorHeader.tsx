import React from 'react';
import Link from 'next/link';
import { ChevronLeft, LayoutDashboard } from 'lucide-react';

export default function EvaluatorHeader() {
  return (
    <div className="px-6 lg:px-8 xl:px-10 2xl:px-12 py-4 bg-card border-b border-border flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        <Link
          href="/teacher-dashboard"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft size={16} />
          <span>Dashboard</span>
        </Link>
        <span className="text-muted-foreground/40">/</span>
        <span className="text-sm font-600 text-foreground">Answer Sheet Evaluator</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 bg-positive-bg text-positive text-xs font-600 px-3 py-1.5 rounded-lg">
          <span className="w-1.5 h-1.5 rounded-full bg-positive inline-block animate-pulse" />
          AI Engine Active
        </div>
        <Link
          href="/teacher-dashboard"
          className="flex items-center gap-1.5 text-sm font-600 text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg hover:bg-muted transition-colors"
        >
          <LayoutDashboard size={14} />
          <span className="hidden sm:inline">Back to Dashboard</span>
        </Link>
      </div>
    </div>
  );
}