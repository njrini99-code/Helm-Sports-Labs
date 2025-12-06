import { createClient } from '@/lib/supabase/client';

export type ConversationMessage = {
  id: string;
  senderType: 'player' | 'coach' | 'system';
  senderProfileId: string | null;
  senderName: string;
  senderAvatar: string | null;
  content: string;
  createdAt: string;
  isRead: boolean;
};

export type MessageViewer = 'player' | 'coach';

type MessageRow = {
  id: string;
  sender_type?: 'player' | 'coach' | 'system' | null;
  sender_profile_id?: string | null;
  sender_player_id?: string | null;
  sender_program_id?: string | null;
  message_text?: string | null;
  content?: string | null;
  read_by_player?: boolean | null;
  read_by_program?: boolean | null;
  created_at: string;
  player?: {
    id: string;
    first_name?: string | null;
    last_name?: string | null;
    full_name?: string | null;
    avatar_url?: string | null;
  };
  coach?: {
    id: string;
    full_name?: string | null;
    program_name?: string | null;
    logo_url?: string | null;
  };
};

export interface GetMessagesOptions {
  viewerType?: MessageViewer;
  limit?: number;
  offset?: number;
}

export interface MessagesResult {
  messages: ConversationMessage[];
  totalCount: number;
  unreadCount: number;
}

export async function getMessagesForConversationWithMeta(
  conversationId: string,
  options: GetMessagesOptions = {}
): Promise<MessagesResult> {
  const viewerType = options.viewerType ?? 'player';
  const limit = options.limit ?? 50;
  const offset = options.offset ?? 0;
  const supabase = createClient();

  const { data, error, count } = await supabase
    .from('messages')
    .select(`
      id,
      sender_type,
      sender_profile_id,
      sender_player_id,
      sender_program_id,
      message_text,
      content,
      read_by_player,
      read_by_program,
      created_at,
      player:sender_player_id (
        id,
        first_name,
        last_name,
        full_name,
        avatar_url
      ),
      coach:sender_program_id (
        id,
        full_name,
        program_name,
        logo_url
      )
    `, { count: 'exact' })
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .range(offset, offset + limit - 1);

  if (error || !data) {
    console.error('getMessagesForConversation error', error);
    return { messages: [], totalCount: 0, unreadCount: 0 };
  }

  const messages = (data as any[]).map((m) => {
    const senderType: ConversationMessage['senderType'] =
      m.sender_type || (m.sender_player_id ? 'player' : m.sender_program_id ? 'coach' : 'system');

    const senderProfileId = m.sender_profile_id ?? m.sender_player_id ?? m.sender_program_id ?? null;
    let senderName = 'Unknown';
    let senderAvatar: string | null = null;

    if (senderType === 'player' && m.player) {
      senderName = m.player.full_name || `${m.player.first_name || ''} ${m.player.last_name || ''}`.trim() || 'Player';
      senderAvatar = m.player.avatar_url ?? null;
    } else if (senderType === 'coach' && m.coach) {
      senderName = m.coach.program_name || m.coach.full_name || 'Coach';
      senderAvatar = m.coach.logo_url ?? null;
    } else if (senderType === 'system') {
      senderName = 'System';
    }

    const isRead = Boolean(viewerType === 'player' ? m.read_by_player : m.read_by_program);

    return {
      id: m.id,
      senderType,
      senderProfileId,
      senderName,
      senderAvatar,
      content: m.content ?? m.message_text ?? '',
      createdAt: m.created_at,
      isRead,
    };
  });

  const { data: convoMeta, error: convoError } = await supabase
    .from('conversations')
    .select('player_unread_count, program_unread_count')
    .eq('id', conversationId)
    .maybeSingle();

  if (convoError) {
    console.error('getMessagesForConversation unread fetch error', convoError);
  }

  const unreadCount = viewerType === 'player'
    ? Number(convoMeta?.player_unread_count ?? 0)
    : Number(convoMeta?.program_unread_count ?? 0);

  return {
    messages,
    totalCount: count ?? messages.length,
    unreadCount: Number.isNaN(unreadCount) ? 0 : unreadCount,
  };
}

// Backwards-compatible helper returning just messages
export async function getMessagesForConversation(
  conversationId: string,
  viewerType: MessageViewer = 'player'
): Promise<ConversationMessage[]> {
  const { messages } = await getMessagesForConversationWithMeta(conversationId, { viewerType });
  return messages;
}

// Mark messages as read
export async function markMessagesAsRead(
  conversationId: string,
  viewerType: 'player' | 'coach'
): Promise<void> {
  const supabase = createClient();

  const updateField = viewerType === 'player' ? 'read_by_player' : 'read_by_program';
  const unreadField = viewerType === 'player' ? 'player_unread_count' : 'program_unread_count';

  // Mark all messages as read
  const { error: messagesError } = await supabase
    .from('messages')
    .update({ [updateField]: true })
    .eq('conversation_id', conversationId)
    .eq(updateField, false);

  if (messagesError) {
    console.error('markMessagesAsRead messages error', messagesError);
    return;
  }

  // Reset unread count on conversation
  const { error: conversationError } = await supabase
    .from('conversations')
    .update({ [unreadField]: 0 })
    .eq('id', conversationId);

  if (conversationError) {
    console.error('markMessagesAsRead conversation error', conversationError);
  }
}
