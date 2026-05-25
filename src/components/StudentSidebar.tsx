'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, ClipboardList, BarChart3, Download, Settings, 
  LogOut, BookOpen, Upload, Sparkles, X, ChevronLeft, ChevronRight
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard',    href: '/student-dashboard',             icon: LayoutDashboard },
  { label: 'Upload Sheet', href: '/student-dashboard/upload',      icon: Upload },
  { label: 'My Results',   href: '/student-dashboard/results',     icon: ClipboardList },
  { label: 'Performance',  href: '/student-dashboard/performance', icon: BarChart3 },
  { label: 'Downloads',    href: '/student-dashboard/downloads',   icon: Download },
  { label: 'Profile',      href: '/student-dashboard/profile',     icon: Settings },
];

export default function StudentSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const userName    = session?.user?.name ?? 'Student';
  const userInitial = userName.charAt(0).toUpperCase();

  const confirmLogout = async () => { setLoggingOut(true); await signOut({ callbackUrl: '/' }); };

  const sidebarContent = (
    <aside 
      className="relative flex flex-col h-full bg-[#FFFFFF]/80 backdrop-blur-xl border-r border-[#E8EFFE] shrink-0 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]"
      style={{ width: collapsed ? '72px' : '250px' }}
    >
      {/* Background Subtle Gradient */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-[#7C3AED]/5 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#06B6D4]/5 to-transparent" />
      </div>

      {/* Logo Section */}
      <div className={`relative flex items-center overflow-hidden transition-all duration-300 ${collapsed ? 'px-2 py-5 justify-center' : 'px-5 py-6 gap-3'}`}>
        <div className="relative shrink-0">
          <div className="absolute inset-0 bg-[#7C3AED]/20 blur-xl rounded-full scale-150 animate-pulse" />
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] flex items-center justify-center relative z-10 border border-white/20">
            <BookOpen size={18} className="text-white" />
          </div>
        </div>
        {!collapsed && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col min-w-0 flex-1 relative z-10"
          >
            <span className="font-800 text-base text-[#0A0F1E] leading-tight tracking-tight">Grade.ai</span>
            <span className="text-[11px] text-[#7C3AED] font-bold uppercase tracking-wider flex items-center gap-1">
              Student Portal <Sparkles size={10} className="text-[#06B6D4]" />
            </span>
          </motion.div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2 px-3 scrollbar-none relative z-10">
        {!collapsed && (
          <div className="flex items-center gap-2 px-3 pt-2 pb-2">
            <p className="text-[10px] font-800 uppercase tracking-[0.15em] text-[#94A3B8]/80">Learning Menu</p>
            <div className="h-[1px] flex-1 bg-[#E8EFFE] opacity-50" />
          </div>
        )}
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon   = item.icon;
            const active = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link key={item.label} href={item.href}
                className={`group relative flex items-center gap-3 py-3 rounded-2xl text-[14px] transition-all duration-300 ease-out
                  ${collapsed ? 'justify-center px-0' : 'px-4'}
                  ${active
                    ? 'bg-orange-50 text-orange-600 font-black shadow-[0_10px_20px_rgba(234,88,12,0.05)]'
                    : 'text-[#64748B] hover:bg-orange-50/50 hover:text-orange-600 font-bold'
                  }`}
              >
                {active && (
                  <motion.div 
                    layoutId="active-indicator-student"
                    className="absolute left-0 w-1.5 h-6 bg-orange-600 rounded-full"
                  />
                )}
                <Icon size={20} className={`shrink-0 transition-transform duration-300 group-hover:scale-110 ${active ? 'text-orange-600' : 'group-hover:text-orange-600'}`} />
                {!collapsed && <span className="flex-1 truncate tracking-tight">{item.label}</span>}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom User Section */}
      <div className="relative z-10 border-t border-[#E8EFFE]/50 p-4 bg-white/40 backdrop-blur-md">
        <div className={`group relative bg-white border border-[#E8EFFE] rounded-2xl p-2.5 transition-all duration-300 hover:shadow-md hover:border-[#7C3AED]/20 ${collapsed ? 'px-1' : ''}`}>
          <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
            <div className="relative shrink-0">
              <div className="absolute inset-0 bg-[#7C3AED]/20 blur-md rounded-full group-hover:scale-125 transition-transform" />
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] flex items-center justify-center relative z-10 border-2 border-white shadow-sm">
                <span className="text-sm font-800 text-white">{userInitial}</span>
              </div>
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-800 text-[#0A0F1E] truncate leading-tight">{userName}</p>
                <p className="text-[11px] font-600 text-[#94A3B8] flex items-center gap-1 uppercase tracking-tight">
                  <span className="w-1 h-1 bg-[#7C3AED] rounded-full" /> Student
                </p>
              </div>
            )}
            {!collapsed && (
              <button 
                onClick={() => setLogoutOpen(true)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#94A3B8] hover:bg-red-50 hover:text-red-500 transition-all"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      <div className="h-full">{sidebarContent}</div>

      {/* Logout modal */}
      <AnimatePresence>
        {logoutOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-md"
              onClick={() => !loggingOut && setLogoutOpen(false)} />
            <div className="fixed inset-0 z-[61] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 400 }}
              className="w-full max-w-sm pointer-events-auto"
            >
              <div className="bg-white border border-[#E8EFFE] rounded-3xl shadow-[0_30px_70px_rgba(0,0,0,0.2)] overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-red-500 via-rose-500 to-red-600" />
                <div className="p-8">
                  <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-6 mx-auto relative">
                    <div className="absolute inset-0 bg-red-500/5 rounded-2xl animate-pulse scale-125" />
                    <LogOut size={28} className="text-red-500 relative z-10" />
                  </div>
                  <h3 className="text-xl font-800 text-[#0A0F1E] mb-2 text-center">Ready to leave?</h3>
                  <p className="text-[14px] text-[#64748B] leading-relaxed text-center px-4">Your student session will be ended securely.</p>
                  <div className="flex flex-col gap-3 mt-8">
                    <button onClick={confirmLogout} disabled={loggingOut}
                      className="w-full py-3.5 rounded-2xl bg-[#0A0F1E] text-white text-[15px] font-800 hover:bg-[#1A1F2E] transition-all disabled:opacity-70 flex items-center justify-center gap-2 shadow-xl shadow-black/10">
                      {loggingOut ? (
                        <><svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" /><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75" /></svg> Signing out…</>
                      ) : (
                        <>Yes, Sign Out</>
                      )}
                    </button>
                    <button onClick={() => setLogoutOpen(false)} disabled={loggingOut}
                      className="w-full py-3.5 rounded-2xl bg-[#F8FAFF] border border-[#E8EFFE] text-[15px] font-700 text-[#64748B] hover:bg-[#F1F5FF] hover:text-[#0A0F1E] transition-all disabled:opacity-50">
                      Stay Signed In
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
