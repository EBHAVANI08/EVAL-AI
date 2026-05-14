import React from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!session?.user || role !== 'admin') {
    redirect('/?error=unauthorized');
  }
  return <>{children}</>;
}
