"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { OrderFormComponent } from "@/components/order-form";
import { ChatOrderForm } from "@/components/chat-order-form";
import type { Product, OrderForm } from "@/lib/types";

const testProduct: Product = {
  id: "test-1",
  name: "Test Tomatoes",
  description: "Fresh organic tomatoes for testing",
  price: 5.99,
  quantity: 10,
  image: "/placeholder.svg?height=200&width=200",
  sellerId: "seller-1",
  category: "Vegetables",
};

export default function TestOrderPage() {
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderForm, setOrderForm] = useState<OrderForm | null>(null);

  const handleOrderSubmit = (form: OrderForm) => {
    setOrderForm(form);
    setShowOrderForm(false);
    console.log("Order submitted:", form);
  };

  const handleOrderCancel = () => {
    setShowOrderForm(false);
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold text-agronetGreen mb-8">
        Order Form Test
      </h1>

      <div className="space-y-4">
        <Button
          onClick={() => setShowOrderForm(true)}
          className="bg-agronetOrange hover:bg-agronetOrange/90"
        >
          Test Order Form
        </Button>

        {orderForm && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">
              Generated Order Form:
            </h2>
            <ChatOrderForm orderForm={orderForm} isCurrentUser={true} />
          </div>
        )}
      </div>

      {showOrderForm && (
        <OrderFormComponent
          product={testProduct}
          sellerId="seller-1"
          buyerId="buyer-1"
          onSubmit={handleOrderSubmit}
          onCancel={handleOrderCancel}
        />
      )}
    </div>
  );
}
