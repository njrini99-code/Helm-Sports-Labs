import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Join team via invite code
 * POST /api/teams/join/[code]
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const inviteCode = params.code;

    // Find invitation
    const { data: invitation, error: inviteError } = await supabase
      .from('team_invitations')
      .select('*, teams(*)')
      .eq('invite_code', inviteCode)
      .eq('is_active', true)
      .single();

    if (inviteError || !invitation) {
      return NextResponse.json(
        { error: 'Invalid or expired invitation code' },
        { status: 404 }
      );
    }

    // Check expiration
    if (invitation.expires_at && new Date(invitation.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Invitation has expired' },
        { status: 400 }
      );
    }

    // Check max uses
    if (invitation.max_uses && invitation.current_uses >= invitation.max_uses) {
      return NextResponse.json(
        { error: 'Invitation has reached maximum uses' },
        { status: 400 }
      );
    }

    // Get player profile
    const { data: player, error: playerError } = await supabase
      .from('players')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (playerError || !player) {
      return NextResponse.json(
        { error: 'Player profile not found. Please complete your profile first.' },
        { status: 400 }
      );
    }

    // Check if already a member
    const { data: existingMembership } = await supabase
      .from('team_memberships')
      .select('id')
      .eq('team_id', invitation.team_id)
      .eq('player_id', player.id)
      .maybeSingle();

    if (existingMembership) {
      return NextResponse.json(
        { error: 'You are already a member of this team' },
        { status: 400 }
      );
    }

    // Add player to team
    const { error: membershipError } = await supabase
      .from('team_memberships')
      .insert({
        team_id: invitation.team_id,
        player_id: player.id,
        role: 'player',
        status: 'active',
        primary_team: true,
        joined_at: new Date().toISOString(),
      });

    if (membershipError) {
      return NextResponse.json(
        { error: 'Failed to join team' },
        { status: 500 }
      );
    }

    // Increment invitation use count
    await supabase
      .from('team_invitations')
      .update({
        current_uses: (invitation.current_uses || 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', invitation.id);

    return NextResponse.json({
      success: true,
      team_id: invitation.team_id,
      team: invitation.teams,
    });
  } catch (error) {
    console.error('Error joining team:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Get invitation details (for preview page)
 * GET /api/teams/join/[code]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const supabase = await createClient();
    const inviteCode = params.code;

    // Find invitation with team details
    const { data: invitation, error: inviteError } = await supabase
      .from('team_invitations')
      .select(`
        *,
        teams (
          id,
          name,
          team_type,
          logo_url,
          school_name,
          city,
          state
        ),
        coaches:created_by (
          id,
          full_name,
          school_name
        )
      `)
      .eq('invite_code', inviteCode)
      .eq('is_active', true)
      .single();

    if (inviteError || !invitation) {
      return NextResponse.json(
        { error: 'Invalid invitation code' },
        { status: 404 }
      );
    }

    // Check expiration
    if (invitation.expires_at && new Date(invitation.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Invitation has expired' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      invitation: {
        code: inviteCode,
        team: invitation.teams,
        coach: invitation.coaches,
        expires_at: invitation.expires_at,
      },
    });
  } catch (error) {
    console.error('Error fetching invitation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

