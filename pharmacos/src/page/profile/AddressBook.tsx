import React, { useEffect, useState } from "react";
import { Card, Form, Input, Button, Spin, message, Select, Switch, Radio, Modal, Tooltip } from "antd";
import { EditOutlined, SaveOutlined, HomeOutlined, PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import "./UserProfile.css";

const { Option } = Select;

const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;

interface Province {
    code: number;
    name: string;
    districts: District[];
}
interface District {
    code: number;
    name: string;
    wards: Ward[];
}
interface Ward {
    code: number;
    name: string;
}

export interface UserInfo {
    name: string;
    phone: string;
    city?: string;
    district?: string;
    ward?: string;
    address?: string;
    addressType?: string;
    isDefault?: boolean;
}

export interface AddressInfo {
    _id?: string;
    name: string;
    phone: string;
    city?: string;
    district?: string;
    ward?: string;
    address?: string;
    addressType?: string;
    isDefault?: boolean;
    email?: string;
}

const fetchProfile = async (): Promise<UserInfo> => {
    const token = localStorage.getItem("token");
    const url = "http://localhost:10000/api/customers/profile";
    const res = await fetch(url, {
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });
    if (!res.ok) throw new Error("Failed to fetch profile");
    const data = await res.json();
    return {
        name: data.name || data.fullName || "",
        phone: data.phone || data.phoneNumber || "",
        city: data.city || "",
        district: data.district || "",
        ward: data.ward || "",
        address: data.address || "",
        addressType: data.addressType || "Home",
        isDefault: !!data.isDefault,
    };
};

const updateProfile = async (data: Partial<UserInfo>) => {
    const token = localStorage.getItem("token");
    const url = "http://localhost:10000/api/customers/profile";
    const body = {
        phone: data.phone,
        city: data.city,
        district: data.district,
        ward: data.ward,
        address: data.address,
        addressType: data.addressType,
        isDefault: data.isDefault,
    };
    const res = await fetch(url, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error("Failed to update profile");
    return await res.json();
};

export const getFullAddress = (user: AddressInfo | null) => {
    if (!user) return "";
    return [
        user.address,
        user.ward,
        user.district,
        user.city
    ].filter(Boolean).join(", ");
};

const fetchAddresses = async (): Promise<AddressInfo[]> => {
    const token = localStorage.getItem("token");
    const url = "http://localhost:10000/api/customers/addresses";
    const res = await fetch(url, {
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });
    if (!res.ok) {
        // Thêm log chi tiết lỗi để debug
        const errText = await res.text();
        console.error("Failed to fetch addresses:", res.status, errText);
        throw new Error("Failed to fetch addresses");
    }
    return await res.json();
};

const addAddress = async (data: Partial<AddressInfo>) => {
    const token = localStorage.getItem("token");
    const url = "http://localhost:10000/api/customers/addresses";
    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to add address");
    return await res.json();
};

const updateAddress = async (id: string, data: Partial<AddressInfo>) => {
    const token = localStorage.getItem("token");
    const url = `http://localhost:10000/api/customers/addresses/${id}`;
    const res = await fetch(url, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update address");
    return await res.json();
};

const deleteAddress = async (id: string) => {
    const token = localStorage.getItem("token");
    const url = `http://localhost:10000/api/customers/addresses/${id}`;
    const res = await fetch(url, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });
    if (!res.ok) throw new Error("Failed to delete address");
    return await res.json();
};

const AddressBook: React.FC = () => {
    const [user, setUser] = useState<UserInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [form] = Form.useForm();

    const [provinces, setProvinces] = useState<Province[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [wards, setWards] = useState<Ward[]>([]);
    const [addresses, setAddresses] = useState<AddressInfo[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<AddressInfo | null>(null);

    useEffect(() => {
        fetch("https://provinces.open-api.vn/api/?depth=3")
            .then(res => res.json())
            .then((data: Province[]) => setProvinces(data))
            .catch(() => setProvinces([]));
    }, []);

    const loadAddresses = async () => {
        setLoading(true);
        try {
            const data = await fetchAddresses();
            setAddresses(data);
        } catch (e) {
            // Hiển thị lỗi chi tiết hơn
            message.error("Failed to load addresses. Please check your backend and network.");
            // Log lỗi ra console để dễ debug
            console.error(e);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadAddresses();
    }, []);

    useEffect(() => {
        setLoading(true);
        fetchProfile()
            .then((data) => {
                setUser(data);
                form.setFieldsValue(data);

                const province = provinces.find((p) => p.name === data.city);
                setDistricts(province ? province.districts : []);
                const district = province?.districts.find(
                    (d) => d.name === data.district
                );
                setWards(district ? district.wards : []);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
                message.error("Failed to load address book");
            });
    }, [form, provinces]);

    const handleCityChange = (city: string) => {
        form.setFieldsValue({ district: undefined, ward: undefined });
        const province = provinces.find((p) => p.name === city);
        setDistricts(province ? province.districts : []);
        setWards([]);
    };

    const handleDistrictChange = (districtName: string) => {
        form.setFieldsValue({ ward: undefined });
        const province = provinces.find((p) => p.name === form.getFieldValue("city"));
        const district = province?.districts.find((d) => d.name === districtName);
        setWards(district ? district.wards : []);
    };

    const handleAddNew = () => {
        setShowForm(true);
        setEditing(null);
        form.resetFields(); // Xóa toàn bộ thông tin cũ trên form
        // Đặt lại giá trị mặc định cho các trường cần thiết
        form.setFieldsValue({
            name: "",
            phone: "",
            city: undefined,
            district: undefined,
            ward: undefined,
            address: "",
            addressType: "Home",
            isDefault: false,
        });
        setDistricts([]);
        setWards([]);
    };

    const handleEdit = (addr: AddressInfo) => {
        setShowForm(true);
        setEditing(addr);
        form.setFieldsValue(addr);
        const province = provinces.find((p) => p.name === addr.city);
        setDistricts(province ? province.districts : []);
        const district = province?.districts.find((d) => d.name === addr.district);
        setWards(district ? district.wards : []);
    };

    const handleDelete = async (id: string) => {
        Modal.confirm({
            title: "Delete address?",
            content: "Are you sure you want to delete this address?",
            okText: "Delete",
            okType: "danger",
            cancelText: "Cancel",
            onOk: async () => {
                setLoading(true);
                try {
                    await deleteAddress(id);
                    await loadAddresses();
                    message.success("Address deleted!");
                } catch {
                    message.error("Delete failed!");
                }
                setLoading(false);
            }
        });
    };

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);
            if (editing && editing._id) {
                await updateAddress(editing._id, values);
            } else {
                await addAddress(values);
            }
            await loadAddresses();
            setShowForm(false);
            setEditing(null);
            setLoading(false);
            message.success(editing ? "Address updated!" : "Address added!");
        } catch (err: any) {
            setLoading(false);
            message.error(err.message || "Operation failed!");
        }
    };

    if (loading || !user) {
        return (
            <div className="user-profile-loading">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <Card
            title={
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span className="user-profile-section-title">
                        <HomeOutlined style={{ marginRight: 8 }} />Address Book
                    </span>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAddNew}
                        style={{ marginLeft: 12, display: "flex", alignItems: "center" }}
                    >
                        Add Address
                    </Button>
                </div>
            }
            className="user-profile-section-card"
            bodyStyle={{ padding: 0 }}
            style={{ maxWidth: 480, margin: "0 auto" }}
        >
            <div className="user-profile-section-content" style={{ maxWidth: 420, margin: "0 auto" }}>
                {showForm ? (
                    // Chỉ hiển thị form khi showForm = true, KHÔNG hiển thị danh sách addresses
                    <Form
                        form={form}
                        layout="vertical"
                        initialValues={editing || { addressType: "Home", isDefault: false }}
                        className="user-profile-form"
                        onFinish={handleSave}
                        style={{ background: "#fff", borderRadius: 8, padding: 24, marginBottom: 24 }}
                    >
                        <div style={{ fontWeight: 600, marginBottom: 8, color: "#666" }}>
                            {editing ? "Edit Address" : "Add New Address"}
                        </div>
                        <Form.Item
                            label="Full Name"
                            name="name"
                            rules={[{ required: true, message: "Please enter your full name!" }]}
                        >
                            <Input size="large" placeholder="Full Name" />
                        </Form.Item>
                        <Form.Item
                            label="Phone Number"
                            name="phone"
                            rules={[
                                { required: true, message: "Please enter your phone number!" },
                                { pattern: phoneRegex, message: "Invalid phone number!" },
                            ]}
                        >
                            <Input size="large" maxLength={10} placeholder="Phone Number" />
                        </Form.Item>
                        <div style={{ fontWeight: 600, margin: "24px 0 8px 0", color: "#666" }}>Shipping Address</div>
                        <Form.Item
                            name="city"
                            rules={[{ required: true, message: "Please select a city/province!" }]}
                            style={{ marginBottom: 12 }}
                        >
                            <Select
                                size="large"
                                placeholder="City/Province"
                                showSearch
                                onChange={handleCityChange}
                                filterOption={(input, option) =>
                                    typeof option?.children === "string" &&
                                    (option.children as string).toLowerCase().includes(input.toLowerCase())
                                }
                                value={form.getFieldValue("city")}
                            >
                                {provinces.map((p) => (
                                    <Option key={p.code} value={p.name}>{p.name}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Form.Item
                            name="district"
                            rules={[{ required: true, message: "Please select a district!" }]}
                            style={{ marginBottom: 12 }}
                        >
                            <Select
                                size="large"
                                placeholder="District"
                                showSearch
                                onChange={handleDistrictChange}
                                disabled={districts.length === 0}
                                filterOption={(input, option) =>
                                    typeof option?.children === "string" &&
                                    (option.children as string).toLowerCase().includes(input.toLowerCase())
                                }
                                value={form.getFieldValue("district")}
                            >
                                {districts.length > 0 ? (
                                    districts.map((d) => (
                                        <Option key={d.code} value={d.name}>{d.name}</Option>
                                    ))
                                ) : (
                                    <Option value="" disabled>
                                        {form.getFieldValue("city") && !districts.length ? "No data" : "Select city/province first"}
                                    </Option>
                                )}
                            </Select>
                        </Form.Item>
                        <Form.Item
                            name="ward"
                            rules={[{ required: true, message: "Please select a ward/commune!" }]}
                            style={{ marginBottom: 12 }}
                        >
                            <Select
                                size="large"
                                placeholder="Ward/Commune"
                                showSearch
                                disabled={wards.length === 0}
                                filterOption={(input, option) =>
                                    typeof option?.children === "string" &&
                                    (option.children as string).toLowerCase().includes(input.toLowerCase())
                                }
                                value={form.getFieldValue("ward")}
                            >
                                {wards.length > 0 ? (
                                    wards.map((w) => (
                                        <Option key={w.code} value={w.name}>{w.name}</Option>
                                    ))
                                ) : (
                                    <Option value="" disabled>
                                        {form.getFieldValue("district") && !wards.length ? "No data" : "Select district first"}
                                    </Option>
                                )}
                            </Select>
                        </Form.Item>
                        <Form.Item
                            name="address"
                            rules={[
                                { required: true, message: "Please enter the detailed address!" },
                                { min: 5, message: "Address must be at least 5 characters!" },
                            ]}
                        >
                            <Input.TextArea
                                rows={3}
                                size="large"
                                placeholder="Detailed Address"
                                className="user-profile-textarea"
                            />
                        </Form.Item>
                        <div style={{ fontWeight: 600, margin: "24px 0 8px 0", color: "#666" }}>Address Type</div>
                        <Form.Item name="addressType" initialValue="Home" style={{ marginBottom: 16 }}>
                            <Radio.Group>
                                <Radio.Button value="Home">Home</Radio.Button>
                                <Radio.Button value="Office">Office</Radio.Button>
                            </Radio.Group>
                        </Form.Item>
                        <Form.Item
                            style={{
                                marginBottom: 24,
                                background: "#f0f2f5",
                                borderRadius: 8,
                                padding: "12px 16px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                            }}
                        >
                            <span
                                style={{
                                    color: "#000",
                                    fontWeight: 600,
                                    fontSize: 16,
                                    flex: 1,
                                }}
                            >
                                Set as default address
                            </span>

                            <Form.Item name="isDefault" valuePropName="checked" noStyle>
                                <Switch
                                    checked={form.getFieldValue("isDefault")}
                                    onChange={(checked) => form.setFieldValue("isDefault", checked)}
                                    style={{
                                        marginLeft: 12,
                                        backgroundColor: form.getFieldValue("isDefault") ? "#1890ff" : "#blue",
                                        transition: "all 0.3s ease",
                                    }}
                                />
                            </Form.Item>
                        </Form.Item>

                        <Form.Item style={{ marginTop: 24 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    icon={<SaveOutlined />}
                                    className="user-profile-section-btn"
                                    size="large"
                                    style={{ flex: 1.2, fontWeight: 600, height: 40 }}
                                    loading={loading}
                                >
                                    {editing ? "Save Changes" : "Add Address"}
                                </Button>
                                <Button
                                    size="large"
                                    style={{ flex: 0.8, height: 40 }}
                                    onClick={() => {
                                        setShowForm(false);
                                        setEditing(null);
                                    }}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </Form.Item>


                    </Form>
                ) : (
                    loading ? (
                        <Spin size="large" />
                    ) : (
                        <div>
                            {addresses.map(addr => (
                                <div key={addr._id} style={{
                                    background: "#fff",
                                    borderRadius: 12,
                                    marginBottom: 16,
                                    padding: 20,
                                    boxShadow: "0 1px 4px #eee",
                                    display: "flex",
                                    flexDirection: "column"
                                }}>
                                    <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>
                                        {addr.name} <span style={{ fontWeight: 400, color: "#888" }}>| {addr.phone}</span>
                                    </div>
                                    <div style={{ marginBottom: 8 }}>
                                        {getFullAddress(addr)}
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
                                        <span style={{ background: "#f5f5f5", borderRadius: 4, padding: "2px 8px", marginRight: 8 }}>
                                            <HomeOutlined style={{ marginRight: 4 }} />
                                            {addr.addressType}
                                        </span>
                                        {addr.isDefault && (
                                            <span style={{ background: "#1890ff", color: "#fff", borderRadius: 4, padding: "2px 8px", marginRight: 8 }}>
                                                Default
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <Button type="link" onClick={() => handleEdit(addr)} style={{ padding: 0, marginRight: 8 }}>Edit</Button>
                                        <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(addr._id!)} style={{ padding: 0, marginRight: 8 }}>Delete</Button>
                                    </div>
                                </div>
                            ))}
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={handleAddNew}
                                style={{
                                    margin: "16px 0",
                                    display: "flex",
                                    alignItems: "center",
                                    opacity: 1,
                                    transition: "opacity 0.2s",
                                    color: "#fff",
                                    backgroundColor: "#1890ff",
                                    borderColor: "#1890ff",
                                }}
                            >
                                Add Address
                            </Button>

                        </div>
                    )
                )}
            </div>
        </Card>
    );
};

export default AddressBook;