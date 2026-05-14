'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, ClipboardList, BarChart3, Download, Settings,
  LogOut, BookOpen, Upload, User,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard',   href: '/student-dashboard',             icon: LayoutDashboard },
  { label: 'Upload Sheet', href: '/student-dashboard/upload',     icon: Upload },
  { label: 'My Results',  href: '/student-dashboard/results',     icon: ClipboardList },
  { label: 'Performance', href: '/student-dashboard/performance', icon: BarChart3 },
  { label: 'Downloads',   href: '/student-dashboard/downloads',   icon: Download },
  { label: 'Settings',    href: '/student-dashboard/settings',    icon: Settings },
];

export default function StudentSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const userName = session?.user?.name ?? 'Student';
  const userInitial = userName.charAt(0).toUpperCase();

  const confirmLogout = async () => {
    setLoggingOut(true);
    await signOut({ callbackUrl: '/' });
  };

  return (
    <>
      <aside className="flex flex-col w-60 shrink-0 border-r border-border bg-card h-screen">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 py-4 border-b border-border">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shrink-0">
            <BookOpen size={16} className="text-white" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-sm text-foreground leading-tight">Eval AI</span>
            <span className="text-xs text-orange-500 font-semibold">Student Portal</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-0.5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">Menu</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  active
                    ? 'bg-orange-50 text-orange-600 font-semibold'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon size={18} className="shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom user + sign out */}
        <div className="border-t border-border p-3 space-y-2">
          {/* Profile link */}
          <Link
            href="/student-dashboard/profile"
            className={`flex items-center gap-2.5 p-2.5 rounded-lg transition-colors ${
              pathname === '/student-dashboard/profile'
                ? 'bg-orange-50'
                : 'hover:bg-muted'
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-white">{userInitial}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{userName}</p>
              <p className="text-xs text-muted-foreground truncate">View Profile</p>
            </div>
          </Link>

          {/* Sign Out — centered full-width button */}
          <button
            onClick={() => setLogoutOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all duration-150"
          >
            <LogOut size={15} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Logout confirmation modal */}
      <AnimatePresence>
        {logoutOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
              onClick={() => !loggingOut && setLogoutOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 12 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="fixed z-[61] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm"
            >
              <div className="bg-card border border-border rounded-2xl shadow-[var(--shadow-lg)] overflow-hidden">
                <div className="h-1.5 bg-gradient-to-r from-red-400 to-rose-500" />
                <div className="p-6">
                  <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
                    <LogOut size={22} className="text-red-500" />
                  </div>
                  <h3 className="text-base font-bold text-foreground mb-1">Sign out of Eval AI?</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    You'll be returned to the login page. Any unsaved work will remain intact.
                  </p>
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setLogoutOpen(false)}
                      disabled={loggingOut}
                      className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmLogout}
                      disabled={loggingOut}
                      className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white text-sm font-bold hover:brightness-110 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                      {loggingOut ? (
                        <>
                          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                            <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75" />
                          </svg>
                          Signing out…
                        </>
                      ) : (
                        <><LogOut size={14} /> Yes, Sign Out</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
