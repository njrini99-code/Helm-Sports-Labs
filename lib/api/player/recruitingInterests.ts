import { createClient } from '@/lib/supabase/client';
import type { College } from '@/components/colleges/CollegeSearchSelect';

// Re-export College for consumers
export type { College };

export type RecruitingInterestStatus = 
  | 'interested'
  | 'contacted'
  | 'questionnaire'
  | 'unofficial_visit'
  | 'official_visit'
  | 'offer'
  | 'verbal'
  | 'signed'
  | 'declined';

export interface RecruitingInterest {
  id: string;
  player_id: string;
  college_id: string | null;
  school_name: string;
  conference: string | null;
  division: string | null;
  status: RecruitingInterestStatus;
  interest_level: 'low' | 'medium' | 'high' | null;
  coach_name: string | null;
  notes: string | null;
  last_contact_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  college?: College | null;
}

export interface AddRecruitingInterestInput {
  playerId: string;
  collegeId?: string;
  schoolName: string;
  conference?: string;
  division?: string;
  status?: RecruitingInterestStatus;
  interestLevel?: 'low' | 'medium' | 'high';
  coachName?: string;
  notes?: string;
}

export interface UpdateRecruitingInterestInput {
  id: string;
  status?: RecruitingInterestStatus;
  interestLevel?: 'low' | 'medium' | 'high';
  coachName?: string;
  notes?: string;
  lastContactAt?: string;
}

/**
 * Get all recruiting interests for a player
 */
export async function getRecruitingInterestsForPlayer(playerId: string): Promise<RecruitingInterest[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('recruiting_interests')
    .select(`
      *,
      college:college_id (
        id,
        name,
        short_name,
        nickname,
        city,
        state,
        division,
        conference,
        logo_url,
        slug
      )
    `)
    .eq('player_id', playerId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('getRecruitingInterestsForPlayer error:', error);
    return [];
  }

  return (data || []).map((row: any) => ({
    ...row,
    college: row.college || null,
  }));
}

/**
 * Add a new recruiting interest
 */
export async function addRecruitingInterest(input: AddRecruitingInterestInput): Promise<{ id: string | null; error: Error | null }> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('recruiting_interests')
    .insert({
      player_id: input.playerId,
      college_id: input.collegeId || null,
      school_name: input.schoolName,
      conference: input.conference || null,
      division: input.division || null,
      status: input.status || 'interested',
      interest_level: input.interestLevel || 'medium',
      coach_name: input.coachName || null,
      notes: input.notes || null,
    })
    .select('id')
    .single();

  if (error) {
    console.error('addRecruitingInterest error:', error);
    return { id: null, error: new Error(error.message) };
  }

  return { id: data.id, error: null };
}

/**
 * Update an existing recruiting interest
 */
export async function updateRecruitingInterest(input: UpdateRecruitingInterestInput): Promise<{ error: Error | null }> {
  const supabase = createClient();

  const updates: Record<string, unknown> = {};
  if (input.status !== undefined) updates.status = input.status;
  if (input.interestLevel !== undefined) updates.interest_level = input.interestLevel;
  if (input.coachName !== undefined) updates.coach_name = input.coachName;
  if (input.notes !== undefined) updates.notes = input.notes;
  if (input.lastContactAt !== undefined) updates.last_contact_at = input.lastContactAt;

  const { error } = await supabase
    .from('recruiting_interests')
    .update(updates)
    .eq('id', input.id);

  if (error) {
    console.error('updateRecruitingInterest error:', error);
    return { error: new Error(error.message) };
  }

  return { error: null };
}

/**
 * Delete a recruiting interest
 */
export async function deleteRecruitingInterest(id: string): Promise<{ error: Error | null }> {
  const supabase = createClient();

  const { error } = await supabase
    .from('recruiting_interests')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('deleteRecruitingInterest error:', error);
    return { error: new Error(error.message) };
  }

  return { error: null };
}

/**
 * Get recruiting summary stats for a player
 */
export async function getRecruitingSummary(playerId: string): Promise<{
  total: number;
  offers: number;
  visits: number;
  contacts: number;
}> {
  const interests = await getRecruitingInterestsForPlayer(playerId);

  return {
    total: interests.length,
    offers: interests.filter(i => ['offer', 'verbal', 'signed'].includes(i.status)).length,
    visits: interests.filter(i => ['unofficial_visit', 'official_visit'].includes(i.status)).length,
    contacts: interests.filter(i => ['contacted', 'questionnaire'].includes(i.status)).length,
  };
}

// Alias for backwards compatibility
export const getRecruitingInterests = getRecruitingInterestsForPlayer;

/**
 * Get all colleges for browsing
 */
export async function getColleges(filters?: {
  division?: string;
  region?: string;
  search?: string;
}): Promise<College[]> {
  const supabase = createClient();

  let query = supabase
    .from('colleges')
    .select('*')
    .order('name', { ascending: true });

  if (filters?.division) {
    query = query.eq('division', filters.division);
  }

  if (filters?.region) {
    // Map region to states
    const regionStates: Record<string, string[]> = {
      'Northeast': ['CT', 'ME', 'MA', 'NH', 'NJ', 'NY', 'PA', 'RI', 'VT'],
      'Southeast': ['AL', 'FL', 'GA', 'KY', 'MS', 'NC', 'SC', 'TN', 'VA', 'WV'],
      'Midwest': ['IL', 'IN', 'IA', 'KS', 'MI', 'MN', 'MO', 'NE', 'ND', 'OH', 'SD', 'WI'],
      'Southwest': ['AZ', 'NM', 'OK', 'TX'],
      'West': ['AK', 'CA', 'CO', 'HI', 'ID', 'MT', 'NV', 'OR', 'UT', 'WA', 'WY'],
    };
    const states = regionStates[filters.region];
    if (states) {
      query = query.in('state', states);
    }
  }

  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,nickname.ilike.%${filters.search}%`);
  }

  const { data, error } = await query.limit(200);

  if (error) {
    console.error('getColleges error:', error);
    return [];
  }

  return (data || []) as College[];
}

