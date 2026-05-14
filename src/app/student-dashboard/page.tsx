'use client';

import React from 'react';
import { Eye, Search, Filter, FileText, Award, TrendingUp, ClipboardList } from 'lucide-react';

const stats = [
  { label: 'Papers Evaluated', value: '0', icon: FileText, color: 'text-orange-500', bg: 'bg-orange-50' },
  { label: 'Average Score', value: '—', icon: Award, color: 'text-amber-500', bg: 'bg-amber-50' },
  { label: 'Best Subject', value: '—', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
  { label: 'Pending Review', value: '0', icon: ClipboardList, color: 'text-blue-500', bg: 'bg-blue-50' },
];

const results = [
  { subject: 'Physics', exam: 'Unit Test 1', date: '—', score: '—', total: '—', grade: '—' },
];

export default function StudentDashboardPage() {
  return (
    <div className="px-8 py-6 max-w-screen-xl mx-auto">
      {/* Welcome banner */}
      <div className="mb-6 p-5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white">
        <h2 className="text-xl font-bold mb-1">Welcome back, Student!</h2>
        <p className="text-white/80 text-sm">
          Your evaluated answer sheets and performance insights will appear here once your teacher completes the evaluation.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-card border border-border rounded-2xl p-5">
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                <Icon size={20} className={s.color} />
              </div>
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Results table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="font-bold text-foreground text-sm">My Evaluated Results</h3>
            <p className="text-xs text-muted-foreground mt-0.5">All evaluated answer sheets will appear here</p>
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

        {/* Table header */}
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
            <span className="text-xs font-bold px-2 py-0.5 rounded-full w-fit bg-muted text-muted-foreground">{r.grade}</span>
            <button className="flex items-center gap-1 text-xs text-primary hover:underline">
              <Eye size={12} /> View
            </button>
          </div>
        ))}

        <div className="px-6 py-12 text-center">
          <ClipboardList size={32} className="text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground font-semibold">No evaluated papers yet</p>
          <p className="text-xs text-muted-foreground mt-1">Your teacher will share results here after evaluation</p>
        </div>
      </div>
    </div>
  );
}
