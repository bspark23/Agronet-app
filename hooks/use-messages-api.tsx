import { useState, useEffect } from 'react';
import { messagesApi } from '@/lib/api';
import type { Message, MessageThread } from '@/lib/types';

export function useMessages() {
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [currentThread, setCurrentThread] = useState<MessageThread | null>(
    null,
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load user's threads
  const loadThreads = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await messagesApi.getThreads();
      if (response.success && Array.isArray(response.data)) {
        setThreads(response.data);
      } else {
        setThreads([]);
        setError('Invalid response format');
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load threads';
      setError(errorMessage);
      setThreads([]);
    } finally {
      setLoading(false);
    }
  };

  // Load messages for a specific thread
  const loadThreadMessages = async (threadId: string) => {
    try {
      setLoading(true);
      setError(null);

      // Load thread details
      const threadResponse = await messagesApi.getThread(threadId);
      if (threadResponse.success && threadResponse.data) {
        setCurrentThread(threadResponse.data);
      } else {
        throw new Error('Failed to load thread');
      }

      // Load messages
      const messagesResponse = await messagesApi.getThreadMessages(threadId);
      if (messagesResponse.success && Array.isArray(messagesResponse.data)) {
        setMessages(messagesResponse.data);
      } else {
        setMessages([]);
      }

      // Mark thread as read
      await messagesApi.markThreadAsRead(threadId);

      // Refresh unread count
      await loadUnreadCount();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load messages';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Send a message
  const sendMessage = async (messageData: {
    threadId?: string;
    receiverId: string;
    content: string;
    buyerId?: string;
    farmerId?: string;
  }) => {
    try {
      setError(null);
      const response = await messagesApi.createMessage(messageData);

      if (response.success && response.data) {
        // Add message to current messages if we're viewing this thread
        if (
          messageData.threadId &&
          currentThread?._id === messageData.threadId
        ) {
          setMessages(prev => [...prev, response.data!]);
        }

        // Refresh threads to update last message
        await loadThreads();
      }

      return response;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Create or get existing thread
  const createOrGetThread = async (buyerId: string, farmerId: string) => {
    try {
      setError(null);
      const thread = await messagesApi.createThread({ buyerId, farmerId });

      // Refresh threads list
      await loadThreads();

      return thread;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to create thread';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Load unread message count
  const loadUnreadCount = async () => {
    try {
      const result = await messagesApi.getUnreadCount();
      setUnreadCount(result.count);
    } catch (err) {
      console.error('Failed to load unread count:', err);
    }
  };

  // Delete message
  const deleteMessage = async (messageId: string) => {
    try {
      setError(null);
      await messagesApi.deleteMessage(messageId);

      // Remove message from current messages
      setMessages(prev => prev.filter(msg => msg._id !== messageId));

      return { success: true };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to delete message';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Load unread count on mount
  useEffect(() => {
    loadUnreadCount();
  }, []);

  return {
    threads,
    currentThread,
    messages,
    unreadCount,
    loading,
    error,
    loadThreads,
    loadThreadMessages,
    sendMessage,
    createOrGetThread,
    deleteMessage,
    loadUnreadCount,
    setCurrentThread,
    setMessages,
  };
}
