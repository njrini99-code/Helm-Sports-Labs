import { createClient } from '@/lib/supabase/client';
import type { Organization } from '@/types/organization';

export interface PlayerProgramsResponse {
  highSchoolProgram: (Organization & {
    level?: string;
    jerseyNumber?: string;
  }) | null;
  showcaseOrgs: Array<
    Organization & {
      eventsAttended: number;
      lastEventDate: string | null;
    }
  >;
}

export async function getPlayerPrograms(playerId: string): Promise<PlayerProgramsResponse> {
  const supabase = createClient();

  // Get player to find high school org
  const { data: player } = await supabase
    .from('players')
    .select('high_school_org_id, high_school_name, high_school_city, high_school_state')
    .eq('id', playerId)
    .maybeSingle();

  // Get high school organization
  let highSchoolProgram: PlayerProgramsResponse['highSchoolProgram'] = null;

  if (player?.high_school_org_id) {
    const { data: orgData } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', player.high_school_org_id)
      .maybeSingle();

    if (orgData) {
      // Get team membership details
      const { data: membershipData } = await supabase
        .from('team_memberships')
        .select(`
          jersey_number,
          status,
          teams:team_id(
            level,
            team_type,
            name
          )
        `)
        .eq('player_id', playerId)
        .or('status.is.null,status.eq.active')
        .limit(1);

      const membership = membershipData?.[0] as {
        jersey_number?: number;
        status?: string;
        teams?: { level?: string; team_type?: string; name?: string } | null;
      } | undefined;

      // Get team data (Supabase returns object for single FK join)
      const team = membership?.teams;
      const isHsTeam = team?.team_type === 'high_school';

      highSchoolProgram = {
        ...orgData,
        level: isHsTeam ? team?.level : team?.level || undefined,
        jerseyNumber: membership?.jersey_number?.toString() || undefined,
      };
    }
  }

  // Fallback: create from player's HS info
  if (!highSchoolProgram && player?.high_school_name) {
    highSchoolProgram = {
      id: 'hs-' + playerId,
      name: player.high_school_name,
      type: 'high_school',
      location_city: player.high_school_city,
      location_state: player.high_school_state,
      logo_url: null,
      banner_url: null,
      website_url: null,
      description: null,
      conference: null,
      division: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  // Get showcase organizations player has attended events with
  // Find teams player is on
  const { data: teamMemberships } = await supabase
    .from('team_memberships')
    .select('team_id')
    .eq('player_id', playerId);

  const teamIds = (teamMemberships || []).map(m => m.team_id);

  // Get events for those teams
  const { data: eventParticipants } = await supabase
    .from('event_team_participants')
    .select(`
      event:events(
        id,
        start_time,
        organization:organizations(*)
      )
    `)
    .in('team_id', teamIds);

  // Group by organization
  const orgMap = new Map<string, {
    org: Organization;
    eventCount: number;
    lastEventDate: string | null;
  }>();

  (eventParticipants || []).forEach((ep: any) => {
    // Supabase returns nested object for FK joins
    const event = ep.event;
    if (!event) return;
    
    const org = event.organization;
    if (!org || org.type === 'high_school') return;

    const existing = orgMap.get(org.id);
    const eventDate = event.start_time || null;

    if (existing) {
      existing.eventCount++;
      if (eventDate && (!existing.lastEventDate || eventDate > existing.lastEventDate)) {
        existing.lastEventDate = eventDate;
      }
    } else {
      orgMap.set(org.id, {
        org: org as Organization,
        eventCount: 1,
        lastEventDate: eventDate,
      });
    }
  });

  const showcaseOrgs = Array.from(orgMap.values())
    .map(({ org, eventCount, lastEventDate }) => ({
      ...org,
      eventsAttended: eventCount,
      lastEventDate,
    }))
    .sort((a, b) => (b.lastEventDate || '').localeCompare(a.lastEventDate || ''));

  return {
    highSchoolProgram,
    showcaseOrgs,
  };
}
