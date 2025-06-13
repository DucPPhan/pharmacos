import React, { useState, useEffect } from "react";
import {
    Layout,
    Menu,
    Card,
    Avatar,
    Button,
    Spin,
    Modal,
    Form,
    Input,
    DatePicker,
    Select,
    Upload,
    message,
    Tooltip,
    Tabs,
    Tag,
} from "antd";
import {
    UserOutlined,
    ShoppingCartOutlined,
    HomeOutlined,
    FileTextOutlined,
    LogoutOutlined,
    EditOutlined,
    CameraOutlined,
    PlusOutlined,
    GiftOutlined,
    MedicineBoxOutlined,
    ClockCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import "./UserProfile.css";
import CategoryNav from "../home/CategoryNav";

const { Sider, Content } = Layout;
const { Option } = Select;
const { TextArea } = Input;

interface UserInfo {
    name: string;
    phone: string;
    gender: string;
    birthday?: string;
    avatarUrl?: string;
    email?: string;
    address?: string;
    skinType?: string;
}
// đơn hàng
const fetchOrders = async () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');
    // Luôn gọi API, không kiểm tra role ở đây nữa
    const res = await fetch('http://localhost:10000/api/orders/my-orders', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
    });
    if (!res.ok) {
        const errText = await res.text();
        console.error("API purchase history error:", errText);
        return [];
    }
    return await res.json();
};

// lịch sử mua hàng
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
    if (!res.ok) {
        const errText = await res.text();
        console.error("API purchase history error:", errText);
        return [];
    }
    return await res.json();
};

const PersonalInfo: React.FC<{
    user: UserInfo;
    onEdit: () => void;
    onChangePassword: () => void;
}> = ({ user, onEdit, onChangePassword }) => (
    <Card title={null} className="user-profile-card" bodyStyle={{ padding: 0 }}>
        <div className="user-profile-card-header">
            <Tooltip title="Personal Information" placement="bottom">
                <Avatar
                    size={120}
                    src={
                        user.avatarUrl ||
                        "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                    }
                    icon={<UserOutlined />}
                    className="user-profile-avatar"
                />
            </Tooltip>
            <div className="user-profile-name">{user.name}</div>
            <div className="user-profile-phone">{user.phone}</div>
        </div>
        <div className="user-profile-card-body">
            <div className="user-profile-row">
                <span className="user-profile-label">Full Name</span>
                <span className="user-profile-value">{user.name}</span>
            </div>
            <div className="user-profile-row">
                <span className="user-profile-label">Phone Number</span>
                <span className="user-profile-value">
                    {user.phone || "Not updated"}
                </span>
            </div>
            <div className="user-profile-row">
                <span className="user-profile-label">Email</span>
                <span className="user-profile-value">
                    {user.email || "Not updated"}
                </span>
            </div>
            <div className="user-profile-row">
                <span className="user-profile-label">Gender</span>
                <span className="user-profile-value">{user.gender}</span>
            </div>
            <div className="user-profile-row">
                <span className="user-profile-label">Birthday</span>
                <span className="user-profile-value">
                    {user.birthday || "Not updated"}
                </span>
            </div>
            <div className="user-profile-row">
                <span className="user-profile-label">Address</span>
                <span className="user-profile-value user-profile-address">
                    {user.address || "Not updated"}
                </span>
            </div>
            <div className="user-profile-edit-btn-wrap" style={{ gap: 16 }}>
                <Button
                    type="primary"
                    shape="round"
                    size="large"
                    icon={<EditOutlined />}
                    className="user-profile-edit-btn"
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit();
                    }}
                >
                    Edit Information
                </Button>
                <Button
                    shape="round"
                    size="large"
                    className="user-profile-edit-btn"
                    style={{
                        background: "#fff",
                        color: "#7494ec",
                        border: "1px solid #7494ec",
                    }}
                    onClick={(e) => {
                        e.stopPropagation();
                        onChangePassword();
                    }}
                >
                    Change Password
                </Button>
            </div>
        </div>
    </Card>
);

