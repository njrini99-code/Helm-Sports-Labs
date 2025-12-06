'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useCurrentCoach } from '@/lib/hooks/useCurrentCoach';
import { useCurrentHighSchoolOrg } from '@/lib/hooks/useCurrentHighSchoolOrg';
import { useHighSchoolTeams } from '@/lib/hooks/useHighSchoolTeams';
import { HsScheduleFilters } from '@/components/coach/hs/Schedule/hs-schedule-filters';
import { HsScheduleList } from '@/components/coach/hs/Schedule/hs-schedule-list';
import { getHighSchoolSchedule, type HsScheduleEvent } from '@/lib/api/hs/getHighSchoolSchedule';

export default function HsCoachSchedulePage() {
  const { coachProfile } = useCurrentCoach();
  const { org, isLoading: loadingOrg } = useCurrentHighSchoolOrg(coachProfile?.id);
  const { teams } = useHighSchoolTeams(org?.id);
  const [events, setEvents] = useState<HsScheduleEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<{ teamId?: string; view: 'list' | 'month' | 'week'; type?: string }>({
    view: 'list',
  });

  useEffect(() => {
    if (!org?.id) return;
    setLoading(true);
    getHighSchoolSchedule(org.id, { teamId: filters.teamId }).then(setEvents).finally(() => setLoading(false));
  }, [org?.id, filters.teamId]);

  if (loadingOrg) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
      </div>
    );
  }

  if (!org) {
    return (
      <Card className="bg-slate-900/70 border-white/5 p-4 text-white">
        <p className="text-sm text-slate-300">No high school organization linked yet.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <HsScheduleFilters teams={teams} value={filters} onChange={setFilters} />
      <HsScheduleList events={events} loading={loading} />
    </div>
  );
}
