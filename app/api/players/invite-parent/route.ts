import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { randomBytes } from 'crypto';
import { sendEmail } from '@/lib/emails/sendEmail';
import { getParentInvitationEmail } from '@/lib/emails/templates';
import { z } from 'zod';

/**
 * Player invites a parent
 * POST /api/players/invite-parent
 */

const inviteParentInputSchema = z.object({
  parentEmail: z.string().email('Invalid email address'),
  relationship: z.enum(['parent', 'guardian', 'family']).default('parent'),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate input
    const validationResult = inviteParentInputSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.errors },
        { status: 400 }
      );
    }
    
    const { parentEmail, relationship } = validationResult.data;

    if (!parentEmail) {
      return NextResponse.json(
        { error: 'Parent email is required' },
        { status: 400 }
      );
    }

    // Get player profile
    const { data: player, error: playerError } = await supabase
      .from('players')
      .select('id, first_name, last_name, full_name')
      .eq('user_id', user.id)
      .single();

    if (playerError || !player) {
      return NextResponse.json(
        { error: 'Player profile not found' },
        { status: 404 }
      );
    }

    // Get player's team
    const { data: membership } = await supabase
      .from('team_memberships')
      .select('team_id, teams(*)')
      .eq('player_id', player.id)
      .eq('status', 'active')
      .maybeSingle();

    if (!membership) {
      return NextResponse.json(
        { error: 'Player is not on a team' },
        { status: 400 }
      );
    }

    const teamId = membership.team_id;
    const team = Array.isArray(membership.teams) ? membership.teams[0] : membership.teams;

    // Check if team allows parent access
    if (team && !(team as any).parent_access_enabled) {
      return NextResponse.json(
        { error: 'Parent access is disabled for this team' },
        { status: 403 }
      );
    }

    // Check if parent profile exists
    let parentProfile;
    const { data: existingParent } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', parentEmail)
      .maybeSingle();

    if (existingParent) {
      parentProfile = existingParent;
    } else {
      // Create parent profile (they'll complete signup via invite link)
      const { data: newParent, error: createError } = await supabase
        .from('profiles')
        .insert({
          email: parentEmail,
          role: 'parent',
          full_name: null, // Will be set during signup
        })
        .select()
        .single();

      if (createError || !newParent) {
        return NextResponse.json(
          { error: 'Failed to create parent profile' },
          { status: 500 }
        );
      }

      parentProfile = newParent;
    }

    // Check if access already exists
    const { data: existingAccess } = await supabase
      .from('parent_access')
      .select('id')
      .eq('parent_id', parentProfile.id)
      .eq('player_id', player.id)
      .eq('team_id', teamId)
      .maybeSingle();

    if (existingAccess) {
      return NextResponse.json(
        { error: 'Parent already has access' },
        { status: 400 }
      );
    }

    // Create parent access
    const { data: access, error: accessError } = await supabase
      .from('parent_access')
      .insert({
        parent_id: parentProfile.id,
        player_id: player.id,
        team_id: teamId,
        relationship,
      })
      .select()
      .single();

    if (accessError || !access) {
      return NextResponse.json(
        { error: 'Failed to grant parent access' },
        { status: 500 }
      );
    }

    // Generate invitation token for signup link
    const invitationToken = randomBytes(32).toString('hex');
    const invitationLink = `${process.env.NEXT_PUBLIC_APP_URL || 'https://helm-sports-labs.app'}/auth/signup?token=${invitationToken}&email=${encodeURIComponent(parentEmail)}&role=parent`;

    // Store invitation token (optional - for tracking)
    await supabase
      .from('parent_access')
      .update({ invitation_token: invitationToken })
      .eq('id', access.id);

    // Send invitation email
    const playerName = player.full_name || `${player.first_name || ''} ${player.last_name || ''}`.trim() || 'Your child';
    const teamName = team ? (team as any).name : undefined;
    
    const { subject, html } = getParentInvitationEmail({
      playerName,
      teamName,
      invitationLink,
      relationship,
    });

    await sendEmail({
      to: parentEmail,
      subject,
      html,
    });

    return NextResponse.json({
      success: true,
      message: 'Parent invitation sent',
    });
  } catch (error) {
    console.error('Error inviting parent:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

