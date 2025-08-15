"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function SavedSessions() {
  // State to store all saved sessions and user search text
  const [sessions, setSessions] = useState([]);
  const [search, setSearch] = useState("");

  // Utilize local storage to load saved sessions
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("savedSessions"));
    setSessions(saved);
  }, [])
}