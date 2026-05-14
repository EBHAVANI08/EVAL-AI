'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell } from 'lucide-react';

const pageMeta: Record<string, { title: string; subtitle: string }> = {
  '/student-dashboard': { title: 'Student Dashboard', subtitle: 'Track your exam results and performance' },
  '/student-dashboard/results': { title: 'My Results', subtitle: 'View all your evaluated answer sheets' },
  '/student-dashboard/performance': { title: 'Performance Analytics', subtitle: 'Analyse your academic performance over time' },
  '/student-dashboard/downloads': { title: 'Downloads', subtitle: 'Download your evaluated papers and reports' },
  '/student-dashboard/settings': { title: 'Settings', subtitle: 'Manage your account and preferences' },
  '/student-dashboard/profile': { title: 'My Profile', subtitle: 'Manage your student profile and information' },
};

export default function StudentHeader() {
  const pathname = usePathname();
  const meta = pageMeta[pathname] ?? { title: 'Student Portal', subtitle: '' };

  return (
    <header className="bg-card border-b border-border px-8 py-4 flex items-center justify-between shrink-0">
      <div>
        <h1 className="text-lg font-bold text-foreground">{meta.title}</h1>
        <p className="text-xs text-muted-foreground mt-0.5">{meta.subtitle}</p>
      </div>
      <div className="flex items-center gap-3">
        <button className="relative p-2 hover:bg-muted rounded-lg transition-colors">
          <Bell size={18} className="text-muted-foreground" />
        </button>
        <Link href="/student-dashboard/profile">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-orange-300 transition-all">
            <span className="text-sm font-bold text-white">S</span>
          </div>
        </Link>
      </div>
    </header>
  );
}
