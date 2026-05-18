'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { School, Plus, Search, TrendingUp, Users, ClipboardCheck, Loader2, X, Building2 } from 'lucide-react';
import GlassCard from '@/components/GlassCard';

type SchoolRow = { name: string; studentCount: number; evalCount: number; avgScore: number | null; finalized: number };

export default function SchoolsSection() {
  const [schools, setSchools] = useState<SchoolRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', address: '', contactEmail: '', phone: '', principalName: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/schools').then(r => r.json())
      .then(d => { if (d.schools) setSchools(d.schools); })
      .finally(() => setLoading(false));
  }, []);

  const filtered = schools.filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase()));

  const handleAdd = async () => {
    if (!form.name) { setError('School name is required'); return; }
    setSaving(true); setError('');
    const res = await fetch('/api/admin/schools', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? 'Failed'); setSaving(false); return; }
    setSchools(prev => [{ name: form.name, studentCount: 0, evalCount: 0, avgScore: null, finalized: 0 }, ...prev]);
    setShowModal(false); setForm({ name: '', address: '', contactEmail: '', phone: '', principalName: '' });
    setSaving(false);
  };

  return (
    <motion.div key="schools" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-[#0A0F1E] tracking-tighter">Schools</h2>
          <p className="text-[#64748B] font-bold mt-1">Institutions using the platform</p>
        </div>
        <button onClick={() => { setShowModal(true); setError(''); }} className="flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-[#0A0F1E] text-white font-black text-sm hover:bg-[#059669] transition-all shadow-xl active:scale-95">
          <Plus size={18} /> Add School
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-6">
        {[
          { label: 'Total Schools', value: schools.length, icon: Building2, color: '#7C3AED', bg: 'bg-purple-50' },
          { label: 'Total Students', value: schools.reduce((a, s) => a + s.studentCount, 0), icon: Users, color: '#1A6BFF', bg: 'bg-blue-50' },
          { label: 'Total Evaluations', value: schools.reduce((a, s) => a + s.evalCount, 0), icon: ClipboardCheck, color: '#059669', bg: 'bg-green-50' },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <GlassCard key={s.label} className="flex items-center gap-5">
              <div className={`w-14 h-14 rounded-2xl ${s.bg} flex items-center justify-center shrink-0`}>
                <Icon size={24} style={{ color: s.color }} />
              </div>
              <div>
                <p className="text-3xl font-black text-[#0A0F1E] tracking-tighter">{s.value}</p>
                <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.2em] mt-1">{s.label}</p>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 bg-white border border-[#E2E8F5] rounded-2xl px-4 py-3 max-w-sm">
        <Search size={15} className="text-[#94A3B8]" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search schools…"
          className="bg-transparent text-xs font-bold text-[#0A0F1E] outline-none w-full placeholder:text-[#94A3B8]" />
      </div>

      {/* Table */}
      <GlassCard className="p-0 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#F1F5F9]">
              {['School Name', 'Students', 'Evaluations', 'Avg Score', 'Finalized', 'Performance'].map(h => (
                <th key={h} className="px-6 py-5 text-left text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.2em]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F8FAFF]">
            {loading ? (
              <tr><td colSpan={6} className="py-16 text-center"><Loader2 size={24} className="animate-spin text-[#94A3B8] mx-auto mb-2" /></td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="py-16 text-center">
                <School size={32} className="text-[#CBD5E1] mx-auto mb-3" />
                <p className="text-sm font-black text-[#0A0F1E]">No schools yet</p>
                <p className="text-xs font-bold text-[#94A3B8] mt-1">Schools appear automatically when students are evaluated</p>
              </td></tr>
            ) : filtered.map((s, i) => (
              <motion.tr key={s.name} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                className="hover:bg-[#F8FAFF] transition-all group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center font-black text-purple-700 text-sm">{s.name.charAt(0)}</div>
                    <p className="text-sm font-black text-[#0A0F1E]">{s.name}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-bold text-[#64748B]">{s.studentCount}</td>
                <td className="px-6 py-4 text-sm font-bold text-[#64748B]">{s.evalCount}</td>
                <td className="px-6 py-4">
                  {s.avgScore !== null ? (
                    <span className={`text-sm font-black ${s.avgScore >= 70 ? 'text-[#059669]' : s.avgScore >= 50 ? 'text-[#F59E0B]' : 'text-[#EF4444]'}`}>{s.avgScore}%</span>
                  ) : <span className="text-sm text-[#94A3B8]">—</span>}
                </td>
                <td className="px-6 py-4 text-sm font-bold text-[#64748B]">{s.finalized}</td>
                <td className="px-6 py-4">
                  {s.avgScore !== null && (
                    <div className="w-24 h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${s.avgScore >= 70 ? 'bg-[#059669]' : s.avgScore >= 50 ? 'bg-[#F59E0B]' : 'bg-[#EF4444]'}`} style={{ width: `${s.avgScore}%` }} />
                    </div>
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </GlassCard>

      {/* Modal */}
      {showModal && (
        <>
          <div className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="fixed inset-0 z-[71] flex items-center justify-center p-4 pointer-events-none">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-md bg-white rounded-[2.5rem] shadow-[0_40px_80px_rgba(0,0,0,0.2)] overflow-hidden pointer-events-auto">
              <div className="h-1.5 bg-gradient-to-r from-purple-500 to-purple-600" />
              <div className="px-8 py-6 border-b border-[#F1F5F9] flex items-center justify-between">
                <h3 className="text-xl font-black text-[#0A0F1E]">Add School</h3>
                <button onClick={() => setShowModal(false)} className="w-9 h-9 rounded-xl hover:bg-[#F8FAFF] flex items-center justify-center"><X size={18} className="text-[#94A3B8]" /></button>
              </div>
              <div className="px-8 py-6 space-y-4">
                {[
                  { key: 'name', label: 'School Name *', placeholder: 'e.g. Greenfield International School' },
                  { key: 'principalName', label: 'Principal Name', placeholder: 'e.g. Dr. Anita Sharma' },
                  { key: 'contactEmail', label: 'Contact Email', placeholder: 'school@example.edu' },
                  { key: 'phone', label: 'Phone Number', placeholder: '+91 98765 43210' },
                  { key: 'address', label: 'Address', placeholder: 'Full address' },
                ].map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label className="block text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mb-1.5">{label}</label>
                    <input value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} placeholder={placeholder}
                      className="w-full px-4 py-3 rounded-xl border border-[#E2E8F5] text-sm font-bold text-[#0A0F1E] outline-none focus:border-purple-400 bg-[#F8FAFF] transition-all" />
                  </div>
                ))}
                {error && <p className="text-xs font-bold text-red-500 bg-red-50 px-4 py-3 rounded-xl">{error}</p>}
              </div>
              <div className="px-8 pb-8 flex gap-3">
                <button onClick={() => setShowModal(false)} className="flex-1 py-3.5 rounded-2xl border border-[#E2E8F5] text-sm font-black text-[#64748B] hover:bg-[#F8FAFF]">Cancel</button>
                <button onClick={handleAdd} disabled={saving} className="flex-1 py-3.5 rounded-2xl bg-purple-600 text-white text-sm font-black hover:bg-purple-700 disabled:opacity-60 flex items-center justify-center gap-2">
                  {saving ? <><Loader2 size={16} className="animate-spin" /> Adding…</> : <><Plus size={16} /> Add School</>}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </motion.div>
  );
}
