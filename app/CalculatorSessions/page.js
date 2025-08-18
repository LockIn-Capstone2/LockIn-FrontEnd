"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

function SavedSessions() {
  const router = useRouter();

  // State to store all saved sessions and user search text
  const [sessions, setSessions] = useState([]);
  const [search, setSearch] = useState("");

  // axios call to fetch user's saved sessions
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const userId = 1;
        const response = await axios.get(`/api/Calculator/grade-entries/${userId}`);
        setSessions(response.data);
      } catch (error) {
        console.error("Error fetching saved sessions: ", error);
        setSessions([]);
      }
    };

    fetchSessions();
  }, []);

  // Function to delete a session via ID
  const handleDelete = (id) => {
    // remove session from the session list
    const updated = sessions.filter((session) => session.id !== id);
    setSessions(updated);
    localStorage.setItem("savedSessions", JSON.stringify(updated));
  };

  // Filter sessions based on user search text input (note: case-insensitive)
  const filteredSessions = sessions.filter((session) =>
    session.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col items-center bg-white p-6">
      {/* Page Title and "Save Session" button aligned right*/}
      <div className= "relative w-full max-w-4xl mb-4 h-10 flex items-center">
        <h1 className="absolute left-1/2 -translate-x-1/2 text-2xl font-bold">Saved Sessions</h1>
        <Button className="ml-auto" onClick={() => router.push("/GradeCalculator")}>New Session</Button>
      </div>

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
              {/* Show calculated grade within session card*/}
              {session.finalGrade && (
                <p className="text-sm font-semibold">
                  Final Grade: {session.finalGrade}
                </p>
              )}
            </div>

            {/* Edit and Delete button via trash icon*/}
            <CardFooter className="flex gap-3">
              <Button variant="outline">Edit</Button>

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

export default SavedSessions;