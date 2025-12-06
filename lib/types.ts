export type UserRole = 'player' | 'coach';

export type CoachType = 'college' | 'juco' | 'high_school' | 'showcase';

export interface Profile {
  id: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Player {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  grad_year: number | null;
  high_school_name: string | null;
  high_school_city: string | null;
  high_school_state: string | null;
  high_school_org_id: string | null;
  showcase_team_name: string | null;
  showcase_team_level: string | null;
  height_feet: number | null;
  height_inches: number | null;
  weight_lbs: number | null;
  primary_position: string | null;
  secondary_position: string | null;
  throws: string | null;
  bats: string | null;
  pitch_velo: number | null;
  exit_velo: number | null;
  sixty_time: number | null;
  perfect_game_url: string | null;
  twitter_url: string | null;
  primary_goal: string | null;
  about_me: string | null;
  top_schools: string[] | null;
  avatar_url: string | null;
  has_video: boolean;
  verified_metrics: boolean;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Coach {
  id: string;
  user_id: string;
  full_name: string | null;
  coach_type: CoachType | null;
  coach_title: string | null;
  staff_role: string | null;
  // School/Program info
  program_name: string | null;
  program_division: string | null;
  athletic_conference: string | null;
  school_name: string | null;
  school_city: string | null;
  school_state: string | null;
  // Contact
  email_contact: string | null;
  phone_contact: string | null;
  years_in_program: number | null;
  // Program Profile
  program_values: string | null;
  facility_summary: string | null;
  recruiting_needs: string[] | null;
  about: string | null;
  what_we_look_for: string | null;
  academic_profile: string | null;
  // Media
  logo_url: string | null;
  banner_url: string | null;
  intro_video_url: string | null;
  tags: string[] | null;
  // JUCO/Showcase specific
  organization_name: string | null;
  organization_city: string | null;
  organization_state: string | null;
  age_groups: string[] | null;
  team_divisions: string[] | null;
  showcase_success_highlights: string[] | null;
  showcase_mission: string | null;
  placement_rate: string | null;
  placement_highlights: string[] | null;
  program_philosophy: string | null;
  program_website: string | null;
  // High School specific
  team_level: string[] | null;
  primary_field_name: string | null;
  primary_field_address: string | null;
  practice_philosophy: string | null;
  developmental_focus: string[] | null;
  communication_pref: string | null;
  years_coaching: number | null;
  // Theme/Branding
  primary_color: string | null;
  secondary_color: string | null;
  accent_color: string | null;
  use_dark_mode: boolean | null;
  tagline: string | null;
  // Social Links
  twitter_url: string | null;
  instagram_url: string | null;
  youtube_url: string | null;
  // Status
  onboarding_completed: boolean;
  onboarding_step: number;
  created_at: string;
  updated_at: string;
}

export interface CampEvent {
  id: string;
  coach_id: string;
  name: string;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  event_type: string;
  description: string | null;
  location: string | null;
  registration_link: string | null;
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: string;
  coach_id: string;
  team_type: string;
  name: string;
  level: string | null;
  city: string | null;
  state: string | null;
  created_at: string;
}

export interface Recruit {
  id: string;
  coach_id: string;
  player_id: string | null;
  name: string;
  grad_year: string | null;
  primary_position: string | null;
  high_school_name: string | null;
  high_school_state: string | null;
  stage: string;
  priority: string | null;
  notes: string | null;
  next_action_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_type: 'player' | 'coach' | 'system';
  sender_player_id: string | null;
  sender_program_id: string | null;
  body: string;
  created_at: string;
  read_by_player: boolean;
  read_by_program: boolean;
}

export interface Conversation {
  id: string;
  player_id: string;
  program_id: string;
  last_message_at: string | null;
  last_message_text: string | null;
  last_sender: 'player' | 'coach' | 'system' | null;
  player_unread_count: number;
  program_unread_count: number;
  created_at: string;
  updated_at: string;
}

// UI Constants
export const POSITIONS = [
  'Pitcher',
  'Catcher',
  'First Base',
  'Second Base',
  'Shortstop',
  'Third Base',
  'Left Field',
  'Center Field',
  'Right Field',
  'Designated Hitter',
  'Utility',
] as const;

export const GRAD_YEARS = [2025, 2026, 2027, 2028, 2029] as const;

export const DIVISIONS = ['D1', 'D2', 'D3', 'NAIA', 'JUCO', 'Other'] as const;

export const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
] as const;

export const PLAYER_GOALS = [
  'Play D1 Baseball',
  'Play D2 Baseball',
  'Play D3 Baseball',
  'Go to a school where I\'ll get playing time',
  'Help a team win a championship',
  'Become the best version of myself',
  'Make it as far as possible in baseball',
] as const;

