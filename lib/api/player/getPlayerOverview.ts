import { createClient } from '@/lib/supabase/client';
import type { Evaluation } from '@/types/evaluation';
import type { Player } from '@/types/player';
import type { PlayerStatLine } from '@/types/stats';
import type { Organization } from '@/types/organization';

export interface PlayerOverviewData {
  player: Player;
  highSchoolOrg: Organization | null;
  recentStats: PlayerStatLine[];
  recentEvaluations: Evaluation[];
}

export async function getPlayerOverview(player: Player): Promise<PlayerOverviewData> {
  const supabase = createClient();

  // Get high school organization if player has one
  let highSchoolOrg: Organization | null = null;
  if (player.high_school_org_id) {
    const { data: orgData } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', player.high_school_org_id)
      .maybeSingle();
    
    if (orgData) {
      highSchoolOrg = orgData as Organization;
    }
  }

  // Fallback: Create org from player's high school info
  if (!highSchoolOrg && player.high_school_name) {
    highSchoolOrg = {
      id: 'hs-' + player.id,
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

  // Get recent stats (last 5 games)
  const { data: statsData } = await supabase
    .from('player_stats')
    .select(`
      *,
      event:events(name, start_time, type)
    `)
    .eq('player_id', player.id)
    .order('created_at', { ascending: false })
    .limit(5);

  const recentStats: PlayerStatLine[] = (statsData || []).map(s => ({
    ...s,
    event: s.event ? {
      name: s.event.name,
      start_time: s.event.start_time,
      type: s.event.type,
    } : null,
  }));

  // Get recent evaluations (last 60 days)
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
  
  const { data: evalData } = await supabase
    .from('evaluations')
    .select(`
      *,
      event:events(name, start_time)
    `)
    .eq('player_id', player.id)
    .gte('created_at', sixtyDaysAgo.toISOString())
    .order('created_at', { ascending: false })
    .limit(5);

  const recentEvaluations: Evaluation[] = (evalData || []).map(e => ({
    ...e,
    tags: e.tags || [],
    event: e.event ? {
      name: e.event.name,
      start_time: e.event.start_time,
    } : null,
  }));

  return {
    player,
    highSchoolOrg,
    recentStats,
    recentEvaluations,
  };
}
