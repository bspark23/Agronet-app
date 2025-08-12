"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import {
  getOrders,
  setOrders,
  getLogisticsCompanies,
  getOrderForms,
} from "@/lib/local-storage-utils";
import type { Order, LogisticsCompany, OrderForm } from "@/lib/types";
import { Loader2, Truck, Clock, DollarSign, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function LogisticsPage() {
  const params = useParams();
  const orderId = params.orderId as string;
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [order, setOrder] = useState<Order | null>(null);
  const [orderForm, setOrderForm] = useState<OrderForm | null>(null);
  const [logisticsCompanies, setLogisticsCompanies] = useState<
    LogisticsCompany[]
  >([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || !user) {
        router.push("/login");
        toast({
          title: "Authentication Required",
          description: "Please log in to select logistics.",
          variant: "destructive",
        });
        return;
      }

      const orders = getOrders() || [];
      const currentOrder = orders.find((o) => o.id === orderId);

      if (
        !currentOrder ||
        currentOrder.buyerId !== user.id ||
        currentOrder.paymentStatus !== "completed"
      ) {
        toast({
          title: "Order Not Found",
          description:
            "The order you are looking for does not exist or is not available for logistics selection.",
          variant: "destructive",
        });
        router.push("/chats");
        return;
      }

      const orderForms = getOrderForms() || [];
      const currentOrderForm = orderForms.find(
        (form) => form.id === currentOrder.orderFormId
      );

      setOrder(currentOrder);
      setOrderForm(currentOrderForm || null);
      setLogisticsCompanies(getLogisticsCompanies());
      setLoading(false);
    }
  }, [orderId, isAuthenticated, user, authLoading, router, toast]);

  const handleConfirmLogistics = () => {
    if (!order || !selectedCompany) return;

    setConfirming(true);

    // Update order with selected logistics company
    const updatedOrder: Order = {
      ...order,
      logisticsCompanyId: selectedCompany,
      status: "shipped",
    };

    const orders = getOrders() || [];
    const updatedOrders = orders.map((o) =>
      o.id === order.id ? updatedOrder : o
    );
    setOrders(updatedOrders);

    setConfirming(false);

    toast({
      title: "Logistics Confirmed!",
      description: "Your order has been scheduled for delivery.",
      variant: "default",
    });

    // Redirect to a success page or back to chats
    setTimeout(() => {
      router.push("/chats");
    }, 2000);
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-agronetGreen" />
      </div>
    );
  }

  if (!order || !orderForm) {
    return null;
  }

  const selectedCompanyDetails = logisticsCompanies.find(
    (c) => c.id === selectedCompany
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <h1 className="text-3xl font-bold text-agronetGreen mb-8 text-center">
            Select Logistics Company
          </h1>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Payment Confirmed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Your payment for <strong>{orderForm.productName}</strong>{" "}
                (Quantity: {order.quantity}) has been successfully processed.
                Please select a logistics company for delivery.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Choose Your Delivery Option
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={selectedCompany}
                onValueChange={setSelectedCompany}
              >
                <div className="space-y-4">
                  {logisticsCompanies.map((company) => (
                    <motion.div
                      key={company.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Label
                        htmlFor={company.id}
                        className={`flex items-center space-x-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedCompany === company.id
                            ? "border-agronetGreen bg-agronetGreen/5"
                            : "border-gray-200 hover:border-agronetGreen/50"
                        }`}
                      >
                        <RadioGroupItem value={company.id} id={company.id} />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-lg">
                              {company.name}
                            </h3>
                            <div className="flex items-center gap-4">
                              <span className="flex items-center gap-1 text-agronetOrange font-medium">
                                <DollarSign className="h-4 w-4" />
                                {company.price.toFixed(2)}
                              </span>
                              <span className="flex items-center gap-1 text-gray-600">
                                <Clock className="h-4 w-4" />
                                {company.deliveryTime}
                              </span>
                            </div>
                          </div>
                          <p className="text-gray-600 text-sm">
                            {company.description}
                          </p>
                        </div>
                      </Label>
                    </motion.div>
                  ))}
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {selectedCompanyDetails && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="mb-6 border-agronetGreen">
                <CardHeader>
                  <CardTitle className="text-agronetGreen">
                    Delivery Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Product Total:</span>
                      <span>${order.totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery ({selectedCompanyDetails.name}):</span>
                      <span>${selectedCompanyDetails.price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Estimated Delivery:</span>
                      <span>{selectedCompanyDetails.deliveryTime}</span>
                    </div>
                    <hr className="my-2" />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total Cost:</span>
                      <span className="text-agronetGreen">
                        $
                        {(
                          order.totalPrice + selectedCompanyDetails.price
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <Button
            onClick={handleConfirmLogistics}
            disabled={!selectedCompany || confirming}
            className="w-full bg-agronetGreen hover:bg-agronetGreen/90 text-white py-6 text-lg"
          >
            {confirming ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Confirming Delivery...
              </>
            ) : (
              <>
                <Truck className="h-5 w-5 mr-2" />
                Confirm Delivery Option
              </>
            )}
          </Button>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
