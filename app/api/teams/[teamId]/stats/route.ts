import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Get team stats
 * GET /api/teams/[teamId]/stats
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { teamId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const statType = searchParams.get('type'); // hitting, pitching, fielding
    const playerId = searchParams.get('player_id');
    const gameId = searchParams.get('game_id');

    // Build query
    let query = supabase
      .from('player_stats')
      .select(`
        *,
        player:player_id (
          id,
          full_name,
          primary_position
        ),
        game:game_id (
          id,
          event_name,
          opponent_name,
          start_time
        )
      `)
      .eq('team_id', teamId);

    if (statType) {
      query = query.eq('stat_type', statType);
    }

    if (playerId) {
      query = query.eq('player_id', playerId);
    }

    if (gameId) {
      query = query.eq('game_id', gameId);
    }

    query = query.order('created_at', { ascending: false });

    const { data: stats, error: statsError } = await query;

    if (statsError) {
      return NextResponse.json(
        { error: 'Failed to fetch stats' },
        { status: 500 }
      );
    }

    // Calculate team totals if needed
    if (!playerId && !gameId) {
      const teamTotals = calculateTeamTotals(stats || []);
      return NextResponse.json({
        stats: stats || [],
        team_totals: teamTotals,
      });
    }

    return NextResponse.json({ stats: stats || [] });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Upload/create stats
 * POST /api/teams/[teamId]/stats
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { teamId } = await params;
    const body = await request.json();
    const {
      player_id,
      game_id,
      stat_type,
      stats_data,
      uploaded_via = 'manual',
    } = body;

    // Verify coach owns this team
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('coach_id')
      .eq('id', teamId)
      .single();

    if (teamError || !team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    // Get coach ID
    const { data: coach } = await supabase
      .from('coaches')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!coach || coach.id !== team.coach_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Create stat record
    const { data: stat, error: statError } = await supabase
      .from('player_stats')
      .insert({
        player_id,
        team_id: teamId,
        game_id: game_id || null,
        stat_type,
        stats_data,
        uploaded_via,
        verified: uploaded_via === 'manual', // Manual entries are auto-verified
        verified_by: uploaded_via === 'manual' ? coach.id : null,
        verified_at: uploaded_via === 'manual' ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (statError || !stat) {
      return NextResponse.json(
        { error: 'Failed to create stat' },
        { status: 500 }
      );
    }

    return NextResponse.json({ stat, success: true });
  } catch (error) {
    console.error('Error creating stat:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Calculate team totals from stats
 */
function calculateTeamTotals(stats: any[]) {
  const hittingStats = stats.filter((s) => s.stat_type === 'hitting');
  const pitchingStats = stats.filter((s) => s.stat_type === 'pitching');
  const fieldingStats = stats.filter((s) => s.stat_type === 'fielding');

  // Calculate hitting totals
  let totalAB = 0;
  let totalH = 0;
  let total2B = 0;
  let total3B = 0;
  let totalHR = 0;
  let totalRBI = 0;
  let totalBB = 0;
  let totalK = 0;

  hittingStats.forEach((stat) => {
    const data = stat.stats_data || {};
    totalAB += data.ab || 0;
    totalH += data.h || 0;
    total2B += data['2b'] || 0;
    total3B += data['3b'] || 0;
    totalHR += data.hr || 0;
    totalRBI += data.rbi || 0;
    totalBB += data.bb || 0;
    totalK += data.k || 0;
  });

  const teamBA = totalAB > 0 ? (totalH / totalAB).toFixed(3) : '0.000';
  const teamOBP =
    totalAB + totalBB > 0
      ? ((totalH + totalBB) / (totalAB + totalBB)).toFixed(3)
      : '0.000';

  // Calculate pitching totals
  let totalIP = 0;
  let totalER = 0;
  let totalPitchK = 0;
  let totalPitchBB = 0;

  pitchingStats.forEach((stat) => {
    const data = stat.stats_data || {};
    totalIP += parseFloat(data.ip || 0);
    totalER += data.er || 0;
    totalPitchK += data.k || 0;
    totalPitchBB += data.bb || 0;
  });

  const teamERA = totalIP > 0 ? ((totalER * 9) / totalIP).toFixed(2) : '0.00';

  return {
    hitting: {
      games: new Set(hittingStats.map((s) => s.game_id)).size,
      ab: totalAB,
      h: totalH,
      '2b': total2B,
      '3b': total3B,
      hr: totalHR,
      rbi: totalRBI,
      bb: totalBB,
      k: totalK,
      ba: teamBA,
      obp: teamOBP,
    },
    pitching: {
      games: new Set(pitchingStats.map((s) => s.game_id)).size,
      ip: totalIP.toFixed(1),
      er: totalER,
      k: totalPitchK,
      bb: totalPitchBB,
      era: teamERA,
    },
  };
}

