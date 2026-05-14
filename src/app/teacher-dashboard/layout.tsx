import React from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function TeacherDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!session?.user || role !== 'teacher') {
    redirect('/?error=unauthorized');
  }
  return <>{children}</>;
}
