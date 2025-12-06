export interface Team {
  id: string;
  org_id: string;
  name: string;
  level: string | null;
  season_year?: number | null;
}

export interface TeamMembership {
  id: string;
  team_id: string;
  player_id: string;
  jersey_number: string | null;
  status: 'active' | 'inactive' | 'alumni' | string;
  is_primary?: boolean | null;
}
