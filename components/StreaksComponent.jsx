"use client";

import { useEffect, useState } from "react";
import { Gauge, gaugeClasses } from "@mui/x-charts/Gauge";
import { useTheme } from "next-themes";

export default function StreakCounter() {
  const [streak, setStreak] = useState(0);
  const { theme } = useTheme(); // next-themes hook

  useEffect(() => {
    async function fetchStreak() {
      try {
        const res = await fetch("http://localhost:8080/api/sessions/streak/1");
        const data = await res.json();
        setStreak(data.streak);
      } catch (err) {
        console.error("Failed to fetch streak:", err);
      }
    }

    fetchStreak();
  }, []);

  const isDark = theme === "dark";

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h3 className="text-sm font-bold mb-1">Streak</h3>
      <Gauge
        value={streak}
        valueMax={30}
        startAngle={-110}
        endAngle={110}
        sx={{
          width: "100%",
          height: "100%",
          "& .MuiGauge-valueText": {
            fontSize: 12,
            stroke: "#52b202", // set value / valueMax text to green
          },
          [`& .${gaugeClasses.valueArc}`]: {
            fill: "#52b202", // gauge arc color
          },
        }}
        text={({ value, valueMax }) => `${value} / ${valueMax}`}
      />
    </div>
  );
}
