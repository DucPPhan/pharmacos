import React, { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowRight,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { orderApi } from "@/lib/api";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const PaymentResult: React.FC = () => {
  const query = useQuery();
  const status = query.get("status");
  const code = query.get("code");
  const cancel = query.get("cancel");
  const orderId = query.get("orderId");
  const { clearCart, cartItems, removeItem } = useCart();

  useEffect(() => {
    const removePurchasedItems = async () => {
      if (
        (status === "PAID" || code === "00") &&
        cancel !== "true" &&
        orderId
      ) {
        try {
          const order = await orderApi.getOrderById(orderId);
          const purchasedProductIds = (order.items || []).map(
            (item: any) => item.productId?._id || item.productId
          );
          cartItems.forEach((item) => {
            if (purchasedProductIds.includes(item.productId)) {
              removeItem(item.id);
            }
          });
        } catch (e) {
          // fallback: do nothing
        }
      }
    };
    removePurchasedItems();
  }, [status, code, cancel, orderId, cartItems, removeItem]);

  let title = "";
  let description = "";
  let icon = null;
  let color = "";

  if (cancel === "true") {
    title = "Payment Cancelled";
    description =
      "You have cancelled the payment transaction. Your order has not been paid.";
    icon = <AlertTriangle className="h-24 w-24 text-yellow-500" />;
    color = "yellow";
  } else if (status === "PAID" || code === "00") {
    title = "Payment Successful!";
    description =
      "Thank you for your payment. Your order has been recorded.";
    icon = <CheckCircle className="h-24 w-24 text-green-500" />;
    color = "green";
  } else {
    title = "Payment Failed";
    description =
      "An error occurred during the payment process. Please try again or contact support.";
    icon = <XCircle className="h-24 w-24 text-red-500" />;
    color = "red";
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center">
      <div className="max-w-2xl w-full mx-auto bg-white rounded-2xl shadow-2xl p-12 mt-20 text-center">
        <div className="flex justify-center mb-10">{icon}</div>
        <h1 className={`text-4xl font-bold mb-6 text-${color}-600`}>{title}</h1>
        <p className="text-muted-foreground mb-10 text-xl">{description}</p>
        <div className="space-y-6">
          <Button
            asChild
            className="w-full h-14 text-lg"
            style={{ backgroundColor: "#7494ec" }}
          >
            <Link
              to="/profile/my-orders"
              className="flex items-center justify-center"
            >
              <ShoppingBag className="mr-2 h-6 w-6" />
              View my order
            </Link>
          </Button>
          <Button variant="outline" asChild className="w-full h-14 text-lg">
            <Link to="/" className="flex items-center justify-center">
              Go Home
              <ArrowRight className="ml-2 h-6 w-6" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentResult;
