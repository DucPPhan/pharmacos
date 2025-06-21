// src/page/cart.tsx

import React, { useState, useEffect } from "react";
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
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag, Loader2 } from "lucide-react";
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
import { apiFetch } from "@/lib/api";
import { getFullAddress } from "./profile/AddressBook";

// Regex để xác thực số điện thoại Việt Nam
const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;

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
    isCartLoading,
  } = useCart();

  const [isCheckoutDialogOpen, setIsCheckoutDialogOpen] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  const [checkoutInfo, setCheckoutInfo] = useState<OrderDetails>({
    recipientName: "",
    phone: "",
    shippingAddress: "",
    note: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCheckoutInfo(prev => ({ ...prev, [name]: value }));
  };

  const handlePaymentChange = (value: string) => {
    setCheckoutInfo(prev => ({ ...prev, paymentMethod: value }));
  };

  const handleOpenCheckout = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast({
        title: "Yêu cầu đăng nhập",
        description: "Vui lòng đăng nhập để tiếp tục thanh toán.",
        variant: "destructive",
      });
      navigate('/login', { state: { from: '/cart' } });
      return;
    }

    setIsProfileLoading(true);
    try {
      // Tải thông tin mới nhất của người dùng để điền vào form
      const profileData = await apiFetch('http://localhost:10000/api/customers/profile');
      setCheckoutInfo(prev => ({
        ...prev,
        recipientName: profileData.name || '',
        phone: profileData.phone || '',
        shippingAddress: getFullAddress(profileData)
      }));
      setIsCheckoutDialogOpen(true);
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tải thông tin cá nhân của bạn. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsProfileLoading(false);
    }
  };

  const handleConfirmOrder = async () => {
    // --- Bổ sung Validation ---
    if (!checkoutInfo.recipientName.trim()) {
      toast({ title: "Lỗi", description: "Vui lòng nhập tên người nhận.", variant: "destructive" });
      return;
    }
    if (!checkoutInfo.phone.trim() || !phoneRegex.test(checkoutInfo.phone)) {
      toast({ title: "Lỗi", description: "Vui lòng nhập số điện thoại hợp lệ.", variant: "destructive" });
      return;
    }
    if (!checkoutInfo.shippingAddress.trim()) {
      toast({ title: "Lỗi", description: "Vui lòng nhập địa chỉ giao hàng.", variant: "destructive" });
      return;
    }
    // --- Kết thúc Validation ---

    try {
      await submitOrder(checkoutInfo);

      localStorage.removeItem("cart");
      setIsCheckoutDialogOpen(false);

      toast({
        title: "Đặt hàng thành công!",
        description: "Đơn hàng của bạn đang được xử lý.",
      });

      navigate('/order-confirmation');
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Thanh toán thất bại",
        description: error instanceof Error ? error.message : "Không thể đặt hàng. Vui lòng thử lại.",
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
            Tiếp tục mua sắm
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-8">Giỏ Hàng Của Bạn</h1>

        {cartItems.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Sản phẩm trong giỏ ({cartItems.reduce((acc, item) => acc + item.quantity, 0)})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isCartLoading ? (
                    Array.from({ length: 2 }).map((_, i) => (
                      <div key={i} className="flex items-center space-x-4 animate-pulse">
                        <div className="h-24 w-24 rounded-md bg-gray-200"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                        <div className="h-8 w-24 bg-gray-200 rounded-md"></div>
                      </div>
                    ))
                  ) : (
                    cartItems.map((item) => (
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
                    ))
                  )}
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader><CardTitle>Tóm Tắt Đơn Hàng</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between"><span>Tạm tính</span><span>${subtotal.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>Phí vận chuyển</span><span>${shipping.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>Thuế</span><span>${tax.toFixed(2)}</span></div>
                  <Separator />
                  <div className="flex justify-between font-bold"><span>Tổng cộng</span><span>${total.toFixed(2)}</span></div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleOpenCheckout}
                    disabled={isSubmitting || isProfileLoading}
                    style={{ backgroundColor: "#7494ec" }}
                  >
                    {isProfileLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isProfileLoading ? "Đang tải..." : "Tiến hành thanh toán"}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground" />
            <h2 className="mt-2 text-2xl font-semibold">Giỏ hàng của bạn đang trống</h2>
            <p className="mt-1 text-muted-foreground">Hãy thêm sản phẩm vào giỏ để bắt đầu.</p>
            <Button asChild className="mt-6" style={{ backgroundColor: "#7494ec" }}>
              <Link to="/">Bắt đầu mua sắm</Link>
            </Button>
          </div>
        )}
      </main>

      <Dialog open={isCheckoutDialogOpen} onOpenChange={setIsCheckoutDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Thông Tin Giao Hàng</DialogTitle>
            <DialogDescription>Vui lòng xác nhận thông tin trước khi đặt hàng.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="recipientName" className="text-right">Tên người nhận</Label>
              <Input id="recipientName" name="recipientName" value={checkoutInfo.recipientName} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">Số điện thoại</Label>
              <Input id="phone" name="phone" value={checkoutInfo.phone} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="shippingAddress" className="text-right">Địa chỉ</Label>
              <Textarea id="shippingAddress" name="shippingAddress" value={checkoutInfo.shippingAddress} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="note" className="text-right">Ghi chú</Label>
              <Textarea id="note" name="note" placeholder="Tùy chọn: hướng dẫn giao hàng,..." value={checkoutInfo.note} onChange={handleInputChange} className="col-span-3" />
            </div>
            <Separator className="my-2" />
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">Thanh toán</Label>
              <RadioGroup onValueChange={handlePaymentChange} className="col-span-3 space-y-2">
                <div className="flex items-center space-x-2"><RadioGroupItem value="cod" id="cod" defaultChecked /><Label htmlFor="cod">Thanh toán khi nhận hàng (COD)</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="online" id="online" disabled /><Label htmlFor="online" className="text-muted-foreground">Thanh toán online (Sắp có)</Label></div>
              </RadioGroup>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCheckoutDialogOpen(false)}>Hủy</Button>
            <Button onClick={handleConfirmOrder} disabled={isSubmitting} style={{ backgroundColor: "#7494ec" }}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? "Đang đặt hàng..." : "Xác nhận đơn hàng"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Cart;