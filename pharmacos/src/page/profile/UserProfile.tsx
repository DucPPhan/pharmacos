import React, { useState, useEffect } from "react";
import {
    Layout,
    Menu,
    Avatar,
    Button,
    Spin,
    Modal,
    message,
    Tooltip,
    Card,
    Form,
    Input,
    DatePicker,
    Select,
    Upload
} from "antd";
import {
    UserOutlined,
    ShoppingCartOutlined,
    FileTextOutlined,
    LogoutOutlined,
    EditOutlined,
    HomeOutlined,
} from "@ant-design/icons";
import CategoryNav from "../home/CategoryNav";
import "./UserProfile.css";
import { useNavigate, useLocation, Routes, Route, Navigate } from "react-router-dom";
import MyOrders from "./MyOrders";
import PurchaseHistory from "./PurchaseHistory";
import AddressBook from "./AddressBook";
import dayjs from "dayjs";


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
                    {user.phone}
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
            message.success("Password changed successfully! Please login again.");
            setTimeout(() => {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                localStorage.removeItem("role");
                window.location.href = "/login";
            }, 2000);

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
                        dependencies={["oldPassword"]}
                        rules={[
                            { required: true, message: "Please enter your new password!" },
                            { min: 1, message: "Password must be at least 6 characters!" },
                            {
                                validator: (_, value) => {
                                    if (!value) return Promise.resolve();
                                    const oldPassword = form.getFieldValue("oldPassword");
                                    if (oldPassword && value === oldPassword) {
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
                    <Form.Item
                        style={{
                            marginTop: 32,
                            textAlign: "center",
                            display: "flex",
                            justifyContent: "center",
                            gap: 16,
                        }}
                    >
                        <Button
                            shape="round"
                            size="large"
                            onClick={onCancel}
                            style={{ width: 120, height: 40 }}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            shape="round"
                            size="large"
                            className="user-profile-edit-btn"
                            style={{ width: 160, height: 40 }}
                            loading={loading}
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
    // Xóa mọi logic liên quan staff, chỉ lấy customer
    const token = localStorage.getItem("token");
    const url = "http://localhost:10000/api/customers/profile";
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

// Hàm update profile chỉ cho customer
const updateProfileByRole = async (data: UserInfo): Promise<UserInfo> => {
    const token = localStorage.getItem('token');
    const url = "http://localhost:10000/api/customers/profile";
    const body = {
        name: data.name,
        phone: data.phone,
        address: data.address,
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
    const method = "PATCH";

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
// API đổi mật khẩu chỉ cho customer
const changePassword = async (oldPassword: string, newPassword: string) => {
    const token = localStorage.getItem("token");
    const url = "http://localhost:10000/api/customers/change-password";
    const body = {
        currentPassword: oldPassword,
        newPassword: newPassword,
    };
    const method = "PUT";

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

const MENU_CONFIG = [
    {
        key: "thongtincanhan",
        icon: <UserOutlined style={{ fontSize: 20 }} />,
        label: "Personal Information",
        path: "/profile"
    },
    {
        key: "donhang",
        icon: <ShoppingCartOutlined style={{ fontSize: 20 }} />,
        label: "My Orders",
        path: "/profile/don-hang-cua-toi"
    },
    {
        key: "donthuoc",
        icon: <FileTextOutlined style={{ fontSize: 20 }} />,
        label: "Purchase History",
        path: "/profile/lich-su-mua-hang"
    },
    {
        key: "addressbook",
        icon: <HomeOutlined style={{ fontSize: 20 }} />,
        label: "Address Book",
        path: "/profile/address-book"
    },
    {
        key: "logout",
        icon: <LogoutOutlined style={{ fontSize: 20, color: "#ff4d4f" }} />,
        label: <span className="user-profile-logout-label">Logout</span>,
        danger: true,
        style: { marginTop: 12 }
    }
];

const getMenuKeyByPath = (pathname: string) => {
    if (pathname.endsWith("/don-hang-cua-toi")) return "donhang";
    if (pathname.endsWith("/lich-su-mua-hang")) return "donthuoc";
    if (pathname.endsWith("/address-book")) return "addressbook";
    return "thongtincanhan";
};

const UserProfile: React.FC = () => {
    const [user, setUser] = useState<UserInfo | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [changePasswordMode, setChangePasswordMode] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const activeMenu = getMenuKeyByPath(location.pathname);

    useEffect(() => {
        setLoading(true);
        fetchProfileByRole()
            .then((data) => {
                setUser(data);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
                message.error("Failed to get user information!");
            });
    }, []);

    useEffect(() => {
        if (location.pathname === "/profile" || location.pathname === "/profile/") {
            return;
        }
        localStorage.setItem("profileActiveMenu", activeMenu);
    }, [location.pathname, activeMenu]);

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
            const menu = MENU_CONFIG.find(m => m.key === e.key);
            if (menu && menu.path) {
                navigate(menu.path);
            }
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

    const renderPersonalInfo = () => (
        <div className="user-profile-main-content">
            {!editMode && !changePasswordMode ? (
                <PersonalInfo
                    user={user!}
                    onEdit={() => setEditMode(true)}
                    onChangePassword={() => setChangePasswordMode(true)}
                />
            ) : editMode ? (
                <EditProfileInlineForm
                    user={user!}
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
    return (
        <>
            <CategoryNav />

            <Layout className="user-profile-layout">
                <Layout className="user-profile-inner-layout">
                    <Sider width={320} className="user-profile-sider">
                        <div className="user-profile-sider-header">
                            <Tooltip title="User Information" placement="right">
                                <Avatar
                                    size={96}
                                    src={
                                        user?.avatarUrl ||
                                        "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                                    }
                                    icon={<UserOutlined />}
                                    className="user-profile-sider-avatar"
                                />
                            </Tooltip>

                            <div className="user-profile-sider-info">
                                <div className="user-name">{user?.name}</div>
                                <div className="user-phone">{user?.phone}</div>
                            </div>
                        </div>

                        <Menu
                            mode="inline"
                            selectedKeys={[activeMenu]}
                            onClick={handleMenuClick}
                            className="user-profile-sider-menu"
                            items={MENU_CONFIG}
                        />
                    </Sider>

                    <Content className="user-profile-content">
                        {(!user || loading) ? (
                            <div className="user-profile-loading">
                                <Spin size="large" />
                            </div>
                        ) : (
                            <Routes>
                                <Route path="" element={renderPersonalInfo()} />
                                <Route path="don-hang-cua-toi" element={<MyOrders />} />
                                <Route path="lich-su-mua-hang" element={<PurchaseHistory />} />
                                <Route path="address-book" element={<AddressBook />} />
                                <Route path="*" element={<Navigate to="" replace />} />
                            </Routes>
                        )}
                    </Content>
                </Layout>
            </Layout>
        </>

    );
};
export default UserProfile;