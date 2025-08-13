"use client";

import React, { useState, useEffect } from "react";

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
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Select } from "radix-ui";

function GradeCalculator() {
  // State for the list of assignments
  const [assignments, setAssignments] = useState([
    { assignment_type: "", assignment_name: "", grade: "", weight: "" },
  ]);

  // state to hold calculated final grade
  const [finalGrade, setFinalGrade] = useState(null);

  // handle general changes to assignment fields
  const handleChange = (index, field, value) => {
    // Ensure values between 0-100 for grade & weight
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
    setAssignments([...assignments, {assignment_type: "", assignment_name: "", grade: "", weight: ""},
    ]);
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

    // Calculate total worth if individual assignment
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
      { total: 0, weightsum: 0 }
    );

    // Display result or prompt user for valid inputs
    if (total.weightsum === 0) {
        setFinalGrade("Please add valid grade and weight inputs");
    } else {"{total.total}%"
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
        <Card className="w-full max-w 4xl p-6">
            <CardHeader>
                <CardTitle>Grade Caclulator</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
                {/*Column headers */}
                <div className="grid grid-cols-4 gap-4 font-bold">
                    <span>Assignment Type</span>
                    <span>Assignment Name</span>
                    <span>Grade (%)</span>
                    <span>Weight (%)</span>
                </div>

                {/* Assignment rows */}
                {assignments.map((assignments, index) => (
                    <div key={index} className="grid grid-cols-4-gap-4">

                        {/* Assignment type dropdown */}
                        <select
                            value = {assignments.assignment_type}
                            onValueChange = {(value) =>
                            handleChange(index, "assignment_type", value)
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Homework">Homework</SelectItem>
                                <SelectItem value="Quiz">Quiz</SelectItem>
                                <SelectItem value="Final">Final</SelectItem>
                            </SelectContent>
                        </select>

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
                        onChange={(e) =>
                            handleChange(index, "grade", e.target.value)
                        }
                        />

                        {/* Weight Input */}
                        <Input
                        type="number"
                        placeholder="Weight (%)"
                        value={assignments.weight}
                        onChange={(e) =>
                            handleChange(index, "weight", e.target.value)
                    }
                    />
                    </div>
                ))}

                {/* Add another assignment button */}
                <Button type="button" onClick={addAssignment}>
                    Add Another
                </Button>
            </CardContent>

            <CardFooter className="flex flex-col items-start gap-2">
                <Button onClick={calculateGrade}>Calculate Grade</Button>

                {/* Display calculated final grade */}
                {finalGrade && (
                    <p className="text-lg font-bold">Final Grade: {finalGrade}</p>
                )}
            </CardFooter>
        </Card>
    </div>
  );
}

export default GradeCalculator;