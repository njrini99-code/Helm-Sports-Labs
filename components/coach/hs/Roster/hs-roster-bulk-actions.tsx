'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { HsRosterPlayer } from '@/lib/api/hs/getHighSchoolRoster';

export function HsRosterBulkActions({
  selected,
  onClear,
  onMessageSelected,
}: {
  selected: HsRosterPlayer[];
  onClear: () => void;
  onMessageSelected: () => void;
}) {
  return (
    <Card className="bg-emerald-500/10 border border-emerald-500/30 text-white p-3 flex flex-wrap items-center gap-2">
      <p className="text-sm">Selected {selected.length} player(s)</p>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" className="border-white/20 text-white" onClick={onMessageSelected}>
          Message Selected
        </Button>
        <Button size="sm" variant="outline" className="border-white/20 text-white">
          Assign to Team
        </Button>
        <Button size="sm" variant="outline" className="border-white/20 text-white">
          Mark Top Prospect
        </Button>
        <Button size="sm" variant="ghost" className="text-slate-200" onClick={onClear}>
          Clear
        </Button>
      </div>
    </Card>
  );
}
