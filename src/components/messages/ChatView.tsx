import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Search, Send, X, Check, CheckCheck } from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useChatMessages, useSearchMessages, Message } from '@/hooks/useMessages';
import { useAuth } from '@/contexts/AuthContext';

interface ChatViewProps {
  conversationId: string;
  otherUser: { user_id: string; display_name: string | null; avatar_url: string | null } | undefined;
  onBack: () => void;
}

function formatMsgTime(dateStr: string) {
  const d = new Date(dateStr);
  return format(d, 'HH:mm');
}

function formatDateLabel(dateStr: string) {
  const d = new Date(dateStr);
  if (isToday(d)) return 'Today';
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'MMM d, yyyy');
}

const ChatView = ({ conversationId, otherUser, onBack }: ChatViewProps) => {
  const { user } = useAuth();
  const { messages, loading, otherTyping, sendMessage, setTyping } = useChatMessages(conversationId);
  const { results: searchResults, search } = useSearchMessages(conversationId);
  const [input, setInput] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, otherTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const text = input;
    setInput('');
    setTyping(false);
    await sendMessage(text);
  };

  const handleInputChange = (val: string) => {
    setInput(val);
    setTyping(true);
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => setTyping(false), 2000);
  };

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    search(q);
  };

  // Group messages by date
  const groupedMessages = messages.reduce<{ date: string; msgs: Message[] }[]>((acc, msg) => {
    const date = format(new Date(msg.created_at), 'yyyy-MM-dd');
    const last = acc[acc.length - 1];
    if (last && last.date === date) {
      last.msgs.push(msg);
    } else {
      acc.push({ date, msgs: [msg] });
    }
    return acc;
  }, []);

  const highlightedIds = new Set(searchResults.map(r => r.id));

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b px-3 py-2.5 bg-card">
        <Button variant="ghost" size="icon" className="shrink-0 md:hidden" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Avatar className="h-9 w-9">
          <AvatarImage src={otherUser?.avatar_url ?? undefined} />
          <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
            {otherUser?.display_name?.charAt(0)?.toUpperCase() ?? '?'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{otherUser?.display_name ?? 'Unknown'}</p>
          {otherTyping && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-primary"
            >
              typing...
            </motion.p>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => { setShowSearch(!showSearch); setSearchQuery(''); }}
        >
          {showSearch ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
        </Button>
      </div>

      {/* Search bar */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b overflow-hidden"
          >
            <div className="p-2">
              <Input
                placeholder="Search in conversation..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="h-8 text-sm"
                autoFocus
              />
              {searchQuery && (
                <p className="text-xs text-muted-foreground mt-1 px-1">
                  {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : ''}`}>
                <Skeleton className="h-10 w-48 rounded-2xl" />
              </div>
            ))}
          </div>
        ) : (
          groupedMessages.map((group) => (
            <div key={group.date}>
              <div className="flex items-center justify-center my-3">
                <span className="text-[11px] text-muted-foreground bg-muted/50 px-3 py-0.5 rounded-full">
                  {formatDateLabel(group.msgs[0].created_at)}
                </span>
              </div>
              {group.msgs.map((msg, i) => {
                const isMine = msg.sender_id === user?.id;
                const highlighted = highlightedIds.has(msg.id);
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className={`flex mb-1 ${isMine ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                        highlighted ? 'ring-2 ring-primary/50' : ''
                      } ${
                        isMine
                          ? 'bg-primary text-primary-foreground rounded-br-md'
                          : 'bg-muted text-foreground rounded-bl-md'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                      <div className={`flex items-center gap-1 mt-0.5 ${isMine ? 'justify-end' : ''}`}>
                        <span className={`text-[10px] ${isMine ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                          {formatMsgTime(msg.created_at)}
                        </span>
                        {isMine && (
                          msg.is_read
                            ? <CheckCheck className="h-3 w-3 text-primary-foreground/70" />
                            : <Check className="h-3 w-3 text-primary-foreground/50" />
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ))
        )}

        {/* Typing indicator */}
        <AnimatePresence>
          {otherTyping && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex justify-start"
            >
              <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-2.5">
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <motion.span
                      key={i}
                      className="h-2 w-2 rounded-full bg-muted-foreground/50"
                      animate={{ y: [0, -4, 0] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.15 }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input */}
      <div className="border-t p-3 bg-card">
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="flex items-center gap-2"
        >
          <Input
            placeholder="Type a message..."
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            className="flex-1 bg-muted/50 border-none rounded-full px-4"
          />
          <Button
            type="submit"
            size="icon"
            className="rounded-full shrink-0"
            disabled={!input.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatView;
