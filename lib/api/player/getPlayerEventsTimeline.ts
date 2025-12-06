import { createClient } from '@/lib/supabase/client';

export type EventFilter = {
  type: 'all' | 'high_school' | 'showcase';
  range: { from: Date | null; to: Date | null; preset?: '30d' | '90d' | '365d' };
};

export type PlayerEventTimelineItem = {
  eventId: string;
  date: string;
  type: 'high_school_game' | 'showcase_event' | 'showcase_game' | 'tournament' | 'camp';
  label: string;
  orgName: string;
  level?: string;
  location?: string;
  result?: 'W' | 'L' | 'T' | null;
  score?: { team: number; opponent: number } | null;
  statsSnippet?: {
    // Baseball
    hits?: number;
    atBats?: number;
    rbis?: number;
    battingAvg?: number;
    // Basketball (legacy)
    points?: number;
    rebounds?: number;
    assists?: number;
    fgPct?: number;
    threePct?: number;
  } | null;
};

function getDateRange(preset?: '30d' | '90d' | '365d'): { from: Date; to: Date } {
  const to = new Date();
  const from = new Date();
  
  switch (preset) {
    case '30d':
      from.setDate(from.getDate() - 30);
      break;
    case '90d':
      from.setDate(from.getDate() - 90);
      break;
    case '365d':
    default:
      from.setFullYear(from.getFullYear() - 1);
      break;
  }
  
  return { from, to };
}

export async function getPlayerEventsTimeline(
  playerId: string,
  filter: EventFilter
): Promise<PlayerEventTimelineItem[]> {
  const supabase = createClient();

  // Get player's team memberships
  const { data: memberships } = await supabase
    .from('team_memberships')
    .select('team_id')
    .eq('player_id', playerId);

  const teamIds = (memberships || []).map(m => m.team_id);

  if (teamIds.length === 0) {
    return [];
  }

  // Determine date range
  const range = filter.range.from && filter.range.to
    ? { from: filter.range.from, to: filter.range.to }
    : getDateRange(filter.range.preset);

  // Get event participations for player's teams
  const { data: participants } = await supabase
    .from('event_team_participants')
    .select(`
      *,
      event:events(
        id,
        name,
        type,
        start_time,
        level,
        location_city,
        location_state,
        location_venue,
        organization:organizations(name, type)
      )
    `)
    .in('team_id', teamIds)
    .gte('event.start_time', range.from.toISOString())
    .lte('event.start_time', range.to.toISOString())
    .order('created_at', { ascending: false });

  // Get player stats for these events
  const eventIds = (participants || [])
    .filter(p => p.event)
    .map(p => p.event!.id);

  const { data: statsData } = await supabase
    .from('player_stats')
    .select('*')
    .eq('player_id', playerId)
    .in('event_id', eventIds);

  const statsByEvent = new Map(
    (statsData || []).map(s => [s.event_id, s])
  );

  // Build timeline items
  const items: PlayerEventTimelineItem[] = (participants || [])
    .filter(p => p.event)
    .map(p => {
      const event = p.event!;
      const stats = statsByEvent.get(event.id);
      const orgType = event.organization?.type;
      
      // Determine event type
      let type: PlayerEventTimelineItem['type'] = 'showcase_event';
      if (orgType === 'high_school') {
        type = 'high_school_game';
      } else if (event.type === 'tournament') {
        type = 'tournament';
      } else if (event.type === 'camp') {
        type = 'camp';
      } else if (event.type === 'game') {
        type = orgType === 'high_school' ? 'high_school_game' : 'showcase_game';
      }

      // Build location string
      const locationParts = [
        event.location_venue,
        event.location_city,
        event.location_state
      ].filter(Boolean);

      // Build stats snippet
      let statsSnippet: PlayerEventTimelineItem['statsSnippet'] = null;
      if (stats) {
        statsSnippet = {
          // Baseball
          hits: stats.hits ?? undefined,
          atBats: stats.at_bats ?? undefined,
          rbis: stats.rbis ?? undefined,
          battingAvg: stats.batting_avg ?? undefined,
          // Basketball
          points: stats.points ?? undefined,
          rebounds: stats.rebounds ?? undefined,
          assists: stats.assists_bb ?? undefined,
          fgPct: stats.fg_attempts && stats.fg_attempts > 0
            ? ((stats.fg_made || 0) / stats.fg_attempts) * 100
            : undefined,
        };
      }

      // Map result
      let result: 'W' | 'L' | 'T' | null = null;
      if (p.result === 'win') result = 'W';
      else if (p.result === 'loss') result = 'L';
      else if (p.result === 'tie') result = 'T';

      return {
        eventId: event.id,
        date: event.start_time,
        type,
        label: event.name,
        orgName: event.organization?.name || 'Unknown',
        level: event.level || undefined,
        location: locationParts.length > 0 ? locationParts.join(', ') : undefined,
        result,
        score: p.score_for != null && p.score_against != null
          ? { team: p.score_for, opponent: p.score_against }
          : null,
        statsSnippet,
      };
    });

  // Filter by type
  if (filter.type !== 'all') {
    return items.filter(item => {
      if (filter.type === 'high_school') {
        return item.type === 'high_school_game';
      }
      return item.type !== 'high_school_game';
    });
  }

  return items;
}
