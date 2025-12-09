import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Verify stats
 * POST /api/stats/[statId]/verify
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { statId: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const statId = params.statId;

    // Get stat and verify coach owns the team
    const { data: stat, error: statError } = await supabase
      .from('player_stats')
      .select('*, teams(coach_id)')
      .eq('id', statId)
      .single();

    if (statError || !stat) {
      return NextResponse.json({ error: 'Stat not found' }, { status: 404 });
    }

    // Get coach ID
    const { data: coach } = await supabase
      .from('coaches')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!coach || coach.id !== stat.teams?.coach_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update stat as verified
    const { error: updateError } = await supabase
      .from('player_stats')
      .update({
        verified: true,
        verified_by: coach.id,
        verified_at: new Date().toISOString(),
      })
      .eq('id', statId);

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to verify stat' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error verifying stat:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

