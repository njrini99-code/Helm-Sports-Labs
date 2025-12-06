import { createClient } from '@/lib/supabase/client';
import { getTodayLocal, addDaysLocal } from '@/lib/utils/date';

// ═══════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════

export type CalendarEventType = 'camp' | 'evaluation' | 'visit' | 'other';

export interface CalendarEvent {
  id: string;
  coachId: string;
  type: CalendarEventType;
  title: string;
  date: string; // ISO date YYYY-MM-DD
  startTime?: string; // "HH:mm"
  endTime?: string;
  location?: string;
  notes?: string;
  campEventId?: string; // Link to camp_events table
  opponentEventName?: string; // For evaluations
  playerIds: string[];
  players?: PlayerSummary[];
  createdAt: string;
  updatedAt: string;
}

export interface PlayerSummary {
  id: string;
  firstName: string | null;
  lastName: string | null;
  gradYear: number | null;
  primaryPosition: string | null;
  avatarUrl?: string;
}

export interface CalendarEventInput {
  type: CalendarEventType;
  title: string;
  date: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  notes?: string;
  campEventId?: string;
  opponentEventName?: string;
  playerIds?: string[];
}

// ═══════════════════════════════════════════════════════════════════════════
// Queries
// ═══════════════════════════════════════════════════════════════════════════

export async function getCalendarEvents(coachId: string): Promise<CalendarEvent[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('coach_calendar_events')
    .select(`
      id,
      coach_id,
      type,
      title,
      event_date,
      start_time,
      end_time,
      location,
      notes,
      camp_event_id,
      opponent_event_name,
      created_at,
      updated_at,
      coach_calendar_event_players (
        player_id,
        players (
          id,
          first_name,
          last_name,
          grad_year,
          primary_position,
          avatar_url
        )
      )
    `)
    .eq('coach_id', coachId)
    .order('event_date', { ascending: true });

  if (error) {
    console.error('Error fetching calendar events:', error);
    return [];
  }

  return (data || []).map((event: any) => ({
    id: event.id,
    coachId: event.coach_id,
    type: event.type as CalendarEventType,
    title: event.title,
    date: event.event_date,
    startTime: event.start_time,
    endTime: event.end_time,
    location: event.location,
    notes: event.notes,
    campEventId: event.camp_event_id,
    opponentEventName: event.opponent_event_name,
    playerIds: event.coach_calendar_event_players?.map((p: any) => p.player_id) || [],
    players: event.coach_calendar_event_players?.map((p: any) => ({
      id: p.players?.id,
      firstName: p.players?.first_name,
      lastName: p.players?.last_name,
      gradYear: p.players?.grad_year,
      primaryPosition: p.players?.primary_position,
      avatarUrl: p.players?.avatar_url,
    })).filter((p: any) => p.id) || [],
    createdAt: event.created_at,
    updatedAt: event.updated_at,
  }));
}

export async function getUpcomingEvents(coachId: string, days: number = 14): Promise<CalendarEvent[]> {
  const supabase = createClient();
  const today = getTodayLocal();
  const futureDateStr = addDaysLocal(new Date(), days);

  const { data, error } = await supabase
    .from('coach_calendar_events')
    .select(`
      id,
      coach_id,
      type,
      title,
      event_date,
      start_time,
      end_time,
      location,
      notes,
      camp_event_id,
      opponent_event_name,
      created_at,
      updated_at,
      coach_calendar_event_players (
        player_id,
        players (
          id,
          first_name,
          last_name,
          grad_year,
          primary_position,
          avatar_url
        )
      )
    `)
    .eq('coach_id', coachId)
    .gte('event_date', today)
    .lte('event_date', futureDateStr)
    .order('event_date', { ascending: true })
    .limit(10);

  if (error) {
    console.error('Error fetching upcoming events:', error);
    return [];
  }

  return (data || []).map((event: any) => ({
    id: event.id,
    coachId: event.coach_id,
    type: event.type as CalendarEventType,
    title: event.title,
    date: event.event_date,
    startTime: event.start_time,
    endTime: event.end_time,
    location: event.location,
    notes: event.notes,
    campEventId: event.camp_event_id,
    opponentEventName: event.opponent_event_name,
    playerIds: event.coach_calendar_event_players?.map((p: any) => p.player_id) || [],
    players: event.coach_calendar_event_players?.map((p: any) => ({
      id: p.players?.id,
      firstName: p.players?.first_name,
      lastName: p.players?.last_name,
      gradYear: p.players?.grad_year,
      primaryPosition: p.players?.primary_position,
      avatarUrl: p.players?.avatar_url,
    })).filter((p: any) => p.id) || [],
    createdAt: event.created_at,
    updatedAt: event.updated_at,
  }));
}

export async function getPlayerEvents(coachId: string, playerId: string): Promise<CalendarEvent[]> {
  const supabase = createClient();
  const today = getTodayLocal();

  const { data, error } = await supabase
    .from('coach_calendar_event_players')
    .select(`
      calendar_event_id,
      coach_calendar_events!inner (
        id,
        coach_id,
        type,
        title,
        event_date,
        start_time,
        end_time,
        location,
        notes,
        created_at,
        updated_at
      )
    `)
    .eq('player_id', playerId)
    .gte('coach_calendar_events.event_date', today)
    .order('coach_calendar_events(event_date)', { ascending: true })
    .limit(5);

  if (error) {
    console.error('Error fetching player events:', error);
    return [];
  }

  return (data || []).map((item: any) => ({
    id: item.coach_calendar_events.id,
    coachId: item.coach_calendar_events.coach_id,
    type: item.coach_calendar_events.type as CalendarEventType,
    title: item.coach_calendar_events.title,
    date: item.coach_calendar_events.event_date,
    startTime: item.coach_calendar_events.start_time,
    endTime: item.coach_calendar_events.end_time,
    location: item.coach_calendar_events.location,
    notes: item.coach_calendar_events.notes,
    playerIds: [],
    players: [],
    createdAt: item.coach_calendar_events.created_at,
    updatedAt: item.coach_calendar_events.updated_at,
  }));
}

