import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.PROD
    ? "https://formbuilder-pd4l.onrender.com/api"
    : "/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request interceptor â€” attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor â€” handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    alert("403 Error: " + JSON.stringify(error.response?.data)); return Promise.reject(error);
  },
);

export default api;