const nameRegex = /^[a-zA-ZÀ-ỹ\s'.-]+$/u;
const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;

const EditProfileInlineForm: React.FC<{
    user: UserInfo;
    onCancel: () => void;
    onSave: (values: UserInfo) => void;
}> = ({ user, onCancel, onSave }) => {
    const [form] = Form.useForm();
    const [avatarUrl, setAvatarUrl] = useState<string>(user.avatarUrl || "");

    useEffect(() => {
        form.setFieldsValue({
            ...user,
            birthday: user.birthday ? dayjs(user.birthday, "DD/MM/YYYY") : null,
        });
        setAvatarUrl(user.avatarUrl || "");
    }, [user, form]);

    const handleSave = () => {
        form
            .validateFields()
            .then((values) => {
                onSave({
                    ...user,
                    ...values,
                    avatarUrl,
                    birthday: values.birthday
                        ? values.birthday.format("DD/MM/YYYY")
                        : undefined,
                });
            })
            .catch(() => { });
    };

    const handleAvatarChange = (info: any) => {
        if (info.file.status === "done") {
            message.success("Upload avatar successfully!");
            setAvatarUrl("https://cdn-icons-png.flaticon.com/512/3135/3135715.png");
        } else if (info.file.status === "error") {
            message.error("Upload avatar failed.");
        }
    };

    return (
        <Card title={null} className="user-profile-card" bodyStyle={{ padding: 0, height: '100%' }}>
            <div className="user-profile-card-header">
                <Tooltip title="Personal Information" placement="bottom">
                    <Upload
                    >
                        <Avatar
                            size={120}
                            src={
                                avatarUrl ||
                                "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                            }
                            icon={<UserOutlined />}
                            className="user-profile-avatar"
                            style={{
                                border: "3px solid #1677ff",
                                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                            }}
                        />
                    </Upload>
                </Tooltip>
                <div className="user-profile-name">{user.name}</div>
                <div className="user-profile-phone">{user.phone}</div>
            </div>
            <div className="user-profile-card-body" style={{ maxHeight: 540, overflowY: "auto" }}>
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{
                        ...user,
                        birthday: user.birthday ? dayjs(user.birthday, "DD/MM/YYYY") : null,
                    }}
                    className="user-profile-form"
                >
                    <Form.Item
                        name="name"
                        label="Full Name"
                        rules={[
                            { required: true, message: "Please enter your full name!" },
                            { min: 2, message: "Full name must be at least 2 characters!" },
                            {
                                pattern: nameRegex,
                                message: "Invalid full name!",
                            },
                            {
                                validator: (_, value) => {
                                    if (value && /^\d+$/.test(value)) {
                                        return Promise.reject("Invalid full name!");
                                    }
                                    return Promise.resolve();
                                },
                            },
                        ]}
                    >
                        <Input size="large" placeholder="Enter full name" />
                    </Form.Item>
                    <Form.Item
                        name="phone"
                        label="Phone Number"
                        rules={[
                            { required: true, message: "Please enter your phone number!" },
                            {
                                pattern: phoneRegex,
                                message: "Invalid phone number!",
                            },
                        ]}
                    >
                        <Input
                            size="large"
                            placeholder="Enter phone number"
                            maxLength={10}
                        />
                    </Form.Item>
                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: "Please enter your email!" },
                            { type: "email", message: "Invalid email!" },
                        ]}
                    >
                        <Input size="large" placeholder="Enter email" />
                    </Form.Item>
                    <Form.Item
                        name="gender"
                        label="Gender"
                        rules={[{ required: true, message: "Please select gender!" }]}
                    >
                        <Select size="large" placeholder="Select gender">
                            <Option value="male">Male</Option>
                            <Option value="female">Female</Option>
                            <Option value="Khác">Other</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="birthday"
                        label="Birthday"
                        rules={[
                            { required: true, message: "Please select birthday!" },
                            {
                                validator: (_, value) => {
                                    if (value && value.isAfter(dayjs(), "day")) {
                                        return Promise.reject("Invalid birthday!");
                                    }
                                    return Promise.resolve();
                                },
                            },
                        ]}
                    >
                        <DatePicker
                            size="large"
                            style={{ width: "100%" }}
                            format="DD/MM/YYYY"
                            placeholder="Select birthday"
                            className="user-profile-datepicker"
                            disabledDate={(current) =>
                                current && current > dayjs().endOf("day")
                            }
                        />
                    </Form.Item>
                    <Form.Item
                        name="address"
                        label="Address"
                        rules={[
                            { required: true, message: "Please enter your address!" },
                            { min: 5, message: "Address must be at least 5 characters!" },
                        ]}
                    >
                        <TextArea
                            rows={3}
                            size="large"
                            placeholder="Enter address"
                            className="user-profile-textarea"
                        />
                    </Form.Item>
                    <Form.Item style={{ marginTop: 32, textAlign: "center" }}>
                        <Button
                            type="primary"
                            shape="round"
                            size="large"
                            style={{
                                marginRight: 16,
                                minWidth: 120,
                                color: "#fff",
                                backgroundColor: "#1677ff",
                                borderColor: "#1677ff",
                            }}
                            onClick={handleSave}
                        >
                            Save Changes
                        </Button>
                        <Button
                            shape="round"
                            size="large"
                            onClick={onCancel}
                            style={{ minWidth: 100 }}
                        >
                            Cancel
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </Card>
    );
};

