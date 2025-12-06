import { createClient } from '@/lib/supabase/client';

interface SendMessageInput {
  conversationId: string;
  senderType: 'player' | 'coach';
  senderProfileId?: string;
  senderPlayerId?: string;
  senderProgramId?: string;
  content: string;
  enforceMembership?: boolean;
}

export interface SendMessageResult {
  messageId: string | null;
  error: unknown | null;
  conversationUpdateError?: unknown | null;
  unreadUpdateError?: unknown | null;
}

export async function sendMessage(input: SendMessageInput): Promise<SendMessageResult> {
  if (!input.conversationId || !input.content?.trim()) {
    return { messageId: null, error: new Error('conversationId and content are required') };
  }

  if (input.senderType === 'player' && !(input.senderPlayerId || input.senderProfileId)) {
    return { messageId: null, error: new Error('senderPlayerId or senderProfileId required for player message') };
  }

  if (input.senderType === 'coach' && !(input.senderProgramId || input.senderProfileId)) {
    return { messageId: null, error: new Error('senderProgramId or senderProfileId required for coach message') };
  }

  const supabase = createClient();

  if (input.enforceMembership && input.senderProfileId) {
    const { data: membership, error: membershipError } = await supabase
      .from('conversation_participants')
      .select('profile_id')
      .eq('conversation_id', input.conversationId)
      .eq('profile_id', input.senderProfileId)
      .maybeSingle();

    if (membershipError) {
      console.error('sendMessage membership check error:', membershipError);
      return { messageId: null, error: membershipError };
    }

    if (!membership) {
      return { messageId: null, error: new Error('Sender is not a participant in this conversation') };
    }
  }

  const messageData: Record<string, unknown> = {
    conversation_id: input.conversationId,
    sender_type: input.senderType,
    message_text: input.content,
    content: input.content,
    read_by_player: input.senderType === 'player',
    read_by_program: input.senderType === 'coach',
  };

  // Set sender IDs based on type
  if (input.senderType === 'player') {
    messageData.sender_player_id = input.senderPlayerId || input.senderProfileId;
  } else {
    messageData.sender_program_id = input.senderProgramId || input.senderProfileId;
  }

  if (input.senderProfileId) {
    messageData.sender_profile_id = input.senderProfileId;
  }

  const { data, error } = await supabase
    .from('messages')
    .insert(messageData)
    .select('id, created_at')
    .single();

  if (error || !data) {
    console.error('sendMessage error:', error);
    return { messageId: null, error: error || new Error('Message insert returned no data') };
  }

  // Update conversation with last message info
  const unreadField = input.senderType === 'player' ? 'program_unread_count' : 'player_unread_count';
  const lastMessagePreview = input.content.substring(0, 100);
  
  const { error: updateError } = await supabase
    .from('conversations')
    .update({
      last_message_text: lastMessagePreview,
      last_message_at: data.created_at,
      last_sender: input.senderType,
    })
    .eq('id', input.conversationId);

  if (updateError) {
    console.error('sendMessage update conversation error:', updateError);
  }

  // Increment unread count for recipient
  let unreadUpdateError: unknown | null = null;
  const { error: rpcError } = await supabase.rpc('increment_unread_count', {
    conv_id: input.conversationId,
    field_name: unreadField,
  });

  if (rpcError) {
    const { data: unreadData, error: unreadFetchError } = await supabase
      .from('conversations')
      .select(unreadField)
      .eq('id', input.conversationId)
      .maybeSingle();

    if (unreadFetchError) {
      unreadUpdateError = rpcError ?? unreadFetchError;
    } else {
      const currentCount = (unreadData as Record<string, number> | null)?.[unreadField] ?? 0;
      const nextCount = (Number(currentCount) || 0) + 1;
      const { error: fallbackError } = await supabase
        .from('conversations')
        .update({ [unreadField]: nextCount })
        .eq('id', input.conversationId);

      unreadUpdateError = fallbackError ?? rpcError;
    }
  }

  if (unreadUpdateError) {
    console.error('sendMessage unread update error:', unreadUpdateError);
  }

  return {
    messageId: data.id,
    error: null,
    conversationUpdateError: updateError,
    unreadUpdateError,
  };
}

// Legacy compatibility wrapper
export async function sendMessageLegacy(
  conversationId: string,
  senderProfileId: string,
  content: string,
  senderType: 'player' | 'coach' = 'player'
) {
  return sendMessage({
    conversationId,
    senderType,
    senderProfileId,
    senderPlayerId: senderType === 'player' ? senderProfileId : undefined,
    senderProgramId: senderType === 'coach' ? senderProfileId : undefined,
    content,
  });
}
