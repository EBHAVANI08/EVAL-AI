'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

// BACKEND: GET /api/analytics/marks-distribution?batchId=&subjectId=
const data = [
  { range: '0–10', count: 0, pct: '0%' },
  { range: '11–20', count: 0, pct: '0%' },
  { range: '21–30', count: 0, pct: '0%' },
  { range: '31–40', count: 0, pct: '0%' },
  { range: '41–50', count: 0, pct: '0%' },
  { range: '51–60', count: 0, pct: '0%' },
  { range: '61–70', count: 0, pct: '0%' },
  { range: '71–80', count: 0, pct: '0%' },
  { range: '81–90', count: 0, pct: '0%' },
  { range: '91–100', count: 0, pct: '0%' },
];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; payload: { pct: string } }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl shadow-dropdown px-4 py-3">
      <p className="text-xs font-600 text-muted-foreground mb-1">Score Range: {label}</p>
      <p className="text-sm font-700 text-foreground">{payload[0].value} students</p>
      <p className="text-xs text-muted-foreground">{payload[0].payload.pct} of class</p>
    </div>
  );
};

export default function MarksDistributionChart() {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-card">
      <div className="flex items-center justify-between mb-1">
        <div>
          <h3 className="section-header">Marks Distribution</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Score distribution across all evaluations</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Avg: <span className="font-700 text-foreground">—</span></span>
        </div>
      </div>
      <div className="mt-4">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barCategoryGap="20%">
            <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis
              dataKey="range"
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)', fontFamily: 'var(--font-plus-jakarta-sans)' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)', fontFamily: 'var(--font-plus-jakarta-sans)' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--muted)', radius: 4 }} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`bar-${entry.range}`}
                  fill={
                    entry.count === Math.max(...data.map((d) => d.count))
                      ? 'var(--primary)'
                      : index < 3
                      ? 'var(--negative)'
                      : 'var(--accent)'
                  }
                  fillOpacity={0.85}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center gap-4 mt-2">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-primary inline-block" />
          <span className="text-xs text-muted-foreground">Peak bucket</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-accent inline-block" />
          <span className="text-xs text-muted-foreground">Normal range</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-negative inline-block" />
          <span className="text-xs text-muted-foreground">Below 30</span>
        </div>
      </div>
    </div>
  );
}