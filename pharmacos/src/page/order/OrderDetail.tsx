import React, { useEffect, useState } from "react";
import { Card, Steps, Tag, Descriptions, Spin, Row, Col, Divider, Button } from "antd";
import { HomeOutlined, UserOutlined, ShopOutlined, CreditCardOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const ORDER_STATUS_MAP: Record<string, { label: string; color: string }> = {
    pending: { label: "Đang xử lý", color: "orange" },
    processing: { label: "Đang xử lý", color: "blue" },
    delivering: { label: "Đang giao", color: "cyan" },
    completed: { label: "Đã nhận hàng", color: "green" },
    cancelled: { label: "Đã hủy", color: "red" },
};

const ORDER_STEPS = [
    { key: "pending", title: "Đặt hàng" },
    { key: "processing", title: "Xử lý đơn" },
    { key: "delivering", title: "Đang giao" },
    { key: "completed", title: "Nhận hàng" },
];

function getStepIndex(status: string) {
    const s = status?.toLowerCase();
    if (s === "pending") return 0;
    if (s === "processing") return 1;
    if (s === "delivering") return 2;
    if (s === "completed") return 3;
    return 0;
}

const fetchOrderDetail = async (orderId: string) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`http://localhost:10000/api/orders/${orderId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": token ? `Bearer ${token}` : "",
        },
    });
    if (res.status === 403) {
        throw new Error("Bạn không có quyền xem đơn hàng này (403 Forbidden)");
    }
    if (!res.ok) throw new Error("Không lấy được chi tiết đơn hàng");
    return await res.json();
};

const OrderDetail: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [order, setOrder] = useState<any>(null);

    const orderId = window.location.pathname.split("/").pop();

    useEffect(() => {
        setLoading(true);
        fetchOrderDetail(orderId as string)
            .then((data) => {
                setOrder(data.order ? { ...data.order, items: data.items } : data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [orderId]);

    if (loading || !order) {
        return (
            <div style={{ textAlign: "center", marginTop: 80 }}>
                <Spin size="large" />
            </div>
        );
    }

    const status = order.status?.toLowerCase() || "pending";
    const stepIndex = getStepIndex(status);

    return (
        <div style={{ maxWidth: 1100, margin: "32px auto", background: "#f7f9fb", padding: 24, borderRadius: 12 }}>
            <div style={{ marginBottom: 16, color: "#888" }}>
                <a href="/">Trang chủ</a> / <a href="/profile">Cá nhân</a> / <a href="/profile?tab=donhang">Đơn hàng của tôi</a> / <b>Chi tiết đơn hàng</b>
            </div>
            <Card style={{ marginBottom: 24, borderRadius: 12 }}>
                <Row gutter={24}>
                    <Col xs={24} md={16}>
                        <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 8 }}>
                            Đơn hàng {order.orderDate ? dayjs(order.orderDate).format("DD/MM/YYYY") : ""}
                            <Tag color={ORDER_STATUS_MAP[status]?.color || "orange"} style={{ marginLeft: 12 }}>
                                {ORDER_STATUS_MAP[status]?.label || status}
                            </Tag>
                        </div>
                        <div style={{ marginBottom: 16, color: "#888" }}>
                            Giao hàng tận nơi &nbsp; <span style={{ color: "#1677ff" }}>#{order.id || order._id}</span>
                        </div>
                        <Steps
                            current={stepIndex}
                            items={ORDER_STEPS.map((step, idx) => ({
                                title: step.title,
                                status: idx < stepIndex ? "finish" : idx === stepIndex ? "process" : "wait",
                            }))}
                            style={{ marginBottom: 24, maxWidth: 600 }}
                        />
                        <div style={{ marginBottom: 16 }}>
                            <b>Dự kiến nhận hàng</b>
                            <div style={{ marginTop: 4 }}>
                                Từ 11:00 - 12:00 ngày {order.orderDate ? dayjs(order.orderDate).format("DD/MM/YYYY") : ""}
                            </div>
                            <div style={{ color: "#888", marginTop: 4 }}>
                                Đơn hàng đang được xử lý tại nhà thuốc {order.pharmacyName || "LC HCM 252 Man Thiện"}.
                            </div>
                        </div>
                        <Divider />
                        <div style={{ marginBottom: 12 }}>
                            <b>Đơn hàng được vận chuyển bởi AHAMOVE</b>
                        </div>
                        <Divider />
                        <Row gutter={16}>
                            <Col xs={24} md={8}>
                                <Descriptions column={1} size="small" title={<span><UserOutlined /> Thông tin người nhận</span>}>
                                    <Descriptions.Item label="">{order.customerName || "dat nguyen"}</Descriptions.Item>
                                    <Descriptions.Item label="">{order.customerPhone || "0981 657 907"}</Descriptions.Item>
                                </Descriptions>
                            </Col>
                            <Col xs={24} md={8}>
                                <Descriptions column={1} size="small" title={<span><HomeOutlined /> Nhận hàng tại</span>}>
                                    <Descriptions.Item label="">
                                        {order.shippingAddress || "ho chi minh city, Phường Tân Phú, Thành phố Thủ Đức, Hồ Chí Minh"}
                                    </Descriptions.Item>
                                </Descriptions>
                            </Col>
                            <Col xs={24} md={8}>
                                <Descriptions column={1} size="small" title={<span><ShopOutlined /> Nhà thuốc xử lý đơn</span>}>
                                    <Descriptions.Item label="">
                                        {order.pharmacyName || "Nhà thuốc Long Châu 252 Man Thiện, P. Tăng Nhơn Phú A, TP. Thủ Đức, TP. Hồ Chí Minh"}
                                    </Descriptions.Item>
                                </Descriptions>
                            </Col>
                        </Row>
                        <Divider />
                        <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 8 }}>Danh sách sản phẩm</div>
                        {(order.items || []).map((item: any, idx: number) => (
                            <Card key={item._id || idx} style={{ marginBottom: 12, borderRadius: 8 }}>
                                <Row align="middle">
                                    <Col xs={4} md={2}>
                                        <img
                                            src={item.productId?.image || "https://via.placeholder.com/60x60?text=No+Image"}
                                            alt={item.productId?.name}
                                            style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 8 }}
                                        />
                                    </Col>
                                    <Col xs={20} md={22}>
                                        <div style={{ fontWeight: 500 }}>{item.productId?.name || item.name}</div>
                                        <div style={{ color: "#888", fontSize: 13, margin: "4px 0" }}>
                                            {item.productId?.description || ""}
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                                            <span style={{ color: "#1677ff", fontWeight: 600, fontSize: 16 }}>
                                                {(item.unitPrice ?? item.price ?? 0).toLocaleString()}₫
                                            </span>
                                            <span style={{ color: "#888" }}>x{item.quantity ?? 1} {item.unit || "Hộp"}</span>
                                        </div>
                                    </Col>
                                </Row>
                            </Card>
                        ))}
                    </Col>
                    <Col xs={24} md={8}>
                        <Card
                            title="Thông tin thanh toán"
                            style={{ borderRadius: 12, marginBottom: 16 }}
                            bodyStyle={{ padding: 16 }}
                        >
                            <Descriptions column={1} size="small">
                                <Descriptions.Item label="Tổng tiền">
                                    {(order.totalAmount ?? 0).toLocaleString()}đ
                                </Descriptions.Item>
                                <Descriptions.Item label="Giảm giá trực tiếp">0đ</Descriptions.Item>
                                <Descriptions.Item label="Giảm giá voucher">0đ</Descriptions.Item>
                                <Descriptions.Item label="Phí vận chuyển">25.000đ</Descriptions.Item>
                                <Descriptions.Item label="Thành tiền">
                                    <span style={{ color: "#1677ff", fontWeight: 600, fontSize: 18 }}>
                                        {(order.totalAmount ?? 0 + 25000).toLocaleString()}đ
                                    </span>
                                </Descriptions.Item>
                                <Descriptions.Item label="Phương thức thanh toán">
                                    <CreditCardOutlined /> Thanh toán tiền mặt khi nhận hàng
                                </Descriptions.Item>
                            </Descriptions>
                        </Card>
                    </Col>
                </Row>
            </Card>
            <Button type="primary" onClick={() => window.history.back()}>Quay lại</Button>
        </div>
    );
};

export default OrderDetail;
