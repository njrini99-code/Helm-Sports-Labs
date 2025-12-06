export interface PlayerStatLine {
  id: string;
  player_id: string;
  event_id: string | null;
  // Baseball Hitting
  at_bats?: number | null;
  hits?: number | null;
  singles?: number | null;
  doubles?: number | null;
  triples?: number | null;
  home_runs?: number | null;
  rbis?: number | null;
  runs?: number | null;
  stolen_bases?: number | null;
  walks?: number | null;
  strikeouts?: number | null;
  batting_avg?: number | null;
  // Baseball Pitching
  innings_pitched?: number | null;
  pitches_thrown?: number | null;
  strikeouts_pitched?: number | null;
  walks_allowed?: number | null;
  hits_allowed?: number | null;
  earned_runs?: number | null;
  era?: number | null;
  // Baseball Fielding
  putouts?: number | null;
  assists?: number | null;
  errors?: number | null;
  fielding_pct?: number | null;
  // Basketball (legacy support)
  points?: number | null;
  rebounds?: number | null;
  assists_bb?: number | null;
  fg_made?: number | null;
  fg_attempts?: number | null;
  three_made?: number | null;
  three_attempts?: number | null;
  ft_made?: number | null;
  ft_attempts?: number | null;
  // Meta
  source?: 'manual' | 'imported' | 'verified' | null;
  created_at?: string | null;
  updated_at?: string | null;
  // Joined data
  event?: {
    name: string;
    start_time: string;
    type: string;
  } | null;
}
