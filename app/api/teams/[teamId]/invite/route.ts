import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { randomBytes } from 'crypto';

/**
 * Generate a random invite code
 */
function generateInviteCode(length: number = 12): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars
  const bytes = randomBytes(length);
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return code;
}

/**
 * Generate team invite link
 * POST /api/teams/[teamId]/invite
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { teamId: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const teamId = params.teamId;
    const body = await request.json();
    const { expiresInDays, maxUses } = body;

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

    // Generate unique invite code (check for uniqueness)
    let inviteCode = generateInviteCode(12);
    let attempts = 0;
    while (attempts < 5) {
      const { data: existing } = await supabase
        .from('team_invitations')
        .select('id')
        .eq('invite_code', inviteCode)
        .maybeSingle();
      
      if (!existing) break;
      inviteCode = generateInviteCode(12);
      attempts++;
    }
    const expiresAt = expiresInDays 
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString()
      : null;

    // Create invitation
    const { data: invitation, error: inviteError } = await supabase
      .from('team_invitations')
      .insert({
        team_id: teamId,
        invite_code: inviteCode,
        created_by: coach.id,
        expires_at: expiresAt,
        max_uses: maxUses || null,
        current_uses: 0,
        is_active: true,
      })
      .select()
      .single();

    if (inviteError || !invitation) {
      return NextResponse.json(
        { error: 'Failed to create invitation' },
        { status: 500 }
      );
    }

    // Generate invite link
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const inviteLink = `${baseUrl}/join/${inviteCode}`;

    return NextResponse.json({
      invitation: {
        id: invitation.id,
        invite_code: inviteCode,
        invite_link: inviteLink,
        expires_at: invitation.expires_at,
        max_uses: invitation.max_uses,
        current_uses: invitation.current_uses,
      },
    });
  } catch (error) {
    console.error('Error generating invite:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Get team invitations
 * GET /api/teams/[teamId]/invite
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { teamId: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const teamId = params.teamId;

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

    // Get all active invitations
    const { data: invitations, error: inviteError } = await supabase
      .from('team_invitations')
      .select('*')
      .eq('team_id', teamId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (inviteError) {
      return NextResponse.json(
        { error: 'Failed to fetch invitations' },
        { status: 500 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const invitationsWithLinks = invitations?.map(inv => ({
      ...inv,
      invite_link: `${baseUrl}/join/${inv.invite_code}`,
    })) || [];

    return NextResponse.json({ invitations: invitationsWithLinks });
  } catch (error) {
    console.error('Error fetching invitations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

