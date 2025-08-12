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
import { validate } from "email-validator";
import { Alert } from "@mui/material";
import axios from "axios";
import Link from "next/link";

export default function Signup() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [validation, setValidation] = useState(false);

  const handleFirstNameChange = (event) => {
    const newValue = event.target.value;
    setFirstName(newValue);
  };

  const handleLastNameChange = (event) => {
    const newValue = event.target.value;
    setLastName(newValue);
  };

  const handleEmailChange = (event) => {
    const newValue = event.target.value;
    setEmail(newValue);
  };

  const handlePasswordChange = (event) => {
    const newValue = event.target.value;
    setPassword(newValue);
  };

  const handleUsernameChange = (event) => {
    const newValue = event.target.value;
    setUsername(newValue);
  };

  const handleSignUp = async (event) => {
    event.preventDefault();
    if (validate(email)) {
      setValidation(true);
    }

    try {
      const res = await axios.post(`http://localhost:8080/auth/signup`, {
        firstName,
        lastName,
        username,
        email,
        password,
      });
    } catch (error) {
      console.error("error:", error);
    }
  };

  return (
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
              <Button type="submit" className="w-full">
                Sign Up
              </Button>
              {validation ? (
                <Alert severity="success">Signed up successfully</Alert>
              ) : null}
              <Button variant="outline" className="w-full">
                Sign Up with Google
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
