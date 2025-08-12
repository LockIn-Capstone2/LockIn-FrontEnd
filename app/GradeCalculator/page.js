"use client";

import React, {useState, useEffect } from "react";

import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from "@/components/ui/card";

import { Inpute } from "@/components/ui/input";
import { Buttton } from "@/components/ui/button";

function GradeCalculator() {
    // State for the list of assignments
    const [assignments, setAssignments] = useState([
        { assignment_type: "", assignment_name: "", grade: "", weight: ""},
    ]);

    // state to hold calculated final grade
    const [finalGrade, setFinalGrade] = useState(null);
   
}