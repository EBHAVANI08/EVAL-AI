'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard, FileText, BarChart3, Download, Settings, LogOut,
  ChevronLeft, ChevronRight, Award, TrendingUp, BookOpen, ClipboardList,
  Bell, Eye, Search, Filter
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/student-dashboard', icon: LayoutDashboard },
  { label: 'My Results', href: '/student-dashboard', icon: ClipboardList },
  { label: 'Performance', href: '/student-dashboard', icon: BarChart3 },
  { label: 'Downloads', href: '/student-dashboard', icon: Download },
  { label: 'Settings', href: '/student-dashboard', icon: Settings },
];

const results = [
  { subject: 'Physics', exam: 'Unit Test 1', date: '—', score: '—', total: '—', grade: '—', status: 'Pending' },
];

const stats = [
  { label: 'Papers Evaluated', value: '0', icon: FileText, color: 'text-orange-500', bg: 'bg-orange-50' },
  { label: 'Average Score', value: '—', icon: Award, color: 'text-amber-500', bg: 'bg-amber-50' },
  { label: 'Best Subject', value: '—', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
  { label: 'Pending Review', value: '0', icon: ClipboardList, color: 'text-blue-500', bg: 'bg-blue-50' },
];

export default function StudentDashboardPage() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside
        className="relative flex flex-col border-r border-border bg-card shrink-0 transition-all duration-300"
        style={{ width: collapsed ? 64 : 240 }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 px-3 py-4 border-b border-border overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shrink-0">
            <BookOpen size={16} className="text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-sm text-foreground leading-tight truncate">Eval AI</span>
              <span className="text-xs text-orange-500 font-600 truncate">Student Portal</span>
            </div>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-16 z-10 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center shadow-sm hover:bg-muted"
        >
          {collapsed ? <ChevronRight size={12} className="text-muted-foreground" /> : <ChevronLeft size={12} className="text-muted-foreground" />}
        </button>

        {/* Nav */}
        <nav className="flex-1 py-3 px-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.label === 'Dashboard';
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  active
                    ? 'bg-orange-50 text-orange-600 font-600'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                } ${collapsed ? 'justify-center px-0' : ''}`}
              >
                <Icon size={18} className="shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="border-t border-border p-2 space-y-1">
          <div className={`flex items-center gap-2 p-2 rounded-lg hover:bg-muted cursor-pointer ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-orange-600">S</span>
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-600 text-foreground truncate">Student</p>
                <p className="text-xs text-muted-foreground truncate">My Account</p>
              </div>
            )}
            {!collapsed && <LogOut size={14} className="text-muted-foreground shrink-0" />}
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto bg-background">
        {/* Header */}
        <div className="bg-card border-b border-border px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-lg font-700 text-foreground">Student Dashboard</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Track your exam results and performance</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 hover:bg-muted rounded-lg">
              <Bell size={18} className="text-muted-foreground" />
            </button>
            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
              <span className="text-sm font-bold text-orange-600">S</span>
            </div>
          </div>
        </div>

        <div className="px-8 py-6 max-w-screen-xl mx-auto">
          {/* Welcome */}
          <div className="mb-6 p-5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white">
            <h2 className="text-xl font-700 mb-1">Welcome back, Student!</h2>
            <p className="text-white/80 text-sm">Your evaluated answer sheets and performance insights will appear here once your teacher completes the evaluation.</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="bg-card border border-border rounded-2xl p-5">
                  <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                    <Icon size={20} className={s.color} />
                  </div>
                  <p className="text-2xl font-700 text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                </div>
              );
            })}
          </div>

          {/* Results table */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="font-700 text-foreground text-sm">My Evaluated Results</h3>
                <p className="text-xs text-muted-foreground mt-0.5">All evaluated answer sheets will appear here</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1.5 text-xs text-muted-foreground border border-border px-3 py-1.5 rounded-lg hover:bg-muted">
                  <Search size={12} /> Search
                </button>
                <button className="flex items-center gap-1.5 text-xs text-muted-foreground border border-border px-3 py-1.5 rounded-lg hover:bg-muted">
                  <Filter size={12} /> Filter
                </button>
              </div>
            </div>
            <div className="px-6 py-3 bg-muted/40 border-b border-border grid grid-cols-6 gap-4">
              {['Subject', 'Exam', 'Date', 'Score', 'Grade', 'Action'].map((h) => (
                <span key={h} className="text-xs font-600 text-muted-foreground uppercase tracking-wider">{h}</span>
              ))}
            </div>
            {results.map((r, i) => (
              <div key={i} className="px-6 py-4 grid grid-cols-6 gap-4 items-center border-b border-border last:border-0 hover:bg-muted/20">
                <span className="text-sm font-600 text-foreground">{r.subject}</span>
                <span className="text-sm text-muted-foreground">{r.exam}</span>
                <span className="text-sm text-muted-foreground">{r.date}</span>
                <span className="text-sm font-700 text-foreground">{r.score}/{r.total}</span>
                <span className={`text-xs font-700 px-2 py-0.5 rounded-full w-fit ${r.grade === '—' ? 'bg-muted text-muted-foreground' : 'bg-orange-100 text-orange-700'}`}>{r.grade}</span>
                <button className="flex items-center gap-1 text-xs text-primary hover:underline">
                  <Eye size={12} /> View
                </button>
              </div>
            ))}
            <div className="px-6 py-12 text-center">
              <ClipboardList size={32} className="text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground font-600">No evaluated papers yet</p>
              <p className="text-xs text-muted-foreground mt-1">Your teacher will share results here after evaluation</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
