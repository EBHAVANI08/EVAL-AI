'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import AppLogo from '@/components/ui/AppLogo';
import {
  LayoutDashboard, FileText, ClipboardCheck, Lightbulb, ScanLine, Languages,
  BarChart3, Settings, ChevronLeft, ChevronRight, Bell, LogOut,
  Users, BookOpen, X, BellOff, Zap, Sparkles,
} from 'lucide-react';

interface NavItem {
  id: string; label: string; href: string; icon: React.ElementType; badge?: number; group: string;
}

const navItems: NavItem[] = [
  { id: 'nav-dashboard', label: 'Teacher Dashboard',  href: '/teacher-dashboard',        icon: LayoutDashboard, group: 'main' },
  { id: 'nav-evaluator', label: 'Answer Evaluator',   href: '/answer-sheet-evaluator',   icon: ClipboardCheck, badge: 7, group: 'tools' },
  { id: 'nav-paper',     label: 'Paper Analyzer',     href: '/question-paper-analyzer',  icon: FileText,       group: 'tools' },
  { id: 'nav-generator', label: 'Answer Generator',   href: '/answer-generator',         icon: Lightbulb,      group: 'tools' },
  { id: 'nav-diagram',   label: 'Diagram Analyzer',   href: '/diagram-analyzer',         icon: ScanLine,       group: 'tools' },
  { id: 'nav-language',  label: 'Multilingual Engine',href: '/multilingual-engine',      icon: Languages,      group: 'tools' },
  { id: 'nav-students',  label: 'Students',           href: '/students',                 icon: Users,          group: 'manage' },
  { id: 'nav-papers',    label: 'Question Papers',    href: '/question-papers',          icon: BookOpen,       group: 'manage' },
  { id: 'nav-analytics', label: 'Analytics',          href: '/analytics',                icon: BarChart3,      group: 'manage' },
  { id: 'nav-settings',  label: 'Settings',           href: '/settings',                 icon: Settings,       group: 'system' },
];

const groups = [
  { id: 'main',   label: null },
  { id: 'tools',  label: 'Smart Tools' },
  { id: 'manage', label: 'Manage' },
  { id: 'system', label: 'System' },
];

interface SidebarProps { mobileOpen: boolean; onClose: () => void; }

