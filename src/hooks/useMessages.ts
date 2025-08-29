import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: Date;
}

export interface Conversation {
  id: string;
  participant1: string;
  participant2: string;
  lastMessage?: Message;
  unreadCount: number;
  otherParticipant: {
    id: string;
    name: string;
    profileImage?: string;
  };
  updatedAt: Date;
}

export const useMessages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

  // Fetch conversations when user changes
  useEffect(() => {
    if (user && user.id !== 'demo-user-id') {
      fetchConversations();
    } else {
      setConversations([]);
      setMessages([]);
    }
  }, [user]);

  // Subscribe to real-time updates for current conversation
  useEffect(() => {
    if (!currentConversationId || !user || user.id === 'demo-user-id') return;

    const channel = supabase
      .channel(`messages:${currentConversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${currentConversationId}`,
        },
        (payload) => {
          const newMessage: Message = {
            id: payload.new.id,
            conversationId: payload.new.conversation_id,
            senderId: payload.new.sender_id,
            content: payload.new.content,
            isRead: payload.new.is_read,
            createdAt: new Date(payload.new.created_at),
          };
          setMessages(prev => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentConversationId, user]);

  const fetchConversations = async () => {
    if (!user || user.id === 'demo-user-id') return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          participant_1_profile:profiles!conversations_participant_1_fkey(id, name, profile_image),
          participant_2_profile:profiles!conversations_participant_2_fkey(id, name, profile_image)
        `)
        .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const conversationsWithDetails = await Promise.all(
        data.map(async (conv) => {
          // Get last message
          const { data: lastMessageData } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          // Get unread count
          const { count: unreadCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .eq('is_read', false)
            .neq('sender_id', user.id);

          // Determine other participant
          const isParticipant1 = conv.participant_1 === user.id;
          const otherParticipantData = isParticipant1 
            ? conv.participant_2_profile 
            : conv.participant_1_profile;

          const conversation: Conversation = {
            id: conv.id,
            participant1: conv.participant_1,
            participant2: conv.participant_2,
            lastMessage: lastMessageData ? {
              id: lastMessageData.id,
              conversationId: lastMessageData.conversation_id,
              senderId: lastMessageData.sender_id,
              content: lastMessageData.content,
              isRead: lastMessageData.is_read,
              createdAt: new Date(lastMessageData.created_at),
            } : undefined,
            unreadCount: unreadCount || 0,
            otherParticipant: {
              id: otherParticipantData.id,
              name: otherParticipantData.name || 'Usuario',
              profileImage: otherParticipantData.profile_image || undefined,
            },
            updatedAt: new Date(conv.updated_at),
          };

          return conversation;
        })
      );

      setConversations(conversationsWithDetails);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    if (!user || user.id === 'demo-user-id') return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formattedMessages: Message[] = data.map(msg => ({
        id: msg.id,
        conversationId: msg.conversation_id,
        senderId: msg.sender_id,
        content: msg.content,
        isRead: msg.is_read,
        createdAt: new Date(msg.created_at),
      }));

      setMessages(formattedMessages);
      setCurrentConversationId(conversationId);

      // Mark messages as read
      await markMessagesAsRead(conversationId);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (conversationId: string, content: string) => {
    if (!user || user.id === 'demo-user-id' || !content.trim()) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: content.trim(),
        });

      if (error) throw error;

      // Refresh conversations to update last message
      await fetchConversations();
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  const createConversation = async (otherUserId: string): Promise<string> => {
    if (!user || user.id === 'demo-user-id') throw new Error('User must be authenticated');

    try {
      const { data, error } = await supabase.rpc('get_or_create_conversation', {
        user1_id: user.id,
        user2_id: otherUserId,
      });

      if (error) throw error;

      await fetchConversations();
      return data;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  };

  const markMessagesAsRead = async (conversationId: string) => {
    if (!user || user.id === 'demo-user-id') return;

    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const getTotalUnreadCount = () => {
    return conversations.reduce((total, conv) => total + conv.unreadCount, 0);
  };

  return {
    conversations,
    messages,
    isLoading,
    currentConversationId,
    fetchConversations,
    fetchMessages,
    sendMessage,
    createConversation,
    markMessagesAsRead,
    getTotalUnreadCount,
  };
};