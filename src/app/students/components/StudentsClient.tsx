'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users, Search, Plus, X, ChevronDown, ChevronUp, Eye,
  Loader2, TrendingUp, BookOpen, Award, Clock,
} from 'lucide-react';
import toast from 'react-hot-toast';
import StatusBadge from '@/components/ui/StatusBadge';

type Student = {
  name: string;
  rollNo: string;
  class: string;
  evalCount: number;
  totalObtained: number;
  totalMax: number;
  avgScore: number | null;
  avgConfidence: number | null;
  lastEvaluated: string | null;
  finalizedCount: number;
};

type EvalRow = {
  id: string;
  subject: string;
  class: string;
  obtained: number | null;
  maxMarks: number;
  aiConfidence: number | null;
  overrides: number;
  status: string;
  evaluatedAt: string;
};

type AddForm = {
  name: string;
  rollNo: string;
  class: string;
  subject: string;
  phone: string;
  parentName: string;
};

const EMPTY_FORM: AddForm = { name: '', rollNo: '', class: '', subject: '', phone: '', parentName: '' };

function scoreColor(score: number | null) {
  if (score === null) return 'text-muted-foreground';
  if (score >= 75) return 'text-positive';
  if (score >= 50) return 'text-warning';
  return 'text-negative';
}

function initials(name: string) {
  return name !== '—'
    ? name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';
}

function avatarBg(name: string) {
  const colors = [
    'bg-indigo-100 text-indigo-700',
    'bg-emerald-100 text-emerald-700',
    'bg-amber-100 text-amber-700',
    'bg-rose-100 text-rose-700',
    'bg-cyan-100 text-cyan-700',
    'bg-purple-100 text-purple-700',
  ];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return colors[Math.abs(h) % colors.length];
}

