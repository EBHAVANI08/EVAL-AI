'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard, Users, School, BarChart3, Settings, LogOut,
  ChevronLeft, ChevronRight, Bell, ShieldCheck, UserCheck, BookOpen,
  ClipboardCheck, TrendingUp, AlertTriangle, Search, Plus, MoreHorizontal,
  Activity, Database, Globe
} from 'lucide-react';

const navGroups = [
  {
    label: null,
    items: [{ label: 'Dashboard', icon: LayoutDashboard, active: true }],
  },
  {
    label: 'Management',
    items: [
      { label: 'Teachers', icon: UserCheck, active: false },
      { label: 'Students', icon: Users, active: false },
      { label: 'Schools', icon: School, active: false },
    ],
  },
  {
    label: 'Platform',
    items: [
      { label: 'Analytics', icon: BarChart3, active: false },
      { label: 'Activity Log', icon: Activity, active: false },
      { label: 'System Health', icon: Database, active: false },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Settings', icon: Settings, active: false },
    ],
  },
];

const platformStats = [
  { label: 'Total Teachers', value: '0', delta: null, icon: UserCheck, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100' },
  { label: 'Total Students', value: '0', delta: null, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100' },
  { label: 'Schools Onboarded', value: '0', delta: null, icon: School, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  { label: 'Total Evaluations', value: '0', delta: null, icon: ClipboardCheck, color: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-100' },
  { label: 'Active AI Sessions', value: '0', delta: null, icon: TrendingUp, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100' },
  { label: 'Flagged Reviews', value: '0', delta: null, icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100' },
];

const recentUsers = [
  { name: '—', role: 'Teacher', school: '—', joined: '—', status: 'Active' },
];

export default function AdminDashboardPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [activeNav, setActiveNav] = useState('Dashboard');

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Admin Sidebar */}
      <aside
        className="relative flex flex-col border-r border-border bg-card shrink-0 transition-all duration-300"
        style={{ width: collapsed ? 64 : 240 }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 px-3 py-4 border-b border-border overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shrink-0">
            <ShieldCheck size={16} className="text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-sm text-foreground leading-tight truncate">Eval AI</span>
              <span className="text-xs text-orange-500 font-600 truncate">Admin Console</span>
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
        <nav className="flex-1 py-3 px-2 overflow-y-auto">
          {navGroups.map((group, gi) => (
            <div key={gi} className="mb-4">
              {group.label && !collapsed && (
                <p className="text-xs font-600 text-muted-foreground uppercase tracking-wider px-2 mb-1 mt-2">{group.label}</p>
              )}
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeNav === item.label;
                return (
                  <button
                    key={item.label}
                    onClick={() => setActiveNav(item.label)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors mb-0.5 ${
                      isActive
                        ? 'bg-orange-50 text-orange-600 font-600'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    } ${collapsed ? 'justify-center px-0' : ''}`}
                  >
                    <Icon size={18} className="shrink-0" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Bottom */}
        <div className="border-t border-border p-2">
          <div className={`flex items-center gap-2 p-2 rounded-lg hover:bg-muted cursor-pointer ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-orange-600">A</span>
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-600 text-foreground truncate">Admin</p>
                <p className="text-xs text-muted-foreground truncate">Super Admin</p>
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
            <h1 className="text-lg font-700 text-foreground">Admin Console</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Platform management and oversight</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search users, schools..."
                className="pl-8 pr-4 py-1.5 text-sm border border-border rounded-lg bg-muted/40 focus:outline-none focus:ring-2 focus:ring-orange-400/30 w-56"
              />
            </div>
            <button className="relative p-2 hover:bg-muted rounded-lg">
              <Bell size={18} className="text-muted-foreground" />
            </button>
            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
              <span className="text-sm font-bold text-orange-600">A</span>
            </div>
          </div>
        </div>

        <div className="px-8 py-6 max-w-screen-2xl mx-auto">

          {/* Welcome banner */}
          <div className="mb-6 p-5 rounded-2xl bg-gradient-to-r from-orange-500 via-orange-600 to-red-600 text-white flex items-center justify-between">
            <div>
              <h2 className="text-xl font-700 mb-1">Platform Overview</h2>
              <p className="text-white/80 text-sm">Monitor all teachers, students, schools, and evaluations from one place.</p>
            </div>
            <div className="flex items-center gap-2">
              <Globe size={40} className="text-white/20" />
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
            {platformStats.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className={`bg-card border ${s.border} rounded-2xl p-4`}>
                  <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mb-2`}>
                    <Icon size={18} className={s.color} />
                  </div>
                  <p className="text-xl font-700 text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{s.label}</p>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Users table */}
            <div className="xl:col-span-2 bg-card border border-border rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                <div>
                  <h3 className="font-700 text-foreground text-sm">Recent Users</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Teachers and students on the platform</p>
                </div>
                <button className="flex items-center gap-1.5 text-xs font-600 text-white bg-orange-500 hover:bg-orange-600 px-3 py-1.5 rounded-lg transition-colors">
                  <Plus size={12} /> Add User
                </button>
              </div>
              <div className="px-6 py-2.5 bg-muted/40 border-b border-border grid grid-cols-5 gap-4">
                {['Name', 'Role', 'School', 'Joined', 'Status'].map((h) => (
                  <span key={h} className="text-xs font-600 text-muted-foreground uppercase tracking-wider">{h}</span>
                ))}
              </div>
              <div className="px-6 py-14 text-center">
                <Users size={32} className="text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground font-600">No users yet</p>
                <p className="text-xs text-muted-foreground mt-1">Users will appear here after registration</p>
              </div>
            </div>

            {/* Quick actions */}
            <div className="space-y-4">
              <div className="bg-card border border-border rounded-2xl p-5">
                <h3 className="font-700 text-foreground text-sm mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  {[
                    { label: 'Add New Teacher', icon: UserCheck, color: 'bg-orange-50 text-orange-600' },
                    { label: 'Onboard School', icon: School, color: 'bg-blue-50 text-blue-600' },
                    { label: 'View Evaluations', icon: ClipboardCheck, color: 'bg-purple-50 text-purple-600' },
                    { label: 'Platform Analytics', icon: BarChart3, color: 'bg-emerald-50 text-emerald-600' },
                    { label: 'System Settings', icon: Settings, color: 'bg-muted text-muted-foreground' },
                  ].map((action) => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={action.label}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-border hover:bg-muted/40 transition-colors text-left"
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${action.color}`}>
                          <Icon size={15} />
                        </div>
                        <span className="text-sm font-500 text-foreground">{action.label}</span>
                        <MoreHorizontal size={14} className="text-muted-foreground ml-auto" />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="bg-card border border-border rounded-2xl p-5">
                <h3 className="font-700 text-foreground text-sm mb-3">System Status</h3>
                <div className="space-y-2.5">
                  {[
                    { label: 'AI Engine', status: 'Operational' },
                    { label: 'OCR Service', status: 'Operational' },
                    { label: 'Database', status: 'Operational' },
                    { label: 'Storage', status: 'Operational' },
                  ].map((s) => (
                    <div key={s.label} className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{s.label}</span>
                      <span className="flex items-center gap-1.5 text-xs font-600 text-green-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
                        {s.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
