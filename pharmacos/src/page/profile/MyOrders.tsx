import React, { useEffect, useState } from "react";
import { Card, Button, Tabs, Tag, Spin } from "antd";
import { GiftOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
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

const fetchOrders = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:10000/api/orders/my-orders', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
    });
    if (!res.ok) return [];
    return await res.json();
};

const MyOrders: React.FC = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [orderTab, setOrderTab] = useState<string>("all");
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        fetchOrders().then((data) => {
            setOrders(data);
            setLoading(false);
        });
    }, []);

    if (loading) {
        return <Spin size="large" style={{ display: "block", margin: "64px auto" }} />;
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
                <div style={{ fontWeight: 600, fontSize: 22, marginBottom: 8, color: "#222" }}>
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
                    onClick={() => window.location.href = "/"}
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

    const filteredOrders =
        orderTab === "all"
            ? orders
            : orders.filter((o) => normalizeStatus(o.status) === orderTab);

    return (
        <Card
            title={<span className="user-profile-section-title">My Orders</span>}
            className="user-profile-section-card"
            bodyStyle={{ padding: 0 }}
            style={{ maxWidth: 720, margin: "0 auto" }}
        >
            <div className="user-profile-section-content">
                <Tabs
                    activeKey={orderTab}
                    onChange={setOrderTab}
                    items={ORDER_TABS.map(tab => ({
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
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <div>
                                        <b>
                                            Order
                                            <span style={{ marginLeft: 8, color: "#aaa" }}>
                                                #{order.id}
                                            </span>
                                        </b>
                                    </div>
                                    <Tag color={ORDER_STATUS_MAP[order.status || "processing"]?.color || "orange"}>
                                        {ORDER_STATUS_MAP[order.status || "processing"]?.label || "Processing"}
                                    </Tag>
                                </div>
                                <div className="user-profile-order-items">
                                    {(order.items || []).map((item: any, i: number) => (
                                        <div key={i} className="user-profile-order-item">
                                            <div className="user-profile-order-item-name">
                                                {(item.productId && item.productId.name) ||
                                                    item.name ||
                                                    "No product name"}
                                            </div>
                                            <div className="user-profile-order-item-price">
                                                {(item.unitPrice ?? item.price ?? 0).toLocaleString()}₫ x{item.quantity ?? 1}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <div>
                                        <span
                                            style={{ color: "#1677ff", cursor: "pointer" }}
                                            onClick={() => navigate(`/order/${order.id}`)}
                                        >
                                            View details
                                        </span>
                                    </div>
                                    <div>
                                        <span style={{ color: "#888", marginRight: 8 }}>Total:</span>
                                        <span style={{ color: "#1677ff", fontWeight: 600, fontSize: 16 }}>
                                            {(order.totalAmount ?? order.total ?? 0).toLocaleString() + "₫"}
                                        </span>
                                    </div>
                                </div>
                                {order.note && (
                                    <div style={{ marginTop: 8, color: "#888", fontSize: 13 }}>
                                        {order.note}
                                    </div>
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
