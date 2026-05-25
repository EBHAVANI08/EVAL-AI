'use client';

import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Settings, LogOut, ChevronRight, Shield, CreditCard, Sparkles } from 'lucide-react';
import { signOut } from 'next-auth/react';

interface ProfileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    name: string;
    email: string;
    role: string;
  };
  profileHref?: string;
}

export default function ProfileDropdown({ isOpen, onClose, user, profileHref = '/profile' }: ProfileDropdownProps) {
  const userInitial = user.name.charAt(0).toUpperCase();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-[60]" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute right-0 mt-3 w-80 bg-white rounded-[2.5rem] shadow-[0_40px_80px_rgba(0,0,0,0.2)] border border-[#E8EFFE] overflow-hidden z-[70]"
          >
            {/* Header / Identity */}
            <div className="px-8 py-8 bg-gradient-to-br from-[#F8FAFF] to-white border-b border-[#E8EFFE]/50 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-50 rounded-full blur-3xl opacity-50" />
              <div className="relative z-10 flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1A6BFF] to-[#2563EB] flex items-center justify-center border border-white shadow-lg shadow-blue-500/20">
                  <span className="text-xl font-black text-white">{userInitial}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-base font-black text-[#0A0F1E] truncate leading-tight">{user.name}</p>
                  <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-[0.2em] mt-1.5">{user.role}</p>
                </div>
              </div>
            </div>

            {/* Menu Sections */}
            <div className="p-3 space-y-1">
              <Link href={profileHref} onClick={onClose} className="w-full">
                <button className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-bold text-[#64748B] hover:bg-[#F8FAFF] hover:text-[#0A0F1E] transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all">
                      <User size={18} />
                    </div>
                    My Profile
                  </div>
                  <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                </button>
              </Link>

              <Link href={`${profileHref}#settings`} onClick={onClose} className="w-full">
                <button className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-bold text-[#64748B] hover:bg-[#F8FAFF] hover:text-[#0A0F1E] transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all">
                      <Settings size={18} />
                    </div>
                    Account Settings
                  </div>
                  <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                </button>
              </Link>

              <div className="pt-2 border-t border-[#F1F5F9]">
                <button 
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-black text-red-500 hover:bg-red-50 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center group-hover:bg-red-100 transition-all">
                    <LogOut size={18} />
                  </div>
                  Sign Out
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
