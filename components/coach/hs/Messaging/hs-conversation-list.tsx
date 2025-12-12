'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { ConversationListItem } from '@/lib/api/messaging/getConversationsForCoach';
import { getConversationsForCoach } from '@/lib/api/messaging/getConversationsForCoach';
import { HsNewConversationModal } from './hs-new-conversation-modal';

export function HsConversationList({
  coachProfileId,
  orgId,
  onSelect,
}: {
  coachProfileId: string;
  orgId?: string;
  onSelect: (id: string) => void;
}) {
  const [convos, setConvos] = useState<ConversationListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (!coachProfileId) return;
    setLoading(true);
    getConversationsForCoach(coachProfileId, orgId)
      .then(setConvos)
      .finally(() => setLoading(false));
  }, [coachProfileId, orgId]);

  return (
    <Card className="bg-slate-900/70 border-white/5 p-3 text-white h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-slate-300">Conversations</p>
        <Button size="sm" variant="outline" className="border-white/20 text-white" onClick={() => setModalOpen(true)}>
          New
        </Button>
      </div>
      <div className="space-y-2 overflow-y-auto">
        {loading && <p className="text-xs text-slate-500">Loading…</p>}
        {convos.map((c) => (
          <button
            key={c.conversationId}
            onClick={() => onSelect(c.conversationId)}
            className="w-full text-left rounded-2xl border border-white/10 bg-white/5 px-3 py-2 hover:bg-white/10 transition"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">{c.title}</p>
              <Badge variant="outline" className="border-white/20 text-white capitalize">
                {c.type}
              </Badge>
            </div>
            <p className="text-xs text-slate-400 truncate">{c.lastMessageSnippet || 'No messages yet'}</p>
          </button>
)}
        {!loading && convos.length === 0 && <p className="text-sm text-slate-400">No conversations yet.</p>}
      </div>
      <HsNewConversationModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        defaultParticipantProfileIds={[]}
        orgId={orgId || ''}
        coachProfileId={coachProfileId}
        type="group"
      />
    </Card>
  );
}
