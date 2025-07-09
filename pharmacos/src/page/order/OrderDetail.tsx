import React, { useEffect, useState } from "react";
import {
  Card,
  Steps,
  Tag,
  Descriptions,
  Row,
  Col,
  Divider,
  Button,
  Tooltip,
  Modal,
  List,
  Avatar,
  message,
  Progress,
} from "antd";
import {
  HomeOutlined,
  UserOutlined,
  ShopOutlined,
  CreditCardOutlined,
  CopyOutlined,
  CarOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";

const ORDER_STATUS_MAP = {
  pending: { label: "Pending", color: "orange" },
  processing: { label: "Processing", color: "blue" },
  completed: { label: "Completed", color: "green" },
  cancelled: { label: "Cancelled", color: "red" },
};

const ORDER_STEPS = [
  { key: "pending", title: "Pending" },
  { key: "processing", title: "Processing" },
  { key: "completed", title: "Completed" },
  { key: "cancelled", title: "Cancelled" },
];

const formatVND = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    value
  );

const getOrderTotal = (items = []) => {
  return items.reduce(
    (sum, item) =>
      sum + (item.unitPrice ?? item.price ?? 0) * (item.quantity ?? 1),
    0
  );
};

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paymentTimeLeft, setPaymentTimeLeft] = useState<number>(0);
  const [paymentExpired, setPaymentExpired] = useState(false);
  const navigate = useNavigate();
  const { setCartItems } = useCart();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    const token = localStorage.getItem("token");
    fetch(`http://localhost:10000/api/orders/${id}`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.order) {
          setOrder({ ...data.order, items: data.items });

          // Check payment status for online orders
          if (
            (data.order.paymentMethod === "online" ||
              data.order.paymentMethod === "bank") &&
            data.order.paymentStatus === "pending"
          ) {
            checkPaymentStatus(id);
          }
        } else {
          setOrder(null);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const checkPaymentStatus = async (orderId: string) => {
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
          setPaymentTimeLeft(result.data.timeLeft || 0);
          setPaymentExpired(result.data.paymentExpired || false);

          // Start countdown if payment is still active
          if (
            result.data.hasActivePayment &&
            result.data.timeLeft > 0 &&
            !paymentExpired
          ) {
            startCountdown(result.data.timeLeft);
          }
        }
      }
    } catch (error) {
      console.error("Error checking payment status:", error);
    }
  };

  const startCountdown = (initialTime: number) => {
    let timeLeft = initialTime;
    const timer = setInterval(() => {
      timeLeft -= 1;
      setPaymentTimeLeft(timeLeft);

      if (timeLeft <= 0) {
        clearInterval(timer);
        setPaymentExpired(true);
        message.warning("Payment time has expired!");
      }
    }, 1000);

    return () => clearInterval(timer);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: 100 }}>
        <span>Loading order details...</span>
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ textAlign: "center", marginTop: 100 }}>
        <span>Order not found.</span>
      </div>
    );
  }

  const status = order.status?.toLowerCase() || "pending";

  // Sửa lại hàm reorderFromOrderDetail để cập nhật context
  const reorderFromOrderDetail = async (orderItems: any[], navigate: any) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Chưa đăng nhập");

      // Lấy lại toàn bộ cart và xóa từng item (vì không có API DELETE /cart/items)
      const cartData = await apiFetch("http://localhost:10000/api/cart", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const cartItems = cartData.items || [];
      await Promise.all(
        cartItems.map((item: any) =>
          apiFetch(`http://localhost:10000/api/cart/items/${item._id}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
        )
      );

      // Lấy thông tin sản phẩm
      const res = await fetch("http://localhost:10000/api/products");
      const data = await res.json();
      const products = data.products || [];

      const addedItems: any[] = [];

      for (const item of orderItems) {
        const productId = item.productId?._id || item.productId || item.id;
        const product = products.find((p: any) => p._id === productId);

        const newItem = {
          productId,
          name:
            product?.name || item.productId?.name || item.name || "Sản phẩm",
          image:
            product?.images?.[0]?.url ||
            item.productId?.images?.[0]?.url ||
            item.image ||
            "https://via.placeholder.com/80x80?text=No+Image",
          price: product?.price || item.unitPrice || item.price || 0,
          quantity: item.quantity || 1,
        };

        // Gọi API thêm vào cart từng item
        const response = await apiFetch(
          "http://localhost:10000/api/cart/items",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              productId: newItem.productId,
              quantity: newItem.quantity,
            }),
          }
        );

        addedItems.push({
          id: response.item._id,
          productId: newItem.productId,
          name: newItem.name,
          price: newItem.price,
          image: newItem.image,
          quantity: newItem.quantity,
        });
      }

      setCartItems(addedItems);
      // Đồng bộ lại localStorage để giữ cart khi reload trang
      localStorage.setItem("cart", JSON.stringify(addedItems));
      message.success("Đã thêm lại sản phẩm vào giỏ hàng");
      navigate("/cart");
    } catch (error) {
      console.error("Reorder error:", error);
      message.error("Không thể mua lại đơn hàng.");
    }
  };
  const apiFetch = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem("token");
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  };

  return (
    <div
      style={{
        maxWidth: 1100,
        margin: "32px auto",
        background: "linear-gradient(135deg, #f7f9fb 60%, #e3f0ff 100%)",
        padding: 32,
        borderRadius: 24,
        boxShadow: "0 4px 24px 0 rgba(60,120,200,0.07)",
        minHeight: 700,
      }}
    >
      <div
        style={{
          marginBottom: 24,
          color: "#3b5b7c",
          fontSize: 15,
          fontWeight: 500,
        }}
      >
        <a href="/" style={{ color: "#1677ff" }}>
          Home
        </a>{" "}
        /
        <a href="/profile" style={{ color: "#1677ff", marginLeft: 4 }}>
          Profile
        </a>{" "}
        /
        <a
          href="/profile/don-hang-cua-toi"
          style={{ color: "#1677ff", marginLeft: 4 }}
        >
          My Orders
        </a>{" "}
        / <b style={{ color: "#1a237e" }}>Order Details</b>
      </div>
      <Row gutter={[32, 24]}>
        <Col xs={24} md={16}>
          <Card
            style={{
              borderRadius: 18,
              marginBottom: 24,
              border: "none",
              boxShadow: "0 2px 12px 0 rgba(60,120,200,0.06)",
              background: "#fff",
            }}
            styles={{ body: { padding: 28, paddingBottom: 18 } }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 12,
              }}
            >
              <span
                style={{
                  fontWeight: 700,
                  fontSize: 20,
                  color: "#1a237e",
                }}
              >
                Order {dayjs(order.orderDate).format("DD/MM/YYYY")}
              </span>
              <Tag
                color="#e3f0ff"
                style={{
                  color: "#1976d2",
                  fontWeight: 500,
                  marginLeft: 8,
                  borderRadius: 8,
                }}
              >
                Home delivery
              </Tag>
              <span style={{ color: "#888", marginLeft: 8, fontSize: 15 }}>
                #{order.id}
              </span>
              <Tooltip title="Copy order ID">
                <CopyOutlined
                  style={{
                    marginLeft: 4,
                    color: "#1677ff",
                    cursor: "pointer",
                  }}
                  onClick={() => navigator.clipboard.writeText(order.id)}
                />
              </Tooltip>
              <Tag
                color={ORDER_STATUS_MAP[status]?.color || "orange"}
                style={{
                  marginLeft: "auto",
                  fontWeight: 600,
                  fontSize: 15,
                  borderRadius: 8,
                }}
              >
                {ORDER_STATUS_MAP[status]?.label || status}
              </Tag>
            </div>

            {/* Chỉ hiển thị Estimated delivery nếu không bị hủy */}
            {status !== "cancelled" && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: 20,
                  background: "#f5faff",
                  borderRadius: 10,
                  padding: 16,
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: 16,
                      marginBottom: 4,
                      color: "#1976d2",
                    }}
                  >
                    Estimated delivery
                  </div>
                  <div style={{ fontSize: 15, marginBottom: 2 }}>
                    From <b>11:00 - 12:00</b> on{" "}
                    {dayjs(order.orderDate).format("DD/MM/YYYY")}
                  </div>
                  <div style={{ color: "#888", fontSize: 14 }}>
                    Your order is being processed at <b>PharmaCos</b>.
                  </div>
                </div>
              </div>
            )}
            {/* Thêm thông báo nếu đơn hàng bị hủy */}
            {status === "cancelled" && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: 20,
                  background: "#f5faff",
                  borderRadius: 10,
                  padding: 16,
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, marginBottom: 2 }}>
                    Order cancelled at{" "}
                    {dayjs(order.updatedAt || order.orderDate).format("HH:mm")}{" "}
                    on{" "}
                    {dayjs(order.updatedAt || order.orderDate).format(
                      "DD/MM/YYYY"
                    )}
                  </div>
                  {order.cancelReason && (
                    <div
                      style={{
                        color: "#d32f2f",
                        fontSize: 14,
                        fontWeight: 500,
                        marginTop: 8,
                      }}
                    >
                      Reason: {order.cancelReason}
                    </div>
                  )}
                  <div style={{ color: "#888", fontSize: 14, marginTop: 4 }}>
                    We hope to serve you again next time.
                  </div>
                </div>
              </div>
            )}
            <Divider style={{ margin: "18px 0" }} />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <CarOutlined
                style={{ fontSize: 22, color: "#ff9800", marginRight: 10 }}
              />
              <span style={{ fontWeight: 500, color: "#1a237e" }}>
                Order delivered by <b>AHAMOVE</b>
              </span>
            </div>
            <Divider style={{ margin: "18px 0" }} />
            <Row gutter={[16, 16]}>
              <Col xs={24} md={8}>
                <Descriptions
                  column={1}
                  size="small"
                  title={
                    <span style={{ color: "#1976d2" }}>
                      <UserOutlined /> Recipient info
                    </span>
                  }
                  styles={{ content: { fontWeight: 500, fontSize: 15 } }}
                >
                  <Descriptions.Item label="">
                    {order.recipientName}
                  </Descriptions.Item>
                  <Descriptions.Item label="">{order.phone}</Descriptions.Item>
                </Descriptions>
              </Col>
              <Col xs={24} md={8}>
                <Descriptions
                  column={1}
                  size="small"
                  title={
                    <span style={{ color: "#1976d2" }}>
                      <HomeOutlined /> Delivery address
                    </span>
                  }
                  styles={{ content: { fontWeight: 500, fontSize: 15 } }}
                >
                  <Descriptions.Item label="">
                    {order.shippingAddress}
                  </Descriptions.Item>
                </Descriptions>
              </Col>
              <Col xs={24} md={8}>
                <Descriptions
                  column={1}
                  size="small"
                  title={
                    <span style={{ color: "#1976d2" }}>
                      <ShopOutlined /> Pharmacy
                    </span>
                  }
                  styles={{ content: { fontWeight: 500, fontSize: 15 } }}
                >
                  <div>PharmaCos</div>
                </Descriptions>
              </Col>
            </Row>
            <Divider style={{ margin: "18px 0" }} />
            <div
              style={{
                fontWeight: 700,
                fontSize: 17,
                marginBottom: 12,
                color: "#1a237e",
              }}
            >
              Product list
            </div>
            {(order.items || []).map((item: any, idx: number) => (
              <Card
                key={item._id || idx}
                style={{
                  marginBottom: 18,
                  borderRadius: 16,
                  background: "#f7fbff",
                  border: "1.5px solid #b3d1fa",
                  boxShadow: "0 2px 8px 0 rgba(60,120,200,0.07)",
                  transition: "box-shadow 0.2s, border 0.2s",
                  cursor: "pointer",
                }}
                styles={{ body: { padding: 18 } }}
                hoverable
              >
                <Row align="middle" gutter={[16, 8]}>
                  <Col
                    xs={6}
                    md={3}
                    style={{ display: "flex", justifyContent: "center" }}
                  >
                    <img
                      src={
                        item.productId?.images?.length
                          ? item.productId.images.find(
                            (img: any) => img.isPrimary
                          )?.url || item.productId.images[0].url
                          : "https://via.placeholder.com/80x80?text=No+Image"
                      }
                      alt={item.productId?.name}
                      style={{
                        width: 80,
                        height: 80,
                        objectFit: "cover",
                        borderRadius: 12,
                        border: "2px solid #e3eaf2",
                        background: "#fff",
                        boxShadow: "0 1px 6px 0 rgba(60,120,200,0.06)",
                      }}
                    />
                  </Col>
                  <Col xs={18} md={21}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        flexWrap: "wrap",
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 180 }}>
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: 16,
                            color: "#1976d2",
                            marginBottom: 2,
                          }}
                        >
                          {item.productId?.name}
                        </div>
                        <div
                          style={{
                            color: "#888",
                            fontSize: 13,
                            marginBottom: 6,
                            maxWidth: 350,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {item.productId?.description || ""}
                        </div>
                      </div>
                      <div style={{ textAlign: "right", minWidth: 120 }}>
                        <span
                          style={{
                            color: "#1677ff",
                            fontWeight: 800,
                            fontSize: 18,
                          }}
                        >
                          {formatVND(item.unitPrice ?? item.price ?? 0)}
                        </span>
                        <span
                          style={{
                            color: "#fff",
                            background: "#1976d2",
                            borderRadius: 8,
                            padding: "2px 12px",
                            fontWeight: 600,
                            fontSize: 15,
                            marginLeft: 14,
                            display: "inline-block",
                            minWidth: 36,
                            textAlign: "center",
                          }}
                        >
                          x{item.quantity ?? 1}
                        </span>
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card>
            ))}
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card
            title={
              <span style={{ color: "#1976d2", fontWeight: 700, fontSize: 18 }}>
                Payment Information
              </span>
            }
            style={{
              borderRadius: 18,
              marginBottom: 16,
              border: "none",
              background: "#fff",
              boxShadow: "0 2px 12px 0 rgba(60,120,200,0.06)",
            }}
            styles={{ body: { padding: 24 } }}
          >
            {/* Payment Timer for Online Orders */}
            {(order.paymentMethod === "online" ||
              order.paymentMethod === "bank") &&
              order.paymentStatus === "pending" &&
              !paymentExpired &&
              paymentTimeLeft > 0 && (
                <div
                  style={{
                    background:
                      "linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)",
                    padding: "16px",
                    borderRadius: 12,
                    marginBottom: 16,
                    border: "1px solid #ffc107",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: 14,
                      color: "#856404",
                      marginBottom: 8,
                    }}
                  >
                    ⏰ Thời gian thanh toán còn lại
                  </div>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 20,
                      color: "#d32f2f",
                      marginBottom: 8,
                    }}
                  >
                    {formatTime(paymentTimeLeft)}
                  </div>
                  <Progress
                    percent={Math.max(0, (paymentTimeLeft / 300) * 100)}
                    showInfo={false}
                    strokeColor="#ff4d4f"
                    size="small"
                  />
                </div>
              )}

            {/* Payment Status Banner */}
            <div
              style={{
                background:
                  order.paymentStatus === "success"
                    ? "linear-gradient(90deg, #d4edda 0%, #c3e6cb 100%)"
                    : "linear-gradient(90deg, #fff3cd 0%, #ffeaa7 100%)",
                padding: "12px 16px",
                borderRadius: 12,
                marginBottom: 16,
                border:
                  order.paymentStatus === "success"
                    ? "1px solid #28a745"
                    : "1px solid #ffc107",
                textAlign: "center",
              }}
            >
              <span
                style={{
                  fontWeight: 600,
                  fontSize: 16,
                  color:
                    order.paymentStatus === "success" ? "#155724" : "#856404",
                }}
              >
                {order.paymentStatus === "success"
                  ? "✅ Đã thanh toán"
                  : "⏳ Chưa thanh toán"}
              </span>
              <div
                style={{
                  fontSize: 14,
                  color:
                    order.paymentStatus === "success" ? "#155724" : "#856404",
                  marginTop: 4,
                  fontWeight: 500,
                }}
              >
                Phương thức:{" "}
                {order.paymentMethod === "cash"
                  ? "Tiền mặt"
                  : order.paymentMethod === "bank"
                    ? "Chuyển khoản"
                    : order.paymentMethod === "online"
                      ? "Thanh toán online"
                      : "Thanh toán khi giao hàng"}
              </div>
              {order.paymentStatus === "pending" && (
                <div
                  style={{
                    fontSize: 13,
                    color: "#856404",
                    marginTop: 4,
                  }}
                >
                  {order.paymentMethod === "cash"
                    ? "Vui lòng chuẩn bị tiền mặt khi giao hàng"
                    : "Vui lòng thanh toán để hoàn tất đơn hàng"}
                </div>
              )}
            </div>

            <Descriptions
              column={1}
              size="small"
              styles={{ label: { fontWeight: 600, color: "#1a237e" } }}
            >
              <Descriptions.Item label="Total">
                <span style={{ fontWeight: 600 }}>
                  {formatVND(getOrderTotal(order.items))}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Direct discount">
                <span style={{ color: "#ff9800", fontWeight: 600 }}>0đ</span>
              </Descriptions.Item>
              <Descriptions.Item label="Voucher discount">
                <Tooltip title="Applied when you have a voucher code">
                  <span style={{ color: "#ff9800", fontWeight: 600 }}>0đ</span>
                </Tooltip>
              </Descriptions.Item>
              <Descriptions.Item label="Shipping fee">
                <span style={{ color: "#1976d2", fontWeight: 500 }}>
                  1.000đ
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Grand total">
                <span
                  style={{ color: "#1677ff", fontWeight: 800, fontSize: 22 }}
                >
                  {formatVND(getOrderTotal(order.items) + 1000)}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Payment method">
                <CreditCardOutlined
                  style={{ color: "#1677ff", marginRight: 6 }}
                />
                <span style={{ fontWeight: 500 }}>
                  {order.paymentMethod === "cash"
                    ? "Tiền mặt (Cash on delivery)"
                    : order.paymentMethod === "cod"
                      ? "COD (Cash on delivery)"
                      : order.paymentMethod === "bank"
                        ? "Chuyển khoản ngân hàng"
                        : order.paymentMethod === "online"
                          ? "Thanh toán online"
                          : "Thanh toán khi giao hàng"}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Payment status">
                <Tag
                  color={order.paymentStatus === "success" ? "green" : "orange"}
                  style={{ fontWeight: 600 }}
                >
                  {order.paymentStatus === "success" ? "Paid" : "Pending"}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            <div style={{ textAlign: "center", marginTop: 24 }}>
              {order.paymentStatus === "pending" &&
                order.status !== "cancelled" ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    alignItems: "center",
                  }}
                >
                  {/* Only show payment button for non-COD orders and non-expired payments */}
                  {order.paymentMethod !== "cash" &&
                    order.paymentMethod !== "cod" &&
                    !paymentExpired &&
                    paymentTimeLeft > 0 &&
                    !(order.paymentMethod === "online" || order.paymentMethod === "bank") ||
                    ((order.paymentMethod === "online" || order.paymentMethod === "bank") &&
                      !paymentExpired && paymentTimeLeft > 0) && (
                      <Button
                        type="primary"
                        icon={<CreditCardOutlined />}
                        style={{
                          borderRadius: 24,
                          padding: "0 32px",
                          fontWeight: 600,
                          fontSize: 16,
                          height: 44,
                          background:
                            "linear-gradient(90deg, #52c41a 0%, #73d13d 100%)",
                          border: "none",
                          boxShadow: "0 2px 8px 0 rgba(82, 196, 26, 0.3)",
                          width: 200,
                        }}
                        onClick={async () => {
                          try {
                            // Direct fetch to handle pending payment properly
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
                                  orderId: order.id,
                                  paymentMethod: order.paymentMethod || "bank",
                                }),
                              }
                            );

                            const result = await response.json();

                            if (result.expired) {
                              message.error("Thời gian thanh toán đã hết hạn!");
                              setPaymentExpired(true);
                              return;
                            }

                            // If has paymentUrl (even with error for pending payment), redirect
                            if (result.data?.paymentUrl) {
                              window.location.href = result.data.paymentUrl;
                            } else {
                              message.error(
                                "Không thể tạo link thanh toán. Vui lòng liên hệ hỗ trợ."
                              );
                            }
                          } catch (error) {
                            console.error("Payment error:", error);
                            message.error("Có lỗi xảy ra khi tạo thanh toán.");
                          }
                        }}
                      >
                        💳 Thanh toán ngay
                      </Button>
                    )}

                  {/* Show COD message for COD/cash orders */}
                  {(order.paymentMethod === "cash" || order.paymentMethod === "cod") && (
                    <div
                      style={{
                        background: "linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 100%)",
                        padding: "16px 24px",
                        borderRadius: 16,
                        border: "2px solid #1677ff",
                        color: "#1677ff",
                        fontWeight: 600,
                        fontSize: 16,
                        textAlign: "center",
                        width: 300,
                        boxShadow: "0 4px 12px rgba(22, 119, 255, 0.15)",
                      }}
                    >
                      💵 Bạn sẽ thanh toán bằng tiền mặt khi nhận hàng
                    </div>
                  )}

                  {/* Payment Expired Message */}
                  {(order.paymentMethod === "online" ||
                    order.paymentMethod === "bank") &&
                    (paymentExpired || (order.paymentStatus === "pending" && paymentTimeLeft <= 0)) && (
                      <div
                        style={{
                          background:
                            "linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)",
                          padding: "16px",
                          borderRadius: 12,
                          marginBottom: 16,
                          border: "1px solid #f44336",
                          textAlign: "center",
                        }}
                      >
                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: 16,
                            color: "#d32f2f",
                          }}
                        >
                          ⏰ Đã hết thời gian thanh toán
                        </div>
                        <div
                          style={{
                            fontSize: 14,
                            color: "#d32f2f",
                            marginTop: 4,
                          }}
                        >
                          Đơn hàng này không thể thanh toán online nữa
                        </div>
                      </div>
                    )}

                  <Button
                    icon={<ShoppingCartOutlined />}
                    style={{
                      borderRadius: 24,
                      padding: "0 32px",
                      fontWeight: 600,
                      fontSize: 16,
                      height: 44,
                      background:
                        "linear-gradient(90deg, rgb(31, 14, 189) 100%)",
                      border: "none",
                      boxShadow: "0 2px 8px 0 rgba(60,120,200,0.10)",
                      color: "white",
                      width: 200,
                    }}
                    onClick={() =>
                      reorderFromOrderDetail(order.items, navigate)
                    }
                  >
                    Mua lại
                  </Button>
                </div>
              ) : (
                <Button
                  type="primary"
                  icon={<ShoppingCartOutlined />}
                  style={{
                    borderRadius: 24,
                    padding: "0 32px",
                    fontWeight: 600,
                    fontSize: 16,
                    height: 44,
                    background: "linear-gradient(90deg, rgb(31, 14, 189) 100%)",
                    border: "none",
                    boxShadow: "0 2px 8px 0 rgba(60,120,200,0.10)",
                    width: 200,
                  }}
                  onClick={() => reorderFromOrderDetail(order.items, navigate)}
                >
                  🛒 Reorder
                </Button>
              )}
            </div>
          </Card>
        </Col>
      </Row>
      <div style={{ textAlign: "center", marginTop: 32 }}>
        <Button
          type="primary"
          onClick={() => window.history.back()}
          style={{
            borderRadius: 24,
            padding: "0 40px",
            fontWeight: 600,
            fontSize: 16,
            height: 44,
            background: "linear-gradient(90deg,rgb(31, 14, 189) 100%)",
            border: "none",
            boxShadow: "0 2px 8px 0 rgba(60,120,200,0.10)",
          }}
        >
          Back
        </Button>
      </div>
    </div>
  );
};

export default OrderDetail;
