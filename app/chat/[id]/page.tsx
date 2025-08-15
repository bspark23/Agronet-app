"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, ArrowLeft, Loader2, Package, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  getChats,
  setChats,
  getUsers,
  getProducts,
  getOrderForms,
  setOrderForms,
  generateId,
} from "@/lib/local-storage-utils";
import type { Chat, Message, User, Product, OrderForm } from "@/lib/types";

// Enhanced Order Form Modal Component (inline to avoid import issues)
function EnhancedOrderFormModal({
  product,
  sellerId,
  buyerId,
  onSubmit,
  onCancel,
}: {
  product: Product;
  sellerId: string;
  buyerId: string;
  onSubmit: (orderForm: OrderForm) => void;
  onCancel: () => void;
}) {
  const [quantity, setQuantity] = useState(1);
  const [totalPrice, setTotalPrice] = useState(product.price);

  useEffect(() => {
    setTotalPrice(quantity * product.price);
  }, [quantity, product.price]);

  const handleQuantityChange = (value: string) => {
    const numValue = parseInt(value) || 1;
    const maxQuantity = Math.min(numValue, product.quantity);
    setQuantity(Math.max(1, maxQuantity));
  };

  const handleSubmit = () => {
    const orderForm: OrderForm = {
      id: generateId(),
      productId: product.id,
      productName: product.name,
      productPrice: product.price,
      productImage: product.image,
      productDescription: product.description,
      quantity,
      totalPrice,
      sellerId,
      buyerId,
      status: "pending",
      createdAt: Date.now(),
    };
    onSubmit(orderForm);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-agronetGreen flex items-center gap-2">
            <Package className="h-5 w-5" />
            Create Order Form
          </h3>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          {/* Product Info */}
          <div className="flex gap-3">
            <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
              <img
                src={product.image || "/placeholder.svg?height=64&width=64"}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 truncate">
                {product.name}
              </h4>
              <p className="text-sm text-gray-600 line-clamp-2">
                {product.description}
              </p>
              <p className="text-lg font-bold text-agronetGreen">
                ${product.price.toFixed(2)}
              </p>
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Quantity Input */}
          <div className="space-y-2">
            <label htmlFor="quantity" className="text-sm font-medium">
              Quantity (Available: {product.quantity})
            </label>
            <Input
              id="quantity"
              type="number"
              min="1"
              max={product.quantity}
              value={quantity}
              onChange={(e) => handleQuantityChange(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Total Price */}
          <div className="bg-agronetGreen/10 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium text-agronetGreen">
                Total Price
              </span>
              <p className="text-2xl font-bold text-agronetGreen">
                ${totalPrice.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-agronetGreen hover:bg-agronetGreen/90"
            >
              Send Order Form
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  const params = useParams();
  const chatId = params.id as string;
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { toast } = useToast();

  // All state hooks declared first
  const [chat, setChat] = useState<Chat | null>(null);
  const [otherParticipant, setOtherParticipant] = useState<User | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [sellerProducts, setSellerProducts] = useState<Product[]>([]);
  const [orderForms, setOrderFormsState] = useState<OrderForm[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // All useEffect hooks
  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated || !user) {
      router.push("/login");
      toast({
        title: "Authentication Required",
        description: "Please log in to view chats.",
        variant: "destructive",
      });
      return;
    }

    try {
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
    } catch (error) {
      console.error("Error loading chat:", error);
      toast({
        title: "Error Loading Chat",
        description: "There was an error loading the chat. Please try again.",
        variant: "destructive",
      });
      router.push("/chats");
    }
  }, [chatId, isAuthenticated, user, authLoading, router, toast]);

  useEffect(() => {
    // Scroll to bottom on new message
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat?.messages]);

  // All handler functions
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !chat || !user || !otherParticipant) return;

    const messageData = {
      threadId: currentThread._id,
      receiverId: otherParticipant._id,
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
    setChat(updatedChat);
    setNewMessage("");
  };

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const handleSendOrderForm = () => {
    // Get all products if seller has none assigned
    let availableProducts = sellerProducts;
    if (availableProducts.length === 0) {
      availableProducts = getProducts().filter((p) => p.sellerId === user?.id);
    }

    // If still no products, create a default product for demo
    if (availableProducts.length === 0) {
      const defaultProduct: Product = {
        id: generateId(),
        name: "Sample Product",
        description: "This is a sample product for demonstration",
        price: 10.0,
        quantity: 100,
        image: "/placeholder.svg?height=400&width=600",
        sellerId: user?.id || "",
        category: "General",
      };
      availableProducts = [defaultProduct];
    }

    setSelectedProduct(availableProducts[0]);
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
    console.log("Accepting order form:", orderFormId);

    const allOrderForms = getOrderForms() || [];
    const updatedOrderForms = allOrderForms.map((form) =>
      form.id === orderFormId ? { ...form, status: "accepted" as const } : form
    );

    setOrderForms(updatedOrderForms);

    // Update local state
    const filteredForms = updatedOrderForms.filter(
      (form) =>
        (form.sellerId === user?.id && form.buyerId === otherParticipant?.id) ||
        (form.buyerId === user?.id && form.sellerId === otherParticipant?.id)
    );

    setOrderFormsState(filteredForms);

    toast({
      title: "Order Accepted!",
      description:
        "You have accepted the order. You can now proceed to payment.",
      variant: "default",
    });
  };

  const handleRejectOrderForm = (orderFormId: string) => {
    console.log("Rejecting order form:", orderFormId);

    const allOrderForms = getOrderForms() || [];
    const updatedOrderForms = allOrderForms.map((form) =>
      form.id === orderFormId ? { ...form, status: "rejected" as const } : form
    );

    setOrderForms(updatedOrderForms);

    // Update local state
    const filteredForms = updatedOrderForms.filter(
      (form) =>
        (form.sellerId === user?.id && form.buyerId === otherParticipant?.id) ||
        (form.buyerId === user?.id && form.sellerId === otherParticipant?.id)
    );

    setOrderFormsState(filteredForms);

    toast({
      title: "Order Rejected",
      description: "You have rejected the order.",
      variant: "default",
    });
  };

  // Early returns after all hooks
  if (authLoading || loading) {
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

  if (!chat || !user || !otherParticipant) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Chat not found or access denied</p>
          <Button
            onClick={() => router.push("/chats")}
            className="bg-agronetGreen hover:bg-agronetGreen/90"
          >
            Back to Chats
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-col min-h-screen'>
      <Navbar />
      <main className="flex-1 flex flex-col container mx-auto px-4 py-8 md:px-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-200">
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
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 rounded-lg shadow-inner mb-4 min-h-[400px]">
          {chat.messages.length === 0 && orderForms.length === 0 ? (
            <p className="text-center text-gray-500">
              No messages yet. Start the conversation!
            </p>
          ) : (
            <>
              {/* Regular Messages */}
              {chat.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.senderId === user.id
                      ? "justify-end"
                      : "justify-start"
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
                </div>
              ))}

              {/* Order Forms */}
              {orderForms.map((orderForm) => (
                <div
                  key={orderForm.id}
                  className={`flex ${
                    orderForm.sellerId === user.id
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div className="max-w-sm bg-white rounded-lg shadow-md p-4 border">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="h-4 w-4 text-agronetGreen" />
                      <span className="font-semibold text-agronetGreen">
                        Order Form
                      </span>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          orderForm.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : orderForm.status === "accepted"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {orderForm.status}
                      </span>
                    </div>
                    <h4 className="font-medium">{orderForm.productName}</h4>
                    <p className="text-sm text-gray-600">
                      Quantity: {orderForm.quantity}
                    </p>
                    <p className="text-sm font-bold text-agronetGreen">
                      Total: ${orderForm.totalPrice.toFixed(2)}
                    </p>

                    {/* Action buttons for buyers */}
                    {orderForm.buyerId === user.id &&
                      orderForm.status === "pending" && (
                        <div className="flex gap-2 mt-3">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => handleRejectOrderForm(orderForm.id)}
                          >
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1 bg-agronetGreen hover:bg-agronetGreen/90"
                            onClick={() => handleAcceptOrderForm(orderForm.id)}
                          >
                            Accept
                          </Button>
                        </div>
                      )}

                    {/* Payment button for accepted orders */}
                    {orderForm.buyerId === user.id &&
                      orderForm.status === "accepted" && (
                        <Button
                          size="sm"
                          className="w-full mt-3 bg-agronetOrange hover:bg-agronetOrange/90"
                          onClick={() =>
                            router.push(`/checkout/${orderForm.id}`)
                          }
                        >
                          Proceed to Payment
                        </Button>
                      )}
                  </div>
                </div>
              ))}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            placeholder='Type your message...'
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            className='flex-1'
            disabled={messagesLoading}
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

      {/* Enhanced Order Form Modal */}
      {showOrderForm && selectedProduct && otherParticipant && (
        <EnhancedOrderFormModal
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
