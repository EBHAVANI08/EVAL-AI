import AppLayout from '@/components/AppLayout';
import AnswerGeneratorClient from './components/AnswerGeneratorClient';

export default function AnswerGeneratorPage() {
  return (
    <AppLayout>
      <div className="px-6 lg:px-8 py-6 max-w-screen-2xl mx-auto">
        <AnswerGeneratorClient />
      </div>
    </AppLayout>
  );
}
