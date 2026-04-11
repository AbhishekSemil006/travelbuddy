import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { MessageCircle, Search, PenSquare } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Conversation } from '@/hooks/useMessages';
import { useState, useMemo } from 'react';

interface ConversationListProps {
  conversations: Conversation[];
  loading: boolean;
  activeId: string | null;
  onSelect: (id: string) => void;
}

const ConversationList = ({ conversations, loading, activeId, onSelect }: ConversationListProps) => {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return conversations;
    const q = search.toLowerCase();
    return conversations.filter(c =>
      c.other_user?.display_name?.toLowerCase().includes(q) ||
      c.last_message?.content?.toLowerCase().includes(q)
    );
  }, [conversations, search]);

  if (loading) {
    return (
      <div className="flex flex-col gap-1 p-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-xl">
            <Skeleton className="h-14 w-14 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-44" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Search bar */}
      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 bg-muted/40 border-border/50 rounded-full text-sm focus-visible:ring-1 focus-visible:ring-primary/30"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 py-12 text-center px-4">
          <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <MessageCircle className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="font-semibold text-foreground">No conversations yet</p>
          <p className="text-xs text-muted-foreground mt-1">Messages from trip buddies will appear here</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-1">
          {filtered.map((conv, i) => {
            const isActive = activeId === conv.id;
            const hasUnread = conv.unread_count > 0;

            return (
              <motion.button
                key={conv.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.025 }}
                onClick={() => onSelect(conv.id)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 mx-1 rounded-xl transition-all text-left
                  ${isActive
                    ? 'bg-primary/8'
                    : 'hover:bg-muted/50'
                  }
                `}
              >
                {/* Avatar with online dot */}
                <div className="relative shrink-0">
                  <Avatar className={`h-14 w-14 ${hasUnread ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}>
                    <AvatarImage src={conv.other_user?.avatar_url ?? undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-semibold text-lg">
                      {conv.other_user?.display_name?.charAt(0)?.toUpperCase() ?? '?'}
                    </AvatarFallback>
                  </Avatar>
                  {/* Online dot */}
                  <span className="absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full bg-green-500 ring-2 ring-card" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm truncate ${hasUnread ? 'font-bold text-foreground' : 'font-medium text-foreground'}`}>
                      {conv.other_user?.display_name ?? 'Unknown'}
                    </span>
                    {conv.last_message && (
                      <span className={`text-[11px] ml-2 shrink-0 ${hasUnread ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
                        {formatDistanceToNow(new Date(conv.last_message.created_at), { addSuffix: false })}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className={`text-[13px] truncate flex-1 ${hasUnread ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>
                      {conv.last_message
                        ? `${conv.last_message.sender_id === conv.other_user?.user_id ? '' : 'You: '}${conv.last_message.content}`
                        : 'No messages yet'
                      }
                    </p>
                    {hasUnread && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shrink-0">
                        {conv.unread_count > 9 ? '9+' : conv.unread_count}
                      </span>
                    )}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ConversationList;
