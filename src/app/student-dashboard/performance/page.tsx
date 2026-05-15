'use client';

import React from 'react';
import { BarChart3, TrendingUp, Award, Target, Brain, Calendar, Info } from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';

const data = [
  { name: 'Unit 1', score: 78, average: 70 },
  { name: 'Unit 2', score: 85, average: 72 },
  { name: 'Mid Term', score: 82, average: 75 },
  { name: 'Unit 3', score: 92, average: 74 },
  { name: 'Unit 4', score: 88, average: 76 },
  { name: 'Final', score: 95, average: 78 },
];

const metrics = [
  { label: 'Overall Average', value: '88%', icon: Award, color: 'text-orange-500', bg: 'bg-orange-50' },
  { label: 'Highest Score', value: '95%', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
  { label: 'Papers Graded', value: '12', icon: BarChart3, color: 'text-blue-500', bg: 'bg-blue-50' },
  { label: 'Target Score', value: '98%', icon: Target, color: 'text-purple-500', bg: 'bg-purple-50' },
];

export default function PerformancePage() {
  return (
    <div className="px-8 py-10 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-[#0A0F1E] tracking-tight">Performance Analytics</h2>
          <p className="text-sm text-[#64748B] font-medium mt-1 flex items-center gap-2">
            <Brain size={14} className="text-orange-500" />
            AI-powered insights for Mathematics (Grade XII - A)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white border border-[#E2E8F5] rounded-xl shadow-sm flex items-center gap-2">
            <Calendar size={14} className="text-[#94A3B8]" />
            <span className="text-xs font-black text-[#0A0F1E]">Academic Year 2024-25</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((m, i) => (
          <GlassCard key={m.label} delay={i * 0.1} className="flex flex-col">
            <div className={`w-12 h-12 rounded-2xl ${m.bg} flex items-center justify-center mb-4 shadow-inner`}>
              <m.icon size={24} className={m.color} />
            </div>
            <p className="text-3xl font-black text-[#0A0F1E] tracking-tight">{m.value}</p>
            <p className="text-xs font-bold text-[#94A3B8] uppercase tracking-widest mt-1">{m.label}</p>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <GlassCard delay={0.4} className="lg:col-span-2 min-h-[450px] flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-black text-[#0A0F1E] text-lg">Score Progression</h3>
              <p className="text-sm text-[#64748B] font-medium">Your Mathematics score vs Class Average</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500" />
                <span className="text-xs font-bold text-[#64748B]">Your Score</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-400" />
                <span className="text-xs font-bold text-[#64748B]">Average</span>
              </div>
            </div>
          </div>
          
          <div className="flex-1 w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F97316" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#F97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 600 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0A0F1E', 
                    border: 'none', 
                    borderRadius: '16px', 
                    color: '#fff',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                  }}
                  itemStyle={{ fontWeight: 800, fontSize: 12 }}
                  cursor={{ stroke: '#F97316', strokeWidth: 2, strokeDasharray: '4 4' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#F97316" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorScore)" 
                  animationDuration={2000}
                />
                <Line 
                  type="monotone" 
                  dataKey="average" 
                  stroke="#60A5FA" 
                  strokeWidth={2} 
                  strokeDasharray="5 5" 
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard delay={0.5} className="flex flex-col">
          <h3 className="font-black text-[#0A0F1E] text-lg mb-6">Learning Insights</h3>
          <div className="space-y-6 flex-1">
            <div className="p-5 rounded-2xl bg-green-50 border border-green-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center text-white">
                  <TrendingUp size={16} />
                </div>
                <p className="text-sm font-black text-green-800 uppercase tracking-wider">Strongest Area</p>
              </div>
              <p className="text-base font-bold text-green-900">Calculus & Geometry</p>
              <p className="text-xs text-green-700 mt-1">You are performing 15% above the class average in these topics.</p>
            </div>

            <div className="p-5 rounded-2xl bg-orange-50 border border-orange-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white">
                  <Target size={16} />
                </div>
                <p className="text-sm font-black text-orange-800 uppercase tracking-wider">Improvement Area</p>
              </div>
              <p className="text-base font-bold text-orange-900">Probability & Stats</p>
              <p className="text-xs text-orange-700 mt-1">Focus on problem-solving drills for these sections before the final exam.</p>
            </div>

            <div className="mt-4 p-5 rounded-2xl bg-[#F8FAFF] border border-[#E2E8F5]">
              <div className="flex items-center gap-2 mb-2">
                <Info size={14} className="text-blue-500" />
                <p className="text-xs font-bold text-[#64748B]">Study Tip</p>
              </div>
              <p className="text-xs font-medium text-[#64748B] leading-relaxed">
                Based on your recent Unit 4 performance, you should dedicate 20% more time to revision of complex integration formulas.
              </p>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
