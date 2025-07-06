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
