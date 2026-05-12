'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// BACKEND: GET /api/analytics/evaluation-throughput?days=14&teacherId=
const data: { date: string; ai: number; manual: number }[] = [];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl shadow-dropdown px-4 py-3">
      <p className="text-xs font-600 text-muted-foreground mb-2">{label}</p>
      {payload.map((p) => (
        <div key={`tip-${p.name}`} className="flex items-center gap-2 text-sm">
          <span className={`w-2 h-2 rounded-full ${p.name === 'ai' ? 'bg-primary' : 'bg-accent'}`} />
          <span className="text-muted-foreground capitalize">{p.name === 'ai' ? 'AI Evaluated' : 'Manual Review'}</span>
          <span className="font-700 text-foreground ml-auto pl-4">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function EvaluationThroughputChart() {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-card">
      <div className="flex items-center justify-between mb-1">
        <div>
          <h3 className="section-header">Evaluation Throughput</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Last 14 days — AI vs teacher review</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block" />
            <span className="text-xs text-muted-foreground">AI</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-accent inline-block" />
            <span className="text-xs text-muted-foreground">Manual</span>
          </div>
        </div>
      </div>
      <div className="mt-4">
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gradAI" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradManual" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: 'var(--muted-foreground)', fontFamily: 'var(--font-plus-jakarta-sans)' }}
              axisLine={false}
              tickLine={false}
              interval={2}
            />
            <YAxis
              tick={{ fontSize: 10, fill: 'var(--muted-foreground)', fontFamily: 'var(--font-plus-jakarta-sans)' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="ai"
              stroke="var(--primary)"
              strokeWidth={2}
              fill="url(#gradAI)"
              dot={false}
            />
            <Area
              type="monotone"
              dataKey="manual"
              stroke="var(--accent)"
              strokeWidth={2}
              fill="url(#gradManual)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}