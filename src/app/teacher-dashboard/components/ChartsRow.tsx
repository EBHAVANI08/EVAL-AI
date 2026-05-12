'use client';

import dynamic from 'next/dynamic';

const MarksDistributionChart = dynamic(
  () => import('./MarksDistributionChart'),
  { ssr: false, loading: () => <div className="skeleton-pulse h-[280px] rounded-2xl" /> }
);

const EvaluationThroughputChart = dynamic(
  () => import('./EvaluationThroughputChart'),
  { ssr: false, loading: () => <div className="skeleton-pulse h-[280px] rounded-2xl" /> }
);

export default function ChartsRow() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <MarksDistributionChart />
      <EvaluationThroughputChart />
    </div>
  );
}