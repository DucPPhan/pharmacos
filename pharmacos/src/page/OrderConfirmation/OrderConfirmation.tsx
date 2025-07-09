// src/pages/OrderConfirmation.tsx
import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  ShoppingBag,
  ArrowRight,
  CreditCard,
  Loader2,
  User,
  MapPin,
  Package,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { apiFetch } from "@/lib/api";
import CategoryNav from "../home/CategoryNav";
import { useCart } from "@/contexts/CartContext";

interface OrderItem {
  productId: {
    _id: string;
    name: string;
    images?: Array<{ url: string }>;
    price: number;
  };
  quantity: number;
  unitPrice: number;
}

interface OrderData {
  _id: string;
  recipientName: string;
  phone: string;
  shippingAddress: string;
  note?: string;
  status: string;
  paymentStatus?: string;
  totalAmount: number;
  orderDate: string;
  items: OrderItem[];
}

const formatVND = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    value
  );

const OrderConfirmation = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  const { toast } = useToast();
  const { forceRefresh } = useCart();

  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [cartRefreshed, setCartRefreshed] = useState(false);

  useEffect(() => {
    if (orderId && !cartRefreshed) {
      fetchOrderDetails();
    }
  }, [orderId, cartRefreshed]);

  const fetchOrderDetails = async () => {
    try {
      const response = await apiFetch(
        `http://localhost:10000/api/orders/${orderId}`
      );

      // API returns { order, items }, combine them
      const combinedOrder = {
        ...response.order,
        items: response.items,
        // Ensure paymentStatus exists (default to "pending" if missing)
        paymentStatus: response.order.paymentStatus || "pending",
      };

      setOrder(combinedOrder);

      // Force refresh cart ONCE after order details are loaded
      // Cart should be empty after any successful order creation
      console.log(
        "Order confirmed, force refreshing cart to sync with server..."
      );
      await forceRefresh();
      setCartRefreshed(true);
    } catch (error) {
      console.error("Failed to fetch order:", error);
      toast({
        title: "Error",
        description: "Failed to load order details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!order) return;

    setPaymentLoading(true);
    try {
      // Direct fetch to handle response properly
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:10000/api/payments/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify({ orderId: order._id }),
        }
      );

      const result = await response.json();

      // If successful OR has paymentUrl (even with error), redirect
      if (result.data?.paymentUrl) {
        window.location.href = result.data.paymentUrl;
        return;
      }

      throw new Error(result.message || "No payment URL received");
    } catch (error: any) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Error",
        description: error.message || "Failed to process payment",
        variant: "destructive",
      });
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <CategoryNav />
        <main className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
          <Button asChild>
            <Link to="/">Return Home</Link>
          </Button>
        </main>
      </div>
    );
  }

  const subtotal =
    order.items?.reduce(
      (sum, item) => sum + (item.unitPrice || 0) * (item.quantity || 0),
      0
    ) || 0;
  const shippingFee = 1000;
  const isPaid = order.paymentStatus === "completed";
  const grandTotal = subtotal + shippingFee;

  // Debug logging
  console.log("Order:", order);
  console.log("Subtotal:", subtotal);
  console.log("Shipping fee:", shippingFee);
  console.log("Grand total:", grandTotal);
  console.log("Order total amount:", order.totalAmount);

  return (
    <div className="min-h-screen bg-background">
      <CategoryNav />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
            <p className="text-muted-foreground">
              Order ID: <span className="font-mono">{order._id}</span>
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Order Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Recipient Info */}
              <Card>
                <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                  <User className="h-5 w-5 mr-2" />
                  <CardTitle>Recipient info</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="font-medium">{order.recipientName}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.phone}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Delivery Address */}
              <Card>
                <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                  <MapPin className="h-5 w-5 mr-2" />
                  <CardTitle>Delivery address</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{order.shippingAddress}</p>
                </CardContent>
              </Card>

              {/* Product List */}
              <Card>
                <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                  <Package className="h-5 w-5 mr-2" />
                  <CardTitle>Product list</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center space-x-4">
                        <img
                          src={
                            item.productId.images?.length
                              ? `http://localhost:10000${item.productId.images[0].url}`
                              : "/placeholder.png"
                          }
                          alt={item.productId.name}
                          className="w-16 h-16 rounded-md object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium">{item.productId.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {formatVND(item.unitPrice)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {formatVND(item.unitPrice * item.quantity)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            x{item.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>{formatVND(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping fee</span>
                      <span>{formatVND(shippingFee)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Grand total</span>
                      <span className="text-blue-600">
                        {formatVND(grandTotal)}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Payment method:</span>
                      <span className="text-sm flex items-center">
                        <CreditCard className="h-4 w-4 mr-1" />
                        {order.paymentStatus === "pending"
                          ? "Online Payment"
                          : "Cash on Delivery"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Payment status:</span>
                      <span
                        className={`text-sm px-2 py-1 rounded-full ${
                          isPaid
                            ? "bg-green-100 text-green-800"
                            : "bg-orange-100 text-orange-800"
                        }`}
                      >
                        {isPaid ? "Completed" : "Pending"}
                      </span>
                    </div>
                  </div>

                  {/* Payment Button */}
                  {!isPaid && order.paymentStatus === "pending" && (
                    <Button
                      onClick={handlePayment}
                      disabled={paymentLoading}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      {paymentLoading && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Thanh toán ngay
                    </Button>
                  )}

                  <div className="space-y-2">
                    <Button asChild variant="outline" className="w-full">
                      <Link to="/profile/orders">
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        Mua lại
                      </Link>
                    </Button>

                    <Button variant="outline" asChild className="w-full">
                      <Link to="/">
                        Continue Shopping
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OrderConfirmation;
