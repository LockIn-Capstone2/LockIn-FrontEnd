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
import axios from "axios";
import React, { useState } from "react";
import Link from "next/link";
import { Alert, Snackbar } from "@mui/material";
import { useRouter } from "next/navigation";

function LogIn() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState("success");

  const navigate = useRouter();

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
      const response = await axios.post(
        `http://localhost:8080/api/auth/login`,
        {
          username,
          password,
        },
        {
          withCredentials: true,
        }
      );

      console.log(response.data);

      if (response.data.message === "Login successful") {
        setAlertMessage("Log In successfully! Redirecting...");
        setAlertSeverity("success");
        setAlertOpen(true);

        // Get the user data from the response to extract the user ID
        if (response.data.user && response.data.user.id) {
          // Redirect to the user's specific dashboard
          setTimeout(() => {
            navigate.push(`/DashBoard/${response.data.user.id}`);
          }, 1500);
        } else {
          // Fallback to home if no user data
          setTimeout(() => {
            navigate.push("/");
          }, 1500);
        }
      } else {
        throw new Error("Login failed - unexpected response");
      }
    } catch (error) {
      console.log("error", error.response);

      let errorMessage = "Log In failed";

      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = "Invalid username or password";
        } else if (error.response.status === 400) {
          errorMessage = error.response.data.error || "Invalid input";
        } else if (error.response.status === 500) {
          errorMessage = "Server error. Please try again later.";
        } else {
          errorMessage = error.response.data.error || "Log In failed";
        }
      } else if (error.request) {
        errorMessage =
          "Unable to connect to server. Please check your connection.";
      } else {
        errorMessage = error.message || "An unexpected error occurred";
      }

      setAlertMessage(errorMessage);
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
