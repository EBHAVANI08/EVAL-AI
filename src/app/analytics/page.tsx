import AppLayout from '@/components/AppLayout';
import AnalyticsClient from './components/AnalyticsClient';

export default function AnalyticsPage() {
  return (
    <AppLayout>
      <div className="px-6 lg:px-8 py-6 max-w-screen-2xl mx-auto">
        <AnalyticsClient />
      </div>
    </AppLayout>
  );
}
