/**
 * Recruiting Intelligence & Planner Queries
 * 
 * Note: All required tables are now created in migrations:
 * - player_engagement table (migration 008_player_engagement_events.sql)
 * - program_needs table (migration 004_complete_schema.sql)
 * - recruit_watchlist table (migration 004_complete_schema.sql)
 */

import { createClient } from '@/lib/supabase/client';

export interface TrendingPlayer {
  id: string;
  full_name: string;
  grad_year: number;
  primary_position: string | null;
  secondary_position: string | null;
  high_school_state: string | null;
  avatar_url: string | null;
  pitch_velo: number | null;
  exit_velo: number | null;
  sixty_time: number | null;
  trending_score: number;
  has_video: boolean;
  verified_metrics: boolean;
}

export interface ProgramNeeds {
  id?: string;
  coach_id: string;
  grad_years_needed: number[];
  positions_needed: string[];
  min_height_inches: number | null;
  max_height_inches: number | null;
  min_pitch_velo: number | null;
  min_exit_velo: number | null;
  max_sixty_time: number | null;
  preferred_states: string[];
}

export interface RecruitMatch {
  id: string;
  full_name: string;
  grad_year: number;
  primary_position: string;
  secondary_position: string | null;
  high_school_state: string;
  avatar_url: string | null;
  height_feet: number | null;
  height_inches: number | null;
  weight_lbs: number | null;
  pitch_velo: number | null;
  exit_velo: number | null;
  sixty_time: number | null;
  match_score: number;
  match_reasons: string[];
  top_schools: string[] | null;
}

export interface RecruitPipelineEntry {
  id: string;
  player_id: string;
  status: 'watchlist' | 'high_priority' | 'offer_extended' | 'committed' | 'uninterested';
  position_role: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  player: {
    id: string;
    first_name: string;
    last_name: string;
    full_name: string;
    grad_year: number;
    primary_position: string;
    secondary_position: string | null;
    high_school_state: string;
    avatar_url: string | null;
    pitch_velo: number | null;
    exit_velo: number | null;
    sixty_time: number | null;
  };
}

/**
 * Get trending players for a college coach
 * 
 * Uses player_engagement aggregates and basic metrics. Requires:
 * - player_engagement table (recent_views_7d, watchlist_adds_count, recent_updates_30d, last_activity_at)
 * - players has full_name, has_video, verified_metrics, pitch_velo, exit_velo, sixty_time
 */
export async function getTrendingRecruitsForCollegeCoach(): Promise<TrendingPlayer[]> {
  const supabase = createClient();

  // Single query approach: rely on player_engagement + players metrics
  const { data, error } = await supabase
    .from('player_engagement')
    .select(`
      player_id,
      recent_views_7d,
      watchlist_adds_count,
      recent_updates_30d,
      last_activity_at,
      players (
        id,
        full_name,
        grad_year,
        primary_position,
        secondary_position,
        high_school_state,
        avatar_url,
        pitch_velo,
        exit_velo,
        sixty_time,
        has_video,
        verified_metrics,
        onboarding_completed
      )
    `)
    .order('recent_views_7d', { ascending: false })
    .limit(100);

  if (error || !data) {
    console.error('Error fetching trending players:', error);
    return [];
  }

  const trendingPlayers: TrendingPlayer[] = data
    .map((row: any) => {
      const p = row.players;
      if (!p || !p.onboarding_completed) return null;
      const recentViews = row.recent_views_7d || 0;
      const watchlistAdds = row.watchlist_adds_count || 0;
      const recentUpdates = row.recent_updates_30d || 0;
      const daysSinceActivity = row.last_activity_at
        ? Math.max(0, 14 - Math.floor((Date.now() - new Date(row.last_activity_at).getTime()) / (1000 * 60 * 60 * 24)))
        : 0;

      const trendingScore =
        recentViews * 1.5 +
        watchlistAdds * 3 +
        recentUpdates * 2 +
        daysSinceActivity * 2 +
        (p.has_video ? 10 : 0);

      return {
        id: p.id,
        full_name: p.full_name,
        grad_year: p.grad_year,
        primary_position: p.primary_position,
        secondary_position: p.secondary_position,
        high_school_state: p.high_school_state,
        avatar_url: p.avatar_url,
        pitch_velo: p.pitch_velo,
        exit_velo: p.exit_velo,
        sixty_time: p.sixty_time,
        trending_score: trendingScore,
        has_video: !!p.has_video,
        verified_metrics: !!p.verified_metrics,
      } as TrendingPlayer;
    })
    .filter((p): p is TrendingPlayer => Boolean(p))
    .sort((a, b) => (b?.trending_score || 0) - (a?.trending_score || 0))
    .slice(0, 20);

  return trendingPlayers;
}

