import AppLayout from '@/components/AppLayout';
import StudentsClient from './components/StudentsClient';

export default function StudentsPage() {
  return (
    <AppLayout>
      <div className="px-6 lg:px-8 py-6 max-w-screen-2xl mx-auto">
        <StudentsClient />
      </div>
    </AppLayout>
  );
}
