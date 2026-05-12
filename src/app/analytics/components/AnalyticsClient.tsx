'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  BarChart3, Brain, Target, Edit2, CheckCircle2, Lock,
  TrendingUp, RefreshCw, Loader2, Users, Award,
} from 'lucide-react';
import toast from 'react-hot-toast';

type AnalyticsData = {
  totalEvaluations: number;
  avgConfidence: number;
  avgScore: number;
  overrideRate: number;
  passRate: number;
  finalizedCount: number;
  subjectStats: { subject: string; count: number; avgScore: number; avgConfidence: number; overrides: number }[];
  scoreDistribution: { label: string; count: number }[];
  monthlyTrend: { month: string; count: number; avgConfidence: number; avgScore: number }[];
  topStudents: { name: string; rollNo: string; total: number; avgScore: number }[];
  confidenceDistribution: { label: string; count: number }[];
};

const C = { primary: '#4F46E5', positive: '#10B981', warning: '#F59E0B', negative: '#EF4444', info: '#3B82F6', muted: '#E5E7EB' };
const PIE_COLORS = [C.negative, C.warning, C.positive];

function KpiCard({
  label, value, sub, icon: Icon, color,
}: { label: string; value: string | number; sub?: string; icon: React.ElementType; color: string }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-card card-hover">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-600 text-muted-foreground uppercase tracking-wider">{label}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center`} style={{ backgroundColor: `${color}18` }}>
          <Icon size={16} style={{ color }} />
        </div>
      </div>
      <p className="text-3xl font-bold text-foreground">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl shadow-card px-3 py-2 text-xs">
      <p className="font-600 text-foreground mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: <span className="font-700">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

export default function AnalyticsClient() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/analytics');
      if (!res.ok) throw new Error('Failed');
      setData(await res.json());
    } catch {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 size={32} className="animate-spin text-primary mb-4" />
        <p className="text-sm text-muted-foreground">Crunching the numbers…</p>
      </div>
    );
  }

  if (!data || data.totalEvaluations === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <BarChart3 size={48} className="text-muted-foreground/30 mb-4" />
        <h2 className="text-lg font-bold text-foreground mb-2">No data yet</h2>
        <p className="text-sm text-muted-foreground">Analytics will appear after you evaluate some answer sheets.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 size={22} className="text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          </div>
          <p className="text-sm text-muted-foreground">Insights from {data.totalEvaluations} evaluations</p>
        </div>
        <button
          onClick={load}
          className="btn-secondary flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-600"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard label="Total Evaluations" value={data.totalEvaluations} icon={BarChart3} color={C.primary} sub="All time" />
        <KpiCard
          label="Avg AI Confidence"
          value={`${data.avgConfidence}%`}
          icon={Brain}
          color={data.avgConfidence >= 85 ? C.positive : data.avgConfidence >= 70 ? C.warning : C.negative}
          sub={data.avgConfidence >= 85 ? 'High accuracy' : data.avgConfidence >= 70 ? 'Moderate' : 'Needs review'}
        />
        <KpiCard label="Avg Score" value={`${data.avgScore}%`} icon={Target} color={C.info} sub="Across all subjects" />
        <KpiCard label="Override Rate" value={`${data.overrideRate}%`} icon={Edit2} color={C.warning} sub="Teacher corrections" />
        <KpiCard
          label="Pass Rate"
          value={`${data.passRate}%`}
          icon={CheckCircle2}
          color={data.passRate >= 70 ? C.positive : C.negative}
          sub="Above 33% threshold"
        />
        <KpiCard label="Finalized" value={data.finalizedCount} icon={Lock} color={C.positive} sub={`of ${data.totalEvaluations} total`} />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Score Distribution */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-card">
          <h3 className="section-header mb-4">Score Distribution</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.scoreDistribution} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.muted} vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#6B7280' }} />
              <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Students" radius={[6, 6, 0, 0]}>
                {data.scoreDistribution.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={
                      entry.label.startsWith('0') ? C.negative
                      : entry.label.startsWith('33') || entry.label.startsWith('50') ? C.warning
                      : C.positive
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Trend */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-card">
          <h3 className="section-header mb-4">Monthly Trend</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={data.monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.muted} vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6B7280' }} />
              <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#6B7280' }} domain={[0, 100]} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#6B7280' }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line yAxisId="left" type="monotone" dataKey="avgScore" name="Avg Score %" stroke={C.primary} strokeWidth={2} dot={{ r: 4, fill: C.primary }} />
              <Line yAxisId="left" type="monotone" dataKey="avgConfidence" name="AI Confidence %" stroke={C.positive} strokeWidth={2} dot={{ r: 4, fill: C.positive }} strokeDasharray="5 3" />
              <Line yAxisId="right" type="monotone" dataKey="count" name="Evaluations" stroke={C.warning} strokeWidth={2} dot={{ r: 4, fill: C.warning }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Subject Performance */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-card xl:col-span-2">
          <h3 className="section-header mb-4">Subject Performance</h3>
          {data.subjectStats.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No subject data available</p>
          ) : (
            <ResponsiveContainer width="100%" height={Math.max(200, data.subjectStats.length * 48)}>
              <BarChart data={data.subjectStats} layout="vertical" barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.muted} horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#6B7280' }} tickFormatter={(v) => `${v}%`} />
                <YAxis type="category" dataKey="subject" tick={{ fontSize: 11, fill: '#6B7280' }} width={100} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="avgScore" name="Avg Score %" fill={C.primary} radius={[0, 6, 6, 0]} />
                <Bar dataKey="avgConfidence" name="AI Confidence %" fill={C.positive} radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* AI Confidence Distribution pie */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-card">
          <h3 className="section-header mb-4">AI Confidence</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={data.confidenceDistribution}
                dataKey="count"
                nameKey="label"
                cx="50%"
                cy="50%"
                outerRadius={80}
                innerRadius={50}
                paddingAngle={3}
                label={({ label, percent }) => percent > 0.05 ? `${Math.round(percent * 100)}%` : ''}
                labelLine={false}
              >
                {data.confidenceDistribution.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(value) => <span style={{ fontSize: 11, color: '#6B7280' }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Students */}
      <div className="bg-card border border-border rounded-2xl shadow-card">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
          <Award size={16} className="text-warning" />
          <h3 className="section-header">Top Performers</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {['Rank', 'Student', 'Roll No', 'Evaluations', 'Avg Score'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-600 text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.topStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-sm text-muted-foreground">No scored evaluations yet</td>
                </tr>
              ) : (
                data.topStudents.map((st, i) => (
                  <tr key={st.rollNo} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                    <td className="px-5 py-3">
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-amber-100 text-amber-700' : i === 1 ? 'bg-slate-100 text-slate-600' : i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-muted text-muted-foreground'}`}>
                        {i + 1}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center">
                          <span className="text-xs font-700 text-primary">
                            {st.name !== '—' ? st.name.split(' ').map((n) => n[0]).join('').slice(0, 2) : '?'}
                          </span>
                        </div>
                        <span className="text-sm font-600 text-foreground">{st.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-muted-foreground font-tabular">{st.rollNo}</td>
                    <td className="px-5 py-3 text-sm font-tabular text-foreground">{st.total}</td>
                    <td className="px-5 py-3">
                      <span className={`text-sm font-700 font-tabular ${st.avgScore >= 75 ? 'text-positive' : st.avgScore >= 50 ? 'text-warning' : 'text-negative'}`}>
                        {st.avgScore}%
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
