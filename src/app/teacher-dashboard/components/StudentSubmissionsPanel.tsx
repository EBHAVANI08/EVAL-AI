'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Inbox, Clock, RefreshCw, Brain, CheckCircle2, Loader2, FileText } from 'lucide-react';

type Upload = {
  id: string;
  studentName: string;
  rollNo: string;
  subject: string;
  grade: string;
  fileName: string;
  status: string;
  createdAt: string;
};

const statusBadge = (s: string) => {
  const cfg: Record<string, string> = {
    pending:      'bg-amber-50 text-amber-700 border border-amber-200',
    under_review: 'bg-blue-50 text-blue-700 border border-blue-200',
    evaluated:    'bg-green-50 text-green-700 border border-green-200',
  };
  const labels: Record<string, string> = { pending: 'Pending', under_review: 'Under Review', evaluated: 'Evaluated' };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg[s] ?? 'bg-muted text-muted-foreground'}`}>
      {labels[s] ?? s}
    </span>
  );
};

export default function StudentSubmissionsPanel() {
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetch('/api/student-uploads')
      .then((r) => r.json())
      .then((d) => { if (d.uploads) setUploads(d.uploads); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const pending = uploads.filter((u) => u.status === 'pending' || u.status === 'under_review');

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-card">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center">
            <Inbox size={16} className="text-orange-500" />
          </div>
          <div>
            <p className="text-sm font-700 text-foreground">Student Submissions</p>
            <p className="text-xs text-muted-foreground">Answer sheets uploaded by students</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {pending.length > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
              {pending.length} pending
            </span>
          )}
          <button onClick={load} className="p-1.5 hover:bg-muted rounded-lg transition-colors" title="Refresh">
            <RefreshCw size={13} className="text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="py-10 text-center">
          <Loader2 size={22} className="animate-spin text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">Loading submissions…</p>
        </div>
      ) : uploads.length === 0 ? (
        <div className="py-10 text-center">
          <Inbox size={26} className="text-muted-foreground/25 mx-auto mb-2" />
          <p className="text-sm font-semibold text-muted-foreground">No submissions yet</p>
          <p className="text-xs text-muted-foreground mt-1">Students will appear here after uploading their sheets.</p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {uploads.slice(0, 8).map((u) => (
            <div key={u.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-muted/30 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <FileText size={14} className="text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-600 text-foreground truncate">{u.studentName}</p>
                <p className="text-xs text-muted-foreground">{u.subject} · {u.grade} · {u.rollNo}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="text-right hidden sm:block">
                  {statusBadge(u.status)}
                  <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1 justify-end">
                    <Clock size={9} />
                    {new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
                {u.status !== 'evaluated' ? (
                  <Link
                    href={`/answer-sheet-evaluator?uploadId=${u.id}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-700 hover:bg-primary/90 transition-colors"
                  >
                    <Brain size={11} /> Evaluate
                  </Link>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-positive font-600">
                    <CheckCircle2 size={12} /> Done
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {uploads.length > 8 && (
        <div className="px-5 py-3 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">{uploads.length - 8} more submissions — check Admin &gt; Submissions</p>
        </div>
      )}
    </div>
  );
}
