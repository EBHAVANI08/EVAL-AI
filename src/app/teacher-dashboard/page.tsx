import React from 'react';
import AppLayout from '@/components/AppLayout';
import DashboardHeader from './components/DashboardHeader';
import MetricsBentoGrid from './components/MetricsBentoGrid';
import ChartsRow from './components/ChartsRow';
import RecentEvaluationsTable from './components/RecentEvaluationsTable';
import ActivityFeed from './components/ActivityFeed';

export default function TeacherDashboardPage() {
  return (
    <AppLayout>
      <div className="px-6 lg:px-8 xl:px-10 2xl:px-12 py-6 max-w-screen-2xl mx-auto">
        <DashboardHeader />
        <MetricsBentoGrid />
        <ChartsRow />
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
          <div className="xl:col-span-2">
            <RecentEvaluationsTable />
          </div>
          <div className="xl:col-span-1">
            <ActivityFeed />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}