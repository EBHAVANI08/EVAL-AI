'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  { id: 'tools', label: 'AI Tools' },
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
  const notifRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

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

  const handleNavClick = () => {
    // Close mobile drawer on nav
    onClose();
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
            <span className="font-700 text-sm text-foreground leading-tight truncate tracking-tight">Eval AI</span>
            <span className="text-[11px] text-orange-500 font-600 truncate">Teacher Portal</span>
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
          : <ChevronLeft  size={11} className="text-muted-foreground" />}
      </button>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin py-2 px-2">
        {groups.map((group) => {
          const items = navItems.filter((n) => n.group === group.id);
          if (items.length === 0) return null;
          return (
            <div key={`group-${group.id}`} className="mb-1">
              {group.label && !collapsed && (
                <p className="px-2 pt-3 pb-1 text-[10.5px] font-700 uppercase tracking-[0.08em] text-muted-foreground/70">
                  {group.label}
                </p>
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
                      <Icon size={17} className="shrink-0" />
                      {!collapsed && (
                        <>
                          <span className="flex-1 truncate">{item.label}</span>
                          {item.badge && (
                            <span className="ml-auto bg-primary text-primary-foreground text-[10px] font-700 px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
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
      <div className="border-t border-border p-2 space-y-0.5">
        <div className="tooltip-custom relative" ref={notifRef}>
          <button
            className="sidebar-item w-full"
            onClick={() => setNotifOpen((v) => !v)}
          >
            <Bell size={17} className="shrink-0" />
            {!collapsed && (
              <>
                <span className="flex-1 text-left">Notifications</span>
                <span className="bg-warning text-white text-[10px] font-700 px-1.5 py-0.5 rounded-full">0</span>
              </>
            )}
          </button>
          {collapsed && <span className="tooltip-text">Notifications</span>}

          {/* Notification dropdown */}
          {notifOpen && (
            <div className="absolute bottom-full left-0 mb-2 w-72 bg-card border border-border rounded-2xl shadow-[var(--shadow-lg)] overflow-hidden z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <span className="text-sm font-700 text-foreground">Notifications</span>
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
                <p className="text-sm font-600 text-muted-foreground">No notifications</p>
                <p className="text-xs text-muted-foreground/60 mt-1">You're all caught up!</p>
              </div>
            </div>
          )}
        </div>
        <div className="tooltip-custom">
          <div
            onClick={() => { router.push('/settings'); onClose(); }}
            className={`flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-muted transition-colors cursor-pointer ${collapsed ? 'justify-center' : ''}`}
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center shrink-0 border border-orange-200">
              <span className="text-xs font-700 text-orange-600">T</span>
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-600 text-foreground truncate leading-tight">Teacher</p>
                <p className="text-[11px] text-muted-foreground truncate">My Account</p>
              </div>
            )}
            {!collapsed && <LogOut size={13} className="text-muted-foreground/60 shrink-0" />}
          </div>
          {collapsed && <span className="tooltip-text">My Account</span>}
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop sidebar — always visible */}
      <div className="hidden lg:flex h-full">
        {sidebarContent}
      </div>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer panel */}
      <div
        className={`lg:hidden fixed inset-y-0 left-0 z-50 flex flex-col transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ width: '240px' }}
      >
        {sidebarContent}
      </div>
    </>
  );
}