const ChangePasswordForm: React.FC<{
    onCancel: () => void;
    onSuccess: () => void;
}> = ({ onCancel, onSuccess }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        try {
            const { oldPassword, newPassword } = await form.validateFields();
            setLoading(true);
            await changePassword(oldPassword, newPassword);
            setLoading(false);
            message.success("Password changed successfully!");
            onSuccess();
        } catch (err: any) {
            setLoading(false);
            message.error(err.message || "Password change failed!");
        }
    };

    return (
        <Card title={null} className="user-profile-card" bodyStyle={{ padding: 0 }}>
            <div className="user-profile-card-header">
                <Avatar
                    size={120}
                    src={"https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                    icon={<UserOutlined />}
                    className="user-profile-avatar"
                />
                <div className="user-profile-name">Change Password</div>
            </div>
            <div className="user-profile-card-body">
                <Form form={form} layout="vertical" className="user-profile-form">
                    <Form.Item
                        name="oldPassword"
                        label="Old Password"
                        rules={[
                            { required: true, message: "Please enter your old password!" },
                            { min: 1, message: "Password must be at least 6 characters!" },
                        ]}
                    >
                        <Input.Password size="large" placeholder="Enter old password" />
                    </Form.Item>
                    <Form.Item
                        name="newPassword"
                        label="New Password"
                        rules={[
                            { required: true, message: "Please enter your new password!" },
                            { min: 1, message: "Password must be at least 6 characters!" },
                            {
                                validator: (_, value) => {
                                    if (!value) return Promise.resolve();
                                    if (
                                        form.getFieldValue("oldPassword") &&
                                        value === form.getFieldValue("oldPassword")
                                    ) {
                                        return Promise.reject(
                                            "New password must be different from old password!"
                                        );
                                    }
                                    return Promise.resolve();
                                },
                            },
                        ]}
                    >
                        <Input.Password size="large" placeholder="Enter new password" />
                    </Form.Item>
                    <Form.Item
                        name="confirmPassword"
                        label="Confirm New Password"
                        dependencies={["newPassword"]}
                        rules={[
                            { required: true, message: "Please confirm your new password!" },
                            {
                                validator: (_, value) => {
                                    if (!value || form.getFieldValue("newPassword") === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject("Passwords do not match!");
                                },
                            },
                        ]}
                    >
                        <Input.Password size="large" placeholder="Re-enter new password" />
                    </Form.Item>
                    <Form.Item style={{ marginTop: 32, textAlign: "center" }}>
                        <Button
                            shape="round"
                            size="large"
                            onClick={onCancel}
                            style={{ minWidth: 100, marginRight: 16, width: 120, height: 40 }}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            shape="round"
                            size="large"
                            className="user-profile-edit-btn"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleSubmit();
                            }}
                        >
                            Change Password
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </Card>
    );
};

// Hàm lấy role từ localStorage
const getUserRole = () => {
    return localStorage.getItem("role") || "customer";
};

