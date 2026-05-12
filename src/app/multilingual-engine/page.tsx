import AppLayout from '@/components/AppLayout';
import MultilingualClient from './components/MultilingualClient';

export default function MultilingualEnginePage() {
  return (
    <AppLayout>
      <div className="px-6 lg:px-8 py-6 max-w-screen-2xl mx-auto">
        <MultilingualClient />
      </div>
    </AppLayout>
  );
}
