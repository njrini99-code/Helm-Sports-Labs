'use client';

import PlayerLayout from '@/app/player/layout';

export default function PlayerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PlayerLayout>{children}</PlayerLayout>;
}
