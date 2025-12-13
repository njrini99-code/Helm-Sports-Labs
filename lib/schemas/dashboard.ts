import { z } from 'zod';

// ═══════════════════════════════════════════════════════════════════════════
// Base Schemas
// ═══════════════════════════════════════════════════════════════════════════

export const playerSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid().nullable(),
  full_name: z.string().nullable(),
  first_name: z.string().nullable(),
  last_name: z.string().nullable(),
  email: z.string().email().nullable(),
  phone: z.string().nullable(),
  avatar_url: z.string().url().nullable(),
  primary_position: z.string().nullable(),
  secondary_position: z.string().nullable(),
  grad_year: z.number().int().min(2020).max(2035).nullable(),
  jersey_number: z.number().int().min(0).max(99).nullable(),
  height_inches: z.number().int().nullable(),
  weight_lbs: z.number().int().nullable(),
  high_school_name: z.string().nullable(),
  high_school_city: z.string().nullable(),
  high_school_state: z.string().length(2).nullable(),
  gpa: z.number().min(0).max(4.0).nullable(),
  sat_score: z.number().int().nullable(),
  act_score: z.number().int().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const coachSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid().nullable(),
  full_name: z.string().nullable(),
  email: z.string().email().nullable(),
  phone: z.string().nullable(),
  avatar_url: z.string().url().nullable(),
  logo_url: z.string().url().nullable(),
  school_name: z.string().nullable(),
  school_city: z.string().nullable(),
  school_state: z.string().length(2).nullable(),
  organization_name: z.string().nullable(),
  organization_city: z.string().nullable(),
  organization_state: z.string().length(2).nullable(),
  coach_type: z.enum(['college', 'high_school', 'juco', 'showcase']).nullable(),
  division: z.string().nullable(),
  athletic_conference: z.string().nullable(),
  about: z.string().nullable(),
  primary_color: z.string().regex(/^#[0-9A-F]{6}$/i).nullable(),
  secondary_color: z.string().regex(/^#[0-9A-F]{6}$/i).nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const teamSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  owner_id: z.string().uuid(),
  owner_type: z.enum(['coach', 'organization']),
  team_type: z.enum(['high_school', 'juco', 'club', 'travel']),
  season_year: z.number().int().nullable(),
  logo_url: z.string().url().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const collegeSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  city: z.string().nullable(),
  state: z.string().length(2).nullable(),
  division: z.string().nullable(),
  conference: z.string().nullable(),
  logo_url: z.string().url().nullable(),
  website: z.string().url().nullable(),
  created_at: z.string().datetime(),
});

// ═══════════════════════════════════════════════════════════════════════════
// Relationship Schemas
// ═══════════════════════════════════════════════════════════════════════════

export const teamMemberSchema = z.object({
  id: z.string().uuid(),
  team_id: z.string().uuid(),
  player_id: z.string().uuid(),
  jersey_number: z.number().int().min(0).max(99).nullable(),
  position: z.string().nullable(),
  is_starter: z.boolean().default(false),
  joined_date: z.string().datetime().nullable(),
  left_date: z.string().datetime().nullable(),
  player: playerSchema,
});

export const scheduleEventSchema = z.object({
  id: z.string().uuid(),
  team_id: z.string().uuid(),
  event_type: z.enum(['game', 'practice', 'tournament', 'showcase', 'other']),
  event_name: z.string().nullable(),
  opponent_name: z.string().nullable(),
  location_name: z.string().nullable(),
  location_city: z.string().nullable(),
  location_state: z.string().length(2).nullable(),
  start_time: z.string().datetime(),
  end_time: z.string().datetime().nullable(),
  home_score: z.number().int().nullable(),
  away_score: z.number().int().nullable(),
  is_home_game: z.boolean().default(true),
  created_at: z.string().datetime(),
});

export const collegeInterestSchema = z.object({
  id: z.string().uuid(),
  player_id: z.string().uuid(),
  college_id: z.string().uuid(),
  interest_level: z.enum(['watching', 'high_priority', 'offered', 'committed']),
  status: z.enum(['active', 'inactive', 'committed_elsewhere']),
  last_activity_date: z.string().datetime(),
  notes: z.string().nullable(),
  college: collegeSchema,
  player: z.object({
    id: z.string().uuid(),
    first_name: z.string().nullable(),
    last_name: z.string().nullable(),
    primary_position: z.string().nullable(),
    grad_year: z.number().int().nullable(),
  }),
});

export const activityFeedItemSchema = z.object({
  id: z.string().uuid(),
  activity_type: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  created_at: z.string().datetime(),
  related_player_id: z.string().uuid().nullable(),
  related_college_id: z.string().uuid().nullable(),
  metadata: z.record(z.any()).nullable(),
});

// ═══════════════════════════════════════════════════════════════════════════
// Dashboard Response Schemas
// ═══════════════════════════════════════════════════════════════════════════

export const rosterResponseSchema = z.array(teamMemberSchema);

export const scheduleResponseSchema = z.array(scheduleEventSchema);

export const collegeInterestResponseSchema = z.array(collegeInterestSchema);

export const activityFeedResponseSchema = z.array(activityFeedItemSchema);

export const dashboardStatsSchema = z.object({
  rosterSize: z.number().int().min(0),
  upcomingGames: z.number().int().min(0),
  totalInterest: z.number().int().min(0),
  profileViews: z.number().int().min(0),
});

// ═══════════════════════════════════════════════════════════════════════════
// Type Exports (for TypeScript)
// ═══════════════════════════════════════════════════════════════════════════

export type Player = z.infer<typeof playerSchema>;
export type Coach = z.infer<typeof coachSchema>;
export type Team = z.infer<typeof teamSchema>;
export type College = z.infer<typeof collegeSchema>;
export type TeamMember = z.infer<typeof teamMemberSchema>;
export type ScheduleEvent = z.infer<typeof scheduleEventSchema>;
export type CollegeInterest = z.infer<typeof collegeInterestSchema>;
export type ActivityFeedItem = z.infer<typeof activityFeedItemSchema>;
export type DashboardStats = z.infer<typeof dashboardStatsSchema>;

// ═══════════════════════════════════════════════════════════════════════════
// Validation Helpers
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Safely parse data with a Zod schema
 * Returns parsed data or null if validation fails
 */
export function safeParse<T>(schema: z.ZodSchema<T>, data: unknown): T | null {
  const result = schema.safeParse(data);
  if (result.success) {
    return result.data;
  }
  console.error('Schema validation failed:', result.error.format());
  return null;
}

/**
 * Parse data with a Zod schema or throw error
 */
export function strictParse<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

/**
 * Validate array data, filtering out invalid items
 */
export function validateArray<T>(schema: z.ZodSchema<T>, data: unknown[]): T[] {
  return data
    .map(item => {
      const result = schema.safeParse(item);
      return result.success ? result.data : null;
    })
    .filter((item): item is T => item !== null);
}
