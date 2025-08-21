"use client";

import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

  // Check if user is authenticated on app load
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      console.log("Checking authentication...");
      const response = await axios.get(`${API_BASE}/auth/me`, {
        withCredentials: true,
      });

      console.log("Auth check response:", response.data);

      if (response.data.user) {
        setUser(response.data.user);
        console.log("User authenticated:", response.data.user);
      }
    } catch (error) {
      console.log("Authentication check failed:", error.response?.status);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      console.log("Attempting login for:", username);
      const response = await axios.post(
        `${API_BASE}/auth/login`,
        { username, password },
        { withCredentials: true }
      );

      console.log("Login response:", response.data);

      if (response.data.user) {
        setUser(response.data.user);
        return { success: true, user: response.data.user };
      } else {
        return {
          success: false,
          error: "Login failed - no user data received",
        };
      }
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        error: error.response?.data?.error || "Login failed",
      };
    }
  };

  const logout = async () => {
    try {
      await axios.post(
        `${API_BASE}/auth/logout`,
        {},
        { withCredentials: true }
      );
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
      setUser(null); // Clear user even if logout fails
    }
  };

  const updateUser = async (userData) => {
    try {
      console.log("Updating user profile:", userData);

      // Fix: Use the correct API endpoint with /api prefix
      const endpoint = `${API_BASE}/auth/update-profile`;

      console.log("Using endpoint:", endpoint);

      const response = await axios.put(endpoint, userData, {
        withCredentials: true,
      });

      if (response.data.user) {
        console.log("Profile updated successfully:", response.data.user);
        setUser(response.data.user);
        return { success: true, user: response.data.user };
      } else {
        return {
          success: false,
          error: "Profile update failed - no user data received",
        };
      }
    } catch (error) {
      console.error("Profile update error:", error);
      return {
        success: false,
        error: error.response?.data?.error || "Profile update failed",
      };
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    updateUser,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
