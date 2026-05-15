'use client';

import React, { useState, useRef } from 'react';
import {
  User, Mail, Phone, Calendar, BookOpen, Hash, GraduationCap,
  Edit2, Camera, Award, FileText, ClipboardList, TrendingUp,
  MapPin, Shield, Clock, ChevronRight, Settings, Sparkles, Check
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import GlassCard from '@/components/GlassCard';

const statsCards = [
  { label: 'Papers Evaluated', value: '12', icon: FileText, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100' },
  { label: 'Average Score', value: '88%', icon: Award, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100' },
  { label: 'Pending Review', value: '1', icon: ClipboardList, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100' },
  { label: 'Class Rank', value: '4th', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' },
];

const personalInfo = [
  { label: 'Full Name', value: 'Student', icon: User },
  { label: 'Email Address', value: 'student@school.edu', icon: Mail },
  { label: 'Phone Number', value: '+91 98765 43210', icon: Phone },
  { label: 'Date of Birth', value: '01 January 2008', icon: Calendar },
  { label: 'Address', value: 'Chennai, Tamil Nadu', icon: MapPin },
];

const academicInfo = [
  { label: 'Student ID', value: 'ST2024001', icon: Hash },
  { label: 'Class', value: 'XII', icon: GraduationCap },
  { label: 'Section', value: 'A', icon: BookOpen },
  { label: 'Roll Number', value: '001', icon: Hash },
  { label: 'Academic Year', value: '2024 – 2025', icon: Calendar },
];

const recentActivity = [
  { subject: 'Mathematics', exam: 'Unit Test 1', status: 'Pending', date: '12 May 2024', score: '—' },
];

export default function StudentProfilePage() {
  const [editMode, setEditMode]   = useState(false);
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
  const [coverSrc,  setCoverSrc]  = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef  = useRef<HTMLInputElement>(null);
  const userInitial = 'S';

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverSrc(null); // reset in case
    const url = URL.createObjectURL(file);
    setAvatarSrc(url);
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setCoverSrc(url);
  };

  return (
    <div className="px-8 py-8 max-w-6xl mx-auto space-y-8">
      {/* Page Header with Settings */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-[#0A0F1E] tracking-tight">Student Profile</h2>
          <p className="text-sm text-[#64748B] font-medium mt-1">Manage your academic identity and preferences</p>
        </div>
        <Link href="/student-dashboard/settings">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-[#E2E8F5] shadow-sm text-sm font-bold text-[#64748B] hover:text-orange-600 hover:border-orange-200 transition-all"
          >
            <Settings size={16} />
            Settings
          </motion.button>
        </Link>
      </div>

      {/* Profile hero card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-[3rem] overflow-hidden bg-white border border-[#E2E8F5] shadow-[0_40px_80px_rgba(0,0,0,0.06)] group"
      >
        {/* Cover */}
        <div className="h-60 relative overflow-hidden">
          {/* hidden input for cover */}
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleCoverChange}
          />
          {coverSrc ? (
            <img src={coverSrc} alt="cover" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-orange-500 via-rose-500 to-amber-500">
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
            </div>
          )}
          <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <motion.button
            onClick={() => coverInputRef.current?.click()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="absolute top-8 right-8 flex items-center gap-2.5 text-[11px] text-white font-black bg-white/20 backdrop-blur-xl hover:bg-white/40 px-6 py-3 rounded-2xl transition-all border border-white/30 uppercase tracking-widest z-20 shadow-2xl"
          >
            <Camera size={16} /> Change Cover
          </motion.button>
        </div>

        {/* Avatar + identity */}
        <div className="px-12 pb-12">
          <div className="flex items-end justify-between -mt-20 mb-10 relative z-30">
            {/* Avatar */}
            <div className="relative group/avatar">
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
              <div className="w-44 h-44 rounded-[2.5rem] border-[10px] border-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden bg-white group-hover/avatar:scale-[1.02] transition-transform duration-500">
                {avatarSrc ? (
                  <img src={avatarSrc} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#1A6BFF] to-[#2563EB] flex items-center justify-center">
                    <span className="text-6xl font-black text-white">{userInitial}</span>
                  </div>
                )}
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 10 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => avatarInputRef.current?.click()}
                className="absolute bottom-4 right-4 w-12 h-12 bg-[#0A0F1E] text-white rounded-2xl flex items-center justify-center shadow-2xl transition-all border-4 border-white z-40"
                title="Change photo"
              >
                <Camera size={20} />
              </motion.button>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setEditMode(!editMode)}
                className={`flex items-center gap-3 px-10 py-4 rounded-[1.5rem] text-sm font-black transition-all shadow-2xl tracking-widest uppercase ${
                  editMode
                    ? 'bg-orange-600 text-white shadow-orange-500/20'
                    : 'bg-[#0A0F1E] text-white shadow-black/20 hover:bg-orange-600'
                }`}
              >
                {editMode ? (
                  <> <Check size={18} /> Save Changes </>
                ) : (
                  <> <Edit2 size={18} /> Edit Profile </>
                )}
              </motion.button>
            </div>
          </div>


          {/* Name + meta */}
          <div className="space-y-4">
            <div>
              <h2 className="text-4xl font-black text-[#0A0F1E] tracking-tight">Student Name</h2>
              <p className="text-[#64748B] font-bold text-lg mt-1 flex items-center gap-3">
                Class XII – A 
                <span className="w-1.5 h-1.5 rounded-full bg-orange-300" />
                Roll No: ST2024001
              </p>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <span className="inline-flex items-center gap-2 text-xs font-black text-green-700 bg-green-50 border border-green-200 px-4 py-2 rounded-xl">
                <Shield size={14} /> ACTIVE STUDENT
              </span>
              <span className="inline-flex items-center gap-2 text-xs font-black text-orange-700 bg-orange-50 border border-orange-200 px-4 py-2 rounded-xl">
                <Clock size={14} /> AY 2024–25
              </span>
              <span className="inline-flex items-center gap-2 text-xs font-black text-blue-700 bg-blue-50 border border-blue-200 px-4 py-2 rounded-xl">
                <Sparkles size={14} /> TOP PERFORMER
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats row */}
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

      {/* Info grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <GlassCard delay={0.4}>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                <User size={20} className="text-orange-600" />
              </div>
              <h3 className="font-black text-[#0A0F1E] text-lg">Personal Information</h3>
            </div>
          </div>
          <div className="space-y-6">
            {personalInfo.map((info) => (
              <div key={info.label} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center shrink-0">
                  <info.icon size={18} className="text-[#64748B]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">{info.label}</p>
                  {editMode ? (
                    <input
                      defaultValue={info.value}
                      className="w-full mt-1.5 text-base font-bold text-[#0A0F1E] bg-muted border border-transparent rounded-xl px-4 py-2 focus:bg-white focus:border-orange-500/30 focus:ring-4 focus:ring-orange-500/5 transition-all outline-none"
                    />
                  ) : (
                    <p className="text-base font-bold text-[#0A0F1E] mt-0.5">{info.value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard delay={0.5}>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <GraduationCap size={20} className="text-blue-600" />
              </div>
              <h3 className="font-black text-[#0A0F1E] text-lg">Academic Information</h3>
            </div>
          </div>
          <div className="space-y-6">
            {academicInfo.map((info) => (
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
      </div>

      {/* Recent evaluations */}
      <GlassCard delay={0.6} className="p-0 overflow-hidden">
        <div className="px-8 py-6 border-b border-[#E2E8F5]/50 flex items-center justify-between bg-[#F8FAFF]/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center">
              <ClipboardList size={24} className="text-amber-600" />
            </div>
            <div>
              <h3 className="font-black text-[#0A0F1E] text-lg">Recent Evaluations</h3>
              <p className="text-sm text-[#64748B] font-medium">Your latest Mathematics assessment results</p>
            </div>
          </div>
          <button className="flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700 font-black transition-all">
            View All <ChevronRight size={16} />
          </button>
        </div>

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
              {recentActivity.map((r, i) => (
                <motion.tr 
                  key={i} 
                  whileHover={{ backgroundColor: 'rgba(248,250,255,0.8)' }}
                  className="transition-all"
                >
                  <td className="px-8 py-5">
                    <span className="text-base font-bold text-[#0A0F1E]">{r.subject}</span>
                  </td>
                  <td className="px-8 py-5 text-sm font-medium text-[#64748B]">{r.exam}</td>
                  <td className="px-8 py-5 text-sm font-medium text-[#64748B]">{r.date}</td>
                  <td className="px-8 py-5">
                    <span className="text-base font-black text-[#0A0F1E]">{r.score}</span>
                  </td>
                  <td className="px-8 py-5">
                    <span className="inline-flex items-center gap-2 text-[10px] font-black text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl">
                      <Clock size={12} /> {r.status.toUpperCase()}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
