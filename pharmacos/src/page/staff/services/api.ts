import axios from "axios";

const API_URL = "http://localhost:10000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Staff API endpoints
export const staffApi = {
  // Products
  getProducts: () => api.get("/staff/products"),
  getProduct: (id: string) => api.get(`/staff/products/${id}`),
  updateProductStock: (id: string, data: { stock: number }) => 
    api.patch(`/staff/products/${id}`, data),
  
  // Orders
  getOrders: () => api.get("/staff/orders"),
  updateOrderStatus: (id: string, data: { status: string }) => 
    api.patch(`/staff/orders/${id}/status`, data),
  
  // Analytics
  getSalesAnalytics: () => api.get("/staff/analytics/sales"),
  getProductAnalytics: () => api.get("/staff/analytics/products"),
  getInventoryAnalytics: () => api.get("/staff/analytics/inventory"),
  
  // Profile
  getProfile: () => api.get("/staff/profile"),
  updateProfile: (data: any) => api.patch("/staff/profile", data),
  changePassword: (data: { currentPassword: string; newPassword: string }) => 
    api.put("/staff/change-password", data),
  
  // Brands
  getBrands: () => api.get("/staff/brands"),
  createBrand: (data: { name: string; description?: string }) => 
    api.post("/staff/brands", data),
  
  // Categories
  getCategories: () => api.get("/staff/categories"),
  createCategory: (data: { name: string; description?: string }) => 
    api.post("/staff/categories", data),
};

export default api;