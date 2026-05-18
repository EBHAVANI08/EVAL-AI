'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Loader2, CheckCircle2, Building2, GraduationCap, Settings, Sliders, Globe } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import toast from 'react-hot-toast';

const GRADING_DEFAULTS = [
  { grade: 'A+', min: 91, max: 100 }, { grade: 'A', min: 81, max: 90 },
  { grade: 'B+', min: 71, max: 80 }, { grade: 'B', min: 61, max: 70 },
  { grade: 'C', min: 51, max: 60 }, { grade: 'D', min: 33, max: 50 },
  { grade: 'F', min: 0, max: 32 },
];

export default function SettingsSection() {
  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(d => { setForm(d); }).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error('Save failed');
      toast.success('Settings saved successfully');
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const set = (key: string, val: any) => setForm((f: any) => ({ ...f, [key]: val }));

  if (loading) return <div className="py-32 text-center"><Loader2 size={28} className="animate-spin text-[#94A3B8] mx-auto mb-3" /></div>;
  if (!form) return null;

  return (
    <motion.div key="settings" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-[#0A0F1E] tracking-tighter">Platform Settings</h2>
          <p className="text-[#64748B] font-bold mt-1">Configure institution details and evaluation parameters</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-[#059669] text-white font-black text-sm hover:bg-[#047857] transition-all shadow-xl active:scale-95 disabled:opacity-60">
          {saving ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : <><Save size={16} /> Save Changes</>}
        </button>
      </div>

      {/* Institution */}
      <GlassCard>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center"><Building2 size={20} className="text-[#1A6BFF]" /></div>
          <div><h3 className="font-black text-[#0A0F1E]">Institution Details</h3><p className="text-xs font-bold text-[#94A3B8]">Basic info about your institution</p></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[
            { key: 'institutionName', label: 'Institution Name', placeholder: 'e.g. Greenfield International School' },
            { key: 'principalName', label: 'Principal / Director', placeholder: 'e.g. Dr. Anita Sharma' },
            { key: 'contactEmail', label: 'Contact Email', placeholder: 'admin@school.edu' },
            { key: 'address', label: 'Address', placeholder: 'Full address' },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mb-1.5">{label}</label>
              <input value={form[key] ?? ''} onChange={e => set(key, e.target.value)} placeholder={placeholder}
                className="w-full px-4 py-3 rounded-xl border border-[#E2E8F5] text-sm font-bold text-[#0A0F1E] outline-none focus:border-[#1A6BFF] bg-[#F8FAFF] transition-all" />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-4">
            {[
              { key: 'board', label: 'Board', opts: ['CBSE', 'ICSE', 'State Board', 'IB', 'Cambridge', 'Other'] },
              { key: 'academicYear', label: 'Academic Year', opts: ['2024-25', '2025-26', '2026-27'] },
            ].map(({ key, label, opts }) => (
              <div key={key}>
                <label className="block text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mb-1.5">{label}</label>
                <select value={form[key] ?? ''} onChange={e => set(key, e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#E2E8F5] text-sm font-bold text-[#0A0F1E] outline-none focus:border-[#1A6BFF] bg-[#F8FAFF] cursor-pointer">
                  {opts.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Evaluation */}
      <GlassCard>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center"><Sliders size={20} className="text-[#7C3AED]" /></div>
          <div><h3 className="font-black text-[#0A0F1E]">Evaluation Settings</h3><p className="text-xs font-bold text-[#94A3B8]">Configure AI and grading behaviour</p></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="block text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mb-1.5">Passing Threshold (%)</label>
            <input type="number" min={0} max={100} value={form.passingThreshold ?? 33} onChange={e => set('passingThreshold', Number(e.target.value))}
              className="w-full px-4 py-3 rounded-xl border border-[#E2E8F5] text-sm font-bold text-[#0A0F1E] outline-none focus:border-[#7C3AED] bg-[#F8FAFF]" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mb-1.5">Default Language</label>
            <select value={form.defaultLanguage ?? 'English'} onChange={e => set('defaultLanguage', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[#E2E8F5] text-sm font-bold text-[#0A0F1E] outline-none focus:border-[#7C3AED] bg-[#F8FAFF] cursor-pointer">
              {['English', 'Hindi', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Marathi', 'Gujarati', 'Bengali', 'Urdu'].map(l => <option key={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mb-1.5">Max AI Tokens</label>
            <input type="number" value={form.maxTokens ?? 65536} onChange={e => set('maxTokens', Number(e.target.value))}
              className="w-full px-4 py-3 rounded-xl border border-[#E2E8F5] text-sm font-bold text-[#0A0F1E] outline-none focus:border-[#7C3AED] bg-[#F8FAFF]" />
          </div>
        </div>

        {/* Toggles */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { key: 'autoSaveEvaluations', label: 'Auto-save Evaluations', desc: 'Automatically save drafts during evaluation' },
            { key: 'showAiConfidence', label: 'Show AI Confidence', desc: 'Display confidence scores to teachers' },
            { key: 'requireTeacherReview', label: 'Require Teacher Review', desc: 'Flag all evals for review before finalizing' },
          ].map(({ key, label, desc }) => (
            <div key={key} onClick={() => set(key, !form[key])}
              className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${form[key] ? 'bg-green-50 border-green-200' : 'bg-[#F8FAFF] border-[#E2E8F5]'}`}>
              <div className={`w-12 h-6 rounded-full flex items-center transition-all shrink-0 mt-0.5 ${form[key] ? 'bg-green-500 justify-end' : 'bg-[#CBD5E1] justify-start'}`}>
                <div className="w-5 h-5 rounded-full bg-white shadow-md mx-0.5" />
              </div>
              <div>
                <p className="text-sm font-black text-[#0A0F1E]">{label}</p>
                <p className="text-xs font-medium text-[#64748B] mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Grading scheme */}
      <GlassCard>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center"><GraduationCap size={20} className="text-[#F59E0B]" /></div>
          <div><h3 className="font-black text-[#0A0F1E]">Grading Scheme</h3><p className="text-xs font-bold text-[#94A3B8]">Score ranges for each grade</p></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {(form.gradingScheme ?? GRADING_DEFAULTS).map((g: any, i: number) => (
            <div key={g.grade} className="bg-[#F8FAFF] border border-[#E2E8F5] rounded-2xl p-4 text-center">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#E2E8F5] flex items-center justify-center font-black text-[#0A0F1E] text-lg mx-auto mb-3 shadow-sm">{g.grade}</div>
              <p className="text-xs font-black text-[#94A3B8] uppercase tracking-wider mb-1">Min</p>
              <input type="number" value={g.min} min={0} max={100}
                onChange={e => {
                  const updated = [...(form.gradingScheme ?? GRADING_DEFAULTS)];
                  updated[i] = { ...updated[i], min: Number(e.target.value) };
                  set('gradingScheme', updated);
                }}
                className="w-full text-center text-sm font-black text-[#0A0F1E] bg-white border border-[#E2E8F5] rounded-lg py-1 outline-none focus:border-amber-400" />
              <p className="text-[10px] text-[#94A3B8] mt-1">to {g.max}%</p>
            </div>
          ))}
        </div>
      </GlassCard>
    </motion.div>
  );
}
