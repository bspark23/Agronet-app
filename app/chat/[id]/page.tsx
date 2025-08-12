"use client";

import type React from "react";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import {
  getChats,
  setChats,
  getUsers,
  getProducts,
  getOrderForms,
  setOrderForms,
  type Chat,
  type Message,
  generateId,
  type User,
  type Product,
  type OrderForm,
} from "@/lib/local-storage-utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Loader2, ArrowLeft, Package } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { OrderFormComponent } from "@/components/order-form";
import { ChatOrderForm } from "@/components/chat-order-form";

export default function ChatPage() {
  const params = useParams();
  const chatId = params.id as string;
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [chat, setChat] = useState<Chat | null>(null);
  const [otherParticipant, setOtherParticipant] = useState<User | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [sellerProducts, setSellerProducts] = useState<Product[]>([]);
  const [orderForms, setOrderFormsState] = useState<OrderForm[]>([]);
  const [mounted, setMounted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || !user) {
        router.push("/login");
        toast({
          title: "Authentication Required",
          description: "Please log in to view chats.",
          variant: "destructive",
        });
        return;
      }

      const allChats = getChats();
      const currentChat = allChats.find((c) => c.id === chatId);

      if (!currentChat || !currentChat.participants.includes(user.id)) {
        toast({
          title: "Chat Not Found",
          description:
            "The chat you are looking for does not exist or you don't have access.",
          variant: "destructive",
        });
        router.push("/chats");
        return;
      }

      setChat(currentChat);
      const otherId = currentChat.participants.find((pId) => pId !== user.id);
      if (otherId) {
        const otherUser = getUsers().find((u) => u.id === otherId) || null;
        setOtherParticipant(otherUser);

        // If current user is seller, load their products
        if (user.role === "seller") {
          const products = getProducts().filter((p) => p.sellerId === user.id);
          setSellerProducts(products);
        }
      }

      // Load order forms for this chat
      const allOrderForms = getOrderForms() || [];
      const chatOrderForms = allOrderForms.filter(
        (form) =>
          (form.sellerId === user.id && form.buyerId === otherId) ||
          (form.buyerId === user.id && form.sellerId === otherId)
      );
      setOrderFormsState(chatOrderForms);

      setLoading(false);
    }
  }, [chatId, isAuthenticated, user, authLoading, router, toast]);

  useEffect(() => {
    // Scroll to bottom on new message
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat?.messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !chat || !user || !otherParticipant) return;

    const message: Message = {
      id: generateId(),
      senderId: user.id,
      receiverId: otherParticipant.id,
      content: newMessage.trim(),
      timestamp: Date.now(),
    };

    const updatedChat = {
      ...chat,
      messages: [...chat.messages, message],
      lastMessageAt: Date.now(),
    };

    const allChats = getChats().map((c) =>
      c.id === chat.id ? updatedChat : c
    );
    setChats(allChats);
    setChat(updatedChat); // Update local state to trigger re-render
    setNewMessage("");
  };

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const handleSendOrderForm = () => {
    if (sellerProducts.length === 0) {
      toast({
        title: "No Products",
        description: "You need to have products listed to send an order form.",
        variant: "destructive",
      });
      return;
    }

    // For simplicity, use the first product. In a real app, you'd let the seller choose
    setSelectedProduct(sellerProducts[0]);
    setShowOrderForm(true);
  };

  const handleOrderFormSubmit = (orderForm: OrderForm) => {
    const allOrderForms = getOrderForms() || [];
    allOrderForms.push(orderForm);
    setOrderForms(allOrderForms);
    setOrderFormsState([...orderForms, orderForm]);
    setShowOrderForm(false);
    setSelectedProduct(null);

    toast({
      title: "Order Form Sent!",
      description: "Your order form has been sent to the buyer.",
      variant: "default",
    });
  };

  const handleOrderFormCancel = () => {
    setShowOrderForm(false);
    setSelectedProduct(null);
  };

  const handleAcceptOrderForm = (orderFormId: string) => {
    const allOrderForms = getOrderForms() || [];
    const updatedOrderForms = allOrderForms.map((form) =>
      form.id === orderFormId ? { ...form, status: "accepted" as const } : form
    );
    setOrderForms(updatedOrderForms);
    setOrderFormsState(
      updatedOrderForms.filter(
        (form) =>
          (form.sellerId === user?.id &&
            form.buyerId === otherParticipant?.id) ||
          (form.buyerId === user?.id && form.sellerId === otherParticipant?.id)
      )
    );

    toast({
      title: "Order Accepted!",
      description:
        "You have accepted the order. The buyer can now proceed to payment.",
      variant: "default",
    });
  };

  const handleRejectOrderForm = (orderFormId: string) => {
    const allOrderForms = getOrderForms() || [];
    const updatedOrderForms = allOrderForms.map((form) =>
      form.id === orderFormId ? { ...form, status: "rejected" as const } : form
    );
    setOrderForms(updatedOrderForms);
    setOrderFormsState(
      updatedOrderForms.filter(
        (form) =>
          (form.sellerId === user?.id &&
            form.buyerId === otherParticipant?.id) ||
          (form.buyerId === user?.id && form.sellerId === otherParticipant?.id)
      )
    );

    toast({
      title: "Order Rejected",
      description: "You have rejected the order.",
      variant: "default",
    });
  };

  const handleProceedToPayment = (orderFormId: string) => {
    router.push(`/checkout/${orderFormId}`);
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-agronetGreen" />
      </div>
    );
  }

  if (!chat || !user || !otherParticipant) {
    return null; // Should be redirected by useEffect
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 flex flex-col container mx-auto px-4 py-8 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-200"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/chats")}
          >
            <ArrowLeft className="h-6 w-6" />
            <span className="sr-only">Back to chats</span>
          </Button>
          <Avatar className="h-10 w-10">
            <AvatarImage
              src="/placeholder.svg?height=40&width=40"
              alt={otherParticipant.name}
            />
            <AvatarFallback>
              {otherParticipant.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <h1 className="text-2xl font-bold text-agronetGreen">
            {otherParticipant.name}
          </h1>
          {user.role === "seller" && (
            <Button
              onClick={handleSendOrderForm}
              className="ml-auto bg-agronetOrange hover:bg-agronetOrange/90 text-white"
              size="sm"
            >
              <Package className="h-4 w-4 mr-2" />
              Send Order Form
            </Button>
          )}
        </motion.div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 rounded-lg shadow-inner mb-4">
          <AnimatePresence initial={false}>
            {chat.messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`flex ${
                  message.senderId === user.id ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[70%] p-3 rounded-lg shadow-md ${
                    message.senderId === user.id
                      ? "bg-agronetGreen text-white rounded-br-none"
                      : "bg-white text-gray-800 rounded-bl-none"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <span
                    className={`block text-xs mt-1 ${
                      message.senderId === user.id
                        ? "text-agronetGreen-100"
                        : "text-gray-500"
                    } text-right`}
                  >
                    {formatTimestamp(message.timestamp)}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Order Forms */}
          {mounted &&
            orderForms.map((orderForm) => (
              <motion.div
                key={orderForm.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${
                  orderForm.sellerId === user.id
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <ChatOrderForm
                  orderForm={orderForm}
                  isCurrentUser={orderForm.sellerId === user.id}
                  onAccept={() => handleAcceptOrderForm(orderForm.id)}
                  onReject={() => handleRejectOrderForm(orderForm.id)}
                  onProceedToPayment={() =>
                    handleProceedToPayment(orderForm.id)
                  }
                />
              </motion.div>
            ))}

          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1"
          />
          <Button
            type="submit"
            className="bg-agronetOrange hover:bg-agronetOrange/90 text-white"
          >
            <Send className="h-5 w-5" />
            <span className="sr-only">Send message</span>
          </Button>
        </form>
      </main>
      <Footer />

      {/* Order Form Modal */}
      {mounted && showOrderForm && selectedProduct && otherParticipant && (
        <OrderFormComponent
          product={selectedProduct}
          sellerId={user.id}
          buyerId={otherParticipant.id}
          onSubmit={handleOrderFormSubmit}
          onCancel={handleOrderFormCancel}
        />
      )}
    </div>
  );
}
