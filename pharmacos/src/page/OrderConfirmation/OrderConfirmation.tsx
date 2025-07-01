// src/pages/OrderConfirmation.tsx
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, ShoppingBag, ArrowRight } from "lucide-react";
import CategoryNav from "../home/CategoryNav";

const OrderConfirmation = () => {
  return (
    <div className="min-h-screen bg-background">
      <CategoryNav />

      <main className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto">
          <div className="flex justify-center mb-6">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>

          <h1 className="text-3xl font-bold mb-4">Order Confirmed!</h1>

          <p className="text-muted-foreground mb-8">
            Thank you for your order. We've received your purchase and will
            process it shortly. You will receive an email confirmation with
            order details.
          </p>

          <div className="space-y-4">
            <Button
              asChild
              className="w-full"
              style={{ backgroundColor: "#7494ec" }}
            >
              <Link
                to="/profile/don-hang-cua-toi"
                className="flex items-center justify-center"
              >
                <ShoppingBag className="mr-2 h-4 w-4" />
                View My Orders
              </Link>
            </Button>

            <Button variant="outline" asChild className="w-full">
              <Link to="/" className="flex items-center justify-center">
                Continue Shopping
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OrderConfirmation;
