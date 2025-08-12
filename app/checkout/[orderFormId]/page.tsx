"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import {
  getOrderForms,
  getOrders,
  setOrders,
  generateId,
} from "@/lib/local-storage-utils";
import type { OrderForm, Order } from "@/lib/types";
import { Loader2, Package, DollarSign, CreditCard, Shield } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

// Paystack test public key (replace with your actual test key)
const PAYSTACK_PUBLIC_KEY = "pk_test_your_paystack_public_key_here";

declare global {
  interface Window {
    PaystackPop: any;
  }
}

export default function CheckoutPage() {
  const params = useParams();
  const orderFormId = params.orderFormId as string;
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [orderForm, setOrderForm] = useState<OrderForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || !user) {
        router.push("/login");
        toast({
          title: "Authentication Required",
          description: "Please log in to proceed with checkout.",
          variant: "destructive",
        });
        return;
      }

      const orderForms = getOrderForms() || [];
      const currentOrderForm = orderForms.find(
        (form) => form.id === orderFormId
      );

      if (
        !currentOrderForm ||
        currentOrderForm.buyerId !== user.id ||
        currentOrderForm.status !== "accepted"
      ) {
        toast({
          title: "Order Form Not Found",
          description:
            "The order form you are looking for does not exist or is not available for checkout.",
          variant: "destructive",
        });
        router.push("/chats");
        return;
      }

      setOrderForm(currentOrderForm);
      setLoading(false);
    }
  }, [orderFormId, isAuthenticated, user, authLoading, router, toast]);

  useEffect(() => {
    // Load Paystack script
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = () => {
    if (!orderForm || !user) return;

    setProcessing(true);

    // In a real app, you would use your actual Paystack public key
    // For demo purposes, we'll simulate the payment process
    if (typeof window !== "undefined" && window.PaystackPop) {
      const handler = window.PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email: user.email,
        amount: Math.round(orderForm.totalPrice * 100), // Amount in kobo
        currency: "USD",
        ref: `order_${orderForm.id}_${Date.now()}`,
        callback: function (response: any) {
          // Payment successful
          handlePaymentSuccess(response.reference);
        },
        onClose: function () {
          setProcessing(false);
          toast({
            title: "Payment Cancelled",
            description: "Payment was cancelled. You can try again.",
            variant: "default",
          });
        },
      });
      handler.openIframe();
    } else {
      // Fallback for demo - simulate successful payment
      setTimeout(() => {
        handlePaymentSuccess(`demo_ref_${Date.now()}`);
      }, 2000);
    }
  };

  const handlePaymentSuccess = (reference: string) => {
    if (!orderForm || !user) return;

    // Create order record
    const newOrder: Order = {
      id: generateId(),
      orderFormId: orderForm.id,
      buyerId: user.id,
      sellerId: orderForm.sellerId,
      productId: orderForm.productId,
      quantity: orderForm.quantity,
      totalPrice: orderForm.totalPrice,
      paymentStatus: "completed",
      status: "paid",
      createdAt: Date.now(),
      paidAt: Date.now(),
    };

    const orders = getOrders() || [];
    orders.push(newOrder);
    setOrders(orders);

    setProcessing(false);

    toast({
      title: "Payment Successful!",
      description: "Your payment has been processed successfully.",
      variant: "default",
    });

    // Redirect to logistics selection
    router.push(`/logistics/${newOrder.id}`);
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-agronetGreen" />
      </div>
    );
  }

  if (!orderForm || !user) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          <h1 className="text-3xl font-bold text-agronetGreen mb-8 text-center">
            Checkout
          </h1>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={
                      orderForm.productImage ||
                      "/placeholder.svg?height=80&width=80"
                    }
                    alt={orderForm.productName}
                    fill
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">
                    {orderForm.productName}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {orderForm.productDescription}
                  </p>
                  <p className="text-agronetGreen font-medium">
                    ${orderForm.productPrice.toFixed(2)} each
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Unit Price:</span>
                  <span>${orderForm.productPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Quantity:</span>
                  <span>{orderForm.quantity}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-agronetGreen flex items-center gap-1">
                    <DollarSign className="h-5 w-5" />
                    {orderForm.totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Payment Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Your payment is secured by Paystack. We use industry-standard
                encryption to protect your financial information. This is a test
                environment - no real charges will be made.
              </p>
            </CardContent>
          </Card>

          <Button
            onClick={handlePayment}
            disabled={processing}
            className="w-full bg-agronetOrange hover:bg-agronetOrange/90 text-white py-6 text-lg"
          >
            {processing ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Processing Payment...
              </>
            ) : (
              <>
                <CreditCard className="h-5 w-5 mr-2" />
                Pay ${orderForm.totalPrice.toFixed(2)}
              </>
            )}
          </Button>

          <p className="text-xs text-gray-500 text-center mt-4">
            By proceeding with payment, you agree to AgroNet's terms of service
            and privacy policy.
          </p>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
