"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { useMessages } from '@/hooks/use-messages-api';
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import type { Message, User } from '@/lib/types';
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, Loader2, ArrowLeft } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/hooks/use-toast"

export default function ChatPage() {
  const params = useParams()
  const threadId = params.id as string;
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const {
    currentThread,
    messages,
    loading: messagesLoading,
    error,
    loadThreadMessages,
    sendMessage,
  } = useMessages();

  const [newMessage, setNewMessage] = useState('');
  const [otherParticipant, setOtherParticipant] = useState<User | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || !user) {
        router.push('/login');
        toast({
          title: 'Authentication Required',
          description: 'Please log in to view chats.',
          variant: 'destructive',
        });
        return;
      }

      // Load thread messages
      loadThreadMessages(threadId);
    }
  }, [
    authLoading,
    isAuthenticated,
    user,
    threadId,
    router,
    toast,
    loadThreadMessages,
  ]);

  useEffect(() => {
    if (currentThread && user) {
      // Determine the other participant
      const other =
        currentThread.buyerId === user._id
          ? currentThread.farmerId
          : currentThread.buyerId;
      // Since buyerId and farmerId are strings, create a placeholder user object
      setOtherParticipant({
        _id: other,
        firstname: 'User',
        lastname: '',
        email: '',
        emailVerified: false,
        accountStatus: 'active',
        role: currentThread.buyerId === user._id ? 'farmer' : 'buyer',
        createdAt: '',
        updatedAt: '',
      } as User);
    }
  }, [currentThread, user]);

  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: error,
        variant: 'destructive',
      });
    }
  }, [error, toast]);
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentThread || !user || !otherParticipant)
      return;

    const messageData = {
      threadId: currentThread._id,
      receiverId: otherParticipant._id,
      content: newMessage.trim(),
    };

    const result = await sendMessage(messageData);

    if (result.success) {
      setNewMessage('');
      toast({
        title: 'Message sent',
        description: 'Your message has been delivered.',
      });
    } else {
      toast({
        title: 'Failed to send message',
        description: result.error || 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const formatTimestamp = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (authLoading || messagesLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-agronetGreen' />
      </div>
    );
  }

  if (!currentThread || !user || !otherParticipant) {
    return (
      <div className='flex min-h-screen flex-col'>
        <Navbar />
        <main className='flex-1 container mx-auto px-4 py-8 md:px-6'>
          <div className='text-center text-gray-600'>
            <p>Chat not found or you don't have access.</p>
            <Button
              onClick={() => router.push('/chats')}
              className='mt-4 bg-agronetGreen hover:bg-green-600'>
              Back to Chats
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className='flex flex-col min-h-screen'>
      <Navbar />
      <main className='flex-1 flex flex-col container mx-auto px-4 py-8 md:px-6'>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='flex items-center gap-4 mb-6 pb-4 border-b border-gray-200'>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => router.push('/chats')}>
            <ArrowLeft className='h-6 w-6' />
            <span className='sr-only'>Back to chats</span>
          </Button>
          <Avatar className='h-10 w-10'>
            <AvatarImage
              src='/placeholder.svg?height=40&width=40'
              alt={`${otherParticipant?.firstname} ${otherParticipant?.lastname}`}
            />
            <AvatarFallback>
              {otherParticipant?.firstname?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className='text-2xl font-bold text-agronetGreen'>
              {`${otherParticipant?.firstname || 'User'} ${
                otherParticipant?.lastname || ''
              }`}
            </h1>
            <p className='text-sm text-gray-600'>
              {otherParticipant?.role === 'farmer' ? 'Farmer' : 'Buyer'}
            </p>
          </div>
        </motion.div>

        <div className='flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 rounded-lg shadow-inner mb-4'>
          <AnimatePresence initial={false}>
            {messages.map((message, index) => (
              <motion.div
                key={message._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`flex ${
                  message.senderId === user._id
                    ? 'justify-end'
                    : 'justify-start'
                }`}>
                <div
                  className={`max-w-[70%] p-3 rounded-lg shadow-md ${
                    message.senderId === user._id
                      ? 'bg-agronetGreen text-white rounded-br-none'
                      : 'bg-white text-gray-800 rounded-bl-none'
                  }`}>
                  <p className='text-sm'>{message.content}</p>
                  <span
                    className={`block text-xs mt-1 ${
                      message.senderId === user._id
                        ? 'text-green-100'
                        : 'text-gray-500'
                    } text-right`}>
                    {formatTimestamp(message.createdAt)}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className='flex gap-2'>
          <Input
            placeholder='Type your message...'
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            className='flex-1'
            disabled={messagesLoading}
          />
          <Button
            type='submit'
            className='bg-agronetOrange hover:bg-agronetOrange/90 text-white'
            disabled={messagesLoading || !newMessage.trim()}>
            <Send className='h-5 w-5' />
            <span className='sr-only'>Send message</span>
          </Button>
        </form>
      </main>
      <Footer />
    </div>
  );
}
