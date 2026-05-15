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
import GlassCard from '@/components/GlassCard';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0A0F1E] border-none rounded-xl shadow-2xl px-4 py-3 text-white">
      <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Range: {label}</p>
      <p className="text-sm font-black">{payload[0].value} Student Papers</p>
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
        if (res.scoreDistribution) setData(res.scoreDistribution);
        if (res.avgScore) setAvgScore(`${res.avgScore}%`);
      })
      .catch((err) => console.error('Marks distribution fetch error:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <GlassCard className="flex flex-col min-h-[350px]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="font-black text-[#0A0F1E] text-lg">Marks Distribution</h3>
          <p className="text-sm text-[#64748B] font-medium">Performance density across the class</p>
        </div>
        <div className="px-3 py-1 bg-orange-50 rounded-lg border border-orange-100">
          <span className="text-xs font-black text-orange-600">Avg: {loading ? '...' : avgScore}</span>
        </div>
      </div>

      <div className="flex-1 w-full h-[220px]">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="animate-spin w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 0, right: 0, left: -25, bottom: 0 }} barCategoryGap="25%">
              <CartesianGrid vertical={false} stroke="#F1F5F9" strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
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
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F8FAFF', radius: 12 }} />
              <Bar dataKey="count" radius={[10, 10, 10, 10]} animationDuration={1500}>
                {data.map((entry, index) => (
                  <Cell
                    key={`bar-${index}`}
                    fill={
                      entry.count === Math.max(...data.map((d: any) => d.count))
                        ? '#1A6BFF'
                        : index === 0
                        ? '#EF4444'
                        : '#3B82F6'
                    }
                    fillOpacity={0.8}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="flex items-center gap-6 mt-6 pt-6 border-t border-[#E2E8F5]/50">
        {[
          { label: 'Peak Performance', color: 'bg-[#1A6BFF]' },
          { label: 'Typical Range', color: 'bg-[#3B82F6]' },
          { label: 'Improvement Needed', color: 'bg-[#EF4444]' }
        ].map(item => (
          <div key={item.label} className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
            <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-wider">{item.label}</span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}