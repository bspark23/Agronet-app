"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { OrderFormComponent } from "@/components/order-form";
import { ChatOrderForm } from "@/components/chat-order-form";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import type { Product, OrderForm } from "@/lib/types";

export default function TestOrderPage() {
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderForms, setOrderForms] = useState<OrderForm[]>([]);

  const testProduct: Product = {
    id: "test-1",
    name: "Test Product",
    description: "This is a test product for order form functionality",
    price: 25.99,
    quantity: 50,
    image: "/placeholder.svg?height=400&width=600",
    sellerId: "seller-1",
    category: "Test",
  };

  const handleOrderFormSubmit = (orderForm: OrderForm) => {
    setOrderForms([...orderForms, orderForm]);
    setShowOrderForm(false);
    alert("Order form created successfully!");
  };

  const handleOrderFormCancel = () => {
    setShowOrderForm(false);
  };

  const handleAccept = (orderFormId: string) => {
    setOrderForms(
      orderForms.map((form) =>
        form.id === orderFormId
          ? { ...form, status: "accepted" as const }
          : form
      )
    );
    alert("Order accepted!");
  };

  const handleReject = (orderFormId: string) => {
    setOrderForms(
      orderForms.map((form) =>
        form.id === orderFormId
          ? { ...form, status: "rejected" as const }
          : form
      )
    );
    alert("Order rejected!");
  };

  const handleProceedToPayment = (orderFormId: string) => {
    alert(`Proceeding to payment for order: ${orderFormId}`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-agronetGreen mb-8 text-center">
          Order Form Test Page
        </h1>

        <div className="max-w-2xl mx-auto space-y-6">
          <Button
            onClick={() => setShowOrderForm(true)}
            className="w-full bg-agronetOrange hover:bg-agronetOrange/90 text-white"
          >
            Create Test Order Form
          </Button>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Created Order Forms:</h2>
            {orderForms.length === 0 ? (
              <p className="text-gray-500">No order forms created yet.</p>
            ) : (
              orderForms.map((orderForm) => (
                <ChatOrderForm
                  key={orderForm.id}
                  orderForm={orderForm}
                  isCurrentUser={false}
                  onAccept={() => handleAccept(orderForm.id)}
                  onReject={() => handleReject(orderForm.id)}
                  onProceedToPayment={() =>
                    handleProceedToPayment(orderForm.id)
                  }
                />
              ))
            )}
          </div>
        </div>
      </main>
      <Footer />

      {showOrderForm && (
        <OrderFormComponent
          product={testProduct}
          sellerId="seller-1"
          buyerId="buyer-1"
          onSubmit={handleOrderFormSubmit}
          onCancel={handleOrderFormCancel}
        />
      )}
    </div>
  );
}
