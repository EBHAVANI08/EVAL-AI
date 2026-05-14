'use client';

import React from 'react';
import { BarChart3, TrendingUp, Award, Target } from 'lucide-react';

const metrics = [
  { label: 'Overall Average', value: '—', icon: Award, color: 'text-orange-500', bg: 'bg-orange-50' },
  { label: 'Highest Score', value: '—', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
  { label: 'Papers Graded', value: '0', icon: BarChart3, color: 'text-blue-500', bg: 'bg-blue-50' },
  { label: 'Target Score', value: '—', icon: Target, color: 'text-purple-500', bg: 'bg-purple-50' },
];

export default function PerformancePage() {
  return (
    <div className="px-8 py-6 max-w-screen-xl mx-auto space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="bg-card border border-border rounded-2xl p-5">
              <div className={`w-10 h-10 rounded-xl ${m.bg} flex items-center justify-center mb-3`}>
                <Icon size={20} className={m.color} />
              </div>
              <p className="text-2xl font-bold text-foreground">{m.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{m.label}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-card border border-border rounded-2xl p-10 text-center">
        <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto mb-4">
          <BarChart3 size={28} className="text-orange-400" />
        </div>
        <h3 className="font-bold text-foreground mb-2">Performance Analytics Coming Soon</h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Charts and subject-wise breakdowns will appear here once your papers have been evaluated by your teacher.
        </p>
      </div>
    </div>
  );
}
