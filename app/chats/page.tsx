"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { getChats, getUsers, type Chat, type User } from "@/lib/local-storage-utils"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageSquare, Loader2 } from "lucide-react"
import { motion } from "framer-motion"

export default function ChatsPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()
  const [userChats, setUserChats] = useState<Chat[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || !user) {
        router.push("/login")
      } else {
        loadChats()
        setLoading(false)
      }
    }
  }, [isAuthenticated, user, authLoading, router])

  const loadChats = () => {
    const allChats = getChats()
    const filteredChats = allChats
      .filter((chat) => chat.participants.includes(user?.id || ""))
      .sort((a, b) => b.lastMessageAt - a.lastMessageAt) // Sort by most recent message
    setUserChats(filteredChats)
  }

  const getOtherParticipant = (chat: Chat): User | undefined => {
    const otherParticipantId = chat.participants.find((id) => id !== user?.id)
    return otherParticipantId ? getUsers().find((u) => u.id === otherParticipantId) : undefined
  }

  const getLastMessagePreview = (chat: Chat): string => {
    if (chat.messages.length === 0) return "No messages yet."
    const lastMessage = chat.messages[chat.messages.length - 1]
    const sender = getUsers().find((u) => u.id === lastMessage.senderId)
    const senderName = sender?.id === user?.id ? "You" : sender?.name.split(" ")[0] || "Unknown"
    return `${senderName}: ${lastMessage.content.substring(0, 50)}${lastMessage.content.length > 50 ? "..." : ""}`
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

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-agronetGreen" />
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return null // Should be redirected by useEffect
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

        {userChats.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-center text-gray-600 text-lg mt-10"
          >
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>You don&apos;t have any active chats yet.</p>
            <p>Start by messaging a seller from a product page!</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userChats.map((chat, index) => {
              const otherParticipant = getOtherParticipant(chat)
              if (!otherParticipant) return null

              return (
                <motion.div
                  key={chat.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                >
                  <Card
                    className="cursor-pointer hover:shadow-lg transition-shadow duration-300"
                    onClick={() => router.push(`/chat/${chat.id}`)}
                  >
                    <CardContent className="flex items-center p-4 gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src="/placeholder.svg?height=48&width=48" alt={otherParticipant.name} />
                        <AvatarFallback>{otherParticipant.name.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 overflow-hidden">
                        <div className="flex justify-between items-center">
                          <h3 className="font-semibold text-lg truncate">{otherParticipant.name}</h3>
                          <span className="text-xs text-gray-500">{formatTimestamp(chat.lastMessageAt)}</span>
                        </div>
                        <p className="text-sm text-gray-600 truncate">{getLastMessagePreview(chat)}</p>
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
