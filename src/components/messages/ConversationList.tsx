import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { MessageCircle, Search } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
      <div className="flex flex-col gap-3 p-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-40" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 bg-muted/50 border-none"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 py-12 text-center px-4">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
            <MessageCircle className="h-7 w-7 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">No conversations yet</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {filtered.map((conv, i) => (
            <motion.button
              key={conv.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => onSelect(conv.id)}
              className={`w-full flex items-center gap-3 p-3 transition-colors hover:bg-muted/50 text-left ${
                activeId === conv.id ? 'bg-primary/5 border-l-2 border-primary' : ''
              }`}
            >
              <div className="relative">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={conv.other_user?.avatar_url ?? undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {conv.other_user?.display_name?.charAt(0)?.toUpperCase() ?? '?'}
                  </AvatarFallback>
                </Avatar>
                {conv.unread_count > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {conv.unread_count > 9 ? '9+' : conv.unread_count}
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className={`text-sm truncate ${conv.unread_count > 0 ? 'font-semibold text-foreground' : 'font-medium text-foreground'}`}>
                    {conv.other_user?.display_name ?? 'Unknown'}
                  </span>
                  {conv.last_message && (
                    <span className="text-[11px] text-muted-foreground ml-2 shrink-0">
                      {formatDistanceToNow(new Date(conv.last_message.created_at), { addSuffix: false })}
                    </span>
                  )}
                </div>
                {conv.last_message && (
                  <p className={`text-xs truncate mt-0.5 ${conv.unread_count > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                    {conv.last_message.sender_id === conv.other_user?.user_id ? '' : 'You: '}
                    {conv.last_message.content}
                  </p>
                )}
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConversationList;
