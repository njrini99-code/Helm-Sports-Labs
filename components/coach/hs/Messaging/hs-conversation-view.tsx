'use client';

import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { getMessagesForConversation, type ConversationMessage } from '@/lib/api/messaging/getMessagesForConversation';
import { sendMessage } from '@/lib/api/messaging/sendMessage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function HsConversationView({
  conversationId,
  coachProfileId,
}: {
  conversationId?: string;
  coachProfileId: string;
}) {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState('');
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!conversationId) return;
    setLoading(true);
    getMessagesForConversation(conversationId)
      .then(setMessages)
      .finally(() => setLoading(false));
  }, [conversationId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!conversationId || !text.trim()) return;
    const content = text.trim();
    setText('');
    // optimistic
    setMessages((prev) => [...prev, { 
      id: `temp-${Date.now()}`, 
      senderProfileId: coachProfileId, 
      senderType: 'coach' as const,
      senderName: 'You',
      senderAvatar: null,
      content, 
      createdAt: new Date().toISOString(),
      isRead: true,
    }]);
    await sendMessage({
      conversationId,
      senderType: 'coach',
      senderProfileId: coachProfileId,
      content,
    });
    const refreshed = await getMessagesForConversation(conversationId);
    setMessages(refreshed);
  };

  return (
    <Card className="bg-slate-900/70 border-white/5 p-4 text-white h-full flex flex-col">
      {!conversationId ? (
        <p className="text-sm text-slate-400">Select a conversation to view messages.</p>
      ) : (
        <>
          <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-2 pr-2">
            {loading && <p className="text-xs text-slate-500">Loading…</p>}
            {messages.map((m) => (
              <div
                key={m.id}
                className={`rounded-xl px-3 py-2 max-w-[75%] ${
                  m.senderProfileId === coachProfileId ? 'ml-auto bg-emerald-500/20 border border-emerald-500/30' : 'bg-white/5 border border-white/10'
                }`}
              >
                <p className="text-xs text-slate-300">{new Date(m.createdAt).toLocaleString()}</p>
                <p className="text-sm">{m.content}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type a message"
              className="bg-white/5 border-white/10 text-white"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <Button onClick={handleSend} disabled={!text.trim()}>
              Send
            </Button>
          </div>
        </>
      )}
    </Card>
  );
}
