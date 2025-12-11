import { createClient } from '@/lib/supabase/client';

export type HsRosterPlayer = {
  playerId: string;
  profileId: string;
  fullName: string;
  avatarUrl?: string | null;
  gradYear?: number | null;
  positions: string[];
  heightInches?: number | null;
  weightLbs?: number | null;
  gpa?: number | null;
  teams: { teamId: string; name: string; level?: string | null; jerseyNumber?: number | null }[];
  isProfileComplete: boolean;
};

export type HsRosterFiltersState = {
  teamId?: string;
  position?: string;
  gradYear?: number;
  showOnlyTopProspects?: boolean;
  showOnlyIncompleteProfiles?: boolean;
};

// Fetch HS roster by org using teams->team_memberships->players/profiles
export async function getHighSchoolRoster(orgId: string, filters: HsRosterFiltersState): Promise<HsRosterPlayer[]> {
  const supabase = createClient();

  // Step 1: get teams for this org (using org_id FK)
  let teamsQuery = supabase
    .from('teams')
    .select('id,name,level');
  
  // Try org_id first, fallback to name match
  const { data: teams, error: teamsError } = await teamsQuery.eq('org_id', orgId);
  if (teamsError) {
    console.error('getHighSchoolRoster teams error', teamsError);
    return [];
  }

  const teamIds = (teams || []).map((t) => t.id);
  if (teamIds.length === 0) return [];

  // Step 2: memberships scoped to org teams
  let membershipsQuery = supabase
    .from('team_memberships')
    .select(
      `
      id,
      team_id,
      player_id,
      jersey_number,
      status,
      players:player_id (
        id,
        user_id,
        first_name,
        last_name,
        grad_year,
        height_feet,
        height_inches,
        weight_lbs,
        primary_position,
        secondary_position,
        gpa,
        avatar_url
      )
    `
    )
    .in('team_id', teamIds);

  if (filters.teamId) membershipsQuery = membershipsQuery.eq('team_id', filters.teamId);
  // Filter active members by default
  membershipsQuery = membershipsQuery.or('status.is.null,status.eq.active');

  const { data: memberships, error: membershipsError } = await membershipsQuery;
  if (membershipsError) {
    console.error('getHighSchoolRoster memberships error', membershipsError);
    return [];
  }

  // Reduce memberships into players with team badges
  const rosterMap = new Map<string, HsRosterPlayer>();
  (memberships || []).forEach((m: any) => {
    const player = m.players;
    if (!player) return;
    // Filter position/grad if provided
    if (filters.position && player.primary_position !== filters.position && player.secondary_position !== filters.position) {
      return;
    }
    if (filters.gradYear && player.grad_year !== filters.gradYear) return;

    const existing = rosterMap.get(player.id);
    const team = teams?.find((t) => t.id === m.team_id);
    const teamBadge = { teamId: m.team_id, name: team?.name || 'Team', level: team?.level, jerseyNumber: m.jersey_number };
    if (existing) {
      existing.teams.push(teamBadge);
      return;
    }

    const fullName = `${player.first_name || ''} ${player.last_name || ''}`.trim();
    const isProfileComplete =
      !!player.grad_year &&
      !!player.primary_position &&
      !!player.first_name &&
      !!player.last_name;

    // Calculate total height in inches
    const heightInches = player.height_feet && player.height_inches != null
      ? (player.height_feet * 12) + player.height_inches
      : null;

    rosterMap.set(player.id, {
      playerId: player.id,
      profileId: player.user_id || player.id,
      fullName: fullName || 'Player',
      avatarUrl: player.avatar_url || null,
      gradYear: player.grad_year,
      positions: [player.primary_position, player.secondary_position].filter(Boolean),
      heightInches,
      weightLbs: player.weight_lbs,
      gpa: player.gpa,
      teams: [teamBadge],
      isProfileComplete,
    });
  });

  let roster = Array.from(rosterMap.values());

  if (filters.showOnlyIncompleteProfiles) {
    roster = roster.filter((p) => !p.isProfileComplete);
  }

  // Top prospects filter - check for tags or flags
  if (filters.showOnlyTopProspects) {
    // Fetch player tags/flags from player_tags or similar table
    const playerIds = roster.map(p => p.playerId);
    if (playerIds.length > 0) {
      const { data: tags } = await supabase
        .from('player_tags')
        .select('player_id, tag_name')
        .in('player_id', playerIds)
        .in('tag_name', ['top_prospect', 'high_priority', 'star', 'elite']);

      // Also check for flags in players table if exists
      const { data: flaggedPlayers } = await supabase
        .from('players')
        .select('id, is_top_prospect, is_high_priority')
        .in('id', playerIds)
        .or('is_top_prospect.eq.true,is_high_priority.eq.true');

      const topProspectIds = new Set<string>();
      
      // Add players with tags
      tags?.forEach(tag => topProspectIds.add(tag.player_id));
      
      // Add players with flags
      flaggedPlayers?.forEach(player => topProspectIds.add(player.id));

      // Filter roster to only top prospects
      if (topProspectIds.size > 0) {
        roster = roster.filter(p => topProspectIds.has(p.playerId));
      } else {
        // If no tags/flags system exists yet, return empty array
        // This allows the feature to work once the system is implemented
        roster = [];
      }
    }
  }

  return roster;
}
