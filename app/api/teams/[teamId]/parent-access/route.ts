import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Get parent access for a team
 * GET /api/teams/[teamId]/parent-access
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

    // Verify coach owns this team
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('coach_id, parent_access_enabled')
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

    // Get all parent access records for this team
    const { data: parentAccess, error: accessError } = await supabase
      .from('parent_access')
      .select(`
        *,
        parent:parent_id (
          id,
          full_name,
          email
        ),
        player:player_id (
          id,
          full_name,
          grad_year
        )
      `)
      .eq('team_id', teamId);

    if (accessError) {
      return NextResponse.json(
        { error: 'Failed to fetch parent access' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      parent_access_enabled: team.parent_access_enabled,
      parents: parentAccess || [],
    });
  } catch (error) {
    console.error('Error fetching parent access:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Toggle parent access for team
 * PUT /api/teams/[teamId]/parent-access
 */

const inputSchema = z.object({
  // Add your validation rules here
  // Example: name: z.string().min(1).max(100)
});

export async function PUT(
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
    const { enabled } = body;

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

    // Update parent access setting
    const { error: updateError } = await supabase
      .from('teams')
      .update({ parent_access_enabled: enabled })
      .eq('id', teamId);

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update parent access' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, parent_access_enabled: enabled });
  } catch (error) {
    console.error('Error updating parent access:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


