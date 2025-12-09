import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Get event attendance
 * GET /api/events/[eventId]/attendance
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const eventId = params.eventId;

    // Get event and team info
    const { data: event, error: eventError } = await supabase
      .from('team_schedule')
      .select('*, teams(coach_id)')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Get all team members
    const { data: memberships, error: membersError } = await supabase
      .from('team_memberships')
      .select(`
        *,
        player:player_id (
          id,
          full_name,
          avatar_url
        )
      `)
      .eq('team_id', event.team_id)
      .eq('status', 'active');

    if (membersError) {
      return NextResponse.json(
        { error: 'Failed to fetch team members' },
        { status: 500 }
      );
    }

    // Get attendance records
    const { data: attendance, error: attendanceError } = await supabase
      .from('event_attendance')
      .select('*')
      .eq('event_id', eventId);

    if (attendanceError) {
      return NextResponse.json(
        { error: 'Failed to fetch attendance' },
        { status: 500 }
      );
    }

    // Merge members with attendance
    const attendanceMap = new Map(
      attendance?.map((a: any) => [a.player_id, a]) || []
    );

    const membersWithAttendance = memberships?.map((member: any) => ({
      ...member,
      attendance: attendanceMap.get(member.player_id) || {
        status: 'not_marked',
        notes: null,
      },
    }));

    return NextResponse.json({
      event,
      attendance: membersWithAttendance || [],
    });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Record attendance
 * POST /api/events/[eventId]/attendance
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const eventId = params.eventId;
    const body = await request.json();
    const { player_id, status, notes } = body;

    // Get event and verify coach owns team
    const { data: event, error: eventError } = await supabase
      .from('team_schedule')
      .select('*, teams(coach_id)')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Get coach ID
    const { data: coach } = await supabase
      .from('coaches')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!coach || coach.id !== event.teams?.coach_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get user's profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Upsert attendance
    const { error: upsertError } = await supabase
      .from('event_attendance')
      .upsert(
        {
          event_id: eventId,
          player_id,
          status,
          notes,
          marked_by: profile.id,
          marked_at: new Date().toISOString(),
        },
        {
          onConflict: 'event_id,player_id',
        }
      );

    if (upsertError) {
      return NextResponse.json(
        { error: 'Failed to record attendance' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error recording attendance:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