// ═══════════════════════════════════════════════════════════════════════════
// Mutations
// ═══════════════════════════════════════════════════════════════════════════

export async function createCalendarEvent(
  coachId: string,
  input: CalendarEventInput
): Promise<CalendarEvent | null> {
  const supabase = createClient();

  // Insert the event
  const { data: eventData, error: eventError } = await supabase
    .from('coach_calendar_events')
    .insert({
      coach_id: coachId,
      type: input.type,
      title: input.title,
      event_date: input.date,
      start_time: input.startTime || null,
      end_time: input.endTime || null,
      location: input.location || null,
      notes: input.notes || null,
      camp_event_id: input.campEventId || null,
      opponent_event_name: input.opponentEventName || null,
    })
    .select()
    .single();

  if (eventError) {
    console.error('Error creating calendar event:', eventError);
    return null;
  }

  // Insert player links if any
  if (input.playerIds && input.playerIds.length > 0) {
    const playerLinks = input.playerIds.map((playerId) => ({
      calendar_event_id: eventData.id,
      player_id: playerId,
    }));

    const { error: playerError } = await supabase
      .from('coach_calendar_event_players')
      .insert(playerLinks);

    if (playerError) {
      console.error('Error linking players to event:', playerError);
    }
  }

  return {
    id: eventData.id,
    coachId: eventData.coach_id,
    type: eventData.type as CalendarEventType,
    title: eventData.title,
    date: eventData.event_date,
    startTime: eventData.start_time,
    endTime: eventData.end_time,
    location: eventData.location,
    notes: eventData.notes,
    campEventId: eventData.camp_event_id,
    opponentEventName: eventData.opponent_event_name,
    playerIds: input.playerIds || [],
    players: [],
    createdAt: eventData.created_at,
    updatedAt: eventData.updated_at,
  };
}

export async function updateCalendarEvent(
  eventId: string,
  input: Partial<CalendarEventInput>
): Promise<boolean> {
  const supabase = createClient();

  const updateData: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (input.type !== undefined) updateData.type = input.type;
  if (input.title !== undefined) updateData.title = input.title;
  if (input.date !== undefined) updateData.event_date = input.date;
  if (input.startTime !== undefined) updateData.start_time = input.startTime || null;
  if (input.endTime !== undefined) updateData.end_time = input.endTime || null;
  if (input.location !== undefined) updateData.location = input.location || null;
  if (input.notes !== undefined) updateData.notes = input.notes || null;
  if (input.campEventId !== undefined) updateData.camp_event_id = input.campEventId || null;
  if (input.opponentEventName !== undefined) updateData.opponent_event_name = input.opponentEventName || null;

  const { error: updateError } = await supabase
    .from('coach_calendar_events')
    .update(updateData)
    .eq('id', eventId);

  if (updateError) {
    console.error('Error updating calendar event:', updateError);
    return false;
  }

  // Update player links if provided
  if (input.playerIds !== undefined) {
    // Remove existing player links
    await supabase
      .from('coach_calendar_event_players')
      .delete()
      .eq('calendar_event_id', eventId);

    // Insert new player links
    if (input.playerIds.length > 0) {
      const playerLinks = input.playerIds.map((playerId) => ({
        calendar_event_id: eventId,
        player_id: playerId,
      }));

      const { error: playerError } = await supabase
        .from('coach_calendar_event_players')
        .insert(playerLinks);

      if (playerError) {
        console.error('Error updating player links:', playerError);
      }
    }
  }

  return true;
}

export async function deleteCalendarEvent(eventId: string): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase
    .from('coach_calendar_events')
    .delete()
    .eq('id', eventId);

  if (error) {
    console.error('Error deleting calendar event:', error);
    return false;
  }

  return true;
}

// ═══════════════════════════════════════════════════════════════════════════
// Search Recruits for Player Linking
// ═══════════════════════════════════════════════════════════════════════════

export async function searchRecruitsForCalendar(
  coachId: string,
  query: string
): Promise<PlayerSummary[]> {
  const supabase = createClient();

  // Search in the coach's recruits
  const { data, error } = await supabase
    .from('recruits')
    .select(`
      player_id,
      players (
        id,
        first_name,
        last_name,
        grad_year,
        primary_position,
        avatar_url
      )
    `)
    .eq('coach_id', coachId)
    .not('player_id', 'is', null)
    .limit(20);

  if (error) {
    console.error('Error searching recruits:', error);
    return [];
  }

  const players = (data || [])
    .map((r: any) => ({
      id: r.players?.id,
      firstName: r.players?.first_name,
      lastName: r.players?.last_name,
      gradYear: r.players?.grad_year,
      primaryPosition: r.players?.primary_position,
      avatarUrl: r.players?.avatar_url,
    }))
    .filter((p: PlayerSummary) => p.id);

  // Filter by query
  if (query) {
    const queryLower = query.toLowerCase();
    return players.filter((p) => {
      const fullName = `${p.firstName || ''} ${p.lastName || ''}`.toLowerCase();
      return fullName.includes(queryLower);
    });
  }

  return players;
}