/**
 * Get program needs for a coach
 */
export async function getProgramNeedsForCoach(coachId: string): Promise<ProgramNeeds | null> {
  const supabase = createClient();
  
  // Query program_needs table (new structure)
  const { data: needs, error } = await supabase
    .from('program_needs')
    .select('*')
    .eq('coach_id', coachId)
    .maybeSingle();

  if (needs && !error) {
    return {
      id: needs.id,
      coach_id: needs.coach_id,
      grad_years_needed: needs.grad_years_needed || [],
      positions_needed: needs.positions_needed || [],
      min_height_inches: needs.min_height || null,
      max_height_inches: needs.max_height || null,
      min_pitch_velo: needs.min_pitch_velo || null,
      min_exit_velo: needs.min_exit_velo || null,
      max_sixty_time: needs.max_sixty_time || null,
      preferred_states: needs.preferred_states || [],
    };
  }

  // Fallback: Get from coaches.recruiting_needs (legacy)
  const { data: coach } = await supabase
    .from('coaches')
    .select('id, recruiting_needs')
    .eq('id', coachId)
    .single();

  if (!coach) return null;

  return {
    coach_id: coachId,
    grad_years_needed: [2025, 2026, 2027],
    positions_needed: coach.recruiting_needs || [],
    min_height_inches: null,
    max_height_inches: null,
    min_pitch_velo: null,
    min_exit_velo: null,
    max_sixty_time: null,
    preferred_states: [],
  };
}

/**
 * Update program needs for a coach
 */
export async function updateProgramNeedsForCoach(
  coachId: string,
  updates: Partial<ProgramNeeds>
): Promise<boolean> {
  const supabase = createClient();
  
  // Upsert into program_needs table
  const { error } = await supabase
    .from('program_needs')
    .upsert({
      coach_id: coachId,
      positions_needed: updates.positions_needed || [],
      grad_years_needed: updates.grad_years_needed || [],
      min_height: updates.min_height_inches || null,
      max_height: updates.max_height_inches || null,
      min_pitch_velo: updates.min_pitch_velo || null,
      min_exit_velo: updates.min_exit_velo || null,
      max_sixty_time: updates.max_sixty_time || null,
      preferred_states: updates.preferred_states || [],
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'coach_id'
    });

  // Also update legacy coaches.recruiting_needs for backward compatibility
  if (!error && updates.positions_needed) {
    await supabase
      .from('coaches')
      .update({
        recruiting_needs: updates.positions_needed,
      })
      .eq('id', coachId);
  }

  return !error;
}

/**
 * Get AI-style recommendations based on program needs
 */
