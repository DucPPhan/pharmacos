import React, { useState } from "react";
import { createCustomerAddress, AddressData } from "../lib/api";

interface AddressFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const AddressForm: React.FC<AddressFormProps> = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState<AddressData>({
    name: "",
    phone: "",
    city: "",
    district: "",
    ward: "",
    address: "",
    addressType: "Nhà riêng",
    isDefault: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await createCustomerAddress(formData);
      console.log("Address created:", result);

      if (onSuccess) {
        onSuccess();
      }

      // Reset form
      setFormData({
        name: "",
        phone: "",
        city: "",
        district: "",
        ward: "",
        address: "",
        addressType: "Nhà riêng",
        isDefault: false,
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-6 bg-white rounded-lg shadow-md"
    >
      <h3 className="text-lg font-semibold mb-4">Thêm địa chỉ mới</h3>

      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Họ tên người nhận <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          className="w-full p-2 border border-gray-300 rounded-md"
          placeholder="Nhập họ tên người nhận"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Số điện thoại <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
          className="w-full p-2 border border-gray-300 rounded-md"
          placeholder="0778138889"
          pattern="[0-9]{10,11}"
          required
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tỉnh/Thành phố <span className="text-red-500">*</span>
          </label>
          <select
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          >
            <option value="">Chọn tỉnh/thành phố</option>
            <option value="Thành phố Hà Nội">Thành phố Hà Nội</option>
            <option value="Thành phố Hồ Chí Minh">Thành phố Hồ Chí Minh</option>
            <option value="Thành phố Đà Nẵng">Thành phố Đà Nẵng</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quận/Huyện <span className="text-red-500">*</span>
          </label>
          <select
            name="district"
            value={formData.district}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          >
            <option value="">Chọn quận/huyện</option>
            <option value="Quận Cầu Giấy">Quận Cầu Giấy</option>
            <option value="Quận Ba Đình">Quận Ba Đình</option>
            <option value="Quận Hoàn Kiếm">Quận Hoàn Kiếm</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phường/Xã <span className="text-red-500">*</span>
          </label>
          <select
            name="ward"
            value={formData.ward}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          >
            <option value="">Chọn phường/xã</option>
            <option value="Phường Dịch Vọng">Phường Dịch Vọng</option>
            <option value="Phường Trung Hòa">Phường Trung Hòa</option>
            <option value="Phường Mai Dịch">Phường Mai Dịch</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Địa chỉ chi tiết <span className="text-red-500">*</span>
        </label>
        <textarea
          name="address"
          value={formData.address}
          onChange={handleInputChange}
          className="w-full p-2 border border-gray-300 rounded-md"
          placeholder="Số nhà, tên đường..."
          rows={3}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Loại địa chỉ
        </label>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="addressType"
              value="Nhà riêng"
              checked={formData.addressType === "Nhà riêng"}
              onChange={handleInputChange}
              className="mr-2"
            />
            Nhà riêng
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="addressType"
              value="Văn phòng"
              checked={formData.addressType === "Văn phòng"}
              onChange={handleInputChange}
              className="mr-2"
            />
            Văn phòng
          </label>
        </div>
      </div>

      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            name="isDefault"
            checked={formData.isDefault}
            onChange={handleInputChange}
            className="mr-2"
          />
          Đặt làm địa chỉ mặc định
        </label>
      </div>

      <div className="flex gap-4 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            disabled={loading}
          >
            Hủy bỏ
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Đang lưu..." : "Lưu địa chỉ"}
        </button>
      </div>
    </form>
  );
};

export default AddressForm;
