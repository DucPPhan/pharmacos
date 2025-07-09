import React, { useEffect, useState } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Spin,
  message,
  Select,
  Switch,
  Radio,
  Modal,
} from "antd";
import {
  HomeOutlined,
  PlusOutlined,
  DeleteOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import "./UserProfile.css";
import { ensureValidAddressType } from "@/lib/api";

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
    // Fix the address type to match backend expectations
    addressType:
      data.addressType === "Home"
        ? "Nhà riêng"
        : data.addressType === "Office"
          ? "Văn phòng"
          : data.addressType || "Nhà riêng",
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
  return [user.address, user.ward, user.district, user.city]
    .filter(Boolean)
    .join(", ");
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

  // Create a sanitized copy with valid addressType
  const sanitizedData = {
    ...data,
    addressType: ensureValidAddressType(data.addressType)
  };

  // Log the data being sent for debugging
  console.log("Adding address with data:", JSON.stringify(sanitizedData, null, 2));

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(sanitizedData),
    });

    // Read the response text first so we can log it
    const responseText = await res.text();
    console.log(`Server response (${res.status}):`, responseText);

    if (!res.ok) {
      // Try to parse as JSON if possible
      try {
        const errorData = JSON.parse(responseText);
        throw new Error(errorData.message || "Failed to add address");
      } catch (parseError) {
        // If not JSON or other error parsing
        throw new Error(`Server error (${res.status}): ${responseText || "Unknown error"}`);
      }
    }

    try {
      return JSON.parse(responseText);
    } catch (e) {
      return { success: true, message: "Address added successfully" };
    }
  } catch (error) {
    console.error("Error in addAddress:", error);
    throw error;
  }
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
      .then((res) => res.json())
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
      message.error(
        "Failed to load addresses. Please check your backend and network."
      );
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
    const province = provinces.find(
      (p) => p.name === form.getFieldValue("city")
    );
    const district = province?.districts.find((d) => d.name === districtName);
    setWards(district ? district.wards : []);
  };

  const handleAddNew = () => {
    setShowForm(true);
    setEditing(null);
    form.resetFields();

    // Prefill with user's profile information if available
    form.setFieldsValue({
      name: user?.name || "",
      phone: user?.phone || "",
      city: undefined,
      district: undefined,
      ward: undefined,
      address: "",
      addressType: "Nhà riêng",
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
      },
    });
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // Ensure all required fields are present and properly formatted
      if (!values.name || !values.phone || !values.city ||
        !values.district || !values.ward || !values.address) {
        throw new Error("Please fill in all required fields");
      }

      // Make sure phone matches required format
      if (!phoneRegex.test(values.phone)) {
        throw new Error("Phone number must be 10 digits starting with 03, 05, 07, 08, or 09");
      }

      // Convert and sanitize data
      const addressData = {
        name: values.name.trim(),
        phone: values.phone.trim(),
        city: values.city,
        district: values.district,
        ward: values.ward,
        address: values.address.trim(),
        // Use our robust validation helper
        addressType: ensureValidAddressType(values.addressType),
        isDefault: Boolean(values.isDefault),
      };

      console.log("Submitting address with addressType:", addressData.addressType);

      if (editing && editing._id) {
        await updateAddress(editing._id, addressData);
        message.success("Address updated successfully!");
      } else {
        await addAddress(addressData);
        message.success("Address added successfully!");
      }

      await loadAddresses();
      setShowForm(false);
      setEditing(null);
    } catch (err: any) {
      console.error("Address operation failed:", err);
      message.error(err.message || "Operation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading || !user) {
    return (
      <Spin size="large" style={{ display: "block", margin: "64px auto" }} />
    );
  }

  return (
    <Card
      title={
        <span className="user-profile-section-title">
          <HomeOutlined style={{ marginRight: 8 }} />
          Address Book
        </span>
      }
      className="user-profile-section-card"
      styles={{ body: { padding: 0 } }}
      style={{ maxWidth: 720, margin: "0 auto" }}
    >
      <div className="user-profile-section-content">
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: 16,
          }}
        >
          {!showForm && (
            <Button
              icon={<PlusOutlined />}
              onClick={handleAddNew}
              style={{ fontWeight: 600, background: "#1677ff", color: "#fff" }}
            >
              Add Address
            </Button>
          )}
        </div>
        <div style={{ maxWidth: 520, margin: "0 auto" }}>
          {showForm ? (
            <Card
              style={{
                borderRadius: 12,
                border: "1px solid #f0f0f0",
                marginBottom: 16,
              }}
              styles={{ body: { padding: 24 } }}
            >
              <Form
                form={form}
                layout="vertical"
                initialValues={
                  editing || { addressType: "Nhà riêng", isDefault: false }
                }
                className="user-profile-form"
                onFinish={handleSave}
              >
                <div
                  style={{
                    fontWeight: 600,
                    marginBottom: 8,
                    color: "#222",
                    fontSize: 18,
                  }}
                >
                  {editing ? "Edit Address" : "Add New Address"}
                </div>
                <Form.Item
                  label="Full Name"
                  name="name"
                  rules={[
                    { required: true, message: "Please enter your full name!" },
                  ]}
                >
                  <Input size="large" placeholder="Full Name" />
                </Form.Item>
                <Form.Item
                  label="Phone Number"
                  name="phone"
                  rules={[
                    {
                      required: true,
                      message: "Please enter your phone number!",
                    },
                    { pattern: phoneRegex, message: "Invalid phone number!" },
                  ]}
                >
                  <Input
                    size="large"
                    maxLength={10}
                    placeholder="Phone Number"
                  />
                </Form.Item>
                <Form.Item
                  label="City/Province"
                  name="city"
                  rules={[
                    {
                      required: true,
                      message: "Please select a city/province!",
                    },
                  ]}
                >
                  <Select
                    size="large"
                    placeholder="City/Province"
                    showSearch
                    onChange={handleCityChange}
                    filterOption={(input, option) =>
                      typeof option?.children === "string" &&
                      (option.children as string)
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    value={form.getFieldValue("city")}
                  >
                    {provinces.map((p) => (
                      <Select.Option key={p.code} value={p.name}>
                        {p.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item
                  label="District"
                  name="district"
                  rules={[
                    { required: true, message: "Please select a district!" },
                  ]}
                >
                  <Select
                    size="large"
                    placeholder="District"
                    showSearch
                    onChange={handleDistrictChange}
                    disabled={districts.length === 0}
                    filterOption={(input, option) =>
                      typeof option?.children === "string" &&
                      (option.children as string)
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    value={form.getFieldValue("district")}
                  >
                    {districts.length > 0 ? (
                      districts.map((d) => (
                        <Select.Option key={d.code} value={d.name}>
                          {d.name}
                        </Select.Option>
                      ))
                    ) : (
                      <Select.Option value="" disabled>
                        {form.getFieldValue("city") && !districts.length
                          ? "No data"
                          : "Select city/province first"}
                      </Select.Option>
                    )}
                  </Select>
                </Form.Item>
                <Form.Item
                  label="Ward/Commune"
                  name="ward"
                  rules={[
                    {
                      required: true,
                      message: "Please select a ward/commune!",
                    },
                  ]}
                >
                  <Select
                    size="large"
                    placeholder="Ward/Commune"
                    showSearch
                    disabled={wards.length === 0}
                    filterOption={(input, option) =>
                      typeof option?.children === "string" &&
                      (option.children as string)
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    value={form.getFieldValue("ward")}
                  >
                    {wards.length > 0 ? (
                      wards.map((w) => (
                        <Select.Option key={w.code} value={w.name}>
                          {w.name}
                        </Select.Option>
                      ))
                    ) : (
                      <Select.Option value="" disabled>
                        {form.getFieldValue("district") && !wards.length
                          ? "No data"
                          : "Select district first"}
                      </Select.Option>
                    )}
                  </Select>
                </Form.Item>
                <Form.Item
                  label="Detailed Address"
                  name="address"
                  rules={[
                    {
                      required: true,
                      message: "Please enter the detailed address!",
                    },
                    {
                      min: 5,
                      message: "Address must be at least 5 characters!",
                    },
                  ]}
                >
                  <Input.TextArea
                    rows={2}
                    size="large"
                    placeholder="Detailed Address"
                    className="user-profile-textarea"
                  />
                </Form.Item>
                <Form.Item
                  label="Address Type"
                  name="addressType"
                  initialValue="Nhà riêng"
                >
                  <Radio.Group>
                    <Radio.Button value="Nhà riêng">Nhà riêng</Radio.Button>
                    <Radio.Button value="Văn phòng">Văn phòng</Radio.Button>
                  </Radio.Group>
                </Form.Item>
                <Form.Item
                  label="Set as default address"
                  name="isDefault"
                  valuePropName="checked"
                  style={{ marginBottom: 16 }}
                >
                  <Switch
                    checked={form.getFieldValue("isDefault")}
                    onChange={(checked) =>
                      form.setFieldValue("isDefault", checked)
                    }
                  />
                </Form.Item>
                <Form.Item style={{ marginTop: 24 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                    }}
                  >
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
            </Card>
          ) : addresses.length === 0 ? (
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
                <HomeOutlined style={{ fontSize: 64, color: "#7494ec" }} />
              </div>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: 22,
                  marginBottom: 8,
                  color: "#222",
                }}
              >
                You have no saved addresses.
              </div>
              <div style={{ color: "#888", marginBottom: 24 }}>
                Add a new address to use for shipping.
              </div>
            </div>
          ) : (
            //scroll nếu > 2
            <div
              style={
                addresses.length > 2
                  ? { maxHeight: 400, overflowY: "auto" }
                  : undefined
              }
            >
              {addresses.map((addr, idx) => (
                <Card
                  key={addr._id || idx}
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
                        Address
                        <span style={{ marginLeft: 8, color: "#aaa" }}>
                          #{idx + 1}
                        </span>
                      </b>
                    </div>
                    {addr.isDefault && (
                      <span
                        style={{
                          background: "#1677ff",
                          color: "#fff",
                          borderRadius: 4,
                          padding: "2px 10px",
                          fontWeight: 500,
                          fontSize: 13,
                        }}
                      >
                        Default
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      margin: "8px 0 4px 0",
                      color: "#222",
                      fontWeight: 500,
                    }}
                  >
                    {addr.name}{" "}
                    <span style={{ color: "#888", fontWeight: 400 }}>
                      | {addr.phone}
                    </span>
                  </div>
                  <div style={{ marginBottom: 8, color: "#444" }}>
                    {getFullAddress(addr)}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <span
                      style={{
                        background: "#f5f5f5",
                        borderRadius: 4,
                        padding: "2px 8px",
                        marginRight: 8,
                      }}
                    >
                      <HomeOutlined style={{ marginRight: 4 }} />
                      {addr.addressType}
                    </span>
                  </div>
                  <div>
                    <Button
                      type="link"
                      onClick={() => handleEdit(addr)}
                      style={{ padding: 0, marginRight: 8 }}
                    >
                      Edit
                    </Button>
                    <Button
                      type="link"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleDelete(addr._id!)}
                      style={{ padding: 0, marginRight: 8 }}
                    >
                      Delete
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default AddressBook;
