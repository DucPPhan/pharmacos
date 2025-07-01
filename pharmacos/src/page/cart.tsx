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
import {
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  ShoppingBag,
  Loader2,
  MapPin,
  PencilIcon,
  X,
  Home,
  Building,
} from "lucide-react";
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
import { apiFetch, cartApi, orderApi, paymentApi } from "@/lib/api";
import { AddressInfo, getFullAddress } from "./profile/AddressBook";
import { PlusOutlined } from "@ant-design/icons";
import NewAddressForm from "./NewAddressForm";

// Regex để xác thực số điện thoại Việt Nam
const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;

const formatVND = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    value
  );

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
  const [userAddresses, setUserAddresses] = useState<AddressInfo[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [useManualAddress, setUseManualAddress] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [initialAddressInfo, setInitialAddressInfo] = useState<
    Partial<OrderDetails>
  >({});
  const [showAddressSelection, setShowAddressSelection] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);

  const [checkoutInfo, setCheckoutInfo] = useState({
    recipientName: "",
    phone: "",
    shippingAddress: "",
    note: "",
    paymentMethod: "cod",
  });

  const fetchUserAddresses = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const addresses = await apiFetch(
        "http://localhost:10000/api/customers/addresses"
      );
      setUserAddresses(addresses);

      // Set default address if available
      const defaultAddress = addresses.find((addr) => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress._id || "");
        updateCheckoutInfoFromAddress(defaultAddress);
        // Store the initial address info for potential reset
        setInitialAddressInfo({
          recipientName: defaultAddress.name || "",
          phone: defaultAddress.phone || "",
          shippingAddress: getFullAddress(defaultAddress),
        });
        setIsEditingAddress(false);
      }
    } catch (error) {
      console.error("Failed to fetch user addresses:", error);
    }
  };

  const updateCheckoutInfoFromAddress = (address: AddressInfo) => {
    setCheckoutInfo((prev) => ({
      ...prev,
      recipientName: address.name || "",
      phone: address.phone || "",
      shippingAddress: getFullAddress(address),
    }));
    // Store the initial address info for potential reset
    setInitialAddressInfo({
      recipientName: address.name || "",
      phone: address.phone || "",
      shippingAddress: getFullAddress(address),
    });
    setIsEditingAddress(false);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCheckoutInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handlePaymentChange = (value: string) => {
    setCheckoutInfo((prev) => ({ ...prev, paymentMethod: value }));
  };

  const handleAddressSelection = (addressId: string) => {
    if (addressId === "manual") {
      setUseManualAddress(true);
      setIsEditingAddress(true);
      setShowAddressSelection(false);
      return;
    }

    setUseManualAddress(false);
    setSelectedAddressId(addressId);

    const selectedAddress = userAddresses.find(
      (addr) => addr._id === addressId
    );
    if (selectedAddress) {
      updateCheckoutInfoFromAddress(selectedAddress);
    }
  };

  const toggleAddressEditing = () => {
    if (isEditingAddress) {
      // Reset to original address info if canceling edit
      if (!useManualAddress && selectedAddressId) {
        setCheckoutInfo((prev) => ({
          ...prev,
          recipientName: initialAddressInfo.recipientName || prev.recipientName,
          phone: initialAddressInfo.phone || prev.phone,
          shippingAddress:
            initialAddressInfo.shippingAddress || prev.shippingAddress,
        }));
      }
    }
    setIsEditingAddress(!isEditingAddress);
  };

  const handleOpenCheckout = () => {
    setIsCheckoutDialogOpen(true);
  };

  const handleConfirmOrder = async () => {
    // Validation
    if (!checkoutInfo.recipientName.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập tên người nhận.",
        variant: "destructive",
      });
      return;
    }
    if (!checkoutInfo.phone.trim() || !phoneRegex.test(checkoutInfo.phone)) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập số điện thoại hợp lệ.",
        variant: "destructive",
      });
      return;
    }
    if (!checkoutInfo.shippingAddress.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập địa chỉ giao hàng.",
        variant: "destructive",
      });
      return;
    }
    if (cartItems.length === 0) {
      toast({
        title: "Lỗi",
        description: "Giỏ hàng trống.",
        variant: "destructive",
      });
      return;
    }
    try {
      // Chuẩn bị dữ liệu đúng chuẩn API Orders
      const orderData = {
        recipientName: checkoutInfo.recipientName,
        phone: checkoutInfo.phone,
        shippingAddress: checkoutInfo.shippingAddress,
        note: checkoutInfo.note,
        items: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.price,
        })),
      };
      // 1. Tạo đơn hàng
      const orderRes = await apiFetch("http://localhost:10000/api/orders", {
        method: "POST",
        body: JSON.stringify(orderData),
      });
      // Nếu chọn online, tạo payment link và redirect
      if (checkoutInfo.paymentMethod === "online") {
        const orderId = orderRes?.order?._id || orderRes?.order?.id;
        if (!orderId) throw new Error("Không lấy được mã đơn hàng!");
        const paymentRes = await apiFetch(
          "http://localhost:10000/api/payments/create",
          {
            method: "POST",
            body: JSON.stringify({ orderId }),
          }
        );
        if (paymentRes.success && paymentRes.data?.paymentUrl) {
          window.location.href = paymentRes.data.paymentUrl;
          return;
        } else {
          throw new Error("Tạo link thanh toán thất bại!");
        }
      }
      // Nếu COD, flow cũ
      localStorage.removeItem("cart");
      setIsCheckoutDialogOpen(false);
      toast({
        title: "Đặt hàng thành công!",
        description: "Đơn hàng của bạn đang được xử lý.",
      });
      const orderId = orderRes?.order?._id || orderRes?.order?.id;
      navigate(`/order-confirmation?orderId=${orderId}`);
    } catch (error) {
      toast({
        title: "Lỗi",
        description:
          error instanceof Error
            ? error.message
            : "Không thể đặt hàng. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  const total = subtotal + 1000;

  const handleEditAddressClick = () => {
    setShowAddressSelection(true);
  };

  const handleAddNewAddress = (newAddress: AddressInfo) => {
    // After successfully adding a new address, refresh the address list
    fetchUserAddresses();
    // Select the newly added address
    if (newAddress._id) {
      handleAddressSelection(newAddress._id);
    }
    // Close the address form and return to the address selection
    setShowAddressForm(false);
    setShowAddressSelection(true);
  };

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
                  <CardTitle>
                    Sản phẩm trong giỏ (
                    {cartItems.reduce((acc, item) => acc + item.quantity, 0)})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isCartLoading
                    ? Array.from({ length: 2 }).map((_, i) => (
                        <div
                          key={i}
                          className="flex items-center space-x-4 animate-pulse"
                        >
                          <div className="h-24 w-24 rounded-md bg-gray-200"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                          </div>
                          <div className="h-8 w-24 bg-gray-200 rounded-md"></div>
                        </div>
                      ))
                    : cartItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center space-x-4"
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-24 w-24 rounded-md object-cover"
                          />
                          <div className="flex-1">
                            <h3 className="font-medium">{item.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {formatVND(item.price)}
                            </p>
                          </div>
                          <div className="flex items-center border rounded-md">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.id, -1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center">
                              {item.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.id, 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                      ))}
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Tóm Tắt Đơn Hàng</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Tạm tính</span>
                    <span>{formatVND(subtotal)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span>Tổng cộng</span>
                    <span>{formatVND(total)}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleOpenCheckout}
                    disabled={isSubmitting || isProfileLoading}
                    style={{ backgroundColor: "#7494ec" }}
                  >
                    {isProfileLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {isProfileLoading ? "Đang tải..." : "Tiến hành thanh toán"}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground" />
            <h2 className="mt-2 text-2xl font-semibold">
              Giỏ hàng của bạn đang trống
            </h2>
            <p className="mt-1 text-muted-foreground">
              Hãy thêm sản phẩm vào giỏ để bắt đầu.
            </p>
            <Button
              asChild
              className="mt-6"
              style={{ backgroundColor: "#7494ec" }}
            >
              <Link to="/">Bắt đầu mua sắm</Link>
            </Button>
          </div>
        )}
      </main>

      <Dialog
        open={isCheckoutDialogOpen}
        onOpenChange={setIsCheckoutDialogOpen}
      >
        <DialogContent
          className="sm:max-w-[600px]"
          style={{ maxHeight: "90vh", overflowY: "auto" }}
        >
          <DialogHeader>
            <DialogTitle>Thông Tin Đặt Hàng</DialogTitle>
            <DialogDescription>
              Vui lòng nhập thông tin giao hàng và kiểm tra lại sản phẩm trước
              khi xác nhận.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">
                Tên người nhận <span style={{ color: "red" }}>*</span>
              </Label>
              <Input
                className="col-span-3"
                name="recipientName"
                value={checkoutInfo.recipientName}
                onChange={handleInputChange}
                placeholder="Nhập tên người nhận"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">
                Số điện thoại <span style={{ color: "red" }}>*</span>
              </Label>
              <Input
                className="col-span-3"
                name="phone"
                value={checkoutInfo.phone}
                onChange={handleInputChange}
                placeholder="Nhập số điện thoại"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">
                Địa chỉ giao hàng <span style={{ color: "red" }}>*</span>
              </Label>
              <Textarea
                className="col-span-3"
                name="shippingAddress"
                value={checkoutInfo.shippingAddress}
                onChange={handleInputChange}
                placeholder="Nhập địa chỉ giao hàng"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Ghi chú</Label>
              <Textarea
                className="col-span-3"
                name="note"
                value={checkoutInfo.note}
                onChange={handleInputChange}
                placeholder="Ghi chú cho đơn hàng (nếu có)"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Phương thức thanh toán</Label>
              <div className="col-span-3">
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={checkoutInfo.paymentMethod === "cod"}
                      onChange={() => handlePaymentChange("cod")}
                    />
                    Thanh toán khi nhận hàng (COD)
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="online"
                      checked={checkoutInfo.paymentMethod === "online"}
                      onChange={() => handlePaymentChange("online")}
                    />
                    Thanh toán online
                  </label>
                </div>
              </div>
            </div>
            <Separator className="my-2" />
            <div>
              <div className="font-semibold mb-2">Sản phẩm trong đơn hàng</div>
              <div className="space-y-2 max-h-[180px] overflow-y-auto">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between border rounded-md p-2 bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-12 w-12 rounded object-cover border"
                      />
                      <div>
                        <div className="font-medium text-base">{item.name}</div>
                        <div className="text-sm text-gray-500">
                          x{item.quantity}
                        </div>
                      </div>
                    </div>
                    <div className="font-semibold text-[#7494ec]">
                      {formatVND(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between">
              <span>Tạm tính</span>
              <span>{formatVND(subtotal)}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between font-bold text-lg">
              <span>Tổng cộng</span>
              <span>{formatVND(total)}</span>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCheckoutDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button
              onClick={handleConfirmOrder}
              style={{ backgroundColor: "#7494ec" }}
            >
              Đặt hàng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Cart;
