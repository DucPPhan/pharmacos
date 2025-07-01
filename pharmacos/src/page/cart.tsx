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
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag, Loader2, MapPin, PencilIcon, X, Home, Building } from "lucide-react";
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
import { AddressInfo, getFullAddress } from "./profile/AddressBook";
import { PlusOutlined } from "@ant-design/icons";
import NewAddressForm from "./NewAddressForm";

// Regex để xác thực số điện thoại Việt Nam
const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;

const formatVND = (value: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

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
  const [initialAddressInfo, setInitialAddressInfo] = useState<Partial<OrderDetails>>({});
  const [showAddressSelection, setShowAddressSelection] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);

  const [checkoutInfo, setCheckoutInfo] = useState<OrderDetails>({
    recipientName: "",
    phone: "",
    shippingAddress: "",
    note: "",
  });

  const fetchUserAddresses = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const addresses = await apiFetch('http://localhost:10000/api/customers/addresses');
      setUserAddresses(addresses);

      // Set default address if available
      const defaultAddress = addresses.find(addr => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress._id || "");
        updateCheckoutInfoFromAddress(defaultAddress);
        // Store the initial address info for potential reset
        setInitialAddressInfo({
          recipientName: defaultAddress.name || "",
          phone: defaultAddress.phone || "",
          shippingAddress: getFullAddress(defaultAddress)
        });
        setIsEditingAddress(false);
      }
    } catch (error) {
      console.error("Failed to fetch user addresses:", error);
    }
  };

  const updateCheckoutInfoFromAddress = (address: AddressInfo) => {
    setCheckoutInfo(prev => ({
      ...prev,
      recipientName: address.name || "",
      phone: address.phone || "",
      shippingAddress: getFullAddress(address)
    }));
    // Store the initial address info for potential reset
    setInitialAddressInfo({
      recipientName: address.name || "",
      phone: address.phone || "",
      shippingAddress: getFullAddress(address)
    });
    setIsEditingAddress(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCheckoutInfo(prev => ({ ...prev, [name]: value }));
  };

  const handlePaymentChange = (value: string) => {
    setCheckoutInfo(prev => ({ ...prev, paymentMethod: value }));
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

    const selectedAddress = userAddresses.find(addr => addr._id === addressId);
    if (selectedAddress) {
      updateCheckoutInfoFromAddress(selectedAddress);
    }
  };

  const toggleAddressEditing = () => {
    if (isEditingAddress) {
      // Reset to original address info if canceling edit
      if (!useManualAddress && selectedAddressId) {
        setCheckoutInfo(prev => ({
          ...prev,
          recipientName: initialAddressInfo.recipientName || prev.recipientName,
          phone: initialAddressInfo.phone || prev.phone,
          shippingAddress: initialAddressInfo.shippingAddress || prev.shippingAddress
        }));
      }
    }
    setIsEditingAddress(!isEditingAddress);
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

      // Fetch user's saved addresses
      await fetchUserAddresses();

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
                          <p className="text-sm text-muted-foreground">{formatVND(item.price)}</p>
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
                  <div className="flex justify-between"><span>Tạm tính</span><span>{formatVND(subtotal)}</span></div>
                  <div className="flex justify-between"><span>Phí vận chuyển</span><span>{formatVND(shipping)}</span></div>
                  <div className="flex justify-between"><span>Thuế</span><span>{formatVND(tax)}</span></div>
                  <Separator />
                  <div className="flex justify-between font-bold"><span>Tổng cộng</span><span>{formatVND(total)}</span></div>
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
        <DialogContent className="sm:max-w-[600px]" style={{ maxHeight: "90vh", overflowY: "auto" }}>
          <DialogHeader>
            <DialogTitle>Thông Tin Giao Hàng</DialogTitle>
            <DialogDescription>Vui lòng xác nhận thông tin trước khi đặt hàng.</DialogDescription>
          </DialogHeader>

          {showAddressForm ? (
            <NewAddressForm
              onSave={handleAddNewAddress}
              onCancel={() => {
                setShowAddressForm(false);
                setShowAddressSelection(true);
              }}
            />
          ) : showAddressSelection ? (
            <div className="py-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium" id="address-selection-title">Chọn địa chỉ nhận hàng</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowAddressSelection(false)}
                  aria-label="Đóng chọn địa chỉ"
                  title="Đóng chọn địa chỉ"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-3 max-h-[300px] overflow-y-auto" role="radiogroup" aria-labelledby="address-selection-title">
                {userAddresses.map((addr) => (
                  <div
                    key={addr._id}
                    className={`border rounded-md p-3 ${addr._id === selectedAddressId ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                    onClick={() => handleAddressSelection(addr._id || "")}
                    role="radio"
                    aria-checked={addr._id === selectedAddressId}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 pt-1">
                        <input
                          type="radio"
                          checked={addr._id === selectedAddressId}
                          onChange={() => handleAddressSelection(addr._id || "")}
                          className="h-4 w-4 text-blue-600"
                          id={`address-${addr._id}`}
                          name="selected-address"
                          aria-label={`Địa chỉ: ${addr.name}, ${addr.phone}, ${getFullAddress(addr)}`}
                        />
                      </div>
                      <div className="ml-3 flex-grow">
                        <label htmlFor={`address-${addr._id}`} className="block w-full cursor-pointer">
                          <div className="flex justify-between">
                            <span className="font-medium">{addr.name}</span>
                            {addr.isDefault && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                                Mặc định
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600">{addr.phone}</div>
                          <div className="text-sm mt-1">{getFullAddress(addr)}</div>
                          <div className="mt-1 flex items-center">
                            {addr.addressType === "Home" ? (
                              <Home className="h-3.5 w-3.5 text-gray-400 mr-1" />
                            ) : (
                              <Building className="h-3.5 w-3.5 text-gray-400 mr-1" />
                            )}
                            <span className="text-xs text-gray-500">{addr.addressType}</span>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}

                <div
                  className="border rounded-md p-3 border-dashed hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer"
                  onClick={() => setShowAddressForm(true)}
                  role="button"
                  aria-label="Thêm địa chỉ mới"
                >
                  <div className="flex items-center justify-center py-2">
                    <PlusOutlined className="h-4 w-4 mr-2" />
                    <span className="font-medium">Thêm địa chỉ mới</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowAddressSelection(false)}
                  title="Quay lại trang thanh toán"
                >
                  Quay lại
                </Button>
                <Button
                  onClick={() => setShowAddressSelection(false)}
                  style={{ backgroundColor: "#7494ec" }}
                  title="Xác nhận địa chỉ đã chọn"
                >
                  Xác nhận
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right" id="shipping-address-label">Địa chỉ giao hàng</Label>
                <div className="col-span-3">
                  <div className="border rounded-md p-3" aria-labelledby="shipping-address-label">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{checkoutInfo.recipientName}</div>
                        <div className="text-sm text-gray-600">{checkoutInfo.phone}</div>
                        <div className="text-sm mt-1">{checkoutInfo.shippingAddress}</div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleEditAddressClick}
                        className="text-blue-500 p-0 h-auto hover:bg-transparent"
                        aria-label="Sửa địa chỉ giao hàng"
                        title="Sửa địa chỉ giao hàng"
                      >
                        Sửa
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="note" className="text-right">Ghi chú</Label>
                <Textarea
                  id="note"
                  name="note"
                  placeholder="Tùy chọn: hướng dẫn giao hàng,..."
                  value={checkoutInfo.note}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>

              <Separator className="my-2" />

              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right pt-2">Thanh toán</Label>
                <RadioGroup onValueChange={handlePaymentChange} defaultValue="cod" className="col-span-3 space-y-2">
                  <div className="flex items-center space-x-2"><RadioGroupItem value="cod" id="cod" /><Label htmlFor="cod">Thanh toán khi nhận hàng (COD)</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="online" id="online" disabled /><Label htmlFor="online" className="text-muted-foreground">Thanh toán online (Sắp có)</Label></div>
                </RadioGroup>
              </div>
            </div>
          )}

          {!showAddressSelection && (
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCheckoutDialogOpen(false)}>Hủy</Button>
              <Button onClick={handleConfirmOrder} disabled={isSubmitting} style={{ backgroundColor: "#7494ec" }}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? "Đang đặt hàng..." : "Xác nhận đơn hàng"}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Cart;