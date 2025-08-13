"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import React from "react";
import { LineChart } from "@mui/x-charts";
import { useParams } from "next/navigation";
import "./style.module.css";
function ChartData() {
  const [studyData, setStudyData] = useState([]);
  const { userId } = useParams();

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
    <div className="flex h-screen ">
      {studyData.length > 0 ? (
        <LineChart
          dataset={formattedData}
          xAxis={[
            {
              dataKey: "created_at",
              scaleType: "time",
              label: "Created At",
              valueFormatter: (date) =>
                date instanceof Date
                  ? date.toLocaleDateString() + " " + date.toLocaleTimeString()
                  : String(date),
            },
          ]}
          yAxis={[{ label: "Duration (in minutes)" }]}
          series={[{ dataKey: "duration" }]}
          height={300}
          width={300}
        />
      ) : (
        <div className="flex text-center justify-center align-center font-[poppins] m-auto ">
          Loading
        </div>
      )}
    </div>
  );
}

export default ChartData;
