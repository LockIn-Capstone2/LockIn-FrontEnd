// API Configuration
export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

// Environment check
export const isDevelopment = process.env.NODE_ENV === "development";
export const isProduction = process.env.NODE_ENV === "production";
