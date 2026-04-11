import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Search, Send, X, Check, CheckCheck, MoreVertical, Flag, Heart, Smile, Image as ImageIcon, Ban, ShieldOff } from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useChatMessages, useSearchMessages, useReportConversation, Message } from '@/hooks/useMessages';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

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

const REPORT_REASONS = [
  { value: 'spam', label: '🚫 Spam' },
  { value: 'harassment', label: '😤 Harassment' },
  { value: 'inappropriate_content', label: '⚠️ Inappropriate Content' },
  { value: 'scam', label: '💰 Scam or Fraud' },
  { value: 'fake_profile', label: '🎭 Fake Profile' },
  { value: 'threats', label: '🔴 Threats' },
  { value: 'other', label: '📝 Other' },
];

const ChatView = ({ conversationId, otherUser, onBack }: ChatViewProps) => {
  const { user } = useAuth();
  const { messages, loading, otherTyping, sendMessage, setTyping } = useChatMessages(conversationId);
  const { results: searchResults, search } = useSearchMessages(conversationId);
  const { reportConversation, reporting } = useReportConversation();
  const [input, setInput] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [likedMessages, setLikedMessages] = useState<Set<string>>(new Set());
  const [blockStatus, setBlockStatus] = useState<{ iBlockedThem: boolean; theyBlockedMe: boolean; isBlocked: boolean }>({ iBlockedThem: false, theyBlockedMe: false, isBlocked: false });
  const [blockLoading, setBlockLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch block status
  useEffect(() => {
    if (!otherUser?.user_id) return;
    const fetchBlockStatus = async () => {
      try {
        const res = await (await import('@/lib/api')).api.get(`/messages/block-status/${otherUser.user_id}`);
        if (res.data) setBlockStatus(res.data);
      } catch (err) {
        console.error('Failed to fetch block status:', err);
      }
    };
    fetchBlockStatus();
  }, [otherUser?.user_id]);

  const handleToggleBlock = async () => {
    if (!otherUser?.user_id) return;
    setBlockLoading(true);
    try {
      const { api: apiClient } = await import('@/lib/api');
      if (blockStatus.iBlockedThem) {
        await apiClient.post(`/messages/unblock/${otherUser.user_id}`, {});
        setBlockStatus(prev => ({ ...prev, iBlockedThem: false, isBlocked: prev.theyBlockedMe }));
        (await import('sonner')).toast.success('User unblocked');
      } else {
        await apiClient.post(`/messages/block/${otherUser.user_id}`, {});
        setBlockStatus(prev => ({ ...prev, iBlockedThem: true, isBlocked: true }));
        (await import('sonner')).toast.success('User blocked');
      }
    } catch (err: any) {
      (await import('sonner')).toast.error(err.message || 'Failed to update block status');
    } finally {
      setBlockLoading(false);
    }
  };

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

  const handleReport = async () => {
    if (!reportReason) return;
    const success = await reportConversation(conversationId, reportReason, reportDescription);
    if (success) {
      setShowReportDialog(false);
      setReportReason('');
      setReportDescription('');
    }
  };

  const toggleLike = (msgId: string) => {
    setLikedMessages(prev => {
      const next = new Set(prev);
      if (next.has(msgId)) next.delete(msgId);
      else next.add(msgId);
      return next;
    });
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

  // Find the last message sent by the current user across all groups
  const allMyMessages = messages.filter(m => m.sender_id === user?.id);
  const lastMyMessage = allMyMessages.length > 0 ? allMyMessages[allMyMessages.length - 1] : null;

  return (
    <div className="flex h-full flex-col bg-background">
      {/* ── HEADER ─ Instagram-style ── */}
      <div className="flex items-center gap-3 border-b px-3 py-2.5 bg-card/80 backdrop-blur-sm">
        <Button variant="ghost" size="icon" className="shrink-0 md:hidden" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div className="relative cursor-pointer" onClick={onBack}>
          <Avatar className="h-9 w-9 ring-2 ring-primary/20">
            <AvatarImage src={otherUser?.avatar_url ?? undefined} />
            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-sm font-semibold">
              {otherUser?.display_name?.charAt(0)?.toUpperCase() ?? '?'}
            </AvatarFallback>
          </Avatar>
          {/* Online indicator dot */}
          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-card" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{otherUser?.display_name ?? 'Unknown'}</p>
          {otherTyping ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-primary font-medium"
            >
              typing...
            </motion.p>
          ) : (
            <p className="text-[11px] text-muted-foreground">Active now</p>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => { setShowSearch(!showSearch); setSearchQuery(''); }}
          >
            {showSearch ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={handleToggleBlock}
                disabled={blockLoading}
                className={blockStatus.iBlockedThem ? 'text-emerald-600' : 'text-amber-600'}
              >
                {blockStatus.iBlockedThem ? (
                  <><ShieldOff className="h-4 w-4 mr-2" /> Unblock User</>
                ) : (
                  <><Ban className="h-4 w-4 mr-2" /> Block User</>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setShowReportDialog(true)}
                className="text-destructive focus:text-destructive"
              >
                <Flag className="h-4 w-4 mr-2" />
                Report
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* ── SEARCH BAR ── */}
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

      {/* ── MESSAGES AREA ── */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-3 py-4"
        style={{
          backgroundImage: 'radial-gradient(circle at 50% 0%, hsl(var(--primary) / 0.03), transparent 70%)',
        }}
      >
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : ''}`}>
                <Skeleton className="h-10 w-48 rounded-2xl" />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="mb-3">
              <Avatar className="h-20 w-20 mx-auto ring-4 ring-primary/10">
                <AvatarImage src={otherUser?.avatar_url ?? undefined} />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-2xl font-bold">
                  {otherUser?.display_name?.charAt(0)?.toUpperCase() ?? '?'}
                </AvatarFallback>
              </Avatar>
            </div>
            <p className="font-semibold text-foreground">{otherUser?.display_name}</p>
            <p className="text-xs text-muted-foreground mt-1">Start the conversation — say hello! 👋</p>
          </div>
        ) : (
          groupedMessages.map((group) => (
            <div key={group.date}>
              {/* Date separator */}
              <div className="flex items-center justify-center my-4">
                <span className="text-[11px] text-muted-foreground bg-muted/60 backdrop-blur-sm px-3 py-1 rounded-full font-medium">
                  {formatDateLabel(group.msgs[0].created_at)}
                </span>
              </div>

              {group.msgs.map((msg, i) => {
                const isMine = msg.sender_id === user?.id;
                const highlighted = highlightedIds.has(msg.id);
                const isLiked = likedMessages.has(msg.id);
                const isLastInGroup = i === group.msgs.length - 1;

                // Determine if we should show the avatar (last consecutive msg from same sender)
                const nextMsg = group.msgs[i + 1];
                const prevMsg = group.msgs[i - 1];
                const isLastConsecutive = !nextMsg || nextMsg.sender_id !== msg.sender_id;
                const isFirstConsecutive = !prevMsg || prevMsg.sender_id !== msg.sender_id;

                return (
                  <div key={msg.id} className="mb-[2px]">
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.015, duration: 0.2 }}
                      className={`flex items-end w-full ${isMine ? 'justify-end' : 'justify-start'}`}
                    >
                      {/* Left avatar — other person, only on last consecutive */}
                      {!isMine && (
                        <div className="w-7 mr-2 shrink-0">
                          {isLastConsecutive && (
                            <Avatar className="h-7 w-7">
                              <AvatarImage src={otherUser?.avatar_url ?? undefined} />
                              <AvatarFallback className="text-[10px] bg-gradient-to-br from-purple-500 to-pink-500 text-white font-semibold">
                                {otherUser?.display_name?.charAt(0)?.toUpperCase() ?? '?'}
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      )}

                      {/* Message bubble */}
                      <div className="relative group max-w-[70%]">
                        <div
                          onDoubleClick={() => toggleLike(msg.id)}
                          className={`
                            px-3.5 py-2 text-sm break-words cursor-default select-text
                            transition-all duration-150
                            ${highlighted ? 'ring-2 ring-yellow-400/60' : ''}
                            ${isMine
                              ? `bg-gradient-to-br from-blue-500 to-blue-600 text-white
                                 ${isFirstConsecutive && isLastConsecutive ? 'rounded-2xl' : ''}
                                 ${isFirstConsecutive && !isLastConsecutive ? 'rounded-2xl rounded-br-md' : ''}
                                 ${!isFirstConsecutive && isLastConsecutive ? 'rounded-2xl rounded-tr-md' : ''}
                                 ${!isFirstConsecutive && !isLastConsecutive ? 'rounded-xl rounded-r-md' : ''}
                                `
                              : `bg-muted text-foreground
                                 ${isFirstConsecutive && isLastConsecutive ? 'rounded-2xl' : ''}
                                 ${isFirstConsecutive && !isLastConsecutive ? 'rounded-2xl rounded-bl-md' : ''}
                                 ${!isFirstConsecutive && isLastConsecutive ? 'rounded-2xl rounded-tl-md' : ''}
                                 ${!isFirstConsecutive && !isLastConsecutive ? 'rounded-xl rounded-l-md' : ''}
                                `
                            }
                          `}
                        >
                          <p className="whitespace-pre-wrap break-words leading-relaxed">
                            {msg.content}
                          </p>
                          <div className={`flex items-center gap-1 mt-0.5 ${isMine ? 'justify-end' : ''}`}>
                            <span className={`text-[10px] ${isMine ? 'text-white/60' : 'text-muted-foreground'}`}>
                              {formatMsgTime(msg.created_at)}
                            </span>
                            {isMine && (
                              msg.is_read ? (
                                <CheckCheck className="h-3 w-3 text-white/70" />
                              ) : (
                                <Check className="h-3 w-3 text-white/50" />
                              )
                            )}
                          </div>
                        </div>

                        {/* Heart reaction */}
                        {isLiked && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className={`absolute -bottom-2 ${isMine ? 'left-1' : 'right-1'}`}
                          >
                            <span className="bg-card shadow-sm rounded-full px-1.5 py-0.5 text-xs border">
                              ❤️
                            </span>
                          </motion.div>
                        )}

                        {/* Hover action - like button */}
                        <div className={`
                          absolute top-1/2 -translate-y-1/2
                          opacity-0 group-hover:opacity-100 transition-opacity
                          ${isMine ? '-left-8' : '-right-8'}
                        `}>
                          <button
                            onClick={() => toggleLike(msg.id)}
                            className="h-6 w-6 flex items-center justify-center rounded-full bg-card shadow-sm border hover:bg-muted transition-colors"
                          >
                            <Heart className={`h-3 w-3 ${isLiked ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
                          </button>
                        </div>
                      </div>

                      {/* Right avatar — my messages, only on last consecutive */}
                      {isMine && (
                        <div className="w-7 ml-2 shrink-0">
                          {isLastConsecutive && (
                            <Avatar className="h-7 w-7">
                              <AvatarImage src={user?.avatarUrl ?? undefined} />
                              <AvatarFallback className="text-[10px] bg-gradient-to-br from-blue-500 to-cyan-500 text-white font-semibold">
                                {user?.fullName?.charAt(0)?.toUpperCase() ?? 'U'}
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      )}
                    </motion.div>

                    {/* Seen indicator — only on last sent message */}
                    {isMine && lastMyMessage?.id === msg.id && msg.is_read && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-end mr-9 mt-0.5"
                      >
                        <span className="text-[11px] text-muted-foreground font-medium">
                          Seen
                        </span>
                      </motion.div>
                    )}

                    {/* Extra spacing after the last consecutive message from same sender */}
                    {isLastConsecutive && <div className="h-2" />}
                  </div>
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
              className="flex items-end justify-start"
            >
              <Avatar className="h-7 w-7 mr-2 shrink-0">
                <AvatarImage src={otherUser?.avatar_url ?? undefined} />
                <AvatarFallback className="text-[10px] bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                  {otherUser?.display_name?.charAt(0)?.toUpperCase() ?? '?'}
                </AvatarFallback>
              </Avatar>
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

      {/* ── INPUT AREA ─ Instagram-style ── */}
      {blockStatus.isBlocked ? (
        <div className="border-t px-4 py-4 bg-card/80 backdrop-blur-sm text-center">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Ban className="h-4 w-4" />
            <span className="text-sm">
              {blockStatus.iBlockedThem
                ? 'You blocked this user.'
                : 'You can\'t send messages to this user.'}
            </span>
          </div>
          {blockStatus.iBlockedThem && (
            <button
              onClick={handleToggleBlock}
              disabled={blockLoading}
              className="mt-2 text-xs text-primary hover:underline font-medium"
            >
              Unblock to send messages
            </button>
          )}
        </div>
      ) : (
        <div className="border-t px-3 py-2.5 bg-card/80 backdrop-blur-sm">
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex items-center gap-2"
          >
            {/* Emoji & Camera buttons (visual placeholders) */}
            <button type="button" className="shrink-0 text-muted-foreground hover:text-foreground transition-colors">
              <Smile className="h-5 w-5" />
            </button>

            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                placeholder="Message..."
                value={input}
                onChange={(e) => handleInputChange(e.target.value)}
                className="bg-muted/40 border border-border/50 rounded-full px-4 h-9 text-sm focus-visible:ring-1 focus-visible:ring-primary/30"
              />
            </div>

            {input.trim() ? (
              <Button
                type="submit"
                size="icon"
                className="rounded-full shrink-0 h-9 w-9 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-sm"
              >
                <Send className="h-4 w-4 text-white" />
              </Button>
            ) : (
              <button
                type="button"
                onClick={async () => {
                  await sendMessage('❤️');
                }}
                className="shrink-0 text-red-500 hover:scale-110 transition-transform"
              >
                <Heart className="h-5 w-5 fill-red-500" />
              </button>
            )}
          </form>
        </div>
      )}

      {/* ── REPORT DIALOG ── */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Report Conversation</DialogTitle>
            <DialogDescription>
              Help us understand the problem. Your report will be reviewed by our team.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Reason</Label>
              <div className="grid gap-2">
                {REPORT_REASONS.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setReportReason(r.value)}
                    className={`
                      flex items-center px-3 py-2.5 rounded-lg border text-sm text-left transition-all
                      ${reportReason === r.value
                        ? 'border-primary bg-primary/5 text-foreground font-medium'
                        : 'border-border hover:bg-muted/50 text-muted-foreground'}
                    `}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="report-desc" className="text-sm font-medium">
                Additional details <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <textarea
                id="report-desc"
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder="Tell us more about what happened..."
                className="w-full h-20 px-3 py-2 rounded-lg border border-border bg-background text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary/30"
                maxLength={1000}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReportDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={!reportReason || reporting}
              onClick={handleReport}
            >
              {reporting ? 'Submitting...' : 'Submit Report'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChatView;
