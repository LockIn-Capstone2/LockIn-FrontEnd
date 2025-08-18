"use client";

import { useEffect, useState } from "react";
import { Gauge, gaugeClasses } from "@mui/x-charts/Gauge";
import { useTheme } from "next-themes";

export default function StreakCounter({ streakData }) {
  const { theme } = useTheme(); // next-themes hook
  const isDark = theme === "dark";

  // Debug logging
  useEffect(() => {
    console.log("StreakCounter received data:", streakData);
  }, [streakData]);

  // Handle null/undefined streakData
  const currentStreak = streakData?.currentStreak || 0;
  const longestStreak = streakData?.longestStreak || 0;
  const nextMilestone = streakData?.nextMilestone || null;

  console.log("Processed streak values:", {
    currentStreak,
    longestStreak,
    nextMilestone,
    isDark,
  });

  // Show loading state if data is not available
  if (!streakData) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h3 className="text-sm font-bold mb-1">Streak</h3>
        <div className="flex items-center justify-center">
          <div className="text-lg font-bold text-gray-400">Loading...</div>
        </div>
      </div>
    );
  }

  // Calculate max value for gauge (use longest streak or 30 as minimum)
  const maxValue = Math.max(longestStreak, currentStreak, 30);

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h3 className="text-sm font-bold mb-1">Streak</h3>
      <Gauge
        value={currentStreak}
        valueMax={maxValue}
        startAngle={-110}
        endAngle={110}
        sx={{
          width: "100%",
          height: "100%",
          "& .MuiGauge-valueText": {
            fontSize: 12,
            stroke: isDark ? "#52b202" : "#1976d2", // Green for dark, blue for light
          },
          [`& .${gaugeClasses.valueArc}`]: {
            fill: isDark ? "#52b202" : "#1976d2", // Gauge arc color
          },
          [`& .${gaugeClasses.referenceArc}`]: {
            fill: isDark ? "#374151" : "#e5e7eb", // Background arc color
          },
        }}
        text={({ value, valueMax }) => `${value} / ${valueMax}`}
      />
      {nextMilestone && (
        <div className="text-xs text-gray-500 mt-1">
          Next: {nextMilestone} days
        </div>
      )}
      {/* Debug info - remove in production */}
      <div className="text-xs text-gray-400 mt-1">Longest: {longestStreak}</div>
    </div>
  );
}
