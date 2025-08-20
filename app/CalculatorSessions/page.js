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
  const [grades, setGrades] = useState([]);
  const [search, setSearch] = useState("");

  const fetchGrades = async () => {
    try {
      const userId = 1;
      const response = await axios.get(
        `http://localhost:8080/api/grade-calculator/grade-entries/${userId}`
      );
      console.log(response.data);
      setGrades(response.data);
    } catch (error) {
      console.error("Error fetching saved sessions: ", error);
      // setSessions([]);
    }
  };
  useEffect(() => {
    fetchGrades();
  }, []);

  // axios function to delete a session via ID
  const handleDelete = async (id) => {
    try {
      await axios.delete(
        `http://localhost:8080/api/grade-calculator/grade-entry/${id}`
      );
      // remove session from the session list
      const updated = grades.filter((grade) => grade.id !== id);
      setGrades(updated);
    } catch (error) {
      console.error("Error deleting session: ", error);
      alert("Failed to delete session. Please try again.");
    }
  };

  // handle edit by redirecting user to Grade Calculator via entry ID
  const handleEdit = (id) => {
    router.push(`/GradeCalculator?editId=$[id]`);
  };

  // Filter assignments based on user search text input (note: case-insensitive)
  const filteredGrades = grades.filter((grade) =>
    grade.assignment_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col items-center bg-white p-6">
      {/* Page Title and "Save Session" button aligned right*/}
      <div className="relative w-full max-w-4xl mb-4 h-10 flex items-center">
        <h1 className="absolute left-1/2 -translate-x-1/2 text-2xl font-bold">
          Saved Assignments
        </h1>
        <Button
          className="ml-auto"
          onClick={() => router.push("/GradeCalculator")}
        >
          New Assignment
        </Button>
      </div>

      {/* Search Input */}
      <Input
        type="text"
        placeholder="Search by assignment title"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 w-full max-w-lg"
      />

      {/* List of assignments */}
      <div className="w-full max-w-4xl space-y-4">
        {filteredGrades.map((grade) => (
          <Card
            key={grade.id}
            className="p-4 shadow-md rounded-2xl hover:shadow-lg transition"
          >
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800 text-center">
                {grade.assignment_name}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600 space-y-1 text-center">
              <p>
                <span className="font-medium">Assignment Type:</span>{" "}
                {grade.assignment_type ?? "N/A"}
              </p>
              <p>
                <span className="font-medium">Grade:</span>{" "}
                {grade.assignment_grade ?? "N/A"}
              </p>
              <p>
                <span className="font-medium">Weight:</span>{" "}
                {grade.assignment_weight ?? "N/A"}%
              </p>
            </CardContent>
            <CardFooter className="flex justify-end gap-3">
              {/* <Button
                variant="outline"
                size="sm"
                onClick={() => handleEdit(grade.id)}
              >
                Edit
              </Button> */}
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(grade.id)}
              >
                Delete
              </Button>
            </CardFooter>
          </Card>
        ))}

        {grades.length === 0 && (
          <p className="text-center text-gray-500">No grades found.</p>
        )}
      </div>
    </div>
  );
}

export default SavedSessions;
