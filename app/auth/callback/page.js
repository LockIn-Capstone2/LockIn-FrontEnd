"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function AuthCallback() {
  const router = useRouter();
  const { checkAuthStatus } = useAuth();

  useEffect(() => {
    const handleAuthCallback = async () => {
      // Check if this is a calendar OAuth callback
      const urlParams = new URLSearchParams(window.location.search);
      const isCalendarCallback =
        urlParams.get("calendar") === "success" ||
        window.location.href.includes("calendar");

      // Give the backend time to set the JWT cookie
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Check authentication status
      await checkAuthStatus();

      // Redirect based on callback type
      if (isCalendarCallback) {
        // Calendar OAuth callback - redirect to Tasks with success parameter
        router.push("/Tasks?calendar_success=permissions_granted");
      } else {
        // Regular login callback - redirect to home page
        router.push("/");
      }
    };

    handleAuthCallback();
  }, [checkAuthStatus, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4">Completing authentication...</p>
      </div>
    </div>
  );
}
