import React from 'react';
import MetricCard from './MetricCard';

// Grid plan: 6 cards → grid-cols-4
// Row 1: hero (spans 2 cols) + 2 regular = 4 cols
// Row 2: 4 regular cards = 4 cols
// Total: 6 cards, no orphans

export default function MetricsBentoGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-4 mb-6">
      {/* Hero card — spans 2 cols */}
      <MetricCard
        id="metric-pending"
        variant="hero-alert"
        label="Pending Evaluations"
        value="0"
        subValue="0 flagged"
        delta={{ value: 'No data yet', direction: 'positive' }}
        description="Answer sheets awaiting review or AI finalization"
        colSpan={2}
        ctaLabel="Review Now"
        ctaHref="/answer-sheet-evaluator"
      />
      {/* Regular cards */}
      <MetricCard
        id="metric-confidence"
        variant="neutral"
        label="Avg AI Confidence"
        value="—"
        delta={{ value: 'No data yet', direction: 'positive' }}
        description="Mean confidence score across all AI-evaluated answers"
      />
      <MetricCard
        id="metric-throughput"
        variant="neutral"
        label="Sheets Evaluated Today"
        value="0"
        delta={{ value: 'No data yet', direction: 'positive' }}
        description="Total answer sheets processed by AI + teacher review"
      />
      <MetricCard
        id="metric-ocr"
        variant="neutral"
        label="OCR Success Rate"
        value="—"
        delta={{ value: 'No data yet', direction: 'positive' }}
        description="Percentage of sheets where OCR extracted text cleanly"
      />
      <MetricCard
        id="metric-override"
        variant="neutral"
        label="Teacher Override Rate"
        value="—"
        delta={{ value: 'No data yet', direction: 'positive' }}
        description="Percentage of AI scores manually changed by teacher"
      />
      <MetricCard
        id="metric-batches"
        variant="neutral"
        label="Active Batches"
        value="0"
        delta={{ value: 'No data yet', direction: 'positive' }}
        description="Ongoing evaluation batches across all subjects"
      />
    </div>
  );
}