export async function getRecommendedRecruitsForProgram(coachId: string): Promise<RecruitMatch[]> {
  const supabase = createClient();
  
  const needs = await getProgramNeedsForCoach(coachId);
  if (!needs) return [];

  // Optimized: Build query with database-level filtering
  let query = supabase
    .from('players')
    .select(`
      id,
      first_name,
      last_name,
      full_name,
      grad_year,
      primary_position,
      secondary_position,
      high_school_state,
      height_feet,
      height_inches,
      weight_lbs,
      top_schools,
      avatar_url
    `)
    .not('grad_year', 'is', null)
    .eq('onboarding_completed', true);

  // Filter by grad years
  if (needs.grad_years_needed.length > 0) {
    query = query.in('grad_year', needs.grad_years_needed);
  }

  // Filter by positions
  if (needs.positions_needed.length > 0) {
    query = query.or(
      needs.positions_needed.map(pos => `primary_position.eq.${pos},secondary_position.eq.${pos}`).join(',')
    );
  }

  // Filter by states
  if (needs.preferred_states.length > 0) {
    query = query.in('high_school_state', needs.preferred_states);
  }

  // Limit before fetching to reduce data transfer
  const { data: players, error } = await query.limit(100);

  if (error || !players) {
    console.error('Error fetching recommended players:', error);
    return [];
  }

  // Optimized: Fetch metrics for all players in one query
  const playerIds = players.map(p => p.id);
  const { data: metrics } = await supabase
    .from('player_metrics')
    .select('player_id, metric_label, metric_value')
    .in('player_id', playerIds);

  // Fetch coach data once (used for top schools check)
  const { data: coachData } = await supabase
    .from('coaches')
    .select('program_name, school_name')
    .eq('id', coachId)
    .single();
  
  const coachSchoolName = coachData?.program_name || coachData?.school_name;

  // Calculate match scores
  const matches: RecruitMatch[] = players.map((player) => {
    const playerMetrics = metrics?.filter(m => m.player_id === player.id) || [];
    
    const pitchVelo = parseFloat(
      playerMetrics.find(m => m.metric_label.toLowerCase().includes('velocity') || m.metric_label.toLowerCase().includes('velo'))?.metric_value || '0'
    );
    const exitVelo = parseFloat(
      playerMetrics.find(m => m.metric_label.toLowerCase().includes('exit'))?.metric_value || '0'
    );
    const sixtyTime = parseFloat(
      playerMetrics.find(m => m.metric_label.toLowerCase().includes('60') || m.metric_label.toLowerCase().includes('sixty'))?.metric_value || '0'
    );

    let matchScore = 0;
    const matchReasons: string[] = [];

    // Position match
    if (needs.positions_needed.includes(player.primary_position)) {
      matchScore += 30;
      matchReasons.push(`${player.primary_position}`);
    } else if (player.secondary_position && needs.positions_needed.includes(player.secondary_position)) {
      matchScore += 15;
      matchReasons.push(`${player.secondary_position} (secondary)`);
    }

    // State match
    if (needs.preferred_states.includes(player.high_school_state)) {
      matchScore += 20;
      matchReasons.push('Preferred region');
    }

    // Metrics match
    if (needs.min_pitch_velo && pitchVelo >= needs.min_pitch_velo) {
      matchScore += 20;
      matchReasons.push(`${pitchVelo}mph FB`);
    }
    if (needs.min_exit_velo && exitVelo >= needs.min_exit_velo) {
      matchScore += 15;
      matchReasons.push(`${exitVelo}mph exit velo`);
    }
    if (needs.max_sixty_time && sixtyTime > 0 && sixtyTime <= needs.max_sixty_time) {
      matchScore += 10;
      matchReasons.push(`${sixtyTime}s 60-yard`);
    }

    // Height match
    const totalHeight = (player.height_feet || 0) * 12 + (player.height_inches || 0);
    if (needs.min_height_inches && totalHeight >= needs.min_height_inches) {
      matchScore += 5;
    }
    if (needs.max_height_inches && totalHeight <= needs.max_height_inches) {
      matchScore += 5;
    }

    // Top schools bonus (if coach's school is in player's top schools)
    if (player.top_schools && player.top_schools.length > 0) {
      if (coachSchoolName) {
        // Check if coach's school is in player's top schools
        const isInterested = player.top_schools.some((school: string) => 
          school.toLowerCase().includes(coachSchoolName.toLowerCase()) ||
          coachSchoolName.toLowerCase().includes(school.toLowerCase())
        );
        
        if (isInterested) {
          matchScore += 10; // Higher bonus for explicit interest
          matchReasons.push('Interested in your program');
        } else {
          matchScore += 5; // Still bonus for having top schools listed
        }
      } else {
        matchScore += 5;
        matchReasons.push('Has top schools listed');
      }
    }

    return {
      id: player.id,
      full_name: `${player.first_name || ''} ${player.last_name || ''}`.trim(),
      grad_year: player.grad_year || 2026,
      primary_position: player.primary_position || 'Unknown',
      secondary_position: player.secondary_position,
      high_school_state: player.high_school_state || 'Unknown',
      avatar_url: player.avatar_url || null,
      height_feet: player.height_feet,
      height_inches: player.height_inches,
      weight_lbs: player.weight_lbs,
      pitch_velo: pitchVelo || null,
      exit_velo: exitVelo || null,
      sixty_time: sixtyTime || null,
      match_score: Math.min(100, matchScore),
      match_reasons: matchReasons,
      top_schools: player.top_schools,
    };
  });

  // Sort by match score and return top 20
  return matches
    .sort((a, b) => b.match_score - a.match_score)
    .slice(0, 20);
}

