import axios from "axios";

/**
 * Pre-configured Axios instance for communicating with the backend API.
 * Includes request interceptor for JWT authorization and response interceptor for unified error handling.
 */
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Request Interceptor: Attach JWT token from localStorage to Authorization header
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Extract data payload and handle global errors (e.g. 401 Unauthorized)
axiosClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear expired or invalid token
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    return Promise.reject(
      error.response?.data || {
        success: false,
        message: error.message || "Network error occurred",
        data: null,
      }
    );
  }
);

export default axiosClient;
