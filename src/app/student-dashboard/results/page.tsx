'use client';

import React from 'react';
import { Eye, Search, Filter, ClipboardList, Clock } from 'lucide-react';

const results = [
  { subject: 'Physics', exam: 'Unit Test 1', date: '—', score: '—', total: '—', grade: '—', status: 'Pending' },
];

export default function ResultsPage() {
  return (
    <div className="px-8 py-6 max-w-screen-xl mx-auto">
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="font-bold text-foreground text-sm">All Evaluated Results</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Your complete evaluation history</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 text-xs text-muted-foreground border border-border px-3 py-1.5 rounded-lg hover:bg-muted transition-colors">
              <Search size={12} /> Search
            </button>
            <button className="flex items-center gap-1.5 text-xs text-muted-foreground border border-border px-3 py-1.5 rounded-lg hover:bg-muted transition-colors">
              <Filter size={12} /> Filter
            </button>
          </div>
        </div>

        <div className="px-6 py-3 bg-muted/40 border-b border-border grid grid-cols-6 gap-4">
          {['Subject', 'Exam', 'Date', 'Score', 'Grade', 'Action'].map((h) => (
            <span key={h} className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</span>
          ))}
        </div>

        {results.map((r, i) => (
          <div key={i} className="px-6 py-4 grid grid-cols-6 gap-4 items-center border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
            <span className="text-sm font-semibold text-foreground">{r.subject}</span>
            <span className="text-sm text-muted-foreground">{r.exam}</span>
            <span className="text-sm text-muted-foreground">{r.date}</span>
            <span className="text-sm font-bold text-foreground">{r.score}/{r.total}</span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full w-fit">
              <Clock size={10} /> {r.status}
            </span>
            <button className="flex items-center gap-1 text-xs text-primary hover:underline">
              <Eye size={12} /> View
            </button>
          </div>
        ))}

        <div className="px-6 py-14 text-center">
          <ClipboardList size={32} className="text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground font-semibold">No evaluated papers yet</p>
          <p className="text-xs text-muted-foreground mt-1">Your teacher will share results here after evaluation</p>
        </div>
      </div>
    </div>
  );
}
