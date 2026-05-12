import React from 'react';
import AppLayout from '@/components/AppLayout';
import QuestionPaperAnalyzerClient from './components/QuestionPaperAnalyzerClient';

export default function QuestionPaperAnalyzerPage() {
  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        <QuestionPaperAnalyzerClient />
      </div>
    </AppLayout>
  );
}
