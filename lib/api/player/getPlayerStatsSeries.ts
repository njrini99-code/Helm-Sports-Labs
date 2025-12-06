import { createClient } from '@/lib/supabase/client';
import type { PlayerStatLine } from '@/types/stats';

export type PerformanceFilters = {
  source: 'all' | 'high_school' | 'showcase';
  dateRange: { from: Date | null; to: Date | null; preset?: '7d' | '30d' | 'season' };
  level?: string;
  gameType?: string;
};

export interface PlayerStatsSummary {
  gamesPlayed: number;
  // Baseball hitting
  battingAvg: number;
  hitsPerGame: number;
  rbisPerGame: number;
  homeRuns: number;
  // Baseball pitching (if applicable)
  era: number;
  strikeoutsPerGame: number;
  // Legacy basketball support
  pointsPerGame: number;
  reboundsPerGame: number;
  assistsPerGame: number;
  fgPct: number;
  threePct: number;
  ftPct: number;
}

export type PlayerGameSeriesPoint = {
  date: string;
  // Baseball
  hits?: number;
  atBats?: number;
  battingAvg?: number;
  // Basketball
  points?: number;
  fgPct?: number;
  threePct?: number;
  ftPct?: number;
};

export interface PlayerStatsResponse {
  games: PlayerStatLine[];
  summary: PlayerStatsSummary | null;
  series: PlayerGameSeriesPoint[];
}

function getDateRange(preset?: '7d' | '30d' | 'season'): { from: Date; to: Date } {
  const to = new Date();
  const from = new Date();
  
  switch (preset) {
    case '7d':
      from.setDate(from.getDate() - 7);
      break;
    case '30d':
      from.setDate(from.getDate() - 30);
      break;
    case 'season':
    default:
      from.setMonth(from.getMonth() - 6); // Last 6 months as "season"
      break;
  }
  
  return { from, to };
}

export async function getPlayerStatsSeries(
  playerId: string,
  filters: PerformanceFilters
): Promise<PlayerStatsResponse> {
  const supabase = createClient();

  // Determine date range
  const range = filters.dateRange.from && filters.dateRange.to
    ? { from: filters.dateRange.from, to: filters.dateRange.to }
    : getDateRange(filters.dateRange.preset);

  // Build query
  let query = supabase
    .from('player_stats')
    .select(`
      *,
      event:events(
        name,
        start_time,
        type,
        level,
        organization:organizations(type)
      )
    `)
    .eq('player_id', playerId)
    .gte('created_at', range.from.toISOString())
    .lte('created_at', range.to.toISOString())
    .order('created_at', { ascending: true });

  const { data: statsData, error } = await query;

  if (error || !statsData) {
    return { games: [], summary: null, series: [] };
  }

  // Filter by source type (high_school vs showcase)
  let filteredStats = statsData;
  if (filters.source !== 'all') {
    filteredStats = statsData.filter(s => {
      const orgType = s.event?.organization?.type;
      if (filters.source === 'high_school') {
        return orgType === 'high_school';
      }
      return orgType === 'showcase_org' || orgType === 'travel_ball';
    });
  }

  // Filter by level
  if (filters.level) {
    filteredStats = filteredStats.filter(s => s.event?.level === filters.level);
  }

  // Filter by game type
  if (filters.gameType) {
    filteredStats = filteredStats.filter(s => s.event?.type === filters.gameType);
  }

  const games: PlayerStatLine[] = filteredStats.map(s => ({
    ...s,
    event: s.event ? {
      name: s.event.name,
      start_time: s.event.start_time,
      type: s.event.type,
    } : null,
  }));

  // Calculate summary
  const gamesPlayed = games.length;
  if (gamesPlayed === 0) {
    return { games, summary: null, series: [] };
  }

  // Baseball stats
  const totalAtBats = games.reduce((sum, g) => sum + (g.at_bats || 0), 0);
  const totalHits = games.reduce((sum, g) => sum + (g.hits || 0), 0);
  const totalRbis = games.reduce((sum, g) => sum + (g.rbis || 0), 0);
  const totalHomeRuns = games.reduce((sum, g) => sum + (g.home_runs || 0), 0);
  const totalInnings = games.reduce((sum, g) => sum + (g.innings_pitched || 0), 0);
  const totalEarnedRuns = games.reduce((sum, g) => sum + (g.earned_runs || 0), 0);
  const totalStrikeouts = games.reduce((sum, g) => sum + (g.strikeouts_pitched || 0), 0);

  // Basketball stats (legacy)
  const totalPoints = games.reduce((sum, g) => sum + (g.points || 0), 0);
  const totalReb = games.reduce((sum, g) => sum + (g.rebounds || 0), 0);
  const totalAst = games.reduce((sum, g) => sum + (g.assists_bb || 0), 0);
  const fgMade = games.reduce((sum, g) => sum + (g.fg_made || 0), 0);
  const fgAtt = games.reduce((sum, g) => sum + (g.fg_attempts || 0), 0);
  const threeMade = games.reduce((sum, g) => sum + (g.three_made || 0), 0);
  const threeAtt = games.reduce((sum, g) => sum + (g.three_attempts || 0), 0);
  const ftMade = games.reduce((sum, g) => sum + (g.ft_made || 0), 0);
  const ftAtt = games.reduce((sum, g) => sum + (g.ft_attempts || 0), 0);

  const summary: PlayerStatsSummary = {
    gamesPlayed,
    // Baseball
    battingAvg: totalAtBats > 0 ? totalHits / totalAtBats : 0,
    hitsPerGame: gamesPlayed > 0 ? totalHits / gamesPlayed : 0,
    rbisPerGame: gamesPlayed > 0 ? totalRbis / gamesPlayed : 0,
    homeRuns: totalHomeRuns,
    era: totalInnings > 0 ? (totalEarnedRuns / totalInnings) * 9 : 0,
    strikeoutsPerGame: gamesPlayed > 0 ? totalStrikeouts / gamesPlayed : 0,
    // Basketball
    pointsPerGame: gamesPlayed > 0 ? totalPoints / gamesPlayed : 0,
    reboundsPerGame: gamesPlayed > 0 ? totalReb / gamesPlayed : 0,
    assistsPerGame: gamesPlayed > 0 ? totalAst / gamesPlayed : 0,
    fgPct: fgAtt > 0 ? (fgMade / fgAtt) * 100 : 0,
    threePct: threeAtt > 0 ? (threeMade / threeAtt) * 100 : 0,
    ftPct: ftAtt > 0 ? (ftMade / ftAtt) * 100 : 0,
  };

  // Build series for charts
  const series: PlayerGameSeriesPoint[] = games.map((g) => ({
    date: g.created_at || g.event?.start_time || '',
    hits: g.hits || 0,
    atBats: g.at_bats || 0,
    battingAvg: g.at_bats && g.at_bats > 0 ? (g.hits || 0) / g.at_bats : 0,
    points: g.points || 0,
    fgPct: g.fg_attempts && g.fg_attempts > 0 ? ((g.fg_made || 0) / g.fg_attempts) * 100 : 0,
    threePct: g.three_attempts && g.three_attempts > 0 ? ((g.three_made || 0) / g.three_attempts) * 100 : 0,
    ftPct: g.ft_attempts && g.ft_attempts > 0 ? ((g.ft_made || 0) / g.ft_attempts) * 100 : 0,
  }));

  return { games, summary, series };
}
