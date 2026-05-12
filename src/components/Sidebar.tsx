'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <aside
      className="relative flex flex-col border-r border-border bg-card transition-all duration-300 ease-in-out shrink-0"
      style={{ width: collapsed ? '64px' : '240px' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-3 py-4 border-b border-border overflow-hidden">
        <div className="shrink-0">
          <AppLogo size={32} />
        </div>
        {!collapsed && (
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-sm text-foreground leading-tight truncate">Eval AI</span>
            <span className="text-xs text-orange-500 font-600 truncate">Teacher Portal</span>
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-16 z-10 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center shadow-sm hover:bg-muted transition-colors duration-150"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? (
          <ChevronRight size={12} className="text-muted-foreground" />
        ) : (
          <ChevronLeft size={12} className="text-muted-foreground" />
        )}
      </button>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin py-3 px-2">
        {groups.map((group) => {
          const items = navItems.filter((n) => n.group === group.id);
          if (items.length === 0) return null;
          return (
            <div key={`group-${group.id}`} className="mb-4">
              {group.label && !collapsed && (
                <p className="metric-label px-2 mb-1 mt-2">{group.label}</p>
              )}
              {items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <div key={item.id} className="tooltip-custom">
                    <Link
                      href={item.href}
                      className={`sidebar-item ${active ? 'sidebar-item-active' : ''} ${collapsed ? 'justify-center px-0 py-2.5' : ''}`}
                    >
                      <Icon size={18} className="shrink-0" />
                      {!collapsed && (
                        <>
                          <span className="flex-1 truncate">{item.label}</span>
                          {item.badge && (
                            <span className="ml-auto bg-primary text-primary-foreground text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                      {collapsed && item.badge && (
                        <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
                      )}
                    </Link>
                    {collapsed && (
                      <span className="tooltip-text">{item.label}</span>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Bottom user area */}
      <div className="border-t border-border p-2">
        <div className="tooltip-custom">
          <button className="sidebar-item w-full">
            <Bell size={18} className="shrink-0" />
            {!collapsed && (
              <>
                <span className="flex-1 text-left">Notifications</span>
                <span className="bg-warning text-white text-xs font-bold px-1.5 py-0.5 rounded-full">3</span>
              </>
            )}
          </button>
          {collapsed && <span className="tooltip-text">Notifications</span>}
        </div>
        <div className="tooltip-custom">
          <div className={`flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-orange-600">T</span>
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-600 text-foreground truncate">Teacher</p>
                <p className="text-xs text-muted-foreground truncate">My Account</p>
              </div>
            )}
            {!collapsed && <LogOut size={14} className="text-muted-foreground shrink-0" />}
          </div>
          {collapsed && <span className="tooltip-text">My Account</span>}
        </div>
      </div>
    </aside>
  );
}