import axios from "axios";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Important for handling cookies/sessions
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add debugging info
    console.log("Making API request to:", config.baseURL + config.url);

    // You can add auth tokens here if needed
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log("API response success:", response.status, response.config.url);
    return response;
  },
  (error) => {
    // Handle common errors
    console.error("API Error:", {
      status: error.response?.status,
      url: error.config?.url,
      data: error.response?.data,
      message: error.message,
    });

    if (error.response?.status === 401) {
      // Handle unauthorized access
      console.log(
        "Unauthorized access - check if backend is running and endpoint exists"
      );
    } else if (error.response?.status === 404) {
      console.log("API endpoint not found - check backend routes");
    } else if (error.response?.status >= 500) {
      console.log("Server error - check backend logs");
    } else if (error.code === "ECONNREFUSED") {
      console.log("Connection refused - backend server may not be running");
    }

    return Promise.reject(error);
  }
);

export default api;
