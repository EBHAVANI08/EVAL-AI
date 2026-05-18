'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, ChevronDown, ChevronUp, Eye, Edit2, Download, 
  AlertCircle, CheckCircle2, Loader2, Trash2, Filter, MoreVertical 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import StatusBadge from '@/components/ui/StatusBadge';
import GlassCard from '@/components/GlassCard';
import ConfirmModal from '@/components/ui/ConfirmModal';

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
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

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

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/evaluations/${deleteId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setEvaluations((prev) => prev.filter((e) => e.id !== deleteId));
      toast.success('Evaluation deleted');
    } catch {
      toast.error('Failed to delete evaluation');
    } finally {
      setDeleteLoading(false);
      setDeleteId(null);
    }
  };

  const handleDownload = async (ev: EvaluationRow) => {
    try {
      const res = await fetch(`/api/evaluations/${ev.id}`);
      const data = await res.json();
      const questions = data.questions ?? [];

      const rows: (string | number)[][] = [
        ['Student', ev.studentName],
        ['Roll No', ev.rollNo],
        ['Subject', ev.subject],
        ['Class', ev.class],
        ['Score', ev.obtained !== null ? `${ev.obtained}/${ev.maxMarks}` : '—'],
        ['AI Confidence', ev.aiConfidence !== null ? `${ev.aiConfidence}%` : '—'],
        ['Status', ev.status],
        ['Date', ev.submittedAt],
        [],
        ['Q No', 'Section', 'Question', 'AI Score', 'Teacher Score', 'Max Marks', 'Confidence', 'Status', 'Comment'],
        ...questions.map((q: any) => [
          q.qNo, q.section,
          `"${(q.questionText ?? '').replace(/"/g, '""')}"`,
          q.aiScore, q.teacherScore ?? '', q.maxMarks, `${q.aiConfidence}%`, q.status,
          `"${(q.comment ?? '').replace(/"/g, '""')}"`,
        ]),
      ];

      const csv  = rows.map((r) => r.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `report_${ev.studentName.replace(/\s+/g, '_')}_${ev.subject}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Report downloaded');
    } catch {
      toast.error('Failed to download report');
    }
  };

  const getConfidenceColor = (v: number | null) => {
    if (v === null) return 'text-[#94A3B8]';
    if (v >= 85) return 'text-[#10B981]';
    if (v >= 70) return 'text-[#F59E0B]';
    return 'text-[#EF4444]';
  };

  return (
    <GlassCard className="p-0 overflow-hidden flex flex-col">
      {/* Table Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-8 py-6 border-b border-[#E2E8F5]/50 bg-[#F8FAFF]/50">
        <div>
          <h3 className="font-black text-[#0A0F1E] text-lg">Recent Evaluations</h3>
          <p className="text-sm text-[#64748B] font-medium mt-1">{sorted.length} student records found</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search students..."
              className="w-full bg-white border border-[#E2E8F5] rounded-xl px-11 py-2.5 text-sm font-bold text-[#0A0F1E] focus:border-orange-500/30 focus:ring-4 focus:ring-orange-500/5 outline-none transition-all placeholder:text-[#94A3B8]"
            />
          </div>
          <button className="p-2.5 rounded-xl border border-[#E2E8F5] bg-white hover:bg-[#F8FAFF] transition-colors text-[#64748B]">
            <Filter size={18} />
          </button>
        </div>
      </div>

      {/* Bulk Action Bar */}
      <AnimatePresence>
        {selected.size > 0 && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-[#1A6BFF] px-8 py-3 flex items-center justify-between overflow-hidden"
          >
            <div className="flex items-center gap-4">
              <span className="text-sm font-black text-white">{selected.size} items selected</span>
              <div className="w-px h-4 bg-white/20" />
              <button className="flex items-center gap-2 text-xs font-black text-white hover:bg-white/10 px-3 py-1.5 rounded-lg transition-all">
                <Download size={14} /> Export Selected
              </button>
            </div>
            <button onClick={() => setSelected(new Set())} className="text-xs font-black text-white/70 hover:text-white">
              Deselect All
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#F8FAFF]/30">
              <th className="px-8 py-4 text-left w-12">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-[#E2E8F5] text-orange-600 focus:ring-orange-500"
                  checked={selected.size === sorted.length && sorted.length > 0}
                  onChange={() => sorted.length > 0 && (selected.size === sorted.length ? setSelected(new Set()) : setSelected(new Set(sorted.map(e => e.id))))}
                />
              </th>
              {[
                { key: 'studentName', label: 'Student' },
                { key: 'subject', label: 'Subject' },
                { key: 'obtained', label: 'Marks' },
                { key: 'aiConfidence', label: 'Confidence' },
                { key: 'status', label: 'Status' },
                { key: 'submittedAt', label: 'Date' }
              ].map(col => (
                <th 
                  key={col.label} 
                  className="px-6 py-4 text-left text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.2em] cursor-pointer hover:text-orange-600 transition-colors"
                  onClick={() => handleSort(col.key as SortKey)}
                >
                  <div className="flex items-center gap-2">
                    {col.label}
                    {sortKey === col.key && (sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                  </div>
                </th>
              ))}
              <th className="px-8 py-4 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F5]/30">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-8 py-20 text-center">
                  <Loader2 size={24} className="animate-spin text-orange-500 mx-auto mb-3" />
                  <p className="text-sm font-bold text-[#64748B]">Fetching evaluations...</p>
                </td>
              </tr>
            ) : sorted.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-8 py-20 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-[#E2E8F5]">
                    <AlertCircle size={24} className="text-[#CBD5E1]" />
                  </div>
                  <p className="text-sm font-black text-[#0A0F1E]">No records found</p>
                  <p className="text-xs text-[#64748B] mt-1">Try adjusting your search or add a new evaluation</p>
                </td>
              </tr>
            ) : (
              sorted.map((ev, i) => (
                <motion.tr 
                  key={ev.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`group hover:bg-[#F8FAFF] transition-all cursor-default ${selected.has(ev.id) ? 'bg-orange-50/30' : ''}`}
                >
                  <td className="px-8 py-4">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-[#E2E8F5] text-orange-600 focus:ring-orange-500 cursor-pointer"
                      checked={selected.has(ev.id)}
                      onChange={() => toggleSelect(ev.id)}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 border border-slate-200 flex items-center justify-center shadow-sm">
                        <span className="text-[11px] font-black text-slate-700">{ev.studentName.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="text-sm font-black text-[#0A0F1E]">{ev.studentName}</p>
                        <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">{ev.rollNo}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-black text-[#64748B] bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg">
                      {ev.subject}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-black text-sm text-[#0A0F1E]">
                    {ev.obtained !== null ? `${ev.obtained}/${ev.maxMarks}` : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-black ${getConfidenceColor(ev.aiConfidence)}`}>
                        {ev.aiConfidence !== null ? `${ev.aiConfidence}%` : '—'}
                      </span>
                      {ev.aiConfidence !== null && (ev.aiConfidence >= 85 ? <CheckCircle2 size={12} className="text-green-500" /> : ev.aiConfidence < 70 ? <AlertCircle size={12} className="text-red-500" /> : null)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge variant={ev.status} />
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-[#94A3B8] whitespace-nowrap">
                    {ev.submittedAt}
                  </td>
                  <td className="px-8 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link href={`/answer-sheet-evaluator?id=${ev.id}`} className="p-2 hover:bg-white rounded-lg shadow-sm border border-transparent hover:border-[#E2E8F5] transition-all">
                        <Eye size={14} className="text-[#64748B]" />
                      </Link>
                      <button
                        onClick={() => handleDownload(ev)}
                        title="Download CSV report"
                        className="p-2 hover:bg-white rounded-lg shadow-sm border border-transparent hover:border-[#E2E8F5] transition-all"
                      >
                        <Download size={14} className="text-[#64748B]" />
                      </button>
                      <button
                        onClick={() => setDeleteId(ev.id)}
                        className="p-2 hover:bg-red-50 rounded-lg shadow-sm border border-transparent hover:border-red-100 transition-all"
                      >
                        <Trash2 size={14} className="text-red-500" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Container */}
      <div className="px-8 py-4 bg-[#F8FAFF]/50 border-t border-[#E2E8F5]/50 flex items-center justify-between">
        <p className="text-[11px] font-black text-[#94A3B8] uppercase tracking-widest">
          Page 1 of 5 <span className="mx-2">•</span> {sorted.length} results
        </p>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 rounded-xl bg-white border border-[#E2E8F5] text-[11px] font-black text-[#64748B] hover:bg-orange-600 hover:text-white hover:border-orange-600 transition-all disabled:opacity-50">Prev</button>
          <button className="px-4 py-2 rounded-xl bg-white border border-[#E2E8F5] text-[11px] font-black text-[#64748B] hover:bg-orange-600 hover:text-white hover:border-orange-600 transition-all">Next</button>
        </div>
      </div>
      <ConfirmModal
        isOpen={!!deleteId}
        title="Delete Evaluation"
        description="This will permanently delete this evaluation. This action cannot be undone."
        confirmLabel={deleteLoading ? 'Deleting…' : 'Delete'}
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </GlassCard>
  );
}
