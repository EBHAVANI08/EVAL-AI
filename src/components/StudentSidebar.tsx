'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, ClipboardList, BarChart3, Download, Settings, LogOut, BookOpen,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/student-dashboard', icon: LayoutDashboard },
  { label: 'My Results', href: '/student-dashboard/results', icon: ClipboardList },
  { label: 'Performance', href: '/student-dashboard/performance', icon: BarChart3 },
  { label: 'Downloads', href: '/student-dashboard/downloads', icon: Download },
  { label: 'Settings', href: '/student-dashboard/settings', icon: Settings },
];

export default function StudentSidebar() {
  const pathname = usePathname();

  return (
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
          const active = pathname === item.href;
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

      {/* Profile link at bottom */}
      <div className="border-t border-border p-3">
        <Link
          href="/student-dashboard/profile"
          className={`flex items-center gap-2.5 p-2.5 rounded-lg transition-colors group ${
            pathname === '/student-dashboard/profile'
              ? 'bg-orange-50'
              : 'hover:bg-muted'
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-white">S</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">Student</p>
            <p className="text-xs text-muted-foreground truncate">View Profile</p>
          </div>
          <LogOut size={14} className="text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>
      </div>
    </aside>
  );
}
