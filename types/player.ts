export interface Player {
  id: string;
  user_id: string;
  profile_id?: string; // Legacy, prefer user_id
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  primary_position: string | null;
  secondary_position: string | null;
  grad_year: number | null;
  height_feet: number | null;
  height_inches: number | null;
  weight_lbs: number | null;
  bats: 'R' | 'L' | 'S' | null;
  throws: 'R' | 'L' | null;
  high_school_name: string | null;
  high_school_city: string | null;
  high_school_state: string | null;
  high_school_org_id: string | null;
  highlight_url: string | null;
  avatar_url: string | null;
  gpa: number | null;
  city: string | null;
  state: string | null;
  // Metrics
  pitch_velo: number | null;
  exit_velo: number | null;
  sixty_time: number | null;
  has_video: boolean;
  verified_metrics: boolean;
  // Status
  onboarding_completed: boolean;
  onboarding_step: number;
  created_at: string;
  updated_at: string;
}

export interface PlayerSettings {
  id: string;
  player_id: string;
  is_discoverable: boolean;
  show_gpa: boolean;
  show_test_scores: boolean;
  show_contact_info: boolean;
  notify_on_eval: boolean;
  notify_on_interest: boolean;
  notify_on_message: boolean;
  notify_on_watchlist_add: boolean;
}

export const DEFAULT_PLAYER_SETTINGS: Omit<PlayerSettings, 'id' | 'player_id'> = {
  is_discoverable: true,
  show_gpa: false,
  show_test_scores: false,
  show_contact_info: false,
  notify_on_eval: true,
  notify_on_interest: true,
  notify_on_message: true,
  notify_on_watchlist_add: true,
};
