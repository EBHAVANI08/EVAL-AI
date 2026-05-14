'use client';

import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, School, BarChart3, Settings, LogOut,
  ChevronLeft, ChevronRight, Bell, ShieldCheck, UserCheck,
  ClipboardCheck, TrendingUp, AlertTriangle, Search, Plus, MoreHorizontal,
  Activity, Database, Globe, Loader2,
} from 'lucide-react';

const navGroups = [
  {
    label: null,
    items: [{ label: 'Dashboard', icon: LayoutDashboard }],
  },
  {
    label: 'Management',
    items: [
      { label: 'Teachers', icon: UserCheck },
      { label: 'Students', icon: Users },
      { label: 'Schools',  icon: School },
    ],
  },
  {
    label: 'Platform',
    items: [
      { label: 'Analytics',     icon: BarChart3 },
      { label: 'Activity Log',  icon: Activity },
      { label: 'System Health', icon: Database },
    ],
  },
  {
    label: 'System',
    items: [{ label: 'Settings', icon: Settings }],
  },
];

export default function AdminDashboardPage() {
  const { data: session } = useSession();
  const [collapsed, setCollapsed]   = useState(false);
  const [activeNav, setActiveNav]   = useState('Dashboard');
  const [stats,    setStats]        = useState<any>(null);
  const [users,    setUsers]        = useState<any[]>([]);
  const [loading,  setLoading]      = useState(true);
  const [logoutOpen,  setLogoutOpen]  = useState(false);
  const [loggingOut,  setLoggingOut]  = useState(false);

  const userName    = session?.user?.name ?? 'Admin';
  const userInitial = userName.charAt(0).toUpperCase();

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/stats').then(r => r.json()),
      fetch('/api/students').then(r => r.json()),
    ])
      .then(([statsRes, usersRes]) => {
        setStats(statsRes);
        if (usersRes.students) setUsers(usersRes.students.slice(0, 5));
      })
      .catch(err => console.error('Admin dashboard fetch error:', err))
      .finally(() => setLoading(false));
  }, []);

  const confirmLogout = async () => {
    setLoggingOut(true);
    await signOut({ callbackUrl: '/' });
  };

  const platformStats = [
    { label: 'Total Teachers',   value: loading ? '…' : String(stats?.totalTeachers  || 0), icon: UserCheck,      color: 'text-orange-500', bg: 'bg-orange-50',  border: 'border-orange-100' },
    { label: 'Total Students',   value: loading ? '…' : String(stats?.totalStudents   || 0), icon: Users,          color: 'text-blue-500',   bg: 'bg-blue-50',    border: 'border-blue-100' },
    { label: 'Schools Onboarded',value: loading ? '…' : String(stats?.totalSchools    || 0), icon: School,         color: 'text-emerald-600',bg: 'bg-emerald-50', border: 'border-emerald-100' },
    { label: 'Total Evaluations',value: loading ? '…' : String(stats?.totalEvaluations|| 0), icon: ClipboardCheck, color: 'text-purple-500', bg: 'bg-purple-50',  border: 'border-purple-100' },
    { label: 'Active AI Sessions',value: loading ? '…' : String(stats?.activeSessions || 0), icon: TrendingUp,     color: 'text-amber-500',  bg: 'bg-amber-50',   border: 'border-amber-100' },
    { label: 'Flagged Reviews',  value: loading ? '…' : String(stats?.flaggedReviews  || 0), icon: AlertTriangle,  color: 'text-red-500',    bg: 'bg-red-50',     border: 'border-red-100' },
  ];

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
              <span className="text-xs text-orange-500 font-semibold truncate">Admin Console</span>
            </div>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-16 z-10 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center shadow-sm hover:bg-muted"
        >
          {collapsed
            ? <ChevronRight size={12} className="text-muted-foreground" />
            : <ChevronLeft  size={12} className="text-muted-foreground" />}
        </button>

        {/* Nav */}
        <nav className="flex-1 py-3 px-2 overflow-y-auto">
          {navGroups.map((group, gi) => (
            <div key={gi} className="mb-4">
              {group.label && !collapsed && (
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-1 mt-2">
                  {group.label}
                </p>
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
                        ? 'bg-orange-50 text-orange-600 font-semibold'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    } ${collapsed ? 'justify-center !px-0' : ''}`}
                  >
                    <Icon size={18} className="shrink-0" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Bottom — user + sign out */}
        <div className="border-t border-border p-2 space-y-1">
          <div className={`flex items-center gap-2 p-2 rounded-lg ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-orange-600">{userInitial}</span>
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{userName}</p>
                <p className="text-xs text-muted-foreground truncate">Super Admin</p>
              </div>
            )}
          </div>

          {!collapsed ? (
            <button
              onClick={() => setLogoutOpen(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all"
            >
              <LogOut size={15} /> Sign Out
            </button>
          ) : (
            <button
              onClick={() => setLogoutOpen(true)}
              className="w-full flex items-center justify-center py-2 rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-colors"
            >
              <LogOut size={17} />
            </button>
          )}
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto bg-background">
        {/* Header */}
        <div className="bg-card border-b border-border px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-lg font-bold text-foreground">Admin Console</h1>
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
              <span className="text-sm font-bold text-orange-600">{userInitial}</span>
            </div>
          </div>
        </div>

        <div className="px-8 py-6 max-w-screen-xl mx-auto">
          {/* Welcome banner */}
          <div className="mb-6 p-6 rounded-2xl bg-gradient-to-r from-orange-500 via-orange-600 to-red-600 text-white flex items-center justify-between shadow-lg">
            <div>
              <h2 className="text-2xl font-bold mb-1">
                {activeNav === 'Dashboard' ? 'Platform Overview' : activeNav}
              </h2>
              <p className="text-white/80 text-sm">
                Monitor all teachers, students, schools, and evaluations from one place.
              </p>
            </div>
            <Globe size={48} className="text-white/20" />
          </div>

          {/* Dashboard section */}
          {activeNav === 'Dashboard' && (
            <>
              {/* Stats grid */}
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
                {platformStats.map((s) => {
                  const Icon = s.icon;
                  return (
                    <div key={s.label} className={`bg-card border ${s.border} rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow`}>
                      <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mb-2`}>
                        <Icon size={18} className={s.color} />
                      </div>
                      <p className="text-xl font-bold text-foreground">{s.value}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{s.label}</p>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Users table */}
                <div className="xl:col-span-2 bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                  <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-foreground text-sm">Recent Platform Users</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">Summary of students with evaluations</p>
                    </div>
                    <button className="flex items-center gap-1.5 text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600 px-3 py-1.5 rounded-lg transition-colors">
                      <Plus size={12} /> Add User
                    </button>
                  </div>
                  {loading ? (
                    <div className="px-6 py-20 text-center">
                      <Loader2 size={32} className="animate-spin text-orange-500/40 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">Loading users…</p>
                    </div>
                  ) : users.length === 0 ? (
                    <div className="px-6 py-20 text-center">
                      <Users size={32} className="text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground font-semibold">No users found</p>
                    </div>
                  ) : (
                    <>
                      <div className="px-6 py-2.5 bg-muted/40 border-b border-border grid grid-cols-5 gap-4">
                        {['Name', 'Roll No', 'Class', 'Evaluations', 'Avg Score'].map((h) => (
                          <span key={h} className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</span>
                        ))}
                      </div>
                      {users.map((u, i) => (
                        <div key={i} className="px-6 py-3.5 grid grid-cols-5 gap-4 items-center border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                          <span className="text-sm font-semibold text-foreground">{u.name}</span>
                          <span className="text-sm text-muted-foreground font-tabular">{u.rollNo}</span>
                          <span className="text-sm text-muted-foreground">{u.class}</span>
                          <span className="text-sm font-semibold text-foreground">{u.evalCount}</span>
                          <span className="text-sm font-bold text-orange-600">{u.avgScore}%</span>
                        </div>
                      ))}
                    </>
                  )}
                </div>

                {/* Quick actions + system status */}
                <div className="space-y-4">
                  <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                    <h3 className="font-bold text-foreground text-sm mb-4">Quick Actions</h3>
                    <div className="space-y-2">
                      {[
                        { label: 'Add New Teacher',   icon: UserCheck,      color: 'bg-orange-50 text-orange-600', nav: 'Teachers' },
                        { label: 'Onboard School',    icon: School,         color: 'bg-blue-50 text-blue-600',     nav: 'Schools' },
                        { label: 'View Evaluations',  icon: ClipboardCheck, color: 'bg-purple-50 text-purple-600', nav: 'Dashboard' },
                        { label: 'Platform Analytics',icon: BarChart3,      color: 'bg-emerald-50 text-emerald-600', nav: 'Analytics' },
                        { label: 'System Settings',   icon: Settings,       color: 'bg-muted text-muted-foreground', nav: 'Settings' },
                      ].map((action) => {
                        const Icon = action.icon;
                        return (
                          <button
                            key={action.label}
                            onClick={() => setActiveNav(action.nav)}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-border hover:bg-muted/40 transition-colors text-left"
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${action.color}`}>
                              <Icon size={15} />
                            </div>
                            <span className="text-sm font-medium text-foreground">{action.label}</span>
                            <MoreHorizontal size={14} className="text-muted-foreground ml-auto" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                    <h3 className="font-bold text-foreground text-sm mb-3">System Status</h3>
                    <div className="space-y-2.5">
                      {['AI Engine', 'OCR Service', 'Database', 'Storage'].map((s) => (
                        <div key={s} className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">{s}</span>
                          <span className="flex items-center gap-1.5 text-xs font-semibold text-green-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
                            Operational
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Placeholder sections for other nav items */}
          {activeNav !== 'Dashboard' && (
            <div className="bg-card border border-border rounded-2xl p-12 text-center shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto mb-4">
                {(() => {
                  const item = navGroups.flatMap(g => g.items).find(i => i.label === activeNav);
                  const Icon = item?.icon ?? LayoutDashboard;
                  return <Icon size={28} className="text-orange-500" />;
                })()}
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">{activeNav}</h3>
              <p className="text-sm text-muted-foreground">This section is coming soon.</p>
            </div>
          )}
        </div>
      </main>

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
    </div>
  );
}