export default function StudentsClient() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [evalHistory, setEvalHistory] = useState<EvalRow[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<AddForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadStudents();
  }, [search, classFilter]);

  async function loadStudents() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (classFilter) params.set('class', classFilter);
      const res = await fetch(`/api/students?${params}`);
      const data = await res.json();
      setStudents(data.students || []);
    } catch {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  }

  async function loadHistory(rollNo: string) {
    setHistoryLoading(true);
    setEvalHistory([]);
    try {
      const res = await fetch(`/api/students/${encodeURIComponent(rollNo)}`);
      const data = await res.json();
      setEvalHistory(data.evaluations || []);
    } catch {
      toast.error('Failed to load evaluation history');
    } finally {
      setHistoryLoading(false);
    }
  }

  function toggleExpand(rollNo: string) {
    if (expanded === rollNo) {
      setExpanded(null);
    } else {
      setExpanded(rollNo);
      loadHistory(rollNo);
    }
  }

  async function handleAdd() {
    if (!form.name.trim() || !form.rollNo.trim()) {
      toast.error('Name and Roll No are required');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Save failed');
      toast.success('Student added');
      setShowAdd(false);
      setForm(EMPTY_FORM);
      loadStudents();
    } catch {
      toast.error('Failed to add student');
    } finally {
      setSaving(false);
    }
  }

  const classes = Array.from(new Set(students.map((s) => s.class).filter(Boolean))).sort();

  const totalEvals = students.reduce((s, st) => s + st.evalCount, 0);
  const avgAll = students.length
    ? Math.round(students.filter((s) => s.avgScore !== null).reduce((s, st) => s + (st.avgScore ?? 0), 0) /
        (students.filter((s) => s.avgScore !== null).length || 1))
    : 0;
  const passRate = students.length
    ? Math.round(
        (students.filter((s) => s.avgScore !== null && s.avgScore >= 33).length /
          (students.filter((s) => s.avgScore !== null).length || 1)) *
          100
      )
    : 0;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users size={22} className="text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Students</h1>
          </div>
          <p className="text-sm text-muted-foreground">Manage students and track their evaluation history</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="btn-primary flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-600"
        >
          <Plus size={16} />
          Add Student
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Students', value: students.length, icon: Users, color: 'text-primary' },
          { label: 'Total Evaluations', value: totalEvals, icon: BookOpen, color: 'text-info' },
          { label: 'Avg Score', value: avgAll ? `${avgAll}%` : '—', icon: TrendingUp, color: 'text-positive' },
          { label: 'Pass Rate', value: `${passRate}%`, icon: Award, color: 'text-warning' },
        ].map((stat) => (
          <div key={stat.label} className="bg-card border border-border rounded-2xl p-4 shadow-card">
            <div className="flex items-center gap-2 mb-2">
              <stat.icon size={16} className={stat.color} />
              <span className="text-xs font-500 text-muted-foreground">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Search + filter */}
      <div className="bg-card border border-border rounded-2xl shadow-card overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or roll number..."
              className="pl-8 pr-3 py-2 text-sm input-field"
            />
          </div>
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="input-field w-36 py-2 text-sm"
          >
            <option value="">All Classes</option>
            {classes.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground ml-auto">{students.length} student{students.length !== 1 ? 's' : ''}</p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {['Student', 'Roll No', 'Class', 'Evaluations', 'Avg Score', 'AI Confidence', 'Last Evaluated', ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-600 text-muted-foreground uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <Loader2 size={20} className="animate-spin text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Loading students…</p>
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <Users size={36} className="text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm font-500 text-foreground mb-1">No students yet</p>
                    <p className="text-xs text-muted-foreground">
                      Students appear here after evaluations are saved, or add them manually.
                    </p>
                  </td>
                </tr>
              ) : (
                students.map((st) => (
                  <React.Fragment key={st.rollNo}>
                    <tr
                      className={`border-b border-border transition-colors hover:bg-secondary/40 cursor-pointer ${expanded === st.rollNo ? 'bg-secondary/20' : ''}`}
                      onClick={() => toggleExpand(st.rollNo)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-700 shrink-0 ${avatarBg(st.name)}`}>
                            {initials(st.name)}
                          </div>
                          <span className="text-sm font-600 text-foreground">{st.name || '—'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground font-tabular">{st.rollNo || '—'}</td>
                      <td className="px-4 py-3 text-sm text-foreground">{st.class || '—'}</td>
                      <td className="px-4 py-3 text-sm font-tabular text-foreground">{st.evalCount}</td>
                      <td className="px-4 py-3">
                        <span className={`text-sm font-700 font-tabular ${scoreColor(st.avgScore)}`}>
                          {st.avgScore !== null ? `${st.avgScore}%` : '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-sm font-700 font-tabular ${st.avgConfidence !== null && st.avgConfidence >= 85 ? 'text-positive' : st.avgConfidence !== null && st.avgConfidence >= 70 ? 'text-warning' : st.avgConfidence !== null ? 'text-negative' : 'text-muted-foreground'}`}>
                          {st.avgConfidence !== null ? `${st.avgConfidence}%` : '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                        {st.lastEvaluated ? new Date(st.lastEvaluated).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        {expanded === st.rollNo
                          ? <ChevronUp size={16} className="text-primary" />
                          : <ChevronDown size={16} className="text-muted-foreground" />}
                      </td>
                    </tr>

                    {/* Expanded history */}
                    {expanded === st.rollNo && (
                      <tr className="border-b border-border">
                        <td colSpan={8} className="bg-secondary/10 px-6 py-4">
                          <p className="text-xs font-600 text-muted-foreground uppercase tracking-wider mb-3">
                            Evaluation History
                          </p>
                          {historyLoading ? (
                            <div className="flex items-center gap-2 py-4">
                              <Loader2 size={16} className="animate-spin text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">Loading history…</span>
                            </div>
                          ) : evalHistory.length === 0 ? (
                            <p className="text-sm text-muted-foreground py-2">No evaluations found for this student.</p>
                          ) : (
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b border-border">
                                    {['Subject', 'Class', 'Score', 'AI Confidence', 'Overrides', 'Status', 'Date', ''].map((h) => (
                                      <th key={h} className="pb-2 pr-4 text-left text-xs font-600 text-muted-foreground">{h}</th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {evalHistory.map((ev) => (
                                    <tr key={ev.id} className="border-b border-border/50 last:border-0">
                                      <td className="py-2 pr-4 font-500">{ev.subject}</td>
                                      <td className="py-2 pr-4 text-muted-foreground">{ev.class}</td>
                                      <td className="py-2 pr-4 font-700 font-tabular">
                                        <span className={scoreColor(ev.obtained !== null && ev.maxMarks > 0 ? Math.round((ev.obtained / ev.maxMarks) * 100) : null)}>
                                          {ev.obtained !== null ? `${ev.obtained}/${ev.maxMarks}` : '—'}
                                        </span>
                                      </td>
                                      <td className="py-2 pr-4 font-tabular">{ev.aiConfidence !== null ? `${ev.aiConfidence}%` : '—'}</td>
                                      <td className="py-2 pr-4 font-tabular">{ev.overrides > 0 ? <span className="text-warning font-600">{ev.overrides}</span> : '—'}</td>
                                      <td className="py-2 pr-4"><StatusBadge variant={ev.status as any} /></td>
                                      <td className="py-2 pr-4 text-muted-foreground whitespace-nowrap">{ev.evaluatedAt}</td>
                                      <td className="py-2">
                                        <Link href={`/answer-sheet-evaluator?id=${ev.id}`} className="flex items-center gap-1 text-primary hover:underline text-xs font-600">
                                          <Eye size={12} /> View
                                        </Link>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Student Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fade-in">
          <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md mx-4 animate-slide-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="font-bold text-foreground">Add Student</h2>
              <button onClick={() => setShowAdd(false)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                <X size={16} className="text-muted-foreground" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {(
                [
                  { key: 'name', label: 'Full Name *', placeholder: 'e.g. Arjun Sharma' },
                  { key: 'rollNo', label: 'Roll Number *', placeholder: 'e.g. 2024001' },
                  { key: 'class', label: 'Class', placeholder: 'e.g. Class 10A' },
                  { key: 'subject', label: 'Primary Subject', placeholder: 'e.g. Mathematics' },
                  { key: 'phone', label: 'Phone', placeholder: 'Parent/Guardian phone' },
                  { key: 'parentName', label: 'Parent Name', placeholder: "Parent's full name" },
                ] as const
              ).map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-600 text-muted-foreground mb-1">{label}</label>
                  <input
                    type="text"
                    value={form[key]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="input-field text-sm py-2"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-border">
              <button onClick={() => setShowAdd(false)} className="btn-secondary flex-1 py-2.5 rounded-xl text-sm font-600">
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={saving}
                className="btn-primary flex-1 py-2.5 rounded-xl text-sm font-600 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                Add Student
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
