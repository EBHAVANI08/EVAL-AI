'use client';

import React, { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ShieldCheck, Mail, Phone, MapPin, Calendar, Globe, Edit2,
  ChevronLeft, Users, School, FileText, BarChart3, Activity,
  Settings, LayoutDashboard, ClipboardCheck, Link2, LogOut,
  Camera, Sparkles, Check, Lock, Key, Clock, AlertTriangle,
} from 'lucide-react';

const adminStats = [
  { label: 'Users Managed',   value: '2,430',  icon: Users,        color: '#10B981', bg: 'bg-green-50'  },
  { label: 'Schools Linked',  value: '18',     icon: School,       color: '#1A6BFF', bg: 'bg-blue-50'   },
  { label: 'Exams Overseen',  value: '346',    icon: FileText,     color: '#7C3AED', bg: 'bg-purple-50' },
  { label: 'Reports Generated', value: '1,200', icon: BarChart3,  color: '#F59E0B', bg: 'bg-amber-50'  },
];

const recentActivity = [
  { action: 'Added new teacher: Sarah Johnson', time: '2 hours ago',  type: 'user',   color: '#10B981' },
  { action: 'Reviewed Physics exam submissions', time: '5 hours ago', type: 'exam',   color: '#1A6BFF' },
  { action: 'Updated platform security policy',  time: '1 day ago',   type: 'system', color: '#7C3AED' },
  { action: 'Generated monthly analytics report',time: '2 days ago',  type: 'report', color: '#F59E0B' },
  { action: 'Onboarded Gulf Education School',   time: '3 days ago',  type: 'school', color: '#06B6D4' },
];

const navGroups = [
  { label: null, items: [{ label: 'Overview', icon: LayoutDashboard }] },
  { label: 'Management', items: [
    { label: 'Users', icon: Users },
    { label: 'Schools', icon: School },
    { label: 'Exams', icon: FileText },
    { label: 'Submissions', icon: ClipboardCheck },
  ]},
  { label: 'Analytics', items: [
    { label: 'Analytics', icon: BarChart3 },
    { label: 'Reports', icon: Activity },
    { label: 'Integrations', icon: Link2 },
  ]},
  { label: 'System', items: [{ label: 'Settings', icon: Settings }] },
];

