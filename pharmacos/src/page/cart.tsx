// src/page/cart.tsx

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag, Loader2 } from "lucide-react"; // MODIFIED: Import Loader2
import { useCart, OrderDetails } from "../contexts/CartContext";
import { useToast } from "../components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { apiFetch } from "@/lib/api"; // Import our centralized api helper

const Cart = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    cartItems,
    updateQuantity,
    removeItem,
    subtotal,
    submitOrder,
    isSubmitting,
  } = useCart();

  const [isCheckoutDialogOpen, setIsCheckoutDialogOpen] = useState(false);
  // NEW: Add a loading state for fetching the user profile
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  const [checkoutInfo, setCheckoutInfo] = useState<OrderDetails>({
    recipientName: "",
    phone: "",
    shippingAddress: "",
    note: "",
    paymentMethod: "cod",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCheckoutInfo(prev => ({ ...prev, [name]: value }));
  };

  const handlePaymentChange = (value: string) => {
    setCheckoutInfo(prev => ({ ...prev, paymentMethod: value }));
  };

  // MODIFIED: This function now fetches fresh user data before opening the dialog
  const handleOpenCheckout = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast({
        title: "Login required",
        description: "Please log in to proceed with checkout.",
        variant: "destructive",
      });
      navigate('/login', { state: { from: '/cart' } });
      return;
    }

    setIsProfileLoading(true);
    try {
      // Fetch the latest user profile from the API
      const profileData = await apiFetch('http://localhost:10000/api/customers/profile');

      // Pre-fill the form with the fetched data
      setCheckoutInfo(prev => ({
        ...prev,
        recipientName: profileData.name || '',
        phone: profileData.phone || '',
        shippingAddress: profileData.address || ''
      }));

      // Open the dialog only after successfully fetching the data
      setIsCheckoutDialogOpen(true);

    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      toast({
        title: "Error",
        description: "Could not retrieve your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProfileLoading(false);
    }
  };

  const handleConfirmOrder = async () => {
    try {
      await submitOrder(checkoutInfo);

      setIsCheckoutDialogOpen(false);

      toast({
        title: "Order placed successfully!",
        description: "Your order is being processed.",
      });

      navigate('/order-confirmation');
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Checkout failed",
        description: error instanceof Error ? error.message : "Failed to place order. Please try again.",
        variant: "destructive",
      });
    }
  };

  const shipping = 5.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Link
            to="/"
            className="flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Continue Shopping
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-8">Your Cart</h1>

        {cartItems.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Cart Items ({cartItems.reduce((acc, item) => acc + item.quantity, 0)})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-24 w-24 rounded-md object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">${item.price.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center border rounded-md">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, -1)}>
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, 1)}>
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}>
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader><CardTitle>Order Summary</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>Shipping</span><span>${shipping.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>Tax</span><span>${tax.toFixed(2)}</span></div>
                  <Separator />
                  <div className="flex justify-between font-bold"><span>Total</span><span>${total.toFixed(2)}</span></div>
                </CardContent>
                <CardFooter>
                  {/* MODIFIED: Update button to show loading state */}
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleOpenCheckout}
                    disabled={isSubmitting || isProfileLoading}
                  >
                    {isProfileLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isProfileLoading ? "Loading Profile..." : "Proceed to Checkout"}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground" />
            <h2 className="mt-2 text-2xl font-semibold">Your cart is empty</h2>
            <p className="mt-1 text-muted-foreground">Add items to your cart to get started.</p>
            <Button asChild className="mt-6">
              <Link to="/">Start Shopping</Link>
            </Button>
          </div>
        )}
      </main>

      {/* Checkout Information Dialog - No changes needed here */}
      <Dialog open={isCheckoutDialogOpen} onOpenChange={setIsCheckoutDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Shipping Information</DialogTitle>
            <DialogDescription>Please confirm your details before placing the order.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="recipientName" className="text-right">Name</Label>
              <Input id="recipientName" name="recipientName" value={checkoutInfo.recipientName} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">Phone</Label>
              <Input id="phone" name="phone" value={checkoutInfo.phone} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="shippingAddress" className="text-right">Address</Label>
              <Textarea id="shippingAddress" name="shippingAddress" value={checkoutInfo.shippingAddress} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="note" className="text-right">Note</Label>
              <Textarea id="note" name="note" placeholder="Optional: delivery instructions, etc." value={checkoutInfo.note} onChange={handleInputChange} className="col-span-3" />
            </div>
            <Separator className="my-2" />
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">Payment</Label>
              <RadioGroup value={checkoutInfo.paymentMethod} onValueChange={handlePaymentChange} className="col-span-3 space-y-2">
                <div className="flex items-center space-x-2"><RadioGroupItem value="cod" id="cod" /><Label htmlFor="cod">Cash on Delivery (COD)</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="online" id="online" disabled /><Label htmlFor="online" className="text-muted-foreground">Online Payment (Coming soon)</Label></div>
              </RadioGroup>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCheckoutDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleConfirmOrder} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isSubmitting ? "Placing Order..." : "Confirm Order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Cart;