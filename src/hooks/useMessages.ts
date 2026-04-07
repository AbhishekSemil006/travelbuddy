import { useState, useCallback, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Conversation {
  id: string;
  participant_one: string;
  participant_two: string;
  created_at: string;
  updated_at: string;
  other_user?: {
    user_id: string;
    display_name: string | null;
    avatar_url: string | null;
  };
  last_message?: {
    content: string;
    created_at: string;
    sender_id: string;
    is_read: boolean;
  };
  unread_count: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await api.get('/messages/conversations');
      if (res.data) setConversations(res.data);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
    // Poll every 10 seconds for new conversations/messages
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  return { conversations, loading, refetch: fetchConversations };
}

export function useChatMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const initialFetchDone = useRef(false);

  const fetchMessages = useCallback(async () => {
    if (!conversationId) return;
    if (!initialFetchDone.current) setLoading(true);

    try {
      const res = await api.get(`/messages/${conversationId}`);
      if (res.data) {
        setMessages(res.data);
        // If there are messages, also try to mark them as read
        if (res.data.length > 0) {
           api.patch(`/messages/${conversationId}/read`, {}).catch(() => {});
        }
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
      initialFetchDone.current = true;
    }
  }, [conversationId]);

  useEffect(() => {
    initialFetchDone.current = false;
    fetchMessages();
    // Poll every 3 seconds for new messages in active chat
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  const sendMessage = async (content: string) => {
    if (!conversationId) return;
    try {
      // Optimistic locally
      const optimisticMsg: Message = {
        id: Date.now().toString(),
        conversation_id: conversationId,
        sender_id: 'me', // Will be overridden
        content,
        is_read: false,
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, optimisticMsg]);

      const res = await api.post(`/messages/${conversationId}`, { content });
      
      // Update with real ID once success comes back
      setMessages(prev => prev.map(m => m.id === optimisticMsg.id ? res.data : m));
    } catch (error) {
      toast.error('Failed to send message');
      // Revert optimistic if error
      fetchMessages();
    }
  };

  const setTyping = async (isTyping: boolean) => {
    // We would use WebSockets here normally. For now, it's local only since it's just polling.
    // To properly sync typing via polling we'd need a `/typing` endpoint and store in Redis.
  };

  return { messages, loading, otherTyping, sendMessage, setTyping };
}

export function useStartConversation() {
  const startConversation = async (otherUserId: string): Promise<string | null> => {
    try {
      const res = await api.post('/messages/start', { otherUserId });
      return res.data.conversationId;
    } catch (error: any) {
      toast.error(error.message || 'Failed to start conversation');
      return null;
    }
  };

  return { startConversation };
}

export function useSearchMessages(conversationId: string | null) {
  const [results, setResults] = useState<Message[]>([]);
  const [searching, setSearching] = useState(false);

  const search = async (query: string) => {
    if (!conversationId || !query.trim()) {
      setResults([]);
      return;
    }
    
    // For now we'll mock client-side search since we have local messages
    // In a real app with pagination, this would hit a backend `/search` endpoint
  };

  return { results, searching, search };
}
