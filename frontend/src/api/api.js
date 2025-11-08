import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3000/api",
  timeout: 10000,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const loginUser = (data) => API.post("/auth/login", data);
export const registerUser = (data) => API.post("/auth/register", data);

export const getProducts = () => API.get("/products");
export const placeOrder = (data) => API.post("/orders", data);
export const cancelOrder = (id) => API.post(`/orders/${id}/cancel`);
export const getUserOrders = (userId) =>
  API.get(`/orders/user/${userId}/orders`);
export const getVendorDashboard = (vendorId) =>
  API.get(`/vendor/${vendorId}/dashboard`);

export default API;