/**
 * Get recruiting pipeline for a coach
 */
export async function getRecruitingPipelineForCoach(coachId: string): Promise<RecruitPipelineEntry[]> {
  const supabase = createClient();
  
  // Use recruit_watchlist table (new structure) with fallback to recruits
  let { data: watchlistEntries, error: watchlistError } = await supabase
    .from('recruit_watchlist')
    .select(`
      id,
      player_id,
      status,
      position_role,
      notes,
      created_at,
      updated_at,
      players:player_id (
        id,
        first_name,
        last_name,
        full_name,
        grad_year,
        primary_position,
        secondary_position,
        high_school_state,
        avatar_url
      )
    `)
    .eq('coach_id', coachId)
    .order('updated_at', { ascending: false });

  // Fallback to recruits table if recruit_watchlist is empty
  if (watchlistError || !watchlistEntries || watchlistEntries.length === 0) {
    const { data: recruits, error } = await supabase
      .from('recruits')
      .select(`
        id,
        player_id,
        stage,
        notes,
        created_at,
        updated_at,
        players:player_id (
          id,
          first_name,
          last_name,
          full_name,
          grad_year,
          primary_position,
          secondary_position,
          high_school_state,
          avatar_url
        )
      `)
      .eq('coach_id', coachId)
      .order('updated_at', { ascending: false });

    if (error || !recruits) {
      console.error('Error fetching recruiting pipeline:', error);
      return [];
    }

    // Map recruits to watchlist format
    const playerIds = recruits.map(r => r.player_id).filter(Boolean) as string[];
    const { data: metrics } = await supabase
      .from('player_metrics')
      .select('player_id, metric_label, metric_value')
      .in('player_id', playerIds);

    const statusMap: Record<string, RecruitPipelineEntry['status']> = {
      'Watchlist': 'watchlist',
      'Evaluating': 'high_priority',
      'High Priority': 'high_priority',
      'Offered': 'offer_extended',
      'Committed': 'committed',
      'Uninterested': 'uninterested',
    };

    const pipeline: RecruitPipelineEntry[] = recruits
      .filter(r => r.player_id && r.players)
      .map(recruit => {
        const player = recruit.players as any;
        const playerMetrics = metrics?.filter(m => m.player_id === recruit.player_id) || [];
        
        const pitchVelo = parseFloat(
          playerMetrics.find(m => m.metric_label.toLowerCase().includes('velocity') || m.metric_label.toLowerCase().includes('velo'))?.metric_value || '0'
        );
        const exitVelo = parseFloat(
          playerMetrics.find(m => m.metric_label.toLowerCase().includes('exit'))?.metric_value || '0'
        );
        const sixtyTime = parseFloat(
          playerMetrics.find(m => m.metric_label.toLowerCase().includes('60') || m.metric_label.toLowerCase().includes('sixty'))?.metric_value || '0'
        );

        return {
          id: recruit.id,
          player_id: recruit.player_id!,
          status: statusMap[recruit.stage] || 'watchlist',
          position_role: null,
          notes: recruit.notes || null,
          created_at: recruit.created_at,
          updated_at: recruit.updated_at,
          player: {
            id: player.id,
            first_name: player.first_name || '',
            last_name: player.last_name || '',
            full_name: player.full_name || `${player.first_name || ''} ${player.last_name || ''}`.trim(),
            grad_year: player.grad_year || 2026,
            primary_position: player.primary_position || 'Unknown',
            secondary_position: player.secondary_position,
            high_school_state: player.high_school_state || 'Unknown',
            avatar_url: player.avatar_url,
            pitch_velo: pitchVelo || null,
            exit_velo: exitVelo || null,
            sixty_time: sixtyTime || null,
          },
        };
      });

    return pipeline;
  }

  // Use recruit_watchlist data
  const recruits = watchlistEntries;

  // Optimized: Fetch metrics for all players in one query
  const playerIds = recruits.map(r => r.player_id).filter(Boolean) as string[];
  const { data: metrics } = await supabase
    .from('player_metrics')
    .select('player_id, metric_label, metric_value')
    .in('player_id', playerIds);

  // Map to pipeline entries
  const pipeline: RecruitPipelineEntry[] = recruits
    .filter(r => r.player_id && r.players)
    .map(recruit => {
      const player = recruit.players as any;
      const playerMetrics = metrics?.filter(m => m.player_id === recruit.player_id) || [];
      
      const pitchVelo = parseFloat(
        playerMetrics.find(m => m.metric_label.toLowerCase().includes('velocity') || m.metric_label.toLowerCase().includes('velo'))?.metric_value || '0'
      );
      const exitVelo = parseFloat(
        playerMetrics.find(m => m.metric_label.toLowerCase().includes('exit'))?.metric_value || '0'
      );
      const sixtyTime = parseFloat(
        playerMetrics.find(m => m.metric_label.toLowerCase().includes('60') || m.metric_label.toLowerCase().includes('sixty'))?.metric_value || '0'
      );

      return {
        id: recruit.id,
        player_id: recruit.player_id!,
        status: (recruit.status as RecruitPipelineEntry['status']) || 'watchlist',
        position_role: recruit.position_role || null,
        notes: recruit.notes || null,
        created_at: recruit.created_at,
        updated_at: recruit.updated_at,
        player: {
          id: player.id,
          first_name: player.first_name || '',
          last_name: player.last_name || '',
          full_name: player.full_name || `${player.first_name || ''} ${player.last_name || ''}`.trim(),
          grad_year: player.grad_year || 2026,
          primary_position: player.primary_position || 'Unknown',
          secondary_position: player.secondary_position,
          high_school_state: player.high_school_state || 'Unknown',
          avatar_url: player.avatar_url,
          pitch_velo: pitchVelo || null,
          exit_velo: exitVelo || null,
          sixty_time: sixtyTime || null,
        },
      };
    });

  return pipeline;
}

