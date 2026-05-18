'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, TrendingUp, Award, Brain, CheckCircle2, Users } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import GlassCard from '@/components/GlassCard';

const COLORS = ['#1A6BFF', '#06B6D4', '#10B981', '#7C3AED', '#F59E0B', '#EF4444'];

export default function AnalyticsSection() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics').then(r => r.json()).then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="py-32 text-center"><Loader2 size={32} className="animate-spin text-[#94A3B8] mx-auto mb-3" /><p className="text-sm font-bold text-[#94A3B8]">Loading analytics…</p></div>;
  if (!data) return null;

  const kpis = [
    { label: 'Total Evaluations', value: data.totalEvaluations, icon: CheckCircle2, color: '#1A6BFF', bg: 'bg-blue-50', suffix: '' },
    { label: 'Avg Score', value: data.avgScore, icon: TrendingUp, color: '#059669', bg: 'bg-green-50', suffix: '%' },
    { label: 'Pass Rate', value: data.passRate, icon: Award, color: '#F59E0B', bg: 'bg-amber-50', suffix: '%' },
    { label: 'Avg AI Confidence', value: data.avgConfidence, icon: Brain, color: '#7C3AED', bg: 'bg-purple-50', suffix: '%' },
    { label: 'Override Rate', value: data.overrideRate, icon: Users, color: '#06B6D4', bg: 'bg-cyan-50', suffix: '%' },
    { label: 'Finalized', value: data.finalizedCount, icon: CheckCircle2, color: '#10B981', bg: 'bg-emerald-50', suffix: '' },
  ];

  return (
    <motion.div key="analytics" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
      <div>
        <h2 className="text-3xl font-black text-[#0A0F1E] tracking-tighter">Analytics</h2>
        <p className="text-[#64748B] font-bold mt-1">Platform-wide performance insights</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-5">
        {kpis.map((k, i) => {
          const Icon = k.icon;
          return (
            <motion.div key={k.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <GlassCard className="flex flex-col items-center text-center py-6">
                <div className={`w-12 h-12 rounded-2xl ${k.bg} flex items-center justify-center mb-4 shadow-inner`}>
                  <Icon size={20} style={{ color: k.color }} />
                </div>
                <p className="text-3xl font-black text-[#0A0F1E] tracking-tighter">{k.value}{k.suffix}</p>
                <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.15em] mt-1.5 leading-tight">{k.label}</p>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <GlassCard className="xl:col-span-2">
          <h3 className="font-black text-[#0A0F1E] text-lg mb-2">Monthly Evaluation Trend</h3>
          <p className="text-sm text-[#64748B] font-bold mb-6">Volume and average score per month</p>
          <div className="h-[280px]">
            {data.monthlyTrend?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8', fontWeight: 700 }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#94A3B8', fontWeight: 700 }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#94A3B8', fontWeight: 700 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: '#0A0F1E', border: 'none', borderRadius: '16px', color: '#fff', padding: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 700 }} />
                  <Line yAxisId="left" type="monotone" dataKey="count" stroke="#1A6BFF" strokeWidth={3} dot={{ r: 5, fill: '#1A6BFF' }} name="Evaluations" />
                  <Line yAxisId="right" type="monotone" dataKey="avgScore" stroke="#059669" strokeWidth={3} dot={{ r: 5, fill: '#059669' }} name="Avg Score %" strokeDasharray="6 3" />
                </LineChart>
              </ResponsiveContainer>
            ) : <div className="flex items-center justify-center h-full text-sm font-bold text-[#94A3B8]">No data yet</div>}
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="font-black text-[#0A0F1E] text-lg mb-2">Score Distribution</h3>
          <p className="text-sm text-[#64748B] font-bold mb-6">How students are scoring</p>
          <div className="h-[280px]">
            {data.scoreDistribution?.some((d: any) => d.count > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.scoreDistribution} barSize={20} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 700 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="label" tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 700 }} axisLine={false} tickLine={false} width={55} />
                  <Tooltip contentStyle={{ backgroundColor: '#0A0F1E', border: 'none', borderRadius: '16px', color: '#fff', padding: '12px' }} />
                  <Bar dataKey="count" fill="#1A6BFF" radius={[0, 8, 8, 0]} name="Students">
                    {data.scoreDistribution.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="flex items-center justify-center h-full text-sm font-bold text-[#94A3B8]">No data yet</div>}
          </div>
        </GlassCard>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <GlassCard>
          <h3 className="font-black text-[#0A0F1E] text-lg mb-6">Subject Performance</h3>
          <div className="h-[260px]">
            {data.subjectStats?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.subjectStats} barSize={20}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="subject" tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 700 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 700 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: '#0A0F1E', border: 'none', borderRadius: '16px', color: '#fff', padding: '12px' }} />
                  <Bar dataKey="avgScore" radius={[8, 8, 8, 8]} name="Avg Score %">
                    {data.subjectStats.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="flex items-center justify-center h-full text-sm font-bold text-[#94A3B8]">No data yet</div>}
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="font-black text-[#0A0F1E] text-lg mb-6">Top Students</h3>
          <div className="space-y-4">
            {data.topStudents?.length > 0 ? data.topStudents.map((s: any, i: number) => (
              <div key={i} className="flex items-center gap-4">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm text-white ${i === 0 ? 'bg-amber-500' : i === 1 ? 'bg-slate-400' : i === 2 ? 'bg-orange-400' : 'bg-[#E2E8F5]'}`}
                  style={{ color: i >= 3 ? '#64748B' : undefined }}>
                  {i < 3 ? ['🥇','🥈','🥉'][i] : i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-black text-[#0A0F1E] truncate">{s.name}</p>
                    <span className="text-sm font-black text-[#1A6BFF] ml-3">{s.avgScore}%</span>
                  </div>
                  <div className="h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#1A6BFF] to-[#06B6D4]" style={{ width: `${s.avgScore}%` }} />
                  </div>
                  <p className="text-[10px] font-bold text-[#94A3B8] mt-0.5">{s.total} exam{s.total !== 1 ? 's' : ''}</p>
                </div>
              </div>
            )) : <div className="py-10 text-center text-sm font-bold text-[#94A3B8]">No student data yet</div>}
          </div>
        </GlassCard>
      </div>

      {/* AI Confidence pie */}
      <GlassCard>
        <h3 className="font-black text-[#0A0F1E] text-lg mb-6">AI Confidence Distribution</h3>
        <div className="flex flex-col md:flex-row items-center gap-10">
          <div className="w-[220px] h-[220px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.confidenceDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="count" paddingAngle={4} strokeWidth={4} stroke="#fff">
                  {data.confidenceDistribution.map((_: any, i: number) => <Cell key={i} fill={['#EF4444','#F59E0B','#10B981'][i]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0A0F1E', border: 'none', borderRadius: '16px', color: '#fff', padding: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-4 flex-1">
            {data.confidenceDistribution.map((d: any, i: number) => {
              const colors = [{ bg: 'bg-red-50', text: 'text-red-600', bar: 'bg-red-500' }, { bg: 'bg-amber-50', text: 'text-amber-600', bar: 'bg-amber-500' }, { bg: 'bg-green-50', text: 'text-green-600', bar: 'bg-green-500' }];
              const c = colors[i];
              const total = data.confidenceDistribution.reduce((a: number, x: any) => a + x.count, 0);
              const pct = total > 0 ? Math.round((d.count / total) * 100) : 0;
              return (
                <div key={i} className="flex items-center gap-4">
                  <div className={`px-3 py-1.5 rounded-xl ${c.bg} min-w-[130px]`}>
                    <p className={`text-xs font-black ${c.text}`}>{d.label}</p>
                  </div>
                  <div className="flex-1 h-3 bg-[#F1F5F9] rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} whileInView={{ width: `${pct}%` }} className={`h-full rounded-full ${c.bar}`} />
                  </div>
                  <span className="text-sm font-black text-[#0A0F1E] w-12 text-right">{d.count}</span>
                  <span className="text-xs font-bold text-[#94A3B8] w-8">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
