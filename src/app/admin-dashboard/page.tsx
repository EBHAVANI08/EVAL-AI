'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, School, BarChart3, Settings, LogOut,
  ChevronLeft, ChevronRight, Bell, ShieldCheck, UserCheck,
  ClipboardCheck, TrendingUp, AlertTriangle, Plus, Activity,
  FileText, Link2, Loader2, ArrowRight, CalendarDays, ChevronDown, Sparkles,
  Search, Globe, Mail, GraduationCap, BookOpen, Trash2, Eye, EyeOff, X, Copy, Check
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import GlassCard from '@/components/GlassCard';
import NotificationDropdown from '@/components/NotificationDropdown';
import ProfileDropdown from '@/components/ProfileDropdown';

const navGroups = [
  { label: null, items: [{ label: 'Overview', icon: LayoutDashboard }] },
  {
    label: 'Management',
    items: [
      { label: 'Users',       icon: Users },
      { label: 'Schools',     icon: School },
      { label: 'Exams',       icon: FileText },
      { label: 'Submissions', icon: ClipboardCheck },
    ],
  },
  {
    label: 'Analytics',
    items: [
      { label: 'Analytics',    icon: BarChart3 },
      { label: 'Reports',      icon: Activity },
      { label: 'Integrations', icon: Link2 },
    ],
  },
  { label: 'System', items: [{ label: 'Settings', icon: Settings }] },
];

const weeklyData = [
  { week: 'Apr 15-21', evaluated: 1800, pending: 400 },
  { week: 'Apr 22-28', evaluated: 1900, pending: 450 },
  { week: 'Apr 29-5',  evaluated: 2100, pending: 500 },
  { week: 'May 6-12',  evaluated: 1950, pending: 480 },
  { week: 'May 13-20', evaluated: 2000, pending: 420 },
];

const regionData = [
  { country: 'United Arab Emirates', count: 786, flag: '🇦🇪' },
  { country: 'Saudi Arabia',       count: 542, flag: '🇸🇦' },
  { country: 'Qatar',              count: 321, flag: '🇶🇦' },
  { country: 'Kuwait',             count: 189, flag: '🇰🇼' },
  { country: 'Oman',               count: 145, flag: '🇴🇲' },
];

const subjectData = [
  { name: 'Mathematics', value: 28, color: '#1A6BFF' },
  { name: 'Science',     value: 24, color: '#06B6D4' },
  { name: 'English',     value: 20, color: '#10B981' },
  { name: 'Physics',     value: 12, color: '#7C3AED' },
  { name: 'Chemistry',   value:  8, color: '#F59E0B' },
  { name: 'Others',      value:  8, color: '#94A3B8' },
];

const activityFeed = [
  { text: 'Biology Midterm Exam completed by Grade 11A', time: '2m ago',  initials: 'BM', color: '#10B981' },
  { text: 'New teacher Sarah Johnson joined Greenfield School', time: '15m ago', initials: 'SJ', color: '#1A6BFF' },
  { text: 'Physics Quiz submitted by 45 students', time: '1h ago', initials: 'PQ', color: '#F59E0B' },
  { text: 'AI evaluation completed for 120 submissions', time: '2h ago', initials: 'AI', color: '#7C3AED' },
];

const topSchools = [
  { name: 'Greenfield International School', score: 92 },
  { name: 'Bright Future Academy',           score: 88 },
  { name: 'Dubai Scholars School',           score: 85 },
  { name: 'Al Noor International School',    score: 82 },
  { name: 'Gulf Education School',           score: 79 },
];

type UserRow = { id: string; name: string; email: string; role: string; rollNo: string | null; studentClass: string | null; school: string | null; createdAt: string };

const BLANK_FORM = { name: '', email: '', password: '', role: 'student' as 'teacher' | 'student', rollNo: '', studentClass: '', school: '' };

