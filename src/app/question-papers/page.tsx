import AppLayout from '@/components/AppLayout';
import QuestionPapersClient from './components/QuestionPapersClient';

export default function QuestionPapersPage() {
  return (
    <AppLayout>
      <div className="px-6 lg:px-8 py-6 max-w-screen-2xl mx-auto">
        <QuestionPapersClient />
      </div>
    </AppLayout>
  );
}
