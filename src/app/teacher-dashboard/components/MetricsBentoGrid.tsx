'use client';

import React, { useState, useEffect } from 'react';
import MetricCard from './MetricCard';

export default function MetricsBentoGrid() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics')
      .then((r) => r.json())
      .then((res) => setData(res))
      .catch((err) => console.error('Metrics fetch error:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <MetricCard index={0} id="metric-pending"    variant="hero-alert" colSpan={2}
        label="Pending Evaluations"
        value={loading ? '...' : String(data?.totalEvaluations - data?.finalizedCount || 0)} 
        subValue={loading ? '' : `${data?.flaggedCount || 0} flagged`}
        delta={{ value: loading ? '...' : `${data?.finalizedCount || 0} finalized`, direction: 'positive' }}
        description="Answer sheets awaiting review or AI finalization"
        ctaLabel="Review Now" ctaHref="/answer-sheet-evaluator"
      />
      <MetricCard index={1} id="metric-confidence" variant="neutral"
        label="Avg AI Confidence" value={loading ? '...' : (data?.avgConfidence ? `${data.avgConfidence}%` : '—')}
        delta={{ value: 'Real-time AI data', direction: 'positive' }}
        description="Mean confidence score across all AI-evaluated answers"
      />
      <MetricCard index={2} id="metric-throughput" variant="neutral"
        label="Total Evaluated" value={loading ? '...' : String(data?.totalEvaluations || 0)}
        delta={{ value: 'Lifetime', direction: 'positive' }}
        description="Total answer sheets processed by AI + teacher review"
      />
      <MetricCard index={4} id="metric-override"   variant="neutral"
        label="Teacher Override Rate" value={loading ? '...' : (data?.overrideRate ? `${data.overrideRate}%` : '—')}
        delta={{ value: 'Human audit', direction: 'positive' }}
        description="Percentage of AI scores manually changed by teacher"
      />
      <MetricCard index={3} id="metric-passrate"        variant="positive"
        label="Avg Class Score" value={loading ? '...' : (data?.avgScore ? `${data.avgScore}%` : '—')}
        delta={{ value: `Pass rate ${data?.passRate || 0}%`, direction: 'positive' }}
        description="Overall performance across all subjects and classes"
      />
      <MetricCard index={5} id="metric-subjects"    variant="neutral"
        label="Subjects Tracked" value={loading ? '...' : String(data?.subjectStats?.length || 0)}
        delta={{ value: 'Active', direction: 'positive' }}
        description="Distinct subjects with evaluation data in the system"
      />
    </div>
  );
}
