import React from "react";
import { Card, Steps, Tag, Descriptions, Row, Col, Divider, Button, Tooltip } from "antd";
import { HomeOutlined, UserOutlined, ShopOutlined, CreditCardOutlined, CopyOutlined, CarOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useParams } from "react-router-dom";

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
    if (s === "cancelled" || s === "canceled") return 2;
    if (s === "completed") return 3;
    return 0;
}

// Dữ liệu cứng cho đơn hàng
const hardcodedOrder = {
    id: "5233580",
    orderDate: "2025-06-13T10:27:00Z",
    status: "processing",
    pharmacyName: "Nhà thuốc Long Châu 252 Man Thiện, P. Tăng Nhơn Phú A, TP. Thủ Đức, TP. Hồ Chí Minh",
    shippingAddress: "ho chi minh city, Phường Tân Phú, Thành phố Thủ Đức, Hồ Chí Minh",
    customerName: "dat nguyen",
    customerPhone: "0981 657 907",
    totalAmount: 30000,
    note: "",
    items: [
        {
            _id: "item1",
            productId: {
                name: "Xịt mũi muối biển Nano Sea Plus 75ml Phương Y Nam làm sạch, vệ sinh mũi, loại bỏ chất nhầy",
                image: "https://cdn.nhathuoclongchau.com.vn/unsafe/240x240/filters:quality(90)/https://cms-prod.s3-sgn09.fptcloud.com/xit-mui-nano-sea-plus-75ml-1-1-1679974123.png",
                description: "",
            },
            unitPrice: 30000,
            quantity: 1,
            unit: "Hộp",
        },
    ],
};

