'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, Search, Filter, Loader2, Clock, CheckCircle2, Eye, RefreshCw } from 'lucide-react';
import GlassCard from '@/components/GlassCard';

type Submission = { id: string; studentName: string; studentEmail: string; rollNo: string; subject: string; grade: string; fileName: string; status: string; createdAt: string };
type StatusFilter = 'all' | 'pending' | 'under_review' | 'evaluated';

const STATUS_CFG: Record<string, { label: string; dot: string; badge: string }> = {
  pending:      { label: 'Pending',      dot: 'bg-amber-500',  badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  under_review: { label: 'Under Review', dot: 'bg-blue-500',   badge: 'bg-blue-50 text-blue-700 border-blue-200' },
  evaluated:    { label: 'Evaluated',    dot: 'bg-green-500',  badge: 'bg-green-50 text-green-700 border-green-200' },
};

export default function SubmissionsSection() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchSubs = () => {
    setLoading(true);
    fetch('/api/student-uploads').then(r => r.json())
      .then(d => { if (d.uploads) setSubmissions(d.uploads); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchSubs(); }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    setUpdating(id);
    try {
      await fetch(`/api/student-uploads/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus }) });
      setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
    } finally { setUpdating(null); }
  };

  const filtered = submissions.filter(s => {
    const matchStatus = statusFilter === 'all' || s.status === statusFilter;
    const matchSearch = !search || s.studentName.toLowerCase().includes(search.toLowerCase()) || s.subject.toLowerCase().includes(search.toLowerCase()) || s.rollNo.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const counts = { all: submissions.length, pending: submissions.filter(s => s.status === 'pending').length, under_review: submissions.filter(s => s.status === 'under_review').length, evaluated: submissions.filter(s => s.status === 'evaluated').length };

  return (
    <motion.div key="submissions" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-[#0A0F1E] tracking-tighter">Submissions</h2>
          <p className="text-[#64748B] font-bold mt-1">Answer sheets uploaded by students</p>
        </div>
        <button onClick={fetchSubs} className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white border border-[#E2E8F5] text-xs font-black text-[#64748B] hover:bg-[#F8FAFF] transition-all shadow-sm active:scale-95">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Status tabs */}
      <div className="flex items-center gap-3 flex-wrap">
        {(['all', 'pending', 'under_review', 'evaluated'] as StatusFilter[]).map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black transition-all border ${statusFilter === s ? 'bg-[#0A0F1E] text-white border-[#0A0F1E] shadow-lg' : 'bg-white text-[#64748B] border-[#E2E8F5] hover:bg-[#F8FAFF]'}`}>
            {s !== 'all' && <span className={`w-2 h-2 rounded-full ${STATUS_CFG[s]?.dot}`} />}
            {s === 'all' ? 'All' : STATUS_CFG[s]?.label}
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${statusFilter === s ? 'bg-white/20 text-white' : 'bg-[#F1F5F9] text-[#64748B]'}`}>{counts[s]}</span>
          </button>
        ))}
        <div className="flex items-center gap-2 bg-white border border-[#E2E8F5] rounded-2xl px-3 py-2 ml-auto">
          <Search size={14} className="text-[#94A3B8]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search students…"
            className="bg-transparent text-xs font-bold text-[#0A0F1E] outline-none w-40 placeholder:text-[#94A3B8]" />
        </div>
      </div>

      <GlassCard className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#F1F5F9]">
                {['Student', 'Roll No', 'Subject', 'Grade', 'File', 'Submitted', 'Status', 'Action'].map(h => (
                  <th key={h} className="px-6 py-5 text-left text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.2em]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F8FAFF]">
              {loading ? (
                <tr><td colSpan={8} className="py-16 text-center"><Loader2 size={24} className="animate-spin text-[#94A3B8] mx-auto mb-2" /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="py-16 text-center">
                  <Upload size={32} className="text-[#CBD5E1] mx-auto mb-3" />
                  <p className="text-sm font-black text-[#0A0F1E]">No submissions found</p>
                </td></tr>
              ) : filtered.map((s, i) => {
                const cfg = STATUS_CFG[s.status] ?? { label: s.status, dot: 'bg-slate-400', badge: 'bg-slate-50 text-slate-700 border-slate-200' };
                return (
                  <motion.tr key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    className="hover:bg-[#F8FAFF] transition-all">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center font-black text-orange-600 text-sm">{s.studentName.charAt(0)}</div>
                        <div>
                          <p className="text-sm font-black text-[#0A0F1E]">{s.studentName}</p>
                          <p className="text-[10px] font-bold text-[#94A3B8]">{s.studentEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-[#64748B]">{s.rollNo}</td>
                    <td className="px-6 py-4 text-xs font-bold text-[#0A0F1E]">{s.subject}</td>
                    <td className="px-6 py-4 text-xs font-bold text-[#64748B]">{s.grade}</td>
                    <td className="px-6 py-4 text-xs font-bold text-[#94A3B8] max-w-[120px] truncate">{s.fileName}</td>
                    <td className="px-6 py-4 text-xs font-bold text-[#94A3B8] flex items-center gap-1"><Clock size={10} />{new Date(s.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${cfg.badge} flex items-center gap-1.5 w-fit`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />{cfg.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {s.status !== 'evaluated' && (
                        <select
                          value={s.status}
                          disabled={updating === s.id}
                          onChange={e => updateStatus(s.id, e.target.value)}
                          className="text-xs font-bold text-[#0A0F1E] bg-[#F8FAFF] border border-[#E2E8F5] rounded-xl px-3 py-2 outline-none focus:border-[#059669] cursor-pointer disabled:opacity-50"
                        >
                          <option value="pending">Pending</option>
                          <option value="under_review">Under Review</option>
                          <option value="evaluated">Evaluated</option>
                        </select>
                      )}
                      {s.status === 'evaluated' && <CheckCircle2 size={18} className="text-[#059669]" />}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </motion.div>
  );
}
