/**
 * A wrapper for the native `fetch` function to automatically handle
 * token attachment and authentication errors (401, 403).
 * @param url The API endpoint URL
 * @param options Fetch options (method, body, headers, etc.)
 * @returns A Promise that resolves with the JSON data from the API
 */
export async function apiFetch(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token");

  // Automatically attach the Authorization header if a token exists
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  const response = await fetch(url, { ...options, headers });

  // Check for authentication errors
  if (response.status === 401 || response.status === 403) {
    // The token is invalid or has expired
    // Clear user credentials
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("cart"); // Also clear the cart

    // Redirect to the login page and reload to reset the application state
    window.location.href = "/login";

    // Throw an error to prevent further processing
    throw new Error("Your session has expired. Please log in again.");
  }

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: response.statusText }));
    throw new Error(
      errorData.message || "An error occurred. Please try again."
    );
  }

  // Return the data if there are no errors
  // Some APIs (like DELETE) may not return a body, so we need to check
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  }

  return; // Return undefined if there's no JSON body
}

// API endpoints for favorites
const API_URL = "http://localhost:10000/api";
export const favoritesApi = {
  // Get all favorites for the logged-in user
  getFavorites: async () => {
    try {
      const response = await apiFetch(`${API_URL}/favorites`);
      return response;
    } catch (error) {
      console.error("Error fetching favorites:", error);
      throw error;
    }
  },

  // Add a product to favorites
  addToFavorites: async (productId: string) => {
    try {
      const response = await apiFetch(`${API_URL}/favorites/${productId}`, {
        method: "POST",
      });
      return response;
    } catch (error) {
      console.error("Error adding to favorites:", error);
      throw error;
    }
  },

  // Remove a product from favorites
  removeFromFavorites: async (productId: string) => {
    try {
      const response = await apiFetch(`${API_URL}/favorites/${productId}`, {
        method: "DELETE",
      });
      return response;
    } catch (error) {
      console.error("Error removing from favorites:", error);
      throw error;
    }
  },

  // Check if a product is in favorites
  checkFavoriteStatus: async (productId: string) => {
    try {
      const response = await apiFetch(`${API_URL}/favorites`);
      if (response && response.data) {
        return response.data.some(
          (fav: any) =>
            fav.product._id === productId || fav.product.id === productId
        );
      }
      return false;
    } catch (error) {
      console.error("Error checking favorite status:", error);
      return false;
    }
  },
};

// --- CART API ---
export const cartApi = {
  getCart: async () => apiFetch(`${API_URL}/cart`),
  addItem: async (productId: string, quantity: number) =>
    apiFetch(`${API_URL}/cart/items`, {
      method: "POST",
      body: JSON.stringify({ productId, quantity }),
    }),
  updateItem: async (id: string, quantity: number) =>
    apiFetch(`${API_URL}/cart/items/${id}`, {
      method: "PUT",
      body: JSON.stringify({ quantity }),
    }),
  removeItem: async (id: string) =>
    apiFetch(`${API_URL}/cart/items/${id}`, { method: "DELETE" }),
  clearCart: async () => apiFetch(`${API_URL}/cart`, { method: "DELETE" }),
};

// --- ORDER API ---
export const orderApi = {
  createOrder: async (orderData: any) =>
    apiFetch(`${API_URL}/orders`, {
      method: "POST",
      body: JSON.stringify(orderData),
    }),
  getMyOrders: async () => apiFetch(`${API_URL}/orders/my-orders`),
  getOrderById: async (id: string) => apiFetch(`${API_URL}/orders/${id}`),
};

// --- PAYMENT API ---
export const paymentApi = {
  createPayment: async (orderId: string) =>
    apiFetch(`${API_URL}/payments/create`, {
      method: "POST",
      body: JSON.stringify({ orderId }),
    }),
  getPayment: async (paymentId: string) =>
    apiFetch(`${API_URL}/payments/${paymentId}`),
};

