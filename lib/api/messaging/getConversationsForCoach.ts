import { createClient } from '@/lib/supabase/client';
import type { ConversationType } from './createConversation';

export type ConversationListItem = {
  conversationId: string;
  title: string;
  type: ConversationType;
  lastMessageSnippet: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
  // For direct conversations
  playerId?: string;
  playerName?: string;
  playerAvatar?: string;
};

export async function getConversationsForCoach(coachId: string, programId?: string) {
  const supabase = createClient();

  // Query conversations where this coach's program is involved
  const { data, error } = await supabase
    .from('conversations')
    .select(`
      id,
      type,
      title,
      player_id,
      program_id,
      last_message_text,
      last_message_at,
      program_unread_count,
      players:player_id (
        id,
        first_name,
        last_name,
        full_name,
        avatar_url
      )
    `)
    .eq('program_id', programId || coachId)
    .order('last_message_at', { ascending: false, nullsFirst: false });

  if (error || !data) {
    console.error('getConversationsForCoach error', error);
    return [];
  }

  return data.map((row: any) => {
    const player = row.players;
    const playerName = player?.full_name || 
      `${player?.first_name || ''} ${player?.last_name || ''}`.trim() ||
      'Unknown Player';

    return {
      conversationId: row.id,
      title: row.title || playerName,
      type: (row.type || 'direct') as ConversationType,
      lastMessageSnippet: row.last_message_text || null,
      lastMessageAt: row.last_message_at || null,
      unreadCount: row.program_unread_count || 0,
      playerId: row.player_id,
      playerName,
      playerAvatar: player?.avatar_url || null,
    } as ConversationListItem;
  });
}

// Get conversations for a player
export async function getConversationsForPlayer(playerId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('conversations')
    .select(`
      id,
      type,
      title,
      player_id,
      program_id,
      last_message_text,
      last_message_at,
      player_unread_count,
      coaches:program_id (
        id,
        full_name,
        program_name,
        school_name,
        logo_url
      )
    `)
    .eq('player_id', playerId)
    .order('last_message_at', { ascending: false, nullsFirst: false });

  if (error || !data) {
    console.error('getConversationsForPlayer error', error);
    return [];
  }

  return data.map((row: any) => {
    const coach = row.coaches;
    const programName = coach?.program_name || coach?.school_name || coach?.full_name || 'Unknown Program';

    return {
      conversationId: row.id,
      title: row.title || programName,
      type: (row.type || 'direct') as ConversationType,
      lastMessageSnippet: row.last_message_text || null,
      lastMessageAt: row.last_message_at || null,
      unreadCount: row.player_unread_count || 0,
      programId: row.program_id,
      programName,
      programLogo: coach?.logo_url || null,
    };
  });
}
