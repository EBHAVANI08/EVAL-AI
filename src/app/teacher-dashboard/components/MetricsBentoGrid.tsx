import React from 'react';
import MetricCard from './MetricCard';

export default function MetricsBentoGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <MetricCard index={0} id="metric-pending"    variant="hero-alert" colSpan={2}
        label="Pending Evaluations"
        value="0" subValue="0 flagged"
        delta={{ value: 'No data yet', direction: 'positive' }}
        description="Answer sheets awaiting review or AI finalization"
        ctaLabel="Review Now" ctaHref="/answer-sheet-evaluator"
      />
      <MetricCard index={1} id="metric-confidence" variant="neutral"
        label="Avg AI Confidence" value="—"
        delta={{ value: 'No data yet', direction: 'positive' }}
        description="Mean confidence score across all AI-evaluated answers"
      />
      <MetricCard index={2} id="metric-throughput" variant="neutral"
        label="Sheets Evaluated Today" value="0"
        delta={{ value: 'No data yet', direction: 'positive' }}
        description="Total answer sheets processed by AI + teacher review"
      />
      <MetricCard index={3} id="metric-ocr"        variant="neutral"
        label="OCR Success Rate" value="—"
        delta={{ value: 'No data yet', direction: 'positive' }}
        description="Percentage of sheets where OCR extracted text cleanly"
      />
      <MetricCard index={4} id="metric-override"   variant="neutral"
        label="Teacher Override Rate" value="—"
        delta={{ value: 'No data yet', direction: 'positive' }}
        description="Percentage of AI scores manually changed by teacher"
      />
      <MetricCard index={5} id="metric-batches"    variant="neutral"
        label="Active Batches" value="0"
        delta={{ value: 'No data yet', direction: 'positive' }}
        description="Ongoing evaluation batches across all subjects"
      />
    </div>
  );
}
