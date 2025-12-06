'use client';

import CoachLayout from '@/app/coach/layout';

export default function JucoCoachDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CoachLayout>{children}</CoachLayout>;
}
