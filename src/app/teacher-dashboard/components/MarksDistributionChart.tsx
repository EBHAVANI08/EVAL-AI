'use client';

import React, { useState, useEffect } from 'react';
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

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; payload: { pct: string } }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl shadow-dropdown px-4 py-3">
      <p className="text-xs font-600 text-muted-foreground mb-1">Score Range: {label}</p>
      <p className="text-sm font-700 text-foreground">{payload[0].value} evaluations</p>
    </div>
  );
};

export default function MarksDistributionChart() {
  const [data, setData] = useState<any[]>([]);
  const [avgScore, setAvgScore] = useState<string>('—');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics')
      .then((r) => r.json())
      .then((res) => {
        if (res.scoreDistribution) {
          setData(res.scoreDistribution);
        }
        if (res.avgScore) {
          setAvgScore(`${res.avgScore}%`);
        }
      })
      .catch((err) => console.error('Marks distribution fetch error:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-card">
      <div className="flex items-center justify-between mb-1">
        <div>
          <h3 className="section-header">Marks Distribution</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Score distribution across all evaluations</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Avg: <span className="font-700 text-foreground">{loading ? '...' : avgScore}</span></span>
        </div>
      </div>
      <div className="mt-4">
        {loading ? (
          <div className="h-[220px] flex items-center justify-center">
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : data.length === 0 ? (
          <div className="h-[220px] flex items-center justify-center text-xs text-muted-foreground">
            No evaluation data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barCategoryGap="20%">
              <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
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
                    key={`bar-${entry.label}`}
                    fill={
                      entry.count === Math.max(...data.map((d: any) => d.count))
                        ? 'var(--primary)'
                        : index === 0
                        ? 'var(--negative)'
                        : 'var(--accent)'
                    }
                    fillOpacity={0.85}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
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
          <span className="text-xs text-muted-foreground">Low score</span>
        </div>
      </div>
    </div>
  );
}