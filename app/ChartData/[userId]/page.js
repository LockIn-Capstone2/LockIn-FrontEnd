"use client";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import React from "react";
import { LineChart } from "@mui/x-charts";
import { useParams } from "next/navigation";
import "./style.module.css";

function ChartData() {
  const [studyData, setStudyData] = useState([]);
  const { userId } = useParams();

  const getData = useCallback(async () => {
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
  }, [userId]);

  useEffect(() => {
    getData();
  }, [getData]);

  function durationToMinutes(durationStr) {
    const [hours, minutes, seconds] = durationStr.split(":").map(Number);
    return hours * 60 + minutes + seconds / 60;
  }

  const formattedData = studyData.map((item) => ({
    ...item,
    formattedDate: item.formattedDate,
    duration: durationToMinutes(item.duration),
  }));

  return (
    <div className="flex h-screen bg-[white] ">
      {studyData.length > 0 ? (
        <LineChart
          dataset={formattedData}
          xAxis={[
            {
              dataKey: "formattedDate",
              scaleType: "point",
              label: "Created At",
            },
          ]}
          yAxis={[{ label: "Duration (in minutes)" }]}
          series={[{ dataKey: "duration" }]}
          height={500}
          width={700}
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