export default function AdminProfilePage() {
  const { data: session } = useSession();
  const [editMode, setEditMode] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const userName    = session?.user?.name ?? 'Super Admin';
  const userInitial = userName.charAt(0).toUpperCase();
  const userEmail   = (session?.user as any)?.email ?? 'admin@grade.ai';

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFF]">

      {/* Sidebar */}
      <aside
        className="relative flex flex-col bg-white border-r border-[#E2E8F5] shrink-0 transition-all duration-500 z-50 shadow-[20px_0_60px_rgba(0,0,0,0.02)]"
        style={{ width: collapsed ? 80 : 260 }}
      >
        <div className="flex items-center gap-4 px-6 py-8 overflow-hidden shrink-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#059669] to-[#10B981] shadow-lg shadow-green-500/20 flex items-center justify-center shrink-0">
            <ShieldCheck size={20} className="text-white" />
          </div>
          {!collapsed && (
            <div>
              <span className="font-black text-lg text-[#0A0F1E] tracking-tighter leading-none block">Grade.ai</span>
              <span className="text-[10px] text-[#059669] font-black uppercase tracking-[0.2em]">Super Admin</span>
            </div>
          )}
        </div>

        <nav className="flex-1 py-4 px-3 overflow-y-auto space-y-6 scrollbar-none">
          {navGroups.map((group, gi) => (
            <div key={gi}>
              {group.label && !collapsed && (
                <p className="text-[9px] font-black text-[#CBD5E1] uppercase tracking-[0.3em] px-4 mb-3">{group.label}</p>
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link key={item.label} href="/admin-dashboard"
                      className={`group flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all
                        ${collapsed ? 'justify-center' : ''}
                        text-[#64748B] hover:bg-[#F8FAFF] hover:text-[#0A0F1E]`}
                    >
                      <Icon size={18} className="text-[#94A3B8] group-hover:text-[#0A0F1E] transition-colors shrink-0" />
                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom user */}
        <div className="p-3 border-t border-[#E2E8F5]/50">
          <div className={`flex items-center gap-3 px-3 py-3 rounded-2xl bg-[#F8FAFF] ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#059669] to-[#10B981] flex items-center justify-center shrink-0">
              <span className="text-sm font-black text-white">{userInitial}</span>
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-black text-[#0A0F1E] truncate">{userName}</p>
                <p className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-tight">Administrator</p>
              </div>
            )}
            {!collapsed && (
              <button onClick={() => signOut({ callbackUrl: '/' })}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-[#94A3B8] hover:bg-red-50 hover:text-red-500 transition-all">
                <LogOut size={14} />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 overflow-y-auto">
        {/* Top bar */}
        <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-[#E2E8F5]/50 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin-dashboard">
              <button className="flex items-center gap-2 text-sm font-bold text-[#64748B] hover:text-[#0A0F1E] transition-colors">
                <ChevronLeft size={16} /> Back to Console
              </button>
            </Link>
            <div className="w-px h-5 bg-[#E2E8F5]" />
            <h1 className="text-lg font-black text-[#0A0F1E]">Admin Profile</h1>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> LIVE STATUS
          </div>
        </div>

        <div className="px-8 py-8 max-w-5xl mx-auto space-y-8">

          {/* Profile Hero */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="relative rounded-[2.5rem] overflow-hidden bg-white border border-[#E2E8F5] shadow-[0_20px_60px_rgba(0,0,0,0.05)]">
            {/* cover */}
            <div className="h-44 bg-gradient-to-r from-[#059669] via-[#10B981] to-[#06B6D4] relative overflow-hidden">
              <div className="absolute inset-0 opacity-20"
                style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
              <div className="absolute top-6 right-6 flex items-center gap-2 text-[10px] text-white font-black bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl border border-white/30 uppercase tracking-widest">
                <ShieldCheck size={12} /> Super Admin
              </div>
            </div>

            <div className="px-10 pb-10">
              <div className="flex items-end justify-between -mt-16 mb-8 relative z-10">
                {/* Avatar */}
                <div className="w-36 h-36 rounded-[2rem] border-[8px] border-white shadow-[0_16px_40px_rgba(0,0,0,0.12)] overflow-hidden bg-gradient-to-br from-[#059669] to-[#10B981] flex items-center justify-center">
                  <span className="text-5xl font-black text-white">{userInitial}</span>
                </div>
                {/* Actions */}
                <div className="flex gap-3">
                  <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
                    onClick={() => setEditMode(!editMode)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-black transition-all shadow-lg ${
                      editMode
                        ? 'bg-green-600 text-white shadow-green-500/20'
                        : 'bg-[#0A0F1E] text-white shadow-black/10 hover:bg-green-600'
                    }`}>
                    {editMode ? <><Check size={16} /> Save Changes</> : <><Edit2 size={16} /> Edit Profile</>}
                  </motion.button>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <h2 className="text-3xl font-black text-[#0A0F1E] tracking-tight">{userName}</h2>
                  <p className="text-[#64748B] font-bold text-base mt-1 flex items-center gap-2">
                    {userEmail}
                    <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 border border-green-200 px-2.5 py-0.5 rounded-full font-black">
                      <ShieldCheck size={11} /> Verified
                    </span>
                  </p>
                </div>
                <div className="flex gap-3 flex-wrap">
                  {[
                    { label: 'Super Admin', color: 'text-green-700 bg-green-50 border-green-200' },
                    { label: 'Full Access', color: 'text-blue-700 bg-blue-50 border-blue-200' },
                    { label: 'KAM Global', color: 'text-purple-700 bg-purple-50 border-purple-200' },
                  ].map((b) => (
                    <span key={b.label} className={`inline-flex items-center gap-1.5 text-xs font-black px-3 py-1.5 rounded-xl border ${b.color}`}>
                      <Sparkles size={11} /> {b.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {adminStats.map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-white border border-[#E2E8F5] rounded-3xl p-6 shadow-sm text-center">
                <div className={`w-12 h-12 rounded-2xl ${s.bg} flex items-center justify-center mx-auto mb-4`}>
                  <s.icon size={22} style={{ color: s.color }} />
                </div>
                <p className="text-2xl font-black text-[#0A0F1E]">{s.value}</p>
                <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Info + Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Admin Info */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
              className="bg-white border border-[#E2E8F5] rounded-3xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-7">
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                  <ShieldCheck size={20} className="text-green-600" />
                </div>
                <h3 className="font-black text-[#0A0F1E] text-lg">Admin Information</h3>
              </div>
              <div className="space-y-5">
                {[
                  { label: 'Full Name',     value: userName,               icon: ShieldCheck },
                  { label: 'Email',         value: userEmail,              icon: Mail        },
                  { label: 'Phone',         value: '+91 80507 66363',      icon: Phone       },
                  { label: 'Location',      value: 'Bangalore, India',     icon: MapPin      },
                  { label: 'Joined',        value: 'January 2024',         icon: Calendar    },
                  { label: 'Organisation',  value: 'KAM Global Tech',      icon: Globe       },
                ].map((info) => (
                  <div key={info.label} className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                      <info.icon size={16} className="text-[#64748B]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">{info.label}</p>
                      {editMode ? (
                        <input defaultValue={info.value}
                          className="w-full mt-1 text-sm font-bold text-[#0A0F1E] bg-slate-50 border border-transparent rounded-lg px-3 py-1.5 focus:bg-white focus:border-green-400/40 outline-none transition-all" />
                      ) : (
                        <p className="text-sm font-bold text-[#0A0F1E] mt-0.5">{info.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Security + Activity */}
            <div className="space-y-6">
              {/* Security */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}
                className="bg-white border border-[#E2E8F5] rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Lock size={18} className="text-blue-600" />
                  </div>
                  <h3 className="font-black text-[#0A0F1E]">Security</h3>
                </div>
                <div className="space-y-3">
                  {[
                    { label: 'Password', value: '••••••••••', icon: Key,           action: 'Change' },
                    { label: '2FA',      value: 'Enabled',    icon: ShieldCheck,   action: 'Manage', green: true },
                    { label: 'Sessions', value: '1 active',   icon: Clock,         action: 'View'   },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
                      <div className="flex items-center gap-3">
                        <item.icon size={16} className={item.green ? 'text-green-500' : 'text-[#64748B]'} />
                        <div>
                          <p className="text-xs font-black text-[#0A0F1E]">{item.label}</p>
                          <p className={`text-[11px] font-bold ${item.green ? 'text-green-600' : 'text-[#94A3B8]'}`}>{item.value}</p>
                        </div>
                      </div>
                      <button className="text-[11px] font-black text-blue-600 hover:text-blue-700 transition-colors">{item.action}</button>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Recent Activity */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
                className="bg-white border border-[#E2E8F5] rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                    <Activity size={18} className="text-amber-500" />
                  </div>
                  <h3 className="font-black text-[#0A0F1E]">Recent Activity</h3>
                </div>
                <div className="space-y-4">
                  {recentActivity.map((a, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: a.color }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-bold text-[#0A0F1E] leading-snug">{a.action}</p>
                        <p className="text-[10px] font-bold text-[#94A3B8] mt-0.5 flex items-center gap-1">
                          <Clock size={9} /> {a.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