export const staffAnalyticsApi = {
  getSales: async (startDate?: string, endDate?: string) => {
    let url = `${API_URL}/staff/analytics/sales`;
    const params = [];
    if (startDate) params.push(`startDate=${encodeURIComponent(startDate)}`);
    if (endDate) params.push(`endDate=${encodeURIComponent(endDate)}`);
    if (params.length) url += "?" + params.join("&");
    return apiFetch(url);
  },
  getProducts: async () => apiFetch(`${API_URL}/staff/analytics/products`),
  getInventory: async () => apiFetch(`${API_URL}/staff/analytics`),
};

// Address API functions
export interface AddressData {
  name: string; // Họ tên người nhận
  phone: string; // Số điện thoại
  city: string; // Tỉnh/Thành phố
  district: string; // Quận/Huyện
  ward: string; // Phường/Xã
  address: string; // Địa chỉ chi tiết
  addressType: "Home" | "Office"; // Loại địa chỉ - MUST match backend enum exactly
  isDefault?: boolean; // Đặt làm địa chỉ mặc định
}

export interface AddressResponse {
  _id: string;
  name: string;
  phone: string;
  city: string;
  district: string;
  ward: string;
  address: string;
  addressType: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// Lấy danh sách địa chỉ của customer
export const getCustomerAddresses = async (): Promise<AddressResponse[]> => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Please log in to view addresses");
  }

  const response = await fetch(`${API_URL}/customers/addresses`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Unable to fetch address list");
  }

  return response.json();
};

// Helper function to ensure valid addressType values
export function ensureValidAddressType(addressType: any): "Home" | "Office" {
  if (addressType === "Home" || addressType === "Office") {
    return addressType;
  }
  const addressStr = String(addressType || "").toLowerCase();
  if (addressStr.includes("office") || addressStr === "office" || addressStr.includes("văn phòng") || addressStr === "văn phòng") {
    return "Office";
  }
  if (addressStr.includes("home") || addressStr === "home" || addressStr.includes("nhà riêng") || addressStr === "nhà riêng") {
    return "Home";
  }
  return "Home"; // Default to Home
}

// Validation function to ensure valid address type values
const validateAddressData = (data: AddressData): AddressData => {
  if (data.addressType !== "Home" && data.addressType !== "Office") {
    return {
      ...data,
      addressType: "Home",
    };
  }
  return data;
};

// Add new address
export const createCustomerAddress = async (
  addressData: AddressData
): Promise<ApiResponse<AddressResponse>> => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Please log in to add address");
  }

  // Create a sanitized copy to ensure the correct format
  const sanitizedData = {
    ...addressData,
    addressType: ensureValidAddressType(addressData.addressType),
  };

  console.log("Sending sanitized address data:", sanitizedData);

  try {
    const response = await fetch(`${API_URL}/customers/addresses`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sanitizedData),
    });

    // Read text response first for debugging
    const responseText = await response.text();
    console.log(`API response (${response.status}):`, responseText);

    let result;
    try {
      result = JSON.parse(responseText);
    } catch (e) {
      throw new Error(`Invalid JSON response: ${responseText}`);
    }

    if (!response.ok) {
      throw new Error(result.message || "Unable to add address");
    }

    return result;
  } catch (error: any) {
    console.error("Error in createCustomerAddress:", error);
    throw new Error(error.message || "Unable to add address");
  }
};

// Update address
export const updateCustomerAddress = async (
  id: string,
  addressData: AddressData
): Promise<ApiResponse<AddressResponse>> => {
  // Similar validation
  const validatedData = validateAddressData(addressData);

  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Please log in to update address");
  }

  const response = await fetch(`${API_URL}/customers/addresses/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(validatedData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Unable to update address");
  }

  return response.json();
};

// Delete address
export const deleteCustomerAddress = async (
  addressId: string
): Promise<{ message: string }> => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Please log in to delete address");
  }

  const response = await fetch(`${API_URL}/customers/addresses/${addressId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Unable to delete address");
  }

  return response.json();
};
