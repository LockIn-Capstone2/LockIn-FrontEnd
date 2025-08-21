"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import React, { useState } from "react";
import Link from "next/link";
import { Alert, Snackbar } from "@mui/material";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

function LogIn() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState("success");

  const navigate = useRouter();
  const { login } = useAuth();

  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    if (!username || !password) {
      setAlertMessage("Please enter both username and password");
      setAlertSeverity("error");
      setAlertOpen(true);
      return;
    }

    try {
      setAlertMessage("Logging in...");
      setAlertSeverity("info");
      setAlertOpen(true);

      const result = await login(username, password);

      if (result.success) {
        setAlertMessage("Log In successful! Redirecting to dashboard...");
        setAlertSeverity("success");
        setAlertOpen(true);

        console.log("Login successful, user:", result.user);
        console.log(
          "Redirecting to dashboard:",
          `/DashBoard/${result.user.id}`
        );

        // Redirect to the user's dashboard
        setTimeout(() => {
          console.log("Executing redirect now...");
          try {
            navigate.push(`/DashBoard/${result.user.id}`);
          } catch (navError) {
            console.error("Navigation error, using fallback:", navError);
            window.location.href = `/DashBoard/${result.user.id}`;
          }
        }, 1500);
      } else {
        setAlertMessage(result.error || "Login failed");
        setAlertSeverity("error");
        setAlertOpen(true);
      }
    } catch (error) {
      console.error("Login error:", error);
      setAlertMessage("Login failed. Please try again.");
      setAlertSeverity("error");
      setAlertOpen(true);
    }
  };

  return (
    <>
      <Snackbar
        open={alertOpen}
        autoHideDuration={3000}
        onClose={() => setAlertOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setAlertOpen(false)}
          severity={alertSeverity}
          sx={{ width: "100%" }}
        >
          {alertMessage}
        </Alert>
      </Snackbar>
      <div className="bg-[url('/Shapes.png')] bg-cover bg-center bg-no-repeat min-h-screen flex items-center justify-center bg-white">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Login to your account</CardTitle>
            <CardDescription>
              Enter your email below to login to your account
            </CardDescription>
            <CardAction>
              <Button variant="link">
                <Link href="/SignUp">Sign Up</Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="johndoe123"
                    required
                    value={username}
                    onChange={handleUsernameChange}
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <a
                      href="#"
                      className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                    >
                      Forgot your password?
                    </a>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="********"
                    required
                    value={password}
                    onChange={handlePasswordChange}
                  />
                </div>
                <Button type="submit" className="w-full">
                  Login
                </Button>
                <Button variant="outline" className="w-full">
                  Login with Google
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
export default LogIn;