// Hàm fetch profile động theo role, truyền token vào header Authorization
const fetchProfileByRole = async (): Promise<UserInfo> => {
    const user = JSON.parse(localStorage.getItem("user"));
    const role = user.role;
    const token = localStorage.getItem("token");
    let url = "";
    if (role === "staff") {
        url = "http://localhost:10000/api/staff/profile";
    } else {
        url = "http://localhost:10000/api/customers/profile";
    }
    const res = await fetch(url, {
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });
    if (!res.ok) {
        const errText = await res.text();
        console.error("API error:", errText);
        throw new Error("Không lấy được thông tin người dùng");
    }
    const data = await res.json();

    return {
        name: data.name || data.fullName || "",
        phone: data.phone || data.phoneNumber || "",
        gender:
            data.gender === "male"
                ? "Male"
                : data.gender === "female"
                    ? "Female"
                    : data.gender || "",
        birthday: data.dateOfBirth
            ? dayjs(data.dateOfBirth).format("DD/MM/YYYY")
            : data.birthday || "",
        avatarUrl: data.avatarUrl || "",
        email: data.email || "",
        address: data.address || "",
    };
};

// Hàm update profile động theo role
const updateProfileByRole = async (data: UserInfo): Promise<UserInfo> => {
    const user = JSON.parse(localStorage.getItem('user'));
    const role = user.role;
    const token = localStorage.getItem('token');
    let url = "";
    let body: any = {};
    let method = "PATCH";

    if (role === "staff") {
        url = "http://localhost:10000/api/staff/profile";
        body = {
            phone: data.phone,
            address: data.address,
            name: data.name,
            gender:
                data.gender === "Male"
                    ? "male"
                    : data.gender === "Female"
                        ? "female"
                        : data.gender,
            dateOfBirth: data.birthday
                ? dayjs(data.birthday, "DD/MM/YYYY").format("YYYY-MM-DD")
                : undefined,
        };
        method = "PATCH";
    } else {
        url = "http://localhost:10000/api/customers/profile";
        body = {
            phone: data.phone,
            address: data.address,
            name: data.name,
            gender:
                data.gender === "Male"
                    ? "male"
                    : data.gender === "Female"
                        ? "female"
                        : data.gender,
            dateOfBirth: data.birthday
                ? dayjs(data.birthday, "DD/MM/YYYY").format("YYYY-MM-DD")
                : undefined,
        };
        method = "PATCH";
    }

    const res = await fetch(url, {
        method,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const errText = await res.text();
        console.error("API update error:", errText);
        throw new Error("Cập nhật thông tin thất bại!");
    }
    return await fetchProfileByRole();
};

// API đổi mật khẩu động cho customer và staff (không giả lập, luôn gọi API nếu có endpoint)
const changePassword = async (oldPassword: string, newPassword: string) => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role") || "customer";
    let url = "";
    let body: any = {};
    let method = "PUT";

    if (role === "customer") {
        url = "http://localhost:10000/api/customers/change-password";
        body = {
            currentPassword: oldPassword,
            newPassword: newPassword,
        };
        method = "PUT";
    } else if (role === "staff") {
        url = "http://localhost:10000/api/staff/change-password";
        body = {
            currentPassword: oldPassword,
            newPassword: newPassword,
        };
        method = "PUT";
    } else {
        throw new Error("Không hỗ trợ đổi mật khẩu cho loại tài khoản này!");
    }

    const res = await fetch(url, {
        method,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        const errText = await res.text();
        console.error("API change password error:", errText);
        throw new Error("Password change failed!");
    }
    return { success: true };
};

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

const UserProfile: React.FC = () => {
    const [activeMenu, setActiveMenu] = useState<string>(
        () => localStorage.getItem("profileActiveMenu") || "thongtincanhan"
    );
    const [user, setUser] = useState<UserInfo | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [changePasswordMode, setChangePasswordMode] = useState(false);
    const [loading, setLoading] = useState(false);
    const [purchaseHistory, setPurchaseHistory] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [orderTab, setOrderTab] = useState<string>("all");

    useEffect(() => {
        setLoading(true);
        fetchProfileByRole()
            .then((data) => {
                setUser(data);
                setLoading(false);
            })
            .catch((err) => {
                setLoading(false);
                message.error("Failed to get user information!");
            });
    }, []);

    useEffect(() => {
        if (activeMenu === "donhang") {
            fetchOrders().then(setOrders);
        }
        if (activeMenu === "donthuoc") {
            fetchPurchaseHistory().then(setPurchaseHistory);
        }
    }, [activeMenu]);

    const handleMenuClick = (e: any) => {
        if (e.key === "logout") {
            Modal.confirm({
                title: "Bạn có chắc chắn muốn đăng xuất?",
                content: "Bạn sẽ cần đăng nhập lại để tiếp tục sử dụng dịch vụ.",
                okText: (
                    <span style={{ color: "#fff", fontWeight: 700 }}>Đăng xuất</span>
                ),
                cancelText: "Hủy",
                okButtonProps: {
                    style: {
                        background: "linear-gradient(90deg, #1677ff 0%, #7494ec 100%)",
                        border: "none",
                        fontWeight: 700,
                        borderRadius: 8,
                        boxShadow: "0 4px 12px rgba(22,119,255,0.18)",
                    },
                },
                cancelButtonProps: {
                    style: {
                        borderRadius: 8,
                    },
                },
                onOk: () => {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    localStorage.removeItem("role");
                    window.location.href = "/login";
                },
            });
        } else {
            setActiveMenu(e.key);
            localStorage.setItem("profileActiveMenu", e.key);
        }
    };

    const handleSaveProfile = async (values: UserInfo) => {
        setLoading(true);
        try {
            const updated = await updateProfileByRole(values);
            setUser(updated);
            setEditMode(false);
            message.success("Profile updated successfully!");
        } catch (err: any) {
            message.error(err.message || "Profile update failed!");
        }
        setLoading(false);
    };

    const renderOrders = () => {
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

                </div>
            );
        }

        // Debug: log status values
        // console.log(orders.map(o => o.status));

        // Map các status phổ biến về đúng tab
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
            <div style={{ marginTop: 8 }}>
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
                                        <a href={`/order/${order.id}`}>View details</a>
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
        );
    };

    const renderPurchaseHistory = () => {
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
                    <div style={{ fontWeight: 600, fontSize: 22, marginBottom: 8, color: "#222" }}>
                        You have no purchase history.
                    </div>
                    <div style={{ color: "#888", marginBottom: 24 }}>
                        Start shopping to see your purchase history.
                    </div>
                </div>
            );
        }
        //display purchase history
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

        const filteredHistory =
            orderTab === "all"
                ? normalizedHistory
                : normalizedHistory.filter((o) => normalizeStatus(o.status) === orderTab);

        return (
            <div style={{ marginTop: 8 }}>
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
                                    bodyStyle={{ padding: 16 }}
                                >
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <div>
                                            <b>
                                                Purchase
                                                <span style={{ marginLeft: 8, color: "#aaa" }}>
                                                    #{item.id || idx + 1}
                                                </span>
                                            </b>
                                        </div>
                                        <Tag color={ORDER_STATUS_MAP[normalizedStatus]?.color || "blue"}>
                                            {ORDER_STATUS_MAP[normalizedStatus]?.label || "Processing"}
                                        </Tag>
                                    </div>
                                    <div className="user-profile-order-items">
                                        {(item.items || []).map((prod: any, i: number) => (
                                            <div key={i} className="user-profile-order-item">
                                                <div className="user-profile-order-item-name">
                                                    {(prod.productId && prod.productId.name) ||
                                                        prod.name ||
                                                        "No product name"}
                                                </div>
                                                <div className="user-profile-order-item-price">
                                                    {(prod.unitPrice ?? prod.price ?? 0).toLocaleString()}₫ x{prod.quantity ?? 1}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <div>
                                            Purchase Date:{" "}
                                            {item.date ? dayjs(item.date).format("DD/MM/YYYY") : "---"}
                                        </div>
                                        <div>
                                            <span style={{ color: "#888", marginRight: 8 }}>Total:</span>
                                            <span style={{ color: "#1677ff", fontWeight: 600, fontSize: 16 }}>
                                                {(item.totalAmount ?? item.total ?? 0).toLocaleString() + "₫"}
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
        );
    };

    const renderContent = () => {
        if (loading || !user) {
            return (
                <div className="user-profile-loading">
                    <Spin size="large" />
                </div>
            );
        }

        switch (activeMenu) {
            case "thongtincanhan":
                return (
                    <div className="user-profile-main-content">
                        {!editMode && !changePasswordMode ? (
                            <PersonalInfo
                                user={user}
                                onEdit={() => setEditMode(true)}
                                onChangePassword={() => setChangePasswordMode(true)}
                            />
                        ) : editMode ? (
                            <EditProfileInlineForm
                                user={user}
                                onCancel={() => setEditMode(false)}
                                onSave={handleSaveProfile}
                            />
                        ) : (
                            <ChangePasswordForm
                                onCancel={() => setChangePasswordMode(false)}
                                onSuccess={() => setChangePasswordMode(false)}
                            />
                        )}
                    </div>
                );
            case "donhang":
                return (
                    <Card
                        title={
                            <span className="user-profile-section-title">
                                My Orders
                            </span>
                        }
                        className="user-profile-section-card"
                        bodyStyle={{ padding: 0 }}
                        style={{ maxWidth: 720, margin: "0 auto" }}
                    >
                        <div className="user-profile-section-content">
                            {renderOrders()}
                            <Button
                                type="primary"
                                shape="round"
                                size="large"
                                className="user-profile-section-btn"
                                onClick={() => {
                                    window.location.href = "/";
                                }}
                                icon={<ShoppingCartOutlined />}
                                style={{ marginTop: 24 }}
                            >
                                Shop Now
                            </Button>
                        </div>
                    </Card>
                );
            case "donthuoc":
                return (
                    <Card
                        title={
                            <span className="user-profile-section-title">
                                Purchase History
                            </span>
                        }
                        className="user-profile-section-card"
                        bodyStyle={{ padding: 0 }}
                        style={{ maxWidth: 720, margin: "0 auto" }}
                    >
                        <div className="user-profile-section-content">
                            {renderPurchaseHistory()}
                        </div>
                    </Card>
                );
            default:
                return null;
        }
    };

    return (
        <>
            <CategoryNav />
            <Layout className="user-profile-layout">
                <Layout className="user-profile-inner-layout">
                    <Sider width={340} className="user-profile-sider">
                        <div className="user-profile-sider-header">
                            <Tooltip title="User Information" placement="right">
                                <Avatar
                                    size={100}
                                    src={
                                        user?.avatarUrl ||
                                        "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                                    }
                                    icon={<UserOutlined />}
                                    className="user-profile-sider-avatar"
                                />
                            </Tooltip>
                            <div className="user-profile-sider-name">{user?.name}</div>
                            <div className="user-profile-sider-phone">{user?.phone}</div>
                        </div>
                        <Menu
                            mode="inline"
                            selectedKeys={[activeMenu]}
                            onClick={handleMenuClick}
                            className="user-profile-sider-menu"
                            items={[
                                {
                                    key: "thongtincanhan",
                                    icon: <UserOutlined style={{ fontSize: 20 }} />,
                                    label: "Personal Information",
                                },
                                {
                                    key: "donhang",
                                    icon: <ShoppingCartOutlined style={{ fontSize: 20 }} />,
                                    label: "My Orders",
                                },
                                {
                                    key: "donthuoc",
                                    icon: <FileTextOutlined style={{ fontSize: 20 }} />,
                                    label: "Purchase History",
                                },
                                {
                                    key: "logout",
                                    icon: (
                                        <LogoutOutlined
                                            style={{ fontSize: 20, color: "#ff4d4f" }}
                                        />
                                    ),
                                    label: (
                                        <span className="user-profile-logout-label">Logout</span>
                                    ),
                                    danger: true,
                                    style: { marginTop: 12 },
                                },
                            ]}
                        />
                    </Sider>
                    <Content className="user-profile-content">{renderContent()}</Content>
                </Layout>
            </Layout>
        </>
    );
};

export default UserProfile;