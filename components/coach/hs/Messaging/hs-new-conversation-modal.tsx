'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createConversation, type ConversationType } from '@/lib/api/messaging/createConversation';
import { toast } from 'sonner';

export function HsNewConversationModal({
  open,
  onOpenChange,
  defaultParticipantProfileIds = [],
  defaultTitle,
  type = 'group',
  orgId,
  coachProfileId,
}: {
  open: boolean;
  onOpenChange: (val: boolean) => void;
  defaultParticipantProfileIds?: string[];
  defaultTitle?: string;
  type?: ConversationType;
  orgId: string;
  coachProfileId: string;
}) {
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState(defaultTitle || '');
  const [participantIds, setParticipantIds] = useState<string[]>(defaultParticipantProfileIds || []);
  const [conversationType, setConversationType] = useState<ConversationType>(type);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setParticipantIds(defaultParticipantProfileIds || []);
  }, [defaultParticipantProfileIds]);

  useEffect(() => {
    setTitle(defaultTitle || '');
  }, [defaultTitle]);

  const handleCreate = async () => {
    if (!orgId || !coachProfileId) {
      toast.error('Missing org or coach profile');
      return;
    }
    if (participantIds.length === 0) {
      toast.error('Add at least one participant');
      return;
    }
    setSaving(true);
    const { error } = await createConversation({
      orgId,
      type: conversationType,
      title: title || null,
      participantProfileIds: Array.from(new Set([coachProfileId, ...participantIds])),
      createdByProfileId: coachProfileId,
    });
    setSaving(false);
    if (error) {
      toast.error('Could not create conversation');
    } else {
      toast.success('Conversation created');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New conversation</DialogTitle>
          <DialogDescription>Start a conversation with selected players.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Type</p>
            <Select value={conversationType} onValueChange={(v) => setConversationType(v as ConversationType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="direct">Direct</SelectItem>
                <SelectItem value="group">Group</SelectItem>
                <SelectItem value="team">Team</SelectItem>
                <SelectItem value="broadcast">Broadcast</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Title (optional)</p>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Varsity group, etc." />
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Participant profile IDs</p>
            <Input
              value={participantIds.join(',')}
              onChange={(e) => setParticipantIds(e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
              placeholder="Comma separated profile IDs"
            />
            <p className="text-[11px] text-muted-foreground">Pre-populated from selection; replace with a selector when roster search is available.</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={saving}>
            {saving ? 'Creating…' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
