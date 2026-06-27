import AppLayout from '@/components/AppLayout';
import QuestionPaperGeneratorClient from './components/QuestionPaperGeneratorClient';

export default function QuestionPaperGeneratorPage() {
  return (
    <AppLayout>
      <div className="flex flex-col h-full overflow-hidden">
        <QuestionPaperGeneratorClient />
      </div>
    </AppLayout>
  );
}
