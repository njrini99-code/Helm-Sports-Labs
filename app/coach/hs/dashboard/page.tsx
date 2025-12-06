'use client';

import { Card } from '@/components/ui/card';

export default function HsCoachOverviewPage() {
  return (
    <div className="space-y-4">
      <Card className="bg-slate-900/70 border-white/5 p-4 text-white">
        <h2 className="text-lg font-semibold">Overview</h2>
        <p className="text-sm text-slate-400">Snapshot coming soon (players by grad year, upcoming games, recent messages).</p>
      </Card>
    </div>
  );
}
