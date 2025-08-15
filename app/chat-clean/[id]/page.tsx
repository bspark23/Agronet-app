"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getChats, setChats, getUsers, generateId } from "@/lib/local-storage-utils"
import type { Chat, Message, User } from "@/lib/types"
import { Send, ArrowLeft, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function CleanChatPage() {
  const params = useParams()
  const chatId = params.id as string
  const router = useRouter()
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const { toast } = useToast()

  const [chat, setChat] = useState<Chat | null>(null)
  const [otherUser, setOtherUser] = useState<User | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return

    if (!isAuthenticated || !user) {
      router.push("/login")
      return
    }

    const allChats = getChats()
    const currentChat = allChats.find(c => c.id === chatId)

    if (!currentChat || !currentChat.participants.includes(user.id)) {
      toast({
        title: "Chat not found",
        description: "This chat doesn't exist or you don't have access.",
        variant: "destructive"
      })
      router.push("/chats")
      return
    }

    setChat(currentChat)
    
    const otherId = currentChat.participants.find(id => id !== user.id)
    if (otherId) {
      const other = getUsers().find(u => u.id === otherId)
      setOtherUser(other || null)
    }

    setLoading(false)
  }, [chatId, user, isAuthenticated, authLoading, router, toast])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !chat || !user || !otherUser) return

    const message: Message = {
      id: generateId(),
      senderId: user.id,
      receiverId: otherUser.id,
      content: newMessage.trim(),
      timestamp: Date.now()
    }

    const updatedChat = {
      ...chat,
      messages: [...chat.messages, message],
      lastMessageAt: Date.now()
    }

    const allChats = getChats().map(c => c.id === chat.id ? updatedChat : c)
    setChats(allChats)
    setChat(updatedChat)
    setNewMessage("")
  }

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-agronetGreen" />
      </div>
    )
  }

  if (!chat || !otherUser) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-4">Chat not found</p>
          <Button onClick={() => router.push("/chats")}>Back to Chats</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 flex flex-col container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6 pb-4 border-b">
          <Button variant="ghost" size="icon" onClick={() => router.push("/chats")}>
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-2xl font-bold text-agronetGreen">
            Chat with {otherUser.name}
          </h1>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 rounded-lg mb-4 min-h-[400px]">
          {chat.messages.length === 0 ? (
            <p className="text-center text-gray-500">No messages yet. Start the conversation!</p>
          ) : (
            chat.messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.senderId === user.id ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] p-3 rounded-lg shadow ${
                    message.senderId === user.id
                      ? "bg-agronetGreen text-white"
                      : "bg-white text-gray-800"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <span className="text-xs opacity-70 block mt-1">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" className="bg-agronetOrange hover:bg-agronetOrange/90">
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </main>
      <Footer />
    </div>
  )
}