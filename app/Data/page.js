"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import React from "react";
import { LineChart } from "@mui/x-charts";
import { duration } from "@mui/material";
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

  function durationToMinutes(durationStr) {
    const [hours, minutes, seconds] = durationStr.split(":").map(Number);
    return hours * 60 + minutes + seconds / 60;
  }

  const formattedData = studyData.map((item) => ({
    ...item,
    created_at: new Date(item.created_at),
    duration: durationToMinutes(item.duration),
  }));

  return (
    <div>
      {studyData.length > 0 ? (
        <LineChart
          dataset={formattedData}
          xAxis={[
            {
              dataKey: "created_at",
              scaleType: "time",
              valueFormatter: (date) =>
                date instanceof Date
                  ? date.toLocaleDateString() + " " + date.toLocaleTimeString()
                  : String(date),
            },
          ]}
          series={[{ dataKey: "duration" }]}
          height={300}
          width={300}
        />
      ) : (
        <p>loading</p>
      )}
    </div>
  );
}

export default Data;
