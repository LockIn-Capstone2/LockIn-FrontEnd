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
  }, []);

  // Function to delete a session via ID
  const handleDelete = (id) => {
    // remove session from the session list
    const updated = sessions.filter((session) => session.id !== id);
    setSessions(updated);
  };

  // Filter sessions based on user search text input (note: case-insensitive)
  const filteredSessions = sessions.filter((session) =>
    session.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col items-center bg-white p-6">
      {/* Page Title*/}
      <h1 className="text-2xl font-bold mb-4">Saved Sessions</h1>

      {/* Search Input */}
      <Input
        type="text"
        placeholder="Search by session title"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 w-full max-w-lg"
      />

      {/* List of filtered sessions */}
      <div className="w-full max-w-4xl space-y-4">
        {filteredSessions.map((session) => (
          <Card
            key={session.id}
            className="p-4 flex justify-between items-center"
          >
            <div>
              <CardHeader>
                <CardTitle>{session.title}</CardTitle>
              </CardHeader>

              {/* Assignments within session card */}
              <CardContent>
                {session.assignments.map((a, i) => (
                  <div key={i} className="flex gap-4">
                    <span>{a.assignment_type}</span>
                    <span>{a.assignment_name}</span>
                    <span>{a.grade} %</span>
                    <span>{a.weight}%</span>
                  </div>
                ))}
              </CardContent>
            </div>

            {/* Delete button and trash icon*/}
            <CardFooter>
              <button
                type="button"
                onClick={() => handleDelete(session.id)}
                className="text-red-500 hover:text-red-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4m-4 0a1 1 0 00-1 1v1h6V4a1 1 0 00-1-1m-4 0h4"
                  />
                </svg>
              </button>
            </CardFooter>
          </Card>
        ))}

        {/* Message to user when no sessions match their text search*/}
        {filteredSessions.length === 0 && (
          <p className="text-center text-gray-500">No sessions found.</p>
        )}
      </div>
    </div>
  );
}
