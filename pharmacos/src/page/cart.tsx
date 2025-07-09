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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  apiFetch,
  cartApi,
  orderApi,
  paymentApi,
  getCustomerAddresses,
  createCustomerAddress,
  deleteCustomerAddress,
  AddressData,
  AddressResponse,
} from "@/lib/api";
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
    clearCart, // Add this if it exists in your CartContext
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

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

      // Use the new API function
      const addresses = await getCustomerAddresses();

      // Convert AddressResponse[] to AddressInfo[] format
      const convertedAddresses: AddressInfo[] = addresses.map(
        (addr: AddressResponse) => ({
          _id: addr._id,
          name: addr.name,
          phone: addr.phone,
          address: addr.address,
          city: addr.city,
          district: addr.district,
          ward: addr.ward,
          addressType: addr.addressType, // Keep the Vietnamese format from API
          isDefault: addr.isDefault,
          createdAt: addr.createdAt,
          updatedAt: addr.updatedAt,
        })
      );

      setUserAddresses(convertedAddresses);

      // Set default address if available
      const defaultAddress = convertedAddresses.find((addr) => addr.isDefault);
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
      // Show user-friendly error message
      toast({
        title: "Error",
        description: "Unable to load saved addresses. Please try again.",
        variant: "destructive",
      });
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

  const handleOpenCheckout = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast({
        title: "Login Required",
        description: "Please log in to continue with checkout.",
        variant: "destructive",
      });
      navigate("/login", { state: { from: "/cart" } });
      return;
    }

    setIsProfileLoading(true);
    try {
      // Fetch user's saved addresses
      await fetchUserAddresses();

      // Load latest user information to fill the form
      const profileData = await apiFetch(
        "http://localhost:10000/api/customers/profile"
      );

      // Only set profile data if no address is selected
      if (!selectedAddressId) {
        setCheckoutInfo((prev) => ({
          ...prev,
          recipientName: profileData.name || "",
          phone: profileData.phone || "",
          shippingAddress: getFullAddress(profileData),
        }));
      }

      setIsCheckoutDialogOpen(true);
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      toast({
        title: "Error",
        description:
          "Unable to load your personal information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProfileLoading(false);
    }
  };

  const handleConfirmOrder = async () => {
    // Validation
    if (!checkoutInfo.recipientName.trim()) {
      toast({
        title: "Error",
        description: "Please enter recipient name.",
        variant: "destructive",
      });
      return;
    }
    if (!checkoutInfo.phone.trim() || !phoneRegex.test(checkoutInfo.phone)) {
      toast({
        title: "Error",
        description: "Please enter a valid phone number.",
        variant: "destructive",
      });
      return;
    }
    if (!checkoutInfo.shippingAddress.trim()) {
      toast({
        title: "Error",
        description: "Please enter shipping address.",
        variant: "destructive",
      });
      return;
    }
    if (cartItems.length === 0) {
      toast({
        title: "Error",
        description: "Cart is empty.",
        variant: "destructive",
      });
      return;
    }
    try {
      // Prepare order data according to API Orders standard
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

      // 1. Create order
      const orderRes = await apiFetch("http://localhost:10000/api/orders", {
        method: "POST",
        body: JSON.stringify(orderData),
      });

      // If online payment is selected, create payment link and redirect (DO NOT clear cart)
      if (checkoutInfo.paymentMethod === "online") {
        const orderId = orderRes?.order?._id || orderRes?.order?.id;
        if (!orderId) throw new Error("Cannot get order ID!");

        const paymentRes = await apiFetch(
          "http://localhost:10000/api/payments/create",
          {
            method: "POST",
            body: JSON.stringify({ orderId }),
          }
        );

        if (paymentRes.success && paymentRes.data?.paymentUrl) {
          // Save order info to localStorage for processing after payment
          localStorage.setItem(
            "pendingOrder",
            JSON.stringify({
              orderId,
              cartItems: cartItems.map((item) => ({ ...item })),
            })
          );

          setIsCheckoutDialogOpen(false);
          toast({
            title: "Redirecting...",
            description: "Redirecting to payment page.",
          });

          // Redirect to payment gateway WITHOUT clearing cart
          window.location.href = paymentRes.data.paymentUrl;
          return;
        } else {
          throw new Error("Failed to create payment link!");
        }
      }

      // If COD, clear cart immediately as payment is completed
      localStorage.removeItem("cart");
      cartItems.forEach((item) => removeItem(item.id));

      setIsCheckoutDialogOpen(false);
      toast({
        title: "Order placed successfully!",
        description: "Your order is being processed.",
      });
      const orderId = orderRes?.order?._id || orderRes?.order?.id;
      navigate(`/order-confirmation?orderId=${orderId}`);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Unable to place order. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle payment return (success/failure)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get("payment");
    const orderId = urlParams.get("orderId");
    const vnp_ResponseCode = urlParams.get("vnp_ResponseCode");
    const paypal_status = urlParams.get("paypal_status");

    if (paymentStatus && orderId) {
      // Clear URL params first
      window.history.replaceState({}, document.title, window.location.pathname);

      if (
        paymentStatus === "success" ||
        vnp_ResponseCode === "00" ||
        paypal_status === "success"
      ) {
        // Payment successful - clear cart and pending order
        const pendingOrder = localStorage.getItem("pendingOrder");
        if (pendingOrder) {
          try {
            const orderData = JSON.parse(pendingOrder);
            localStorage.removeItem("cart");
            orderData.cartItems.forEach((item: any) => removeItem(item.id));
            localStorage.removeItem("pendingOrder");
          } catch (error) {
            console.error("Error clearing pending order:", error);
          }
        }

        toast({
          title: "Payment successful!",
          description: "Your order has been paid and is being processed.",
        });
        navigate(`/order-confirmation?orderId=${orderId}`);
      } else if (
        paymentStatus === "failed" ||
        paymentStatus === "cancel" ||
        vnp_ResponseCode !== "00"
      ) {
        // Payment failed/cancelled - KEEP cart and payment link available for retry
        const isCancelled = paymentStatus === "cancel";

        // Restore cart from pending order if needed
        const pendingOrder = localStorage.getItem("pendingOrder");
        if (pendingOrder && !localStorage.getItem("cart")) {
          try {
            const orderData = JSON.parse(pendingOrder);
            localStorage.setItem("cart", JSON.stringify(orderData.cartItems));
            window.dispatchEvent(new Event("cartUpdated"));
          } catch (error) {
            console.error("Error restoring cart:", error);
          }
        }

        toast({
          title: isCancelled ? "Payment cancelled" : "Payment failed",
          description: isCancelled
            ? "You cancelled the payment. The payment link is still valid. You can retry payment from the order page."
            : "An error occurred during payment. You can try again from the order page.",
          variant: "destructive",
        });

        // Always navigate to orders page so user can retry payment
        navigate("/profile/orders");
      }
    }
  }, [navigate, toast, removeItem]);

  const total = subtotal + 1000;

  const handleEditAddressClick = () => {
    setShowAddressSelection(true);
  };

  const handleAddNewAddress = async (addressData: AddressData) => {
    try {
      // Create address using new API
      const result = await createCustomerAddress(addressData);

      if (result.success && result.data) {
        toast({
          title: "Success",
          description: result.message || "Address added successfully!",
        });

        // Refresh the address list
        await fetchUserAddresses();

        // Select the newly added address
        if (result.data._id) {
          handleAddressSelection(result.data._id);
        }

        // Close the address form and return to the address selection
        setShowAddressForm(false);
        setShowAddressSelection(true);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.message || "Failed to add address. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAddress = (addressId: string, addressName: string) => {
    setAddressToDelete({ id: addressId, name: addressName });
    setDeleteDialogOpen(true);
  };

  const confirmDeleteAddress = async () => {
    if (!addressToDelete) return;

    try {
      await deleteCustomerAddress(addressToDelete.id);

      toast({
        title: "Success",
        description: "Địa chỉ đã được xóa thành công!",
      });

      // If the deleted address was selected, clear selection
      if (selectedAddressId === addressToDelete.id) {
        setSelectedAddressId("");
        setUseManualAddress(true);
        setCheckoutInfo((prev) => ({
          ...prev,
          recipientName: "",
          phone: "",
          shippingAddress: "",
        }));
      }

      // Refresh the address list
      await fetchUserAddresses();
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.message || "Không thể xóa địa chỉ. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setAddressToDelete(null);
    }
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
            Continue Shopping
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-8">Your Shopping Cart</h1>

        {cartItems.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>
                    Items in Cart (
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
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Shipping Fee</span>
                    <span>{formatVND(1000)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatVND(subtotal)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
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
                    {isProfileLoading ? "Loading..." : "Proceed to Checkout"}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground" />
            <h2 className="mt-2 text-2xl font-semibold">Your cart is empty</h2>
            <p className="mt-1 text-muted-foreground">
              Add products to cart to get started.
            </p>
            <Button
              asChild
              className="mt-6"
              style={{ backgroundColor: "#7494ec" }}
            >
              <Link to="/">Start Shopping</Link>
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
            <DialogTitle>Order Information</DialogTitle>
            <DialogDescription>
              Please enter shipping information and review products before
              confirming.
            </DialogDescription>
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
                <h3
                  className="text-lg font-medium"
                  id="address-selection-title"
                >
                  Select Delivery Address
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowAddressSelection(false)}
                  aria-label="Close address selection"
                  title="Close address selection"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div
                className="space-y-3 max-h-[300px] overflow-y-auto"
                role="radiogroup"
                aria-labelledby="address-selection-title"
              >
                {userAddresses.map((addr) => (
                  <div
                    key={addr._id}
                    className={`border rounded-md p-3 cursor-pointer ${
                      addr._id === selectedAddressId
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200"
                    }`}
                    onClick={() => handleAddressSelection(addr._id || "")}
                    role="radio"
                    aria-checked={addr._id === selectedAddressId}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 pt-1">
                        <input
                          type="radio"
                          checked={addr._id === selectedAddressId}
                          onChange={() =>
                            handleAddressSelection(addr._id || "")
                          }
                          className="h-4 w-4 text-blue-600"
                          id={`address-${addr._id}`}
                          name="selected-address"
                          aria-label={`Địa chỉ: ${addr.name}, ${
                            addr.phone
                          }, ${getFullAddress(addr)}`}
                        />
                      </div>
                      <div className="ml-3 flex-grow">
                        <label
                          htmlFor={`address-${addr._id}`}
                          className="block w-full cursor-pointer"
                        >
                          <div className="flex justify-between">
                            <span className="font-medium">{addr.name}</span>
                            <div className="flex items-center gap-2">
                              {addr.isDefault && (
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                                  Default
                                </span>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent triggering the address selection
                                  handleDeleteAddress(
                                    addr._id || "",
                                    addr.name || ""
                                  );
                                }}
                                title="Xóa địa chỉ"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <div className="text-sm text-gray-600">
                            {addr.phone}
                          </div>
                          <div className="text-sm mt-1">
                            {getFullAddress(addr)}
                          </div>
                          <div className="mt-1 flex items-center">
                            {addr.addressType === "Nhà riêng" ||
                            addr.addressType === "Home" ? (
                              <Home className="h-3.5 w-3.5 text-gray-400 mr-1" />
                            ) : (
                              <Building className="h-3.5 w-3.5 text-gray-400 mr-1" />
                            )}
                            <span className="text-xs text-gray-500">
                              {addr.addressType === "Home"
                                ? "Nhà riêng"
                                : addr.addressType === "Office"
                                ? "Văn phòng"
                                : addr.addressType}
                            </span>
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
                    <span className="font-medium">Add New Address</span>
                  </div>
                </div>

                <div
                  className={`border rounded-md p-3 cursor-pointer ${
                    useManualAddress
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200"
                  }`}
                  onClick={() => handleAddressSelection("manual")}
                  role="radio"
                  aria-checked={useManualAddress}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 pt-1">
                      <input
                        type="radio"
                        checked={useManualAddress}
                        onChange={() => handleAddressSelection("manual")}
                        className="h-4 w-4 text-blue-600"
                        id="manual-address"
                        name="selected-address"
                        aria-label="Nhập địa chỉ mới"
                      />
                    </div>
                    <div className="ml-3 flex-grow">
                      <label
                        htmlFor="manual-address"
                        className="block w-full cursor-pointer"
                      >
                        <span className="font-medium">Enter New Address</span>
                        <div className="text-sm text-gray-600 mt-1">
                          Enter different shipping information
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowAddressSelection(false)}
                  title="Back to checkout page"
                >
                  Back
                </Button>
                <Button
                  onClick={() => setShowAddressSelection(false)}
                  style={{ backgroundColor: "#7494ec" }}
                  title="Confirm selected address"
                >
                  Confirm
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right" id="shipping-address-label">
                  Shipping Address
                </Label>
                <div className="col-span-3">
                  <div
                    className="border rounded-md p-3"
                    aria-labelledby="shipping-address-label"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">
                          {checkoutInfo.recipientName}
                        </div>
                        <div className="text-sm text-gray-600">
                          {checkoutInfo.phone}
                        </div>
                        <div className="text-sm mt-1">
                          {checkoutInfo.shippingAddress}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleEditAddressClick}
                        className="text-blue-500 p-0 h-auto hover:bg-transparent"
                        aria-label="Edit shipping address"
                        title="Edit shipping address"
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {useManualAddress && (
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">
                      Recipient Name <span style={{ color: "red" }}>*</span>
                    </Label>
                    <Input
                      className="col-span-3"
                      name="recipientName"
                      value={checkoutInfo.recipientName}
                      onChange={handleInputChange}
                      placeholder="Enter recipient name"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">
                      Phone Number <span style={{ color: "red" }}>*</span>
                    </Label>
                    <Input
                      className="col-span-3"
                      name="phone"
                      value={checkoutInfo.phone}
                      onChange={handleInputChange}
                      placeholder="Enter phone number"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">
                      Shipping Address <span style={{ color: "red" }}>*</span>
                    </Label>
                    <Textarea
                      className="col-span-3"
                      name="shippingAddress"
                      value={checkoutInfo.shippingAddress}
                      onChange={handleInputChange}
                      placeholder="Enter shipping address"
                      required
                    />
                  </div>
                </>
              )}

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Notes</Label>
                <Textarea
                  className="col-span-3"
                  name="note"
                  value={checkoutInfo.note}
                  onChange={handleInputChange}
                  placeholder="Order notes (optional)"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Payment Method</Label>
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
                      Cash on Delivery (COD)
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="online"
                        checked={checkoutInfo.paymentMethod === "online"}
                        onChange={() => handlePaymentChange("online")}
                      />
                      Online Payment
                    </label>
                  </div>
                </div>
              </div>
              <Separator className="my-2" />
              <div>
                <div className="font-semibold mb-2">Products in Order</div>
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
                          <div className="font-medium text-base">
                            {item.name}
                          </div>
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
                <span>Subtotal</span>
                <span>{formatVND(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span>{formatVND(1000)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{formatVND(total)}</span>
              </div>
            </div>
          )}

          {!showAddressSelection && !showAddressForm && (
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCheckoutDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmOrder}
                style={{ backgroundColor: "#7494ec" }}
              >
                Place Order
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Address Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa địa chỉ</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa địa chỉ của "{addressToDelete?.name}"?
              <br />
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteAddress}
              className="bg-red-600 hover:bg-red-700"
            >
              Xóa địa chỉ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Cart;
