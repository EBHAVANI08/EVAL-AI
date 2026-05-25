'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  User, Mail, Hash, GraduationCap,
  Edit2, Camera, Award, FileText, ClipboardList, TrendingUp,
  Shield, Clock, ChevronRight, Sparkles, Check,
  Loader2, BookOpen, Bell, Lock, Save,
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import GlassCard from '@/components/GlassCard';
import { toast } from 'sonner';

interface EvalItem {
  id: string; subject: string; examTitle?: string; obtained?: number;
  maxMarks?: number; status: string; submittedAt?: string;
}

export default function StudentProfilePage() {
  const { data: session } = useSession();
  const [editMode, setEditMode]   = useState(false);
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
  const [coverSrc,  setCoverSrc]  = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef  = useRef<HTMLInputElement>(null);

  /* Real evaluation data */
  const [evals, setEvals]       = useState<EvalItem[]>([]);
  const [evalsLoading, setEvalsLoading] = useState(true);
  const [editName, setEditName] = useState('');

  /* Settings state */
  const [notifications, setNotifications] = useState({ email: true, results: true, announcements: false });
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const handleSaveSettings = () => {
    setIsSavingSettings(true);
    setTimeout(() => { setIsSavingSettings(false); toast.success('Settings saved!'); }, 900);
  };

  const Toggle = ({ active, onClick }: { active: boolean; onClick: () => void }) => (
    <button onClick={onClick}
      className={`relative w-14 h-7 rounded-full transition-all duration-500 shadow-inner ${active ? 'bg-orange-500 shadow-orange-200' : 'bg-[#E2E8F5]'}`}>
      <motion.div animate={{ x: active ? 30 : 4 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-lg flex items-center justify-center">
        {active && <Check size={10} className="text-orange-600" />}
      </motion.div>
    </button>
  );

  const user   = session?.user;
  const name   = user?.name ?? 'Student';
  const email  = user?.email ?? '—';
  const rollNo = (user as any)?.rollNo       ?? null;
  const cls    = (user as any)?.studentClass ?? null;
  const school = (user as any)?.school       ?? null;
  const userInitial = name.charAt(0).toUpperCase();

  useEffect(() => {
    if (user?.name) setEditName(user.name);
  }, [user?.name]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (rollNo) params.set('rollNo', rollNo);
    else if (email) params.set('email', email);
    else return;

    fetch(`/api/evaluations?${params}&limit=5`)
      .then((r) => r.json())
      .then((d) => { if (d.evaluations) setEvals(d.evaluations); })
      .catch(() => {})
      .finally(() => setEvalsLoading(false));
  }, [rollNo, email]);

  /* Derived stats from real evaluations */
  const finalized    = evals.filter((e) => e.status === 'finalized');
  const pending      = evals.filter((e) => e.status !== 'finalized').length;
  const avgScore     = finalized.length > 0
    ? Math.round(finalized.reduce((s, e) => s + ((e.obtained ?? 0) / (e.maxMarks || 1)) * 100, 0) / finalized.length)
    : null;

  const statsCards = [
    { label: 'Papers Evaluated', value: finalized.length.toString(), icon: FileText,     color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100' },
    { label: 'Average Score',    value: avgScore !== null ? `${avgScore}%` : '—',         icon: Award,             color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100' },
    { label: 'Pending Review',   value: pending.toString(),                                icon: ClipboardList,     color: 'text-blue-500',  bg: 'bg-blue-50',   border: 'border-blue-100' },
    { label: 'Total Submitted',  value: evals.length.toString(),                          icon: TrendingUp,        color: 'text-green-600', bg: 'bg-green-50',  border: 'border-green-100' },
  ];

  const personalInfo = [
    { label: 'Full Name',     value: name,                           icon: User },
    { label: 'Email Address', value: email,                          icon: Mail },
    { label: 'Roll Number',   value: rollNo   ?? 'Not assigned',     icon: Hash },
    { label: 'Class',         value: cls      ?? 'Not set',          icon: GraduationCap },
    { label: 'School',        value: school   ?? 'Not set',          icon: BookOpen },
  ];

  const statusBadge = (s: string) => {
    if (s === 'finalized') return <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-xl">EVALUATED</span>;
    if (s === 'review')    return <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-xl">UNDER REVIEW</span>;
    return <span className="inline-flex items-center gap-2 text-[10px] font-black text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl"><Clock size={12} /> PENDING</span>;
  };

  return (
    <div className="px-8 py-8 max-w-6xl mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-black text-[#0A0F1E] tracking-tight">My Profile & Settings</h2>
        <p className="text-sm text-[#64748B] font-medium mt-1">Your academic identity, evaluation history and account preferences</p>
      </div>

      {/* Profile hero card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="relative rounded-[3rem] overflow-hidden bg-white border border-[#E2E8F5] shadow-[0_40px_80px_rgba(0,0,0,0.06)] group">
        {/* Cover */}
        <div className="h-60 relative overflow-hidden">
          <input ref={coverInputRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) setCoverSrc(URL.createObjectURL(f)); }} />
          {coverSrc ? (
            <img src={coverSrc} alt="cover" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-orange-500 via-rose-500 to-amber-500">
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
            </div>
          )}
          <motion.button onClick={() => coverInputRef.current?.click()} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            className="absolute top-8 right-8 flex items-center gap-2.5 text-[11px] text-white font-black bg-white/20 backdrop-blur-xl hover:bg-white/40 px-6 py-3 rounded-2xl transition-all border border-white/30 uppercase tracking-widest z-20 shadow-2xl">
            <Camera size={16} /> Change Cover
          </motion.button>
        </div>

        {/* Avatar + identity */}
        <div className="px-12 pb-12">
          <div className="flex items-end justify-between -mt-20 mb-10 relative z-30">
            <div className="relative group/avatar">
              <input ref={avatarInputRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) setAvatarSrc(URL.createObjectURL(f)); }} />
              <div className="w-44 h-44 rounded-[2.5rem] border-[10px] border-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden bg-white group-hover/avatar:scale-[1.02] transition-transform duration-500">
                {avatarSrc ? (
                  <img src={avatarSrc} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#1A6BFF] to-[#2563EB] flex items-center justify-center">
                    <span className="text-6xl font-black text-white">{userInitial}</span>
                  </div>
                )}
              </div>
              <motion.button whileHover={{ scale: 1.1, rotate: 10 }} whileTap={{ scale: 0.9 }}
                onClick={() => avatarInputRef.current?.click()}
                className="absolute bottom-4 right-4 w-12 h-12 bg-[#0A0F1E] text-white rounded-2xl flex items-center justify-center shadow-2xl border-4 border-white z-40"
                title="Change photo">
                <Camera size={20} />
              </motion.button>
            </div>

            <motion.button whileHover={{ y: -4, scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => setEditMode(!editMode)}
              className={`flex items-center gap-3 px-10 py-4 rounded-[1.5rem] text-sm font-black transition-all shadow-2xl tracking-widest uppercase ${
                editMode ? 'bg-orange-600 text-white shadow-orange-500/20' : 'bg-[#0A0F1E] text-white shadow-black/20 hover:bg-orange-600'
              }`}>
              {editMode ? <><Check size={18} /> Save Changes</> : <><Edit2 size={18} /> Edit Profile</>}
            </motion.button>
          </div>

          <div className="space-y-4">
            <div>
              {editMode ? (
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="text-4xl font-black text-[#0A0F1E] tracking-tight bg-transparent border-b-2 border-orange-400 outline-none w-full"
                />
              ) : (
                <h2 className="text-4xl font-black text-[#0A0F1E] tracking-tight">{name}</h2>
              )}
              <p className="text-[#64748B] font-bold text-lg mt-1 flex items-center gap-3">
                {cls ?? 'Class not set'}
                {rollNo && (
                  <><span className="w-1.5 h-1.5 rounded-full bg-orange-300" />Roll No: {rollNo}</>
                )}
              </p>
              {school && (
                <p className="text-[#94A3B8] font-medium text-sm mt-0.5">{school}</p>
              )}
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <span className="inline-flex items-center gap-2 text-xs font-black text-green-700 bg-green-50 border border-green-200 px-4 py-2 rounded-xl">
                <Shield size={14} /> ACTIVE STUDENT
              </span>
              <span className="inline-flex items-center gap-2 text-xs font-black text-orange-700 bg-orange-50 border border-orange-200 px-4 py-2 rounded-xl">
                <Clock size={14} /> AY {new Date().getFullYear()}–{(new Date().getFullYear() + 1).toString().slice(2)}
              </span>
              {avgScore !== null && avgScore >= 80 && (
                <span className="inline-flex items-center gap-2 text-xs font-black text-blue-700 bg-blue-50 border border-blue-200 px-4 py-2 rounded-xl">
                  <Sparkles size={14} /> TOP PERFORMER
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats row — real data */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((s, i) => (
          <GlassCard key={s.label} delay={i * 0.1} className="flex flex-col items-center text-center">
            <div className={`w-14 h-14 rounded-2xl ${s.bg} flex items-center justify-center mb-4 shadow-inner`}>
              <s.icon size={28} className={s.color} />
            </div>
            <p className="text-3xl font-black text-[#0A0F1E] tracking-tight">{s.value}</p>
            <p className="text-xs font-bold text-[#94A3B8] uppercase tracking-widest mt-1">{s.label}</p>
          </GlassCard>
        ))}
      </div>

      {/* Info grid — real data from session */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <GlassCard delay={0.4}>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
              <User size={20} className="text-orange-600" />
            </div>
            <h3 className="font-black text-[#0A0F1E] text-lg">Profile Information</h3>
          </div>
          <div className="space-y-5">
            {personalInfo.map((info) => (
              <div key={info.label} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center shrink-0">
                  <info.icon size={18} className="text-[#64748B]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">{info.label}</p>
                  <p className="text-base font-bold text-[#0A0F1E] mt-0.5">{info.value}</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard delay={0.5}>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <BookOpen size={20} className="text-blue-600" />
            </div>
            <h3 className="font-black text-[#0A0F1E] text-lg">Evaluation Summary</h3>
          </div>
          {evalsLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 size={24} className="animate-spin text-muted-foreground/40" />
            </div>
          ) : evals.length === 0 ? (
            <div className="text-center py-8">
              <ClipboardList size={32} className="text-muted-foreground/20 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No evaluations yet</p>
              <p className="text-xs text-muted-foreground mt-1">Submit an answer sheet to get evaluated</p>
            </div>
          ) : (
            <div className="space-y-4">
              {[
                { label: 'Total Evaluations', value: evals.length },
                { label: 'Completed',         value: finalized.length },
                { label: 'Pending / Review',  value: pending },
                { label: 'Average Score',     value: avgScore !== null ? `${avgScore}%` : '—' },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between py-2 border-b border-[#E2E8F5]/40 last:border-0">
                  <p className="text-sm text-[#64748B] font-medium">{label}</p>
                  <p className="text-sm font-black text-[#0A0F1E]">{value}</p>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>

      {/* Recent evaluations — real data */}
      <GlassCard delay={0.6} className="p-0 overflow-hidden">
        <div className="px-8 py-6 border-b border-[#E2E8F5]/50 flex items-center justify-between bg-[#F8FAFF]/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center">
              <ClipboardList size={24} className="text-amber-600" />
            </div>
            <div>
              <h3 className="font-black text-[#0A0F1E] text-lg">Recent Evaluations</h3>
              <p className="text-sm text-[#64748B] font-medium">
                {evalsLoading ? 'Loading…' : `${evals.length} submission${evals.length !== 1 ? 's' : ''} found`}
              </p>
            </div>
          </div>
          <Link href="/student-dashboard/results">
            <button className="flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700 font-black transition-all">
              View All <ChevronRight size={16} />
            </button>
          </Link>
        </div>

        {evalsLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 size={22} className="animate-spin text-muted-foreground/40" />
          </div>
        ) : evals.length === 0 ? (
          <div className="px-8 py-10 text-center">
            <ClipboardList size={28} className="text-muted-foreground/20 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No evaluations yet — submit your first answer sheet!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F8FAFF]/30">
                <tr>
                  {['Subject', 'Exam', 'Date', 'Score', 'Status'].map((h) => (
                    <th key={h} className="px-8 py-4 text-left text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.2em]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F5]/30">
                {evals.map((e) => (
                  <motion.tr key={e.id} whileHover={{ backgroundColor: 'rgba(248,250,255,0.8)' }} className="transition-all">
                    <td className="px-8 py-5">
                      <span className="text-base font-bold text-[#0A0F1E]">{e.subject ?? '—'}</span>
                    </td>
                    <td className="px-8 py-5 text-sm font-medium text-[#64748B]">{e.examTitle ?? 'Evaluation'}</td>
                    <td className="px-8 py-5 text-sm font-medium text-[#64748B]">{e.submittedAt ?? '—'}</td>
                    <td className="px-8 py-5">
                      <span className="text-base font-black text-[#0A0F1E]">
                        {e.obtained != null && e.maxMarks ? `${e.obtained}/${e.maxMarks}` : '—'}
                      </span>
                    </td>
                    <td className="px-8 py-5">{statusBadge(e.status)}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      {/* ── Account Settings (merged) ─────────────────────────────── */}
      <div id="settings" className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-[#0A0F1E] tracking-tight">Account Settings</h3>
            <p className="text-sm text-[#64748B] font-medium mt-0.5">Manage notifications and security</p>
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={handleSaveSettings} disabled={isSavingSettings}
            className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-orange-600 text-white font-black shadow-lg shadow-orange-600/20 hover:bg-orange-700 transition-all disabled:opacity-50 text-sm">
            <Save size={15} />
            {isSavingSettings ? 'Saving…' : 'Save Settings'}
          </motion.button>
        </div>

        {/* Notification Preferences */}
        <GlassCard delay={0.7}>
          <div className="flex items-center gap-4 mb-7">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 flex items-center justify-center shadow-inner">
              <Bell size={22} className="text-blue-600" />
            </div>
            <div>
              <h4 className="font-black text-[#0A0F1E] text-base">Notification Preferences</h4>
              <p className="text-xs text-[#94A3B8] font-bold uppercase tracking-widest mt-0.5">Control your alerts</p>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { key: 'email' as const,         label: 'Email Notifications', desc: 'Get automated updates sent to your inbox' },
              { key: 'results' as const,        label: 'Result Alerts',       desc: 'Instant notification when results are published' },
              { key: 'announcements' as const,  label: 'Announcements',       desc: 'Important school-wide news and updates' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between p-4 rounded-2xl bg-[#F8FAFF] border border-[#E2E8F5]/50 hover:border-orange-200/50 transition-all group">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${notifications[item.key] ? 'bg-orange-100/50' : 'bg-gray-100'}`}>
                    <Bell size={16} className={notifications[item.key] ? 'text-orange-600' : 'text-[#94A3B8]'} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#0A0F1E] group-hover:text-orange-600 transition-colors">{item.label}</p>
                    <p className="text-xs font-medium text-[#64748B]">{item.desc}</p>
                  </div>
                </div>
                <Toggle active={notifications[item.key]} onClick={() => setNotifications((prev) => ({ ...prev, [item.key]: !prev[item.key] }))} />
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Security */}
        <GlassCard delay={0.8}>
          <div className="flex items-center gap-4 mb-7">
            <div className="w-11 h-11 rounded-2xl bg-green-50 flex items-center justify-center shadow-inner">
              <Shield size={22} className="text-green-600" />
            </div>
            <div>
              <h4 className="font-black text-[#0A0F1E] text-base">Security & Privacy</h4>
              <p className="text-xs text-[#94A3B8] font-bold uppercase tracking-widest mt-0.5">Keep your account safe</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { label: 'Current Password', placeholder: '••••••••' },
              { label: 'New Password',     placeholder: '••••••••' },
              { label: 'Confirm Password', placeholder: '••••••••' },
            ].map((field) => (
              <div key={field.label}>
                <label className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest block mb-2 ml-1">{field.label}</label>
                <input type="password" placeholder={field.placeholder}
                  className="w-full text-base font-bold text-[#0A0F1E] bg-[#F8FAFF] border border-[#E2E8F5] rounded-2xl px-5 py-3.5 focus:bg-white focus:border-green-500/30 focus:ring-4 focus:ring-green-500/5 transition-all outline-none" />
              </div>
            ))}
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="mt-7 px-8 py-3.5 bg-[#0A0F1E] hover:bg-green-600 text-white font-black rounded-2xl transition-all shadow-xl shadow-black/10 flex items-center gap-2 group text-sm">
            <Lock size={16} className="group-hover:rotate-12 transition-transform" />
            Update Password
          </motion.button>
        </GlassCard>
      </div>
    </div>
  );
}
