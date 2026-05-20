'use client';

import React, { useState } from 'react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, CartesianGrid, Legend,
} from 'recharts';
import {
  Brain, ChevronDown, ChevronUp, AlertTriangle, CheckCircle2,
  TrendingUp, TrendingDown, Minus, BookOpen, Pen, Lightbulb,
  BarChart2, Activity, Heart, Star, Info,
} from 'lucide-react';
import type { BehaviorAnalysis } from '@/lib/behavior-analysis';

interface Props {
  analysis: BehaviorAnalysis | null;
  isLoading: boolean;
}

// ─── Helper components ───────────────────────────────────────────────────────

function SignalBadge({ level }: { level: string }) {
  const map: Record<string, string> = {
    low: 'bg-slate-100 text-slate-600',
    'low-moderate': 'bg-blue-50 text-blue-600',
    moderate: 'bg-amber-50 text-amber-700',
    'moderate-high': 'bg-emerald-50 text-emerald-700',
    high: 'bg-green-100 text-green-700',
    medium: 'bg-amber-50 text-amber-700',
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${map[level] ?? 'bg-slate-100 text-slate-500'}`}>
      {level}
    </span>
  );
}

function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon size={16} className="text-indigo-500" />
      <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
    </div>
  );
}

function MetricRow({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
      <span className="text-xs text-slate-500">{label}</span>
      <div className="text-right">
        <span className="text-xs font-medium text-slate-700">{value}</span>
        {sub && <span className="text-xs text-slate-400 ml-1">({sub})</span>}
      </div>
    </div>
  );
}

function ZoneBar({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-500 w-16">{label}</span>
      <div className="flex-1 bg-slate-100 rounded-full h-2">
        <div className={`h-2 rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-slate-400 w-7 text-right">{pct}%</span>
    </div>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="animate-pulse space-y-4">
      {[80, 60, 90, 70].map((w, i) => (
        <div key={i} className="h-4 bg-slate-100 rounded" style={{ width: `${w}%` }} />
      ))}
    </div>
  );
}

// ─── Difficulty Table ─────────────────────────────────────────────────────────

