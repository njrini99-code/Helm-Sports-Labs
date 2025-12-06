export interface Event {
  id: string;
  org_id: string | null;
  name: string;
  type: 'game' | 'showcase' | 'tournament' | 'camp' | 'combine' | 'tryout';
  start_time: string;
  end_time: string | null;
  location_city: string | null;
  location_state: string | null;
  location_venue: string | null;
  level: string | null;
  is_public: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  organization?: {
    id: string;
    name: string;
    type: string;
  } | null;
}

export interface EventTeamParticipant {
  id: string;
  event_id: string;
  team_id: string;
  result: 'win' | 'loss' | 'tie' | null;
  score_for: number | null;
  score_against: number | null;
  created_at: string;
  // Joined data
  event?: Event | null;
  team?: {
    id: string;
    name: string;
  } | null;
}

// High school–focused event alias for HS coach dashboards
export type HsEvent = Event & {
  type: 'game' | 'practice' | 'scrimmage' | 'meeting' | 'showcase';
};
