import React from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import StudentSidebar from '@/components/StudentSidebar';
import StudentHeader from '@/components/StudentHeader';

export default async function StudentDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!session?.user || role !== 'student') {
    redirect('/?error=unauthorized');
  }
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <StudentSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <StudentHeader />
        <main className="flex-1 overflow-y-auto bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
