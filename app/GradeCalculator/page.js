"use client";

import React, { useState, useEffect } from "react";
import axios from "axios"
import { useRouter } from "next/navigation";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  CalculatorSelect,
  CalculatorSelectTrigger,
  CalculatorSelectContent,
  CalculatorSelectItem,
  CalculatorSelectValue,
} from "@/components/ui/calculator-select";

function GradeCalculator() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editTitle = searchParams.get("editTitle");

  // States for session title and the list of assignments
  const [title, setTitle] = useState("");
  const [assignments, setAssignments] = useState([
    { assignment_type: "", assignment_name: "", grade: "", weight: "" },
  ]);

  // state to hold calculated final grade
  const [finalGrade, setFinalGrade] = useState(null);

  // fetch assignments for editing if editTitle is present
  useEffect(() => {
    if (editTitle) {
      const fetchSessionAssignments = async () => {
        try {
          const userId = 1; // hardcoded for now
          const response = await axios.get(`/api/Calculator/grade-entries/${userId}`);
          // filter assignments matching this session title
          const sessionAssignments = response.data.filter(
            (a) => a.session_title === editTitle
          );
          if (sessionAssignments.length) {
            setTitle(editTitle);
            // map assignments and include `id` for PUT updates
            setAssignments(
              sessionAssignments.map((a) => ({
                id: a.id,
                assignment_type: a.assignment_type,
                assignment_name: a.assignment_name,
                grade: a.assignment_grade,
                weight: a.assignment_weight,
              }))
            );
          }
        } catch (error) {
          console.error("Error fetching session for edit:", error);
        }
      };
      fetchSessionAssignments();
    }
  }, [editTitle]);

  // handle general changes to assignment fields
  const handleChange = (index, field, value) => {
    // Restrict values between 0-100 for grade & weight
    if (field === "grade" || field === "weight") {
      const num = Number(value);
      if (num < 0 || num > 100) return;
    }

    // Make a copy of the assignments, change the specific field in row, then update state
    const updated = [...assignments];
    updated[index][field] = value;
    setAssignments(updated);
  };

  // Add a new blank assignment row
  const addAssignment = () => {
    setAssignments([
      ...assignments,
      { assignment_type: "", assignment_name: "", grade: "", weight: "" },
    ]);
  };

  // Remove an assignment row
  const removeAssignment = (index) => {
    const updated = assignments.filter((_, i) => i !== index);
    setAssignments(updated);
  };

  // Calculate final grade
  const calculateGrade = () => {
    // Compute total weight of assignments to verify it does not exceed 100%
    const totalWeight = assignments.reduce(
      (sum, a) => sum + (parseFloat(a.weight) || 0),
      0
    );

    if (totalWeight > 100) {
      setFinalGrade("Error: Total weight cannnot exceed 100%");
      return;
    }

    // Calculate total worth of individual assignment
    const total = assignments.reduce(
      (totals, currentAssignment) => {
        const grade = parseFloat(currentAssignment.grade);
        const weight = parseFloat(currentAssignment.weight);
        if (!isNaN(grade) && !isNaN(weight)) {
          totals.total += (grade * weight) / 100;
          totals.weightSum += weight;
        }
        return totals;
      },
      { total: 0, weightSum: 0 }
    );

    // Display result or prompt user for valid inputs
    if (total.weightSum === 0) {
      setFinalGrade("Please add valid grade and weight inputs");
    } else {
      setFinalGrade(`${total.total.toFixed(2)}%`);
    }
  };

  // Save current session (total & calculated grade)
  const handleSaveSession = async () => {
    // Check if title is empty or if there are no assignments defined
    if (!title || !finalGrade) {
      alert("Please calculate grade and provide a sesssion title before saving");
      return;
    }

    try {
      for (let assignment of assignments) {
        if (assignment.id) {
          await axios.put(`/api/Calculator/grade-entry/${editId}`, {
            assignment_grade: assignment.grade,
            assignment_weight: assignment.weight,
          });
        } else {
          // POST axios call to new-grade-entry. "If not editing, then create new session
            await axios.post("/api/Calculator/new-grade-entry", {
              user_id: 1,
              assignment_type: assignment.assignment_type,
              assignment_name: assignment.assignment_name,
              assignment_grade: assignment.grade,
              assignment_weight: assignment.weight,
            });
          }
        }

       // After saving to db, redirect user to saved sessions page
       router.push("/CalculatorSessions");
      } catch(error) {
        console.error("Error saving grade entry: ", error);
        alert("Failed to save session. Please try again.");
      }
    };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Card className="w-full max-w-4xl p-6">
        <CardHeader className="text-center">
          <CardTitle>Grade Calculator</CardTitle>
          <CardDescription>
            Enter grades and weights to calculate your grade.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Input
            type="text"
            placeholder="Session Title (e.g., Math 101)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          {/*Column headers */}
          <div className="grid grid-cols-5 gap-4 font-bold text-center">
            <span>Assignment Type</span>
            <span>Assignment Name</span>
            <span>Grade (%)</span>
            <span>Weight (%)</span>
            {/* trash icon column */}
            <span></span>
          </div>

          {/* Assignment rows */}
          {assignments.map((assignments, index) => (
            <div key={index} className="grid grid-cols-5 gap-4 items-center">
              {/* Assignment type dropdown */}
              <CalculatorSelect
                value={assignments.assignment_type}
                onValueChange={(value) =>
                  handleChange(index, "assignment_type", value)
                }
              >
                <CalculatorSelectTrigger>
                  <CalculatorSelectValue placeholder="Select Type" />
                </CalculatorSelectTrigger>
                <CalculatorSelectContent>
                  <CalculatorSelectItem value="Homework">Homework</CalculatorSelectItem>
                  <CalculatorSelectItem value="Quiz">Quiz</CalculatorSelectItem>
                  <CalculatorSelectItem value="Midterm">Midterm</CalculatorSelectItem>
                  <CalculatorSelectItem value="Final Exam">Final Exam</CalculatorSelectItem>
                </CalculatorSelectContent>
              </CalculatorSelect>

              {/* Assignment Name Input*/}
              <Input
                type="text"
                placeholder="Assignment Name"
                value={assignments.assignment_name}
                onChange={(e) =>
                  handleChange(index, "assignment_name", e.target.value)
                }
              />

              {/* Grade Input */}
              <Input
                type="number"
                placeholder="Grade (%)"
                value={assignments.grade}
                onChange={(e) => handleChange(index, "grade", e.target.value)}
              />

              {/* Weight Input */}
              <Input
                type="number"
                placeholder="Weight (%)"
                value={assignments.weight}
                onChange={(e) => handleChange(index, "weight", e.target.value)}
              />

              {/* Delete assignment button */}
              <button
                type="button"
                onClick={() => removeAssignment(index)}
                className="text-red-500 hover:text-red-700"
              >
                {/* trash icon */}
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
            </div>
          ))}
        </CardContent>

        {/* Footer with action buttons */}
        <CardFooter className="flex gap-4 justify-start flex-1">
          <Button type="button" onClick={addAssignment}>
            Add Another
          </Button>
          <Button onClick={calculateGrade}>Calculate Grade</Button>
          <Button onClick={handleSaveSession}>Save Session</Button>
          <Button onClick={() => router.push("/CalculatorSessions")}>View Saved Sessions</Button>
        </CardFooter>

          {/* Display calculated grade */}
          {finalGrade && (
            <p className="text-lg font-bold text-center mt-4">Final Grade: {finalGrade}</p>
          )}
      </Card>
    </div>
  );
}

export default GradeCalculator;
