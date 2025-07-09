import React, { useEffect, useState } from "react";
import { Card, Tabs, Tag, Spin } from "antd";
import { ClockCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

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

const formatVND = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    value
  );

const fetchPurchaseHistory = async () => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role") || "customer";
  if (role !== "customer") return [];
  const res = await fetch(
    "http://localhost:10000/api/customers/purchase-history",
    {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }
  );
  if (!res.ok) return [];
  return await res.json();
};

const PurchaseHistory: React.FC = () => {
  const [purchaseHistory, setPurchaseHistory] = useState<any[]>([]);
  const [orderTab, setOrderTab] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchPurchaseHistory().then((data) => {
      setPurchaseHistory(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <Spin size="large" style={{ display: "block", margin: "64px auto" }} />
    );
  }

  if (!purchaseHistory || purchaseHistory.length === 0) {
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
          <ClockCircleOutlined style={{ fontSize: 64, color: "#7494ec" }} />
        </div>
        <div
          style={{
            fontWeight: 600,
            fontSize: 22,
            marginBottom: 8,
            color: "#222",
          }}
        >
          You have no purchase history.
        </div>
        <div style={{ color: "#888", marginBottom: 24 }}>
          Start shopping to see your purchase history.
        </div>
      </div>
    );
  }

  const normalizedHistory = purchaseHistory.map((entry: any) => {
    if (entry.order && entry.items) {
      return {
        ...entry.order,
        items: entry.items,
        status: entry.order.status,
        totalAmount: entry.order.totalAmount,
        date: entry.order.orderDate || entry.order.createdAt,
        note: entry.order.note,
      };
    }
    return entry;
  });

  const normalizeStatus = (status: string | undefined) => {
    if (!status) return "pending";
    const s = status.trim().toLowerCase();
    if (s === "pending") return "pending";
    if (s === "processing") return "processing";
    if (s === "completed") return "completed";
    if (s === "cancelled" || s === "canceled") return "cancelled";
    return s;
  };

  // Hàm tính tổng tiền cho 1 đơn hàng
  const getOrderTotal = (order: any) => {
    if (order.totalAmount && order.totalAmount > 0) return order.totalAmount;
    if (order.total && order.total > 0) return order.total;
    if (Array.isArray(order.items)) {
      return order.items.reduce(
        (sum, item) =>
          sum + (item.unitPrice ?? item.price ?? 0) * (item.quantity ?? 1),
        0
      );
    }
    return 0;
  };

  const getPaymentMethodDisplay = (paymentMethod: string) => {
    switch (paymentMethod) {
      case "cod":
        return "💵 COD (Thanh toán khi nhận hàng)";
      case "online":
        return "💳 Thanh toán online";
      case "cash":
        return "💵 Tiền mặt";
      case "bank":
        return "🏦 Chuyển khoản ngân hàng";
      default:
        return "❓ Không xác định";
    }
  };

  const filteredHistory =
    orderTab === "all"
      ? normalizedHistory
      : normalizedHistory.filter((o) => normalizeStatus(o.status) === orderTab);

  // Tính tổng số tiền đã mua cho filteredHistory
  const totalSpent = filteredHistory.reduce(
    (sum, item) => sum + getOrderTotal(item),
    0
  );

  return (
    <Card
      title={
        <span className="user-profile-section-title">Purchase History</span>
      }
      className="user-profile-section-card"
      styles={{ body: { padding: 0 } }}
      style={{ maxWidth: 1000, margin: "0 auto" }}
    >
      <div className="user-profile-section-content">
        {/* Tổng số tiền đã mua */}
        <div
          style={{
            marginBottom: 12,
            textAlign: "right",
            fontWeight: 600,
            color: "#1677ff",
          }}
        >
          Total spent: {formatVND(totalSpent)}
        </div>
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
          {filteredHistory.length === 0 ? (
            <div style={{ textAlign: "center", color: "#888", marginTop: 32 }}>
              No purchase history in this status.
            </div>
          ) : (
            filteredHistory.map((item, idx) => {
              const normalizedStatus = normalizeStatus(item.status);
              return (
                <Card
                  key={item.id || idx}
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
                        Purchase
                        <span style={{ marginLeft: 8, color: "#aaa" }}>
                          #{item.id || idx + 1}
                        </span>
                      </b>
                      {item.paymentMethod && (
                        <div style={{
                          fontSize: 12,
                          color: "#666",
                          marginTop: 4,
                          padding: "2px 8px",
                          background: "#f5f5f5",
                          borderRadius: 4,
                          display: "inline-block",
                        }}>
                          {getPaymentMethodDisplay(item.paymentMethod)}
                        </div>
                      )}
                    </div>
                    <Tag
                      color={
                        ORDER_STATUS_MAP[normalizedStatus]?.color || "blue"
                      }
                    >
                      {ORDER_STATUS_MAP[normalizedStatus]?.label ||
                        "Processing"}
                    </Tag>
                  </div>
                  <div className="user-profile-order-items">
                    {(item.items || []).map((prod: any, i: number) => {
                      // Nếu sản phẩm đã bị xóa (prod.productId không còn), hiển thị thông báo
                      if (!prod.productId) {
                        return (
                          <div
                            key={i}
                            className="user-profile-order-item"
                            style={{ opacity: 0.6 }}
                          >
                            <div
                              className="user-profile-order-item-name"
                              style={{
                                fontWeight: 700,
                                fontSize: 16,
                                color: "#d32f2f",
                                background: "#fff0f0",
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
                              [Product deleted]
                            </div>
                            <div className="user-profile-order-item-price">
                              {formatVND(prod.unitPrice ?? prod.price ?? 0)} x
                              {prod.quantity ?? 1}
                            </div>
                          </div>
                        );
                      }
                      return (
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
                            {(prod.productId && prod.productId.name) ||
                              prod.name ||
                              "No product name"}
                          </div>
                          <div className="user-profile-order-item-price">
                            {formatVND(prod.unitPrice ?? prod.price ?? 0)} x
                            {prod.quantity ?? 1}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      Purchase Date:{" "}
                      {item.date
                        ? dayjs(item.date).format("DD/MM/YYYY")
                        : "---"}
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
                        {formatVND(getOrderTotal(item))}
                      </span>
                    </div>
                  </div>
                  {item.note && (
                    <div style={{ marginTop: 8, color: "#888", fontSize: 13 }}>
                      {item.note}
                    </div>
                  )}
                </Card>
              );
            })
          )}
        </div>
      </div>
    </Card>
  );
};

export default PurchaseHistory;