export default function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const [collapsed,  setCollapsed]  = useState(false);
  const pathname  = usePathname();
  const { data: session } = useSession();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        setCollapsed(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/');

  const sidebarContent = (
    <aside
      className="relative flex flex-col h-full bg-[#FFFFFF]/80 backdrop-blur-xl border-r border-[#E8EFFE] shrink-0 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]"
      style={{ width: collapsed ? '72px' : '250px' }}
    >
      {/* Background Subtle Gradient */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-[#1A6BFF]/5 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#06B6D4]/5 to-transparent" />
      </div>

      {/* Logo Section */}
      <div className={`relative flex items-center overflow-hidden transition-all duration-300 ${collapsed ? 'px-2 py-5 justify-center' : 'px-5 py-6 gap-3'}`}>
        <div className="relative shrink-0">
          <div className="absolute inset-0 bg-[#1A6BFF]/20 blur-xl rounded-full scale-150 animate-pulse" />
          <AppLogo size={collapsed ? 32 : 36} className="relative z-10" />
        </div>
        {!collapsed && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col min-w-0 flex-1 relative z-10"
          >
            <span className="font-800 text-base text-[#0A0F1E] leading-tight tracking-tight">Grade.ai</span>
            <span className="text-[11px] text-[#1A6BFF] font-bold uppercase tracking-wider flex items-center gap-1">
              Teacher Portal <Sparkles size={10} className="text-[#06B6D4]" />
            </span>
          </motion.div>
        )}
        
        {/* New Integrated Toggle Button */}
        {!collapsed && (
          <button 
            onClick={() => setCollapsed(true)}
            className="hidden lg:flex p-2 rounded-xl text-[#94A3B8] hover:bg-[#EEF4FF] hover:text-[#1A6BFF] transition-all"
            title="Collapse Sidebar (Ctrl+B)"
          >
            <ChevronLeft size={18} />
          </button>
        )}
        
        <button onClick={onClose} className="lg:hidden ml-auto p-1.5 rounded-lg hover:bg-[#F1F5FF] transition-colors text-[#94A3B8]" aria-label="Close">
          <X size={18} />
        </button>
      </div>

      {/* Re-designed Floating Handle for Collapsed State */}
      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="hidden lg:flex absolute -right-4 top-8 z-30 w-8 h-12 items-center justify-center bg-white border border-[#E8EFFE] border-l-0 rounded-r-xl shadow-[4px_0_12px_rgba(0,0,0,0.05)] hover:w-10 hover:bg-[#F8FAFF] transition-all group"
          title="Expand Sidebar (Ctrl+B)"
        >
          <div className="flex flex-col gap-0.5 items-center">
            <div className="w-1 h-1 rounded-full bg-[#1A6BFF]/40 group-hover:bg-[#1A6BFF]" />
            <ChevronRight size={14} className="text-[#1A6BFF]" />
            <div className="w-1 h-1 rounded-full bg-[#1A6BFF]/40 group-hover:bg-[#1A6BFF]" />
          </div>
        </button>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2 px-3 scrollbar-none relative z-10">
        {groups.map((group, groupIdx) => {
          const items = navItems.filter(n => n.group === group.id);
          if (!items.length) return null;
          return (
            <div key={group.id} className="mb-4">
              {group.label && !collapsed && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * groupIdx }}
                  className="flex items-center gap-2 px-3 pt-2 pb-2"
                >
                  <p className="text-[10px] font-800 uppercase tracking-[0.15em] text-[#94A3B8]/80">{group.label}</p>
                  <div className="h-[1px] flex-1 bg-[#E8EFFE] opacity-50" />
                </motion.div>
              )}
              <div className="space-y-1">
                {items.map((item, itemIdx) => {
                  const Icon  = item.icon;
                  const active = isActive(item.href);
                  return (
                    <div key={item.id} className="tooltip-custom">
                      <Link
                        href={item.href}
                        onClick={() => onClose()}
                        className={`group relative flex items-center gap-3 py-3 rounded-2xl text-[14px] cursor-pointer transition-all duration-300 ease-out
                          ${collapsed ? 'justify-center px-0' : 'px-4'}
                          ${active
                            ? 'bg-blue-50 text-[#1A6BFF] font-black shadow-[0_10px_20px_rgba(26,107,255,0.05)]'
                            : 'text-[#64748B] hover:bg-blue-50/50 hover:text-[#1A6BFF] font-bold'
                          }`}
                      >
                        {active && (
                          <motion.div 
                            layoutId="active-indicator"
                            className="absolute left-0 w-1.5 h-6 bg-[#1A6BFF] rounded-full z-10"
                          />
                        )}
                        <Icon size={20} className={`shrink-0 transition-transform duration-300 group-hover:scale-110 ${active ? 'text-[#1A6BFF]' : 'group-hover:text-[#1A6BFF]'}`} />
                        {!collapsed && (
                          <>
                            <span className="flex-1 truncate tracking-tight">{item.label}</span>
                            {item.badge && (
                              <span className={`ml-auto text-[10px] font-black px-2 py-0.5 rounded-full min-w-[20px] text-center transition-colors duration-300
                                ${active ? 'bg-[#1A6BFF] text-white' : 'bg-[#1A6BFF] text-white'}`}>
                                {item.badge}
                              </span>
                            )}
                          </>
                        )}
                        {collapsed && item.badge && (active ? null : (
                          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                        ))}
                      </Link>
                      {collapsed && <span className="tooltip-text">{item.label}</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>
    </aside>
  );

  return (
    <>
      <div className="hidden lg:flex h-full">{sidebarContent}</div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />
        )}
      </AnimatePresence>

      <motion.div
        initial={false} animate={{ x: mobileOpen ? 0 : -280 }}
        transition={{ type: 'spring', stiffness: 350, damping: 35 }}
        className="lg:hidden fixed inset-y-0 left-0 z-50 flex flex-col" style={{ width: '280px' }}
      >
        {sidebarContent}
      </motion.div>
    </>
  );
}
