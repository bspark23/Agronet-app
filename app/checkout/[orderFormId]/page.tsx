"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  getOrders,
  setOrders,
  generateId,
} from "@/lib/local-storage-utils";
import type { Order } from "@/lib/types";
import {
  Loader2,
  Package,
  DollarSign,
  CreditCard,
  Shield,
  CheckCircle,
} from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

export default function CheckoutPage() {
  const params = useParams();
  const orderFormId = params.orderFormId as string;
  const router = useRouter();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<"form" | "processing" | "success">("form");
  const [paymentForm, setPaymentForm] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
  });

  // Demo data for testing
  const demoOrderForm = {
    id: orderFormId,
    buyerId: "demo-buyer-123",
    sellerId: "demo-seller-456",
    productId: "demo-product-789",
    productName: "Premium Organic Tomatoes",
    productDescription: "Fresh, organic tomatoes grown using sustainable farming practices. Perfect for salads, cooking, and sauces.",
    productPrice: 15.99,
    productImage: "/placeholder.jpg",
    quantity: 3,
    totalPrice: 47.97,
    status: "accepted",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  // Demo payment form validation
  const isPaymentFormValid = () => {
    return (
      paymentForm.cardNumber.length >= 16 &&
      paymentForm.expiryDate.length >= 5 &&
      paymentForm.cvv.length >= 3 &&
      paymentForm.cardholderName.trim().length > 0
    );
  };

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPaymentFormValid()) {
      toast({
        title: "Invalid Payment Information",
        description: "Please fill in all payment fields correctly.",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    setPaymentStep("processing");

    // Simulate payment processing with demo data (2 second delay)
    setTimeout(() => {
      handlePaymentSuccess();
    }, 2000);
  };

  const handleInputChange = (field: keyof typeof paymentForm, value: string) => {
    setPaymentForm((prev) => ({ ...prev, [field]: value }));
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(" ");
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4);
    }
    return v;
  };

  const handlePaymentSuccess = () => {
    // Create order record with demo payment reference
    const newOrder: Order = {
      id: generateId(),
      orderFormId: demoOrderForm.id,
      buyerId: "demo-user-123",
      sellerId: demoOrderForm.sellerId,
      productId: demoOrderForm.productId,
      quantity: demoOrderForm.quantity,
      totalPrice: demoOrderForm.totalPrice,
      paymentStatus: "completed",
      status: "paid",
      createdAt: Date.now(),
      paidAt: Date.now(),
    };

    const orders = getOrders() || [];
    orders.push(newOrder);
    setOrders(orders);

    setProcessing(false);
    setPaymentStep("success");

    toast({
      title: "Payment Successful!",
      description: "Your demo payment has been processed successfully.",
      variant: "default",
    });

    // Redirect to logistics selection after a short delay
    setTimeout(() => {
      router.push(`/logistics/${newOrder.id}`);
    }, 3000);
  };

  const fillDemoData = () => {
    setPaymentForm({
      cardNumber: "4111 1111 1111 1111",
      expiryDate: "12/25",
      cvv: "123",
      cardholderName: "Demo User",
    });
  };

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

          {/* Order Summary */}
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
                    src={demoOrderForm.productImage || "/placeholder.svg?height=80&width=80"}
                    alt={demoOrderForm.productName}
                    fill
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{demoOrderForm.productName}</h3>
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {demoOrderForm.productDescription}
                  </p>
                  <p className="text-agronetGreen font-medium">
                    ${demoOrderForm.productPrice.toFixed(2)} each
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Unit Price:</span>
                  <span>${demoOrderForm.productPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Quantity:</span>
                  <span>{demoOrderForm.quantity}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-agronetGreen flex items-center gap-1">
                    <DollarSign className="h-5 w-5" />
                    {demoOrderForm.totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Steps */}
          {paymentStep === "form" && (
            <>
              {/* Demo Notice */}
              <Card className="mb-6 border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-700">
                    <Shield className="h-5 w-5" />
                    Demo Payment Mode
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-blue-600 mb-3">
                    This is a demo checkout. No real payment will be processed. 
                    Fill in the form below or use demo data.
                  </p>
                  <Button 
                    onClick={fillDemoData}
                    variant="outline"
                    size="sm"
                    className="border-blue-300 text-blue-700 hover:bg-blue-100"
                  >
                    Fill Demo Data
                  </Button>
                </CardContent>
              </Card>

              {/* Payment Form */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePayment} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        value={paymentForm.cardNumber}
                        onChange={(e) => handleInputChange("cardNumber", formatCardNumber(e.target.value))}
                        maxLength={19}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiryDate">Expiry Date</Label>
                        <Input
                          id="expiryDate"
                          placeholder="MM/YY"
                          value={paymentForm.expiryDate}
                          onChange={(e) => handleInputChange("expiryDate", formatExpiryDate(e.target.value))}
                          maxLength={5}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvv">CVV</Label>
                        <Input
                          id="cvv"
                          placeholder="123"
                          type="password"
                          value={paymentForm.cvv}
                          onChange={(e) => handleInputChange("cvv", e.target.value.replace(/[^0-9]/g, ""))}
                          maxLength={4}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cardholderName">Cardholder Name</Label>
                      <Input
                        id="cardholderName"
                        placeholder="John Doe"
                        value={paymentForm.cardholderName}
                        onChange={(e) => handleInputChange("cardholderName", e.target.value)}
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-agronetGreen hover:bg-agronetGreen/90"
                      disabled={processing || !isPaymentFormValid()}
                    >
                      {processing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="mr-2 h-4 w-4" />
                          Pay ${demoOrderForm.totalPrice.toFixed(2)}
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </>
          )}

          {paymentStep === "processing" && (
            <Card className="mb-6">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-12 w-12 animate-spin text-agronetGreen mb-4" />
                <h3 className="text-lg font-semibold mb-2">Processing Payment</h3>
                <p className="text-gray-600 text-center">
                  Please wait while we process your demo payment...
                </p>
              </CardContent>
            </Card>
          )}

          {paymentStep === "success" && (
            <Card className="mb-6 border-green-200 bg-green-50">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle className="h-12 w-12 text-green-600 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Payment Successful!</h3>
                <p className="text-gray-600 text-center mb-4">
                  Your demo payment has been processed successfully.
                </p>
                <p className="text-sm text-gray-500">
                  Redirecting to logistics selection...
                </p>
              </CardContent>
            </Card>
          )}

          <p className="text-xs text-gray-500 text-center mt-4">
            By proceeding with payment, you agree to HarvestLink's terms of
            service and privacy policy.
          </p>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
