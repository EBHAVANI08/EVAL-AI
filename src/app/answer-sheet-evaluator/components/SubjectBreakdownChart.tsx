'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { QuestionEvaluation } from './EvaluatorWorkspace';

interface SubjectBreakdownChartProps {
  questions: QuestionEvaluation[];
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg shadow-dropdown px-3 py-2">
      <p className="text-xs font-600 text-muted-foreground">Q.{label}</p>
      <p className="text-sm font-700 text-foreground">{payload[0].value}% confidence</p>
    </div>
  );
};

export default function SubjectBreakdownChart({ questions }: SubjectBreakdownChartProps) {
  const data = questions.map((q) => ({
    qNo: q.qNo,
    confidence: q.aiConfidence,
  }));

  return (
    <ResponsiveContainer width="100%" height={140}>
      <BarChart data={data} margin={{ top: 4, right: 0, left: -30, bottom: 0 }} barCategoryGap="15%">
        <XAxis
          dataKey="qNo"
          tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--muted)', radius: 2 }} />
        <Bar dataKey="confidence" radius={[3, 3, 0, 0]}>
          {data.map((entry) => (
            <Cell
              key={`conf-bar-${entry.qNo}`}
              fill={
                entry.confidence >= 85
                  ? 'var(--positive)'
                  : entry.confidence >= 70
                  ? 'var(--warning)'
                  : 'var(--negative)'
              }
              fillOpacity={0.8}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}