'use client';

import CoachLayout from '@/app/coach/layout';

export default function CollegeCoachDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CoachLayout>{children}</CoachLayout>;
}
