import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080",
  withCredentials: true, // ESSENTIAL: Sends cookies with every request
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log(
      `🚀 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`
    );
    if (config.data) {
      console.log("📦 Request data:", config.data);
    }
    return config;
  },
  (error) => {
    console.error("Request Error:", error);
    return Promise.reject(error);
  }
);

// Optional: Add request/response interceptors for global error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.status} Response:`, response.data);
    return response;
  },
  (error) => {
    console.error(
      `❌ ${error.response?.status || "Network"} Error:`,
      error.response?.data || error.message
    );

    if (error.response?.status === 401 || error.response?.status === 403) {
      // Token expired or invalid - redirect to login
      console.log("🔒 Token expired or invalid, redirecting to login...");
      if (typeof window !== "undefined") {
        window.location.href = "/LogIn";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
