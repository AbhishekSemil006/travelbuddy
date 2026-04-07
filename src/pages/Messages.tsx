import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { useConversations, Conversation } from '@/hooks/useMessages';
import ConversationList from '@/components/messages/ConversationList';
import ChatView from '@/components/messages/ChatView';
import { useIsMobile } from '@/hooks/use-mobile';

const Messages = () => {
  const { conversations, loading } = useConversations();
  const [activeId, setActiveId] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const activeConv = useMemo(
    () => conversations.find(c => c.id === activeId),
    [conversations, activeId]
  );

  // Mobile: show either list or chat
  if (isMobile) {
    if (activeId && activeConv) {
      return (
        <div className="h-[calc(100dvh-4rem)]">
          <ChatView
            conversationId={activeId}
            otherUser={activeConv.other_user}
            onBack={() => setActiveId(null)}
          />
        </div>
      );
    }

    return (
      <div className="h-[calc(100dvh-4rem)] flex flex-col">
        <div className="px-4 pt-4 pb-2">
          <h1 className="text-2xl font-bold text-foreground">Messages</h1>
        </div>
        <div className="flex-1 overflow-hidden">
          <ConversationList
            conversations={conversations}
            loading={loading}
            activeId={activeId}
            onSelect={setActiveId}
          />
        </div>
      </div>
    );
  }

  // Desktop: split view
  return (
    <div className="flex h-[calc(100dvh-4rem)]">
      <div className="w-80 border-r flex flex-col shrink-0">
        <div className="px-4 pt-4 pb-2">
          <h1 className="text-lg font-bold text-foreground">Messages</h1>
        </div>
        <div className="flex-1 overflow-hidden">
          <ConversationList
            conversations={conversations}
            loading={loading}
            activeId={activeId}
            onSelect={setActiveId}
          />
        </div>
      </div>

      <div className="flex-1">
        {activeId && activeConv ? (
          <ChatView
            conversationId={activeId}
            otherUser={activeConv.other_user}
            onBack={() => setActiveId(null)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
              <MessageCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-foreground">Select a conversation</h3>
            <p className="mt-1 text-sm text-muted-foreground max-w-xs">
              Choose a conversation from the list to start chatting.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
