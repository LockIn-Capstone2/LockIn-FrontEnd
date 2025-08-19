"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import zxcvbn from "zxcvbn";
import { validate } from "email-validator";

import { Alert } from "@mui/material";
import api from "@/utils/api";
import { useAuth } from "@/contexts/AuthContext";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Signup() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [validation, setValidation] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [passwordStrength, setPasswordStrength] = useState(null);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState("success");

  const navigate = useRouter();

  const router = useRouter();
  const { checkAuthStatus } = useAuth();

  const handleFirstNameChange = (event) => {
    setFirstName(event.target.value);
  };

  const handleLastNameChange = (event) => {
    setLastName(event.target.value);
  };

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
    if (event.target.value.length < 8) {
      setPasswordErrors(["Password must be greater than 8 characters"]);
    } else {
      setPasswordErrors([]);
    }
    const result = zxcvbn(password);
    setPasswordStrength(result);
  };

  const handleUsernameChange = (event) => {
    const newValue = event.target.value;
    setUsername(newValue);
  };

  const passwordStrengthBar = (passwordStrength) => {
    switch (passwordStrength.score) {
      case 0:
        return <p className="font-[poppins] text-[red]">Very Weak</p>;

      case 1:
        return <p className="font-[poppins] text-[yellow]">Weak</p>;

      case 2:
        return <p className="font-[poppins] text-[orange]">Moderate</p>;

      case 3:
        return <p className="font-[poppins] text-[#a3e635]">Strong</p>;

      case 4:
        return <p className="font-[poppins] text-[#16a34a]">Very Strong</p>;
      default:
        return null;
    }
  };

  const handleSignUp = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setValidation(false);

    // Validate email
    if (!validate(email)) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    // Validate password strength
    if (passwordErrors.length > 0 || passwordStrength?.score < 2) {
      setError("Please choose a stronger password");
      setLoading(false);
      return;
    }

    console.log("📝 Starting signup process...");
    console.log("🔍 Signup data:", {
      firstName,
      lastName,
      username,
      email,
      password: "***",
    });

    try {
      console.log("🌐 Making signup request to backend...");
      const response = await api.post("/auth/signup", {
        firstName,
        lastName,
        username,
        email,
        password,
      });


      console.log("✅ Signup successful:", response.data);
      setValidation(true);

      // Update auth context
      await checkAuthStatus();

      // Redirect to dashboard after a brief delay to show success message
      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch (error) {
      console.error("❌ Signup error:", error);
      console.error("🔍 Error details:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config,
      });
      setError(
        error.response?.data?.error || "Signup failed. Please try again."
      );
    } finally {
      setLoading(false);
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
            <CardTitle>Create an Account</CardTitle>
            <CardDescription>
              Enter your Info below to Create your account
            </CardDescription>
            <CardAction>
              <Button variant="link">
                <Link href="/LogIn">Log In</Link>
              </Button>
            </CardAction>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSignUp}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="firstname">First Name</Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="John"
                    required
                    onChange={handleFirstNameChange}
                    value={firstName}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="lastname">Last Name</Label>
                  <Input
                    id="lastname"
                    type="text"
                    placeholder="Doe"
                    required
                    onChange={handleLastNameChange}
                    value={lastName}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="tonysoprano12"
                    required
                    onChange={handleUsernameChange}
                    value={username}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    onChange={handleEmailChange}
                    value={email}
                  />
                </div>

                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    {/* <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                    >
                    Forgot your password?
                    </a> */}
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter a password: "
                    required
                    onChange={handlePasswordChange}
                    value={password}
                  />
                </div>

                <Input
                  id="password"
                  type="password"
                  placeholder="Enter a password: "
                  required
                  onChange={handlePasswordChange}
                  value={password}
                />
              </div>
              {passwordStrength ? (
                <div className="font-[poppins]">
                  <div>{passwordStrengthBar(passwordStrength)}</div>
                  {passwordStrength.feedback.suggestions.length ? (
                    <p>
                      Feedback:{" "}
                      {passwordStrength.feedback.suggestions.join(", ")}
                    </p>
                  ) : null}
                </div>
              ) : null}
              <Button
                disabled={
                  passwordErrors.length > 0 ||
                  passwordStrength?.score < 2 ||
                  loading
                }
                type="submit"
                className="w-full"
              >
                {loading ? "Signing Up..." : "Sign Up"}
              </Button>
              {error && <Alert severity="error">{error}</Alert>}
              {validation && (
                <Alert severity="success">
                  Signed up successfully! Redirecting...
                </Alert>
              )}
              <Button
                variant="outline"
                className="w-full"
                onClick={() =>
                  (window.location.href = "http://localhost:8080/auth/google")
                }
                type="button"
              >
                Sign Up with Google
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>

  );
}
