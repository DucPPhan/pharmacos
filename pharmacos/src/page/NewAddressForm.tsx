import React, { useState, useEffect } from "react";
import { Form, Input, Select, Radio, Switch, Button, message } from "antd";
import { SaveOutlined } from "@ant-design/icons";
import { AddressInfo } from "./profile/AddressBook";
import { createCustomerAddress, AddressData } from "@/lib/api";
import "./address-form.css";
const { Option } = Select;

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

const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;

interface NewAddressFormProps {
  onSave: (addressData: AddressData) => void;
  onCancel: () => void;
  initialValues?: Partial<AddressData>;
}

const NewAddressForm: React.FC<NewAddressFormProps> = ({
  onSave,
  onCancel,
  initialValues,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [userProfile, setUserProfile] = useState<{ name?: string; phone?: string }>(
    {}
  );

  useEffect(() => {
    fetch("https://provinces.open-api.vn/api/?depth=3")
      .then((res) => res.json())
      .then((data: Province[]) => {
        setProvinces(data);
        console.log("Provinces loaded:", data.length);
      })
      .catch((error) => {
        console.error("Failed to fetch provinces:", error);
        message.error("Failed to load province/city data");
      });
  }, []);

  // Fetch user profile to prefill form
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch(
          "http://localhost:10000/api/customers/profile",
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setUserProfile({
            name: data.name || data.fullName || "",
            phone: data.phone || data.phoneNumber || "",
          });

          // Only set fields if they aren't already set by initialValues
          if (!initialValues?.name && !initialValues?.phone) {
            form.setFieldsValue({
              name: data.name || data.fullName || "",
              phone: data.phone || data.phoneNumber || "",
            });
          }
        }
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
      }
    };

    fetchUserProfile();
  }, [form]);

  useEffect(() => {
    if (initialValues) {
      const formValues: Partial<AddressData> = { ...initialValues };
      // Always use "Home" or "Office"
      if (formValues.addressType !== "Home" && formValues.addressType !== "Office") {
        formValues.addressType = "Home";
      }
      form.setFieldsValue(formValues);

      if (initialValues.city && provinces.length > 0) {
        const province = provinces.find((p) => p.name === initialValues.city);
        if (province) {
          setDistricts(province.districts);

          if (initialValues.district) {
            const district = province.districts.find(
              (d) => d.name === initialValues.district
            );
            if (district) {
              setWards(district.wards);
            }
          }
        }
      }
    } else if (userProfile.name || userProfile.phone) {
      form.setFieldsValue({
        name: userProfile.name || form.getFieldValue("name") || "",
        phone: userProfile.phone || form.getFieldValue("phone") || "",
        addressType: "Home",
        isDefault: false,
      });
    }
  }, [initialValues, form, provinces, userProfile]);

  const handleCityChange = (city: string) => {
    console.log("City selected:", city);
    form.setFieldsValue({ district: undefined, ward: undefined });
    const province = provinces.find((p) => p.name === city);
    if (province) {
      console.log("Districts found:", province.districts.length);
      setDistricts(province.districts);
    } else {
      console.log("No province found for:", city);
      setDistricts([]);
    }
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

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // Map form values to AddressData format with strict enum handling
      const addressData: AddressData = {
        name: values.name,
        phone: values.phone,
        city: values.city,
        district: values.district,
        ward: values.ward,
        address: values.address,
        addressType:
          values.addressType === "Home" || values.addressType === "Office"
            ? values.addressType
            : "Home",
        isDefault: values.isDefault || false,
      };

      console.log("Submitting address with addressType:", addressData.addressType);

      try {
        // Use the new API function
        await createCustomerAddress(addressData);

        // Call onSave with the form data
        onSave(addressData);
        message.success("Đã thêm địa chỉ mới!");
      } catch (error: any) {
        console.error("Failed to add address:", error);
        message.error(
          error.message || "Không thể thêm địa chỉ mới. Vui lòng thử lại!"
        );
      } finally {
        setLoading(false);
      }
    } catch (error) {
      console.error("Form validation failed:", error);
    }
  };

  return (
    <div className="py-4 new-address-form-container">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Add New Address</h3>
      </div>

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          addressType: "Home",
          isDefault: false,
          name: userProfile.name || "",
          phone: userProfile.phone || "",
          ...initialValues,
        }}
        className="address-form"
      >
        <Form.Item
          label="Recipient's Name"
          name="name"
          rules={[
            { required: true, message: "Please enter recipient's name!" },
          ]}
        >
          <Input size="large" placeholder="Recipient's Name" />
        </Form.Item>

        <Form.Item
          label="Phone Number"
          name="phone"
          rules={[
            { required: true, message: "Please enter phone number!" },
            { pattern: phoneRegex, message: "Invalid phone number!" },
          ]}
        >
          <Input size="large" maxLength={10} placeholder="Phone Number" />
        </Form.Item>

        <Form.Item
          label="Province/City"
          name="city"
          rules={[{ required: true, message: "Please select province/city!" }]}
        >
          <Select
            size="large"
            placeholder="Select province/city"
            showSearch
            onChange={handleCityChange}
            filterOption={(input, option) =>
              option?.children
                ? String(option.children)
                  .toLowerCase()
                  .includes(input.toLowerCase())
                : false
            }
            popupClassName="address-dropdown"
            listHeight={200}
            getPopupContainer={(triggerNode) =>
              triggerNode.parentElement || document.body
            }
          >
            {provinces.map((p) => (
              <Option key={p.code} value={p.name}>
                {p.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="District"
          name="district"
          rules={[{ required: true, message: "Please select district!" }]}
        >
          <Select
            size="large"
            placeholder="Select district"
            showSearch
            onChange={handleDistrictChange}
            disabled={districts.length === 0}
            filterOption={(input, option) =>
              option?.children
                ? String(option.children)
                  .toLowerCase()
                  .includes(input.toLowerCase())
                : false
            }
            popupClassName="address-dropdown"
            listHeight={200}
            getPopupContainer={(triggerNode) =>
              triggerNode.parentElement || document.body
            }
          >
            {districts.length > 0 ? (
              districts.map((d) => (
                <Option key={d.code} value={d.name}>
                  {d.name}
                </Option>
              ))
            ) : (
              <Option value="" disabled>
                {form.getFieldValue("city")
                  ? "No data available"
                  : "Please select province/city first"}
              </Option>
            )}
          </Select>
        </Form.Item>

        <Form.Item
          label="Ward"
          name="ward"
          rules={[{ required: true, message: "Please select ward!" }]}
        >
          <Select
            size="large"
            placeholder="Select ward"
            showSearch
            disabled={wards.length === 0}
            filterOption={(input, option) =>
              option?.children
                ? String(option.children)
                  .toLowerCase()
                  .includes(input.toLowerCase())
                : false
            }
            popupClassName="address-dropdown"
            listHeight={200}
            getPopupContainer={(triggerNode) =>
              triggerNode.parentElement || document.body
            }
          >
            {wards.length > 0 ? (
              wards.map((w) => (
                <Option key={w.code} value={w.name}>
                  {w.name}
                </Option>
              ))
            ) : (
              <Option value="" disabled>
                {form.getFieldValue("district")
                  ? "No data available"
                  : "Please select district first"}
              </Option>
            )}
          </Select>
        </Form.Item>

        <Form.Item
          label="Detailed Address"
          name="address"
          rules={[
            { required: true, message: "Please enter detailed address!" },
            { min: 5, message: "Address must be at least 5 characters!" },
          ]}
        >
          <Input.TextArea
            rows={2}
            size="large"
            placeholder="House number, street name, building, etc."
          />
        </Form.Item>

        <Form.Item label="Address Type" name="addressType">
          <Radio.Group>
            <Radio.Button value="Home">Home</Radio.Button>
            <Radio.Button value="Office">Office</Radio.Button>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          label="Set as Default Address"
          name="isDefault"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <div className="flex justify-end gap-3 mt-6">
          <Button onClick={onCancel}>Cancel</Button>
          <Button
            type="primary"
            onClick={handleSubmit}
            loading={loading}
            icon={<SaveOutlined />}
            style={{ background: "#7494ec" }}
          >
            Save Address
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default NewAddressForm;

