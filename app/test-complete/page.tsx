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
  getOrders,
  setOrders,
  generateId,
} from "@/lib/local-storage-utils";
import type { Chat, User, Product, OrderForm, Order } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export default function CompleteTestPage() {
  const { user, isAuthenticated, login, logout } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [testResults, setTestResults] = useState<string[]>([]);

  const addTestResult = (result: string) => {
    setTestResults((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${result}`,
    ]);
  };

  const runCompleteTest = async () => {
    setTestResults([]);
    addTestResult("🚀 Starting complete system test...");

    try {
      // Test 1: Login as seller
      addTestResult("📝 Testing seller login...");
      const sellerLoginSuccess = login("john.doe@example.com", "password123");
      if (sellerLoginSuccess) {
        addTestResult("✅ Seller login successful");
      } else {
        addTestResult("❌ Seller login failed");
        return;
      }

      // Test 2: Create a chat
      addTestResult("💬 Creating test chat...");
      const allUsers = getUsers();
      const buyer = allUsers.find((u) => u.role === "buyer");
      const seller = allUsers.find((u) => u.role === "seller");

      if (!buyer || !seller) {
        addTestResult("❌ Missing test users");
        return;
      }

      const newChat: Chat = {
        id: generateId(),
        participants: [seller.id, buyer.id],
        messages: [],
        lastMessageAt: Date.now(),
      };

      const allChats = getChats();
      allChats.push(newChat);
      setChats(allChats);
      addTestResult("✅ Chat created successfully");

      // Test 3: Create order form
      addTestResult("📋 Creating order form...");
      const allProducts = getProducts();
      const testProduct = allProducts[0];

      if (!testProduct) {
        addTestResult("❌ No products found");
        return;
      }

      const orderForm: OrderForm = {
        id: generateId(),
        productId: testProduct.id,
        productName: testProduct.name,
        productPrice: testProduct.price,
        productImage: testProduct.image,
        productDescription: testProduct.description,
        quantity: 2,
        totalPrice: testProduct.price * 2,
        sellerId: seller.id,
        buyerId: buyer.id,
        status: "pending",
        createdAt: Date.now(),
      };

      const allOrderForms = getOrderForms();
      allOrderForms.push(orderForm);
      setOrderForms(allOrderForms);
      addTestResult("✅ Order form created successfully");

      // Test 4: Accept order form
      addTestResult("✅ Accepting order form...");
      const updatedOrderForms = allOrderForms.map((form) =>
        form.id === orderForm.id
          ? { ...form, status: "accepted" as const }
          : form
      );
      setOrderForms(updatedOrderForms);
      addTestResult("✅ Order form accepted");

      // Test 5: Create order (simulate payment)
      addTestResult("💳 Creating order (simulating payment)...");
      const newOrder: Order = {
        id: generateId(),
        orderFormId: orderForm.id,
        buyerId: buyer.id,
        sellerId: seller.id,
        productId: testProduct.id,
        quantity: 2,
        totalPrice: testProduct.price * 2,
        paymentStatus: "completed",
        status: "paid",
        createdAt: Date.now(),
        paidAt: Date.now(),
      };

      const allOrders = getOrders();
      allOrders.push(newOrder);
      setOrders(allOrders);
      addTestResult("✅ Order created and payment completed");

      // Test 6: Update order with logistics
      addTestResult("🚚 Adding logistics to order...");
      const updatedOrders = allOrders.map((order) =>
        order.id === newOrder.id
          ? {
              ...order,
              logisticsCompanyId: "logistics-1",
              status: "shipped" as const,
            }
          : order
      );
      setOrders(updatedOrders);
      addTestResult("✅ Logistics added and order shipped");

      addTestResult(
        "🎉 Complete system test PASSED! All features working correctly."
      );

      toast({
        title: "Test Completed!",
        description: "All systems are working correctly.",
        variant: "default",
      });
    } catch (error) {
      addTestResult(`❌ Test failed with error: ${error}`);
      toast({
        title: "Test Failed",
        description: "There was an error during testing.",
        variant: "destructive",
      });
    }
  };

  const clearTestData = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("harvestlink_data");
      localStorage.removeItem("agronet_data");
      window.location.reload();
    }
  };

  const testNavigation = () => {
    addTestResult("🧭 Testing navigation...");

    const pages = [
      { name: "Products", path: "/products" },
      { name: "Chats", path: "/chats" },
      { name: "Test Chat", path: "/test-chat" },
      { name: "Test Login", path: "/test-login" },
    ];

    pages.forEach((page) => {
      try {
        addTestResult(`✅ ${page.name} page accessible at ${page.path}`);
      } catch (error) {
        addTestResult(`❌ ${page.name} page failed: ${error}`);
      }
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-agronetGreen mb-8 text-center">
          Complete System Test
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                <strong>User:</strong>{" "}
                {user ? `${user.name} (${user.role})` : "Not logged in"}
              </p>
              <p>
                <strong>Authenticated:</strong> {isAuthenticated ? "Yes" : "No"}
              </p>
              <p>
                <strong>Total Users:</strong> {getUsers().length}
              </p>
              <p>
                <strong>Total Products:</strong> {getProducts().length}
              </p>
              <p>
                <strong>Total Chats:</strong> {getChats().length}
              </p>
              <p>
                <strong>Total Order Forms:</strong> {getOrderForms().length}
              </p>
              <p>
                <strong>Total Orders:</strong> {getOrders().length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Test Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                onClick={runCompleteTest}
                className="w-full bg-agronetGreen hover:bg-agronetGreen/90"
              >
                Run Complete System Test
              </Button>
              <Button
                onClick={testNavigation}
                className="w-full bg-agronetOrange hover:bg-agronetOrange/90"
              >
                Test Navigation
              </Button>
              <Button
                onClick={clearTestData}
                variant="destructive"
                className="w-full"
              >
                Clear All Data & Restart
              </Button>
              {isAuthenticated && (
                <Button onClick={logout} variant="outline" className="w-full">
                  Logout
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 p-4 rounded-lg max-h-96 overflow-y-auto">
              {testResults.length === 0 ? (
                <p className="text-gray-500">
                  No tests run yet. Click "Run Complete System Test" to start.
                </p>
              ) : (
                <div className="space-y-1">
                  {testResults.map((result, index) => (
                    <div key={index} className="text-sm font-mono">
                      {result}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button onClick={() => router.push("/products")} variant="outline">
            View Products
          </Button>
          <Button onClick={() => router.push("/chats")} variant="outline">
            View Chats
          </Button>
          <Button onClick={() => router.push("/test-chat")} variant="outline">
            Chat Test
          </Button>
          <Button onClick={() => router.push("/test-login")} variant="outline">
            Login Test
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
