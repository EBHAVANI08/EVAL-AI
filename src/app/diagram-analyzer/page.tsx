import AppLayout from '@/components/AppLayout';
import DiagramAnalyzerClient from './components/DiagramAnalyzerClient';

export default function DiagramAnalyzerPage() {
  return (
    <AppLayout>
      <div className="px-6 lg:px-8 py-6 max-w-screen-2xl mx-auto">
        <DiagramAnalyzerClient />
      </div>
    </AppLayout>
  );
}
