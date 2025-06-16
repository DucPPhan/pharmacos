import React, { useEffect, useState } from "react";
import { Card, Form, Input, Button, Spin, message, Select, Switch, Radio } from "antd";
import { EditOutlined, SaveOutlined, HomeOutlined } from "@ant-design/icons";
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
        addressType: data.addressType || "Nhà",
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

export const getFullAddress = (user: UserInfo | null) => {
    if (!user) return "";
    return [
        user.address,
        user.ward,
        user.district,
        user.city
    ].filter(Boolean).join(", ");
};

const AddressBook: React.FC = () => {
    const [user, setUser] = useState<UserInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [form] = Form.useForm();

    const [provinces, setProvinces] = useState<Province[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [wards, setWards] = useState<Ward[]>([]);

    useEffect(() => {
        fetch("https://provinces.open-api.vn/api/?depth=3")
            .then(res => res.json())
            .then((data: Province[]) => setProvinces(data))
            .catch(() => setProvinces([]));
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

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);
            await updateProfile(values);
            const updated = await fetchProfile();
            setUser(updated);
            setEditMode(false);
            setLoading(false);
            message.success("Cập nhật thành công!");
        } catch (err: any) {
            setLoading(false);
            message.error(err.message || "Update failed!");
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
            title={<span className="user-profile-section-title"><HomeOutlined style={{ marginRight: 8 }} />Address Book</span>}
            className="user-profile-section-card"
            bodyStyle={{ padding: 0 }}
            style={{ maxWidth: 480, margin: "0 auto" }}
        >
            <div className="user-profile-section-content" style={{ maxWidth: 420, margin: "0 auto" }}>
                {!editMode ? (
                    <div style={{ width: "100%", textAlign: "left" }}>
                        <div style={{ fontWeight: 600, marginBottom: 8, color: "#666" }}>Recipient Information</div>
                        <div style={{ marginBottom: 12 }}>
                            <span style={{ fontWeight: 600 }}>{user.name}</span>
                            {" | "}
                            <span>{user.phone}</span>
                        </div>
                        <div style={{ marginBottom: 12 }}>
                            <span>
                                {[user.address, user.ward, user.district, user.city].filter(Boolean).join(", ")}
                            </span>
                        </div>
                        <div style={{ marginBottom: 12 }}>
                            <span>
                                <span style={{ background: "#f5f5f5", borderRadius: 4, padding: "2px 8px", marginRight: 8 }}>
                                    <HomeOutlined style={{ marginRight: 4 }} />
                                    {user.addressType}
                                </span>
                                {user.isDefault && (
                                    <span style={{ background: "#1890ff", color: "#fff", borderRadius: 4, padding: "2px 8px" }}>
                                        Default
                                    </span>
                                )}
                            </span>
                        </div>
                        <Button
                            type="primary"
                            icon={<EditOutlined />}
                            className="user-profile-section-btn"
                            size="large"
                            style={{ width: "100%", fontWeight: 600, marginTop: 24 }}
                            onClick={() => setEditMode(true)}
                        >
                            Update Address
                        </Button>
                    </div>
                ) : (
                    <Form
                        form={form}
                        layout="vertical"
                        initialValues={user}
                        className="user-profile-form"
                        onFinish={handleSave}
                    >
                        <div style={{ fontWeight: 600, marginBottom: 8, color: "#666" }}>Recipient Information</div>
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
                        <Form.Item name="addressType" initialValue="Nhà" style={{ marginBottom: 16 }}>
                            <Radio.Group>
                                <Radio.Button value="Nhà">Home</Radio.Button>
                                <Radio.Button value="Văn phòng">Office</Radio.Button>
                            </Radio.Group>
                        </Form.Item>
                        <Form.Item
                            style={{
                                marginBottom: 24,
                                background: "#f6f8fa",
                                borderRadius: 8,
                                padding: "12px 16px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between"
                            }}
                        >
                            <span style={{ fontWeight: 500, color: "#222" }}>Set as default address</span>
                            <Form.Item name="isDefault" valuePropName="checked" noStyle>
                                <Switch
                                    checked={form.getFieldValue("isDefault")}
                                    onChange={checked => form.setFieldValue("isDefault", checked)}
                                    style={{ marginLeft: 12 }}
                                    checkedChildren=""
                                    unCheckedChildren=""
                                />
                            </Form.Item>
                        </Form.Item>
                        <Form.Item style={{ marginTop: 24 }}>
                            <Button
                                type="primary"
                                htmlType="submit"
                                icon={<SaveOutlined />}
                                className="user-profile-section-btn"
                                size="large"
                                style={{ width: "100%", fontWeight: 600 }}
                            >
                                Save Changes
                            </Button>
                            <Button
                                shape="round"
                                size="large"
                                style={{ width: "100%", marginTop: 12 }}
                                onClick={() => {
                                    form.setFieldsValue(user);
                                    setEditMode(false);
                                }}
                            >
                                Cancel
                            </Button>
                        </Form.Item>
                    </Form>
                )}
            </div>
        </Card>
    );
};

export default AddressBook;