const OrderDetail: React.FC = () => {
    const { id } = useParams();
    const order = hardcodedOrder;
    const status = order.status?.toLowerCase() || "pending";
    const stepIndex = getStepIndex(status);

    return (
        <div style={{ maxWidth: 1200, margin: "32px auto", background: "#f7f9fb", padding: 32, borderRadius: 16 }}>
            <div style={{ marginBottom: 16, color: "#3b5b7c", fontSize: 15 }}>
                <a href="/" style={{ color: "#1677ff" }}>Trang chủ</a> /
                <a href="/profile" style={{ color: "#1677ff" }}>Cá nhân</a> /
                <a href="/profile/don-hang-cua-toi" style={{ color: "#1677ff" }}>Đơn hàng của tôi</a> / <b>Chi tiết đơn hàng</b>
            </div>
            <Row gutter={32}>
                <Col xs={24} md={16}>
                    <Card style={{ borderRadius: 12, marginBottom: 24, border: "none" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                            <span style={{ fontWeight: 600, fontSize: 18 }}>
                                Đơn hàng {dayjs(order.orderDate).format("DD/MM/YYYY")}
                            </span>
                            <span style={{ color: "#1677ff", fontWeight: 500, marginLeft: 8 }}>
                                Giao hàng tận nơi
                            </span>
                            <span style={{ color: "#888", marginLeft: 8 }}>#{order.id}</span>
                            <Tooltip title="Sao chép mã đơn hàng">
                                <CopyOutlined
                                    style={{ marginLeft: 4, color: "#1677ff", cursor: "pointer" }}
                                    onClick={() => navigator.clipboard.writeText(order.id)}
                                />
                            </Tooltip>
                            <Tag color={ORDER_STATUS_MAP[status]?.color || "orange"} style={{ marginLeft: "auto", fontWeight: 600 }}>
                                {ORDER_STATUS_MAP[status]?.label || status}
                            </Tag>
                        </div>
                        <Steps
                            current={stepIndex}
                            items={ORDER_STEPS.map((step, idx) => ({
                                title: (
                                    <span>
                                        {step.title}
                                        <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
                                            {idx <= stepIndex ? dayjs(order.orderDate).format("HH:mm, DD/MM/YYYY") : ""}
                                        </div>
                                    </span>
                                ),
                                status: idx < stepIndex ? "finish" : idx === stepIndex ? "process" : "wait",
                            }))}
                            style={{ marginBottom: 24, marginTop: 8 }}
                        />
                        <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>
                                    <span style={{ color: "#1677ff" }}>Dự kiến nhận hàng</span>
                                </div>
                                <div style={{ fontSize: 15, marginBottom: 2 }}>
                                    Từ 11:00 - 12:00 ngày {dayjs(order.orderDate).format("DD/MM/YYYY")}
                                </div>
                                <div style={{ color: "#888", fontSize: 14 }}>
                                    Đơn hàng đang được xử lý tại nhà thuốc LC HCM 252 Man Thiện.
                                </div>
                            </div>
                        </div>
                        <Divider style={{ margin: "16px 0" }} />
                        <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
                            <CarOutlined style={{ fontSize: 22, color: "#ff9800", marginRight: 8 }} />
                            <span style={{ fontWeight: 500 }}>Đơn hàng được vận chuyển bởi AHAMOVE</span>
                        </div>
                        <Divider style={{ margin: "16px 0" }} />
                        <Row gutter={16}>
                            <Col xs={24} md={8}>
                                <Descriptions column={1} size="small" title={<span><UserOutlined /> Thông tin người nhận</span>}>
                                    <Descriptions.Item label="">{order.customerName}</Descriptions.Item>
                                    <Descriptions.Item label="">{order.customerPhone}</Descriptions.Item>
                                </Descriptions>
                            </Col>
                            <Col xs={24} md={8}>
                                <Descriptions column={1} size="small" title={<span><HomeOutlined /> Nhận hàng tại</span>}>
                                    <Descriptions.Item label="">
                                        {order.shippingAddress}
                                    </Descriptions.Item>
                                </Descriptions>
                            </Col>
                            <Col xs={24} md={8}>
                                <Descriptions column={1} size="small" title={<span><ShopOutlined /> Nhà thuốc xử lý đơn</span>}>
                                    <Descriptions.Item label="">
                                        {order.pharmacyName}
                                    </Descriptions.Item>
                                </Descriptions>
                            </Col>
                        </Row>
                        <Divider style={{ margin: "16px 0" }} />
                        <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 8 }}>Danh sách sản phẩm</div>
                        {(order.items || []).map((item: any, idx: number) => (
                            <Card key={item._id || idx} style={{ marginBottom: 12, borderRadius: 8, background: "#f9fbff", border: "1px solid #e6eaf2" }}>
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
                    </Card>
                </Col>
                <Col xs={24} md={8}>
                    <Card
                        title="Thông tin thanh toán"
                        style={{ borderRadius: 16, marginBottom: 16, border: "none", background: "#fff" }}
                        bodyStyle={{ padding: 20 }}
                    >
                        <Descriptions column={1} size="small" labelStyle={{ fontWeight: 500 }}>
                            <Descriptions.Item label="Tổng tiền">
                                {order.totalAmount.toLocaleString()}đ
                            </Descriptions.Item>
                            <Descriptions.Item label="Giảm giá trực tiếp">0đ</Descriptions.Item>
                            <Descriptions.Item label="Giảm giá voucher">
                                <Tooltip title="Áp dụng khi có mã giảm giá">0đ</Tooltip>
                            </Descriptions.Item>
                            <Descriptions.Item label="Phí vận chuyển">25.000đ</Descriptions.Item>
                            <Descriptions.Item label="Thành tiền">
                                <span style={{ color: "#1677ff", fontWeight: 700, fontSize: 20 }}>
                                    {(order.totalAmount + 25000).toLocaleString()}đ
                                </span>
                            </Descriptions.Item>
                            <Descriptions.Item label="Phương thức thanh toán">
                                <CreditCardOutlined style={{ color: "#1677ff", marginRight: 6 }} />
                                Thanh toán tiền mặt khi nhận hàng
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>
                </Col>
            </Row>
            <div style={{ textAlign: "center", marginTop: 24 }}>
                <Button type="primary" onClick={() => window.history.back()} style={{ borderRadius: 24, padding: "0 32px" }}>
                    Quay lại
                </Button>
            </div>
        </div>
    );
};
export default OrderDetail;