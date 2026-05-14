'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import AppLogo from '@/components/ui/AppLogo';
import {
  LayoutDashboard,
  FileText,
  ClipboardCheck,
  Lightbulb,
  ScanLine,
  Languages,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Bell,
  LogOut,
  Users,
  BookOpen,
  X,
  BellOff,
  Zap,
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
  group: string;
}

const navItems: NavItem[] = [
  { id: 'nav-dashboard', label: 'Teacher Dashboard', href: '/teacher-dashboard', icon: LayoutDashboard, group: 'main' },
  { id: 'nav-evaluator', label: 'Answer Evaluator', href: '/answer-sheet-evaluator', icon: ClipboardCheck, badge: 7, group: 'tools' },
  { id: 'nav-paper', label: 'Paper Analyzer', href: '/question-paper-analyzer', icon: FileText, group: 'tools' },
  { id: 'nav-generator', label: 'Answer Generator', href: '/answer-generator', icon: Lightbulb, group: 'tools' },
  { id: 'nav-diagram', label: 'Diagram Analyzer', href: '/diagram-analyzer', icon: ScanLine, group: 'tools' },
  { id: 'nav-language', label: 'Multilingual Engine', href: '/multilingual-engine', icon: Languages, group: 'tools' },
  { id: 'nav-students', label: 'Students', href: '/students', icon: Users, group: 'manage' },
  { id: 'nav-papers', label: 'Question Papers', href: '/question-papers', icon: BookOpen, group: 'manage' },
  { id: 'nav-analytics', label: 'Analytics', href: '/analytics', icon: BarChart3, group: 'manage' },
  { id: 'nav-settings', label: 'Settings', href: '/settings', icon: Settings, group: 'system' },
];

