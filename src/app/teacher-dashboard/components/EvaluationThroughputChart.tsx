'use client';

import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import GlassCard from '@/components/GlassCard';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0A0F1E] border-none rounded-xl shadow-2xl px-4 py-3 text-white">
      <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={`tip-${p.name}`} className="flex items-center gap-3 text-sm mb-1 last:mb-0">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="opacity-70 text-[11px] font-bold capitalize">
            {p.name === 'evaluations' ? 'Volume' : 'Avg Score'}
          </span>
          <span className="font-black ml-auto">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function EvaluationThroughputChart() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics')
      .then((r) => r.json())
      .then((res) => {
        if (res.monthlyTrend) {
          setData(res.monthlyTrend.map((m: any) => ({
            date: m.month,
            evaluations: m.count,
            score: m.avgScore
          })));
        }
      })
      .catch((err) => console.error('Throughput fetch error:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <GlassCard className="flex flex-col min-h-[350px]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="font-black text-[#0A0F1E] text-lg">Evaluation Trends</h3>
          <p className="text-sm text-[#64748B] font-medium">Historical volume and class progress</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#1A6BFF]" />
            <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">Volume</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#CCFF00]" />
            <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">Score</span>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full h-[220px]">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="gradVol" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1A6BFF" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#1A6BFF" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#CCFF00" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#CCFF00" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#F1F5F9" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: '#94A3B8', fontWeight: 700 }}
                axisLine={false}
                tickLine={false}
                dy={10}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#94A3B8', fontWeight: 700 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#E2E8F5', strokeWidth: 1 }} />
              <Area
                type="monotone"
                dataKey="evaluations"
                stroke="#1A6BFF"
                strokeWidth={3}
                fill="url(#gradVol)"
                animationDuration={2000}
                dot={{ r: 4, fill: '#1A6BFF', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
              <Area
                type="monotone"
                dataKey="score"
                stroke="#A8E600"
                strokeWidth={3}
                fill="url(#gradScore)"
                animationDuration={2500}
                dot={{ r: 4, fill: '#A8E600', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </GlassCard>
  );
}