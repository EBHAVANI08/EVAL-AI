'use client';

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { 
  Upload, Lightbulb, Sparkles, CalendarDays, Bell, ChevronDown, Search
} from 'lucide-react';
import NotificationDropdown from '@/components/NotificationDropdown';
import ProfileDropdown from '@/components/ProfileDropdown';

function useGreeting(name: string) {
  return useMemo(() => {
    const hour = new Date().getHours();
    const greeting =
      hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    const today = new Date().toLocaleDateString('en-IN', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });
    return { greeting, name: name.split(' ')[0], today };
  }, [name]);
}

export default function DashboardHeader() {
  const { data: session } = useSession();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  
  const userName = session?.user?.name ?? 'Teacher';
  const { greeting, name, today } = useGreeting(userName);
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <div className="mb-10 relative z-50">
      <div className="flex items-center justify-between gap-8 mb-8">
        <div className="flex items-center gap-12 flex-1">
          <div className="hidden xl:flex items-center gap-3 px-5 py-2.5 bg-white border border-[#E2E8F5] rounded-2xl min-w-[320px] focus-within:border-[#1A6BFF]/30 focus-within:ring-4 focus-within:ring-[#1A6BFF]/5 transition-all">
            <Search size={16} className="text-[#94A3B8]" />
            <input type="text" placeholder="Search students, exams..." className="bg-transparent border-none text-xs font-bold text-[#0A0F1E] outline-none w-full placeholder:text-[#94A3B8]" />
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 border border-blue-100">
              <CalendarDays size={14} className="text-[#1A6BFF]" />
              <span className="text-[11px] font-black text-[#1A6BFF] uppercase tracking-widest">{today}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => setNotifOpen(!notifOpen)}
              className={`relative p-3 rounded-2xl border transition-all shadow-sm group active:scale-95 ${notifOpen ? 'bg-[#0A0F1E] border-[#0A0F1E] text-white' : 'bg-white border-[#E2E8F5] text-[#64748B] hover:bg-[#F8FAFF]'}`}
            >
              <Bell size={20} className={notifOpen ? 'text-white' : 'group-hover:text-[#0A0F1E]'} />
              <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-orange-500 rounded-full border-2 border-white shadow-sm" />
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
              <div className="w-11 h-11 rounded-2xl bg-[#EEF4FF] flex items-center justify-center border-2 border-white shadow-lg shadow-blue-500/10 transition-transform group-hover:scale-105 active:scale-95">
                <span className="text-base font-black text-[#1A6BFF]">{userInitial}</span>
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-black text-[#0A0F1E] leading-none flex items-center gap-2">
                  {userName}
                  <ChevronDown size={14} className={`text-[#94A3B8] transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                </p>
                <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mt-1.5">Lead Instructor</p>
              </div>
            </div>
            <ProfileDropdown 
              isOpen={profileOpen} 
              onClose={() => setProfileOpen(false)} 
              user={{ name: userName, email: session?.user?.email ?? '', role: 'Lead Instructor' }} 
              profileHref="/teacher-dashboard/profile"
            />
          </div>
        </div>
      </div>

      {/* Welcome banner */}
      <div className="relative rounded-[2.5rem] px-10 py-10 bg-gradient-to-br from-[#1A6BFF] via-[#2563EB] to-[#06B6D4] shadow-[0_40px_100px_rgba(26,107,255,0.25)] border-2 border-white/20 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1], 
              opacity: [0.1, 0.15, 0.1],
              x: [0, 50, 0],
              y: [0, -30, 0]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white blur-[100px]" 
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.3, 1], 
              opacity: [0.05, 0.1, 0.05],
              x: [0, -40, 0],
              y: [0, 20, 0]
            }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-[#CCFF00] blur-[100px]" 
          />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center gap-2">
                <Sparkles size={12} className="text-[#CCFF00]" />
                <span className="text-white text-[10px] font-black uppercase tracking-[0.2em]">{greeting}</span>
              </div>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-white leading-[1.1] tracking-tighter max-w-xl">
              Elevate your grading with <span className="text-[#CCFF00]">AI Intelligence.</span>
            </h1>
            <p className="text-white/70 font-bold mt-4 text-lg">Welcome back, {name}. Your system is optimized and ready.</p>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <button className="px-8 py-4 rounded-2xl bg-white text-[#1A6BFF] font-black text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center gap-3">
              <Upload size={18} /> Upload Sheets
            </button>
            <button className="px-8 py-4 rounded-2xl bg-black/20 backdrop-blur-xl border border-white/20 text-white font-black text-sm uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-3">
              <Lightbulb size={18} /> AI Assistant
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
