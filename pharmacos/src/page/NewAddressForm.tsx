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

  useEffect(() => {
    fetch("https://provinces.open-api.vn/api/?depth=3")
      .then((res) => res.json())
      .then((data: Province[]) => {
        setProvinces(data);
        console.log("Provinces loaded:", data.length);
      })
      .catch((error) => {
        console.error("Failed to fetch provinces:", error);
        message.error("Không thể tải dữ liệu tỉnh/thành phố");
      });
  }, []);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);

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
    }
  }, [initialValues, form, provinces]);

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

      // Map form values to AddressData format
      const addressData: AddressData = {
        name: values.name,
        phone: values.phone,
        city: values.city,
        district: values.district,
        ward: values.ward,
        address: values.address,
        addressType: values.addressType || "Nhà riêng",
        isDefault: values.isDefault || false,
      };

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
        <h3 className="text-lg font-medium">Thêm địa chỉ mới</h3>
      </div>

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          addressType: "Nhà riêng",
          isDefault: false,
          ...initialValues,
        }}
        className="address-form"
      >
        <Form.Item
          label="Họ tên người nhận"
          name="name"
          rules={[
            { required: true, message: "Vui lòng nhập họ tên người nhận!" },
          ]}
        >
          <Input size="large" placeholder="Họ tên người nhận" />
        </Form.Item>

        <Form.Item
          label="Số điện thoại"
          name="phone"
          rules={[
            { required: true, message: "Vui lòng nhập số điện thoại!" },
            { pattern: phoneRegex, message: "Số điện thoại không hợp lệ!" },
          ]}
        >
          <Input size="large" maxLength={10} placeholder="Số điện thoại" />
        </Form.Item>

        <Form.Item
          label="Tỉnh/Thành phố"
          name="city"
          rules={[{ required: true, message: "Vui lòng chọn tỉnh/thành phố!" }]}
        >
          <Select
            size="large"
            placeholder="Chọn tỉnh/thành phố"
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
          label="Quận/Huyện"
          name="district"
          rules={[{ required: true, message: "Vui lòng chọn quận/huyện!" }]}
        >
          <Select
            size="large"
            placeholder="Chọn quận/huyện"
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
                  ? "Không có dữ liệu"
                  : "Vui lòng chọn tỉnh/thành phố trước"}
              </Option>
            )}
          </Select>
        </Form.Item>

        <Form.Item
          label="Phường/Xã"
          name="ward"
          rules={[{ required: true, message: "Vui lòng chọn phường/xã!" }]}
        >
          <Select
            size="large"
            placeholder="Chọn phường/xã"
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
                  ? "Không có dữ liệu"
                  : "Vui lòng chọn quận/huyện trước"}
              </Option>
            )}
          </Select>
        </Form.Item>

        <Form.Item
          label="Địa chỉ chi tiết"
          name="address"
          rules={[
            { required: true, message: "Vui lòng nhập địa chỉ chi tiết!" },
            { min: 5, message: "Địa chỉ phải có ít nhất 5 ký tự!" },
          ]}
        >
          <Input.TextArea
            rows={2}
            size="large"
            placeholder="Số nhà, tên đường, tòa nhà,..."
          />
        </Form.Item>

        <Form.Item label="Loại địa chỉ" name="addressType">
          <Radio.Group>
            <Radio.Button value="Nhà riêng">Nhà riêng</Radio.Button>
            <Radio.Button value="Văn phòng">Văn phòng</Radio.Button>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          label="Đặt làm địa chỉ mặc định"
          name="isDefault"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <div className="flex justify-end gap-3 mt-6">
          <Button onClick={onCancel}>Hủy bỏ</Button>
          <Button
            type="primary"
            onClick={handleSubmit}
            loading={loading}
            icon={<SaveOutlined />}
            style={{ background: "#7494ec" }}
          >
            Lưu địa chỉ
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default NewAddressForm;
