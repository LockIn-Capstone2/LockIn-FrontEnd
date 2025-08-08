"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import React from "react";
import { LineChart } from "@mui/x-charts";
// import { useParams } from "next/navigation";
// import { useRouter } from "next/router";
function Data() {
  const [studyData, setStudyData] = useState([]);

  // const router = useRouter();
  // const { id } = router.query;

  const userId = 1;

  const getData = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/data/${userId}`
      );
      const result = response.data;
      setStudyData(result);
      console.log("data:", result);
    } catch (error) {
      console.error("error:", error);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  return <>hello</>;
}

export default Data;
