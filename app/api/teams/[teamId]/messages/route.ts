import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Get team messages
 * GET /api/teams/[teamId]/messages
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
    const messageType = searchParams.get('type') || 'all';

    // Get user's profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Build query
    let query = supabase
      .from('team_messages')
      .select(`
        *,
        sender:sender_id (
          id,
          full_name,
          avatar_url
        )
      `)
      .eq('team_id', teamId)
      .order('created_at', { ascending: false });

    if (messageType !== 'all') {
      query = query.eq('message_type', messageType);
    }

    const { data: messages, error: messagesError } = await query;

    if (messagesError) {
      return NextResponse.json(
        { error: 'Failed to fetch messages' },
        { status: 500 }
      );
    }

    // Get read receipts for each message
    const messageIds = messages?.map((m: any) => m.id) || [];
    const { data: receipts } = await supabase
      .from('message_receipts')
      .select('*')
      .in('message_id', messageIds);

    // Attach receipt info to messages
    const messagesWithReceipts = messages?.map((message: any) => {
      const messageReceipts = receipts?.filter(
        (r: any) => r.message_id === message.id
      ) || [];
      const userReceipt = messageReceipts.find(
        (r: any) => r.user_id === profile.id
      );

      return {
        ...message,
        read_receipt: userReceipt || null,
        total_recipients: message.recipient_ids?.length || 0,
        read_count: messageReceipts.filter((r: any) => r.read_at).length,
      };
    });

    return NextResponse.json({ messages: messagesWithReceipts || [] });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Send team message
 * POST /api/teams/[teamId]/messages
 */

const inputSchema = z.object({
  // Add your validation rules here
  // Example: name: z.string().min(1).max(100)
});

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
      message_type = 'team',
      recipient_ids,
      subject,
      body: messageBody,
      attachments = [],
      priority = 'normal',
      scheduled_for,
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

    // Get user's profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // If team message, get all team member IDs
    let finalRecipientIds = recipient_ids;
    if (message_type === 'team') {
      const { data: memberships } = await supabase
        .from('team_memberships')
        .select('player_id')
        .eq('team_id', teamId)
        .eq('status', 'active');

      finalRecipientIds = memberships?.map((m: any) => m.player_id) || [];

      // If parent messages enabled, include parents
      if ((team as any).parent_access_enabled) {
        const { data: parentAccess } = await supabase
          .from('parent_access')
          .select('parent_id')
          .eq('team_id', teamId);

        const parentIds = parentAccess?.map((p: any) => p.parent_id) || [];
        finalRecipientIds = [...finalRecipientIds, ...parentIds];
      }
    }

    // Create message
    const { data: message, error: messageError } = await supabase
      .from('team_messages')
      .insert({
        team_id: teamId,
        sender_id: profile.id,
        message_type,
        recipient_ids: finalRecipientIds,
        subject,
        body: messageBody,
        attachments,
        priority,
        scheduled_for: scheduled_for || null,
        sent_at: scheduled_for ? null : new Date().toISOString(),
      })
      .select()
      .single();

    if (messageError || !message) {
      return NextResponse.json(
        { error: 'Failed to send message' },
        { status: 500 }
      );
    }

    // Create receipts for all recipients
    if (finalRecipientIds.length > 0) {
      const receipts = finalRecipientIds.map((recipientId: string) => ({
        message_id: message.id,
        user_id: recipientId,
        delivered_at: new Date().toISOString(),
      }));

      await supabase.from('message_receipts').insert(receipts);
    }

    return NextResponse.json({ message, success: true });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

