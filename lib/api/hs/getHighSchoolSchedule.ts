import { createClient } from '@/lib/supabase/client';
import { HsEvent } from '@/types/event';

export type HsScheduleEvent = {
  eventId: string;
  orgId: string;
  type: 'game' | 'practice' | 'scrimmage' | 'meeting' | 'showcase' | 'tournament' | 'camp' | 'combine' | 'tryout' | 'other';
  name: string;
  location?: string | null;
  startTime: string;
  endTime: string | null;
  teams: { teamId: string; name: string; level?: string | null }[];
  opponentName?: string | null;
  isHomeGame?: boolean | null;
};

export async function getHighSchoolSchedule(
  orgId: string,
  filters: { from?: string; to?: string; teamId?: string; type?: string }
): Promise<HsScheduleEvent[]> {
  const supabase = createClient();

  // Fetch events for the org
  let eventsQuery = supabase
    .from('events')
    .select('*')
    .eq('org_id', orgId);

  if (filters.from) eventsQuery = eventsQuery.gte('start_time', filters.from);
  if (filters.to) eventsQuery = eventsQuery.lte('start_time', filters.to);
  if (filters.type) eventsQuery = eventsQuery.eq('type', filters.type);

  const { data: events, error: eventsError } = await eventsQuery;
  if (eventsError) {
    console.error('getHighSchoolSchedule events error', eventsError);
    return [];
  }
  const eventIds = (events || []).map((e) => e.id);
  if (eventIds.length === 0) return [];

  // Fetch participants
  let participantsQuery = supabase
    .from('event_team_participants')
    .select(
      `
      id,
      event_id,
      team_id,
      teams:team_id ( id, name, level )
    `
    )
    .in('event_id', eventIds);

  if (filters.teamId) participantsQuery = participantsQuery.eq('team_id', filters.teamId);

  const { data: participants, error: participantsError } = await participantsQuery;
  if (participantsError) {
    console.error('getHighSchoolSchedule participants error', participantsError);
    return [];
  }

  const participantsByEvent = new Map<string, any[]>();
  (participants || []).forEach((p) => {
    if (!participantsByEvent.has(p.event_id)) participantsByEvent.set(p.event_id, []);
    participantsByEvent.get(p.event_id)!.push(p);
  });

  return (events || []).map((ev: any) => {
    const teams = (participantsByEvent.get(ev.id) || []).map((p) => ({
      teamId: p.team_id,
      name: p.teams?.name || 'Team',
      level: p.teams?.level,
    }));

    return {
      eventId: ev.id,
      orgId: ev.org_id,
      type: ev.type as HsEvent['type'],
      name: ev.name,
      location: ev.location_venue || ev.location_name || ev.location_city || null,
      startTime: ev.start_time,
      endTime: ev.end_time,
      teams,
      opponentName: ev.opponent_name || null,
      isHomeGame: ev.is_home ?? null,
    };
  });
}
