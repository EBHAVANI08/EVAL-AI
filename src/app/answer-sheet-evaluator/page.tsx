import React, { Suspense } from 'react';
import AppLayout from '@/components/AppLayout';
import EvaluatorHeader from './components/EvaluatorHeader';
import EvaluatorWorkspace from './components/EvaluatorWorkspace';

export default function AnswerSheetEvaluatorPage() {
  return (
    <AppLayout>
      <div className="flex flex-col h-full relative">
        <EvaluatorHeader />
        <Suspense fallback={<div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">Loading…</div>}>
          <EvaluatorWorkspace />
        </Suspense>
      </div>
    </AppLayout>
  );
}