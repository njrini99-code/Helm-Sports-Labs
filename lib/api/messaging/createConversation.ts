import { createClient } from '@/lib/supabase/client';

export type ConversationType = 'direct' | 'group' | 'team' | 'broadcast';

interface CreateConversationInput {
  orgId?: string | null;
  type?: ConversationType;
  title?: string | null;
  participantProfileIds?: string[];
  createdByProfileId: string;
  // For direct player-program messaging (legacy support)
  playerId?: string;
  programId?: string;
  includeCreatorAsParticipant?: boolean;
}

export interface CreateConversationResult {
  conversationId: string | null;
  error: unknown | null;
  participantError?: unknown | null;
}

export async function createConversation(input: CreateConversationInput): Promise<CreateConversationResult> {
  if (!input.createdByProfileId) {
    return { conversationId: null, error: new Error('createdByProfileId is required') };
  }

  const supabase = createClient();
  
  // Build conversation insert based on available data
  const conversationData = {
    type: input.type || 'direct',
    title: input.title || null,
    created_by: input.createdByProfileId,
    ...(input.orgId ? { org_id: input.orgId } : {}),
    ...(input.playerId ? { player_id: input.playerId } : {}),
    ...(input.programId ? { program_id: input.programId } : {}),
  };

  const { data: convo, error } = await supabase
    .from('conversations')
    .insert(conversationData)
    .select('id')
    .single();

  if (error || !convo) {
    console.error('createConversation error:', error);
    return { conversationId: null, error };
  }

  // Add participants if provided (new schema)
  if (input.participantProfileIds && input.participantProfileIds.length > 0) {
    const includeCreator = input.includeCreatorAsParticipant ?? true;
    const ids = includeCreator
      ? [...input.participantProfileIds, input.createdByProfileId]
      : input.participantProfileIds;
    const uniqueIds = Array.from(new Set(ids));
    const rows = uniqueIds.map((pid) => ({
      conversation_id: convo.id,
      profile_id: pid,
      user_id: pid, // Assuming profile_id === user_id for now
      role: pid === input.createdByProfileId ? 'owner' : 'member',
    }));

    const { error: participantError } = await supabase
      .from('conversation_participants')
      .insert(rows);

    if (participantError) {
      console.error('createConversation participants error:', participantError);
      return { conversationId: convo.id, error: null, participantError };
    }
  }

  return { conversationId: convo.id, error: null, participantError: null };
}

// Helper to get or create a direct conversation between player and program
export async function getOrCreateDirectConversation(playerId: string, programId: string) {
  const supabase = createClient();

  // Check if conversation exists
  const { data: existing } = await supabase
    .from('conversations')
    .select('id')
    .eq('player_id', playerId)
    .eq('program_id', programId)
    .eq('type', 'direct')
    .maybeSingle();

  if (existing) {
    return { conversationId: existing.id, error: null };
  }

  // Create new conversation
  return createConversation({
    playerId,
    programId,
    type: 'direct',
    createdByProfileId: playerId, // Player initiates
  });
}
