import React, { useEffect, useState } from "react";
import { Card, Button, Tabs, Tag, Spin } from "antd";
import { GiftOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { orderApi } from "@/lib/api";

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

  useEffect(() => {
    setLoading(true);
    fetchOrders().then((data) => {
      setOrders(data);
      setLoading(false);
    });
  }, []);

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
    setCancellingId(orderId);
    try {
      const token = localStorage.getItem("token");
      await fetch(`http://localhost:10000/api/orders/${orderId}/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      // Refresh orders
      setOrders(await fetchOrders());
    } catch (e) {
      alert("Hủy đơn hàng thất bại!");
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <Card
      title={<span className="user-profile-section-title">My Orders</span>}
      className="user-profile-section-card"
      bodyStyle={{ padding: 0 }}
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
            <div style={{ textAlign: "center", color: "#888", marginTop: 32 }}>
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
                bodyStyle={{ padding: 16 }}
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
                  </div>
                  <Tag
                    color={
                      ORDER_STATUS_MAP[normalizeStatus(order.status)]?.color ||
                      "orange"
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
                  <Button
                    danger
                    loading={cancellingId === (order.id || order._id)}
                    onClick={() => handleCancelOrder(order.id || order._id)}
                    style={{ marginTop: 8 }}
                  >
                    Hủy đơn hàng
                  </Button>
                )}
              </Card>
            ))
          )}
        </div>
      </div>
    </Card>
  );
};

export default MyOrders;
