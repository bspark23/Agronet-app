"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  generateId,
} from "@/lib/local-storage-utils";
import type { Chat, User, Product, OrderForm } from "@/lib/types";
import { useRouter } from "next/navigation";

export default function TestChatPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [chats, setChatsState] = useState<Chat[]>([]);
  const [users, setUsersState] = useState<User[]>([]);
  const [products, setProductsState] = useState<Product[]>([]);
  const [orderForms, setOrderFormsState] = useState<OrderForm[]>([]);

  useEffect(() => {
    if (isAuthenticated && user) {
      setChatsState(getChats());
      setUsersState(getUsers());
      setProductsState(getProducts());
      setOrderFormsState(getOrderForms());
    }
  }, [isAuthenticated, user]);

  const createTestChat = () => {
    if (!user) return;

    const allUsers = getUsers();
    const otherUser = allUsers.find(
      (u) => u.id !== user.id && u.role !== user.role
    );

    if (!otherUser) {
      alert("No other users found to chat with!");
      return;
    }

    const newChat: Chat = {
      id: generateId(),
      participants: [user.id, otherUser.id],
      messages: [],
      lastMessageAt: Date.now(),
    };

    const allChats = getChats();
    allChats.push(newChat);
    setChats(allChats);
    setChatsState(allChats);

    alert(`Created chat with ${otherUser.name}`);
    router.push(`/chat/${newChat.id}`);
  };

  const createTestOrderForm = () => {
    if (!user) return;

    const allUsers = getUsers();
    const allProducts = getProducts();

    const buyer = allUsers.find((u) => u.role === "buyer");
    const seller = allUsers.find((u) => u.role === "seller");
    const product = allProducts[0];

    if (!buyer || !seller || !product) {
      alert("Missing test data!");
      return;
    }

    const orderForm: OrderForm = {
      id: generateId(),
      productId: product.id,
      productName: product.name,
      productPrice: product.price,
      productImage: product.image,
      productDescription: product.description,
      quantity: 2,
      totalPrice: product.price * 2,
      sellerId: seller.id,
      buyerId: buyer.id,
      status: "pending",
      createdAt: Date.now(),
    };

    const allOrderForms = getOrderForms();
    allOrderForms.push(orderForm);
    setOrderForms(allOrderForms);
    setOrderFormsState(allOrderForms);

    alert("Created test order form!");
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="mb-4">Please log in to test chat functionality</p>
            <Button onClick={() => router.push("/login")}>Login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-agronetGreen mb-8 text-center">
          Chat System Test
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Current User</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                <strong>Name:</strong> {user?.name}
              </p>
              <p>
                <strong>Role:</strong> {user?.role}
              </p>
              <p>
                <strong>Email:</strong> {user?.email}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                <strong>Total Users:</strong> {users.length}
              </p>
              <p>
                <strong>Total Chats:</strong> {chats.length}
              </p>
              <p>
                <strong>Total Products:</strong> {products.length}
              </p>
              <p>
                <strong>Total Order Forms:</strong> {orderForms.length}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Button
            onClick={createTestChat}
            className="bg-agronetGreen hover:bg-agronetGreen/90"
          >
            Create Test Chat
          </Button>
          <Button
            onClick={createTestOrderForm}
            className="bg-agronetOrange hover:bg-agronetOrange/90"
          >
            Create Test Order Form
          </Button>
          <Button onClick={() => router.push("/chats")} variant="outline">
            View All Chats
          </Button>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Existing Chats</CardTitle>
            </CardHeader>
            <CardContent>
              {chats.length === 0 ? (
                <p className="text-gray-500">No chats found</p>
              ) : (
                <div className="space-y-2">
                  {chats.map((chat) => {
                    const otherUserId = chat.participants.find(
                      (id) => id !== user?.id
                    );
                    const otherUser = users.find((u) => u.id === otherUserId);
                    return (
                      <div
                        key={chat.id}
                        className="flex items-center justify-between p-2 border rounded"
                      >
                        <span>Chat with {otherUser?.name || "Unknown"}</span>
                        <Button
                          size="sm"
                          onClick={() => router.push(`/chat/${chat.id}`)}
                        >
                          Open Chat
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order Forms</CardTitle>
            </CardHeader>
            <CardContent>
              {orderForms.length === 0 ? (
                <p className="text-gray-500">No order forms found</p>
              ) : (
                <div className="space-y-2">
                  {orderForms.map((form) => (
                    <div key={form.id} className="p-2 border rounded">
                      <p>
                        <strong>Product:</strong> {form.productName}
                      </p>
                      <p>
                        <strong>Status:</strong> {form.status}
                      </p>
                      <p>
                        <strong>Total:</strong> ${form.totalPrice.toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
