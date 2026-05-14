'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, ChevronDown, ChevronUp, Eye, Edit2, Download, AlertCircle, CheckCircle2, Loader2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import StatusBadge from '@/components/ui/StatusBadge';

type EvaluationRow = {
  id: string;
  studentName: string;
  rollNo: string;
  subject: string;
  class: string;
  obtained: number | null;
  maxMarks: number;
  aiConfidence: number | null;
  overrides: number;
  status: 'finalized' | 'review' | 'processing' | 'pending' | 'failed';
  submittedAt: string;
};

type SortKey = 'studentName' | 'subject' | 'obtained' | 'aiConfidence' | 'submittedAt';
type SortDir = 'asc' | 'desc';

export default function RecentEvaluationsTable() {
  const [evaluations, setEvaluations] = useState<EvaluationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('submittedAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch('/api/evaluations?limit=50')
      .then((r) => r.json())
      .then((data) => {
        if (data.evaluations) setEvaluations(data.evaluations);
      })
      .catch(() => {/* silent — DB may not be configured yet */})
      .finally(() => setLoading(false));
  }, []);

  const filtered = evaluations.filter(
    (e) =>
      e.studentName.toLowerCase().includes(search.toLowerCase()) ||
      e.subject.toLowerCase().includes(search.toLowerCase()) ||
      e.rollNo.toLowerCase().includes(search.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    let av: any = a[sortKey];
    let bv: any = b[sortKey];
    if (av === null) av = sortDir === 'asc' ? Infinity : -Infinity;
    if (bv === null) bv = sortDir === 'asc' ? Infinity : -Infinity;
    if (av < bv) return sortDir === 'asc' ? -1 : 1;
    if (av > bv) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this evaluation? This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/evaluations/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setEvaluations((prev) => prev.filter((e) => e.id !== id));
      setSelected((prev) => { const next = new Set(prev); next.delete(id); return next; });
      toast.success('Evaluation deleted');
    } catch {
      toast.error('Failed to delete evaluation');
    }
  };

  const handleBulkDelete = async () => {
    if (selected.size === 0) return;
    if (!confirm(`Delete ${selected.size} evaluation${selected.size > 1 ? 's' : ''}? This cannot be undone.`)) return;
    const ids = Array.from(selected);
    try {
      await Promise.all(ids.map((id) => fetch(`/api/evaluations/${id}`, { method: 'DELETE' })));
      setEvaluations((prev) => prev.filter((e) => !ids.includes(e.id)));
      setSelected(new Set());
      toast.success(`${ids.length} evaluation${ids.length > 1 ? 's' : ''} deleted`);
    } catch {
      toast.error('Some deletions failed — please retry');
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const toggleAll = () => {
    if (selected.size === sorted.length) setSelected(new Set());
    else setSelected(new Set(sorted.map((e) => e.id)));
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ChevronDown size={12} className="text-muted-foreground/40" />;
    return sortDir === 'asc' ? <ChevronUp size={12} className="text-primary" /> : <ChevronDown size={12} className="text-primary" />;
  };

  const getConfidenceColor = (v: number | null) => {
    if (v === null) return 'text-muted-foreground';
    if (v >= 85) return 'text-positive';
    if (v >= 70) return 'text-warning';
    return 'text-negative';
  };

  return (
    <div className="bg-card border border-border rounded-2xl shadow-card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div>
          <h3 className="section-header">Recent Evaluations</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{sorted.length} result{sorted.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search students, subjects..."
              className="input-field w-36 sm:w-48 lg:w-52 text-sm"
              style={{ paddingLeft: '2rem', paddingRight: '0.75rem', paddingTop: '0.5rem', paddingBottom: '0.5rem' }}
            />
          </div>
        </div>
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 px-5 py-3 bg-secondary border-b border-primary/20 animate-slide-up">
          <span className="text-sm font-600 text-primary">{selected.size} selected</span>
          <button className="text-xs font-600 text-primary hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
            <Download size={12} />
            Export Reports
          </button>
          <button
            onClick={handleBulkDelete}
            className="text-xs font-600 text-negative hover:bg-negative-bg px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
          >
            <Trash2 size={12} />
            Delete
          </button>
          <button onClick={() => setSelected(new Set())} className="ml-auto text-xs text-muted-foreground hover:text-foreground">
            Clear
          </button>
        </div>
      )}

      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full min-w-[360px] sm:min-w-[600px]">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="w-10 px-3 sm:px-4 py-3">
                <input
                  type="checkbox"
                  className="w-3.5 h-3.5 accent-primary"
                  checked={selected.size === sorted.length && sorted.length > 0}
                  onChange={toggleAll}
                />
              </th>
              {[
                { key: 'studentName' as SortKey, label: 'Student', hide: '' },
                { key: null, label: 'Roll No', hide: 'hidden sm:table-cell' },
                { key: 'subject' as SortKey, label: 'Subject', hide: '' },
                { key: null, label: 'Class', hide: 'hidden sm:table-cell' },
                { key: 'obtained' as SortKey, label: 'Marks', hide: '' },
                { key: 'aiConfidence' as SortKey, label: 'Confidence', hide: 'hidden md:table-cell' },
                { key: null, label: 'Overrides', hide: 'hidden lg:table-cell' },
                { key: null, label: 'Status', hide: '' },
                { key: 'submittedAt' as SortKey, label: 'Date', hide: 'hidden md:table-cell' },
                { key: null, label: '', hide: '' },
              ].map((col, idx) => (
                <th
                  key={`th-${idx}`}
                  className={`px-2 sm:px-3 py-3 text-left text-xs font-600 text-muted-foreground uppercase tracking-wider ${col.key ? 'cursor-pointer select-none hover:text-foreground' : ''} ${col.hide}`}
                  onClick={col.key ? () => handleSort(col.key!) : undefined}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {col.key && <SortIcon col={col.key} />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={10} className="px-5 py-12 text-center">
                  <Loader2 size={20} className="animate-spin text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Loading evaluations…</p>
                </td>
              </tr>
            ) : sorted.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-5 py-12 text-center">
                  <p className="text-sm text-muted-foreground">No evaluations yet. Start by evaluating an answer sheet.</p>
                </td>
              </tr>
            ) : (
              sorted.map((ev, rowIdx) => (
                <tr
                  key={ev.id}
                  className={`border-b border-border last:border-0 transition-colors ${rowIdx % 2 === 0 ? 'bg-card' : 'bg-muted/20'} hover:bg-secondary/40 group`}
                >
                  <td className="px-3 sm:px-4 py-3">
                    <input
                      type="checkbox"
                      className="w-3.5 h-3.5 accent-primary"
                      checked={selected.has(ev.id)}
                      onChange={() => toggleSelect(ev.id)}
                    />
                  </td>
                  <td className="px-2 sm:px-3 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center shrink-0">
                        <span className="text-xs font-700 text-primary">
                          {ev.studentName !== '—' ? ev.studentName.split(' ').map((n) => n[0]).join('').slice(0, 2) : '—'}
                        </span>
                      </div>
                      <span className="text-sm font-600 text-foreground whitespace-nowrap">{ev.studentName}</span>
                    </div>
                  </td>
                  <td className="hidden sm:table-cell px-3 py-3 text-sm text-muted-foreground font-tabular">{ev.rollNo}</td>
                  <td className="px-2 sm:px-3 py-3 text-sm text-foreground font-500">{ev.subject}</td>
                  <td className="hidden sm:table-cell px-3 py-3 text-sm text-muted-foreground">{ev.class}</td>
                  <td className="px-2 sm:px-3 py-3">
                    <span className="text-sm font-700 text-foreground font-tabular">
                      {ev.obtained !== null ? `${ev.obtained}/${ev.maxMarks}` : '—'}
                    </span>
                  </td>
                  <td className="hidden md:table-cell px-3 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-sm font-700 font-tabular ${getConfidenceColor(ev.aiConfidence)}`}>
                        {ev.aiConfidence !== null ? `${ev.aiConfidence}%` : '—'}
                      </span>
                      {ev.aiConfidence !== null && ev.aiConfidence < 70 && (
                        <AlertCircle size={12} className="text-negative" />
                      )}
                      {ev.aiConfidence !== null && ev.aiConfidence >= 85 && (
                        <CheckCircle2 size={12} className="text-positive" />
                      )}
                    </div>
                  </td>
                  <td className="hidden lg:table-cell px-3 py-3">
                    <span className={`text-sm font-tabular ${ev.overrides > 0 ? 'text-warning font-600' : 'text-muted-foreground'}`}>
                      {ev.overrides > 0 ? ev.overrides : '—'}
                    </span>
                  </td>
                  <td className="px-2 sm:px-3 py-3">
                    <StatusBadge variant={ev.status} />
                  </td>
                  <td className="hidden md:table-cell px-3 py-3 text-xs text-muted-foreground whitespace-nowrap">{ev.submittedAt}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="tooltip-custom">
                        <Link href={`/answer-sheet-evaluator?id=${ev.id}`} className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center transition-colors">
                          <Eye size={13} className="text-muted-foreground" />
                        </Link>
                        <span className="tooltip-text">View evaluation</span>
                      </div>
                      <div className="tooltip-custom">
                        <Link href={`/answer-sheet-evaluator?id=${ev.id}`} className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center transition-colors">
                          <Edit2 size={13} className="text-muted-foreground" />
                        </Link>
                        <span className="tooltip-text">Edit scores</span>
                      </div>
                      <div className="tooltip-custom">
                        <button className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center transition-colors">
                          <Download size={13} className="text-muted-foreground" />
                        </button>
                        <span className="tooltip-text">Export PDF report</span>
                      </div>
                      <div className="tooltip-custom">
                        <button
                          onClick={() => handleDelete(ev.id)}
                          className="w-7 h-7 rounded-lg hover:bg-negative-bg flex items-center justify-center transition-colors"
                        >
                          <Trash2 size={13} className="text-negative" />
                        </button>
                        <span className="tooltip-text">Delete evaluation</span>
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-border">
        <p className="text-xs text-muted-foreground">Showing {sorted.length} evaluation{sorted.length !== 1 ? 's' : ''}</p>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((p) => (
            <button
              key={`page-${p}`}
              className={`w-7 h-7 rounded-lg text-xs font-600 transition-colors ${p === 1 ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted'}`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
