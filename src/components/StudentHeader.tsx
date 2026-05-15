'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Bell, Search, ChevronDown, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import NotificationDropdown from './NotificationDropdown';
import ProfileDropdown from './ProfileDropdown';

const pageMeta: Record<string, { title: string; subtitle: string }> = {
  '/student-dashboard':          { title: 'Overview',      subtitle: 'Track your academic progress' },
  '/student-dashboard/upload':   { title: 'Evaluator',     subtitle: 'Submit sheets for AI grading' },
  '/student-dashboard/results':  { title: 'My Results',    subtitle: 'Review your evaluated papers' },
  '/student-dashboard/performance': { title: 'Analytics',  subtitle: 'In-depth performance insights' },
  '/student-dashboard/downloads': { title: 'Downloads',    subtitle: 'Access reports and resources' },
  '/student-dashboard/settings': { title: 'Settings',      subtitle: 'Manage your portal experience' },
  '/student-dashboard/profile':  { title: 'My Profile',    subtitle: 'Manage your identity' },
};

export default function StudentHeader() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const meta = pageMeta[pathname] ?? { title: 'Student Portal', subtitle: 'Welcome back' };
  const userName = session?.user?.name ?? 'Student';
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <header className="bg-white/80 backdrop-blur-2xl border-b border-[#E8EFFE] px-10 py-6 flex items-center justify-between sticky top-0 z-40 shrink-0">
      <div className="flex items-center gap-12">
        <div className="hidden lg:flex items-center gap-3 px-5 py-2.5 bg-[#F8FAFF] border border-[#E2E8F5] rounded-2xl min-w-[300px] focus-within:border-orange-500/30 focus-within:bg-white focus-within:ring-4 focus-within:ring-orange-500/5 transition-all">
          <Search size={16} className="text-[#94A3B8]" />
          <input type="text" placeholder="Search exams or subjects..." className="bg-transparent border-none text-xs font-bold text-[#0A0F1E] outline-none w-full placeholder:text-[#94A3B8]" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={12} className="text-orange-500" />
            <span className="text-[10px] font-black text-orange-600 uppercase tracking-[0.2em]">{meta.subtitle}</span>
          </div>
          <h1 className="text-2xl font-black text-[#0A0F1E] tracking-tight">{meta.title}</h1>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setNotifOpen(!notifOpen)}
            className={`relative p-3 rounded-2xl border transition-all shadow-sm group active:scale-95 ${notifOpen ? 'bg-[#0A0F1E] border-[#0A0F1E] text-white' : 'bg-white border-[#E2E8F5] text-[#64748B] hover:bg-[#F8FAFF]'}`}
          >
            <Bell size={20} className={notifOpen ? 'text-white' : 'group-hover:text-[#0A0F1E]'} />
            <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-orange-500 rounded-full border-2 border-white" />
          </button>
          <NotificationDropdown isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
        </div>

        <div className="h-8 w-[1px] bg-[#E8EFFE] mx-1" />

        {/* Profile */}
        <div className="relative">
          <div 
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-4 group cursor-pointer select-none"
          >
            <div className="w-11 h-11 rounded-2xl bg-[#FFF7ED] flex items-center justify-center border-2 border-white shadow-lg shadow-orange-500/10 transition-transform group-hover:scale-105 active:scale-95">
              <span className="text-base font-black text-orange-600">{userInitial}</span>
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-black text-[#0A0F1E] leading-none flex items-center gap-2">
                {userName}
                <ChevronDown size={14} className={`text-[#94A3B8] transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
              </p>
              <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mt-1.5">Student Member</p>
            </div>
          </div>
          <ProfileDropdown 
            isOpen={profileOpen} 
            onClose={() => setProfileOpen(false)} 
            user={{ name: userName, email: session?.user?.email ?? '', role: 'Student' }} 
            profileHref="/student-dashboard/profile"
          />
        </div>
      </div>
    </header>
  );
}