/**
 * Update recruit status
 */
export async function updateRecruitStatus(
  entryId: string,
  newStatus: RecruitPipelineEntry['status']
): Promise<boolean> {
  const supabase = createClient();
  
  // Try recruit_watchlist first
  let { error } = await supabase
    .from('recruit_watchlist')
    .update({
      status: newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('id', entryId);

  // If not found, try recruits table (legacy)
  if (error) {
    const stageMap: Record<RecruitPipelineEntry['status'], string> = {
      'watchlist': 'Watchlist',
      'high_priority': 'High Priority',
      'offer_extended': 'Offered',
      'committed': 'Committed',
      'uninterested': 'Uninterested',
    };

    const { error: legacyError } = await supabase
      .from('recruits')
      .update({
        stage: stageMap[newStatus],
        updated_at: new Date().toISOString(),
      })
      .eq('id', entryId);

    return !legacyError;
  }

  return !error;
}

/**
 * Add player to watchlist
 */
export async function addPlayerToWatchlist(
  coachId: string,
  playerId: string,
  status: RecruitPipelineEntry['status'] = 'watchlist'
): Promise<boolean> {
  const supabase = createClient();
  
  // Check if already exists in recruit_watchlist
  const { data: existing } = await supabase
    .from('recruit_watchlist')
    .select('id')
    .eq('coach_id', coachId)
    .eq('player_id', playerId)
    .maybeSingle();

  if (existing) {
    // Update status
    return updateRecruitStatus(existing.id, status);
  }

  // Check legacy recruits table
  const { data: legacyExisting } = await supabase
    .from('recruits')
    .select('id')
    .eq('coach_id', coachId)
    .eq('player_id', playerId)
    .maybeSingle();

  if (legacyExisting) {
    // Migrate to recruit_watchlist
    const stageMap: Record<string, RecruitPipelineEntry['status']> = {
      'Watchlist': 'watchlist',
      'Evaluating': 'high_priority',
      'High Priority': 'high_priority',
      'Offered': 'offer_extended',
      'Committed': 'committed',
      'Uninterested': 'uninterested',
    };
    
    const { data: legacyRecruit } = await supabase
      .from('recruits')
      .select('stage, notes')
      .eq('id', legacyExisting.id)
      .single();

    const newStatus = legacyRecruit ? (stageMap[legacyRecruit.stage] || status) : status;

    // Create in recruit_watchlist
    const { error: insertError } = await supabase
      .from('recruit_watchlist')
      .insert({
        coach_id: coachId,
        player_id: playerId,
        status: newStatus,
        notes: legacyRecruit?.notes || null,
      });

    return !insertError;
  }

  // Create new entry in recruit_watchlist
  const { error } = await supabase
    .from('recruit_watchlist')
    .insert({
      coach_id: coachId,
      player_id: playerId,
      status: status,
    });

  // Also create in legacy recruits table for backward compatibility
  if (!error) {
    const { data: player } = await supabase
      .from('players')
      .select('first_name, last_name, grad_year, primary_position, high_school_name, high_school_state')
      .eq('id', playerId)
      .single();

    if (player) {
      const stageMap: Record<RecruitPipelineEntry['status'], string> = {
        'watchlist': 'Watchlist',
        'high_priority': 'High Priority',
        'offer_extended': 'Offered',
        'committed': 'Committed',
        'uninterested': 'Uninterested',
      };

      await supabase
        .from('recruits')
        .insert({
          coach_id: coachId,
          player_id: playerId,
          name: `${player.first_name || ''} ${player.last_name || ''}`.trim(),
          grad_year: player.grad_year?.toString() || null,
          primary_position: player.primary_position || null,
          high_school_name: player.high_school_name || null,
          high_school_state: player.high_school_state || null,
          stage: stageMap[status],
          priority: status === 'high_priority' ? 'A' : status === 'offer_extended' ? 'A' : 'B',
        });
    }
  }

  return !error;
}

/**
 * Add or update notes for a player in the watchlist
 */
export async function addNoteToPlayer(
  coachId: string,
  playerId: string,
  note: string
): Promise<boolean> {
  const supabase = createClient();
  
  // Check if entry exists in recruit_watchlist
  const { data: existing } = await supabase
    .from('recruit_watchlist')
    .select('id, notes')
    .eq('coach_id', coachId)
    .eq('player_id', playerId)
    .maybeSingle();

  if (existing) {
    // Update existing notes (append new note with timestamp)
    const timestamp = new Date().toLocaleString();
    const updatedNotes = existing.notes 
      ? `${existing.notes}\n\n[${timestamp}] ${note}`
      : `[${timestamp}] ${note}`;
    
    const { error } = await supabase
      .from('recruit_watchlist')
      .update({
        notes: updatedNotes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id);

    if (!error) return true;
  }

  // If not in watchlist, add to watchlist with note
  const { error: insertError } = await supabase
    .from('recruit_watchlist')
    .insert({
      coach_id: coachId,
      player_id: playerId,
      status: 'watchlist',
      notes: `[${new Date().toLocaleString()}] ${note}`,
    });

  // Also update legacy recruits table if exists
  if (!insertError) {
    const { data: legacyExisting } = await supabase
      .from('recruits')
      .select('id, notes')
      .eq('coach_id', coachId)
      .eq('player_id', playerId)
      .maybeSingle();

    if (legacyExisting) {
      const timestamp = new Date().toLocaleString();
      const updatedNotes = legacyExisting.notes 
        ? `${legacyExisting.notes}\n\n[${timestamp}] ${note}`
        : `[${timestamp}] ${note}`;
      
      await supabase
        .from('recruits')
        .update({
          notes: updatedNotes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', legacyExisting.id);
    }
  }

  return !insertError;
}

/**
 * Remove a player from the coach's watchlist/pipeline entirely
 */
export async function removePlayerFromWatchlist(
  coachId: string,
  playerId: string
): Promise<boolean> {
  const supabase = createClient();
  
  // Remove from recruit_watchlist
  const { error: watchlistError } = await supabase
    .from('recruit_watchlist')
    .delete()
    .eq('coach_id', coachId)
    .eq('player_id', playerId);

  // Also remove from legacy recruits table
  const { error: recruitsError } = await supabase
    .from('recruits')
    .delete()
    .eq('coach_id', coachId)
    .eq('player_id', playerId);

  return !watchlistError && !recruitsError;
}

// ============================================================================
// State-Based Queries for Discover Page
// ============================================================================

export interface RecruitFilters {
  positions?: string[];
  gradYears?: number[];
  bats?: string | null;
  throws?: string | null;
  minHeight?: number | null;
  maxHeight?: number | null;
  minWeight?: number | null;
  maxWeight?: number | null;
  minPitchVelo?: number | null;
  minExitVelo?: number | null;
  maxSixtyTime?: number | null;
  hasVideo?: boolean;
  verifiedOnly?: boolean;
}

export interface StatePlayerSummary {
  id: string;
  name: string;
  avatarUrl: string | null;
  gradYear: number;
  state: string;
  primaryPosition: string;
  secondaryPosition: string | null;
  height: string | null;
  weight: number | null;
  metrics: string[];
  verified: boolean;
  trending: boolean;
  topSchool: string | null;
}

/**
 * Get recruits by state with optional filters
 */
export async function getRecruitsByState(
  stateCode: string,
  filters: RecruitFilters = {}
): Promise<StatePlayerSummary[]> {
  const supabase = createClient();

  let query = supabase
    .from('players')
    .select(`
      id,
      first_name,
      last_name,
      full_name,
      avatar_url,
      grad_year,
      high_school_state,
      primary_position,
      secondary_position,
      height_feet,
      height_inches,
      weight_lbs,
      top_schools,
      onboarding_completed
    `)
    .eq('high_school_state', stateCode)
    .eq('onboarding_completed', true);

  // Apply filters
  if (filters.gradYears && filters.gradYears.length > 0) {
    query = query.in('grad_year', filters.gradYears);
  }

  if (filters.positions && filters.positions.length > 0) {
    query = query.or(
      filters.positions.map(pos => `primary_position.eq.${pos},secondary_position.eq.${pos}`).join(',')
    );
  }

  if (filters.bats) {
    query = query.eq('bats', filters.bats);
  }

  if (filters.throws) {
    query = query.eq('throws', filters.throws);
  }

  const { data: players, error } = await query.limit(100);

  if (error || !players) {
    console.error('Error fetching recruits by state:', error);
    return [];
  }

  // Fetch metrics for all players
  const playerIds = players.map(p => p.id);
  const { data: metrics } = await supabase
    .from('player_metrics')
    .select('player_id, metric_label, metric_value, verified_date')
    .in('player_id', playerIds);

  // Fetch engagement data for trending status
  const { data: engagement } = await supabase
    .from('player_engagement')
    .select('player_id, recent_views_7d')
    .in('player_id', playerIds);

  return players.map(player => {
    const playerMetrics = metrics?.filter(m => m.player_id === player.id) || [];
    const playerEngagement = engagement?.find(e => e.player_id === player.id);
    
    const metricStrings: string[] = [];
    let hasVerified = false;

    playerMetrics.forEach(m => {
      metricStrings.push(`${m.metric_label}: ${m.metric_value}`);
      if (m.verified_date) hasVerified = true;
    });

    const heightStr = player.height_feet && player.height_inches !== null
      ? `${player.height_feet}'${player.height_inches}"`
      : null;

    return {
      id: player.id,
      name: player.full_name || `${player.first_name || ''} ${player.last_name || ''}`.trim(),
      avatarUrl: player.avatar_url,
      gradYear: player.grad_year || 2026,
      state: player.high_school_state || stateCode,
      primaryPosition: player.primary_position || 'Unknown',
      secondaryPosition: player.secondary_position,
      height: heightStr,
      weight: player.weight_lbs,
      metrics: metricStrings.slice(0, 5),
      verified: hasVerified,
      trending: (playerEngagement?.recent_views_7d || 0) > 10,
      topSchool: player.top_schools?.[0] || null,
    };
  });
}

/**
 * Get state recruit counts for map display
 */
export async function getStateRecruitCounts(): Promise<Record<string, { total: number; byYear: Record<number, number> }>> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('players')
    .select('high_school_state, grad_year')
    .eq('onboarding_completed', true)
    .not('high_school_state', 'is', null);

  if (error || !data) {
    console.error('Error fetching state counts:', error);
    return {};
  }

  const counts: Record<string, { total: number; byYear: Record<number, number> }> = {};

  data.forEach(player => {
    const state = player.high_school_state;
    if (!state) return;

    if (!counts[state]) {
      counts[state] = { total: 0, byYear: {} };
    }

    counts[state].total++;

    if (player.grad_year) {
      counts[state].byYear[player.grad_year] = (counts[state].byYear[player.grad_year] || 0) + 1;
    }
  });

  return counts;
}
