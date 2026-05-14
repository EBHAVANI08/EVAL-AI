'use client';

import React, { useState, useEffect } from 'react';
import { Eye, Search, Filter, FileText, Award, TrendingUp, ClipboardList, Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function StudentDashboardPage() {
  const { data: session } = useSession();
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const rollNo = (session?.user as any)?.rollNo;
    if (!rollNo) {
      if (session) setLoading(false);
      return;
    }

    fetch(`/api/evaluations?rollNo=${rollNo}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.evaluations) setEvaluations(data.evaluations);
      })
      .catch((err) => console.error('Student results fetch error:', err))
      .finally(() => setLoading(false));
  }, [session]);

  const stats = [
    { label: 'Papers Evaluated', value: String(evaluations.length), icon: FileText, color: 'text-orange-500', bg: 'bg-orange-50' },
    { 
      label: 'Average Score', 
      value: evaluations.length > 0 
        ? `${Math.round(evaluations.reduce((s, e) => s + (e.obtained / e.maxMarks) * 100, 0) / evaluations.length)}%` 
        : '—', 
      icon: Award, 
      color: 'text-amber-500', 
      bg: 'bg-amber-50' 
    },
    { 
      label: 'Best Subject', 
      value: evaluations.length > 0 
        ? evaluations.sort((a, b) => (b.obtained/b.maxMarks) - (a.obtained/a.maxMarks))[0].subject 
        : '—', 
      icon: TrendingUp, 
      color: 'text-green-600', 
      bg: 'bg-green-50' 
    },
    { label: 'Pending Review', value: String(evaluations.filter(e => e.status === 'review').length), icon: ClipboardList, color: 'text-blue-500', bg: 'bg-blue-50' },
  ];

  return (
    <div className="px-8 py-6 max-w-screen-xl mx-auto">
      {/* Welcome banner */}
      <div className="mb-6 p-6 rounded-2xl bg-gradient-to-r from-primary via-indigo-600 to-blue-700 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-1">Welcome back, {session?.user?.name || 'Student'}!</h2>
          <p className="text-white/80 text-sm max-w-lg">
            Your evaluated answer sheets and performance insights appear here. Track your progress across all subjects.
          </p>
        </div>
        <Award className="absolute right-6 top-1/2 -translate-y-1/2 w-24 h-24 text-white/10" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                <Icon size={20} className={s.color} />
              </div>
              <p className="text-2xl font-bold text-foreground">{loading ? '...' : s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Results table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="font-bold text-foreground text-sm">My Evaluated Results</h3>
            <p className="text-xs text-muted-foreground mt-0.5">All evaluated answer sheets will appear here</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 text-xs text-muted-foreground border border-border px-3 py-1.5 rounded-lg hover:bg-muted transition-colors">
              <Search size={12} /> Search
            </button>
          </div>
        </div>

        {loading ? (
          <div className="px-6 py-20 text-center">
            <Loader2 size={32} className="animate-spin text-primary/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Fetching your results...</p>
          </div>
        ) : evaluations.length === 0 ? (
          <div className="px-6 py-20 text-center">
            <ClipboardList size={40} className="text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-sm font-semibold text-muted-foreground">No evaluated papers yet</p>
            <p className="text-xs text-muted-foreground mt-1">Results will appear here after your teacher completes the evaluation.</p>
          </div>
        ) : (
          <>
            <div className="px-6 py-3 bg-muted/40 border-b border-border grid grid-cols-6 gap-4">
              {['Subject', 'Exam', 'Date', 'Score', 'Status', 'Action'].map((h) => (
                <span key={h} className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</span>
              ))}
            </div>
            {evaluations.map((r, i) => (
              <div key={i} className="px-6 py-4 grid grid-cols-6 gap-4 items-center border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                <span className="text-sm font-semibold text-foreground">{r.subject}</span>
                <span className="text-sm text-muted-foreground">Term Evaluation</span>
                <span className="text-sm text-muted-foreground">{r.submittedAt}</span>
                <span className="text-sm font-bold text-foreground">{r.obtained}/{r.maxMarks}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full w-fit ${r.status === 'finalized' ? 'bg-positive-bg text-positive' : 'bg-warning-bg text-warning'}`}>
                  {r.status.toUpperCase()}
                </span>
                <button className="flex items-center gap-1 text-xs text-primary hover:underline font-600">
                  <Eye size={12} /> View Report
                </button>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
