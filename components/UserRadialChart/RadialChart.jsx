"use client";

import { TrendingUp } from "lucide-react";
import {
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const description =
  "Streak progress radial chart showing current streak vs target";

// Transform streak data for radial chart
const transformStreakData = (streakData) => {
  if (!streakData) return [];

  const currentStreak = streakData.currentStreak || 0;
  const longestStreak = streakData.longestStreak || 0;

  // Calculate next milestone (next multiple of 7)
  const nextMilestone = Math.ceil(currentStreak / 7) * 7;
  const progressPercentage =
    nextMilestone > 0 ? Math.round((currentStreak / nextMilestone) * 100) : 0;

  return [
    {
      name: "Current Streak",
      value: currentStreak,
      fill: "#3b82f6",
      progress: progressPercentage,
    },
    {
      name: "Longest Streak",
      value: longestStreak,
      fill: "#10b981",
      progress: 100, // Always show full bar for longest streak
    },
  ];
};

export function StreakProgressRadialChart({ streakData }) {
  const transformedData = transformStreakData(streakData);

  const currentStreak = streakData?.currentStreak || 0;
  const longestStreak = streakData?.longestStreak || 0;
  const nextMilestone = Math.ceil(currentStreak / 7) * 7;
  const progressPercentage =
    nextMilestone > 0 ? Math.round((currentStreak / nextMilestone) * 100) : 0;

  // Calculate trend (comparing current vs longest)
  const trendPercentage =
    longestStreak > 0
      ? (((currentStreak - longestStreak) / longestStreak) * 100).toFixed(1)
      : 0;
  const isTrendingUp = currentStreak > longestStreak;

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Streak Progress</CardTitle>
        <CardDescription>
          Current streak progress towards next milestone
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <div className="mx-auto aspect-square max-h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              data={transformedData}
              innerRadius={30}
              outerRadius={110}
              startAngle={180}
              endAngle={0}
            >
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                }}
                formatter={(value, name) => [value, name]}
              />
              <RadialBar
                dataKey="progress"
                background
                cornerRadius={10}
                fill="#e5e7eb"
              />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>

        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {currentStreak}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">days</div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          {isTrendingUp ? "New record!" : "Keep going!"}{" "}
          {Math.abs(trendPercentage)}% vs longest
          <TrendingUp
            className={`h-4 w-4 ${isTrendingUp ? "" : "rotate-180"}`}
          />
        </div>
        <div className="text-muted-foreground leading-none">
          {progressPercentage}% to next milestone ({nextMilestone} days)
        </div>
      </CardFooter>
    </Card>
  );
}
