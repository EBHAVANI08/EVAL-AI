import AppLayout from '@/components/AppLayout';
import SettingsClient from './components/SettingsClient';

export default function SettingsPage() {
  return (
    <AppLayout>
      <div className="px-6 lg:px-8 py-6 max-w-screen-2xl mx-auto">
        <SettingsClient />
      </div>
    </AppLayout>
  );
}