const groups = [
  { id: 'main', label: null },
  { id: 'tools', label: 'Smart Tools' },
  { id: 'manage', label: 'Manage' },
  { id: 'system', label: 'System' },
];

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { data: session } = useSession();

  const userName = session?.user?.name ?? 'Teacher';
  const userInitial = userName.charAt(0).toUpperCase();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    if (notifOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [notifOpen]);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(href + '/');
  };

  const handleNavClick = () => onClose();

  const confirmLogout = async () => {
    setLoggingOut(true);
    await signOut({ callbackUrl: '/' });
  };

  const sidebarContent = (
    <aside
      className="relative flex flex-col h-full border-r border-border bg-card transition-all duration-300 ease-in-out shrink-0"
      style={{ width: collapsed ? '64px' : '232px' }}
    >
      {/* Logo */}
      <div className={`flex items-center border-b border-border overflow-hidden ${collapsed ? 'px-2 py-3 justify-center' : 'px-4 py-3 gap-2.5'}`}>
        <div className="shrink-0">
          <AppLogo size={30} />
        </div>
        {!collapsed && (
          <div className="flex flex-col min-w-0 flex-1">
            <span className="font-bold text-sm text-foreground leading-tight truncate tracking-tight">Eval AI</span>
            <span className="text-[11px] text-primary font-semibold truncate">Teacher Portal</span>
          </div>
        )}
        <button
          onClick={onClose}
          className="lg:hidden ml-auto p-1.5 rounded-lg hover:bg-muted transition-colors"
          aria-label="Close sidebar"
        >
          <X size={16} className="text-muted-foreground" />
        </button>
      </div>

      {/* Collapse toggle — desktop only */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="hidden lg:flex absolute -right-3 top-[52px] z-10 w-6 h-6 rounded-full bg-card border border-border items-center justify-center shadow-sm hover:bg-muted transition-colors duration-150"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed
          ? <ChevronRight size={11} className="text-muted-foreground" />
          : <ChevronLeft size={11} className="text-muted-foreground" />}
      </button>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2 px-2">
        {groups.map((group) => {
          const items = navItems.filter((n) => n.group === group.id);
          if (items.length === 0) return null;
          return (
            <div key={`group-${group.id}`} className="mb-1">
              {group.label && !collapsed && (
                <div className="flex items-center gap-1.5 px-2 pt-3 pb-1">
                  {group.id === 'tools' && <Zap size={11} className="text-primary/60" />}
                  <p className="text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground/70">
                    {group.label}
                  </p>
                </div>
              )}
              {items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <div key={item.id} className="tooltip-custom">
                    <Link
                      href={item.href}
                      onClick={handleNavClick}
                      className={`sidebar-item ${active ? 'sidebar-item-active' : ''} ${collapsed ? 'justify-center !px-0 py-2.5' : ''}`}
                    >
                      <Icon size={19} className="shrink-0" />
                      {!collapsed && (
                        <>
                          <span className="flex-1 truncate">{item.label}</span>
                          {item.badge && (
                            <span className="ml-auto bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                      {collapsed && item.badge && (
                        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary rounded-full" />
                      )}
                    </Link>
                    {collapsed && <span className="tooltip-text">{item.label}</span>}
                  </div>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Bottom user area */}
      <div className="border-t border-border p-2 space-y-1">
        {/* Notifications */}
        <div className="tooltip-custom relative" ref={notifRef}>
          <button
            className="sidebar-item w-full"
            onClick={() => setNotifOpen((v) => !v)}
          >
            <Bell size={19} className="shrink-0" />
            {!collapsed && (
              <>
                <span className="flex-1 text-left">Notifications</span>
                <span className="bg-warning text-white text-[11px] font-bold px-1.5 py-0.5 rounded-full">0</span>
              </>
            )}
          </button>
          {collapsed && <span className="tooltip-text">Notifications</span>}

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.18 }}
                className="absolute bottom-full left-0 mb-2 w-72 bg-card border border-border rounded-2xl shadow-[var(--shadow-lg)] overflow-hidden z-50"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <span className="text-sm font-bold text-foreground">Notifications</span>
                  <button
                    onClick={() => setNotifOpen(false)}
                    className="w-6 h-6 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
                  >
                    <X size={13} className="text-muted-foreground" />
                  </button>
                </div>
                <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mb-3">
                    <BellOff size={18} className="text-muted-foreground/50" />
                  </div>
                  <p className="text-sm font-semibold text-muted-foreground">No notifications</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">You're all caught up!</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User info */}
        <div className={`flex items-center gap-2.5 px-2 py-2 rounded-lg ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/30 flex items-center justify-center shrink-0 border border-primary/20">
            <span className="text-sm font-bold text-primary">{userInitial}</span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-semibold text-foreground truncate leading-tight">{userName}</p>
              <p className="text-xs text-muted-foreground truncate">Teacher</p>
            </div>
          )}
        </div>

        {/* Sign Out — centered full-width button (expanded) */}
        {!collapsed && (
          <button
            onClick={() => setLogoutOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border text-[15px] font-semibold text-muted-foreground hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all duration-150"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        )}

        {/* Sign Out — icon only (collapsed) */}
        {collapsed && (
          <div className="tooltip-custom">
            <button
              onClick={() => setLogoutOpen(true)}
              className="sidebar-item w-full justify-center !px-0 py-2.5 hover:bg-red-50 hover:text-red-500"
            >
              <LogOut size={17} className="shrink-0" />
            </button>
            <span className="tooltip-text">Sign Out</span>
          </div>
        )}
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex h-full">
        {sidebarContent}
      </div>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-40 bg-black/50"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Mobile drawer */}
      <motion.div
        initial={false}
        animate={{ x: mobileOpen ? 0 : -240 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="lg:hidden fixed inset-y-0 left-0 z-50 flex flex-col"
        style={{ width: '240px' }}
      >
        {sidebarContent}
      </motion.div>

      {/* Logout confirmation modal */}
      <AnimatePresence>
        {logoutOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
              onClick={() => !loggingOut && setLogoutOpen(false)}
            />
            {/* Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 12 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="fixed z-[61] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm"
            >
              <div className="bg-card border border-border rounded-2xl shadow-[var(--shadow-lg)] overflow-hidden">
                {/* Header strip */}
                <div className="h-1.5 bg-gradient-to-r from-red-400 to-rose-500" />

                <div className="p-6">
                  {/* Icon */}
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
                        <>
                          <LogOut size={14} /> Yes, Sign Out
                        </>
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
