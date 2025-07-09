import React, { useEffect, useState } from "react";
import { Card, Button, Tabs, Tag, Spin, Modal, Radio, Input, Progress } from "antd";
import { GiftOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { orderApi } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

const ORDER_STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: "Pending", color: "orange" },
  processing: { label: "Processing", color: "blue" },
  completed: { label: "Completed", color: "green" },
  cancelled: { label: "Cancelled", color: "red" },
};

const ORDER_TABS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "processing", label: "Processing" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

const CANCEL_REASONS = [
  "I want to change the delivery address",
  "I want to change products in the order",
  "I found a better price elsewhere",
  "I no longer want to buy",
  "Ordered the wrong product",
  "Delivery time is too long",
  "Other reason",
];

const fetchOrders = async () => {
  // const token = localStorage.getItem('token');
  // const res = await fetch('http://localhost:10000/api/orders/my-orders', {
  //     method: 'GET',
  //     headers: {
  //         'Content-Type': 'application/json',
  //         ...(token ? { Authorization: `Bearer ${token}` } : {})
  //     }
  // });
  // if (!res.ok) return [];
  // return await res.json();
  try {
    return await orderApi.getMyOrders();
  } catch {
    return [];
  }
};

const formatVND = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    value
  );

const MyOrders: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [orderTab, setOrderTab] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const { toast } = useToast();
  const [paymentTimeouts, setPaymentTimeouts] = useState<{ [key: string]: boolean }>({});
  const [paymentTimers, setPaymentTimers] = useState<{ [key: string]: number }>({});

  // Add modal state variables
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelOrderId, setCancelOrderId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState<string>("");
  const [customReason, setCustomReason] = useState<string>("");

  // Combine both useEffect hooks into one
  useEffect(() => {
    setLoading(true);
    fetchOrders().then((data) => {
      setOrders(data);

      // Check payment status for each online/bank order
      data.forEach((order: any) => {
        if ((order.paymentMethod === 'online' || order.paymentMethod === 'bank') &&
          order.paymentStatus === 'pending') {
          checkPaymentTimeout(order.id || order._id);
        }
      });

      setLoading(false);
    });
  }, []);

  const checkPaymentTimeout = async (orderId: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:10000/api/payments/status/${orderId}`,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          const isExpired = result.data.paymentExpired || result.data.timeLeft <= 0;
          setPaymentTimeouts(prev => ({
            ...prev,
            [orderId]: isExpired
          }));

          // Start countdown if payment is still active
          if (!isExpired && result.data.timeLeft > 0) {
            setPaymentTimers(prev => ({
              ...prev,
              [orderId]: result.data.timeLeft
            }));
            startCountdown(orderId, result.data.timeLeft);
          }
        }
      }
    } catch (error) {
      console.error("Error checking payment timeout:", error);
    }
  };

  const startCountdown = (orderId: string, initialTime: number) => {
    let timeLeft = initialTime;

    const timer = setInterval(() => {
      timeLeft -= 1;

      setPaymentTimers(prev => ({
        ...prev,
        [orderId]: timeLeft
      }));

      if (timeLeft <= 0) {
        clearInterval(timer);
        setPaymentTimeouts(prev => ({
          ...prev,
          [orderId]: true
        }));
        setPaymentTimers(prev => {
          const newTimers = { ...prev };
          delete newTimers[orderId];
          return newTimers;
        });
        toast({
          title: "Payment Expired",
          description: `Payment time has expired for order #${orderId}`,
          variant: "destructive",
        });
      }
    }, 1000);

    // Store timer reference to clean up later if needed
    return timer;
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <Spin size="large" style={{ display: "block", margin: "64px auto" }} />
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "48px 0" }}>
        <div
          style={{
            width: 140,
            height: 140,
            margin: "0 auto 24px auto",
            borderRadius: "50%",
            background: "#f5f8ff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 32px 0 #e6f0ff",
          }}
        >
          <GiftOutlined style={{ fontSize: 64, color: "#7494ec" }} />
        </div>
        <div
          style={{
            fontWeight: 600,
            fontSize: 22,
            marginBottom: 8,
            color: "#222",
          }}
        >
          You have no orders yet.
        </div>
        <div style={{ color: "#888", marginBottom: 24 }}>
          Discover thousands of products at Pharmacy!
        </div>
        <Button
          type="primary"
          shape="round"
          size="large"
          icon={<ShoppingCartOutlined />}
          onClick={() => (window.location.href = "/")}
        >
          Shop Now
        </Button>
      </div>
    );
  }

  const normalizeStatus = (status: string | undefined) => {
    if (!status) return "pending";
    const s = status.toLowerCase();
    if (s === "pending") return "pending";
    if (s === "processing") return "processing";
    if (s === "completed") return "completed";
    if (s === "cancelled" || s === "canceled") return "cancelled";
    return s;
  };

  // Hàm tính tổng tiền cho 1 đơn hàng
  const getOrderTotal = (order: any) => {
    if (Array.isArray(order.items)) {
      return order.items.reduce((sum, item) => {
        if (!item.productId) return sum; // skip deleted/null products
        return sum + (item.unitPrice ?? item.price ?? 0) * (item.quantity ?? 1);
      }, 0);
    }
    return 0;
  };

  const getPaymentMethodDisplay = (paymentMethod: string) => {
    switch (paymentMethod) {
      case "cod":
        return "💵 COD";
      case "online":
        return "💳 Online";
      case "cash":
        return "💵 Cash";
      case "bank":
        return "🏦 Bank Transfer";
      default:
        return "❓ N/A";
    }
  };

  const filteredOrders =
    orderTab === "all"
      ? orders
      : orders.filter((o) => normalizeStatus(o.status) === orderTab);

  // Tổng số tiền đã chi cho filteredOrders
  const totalSpent = filteredOrders.reduce(
    (sum, order) => sum + getOrderTotal(order),
    0
  );

  const handleCancelOrder = async (orderId: string) => {
    // Show cancel reason modal instead of directly canceling
    setCancelOrderId(orderId);
    setShowCancelModal(true);
  };

  const confirmCancelOrder = async () => {
    if (!cancelOrderId) return;

    if (!cancelReason) {
      toast({
        title: "Error",
        description: "Please select a reason for canceling the order.",
        variant: "destructive",
      });
      return;
    }

    if (cancelReason === "Other reason" && !customReason.trim()) {
      toast({
        title: "Error",
        description: "Please enter a specific reason.",
        variant: "destructive",
      });
      return;
    }

    setCancellingId(cancelOrderId);
    try {
      const token = localStorage.getItem("token");
      const reasonToSend =
        cancelReason === "Other reason" ? customReason : cancelReason;

      await fetch(`http://localhost:10000/api/orders/${cancelOrderId}/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          reason: reasonToSend,
        }),
      });

      // Refresh orders
      setOrders(await fetchOrders());

      toast({
        title: "Success",
        description: "Order has been canceled successfully.",
      });

      // Reset modal states
      setShowCancelModal(false);
      setCancelOrderId(null);
      setCancelReason("");
      setCustomReason("");
    } catch (e) {
      toast({
        title: "Error",
        description: "Failed to cancel order! Please try again.",
        variant: "destructive",
      });
    } finally {
      setCancellingId(null);
    }
  };

  const closeCancelModal = () => {
    setShowCancelModal(false);
    setCancelOrderId(null);
    setCancelReason("");
    setCustomReason("");
  };

  return (
    <>
      <Card
        title={<span className="user-profile-section-title">My Orders</span>}
        className="user-profile-section-card"
        styles={{ body: { padding: 0 } }}
        style={{ maxWidth: 1000, margin: "0 auto" }}
      >
        <div className="user-profile-section-content">
          <Tabs
            activeKey={orderTab}
            onChange={setOrderTab}
            items={ORDER_TABS.map((tab) => ({
              key: tab.key,
              label: tab.label,
            }))}
            style={{ marginBottom: 16 }}
          />
          <div style={{ maxHeight: 400, overflowY: "auto" }}>
            {filteredOrders.length === 0 ? (
              <div
                style={{ textAlign: "center", color: "#888", marginTop: 32 }}
              >
                No orders in this status.
              </div>
            ) : (
              filteredOrders.map((order, idx) => (
                <Card
                  key={order.id || idx}
                  style={{
                    marginBottom: 16,
                    borderRadius: 12,
                    border: "1px solid #f0f0f0",
                  }}
                  styles={{ body: { padding: 16 } }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <b>
                        Order
                        <span style={{ marginLeft: 8, color: "#aaa" }}>
                          #{order.id}
                        </span>
                      </b>
                      <span
                        style={{
                          marginLeft: 16,
                          fontWeight: 400,
                          color:
                            order.paymentStatus === "success"
                              ? "green"
                              : order.paymentStatus === "pending"
                                ? "orange"
                                : "red",
                        }}
                      >
                        {order.paymentStatus === "success"
                          ? "Đã thanh toán"
                          : order.paymentStatus === "pending"
                            ? "Chưa thanh toán"
                            : order.paymentStatus}
                      </span>
                      {order.paymentMethod && (
                        <span style={{
                          marginLeft: 8,
                          fontSize: 12,
                          color: "#666",
                          padding: "2px 6px",
                          background: "#f0f0f0",
                          borderRadius: 4,
                        }}>
                          {getPaymentMethodDisplay(order.paymentMethod)}
                        </span>
                      )}
                    </div>
                    <Tag
                      color={
                        ORDER_STATUS_MAP[normalizeStatus(order.status)]
                          ?.color || "orange"
                      }
                    >
                      {ORDER_STATUS_MAP[normalizeStatus(order.status)]?.label ||
                        "Processing"}
                    </Tag>
                  </div>
                  <div className="user-profile-order-items">
                    {(order.items || []).map((item: any, i: number) => (
                      <div key={i} className="user-profile-order-item">
                        <div
                          className="user-profile-order-item-name"
                          style={{
                            fontWeight: 700,
                            fontSize: 16,
                            color: "#1976d2",
                            background:
                              "linear-gradient(90deg,#e3f0ff 60%,#f7f9fb 100%)",
                            padding: "3px 10px",
                            borderRadius: 7,
                            marginBottom: 2,
                            maxWidth: 320,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "inline-block",
                          }}
                        >
                          {item.productId && item.productId.name
                            ? item.productId.name
                            : "Sản phẩm đã bị xóa"}
                        </div>
                        <div className="user-profile-order-item-price">
                          {formatVND(item.unitPrice ?? item.price ?? 0)} x
                          {item.quantity ?? 1}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <span
                        style={{ color: "#1677ff", cursor: "pointer" }}
                        onClick={() => navigate(`/order/${order.id}`)}
                      >
                        View details
                      </span>
                    </div>
                    <div>
                      <span style={{ color: "#888", marginRight: 8 }}>
                        Total:
                      </span>
                      <span
                        style={{
                          color: "#1677ff",
                          fontWeight: 600,
                          fontSize: 16,
                        }}
                      >
                        {formatVND(getOrderTotal(order) + 1000)}
                      </span>
                    </div>
                  </div>
                  {order.note && (
                    <div style={{ marginTop: 8, color: "#888", fontSize: 13 }}>
                      {order.note}
                    </div>
                  )}
                  {normalizeStatus(order.status) === "pending" && (
                    <div style={{ marginTop: 8 }}>
                      {/* Payment countdown timer for online/bank orders */}
                      {(order.paymentMethod === "online" || order.paymentMethod === "bank") &&
                        order.paymentStatus === "pending" &&
                        !paymentTimeouts[order.id || order._id] &&
                        paymentTimers[order.id || order._id] > 0 && (
                          <div
                            style={{
                              background: "linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)",
                              padding: "12px 16px",
                              borderRadius: 8,
                              border: "1px solid #ffc107",
                              textAlign: "center",
                              marginBottom: 12,
                            }}
                          >
                            <div
                              style={{
                                fontWeight: 600,
                                fontSize: 12,
                                color: "#856404",
                                marginBottom: 4,
                              }}
                            >
                              ⏰ Thời gian thanh toán còn lại
                            </div>
                            <div
                              style={{
                                fontWeight: 700,
                                fontSize: 16,
                                color: "#d32f2f",
                                marginBottom: 6,
                              }}
                            >
                              {formatTime(paymentTimers[order.id || order._id])}
                            </div>
                            <Progress
                              percent={Math.max(0, (paymentTimers[order.id || order._id] / 300) * 100)}
                              showInfo={false}
                              strokeColor="#ff4d4f"
                              size="small"
                            />
                          </div>
                        )}

                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {/* Show payment button only for non-COD orders and non-expired payments */}
                        {order.paymentMethod !== "cod" &&
                          order.paymentMethod !== "cash" &&
                          order.paymentStatus === "pending" &&
                          !paymentTimeouts[order.id || order._id] && (
                            <Button
                              type="primary"
                              style={{
                                background: "#52c41a",
                                borderColor: "#52c41a",
                                height: 45 // Make same height as Cancel button
                              }}
                              onClick={async () => {
                                try {
                                  const token = localStorage.getItem("token");
                                  const response = await fetch(
                                    "http://localhost:10000/api/payments/create",
                                    {
                                      method: "POST",
                                      headers: {
                                        "Content-Type": "application/json",
                                        ...(token && {
                                          Authorization: `Bearer ${token}`,
                                        }),
                                      },
                                      body: JSON.stringify({
                                        orderId: order.id || order._id,
                                        paymentMethod: order.paymentMethod || "online",
                                      }),
                                    }
                                  );

                                  const result = await response.json();

                                  if (result.expired) {
                                    toast({
                                      title: "Error",
                                      description: "Payment time has expired for this order.",
                                      variant: "destructive",
                                    });
                                    setPaymentTimeouts(prev => ({
                                      ...prev,
                                      [order.id || order._id]: true
                                    }));
                                    return;
                                  }

                                  if (result.data?.paymentUrl) {
                                    window.location.href = result.data.paymentUrl;
                                  } else {
                                    toast({
                                      title: "Error",
                                      description: "Cannot create payment link. Please contact support.",
                                      variant: "destructive",
                                    });
                                  }
                                } catch (error) {
                                  console.error("Payment error:", error);
                                  toast({
                                    title: "Error",
                                    description: "Payment creation failed.",
                                    variant: "destructive",
                                  });
                                }
                              }}

                            >
                              💳 Thanh toán ngay
                            </Button>
                          )}

                        {/* Show COD message for COD orders */}
                        {(order.paymentMethod === "cod" || order.paymentMethod === "cash") && (
                          <div
                            style={{
                              background: "linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 100%)",
                              padding: "12px 16px",
                              borderRadius: 8,
                              border: "1px solid #1677ff",
                              color: "#1677ff",
                              fontSize: 13,
                              fontWeight: 600,
                              textAlign: "center",
                              boxShadow: "0 2px 6px rgba(22, 119, 255, 0.1)",
                              flex: 1,
                              minWidth: 200,
                            }}
                          >
                            💵 COD - Thanh toán khi giao hàng
                          </div>
                        )}

                        {/* Show payment expired message for online/bank orders */}
                        {(order.paymentMethod === "online" || order.paymentMethod === "bank") &&
                          paymentTimeouts[order.id || order._id] && (
                            <div
                              style={{
                                background: "linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)",
                                padding: "12px 16px",
                                borderRadius: 8,
                                border: "1px solid #f44336",
                                color: "#d32f2f",
                                fontSize: 13,
                                fontWeight: 600,
                                textAlign: "center",
                                boxShadow: "0 2px 6px rgba(244, 67, 54, 0.1)",
                                flex: 1,
                                minWidth: 200,
                              }}
                            >
                              ⏰ Hết thời gian thanh toán
                            </div>
                          )}

                        <Button
                          danger
                          loading={cancellingId === (order.id || order._id)}
                          onClick={() => handleCancelOrder(order.id || order._id)}
                          style={{
                            height: 45,
                          }}
                        >
                          Cancel Order
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              ))
            )}
          </div>
        </div>
      </Card>

      {/* Cancel Order Modal */}
      <Modal
        title="Order Cancellation Reason"
        open={showCancelModal}
        onOk={confirmCancelOrder}
        onCancel={closeCancelModal}
        okText="Confirm Cancel"
        cancelText="Close"
        okButtonProps={{
          danger: true,
          loading: cancellingId === cancelOrderId,
        }}
        width={500}
      >
        <div style={{ padding: "16px 0" }}>
          <p style={{ marginBottom: 16, color: "#666" }}>
            Please select a reason for canceling order #{cancelOrderId}:
          </p>

          <Radio.Group
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            style={{ width: "100%" }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {CANCEL_REASONS.map((reason) => (
                <Radio
                  key={reason}
                  value={reason}
                  style={{ alignItems: "flex-start" }}
                >
                  <span style={{ marginLeft: 8 }}>{reason}</span>
                </Radio>
              ))}
            </div>
          </Radio.Group>

          {cancelReason === "Other reason" && (
            <div style={{ marginTop: 16 }}>
              <Input.TextArea
                placeholder="Please enter specific reason..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                rows={3}
                maxLength={200}
                showCount
              />
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};


export default MyOrders;
