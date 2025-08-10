"use client"

import { useEffect, useState } from "react"
i  }

  if (error) {} from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { useMessages } from "@/hooks/use-messages-api"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import type { MessageThread, User } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageSquare, Loader2 } from "lucide-react"
import { motion } from "framer-motion"

export default function ChatsPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()
  const { 
    threads, 
    loading: messagesLoading, 
    error, 
    loadThreads 
  } = useMessages()

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || !user) {
        router.push("/login")
      } else {
        loadThreads()
      }
    }
  }, [isAuthenticated, user, authLoading, router, loadThreads])

  const getOtherParticipant = (thread: MessageThread): User | undefined => {
    // Get the other participant (not the current user)
    const otherParticipant = thread.buyerId?._id === user?.id 
      ? thread.farmerId 
      : thread.buyerId
    return otherParticipant as User
  }

  const formatLastMessageTime = (date: Date | string): string => {
    const messageDate = new Date(date)
    const now = new Date()
    const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      })
    } else {
      return messageDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })
    }
  }

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays <= 1) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else if (diffDays <= 7) {
      return date.toLocaleDateString([], { weekday: "short" })
    } else {
      return date.toLocaleDateString()
    }
  }

  if (authLoading || messagesLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-agronetGreen" />
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return null // Should be redirected by useEffect
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8 md:px-6">
          <div className="text-center text-red-600">
            <p>Error loading chats: {error}</p>
            <button 
              onClick={loadThreads}
              className="mt-4 px-4 py-2 bg-agronetGreen text-white rounded hover:bg-green-600"
            >
              Try Again
            </button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 md:px-6">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold text-agronetGreen mb-6 text-center"
        >
          Your Chats
        </motion.h1>

        {threads.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-center text-gray-600 text-lg mt-10"
          >
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>You don&apos;t have any active chats yet.</p>
            <p>Start by messaging a farmer from a product page!</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {threads.map((thread, index) => {
              const otherParticipant = getOtherParticipant(thread)
              if (!otherParticipant) return null

              return (
                <motion.div
                  key={thread._id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                >
                  <Card
                    className="cursor-pointer hover:shadow-lg transition-shadow duration-300"
                    onClick={() => router.push(`/chat/${thread._id}`)}
                  >
                    <CardContent className="flex items-center p-4 gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src="/placeholder.svg?height=48&width=48" alt={otherParticipant.fullName} />
                        <AvatarFallback>{otherParticipant.fullName?.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 overflow-hidden">
                        <div className="flex justify-between items-center">
                          <h3 className="font-semibold text-lg truncate">{otherParticipant.fullName}</h3>
                          <span className="text-xs text-gray-500">
                            {formatLastMessageTime(thread.lastMessageAt)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 truncate">
                          {otherParticipant.role === 'farmer' ? 'Farmer' : 'Buyer'} • Click to chat
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
