"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, DollarSign, Clock, CheckCircle, XCircle } from "lucide-react";
import Image from "next/image";
import type { OrderForm } from "@/lib/types";

interface ChatOrderFormProps {
  orderForm: OrderForm;
  isCurrentUser: boolean;
  onAccept?: () => void;
  onReject?: () => void;
  onProceedToPayment?: () => void;
}

export function ChatOrderForm({
  orderForm,
  isCurrentUser,
  onAccept,
  onReject,
  onProceedToPayment,
}: ChatOrderFormProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "accepted":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "accepted":
        return <CheckCircle className="h-4 w-4" />;
      case "rejected":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <Card className="w-full max-w-sm mx-auto shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-agronetGreen flex items-center gap-2">
            <Package className="h-5 w-5" />
            Order Form
          </CardTitle>
          <Badge
            className={`${getStatusColor(
              orderForm.status
            )} flex items-center gap-1`}
          >
            {getStatusIcon(orderForm.status)}
            {orderForm.status.charAt(0).toUpperCase() +
              orderForm.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Product Info */}
        <div className="flex gap-3">
          <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
            <Image
              src={
                orderForm.productImage || "/placeholder.svg?height=48&width=48"
              }
              alt={orderForm.productName}
              fill
              style={{ objectFit: "cover" }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 truncate">
              {orderForm.productName}
            </h4>
            <p className="text-sm text-gray-600">
              ${orderForm.productPrice.toFixed(2)} each
            </p>
          </div>
        </div>

        {/* Order Details */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Quantity:</span>
            <span className="font-medium">{orderForm.quantity}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total:</span>
            <span className="text-lg font-bold text-agronetGreen flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              {orderForm.totalPrice.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        {!isCurrentUser && orderForm.status === "pending" && (
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onReject}
              className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
            >
              Reject
            </Button>
            <Button
              size="sm"
              onClick={onAccept}
              className="flex-1 bg-agronetGreen hover:bg-agronetGreen/90"
            >
              Accept
            </Button>
          </div>
        )}

        {!isCurrentUser && orderForm.status === "accepted" && (
          <Button
            size="sm"
            onClick={onProceedToPayment}
            className="w-full bg-agronetOrange hover:bg-agronetOrange/90"
          >
            Proceed to Payment
          </Button>
        )}

        {orderForm.status === "rejected" && (
          <p className="text-sm text-red-600 text-center">
            This order was rejected
          </p>
        )}
      </CardContent>
    </Card>
  );
}