function UsersSection() {
  const [tab, setTab] = useState<'all' | 'teacher' | 'student'>('all');
  const [userList, setUserList] = useState<UserRow[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(BLANK_FORM);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchUsers = () => {
    setLoadingUsers(true);
    fetch('/api/users/register')
      .then(r => r.json())
      .then(d => { if (d.users) setUserList(d.users); })
      .catch(() => {})
      .finally(() => setLoadingUsers(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const filtered = userList.filter(u => {
    const matchTab = tab === 'all' || u.role === tab;
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const handleCreate = async () => {
    if (!form.name || !form.email || !form.password) { setSaveError('Name, email and password are required.'); return; }
    setSaving(true); setSaveError('');
    try {
      const res = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, role: form.role }),
      });
      const data = await res.json();
      if (!res.ok) { setSaveError(data.error ?? 'Failed to create user'); return; }
      setUserList(prev => [{ id: data.id, name: form.name, email: form.email, role: form.role, rollNo: form.rollNo || null, studentClass: form.studentClass || null, school: form.school || null, createdAt: new Date().toISOString() }, ...prev]);
      setShowModal(false);
      setForm(BLANK_FORM);
    } catch (e: any) { setSaveError(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this user? They will lose access immediately.')) return;
    await fetch(`/api/users/register?id=${id}`, { method: 'DELETE' });
    setUserList(prev => prev.filter(u => u.id !== id));
  };

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <motion.div key="users" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-[#0A0F1E] tracking-tighter">User Management</h2>
          <p className="text-[#64748B] font-bold mt-1">Create and manage teacher & student login credentials</p>
        </div>
        <button
          onClick={() => { setShowModal(true); setSaveError(''); setForm(BLANK_FORM); }}
          className="flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-[#0A0F1E] text-white font-black text-sm hover:bg-[#059669] transition-all shadow-xl active:scale-95"
        >
          <Plus size={18} /> Add User
        </button>
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-2 bg-white border border-[#E2E8F5] rounded-2xl p-1.5">
          {(['all', 'teacher', 'student'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${tab === t ? 'bg-[#0A0F1E] text-white shadow-md' : 'text-[#64748B] hover:bg-[#F8FAFF]'}`}>
              {t === 'all' ? 'All Users' : t === 'teacher' ? 'Teachers' : 'Students'}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 bg-white border border-[#E2E8F5] rounded-2xl px-4 py-2.5 flex-1 max-w-xs">
          <Search size={15} className="text-[#94A3B8]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email…"
            className="bg-transparent text-xs font-bold text-[#0A0F1E] outline-none w-full placeholder:text-[#94A3B8]" />
        </div>
        <span className="text-xs font-black text-[#94A3B8] ml-auto">{filtered.length} user{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Table */}
      <GlassCard className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#F1F5F9]">
                {['User', 'Role', 'Email', 'Roll / Class', 'School', 'Created', ''].map(h => (
                  <th key={h} className="px-6 py-5 text-left text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.2em]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F8FAFF]">
              {loadingUsers ? (
                <tr><td colSpan={7} className="py-16 text-center"><Loader2 size={24} className="animate-spin text-[#94A3B8] mx-auto mb-2" /><p className="text-sm font-bold text-[#94A3B8]">Loading users…</p></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="py-16 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-[#F8FAFF] flex items-center justify-center mx-auto mb-3"><Users size={24} className="text-[#CBD5E1]" /></div>
                  <p className="text-sm font-black text-[#0A0F1E]">No users found</p>
                  <p className="text-xs font-bold text-[#94A3B8] mt-1">Click "Add User" to create the first account</p>
                </td></tr>
              ) : filtered.map((u, i) => (
                <motion.tr key={u.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  className="hover:bg-[#F8FAFF] transition-all group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm border-2 border-white shadow-sm ${u.role === 'teacher' ? 'bg-[#EEF4FF] text-[#1A6BFF]' : 'bg-[#FFF7ED] text-orange-600'}`}>
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <p className="text-sm font-black text-[#0A0F1E]">{u.name}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${u.role === 'teacher' ? 'bg-[#EEF4FF] text-[#1A6BFF]' : 'bg-[#FFF7ED] text-orange-600'}`}>
                      {u.role === 'teacher' ? '👨‍🏫 Teacher' : '🎓 Student'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#64748B]">{u.email}</span>
                      <button onClick={() => copyText(u.email, u.id + '-email')} className="opacity-0 group-hover:opacity-100 transition-opacity">
                        {copiedId === u.id + '-email' ? <Check size={12} className="text-green-500" /> : <Copy size={12} className="text-[#94A3B8]" />}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-[#64748B]">{u.rollNo ?? '—'} {u.studentClass ? `· ${u.studentClass}` : ''}</td>
                  <td className="px-6 py-4 text-xs font-bold text-[#64748B]">{u.school ?? '—'}</td>
                  <td className="px-6 py-4 text-xs font-bold text-[#94A3B8]">{new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td className="px-6 py-4">
                    <button onClick={() => handleDelete(u.id)} className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center text-red-500 hover:bg-red-100 transition-all">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Create User Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
            <div className="fixed inset-0 z-[71] flex items-center justify-center p-4 pointer-events-none">
              <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }} transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                className="w-full max-w-lg bg-white rounded-[2.5rem] shadow-[0_40px_80px_rgba(0,0,0,0.2)] overflow-hidden pointer-events-auto">
                <div className="h-1.5 bg-gradient-to-r from-[#059669] to-[#10B981]" />
                <div className="px-8 py-6 border-b border-[#F1F5F9] flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-black text-[#0A0F1E]">Add New User</h3>
                    <p className="text-xs font-bold text-[#94A3B8] mt-1 uppercase tracking-widest">Create login credentials</p>
                  </div>
                  <button onClick={() => setShowModal(false)} className="w-9 h-9 rounded-xl hover:bg-[#F8FAFF] flex items-center justify-center text-[#94A3B8]"><X size={18} /></button>
                </div>

                <div className="px-8 py-6 space-y-5">
                  {/* Role toggle */}
                  <div>
                    <label className="block text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mb-2">Role</label>
                    <div className="flex gap-3">
                      {(['teacher', 'student'] as const).map(r => (
                        <button key={r} onClick={() => setForm(f => ({ ...f, role: r }))}
                          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-black border-2 transition-all ${form.role === r ? (r === 'teacher' ? 'bg-[#EEF4FF] border-[#1A6BFF] text-[#1A6BFF]' : 'bg-[#FFF7ED] border-orange-400 text-orange-600') : 'bg-white border-[#E2E8F5] text-[#94A3B8]'}`}>
                          {r === 'teacher' ? <><GraduationCap size={16} /> Teacher</> : <><BookOpen size={16} /> Student</>}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Name + Email */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mb-1.5">Full Name *</label>
                      <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Priya Sharma"
                        className="w-full px-4 py-3 rounded-xl border border-[#E2E8F5] text-sm font-bold text-[#0A0F1E] outline-none focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/10 transition-all bg-[#F8FAFF]" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mb-1.5">Email Address *</label>
                      <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="user@school.edu"
                        className="w-full px-4 py-3 rounded-xl border border-[#E2E8F5] text-sm font-bold text-[#0A0F1E] outline-none focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/10 transition-all bg-[#F8FAFF]" />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mb-1.5">Password *</label>
                    <div className="relative">
                      <input type={showPass ? 'text' : 'password'} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Min 8 characters"
                        className="w-full px-4 py-3 pr-12 rounded-xl border border-[#E2E8F5] text-sm font-bold text-[#0A0F1E] outline-none focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/10 transition-all bg-[#F8FAFF]" />
                      <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0A0F1E]">
                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Student-only fields */}
                  {form.role === 'student' && (
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mb-1.5">Roll No</label>
                        <input value={form.rollNo} onChange={e => setForm(f => ({ ...f, rollNo: e.target.value }))} placeholder="e.g. 2024001"
                          className="w-full px-3 py-2.5 rounded-xl border border-[#E2E8F5] text-xs font-bold text-[#0A0F1E] outline-none focus:border-orange-400 bg-[#F8FAFF]" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mb-1.5">Class</label>
                        <input value={form.studentClass} onChange={e => setForm(f => ({ ...f, studentClass: e.target.value }))} placeholder="e.g. 12A"
                          className="w-full px-3 py-2.5 rounded-xl border border-[#E2E8F5] text-xs font-bold text-[#0A0F1E] outline-none focus:border-orange-400 bg-[#F8FAFF]" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mb-1.5">School</label>
                        <input value={form.school} onChange={e => setForm(f => ({ ...f, school: e.target.value }))} placeholder="School name"
                          className="w-full px-3 py-2.5 rounded-xl border border-[#E2E8F5] text-xs font-bold text-[#0A0F1E] outline-none focus:border-orange-400 bg-[#F8FAFF]" />
                      </div>
                    </div>
                  )}

                  {saveError && <p className="text-xs font-bold text-red-500 bg-red-50 px-4 py-3 rounded-xl border border-red-100">{saveError}</p>}
                </div>

                <div className="px-8 pb-8 flex gap-3">
                  <button onClick={() => setShowModal(false)} className="flex-1 py-3.5 rounded-2xl border border-[#E2E8F5] text-sm font-black text-[#64748B] hover:bg-[#F8FAFF] transition-all">Cancel</button>
                  <button onClick={handleCreate} disabled={saving}
                    className="flex-1 py-3.5 rounded-2xl bg-[#059669] text-white text-sm font-black hover:bg-[#047857] transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-xl shadow-green-500/20">
                    {saving ? <><Loader2 size={16} className="animate-spin" /> Creating…</> : <><Plus size={16} /> Create Account</>}
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function AdminDashboardPage() {
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);
  const [activeNav, setActiveNav] = useState('Overview');
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const userName = session?.user?.name ?? 'Admin';
  const userInitial = userName.charAt(0).toUpperCase();

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/stats').then(r => r.json()).catch(() => ({})),
      fetch('/api/students').then(r => r.json()).catch(() => ({ students: [] })),
    ])
      .then(([statsRes, usersRes]) => {
        setStats(statsRes);
        if (usersRes.students) setUsers(usersRes.students.slice(0, 5));
      })
      .catch(err => console.error('Admin dashboard fetch error:', err))
      .finally(() => setLoading(false));
  }, []);

  const platformStats = [
    { label: 'Teachers', value: loading ? '…' : String(stats?.totalTeachers || 0), sub: '↑ 6% this month', color: '#10B981', bg: 'bg-green-50' },
    { label: 'Students', value: loading ? '…' : String(stats?.totalStudents || 0), sub: '↑ 12% this month', color: '#1A6BFF', bg: 'bg-blue-50' },
    { label: 'Schools', value: loading ? '…' : String(stats?.totalSchools || 0), sub: '↑ 2 this month', color: '#7C3AED', bg: 'bg-purple-50' },
    { label: 'Exams Held', value: loading ? '…' : String(stats?.totalEvaluations || 0), sub: '↑ 15% this month', color: '#06B6D4', bg: 'bg-cyan-50' },
    { label: 'Submissions', value: loading ? '…' : String(stats?.activeSessions || 0), sub: '↑ 18% this month', color: '#DB2777', bg: 'bg-pink-50' },
    { label: 'Avg Score', value: loading ? '…' : (stats?.avgScore ? `${stats.avgScore}%` : '78%'), sub: '↑ 5% this month', color: '#F59E0B', bg: 'bg-amber-50' },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFF] relative">
      
      {/* Sidebar */}
      <aside
        className={`relative flex flex-col bg-white border-r border-[#E2E8F5] shrink-0 transition-all duration-500 z-50 shadow-[20px_0_60px_rgba(0,0,0,0.02)]`}
        style={{ width: collapsed ? 100 : 300 }}
      >
        <div className="flex items-center gap-4 px-8 py-10 overflow-hidden shrink-0">
          <div className="w-12 h-12 rounded-[1.25rem] bg-gradient-to-br from-[#059669] to-[#10B981] shadow-xl shadow-green-500/20 flex items-center justify-center shrink-0 border-2 border-white">
            <ShieldCheck size={24} className="text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-black text-xl text-[#0A0F1E] tracking-tighter leading-none">Grade.ai</span>
              <span className="text-[10px] text-[#059669] font-black uppercase tracking-[0.2em] mt-1.5">Super Admin</span>
            </div>
          )}
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-4 top-12 w-8 h-8 rounded-xl bg-white border border-[#E2E8F5] flex items-center justify-center shadow-xl hover:scale-110 transition-all active:scale-95 z-[60]"
        >
          {collapsed ? <ChevronRight size={14} className="text-[#64748B]" /> : <ChevronLeft size={14} className="text-[#64748B]" />}
        </button>

        <nav className="flex-1 py-6 px-4 overflow-y-auto space-y-10 scrollbar-none">
          {navGroups.map((group, gi) => (
            <div key={gi}>
              {group.label && !collapsed && (
                <p className="text-[10px] font-black text-[#CBD5E1] uppercase tracking-[0.3em] px-5 mb-5">{group.label}</p>
              )}
              <div className="space-y-1.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeNav === item.label;
                  return (
                    <button 
                      key={item.label} 
                      onClick={() => setActiveNav(item.label)}
                      className={`group relative w-full flex items-center gap-4 px-5 py-4 rounded-[1.25rem] text-sm transition-all duration-300
                        ${collapsed ? 'justify-center !px-0' : ''}
                        ${isActive ? 'bg-[#ECFDF5] text-[#059669] shadow-inner font-black' : 'text-[#64748B] hover:bg-[#F8FAFF] hover:text-[#0A0F1E] font-bold'}`}
                    >
                      {isActive && (
                        <motion.div 
                          layoutId="activeNavTab"
                          className="absolute inset-0 bg-[#ECFDF5] rounded-[1.25rem] -z-10"
                        />
                      )}
                      <Icon size={20} className={`${isActive ? 'text-[#059669]' : 'text-[#94A3B8] group-hover:text-[#0A0F1E]'} transition-colors shrink-0`} />
                      {!collapsed && <span>{item.label}</span>}
                      {isActive && !collapsed && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-auto w-1.5 h-1.5 rounded-full bg-[#059669]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-6 mt-auto">
          <div className={`p-4 rounded-[2rem] bg-[#F8FAFF] border border-[#E2E8F5] flex items-center gap-4 transition-all ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-12 h-12 rounded-2xl bg-white border border-[#E2E8F5] flex items-center justify-center shrink-0 shadow-sm relative group cursor-pointer">
              <span className="text-base font-black text-[#059669]">{userInitial}</span>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-sm font-black text-[#0A0F1E] truncate">{userName}</p>
                <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mt-0.5">Administrator</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto scrollbar-thin relative z-0">
        
        {/* Top Header */}
        <div className="bg-white/80 backdrop-blur-2xl border-b border-[#E2E8F5]/50 px-10 py-8 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-8">
            <div className="hidden xl:flex items-center gap-3 px-5 py-3 bg-[#F8FAFF] border border-[#E2E8F5] rounded-2xl min-w-[320px] focus-within:border-green-500/30 focus-within:bg-white focus-within:ring-4 focus-within:ring-green-500/5 transition-all">
              <Search size={18} className="text-[#94A3B8]" />
              <input type="text" placeholder="Global platform search..." className="bg-transparent border-none text-sm font-bold text-[#0A0F1E] outline-none w-full placeholder:text-[#94A3B8]" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="px-2 py-0.5 rounded-md bg-green-50 border border-green-100 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-green-700 text-[10px] font-black uppercase tracking-widest">LIVE STATUS</span>
                </div>
              </div>
              <h1 className="text-2xl font-black text-[#0A0F1E] tracking-tight">Admin Console</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <button className="hidden lg:flex items-center gap-2 px-5 py-3 bg-white border border-[#E2E8F5] rounded-2xl text-xs font-black text-[#64748B] hover:bg-[#F8FAFF] transition-all shadow-sm active:scale-95">
              <CalendarDays size={16} />
              May 13 – May 20, 2025
              <ChevronDown size={14} />
            </button>
            
            <div className="relative">
              <button 
                onClick={() => setNotifOpen(!notifOpen)}
                className={`relative p-3.5 rounded-2xl border transition-all shadow-sm group active:scale-95 ${notifOpen ? 'bg-[#0A0F1E] border-[#0A0F1E] text-white' : 'bg-white border-[#E2E8F5] text-[#64748B] hover:bg-[#F8FAFF]'}`}
              >
                <Bell size={20} className={notifOpen ? 'text-white' : 'group-hover:text-[#0A0F1E]'} />
                <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-orange-500 rounded-full border-2 border-white shadow-sm" />
              </button>
              <NotificationDropdown isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
            </div>

            <div className="h-10 w-[1px] bg-[#E2E8F5] mx-2" />
            
            <div className="relative">
              <div 
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-4 pl-2 group cursor-pointer select-none"
              >
                <div className="w-12 h-12 rounded-[1.25rem] bg-[#ECFDF5] flex items-center justify-center border-2 border-white shadow-lg shadow-green-500/10 transition-transform group-hover:scale-105 active:scale-95">
                  <span className="text-base font-black text-[#059669]">{userInitial}</span>
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-black text-[#0A0F1E] leading-none flex items-center gap-2">
                    {userName}
                    <ChevronDown size={14} className={`text-[#94A3B8] transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                  </p>
                  <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mt-1.5">Super Admin</p>
                </div>
              </div>
              <ProfileDropdown isOpen={profileOpen} onClose={() => setProfileOpen(false)} user={{ name: userName, email: 'admin@grade.ai', role: 'Super Admin' }} profileHref="/admin-dashboard/profile" />
            </div>
          </div>
        </div>

        <div className="p-10 space-y-12">
          <AnimatePresence mode="wait">
            {activeNav === 'Users' ? (
              <UsersSection />
            ) : activeNav === 'Overview' ? (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-12"
              >
                {/* Stats Row */}
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                  {platformStats.map((s, i) => (
                    <GlassCard key={s.label} delay={i * 0.05} className="flex flex-col">
                      <div className={`w-12 h-12 rounded-2xl ${s.bg} flex items-center justify-center mb-5 shadow-inner`}>
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                      </div>
                      <p className="text-4xl font-black text-[#0A0F1E] tracking-tighter">{s.value}</p>
                      <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.2em] mt-2">{s.label}</p>
                      <p className="text-[11px] font-bold text-green-600 mt-4 flex items-center gap-1.5">
                        <TrendingUp size={12} /> {s.sub}
                      </p>
                    </GlassCard>
                  ))}
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                  <GlassCard delay={0.4} className="xl:col-span-2">
                    <div className="flex items-center justify-between mb-10">
                      <div>
                        <h3 className="font-black text-[#0A0F1E] text-xl">System Performance</h3>
                        <p className="text-sm text-[#64748B] font-bold mt-1">Real-time evaluation & pending queue analysis</p>
                      </div>
                      <div className="flex items-center gap-8">
                        <div className="flex items-center gap-3">
                          <div className="w-3.5 h-3.5 rounded-full bg-[#10B981] shadow-lg shadow-green-500/20" />
                          <span className="text-[11px] font-black text-[#64748B] uppercase tracking-widest">Processed</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-3.5 h-3.5 rounded-full bg-[#A7F3D0]" />
                          <span className="text-[11px] font-black text-[#64748B] uppercase tracking-widest">In Queue</span>
                        </div>
                      </div>
                    </div>
                    <div className="h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={weeklyData} barSize={24} barGap={12}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                          <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#94A3B8', fontWeight: 900 }} axisLine={false} tickLine={false} dy={15} />
                          <YAxis tick={{ fontSize: 11, fill: '#94A3B8', fontWeight: 900 }} axisLine={false} tickLine={false} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#0A0F1E', border: 'none', borderRadius: '24px', color: '#fff', padding: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}
                            cursor={{ fill: 'rgba(241,245,249,0.5)', radius: 12 }}
                          />
                          <Bar dataKey="evaluated" fill="#10B981" radius={[8, 8, 8, 8]} />
                          <Bar dataKey="pending" fill="#A7F3D0" radius={[8, 8, 8, 8]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </GlassCard>

                  <GlassCard delay={0.5}>
                    <h3 className="font-black text-[#0A0F1E] text-xl mb-10">Capacity Insight</h3>
                    <div className="flex flex-col items-center">
                      <div className="relative w-full h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie 
                              data={subjectData} 
                              cx="50%" 
                              cy="50%" 
                              innerRadius={80} 
                              outerRadius={110} 
                              dataKey="value" 
                              strokeWidth={6} 
                              stroke="#fff"
                              animationDuration={1500}
                              paddingAngle={4}
                            >
                              {subjectData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                          <p className="text-4xl font-black text-[#0A0F1E]">84%</p>
                          <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.3em] mt-1">Utilization</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-x-10 gap-y-5 mt-10 w-full px-6">
                        {subjectData.slice(0, 4).map((s) => (
                          <div key={s.name} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-3 h-3 rounded-full" style={{ background: s.color }} />
                              <span className="text-xs font-black text-[#64748B]">{s.name}</span>
                            </div>
                            <span className="text-xs font-black text-[#0A0F1E]">{s.value}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </GlassCard>
                </div>

                {/* Bottom Stats Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                  <GlassCard delay={0.6}>
                    <div className="flex items-center justify-between mb-10">
                      <h3 className="font-black text-[#0A0F1E] text-xl">Global Outreach</h3>
                      <Globe size={20} className="text-[#94A3B8]" />
                    </div>
                    <div className="space-y-7">
                      {regionData.map((r, i) => (
                        <div key={i} className="flex items-center gap-5">
                          <span className="text-2xl shrink-0">{r.flag}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2.5">
                              <p className="text-xs font-black text-[#0A0F1E] uppercase tracking-wider">{r.country}</p>
                              <p className="text-xs font-black text-[#64748B]">{r.count}</p>
                            </div>
                            <div className="h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }} 
                                whileInView={{ width: `${(r.count / 786) * 100}%` }}
                                className="h-full bg-gradient-to-r from-[#059669] to-[#10B981] rounded-full shadow-lg shadow-green-500/10" 
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </GlassCard>

                  <GlassCard delay={0.7} className="xl:col-span-2">
                    <div className="flex items-center justify-between mb-10">
                      <div>
                        <h3 className="font-black text-[#0A0F1E] text-xl">Platform Operations</h3>
                        <p className="text-sm text-[#64748B] font-bold mt-1">Live registration and active student monitoring</p>
                      </div>
                      <button className="flex items-center gap-3 text-xs font-black text-white bg-[#0A0F1E] hover:bg-green-600 px-6 py-3.5 rounded-[1.25rem] transition-all shadow-xl shadow-black/10 active:scale-95 group">
                        <Plus size={18} className="group-hover:rotate-90 transition-transform" /> 
                        Add Management Unit
                      </button>
                    </div>
                    <div className="overflow-x-auto -mx-10 px-10">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-[#F1F5F9]">
                            {['Entity Name', 'ID/Code', 'Category', 'Operations', 'Health Status'].map(h => (
                              <th key={h} className="pb-5 text-left text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.2em]">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F1F5F9]/50">
                          {users.map((u, i) => (
                            <tr key={i} className="group hover:bg-[#F8FAFF] transition-all cursor-pointer">
                              <td className="py-6 pr-4">
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 rounded-[1.25rem] bg-slate-50 border border-[#E2E8F5] flex items-center justify-center font-black text-[#0A0F1E] text-sm group-hover:bg-white group-hover:shadow-lg transition-all">{u.name.charAt(0)}</div>
                                  <div>
                                    <p className="text-sm font-black text-[#0A0F1E] leading-none">{u.name}</p>
                                    <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mt-1.5">{u.email || 'student@school.edu'}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-6 px-4 text-xs font-black text-[#64748B] uppercase tracking-widest">{u.rollNo || 'SYS-001'}</td>
                              <td className="py-6 px-4">
                                <span className="px-3 py-1.5 rounded-lg bg-[#F8FAFF] border border-[#E2E8F5] text-[10px] font-black text-[#64748B] uppercase tracking-widest">{u.class || 'Primary'}</span>
                              </td>
                              <td className="py-6 px-4 text-sm font-black text-[#0A0F1E]">{u.evalCount || 0} Evaluated</td>
                              <td className="py-6 pl-4">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-2 h-2 rounded-full bg-green-500 shadow-lg shadow-green-500/20" />
                                  <span className="text-[10px] font-black text-green-700 uppercase tracking-[0.2em]">Optimal</span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </GlassCard>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="other-sections"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="py-32"
              >
                <GlassCard className="max-w-2xl mx-auto text-center flex flex-col items-center py-24">
                  <div className="w-24 h-24 rounded-[2.5rem] bg-[#ECFDF5] flex items-center justify-center mb-10 shadow-inner group-hover:scale-110 transition-transform">
                    {(() => {
                      const item = navGroups.flatMap(g => g.items).find(i => i.label === activeNav);
                      const Icon = item?.icon ?? LayoutDashboard;
                      return <Icon size={48} className="text-[#059669]" />;
                    })()}
                  </div>
                  <h2 className="text-3xl font-black text-[#0A0F1E] mb-4 tracking-tighter uppercase">{activeNav}</h2>
                  <p className="text-[#64748B] font-bold text-lg max-w-sm leading-relaxed mb-12">
                    Our team is currently optimizing this segment for peak administrative performance. 
                  </p>
                  <button 
                    onClick={() => setActiveNav('Overview')}
                    className="flex items-center gap-3 px-10 py-5 rounded-[2rem] bg-[#0A0F1E] text-white font-black text-sm uppercase tracking-widest hover:bg-[#059669] transition-all shadow-2xl shadow-black/10 active:scale-95"
                  >
                    Return to Overview <ArrowRight size={18} />
                  </button>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Background Decorative Elements */}
      <div className="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-400/5 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-green-400/5 blur-[120px] rounded-full pointer-events-none -z-10" />
    </div>
  );
}
