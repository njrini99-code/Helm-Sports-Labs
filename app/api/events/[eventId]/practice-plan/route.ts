import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Get practice plan for event
 * GET /api/events/[eventId]/practice-plan
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const supabase = await createClient();
    const { eventId } = await params;

    const { data: plan, error: planError } = await supabase
      .from('practice_plans')
      .select('*')
      .eq('event_id', eventId)
      .maybeSingle();

    if (planError) {
      return NextResponse.json(
        { error: 'Failed to fetch practice plan' },
        { status: 500 }
      );
    }

    return NextResponse.json({ plan: plan || null });
  } catch (error) {
    console.error('Error fetching practice plan:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Create/update practice plan
 * POST /api/events/[eventId]/practice-plan
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { eventId } = await params;
    const body = await request.json();
    const { plan_content, plan_pdf_url } = body;

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

    // Check if plan exists
    const { data: existingPlan } = await supabase
      .from('practice_plans')
      .select('id')
      .eq('event_id', eventId)
      .maybeSingle();

    if (existingPlan) {
      // Update existing plan
      const { error: updateError } = await supabase
        .from('practice_plans')
        .update({
          plan_content,
          plan_pdf_url,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingPlan.id);

      if (updateError) {
        return NextResponse.json(
          { error: 'Failed to update practice plan' },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true });
    } else {
      // Create new plan
      const { error: createError } = await supabase
        .from('practice_plans')
        .insert({
          event_id: eventId,
          plan_content,
          plan_pdf_url,
          created_by: coach.id,
        });

      if (createError) {
        return NextResponse.json(
          { error: 'Failed to create practice plan' },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true });
    }
  } catch (error) {
    console.error('Error saving practice plan:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