function DifficultyTable({ sb }: { sb: BehaviorAnalysis['subjectBehavior'] }) {
  const rows = [
    { label: 'Easy', items: sb.easyTopics, color: 'text-emerald-600 bg-emerald-50', dot: 'bg-emerald-400' },
    { label: 'Medium', items: sb.mediumTopics, color: 'text-amber-600 bg-amber-50', dot: 'bg-amber-400' },
    { label: 'Difficult', items: sb.difficultTopics, color: 'text-red-600 bg-red-50', dot: 'bg-red-400' },
  ];
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-slate-50">
            <th className="text-left px-3 py-2 text-slate-500 font-medium w-20">Level</th>
            <th className="text-left px-3 py-2 text-slate-500 font-medium">Questions</th>
            <th className="text-left px-3 py-2 text-slate-500 font-medium w-12">Count</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ label, items, color, dot }) => (
            <tr key={label} className="border-t border-slate-50">
              <td className="px-3 py-2">
                <span className={`flex items-center gap-1.5 font-medium ${color} rounded px-1.5 py-0.5 w-fit`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                  {label}
                </span>
              </td>
              <td className="px-3 py-2 text-slate-600">
                {items.length > 0 ? items.join(', ') : <span className="text-slate-300 italic">None</span>}
              </td>
              <td className="px-3 py-2 text-center font-semibold text-slate-700">{items.length}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Answer Length Chart ──────────────────────────────────────────────────────

function AnswerLengthChart({ qbs }: { qbs: BehaviorAnalysis['questionBehaviors'] }) {
  const appropriate = qbs.filter((q) => q.answerLengthStatus === 'appropriate').length;
  const over = qbs.filter((q) => q.answerLengthStatus === 'over-explained').length;
  const under = qbs.filter((q) => q.answerLengthStatus === 'under-answered').length;
  const data = [
    { name: 'Appropriate', short: 'OK', value: appropriate, fill: '#10b981' },
    { name: 'Over-explained', short: 'Over', value: over, fill: '#f59e0b' },
    { name: 'Under-answered', short: 'Under', value: under, fill: '#ef4444' },
  ].filter((d) => d.value > 0);
  return (
    <div className="flex items-center gap-4">
      <ResponsiveContainer width={180} height={130}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 16 }}>
          <XAxis dataKey="short" tick={{ fontSize: 10 }} interval={0} />
          <YAxis tick={{ fontSize: 9 }} />
          <Tooltip formatter={(v, _n, props) => [`${v} questions`, props.payload?.name]} />
          <Bar dataKey="value" radius={[3, 3, 0, 0]}>
            {data.map((d, i) => <Cell key={i} fill={d.fill} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="space-y-2 text-xs flex-1">
        {over > 0 && (
          <div className="flex items-start gap-2 text-amber-700 bg-amber-50 rounded p-2">
            <AlertTriangle size={12} className="mt-0.5 shrink-0" />
            <span>{over} question{over > 1 ? 's' : ''} over-explained — may signal difficulty identifying key points</span>
          </div>
        )}
        {under > 0 && (
          <div className="flex items-start gap-2 text-red-700 bg-red-50 rounded p-2">
            <AlertTriangle size={12} className="mt-0.5 shrink-0" />
            <span>{under} question{under > 1 ? 's' : ''} under-answered — may signal incomplete recall or time pressure</span>
          </div>
        )}
        {appropriate > 0 && (
          <div className="flex items-start gap-2 text-emerald-700 bg-emerald-50 rounded p-2">
            <CheckCircle2 size={12} className="mt-0.5 shrink-0" />
            <span>{appropriate} question{appropriate > 1 ? 's' : ''} with appropriate answer length</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Personality Radar ────────────────────────────────────────────────────────

function PersonalityRadar({ traits }: { traits: NonNullable<BehaviorAnalysis['personalityProfile']>['traits'] }) {
  const data = traits.map((t) => ({ subject: t.name, score: t.score }));
  return (
    <ResponsiveContainer width="100%" height={220}>
      <RadarChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
        <PolarGrid stroke="#e2e8f0" />
        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#64748b' }} />
        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} tickCount={3} />
        <Radar name="Signal" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} strokeWidth={2} />
        <Tooltip formatter={(v) => [`${v}/100 signal strength`]} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

// ─── Trend Chart ──────────────────────────────────────────────────────────────

function TrendChart({ trend }: { trend: NonNullable<BehaviorAnalysis['trend']> }) {
  const data = trend.recentScores.map((s, i) => ({ eval: `Eval ${i + 1}`, score: s }));
  const improving = trend.improvementRate > 0;
  return (
    <div>
      <div className="flex items-center gap-4 mb-3 text-xs">
        <div className="flex items-center gap-1">
          {improving ? <TrendingUp size={14} className="text-emerald-500" /> : <TrendingDown size={14} className="text-red-400" />}
          <span className={improving ? 'text-emerald-600 font-medium' : 'text-red-500 font-medium'}>
            {improving ? '+' : ''}{trend.improvementRate}% over {trend.evaluationsAnalyzed} evaluations
          </span>
        </div>
        <div className="flex items-center gap-1 text-slate-500">
          <Activity size={12} />
          <span>Consistency: {trend.consistencyScore}/100</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={120}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="eval" tick={{ fontSize: 9 }} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
          <Tooltip formatter={(v) => [`${v}%`, 'Score']} />
          <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2} dot={{ r: 3, fill: '#6366f1' }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────

export default function BehaviorAnalysisPanel({ analysis, isLoading }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'handwriting' | 'personality' | 'guidance'>('overview');

  const tabs = [
    { id: 'overview' as const,     label: 'Overview',         icon: BarChart2 },
    { id: 'handwriting' as const,  label: 'Handwriting',      icon: Pen },
    { id: 'personality' as const,  label: 'Behavior Signals', icon: Brain },
    { id: 'guidance' as const,     label: 'Guidance',         icon: Lightbulb },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      {/* ── Collapsible Header ── */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="w-full flex items-center justify-between px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
            <Brain size={14} className="text-white" />
          </div>
          <div className="text-left">
            <h2 className="text-sm font-700 text-white tracking-tight">Learning Behavior Intelligence Report</h2>
            <p className="text-xs text-indigo-200">
              {isLoading ? 'Analyzing patterns…' : analysis ? `${analysis.subject} · ${analysis.gradeLevel}` : 'Behavior analysis'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isLoading && <div className="w-3.5 h-3.5 rounded-full border-2 border-white/60 border-t-transparent animate-spin" />}
          {collapsed
            ? <ChevronDown size={15} className="text-white/70" />
            : <ChevronUp size={15} className="text-white/70" />}
        </div>
      </button>

      {!collapsed && (
        <>
          {/* Disclaimer */}
          <div className="flex items-center gap-2 px-6 py-2 bg-amber-50 border-b border-amber-100 text-xs text-amber-700">
            <Info size={11} className="shrink-0" />
            <span>All outputs are observational <strong>signals and indicators</strong>, not clinical diagnoses. Correlational, not causative.</span>
          </div>

          {/* Loading skeleton */}
          {isLoading && !analysis && (
            <div className="p-6"><Skeleton /></div>
          )}

          {/* Empty state */}
          {!isLoading && !analysis && (
            <div className="py-10 text-center text-slate-400 text-sm">
              <Brain size={28} className="mx-auto mb-2 text-slate-200" />
              Analysis not available for this evaluation.
            </div>
          )}

          {analysis && (
            <>
              {/* ── Tab bar ── */}
              <div className="flex border-b border-slate-100 bg-slate-50/60 px-4">
                {tabs.map(({ id, label, icon: Icon }) => (
                  <button key={id} onClick={() => setActiveTab(id)}
                    className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-600 border-b-2 transition-colors ${
                      activeTab === id
                        ? 'border-indigo-500 text-indigo-600 bg-white'
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-white/60'
                    }`}
                  >
                    <Icon size={12} />{label}
                  </button>
                ))}
              </div>

              {/* ── Tab Content ── */}
              <div className="p-5">

                {/* ══ OVERVIEW ══════════════════════════════════════════════ */}
                {activeTab === 'overview' && (
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

                    {/* Left column: stats + difficulty */}
                    <div className="xl:col-span-2 space-y-4">
                      {/* KPI row */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                          { label: 'Avg Score',      value: `${analysis.subjectBehavior.avgScore}%`,                      color: 'from-indigo-500 to-indigo-600' },
                          { label: 'Difficult Qs',   value: String(analysis.subjectBehavior.difficultTopics.length),       color: 'from-red-400 to-red-500' },
                          { label: 'Diagram Usage',  value: `${analysis.subjectBehavior.diagramUsageRate}%`,               color: 'from-blue-400 to-blue-500' },
                          { label: 'Answer Pattern', value: analysis.subjectBehavior.answerLengthPattern,                  color: 'from-emerald-400 to-emerald-500' },
                        ].map(({ label, value, color }) => (
                          <div key={label} className={`bg-gradient-to-br ${color} rounded-xl p-3 text-white`}>
                            <div className="text-[10px] font-600 text-white/80 uppercase tracking-wider mb-1">{label}</div>
                            <div className="text-base font-800 capitalize leading-tight">{value}</div>
                          </div>
                        ))}
                      </div>

                      {/* Difficulty map */}
                      <div className="bg-slate-50 rounded-xl p-4">
                        <SectionHeader icon={BarChart2} title="Subject Difficulty Map" />
                        <DifficultyTable sb={analysis.subjectBehavior} />
                      </div>

                      {/* Answer length */}
                      <div className="bg-slate-50 rounded-xl p-4">
                        <SectionHeader icon={Pen} title="Answer Length Intelligence" />
                        <AnswerLengthChart qbs={analysis.questionBehaviors} />
                      </div>
                    </div>

                    {/* Right column: insights + signals */}
                    <div className="space-y-4">
                      {/* Learning insights */}
                      {analysis.learningBehaviorInsights && (
                        <div className="bg-indigo-50 rounded-xl p-4 space-y-2">
                          <SectionHeader icon={Brain} title="Learning Insights" />
                          <p className="text-xs text-indigo-800 leading-relaxed">{analysis.learningBehaviorInsights.subjectSpecific}</p>
                          <p className="text-xs text-purple-700 leading-relaxed border-t border-indigo-100 pt-2">{analysis.learningBehaviorInsights.answerPatterns}</p>
                          {analysis.learningBehaviorInsights.examStrategy && (
                            <p className="text-xs text-slate-600 leading-relaxed border-t border-indigo-100 pt-2">{analysis.learningBehaviorInsights.examStrategy}</p>
                          )}
                        </div>
                      )}

                      {/* Emotional signals */}
                      {analysis.emotionalSignals && (
                        <div className="bg-slate-50 rounded-xl p-4">
                          <SectionHeader icon={Heart} title="Emotional State Signals" />
                          <div className="space-y-2.5">
                            {[
                              { label: 'Stress',      level: analysis.emotionalSignals.stressIndicators.level,      signals: analysis.emotionalSignals.stressIndicators.signals },
                              { label: 'Confidence',  level: analysis.emotionalSignals.confidenceIndicators.level,  signals: analysis.emotionalSignals.confidenceIndicators.signals },
                              { label: 'Hesitation',  level: analysis.emotionalSignals.hesitationIndicators.level,  signals: analysis.emotionalSignals.hesitationIndicators.signals },
                            ].map(({ label, level, signals }) => (
                              <div key={label}>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs font-600 text-slate-600">{label}</span>
                                  <SignalBadge level={level} />
                                </div>
                                {signals[0] && <p className="text-xs text-slate-500 leading-relaxed">{signals[0]}</p>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Trend */}
                      {analysis.trend && (
                        <div className="bg-slate-50 rounded-xl p-4">
                          <SectionHeader icon={TrendingUp} title="Progress Trend" />
                          <TrendChart trend={analysis.trend} />
                        </div>
                      )}

                      {/* Risk flags */}
                      {analysis.overallInsights.riskFlags.length > 0 && (
                        <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle size={13} className="text-red-500" />
                            <span className="text-xs font-700 text-red-700">Attention Areas</span>
                          </div>
                          <ul className="space-y-1.5">
                            {analysis.overallInsights.riskFlags.map((f, i) => (
                              <li key={i} className="text-xs text-red-600 flex items-start gap-1.5">
                                <span className="text-red-300 mt-0.5 shrink-0">▸</span>{f}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ══ HANDWRITING ═══════════════════════════════════════════ */}
                {activeTab === 'handwriting' && (
                  <div>
                    {!analysis.handwritingFeatures ? (
                      <div className="py-12 text-center text-slate-400 text-sm">
                        <Pen size={32} className="mx-auto mb-2 text-slate-200" />
                        Handwriting features require scanned answer sheet images.
                      </div>
                    ) : (() => {
                      const hf = analysis.handwritingFeatures!;
                      return (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-slate-50 rounded-xl p-4">
                            <SectionHeader icon={Pen} title="Stroke Characteristics" />
                            <div className="space-y-0.5">
                              <MetricRow label="Baseline" value={hf.baselineAngle.label} sub={hf.baselineAngle.direction} />
                              <MetricRow label="Slant" value={hf.slant.label} />
                              <MetricRow label="Pressure" value={hf.pressure.label} sub={`${hf.pressure.intensity}/100`} />
                              <MetricRow label="Letter Size" value={hf.letterSize.label} sub={`var: ${hf.letterSize.variance}`} />
                              <MetricRow label="Stroke Rhythm" value={hf.strokeRhythm.label} sub={hf.strokeRhythm.flowPattern} />
                            </div>
                          </div>
                          <div className="bg-slate-50 rounded-xl p-4">
                            <SectionHeader icon={BarChart2} title="Spacing & Layout" />
                            <div className="space-y-0.5">
                              <MetricRow label="Word Spacing" value={hf.wordSpacing.label} />
                              <MetricRow label="Line Spacing" value={hf.lineSpacing.label} sub={hf.lineSpacing.consistency} />
                              <MetricRow label="Margins" value={hf.margins.label} />
                              <MetricRow label="Corrections" value={hf.corrections.label} sub={hf.corrections.pattern} />
                            </div>
                          </div>
                          <div className="bg-slate-50 rounded-xl p-4">
                            <SectionHeader icon={Activity} title="Writing Zones" />
                            <p className="text-xs text-slate-500 mb-3">Dominant: <span className="font-600 text-slate-700 capitalize">{hf.writingZones.dominant}</span></p>
                            <div className="space-y-2">
                              <ZoneBar label="Upper" pct={hf.writingZones.upperPercent} color="bg-purple-400" />
                              <ZoneBar label="Middle" pct={hf.writingZones.middlePercent} color="bg-indigo-400" />
                              <ZoneBar label="Lower" pct={hf.writingZones.lowerPercent} color="bg-blue-400" />
                            </div>
                            <div className="mt-3 space-y-1 text-[10px] text-slate-400">
                              <p>Upper zone → imagination, aspirations</p>
                              <p>Middle zone → everyday focus, practicality</p>
                              <p>Lower zone → energy, physical drive</p>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* ══ BEHAVIOR SIGNALS ══════════════════════════════════════ */}
                {activeTab === 'personality' && (
                  <div>
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 rounded-lg text-xs text-amber-700 mb-4">
                      <Info size={11} className="shrink-0" />
                      These are <strong>observational signals</strong> from handwriting — not validated personality tests.
                    </div>
                    {!analysis.personalityProfile ? (
                      <div className="py-12 text-center text-slate-400 text-sm">Personality signals require scanned image analysis.</div>
                    ) : (() => {
                      const pp = analysis.personalityProfile!;
                      return (
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                          <div>
                            <SectionHeader icon={Brain} title="Signal Strength Radar" />
                            <PersonalityRadar traits={pp.traits} />
                          </div>
                          <div className="space-y-3">
                            <SectionHeader icon={Activity} title="Trait Signals" />
                            {pp.traits.map((t) => (
                              <div key={t.name} className="flex items-center gap-3">
                                <span className="text-xs text-slate-600 w-28 shrink-0">{t.name}</span>
                                <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                                  <div className="h-1.5 rounded-full bg-indigo-400" style={{ width: `${t.score}%` }} />
                                </div>
                                <SignalBadge level={t.signal} />
                              </div>
                            ))}
                            <div className="grid grid-cols-2 gap-2 mt-4">
                              {[
                                { label: 'Communication', value: pp.communicationStyle },
                                { label: 'Thinking',      value: pp.thinkingStyle },
                                { label: 'Work Style',    value: pp.workStyle },
                                { label: 'Social',        value: pp.socialStyle },
                              ].map(({ label, value }) => (
                                <div key={label} className="bg-indigo-50 rounded-lg p-2.5 text-center">
                                  <div className="text-[10px] text-indigo-400 font-600 uppercase tracking-wider mb-0.5">{label}</div>
                                  <div className="text-xs font-700 text-indigo-700 capitalize">{value.replace(/-/g, ' ')}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* ══ GUIDANCE ══════════════════════════════════════════════ */}
                {activeTab === 'guidance' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {/* Strengths */}
                    {analysis.overallInsights.strengths.length > 0 && (
                      <div className="bg-emerald-50 rounded-xl p-4">
                        <SectionHeader icon={CheckCircle2} title="Strengths Observed" />
                        <ul className="space-y-2">
                          {analysis.overallInsights.strengths.map((s, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-emerald-700">
                              <CheckCircle2 size={11} className="mt-0.5 shrink-0" />{s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Growth Areas */}
                    {analysis.overallInsights.growthAreas.length > 0 && (
                      <div className="bg-amber-50 rounded-xl p-4">
                        <SectionHeader icon={TrendingUp} title="Growth Areas" />
                        <ul className="space-y-2">
                          {analysis.overallInsights.growthAreas.map((g, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-amber-700">
                              <Minus size={11} className="mt-0.5 shrink-0" />{g}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Recommendations */}
                    <div className="bg-blue-50 rounded-xl p-4">
                      <SectionHeader icon={Lightbulb} title="Recommendations" />
                      <ul className="space-y-2">
                        {analysis.overallInsights.recommendations.map((r, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-blue-700">
                            <Lightbulb size={11} className="mt-0.5 shrink-0 text-blue-400" />{r}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Study style */}
                    {analysis.learningBehaviorInsights?.studyStyleIndicators && (
                      <div className="bg-purple-50 rounded-xl p-4">
                        <SectionHeader icon={BookOpen} title="Study Style Indicators" />
                        <ul className="space-y-2">
                          {analysis.learningBehaviorInsights.studyStyleIndicators.map((s, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-purple-700">
                              <Brain size={11} className="mt-0.5 shrink-0" />{s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Grade observations */}
                    {analysis.learningBehaviorInsights?.gradeAppropriateObservations && (
                      <div className="bg-slate-50 rounded-xl p-4">
                        <SectionHeader icon={Star} title={`Grade Observations · ${analysis.gradeLevel}`} />
                        <ul className="space-y-2">
                          {analysis.learningBehaviorInsights.gradeAppropriateObservations.map((o, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                              <Star size={11} className="mt-0.5 shrink-0 text-slate-400" />{o}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
