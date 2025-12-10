import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Mark message as read
 * PUT /api/messages/[messageId]/read
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { messageId } = await params;

    // Get user's profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Update or create receipt
    const { data: existingReceipt } = await supabase
      .from('message_receipts')
      .select('id')
      .eq('message_id', messageId)
      .eq('user_id', profile.id)
      .maybeSingle();

    if (existingReceipt) {
      // Update existing receipt
      const { error: updateError } = await supabase
        .from('message_receipts')
        .update({
          read_at: new Date().toISOString(),
        })
        .eq('id', existingReceipt.id);

      if (updateError) {
        return NextResponse.json(
          { error: 'Failed to mark as read' },
          { status: 500 }
        );
      }
    } else {
      // Create new receipt
      const { error: createError } = await supabase
        .from('message_receipts')
        .insert({
          message_id: messageId,
          user_id: profile.id,
          read_at: new Date().toISOString(),
          delivered_at: new Date().toISOString(),
        });

      if (createError) {
        return NextResponse.json(
          { error: 'Failed to mark as read' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking message as read:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

