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
import zxcvbn from "zxcvbn";
import { validate } from "email-validator";
import { Alert, Snackbar } from "@mui/material";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Signup() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [validation, setValidation] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [passwordStrength, setPasswordStrength] = useState(null);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState("success");

  const navigate = useRouter();

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
    const result = zxcvbn(event.target.value);
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

    if (!firstName || !lastName || !username || !email || !password) {
      setAlertMessage("Please fill in all fields");
      setAlertSeverity("error");
      setAlertOpen(true);
      return;
    }

    if (!validate(email)) {
      setAlertMessage("Please enter a valid email address");
      setAlertSeverity("error");
      setAlertOpen(true);
      return;
    }

    if (password.length < 8) {
      setAlertMessage("Password must be at least 8 characters long");
      setAlertSeverity("error");
      setAlertOpen(true);
      return;
    }

    if (passwordStrength && passwordStrength.score < 2) {
      setAlertMessage(
        "Password is too weak. Please choose a stronger password"
      );
      setAlertSeverity("error");
      setAlertOpen(true);
      return;
    }

    try {
      // Use the correct endpoint based on backend structure
      const res = await axios.post(
        `http://localhost:8080/auth/signup`,
        {
          firstName,
          lastName,
          username,
          email,
          password,
        },
        {
          withCredentials: true,
        }
      );

      if (res.data.message === "User created successfully") {
        setAlertMessage("Signed up successfully! Logging you in...");
        setAlertSeverity("success");
        setAlertOpen(true);

        // Clear form
        setFirstName("");
        setLastName("");
        setUsername("");
        setEmail("");
        setPassword("");
        setPasswordStrength(null);
        setPasswordErrors([]);

        // Automatically log in the user after successful signup
        try {
          const loginRes = await axios.post(
            `http://localhost:8080/auth/login`,
            {
              username,
              password,
            },
            {
              withCredentials: true,
            }
          );

          if (
            loginRes.data.message === "Login successful" &&
            loginRes.data.user &&
            loginRes.data.user.id
          ) {
            // Redirect to the user's dashboard
            setTimeout(() => {
              navigate.push(`/DashBoard/${loginRes.data.user.id}`);
            }, 2000);
          } else {
            // Fallback: redirect to login page
            setTimeout(() => {
              navigate.push("/LogIn");
            }, 2000);
          }
        } catch (loginError) {
          console.error("Auto-login failed:", loginError);
          // If auto-login fails, redirect to login page
          setTimeout(() => {
            navigate.push("/LogIn");
          }, 2000);
        }
      } else {
        throw new Error("Signup failed - unexpected response");
      }
    } catch (error) {
      console.error(error);

      let errorMessage = "Sign-up failed";

      if (error.response) {
        if (error.response.status === 404) {
          errorMessage =
            "Signup endpoint not found. Please check your backend configuration.";
        } else if (error.response.status === 409) {
          errorMessage =
            "Username or email already exists. Please choose different credentials.";
        } else if (error.response.status === 400) {
          errorMessage = error.response.data.error || "Invalid input data";
        } else if (error.response.status === 500) {
          errorMessage = "Server error. Please try again later.";
        } else {
          errorMessage = error.response.data.error || "Sign-up failed";
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
                    passwordErrors.length > 0 || passwordStrength?.score < 2
                  }
                  type="submit"
                  className="w-full"
                >
                  Sign Up
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
