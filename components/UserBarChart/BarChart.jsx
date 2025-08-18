"use client";

import { TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
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
  "Weekly study activity bar chart showing daily study volume";

// Transform chart data for weekly activity
const transformWeeklyData = (chartData) => {
  if (!chartData || !Array.isArray(chartData)) return [];

  return chartData.map((item) => ({
    day: item.day,
    flashcards: item.flashcardCount,
    quizzes: item.quizCount,
    total: item.flashcardCount + item.quizCount,
  }));
};

export function WeeklyActivityBarChart({ chartData }) {
  const transformedData = transformWeeklyData(chartData);

  // Calculate weekly totals and trends
  const weeklyTotals = transformedData.reduce(
    (acc, item) => ({
      flashcards: acc.flashcards + item.flashcards,
      quizzes: acc.quizzes + item.quizzes,
      total: acc.total + item.total,
    }),
    { flashcards: 0, quizzes: 0, total: 0 }
  );

  // Find most active day
  const mostActiveDay = transformedData.reduce((max, item) =>
    item.total > max.total ? item : max
  );

  // Calculate trend (comparing recent vs older days)
  const recentData = transformedData.slice(-3);
  const olderData = transformedData.slice(-6, -3);

  const recentAvg =
    recentData.reduce((sum, item) => sum + item.total, 0) / recentData.length;
  const olderAvg =
    olderData.reduce((sum, item) => sum + item.total, 0) / olderData.length;

  const trendPercentage =
    olderAvg > 0 ? (((recentAvg - olderAvg) / olderAvg) * 100).toFixed(1) : 0;
  const isTrendingUp = trendPercentage > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Study Activity</CardTitle>
        <CardDescription>
          Daily study volume over the last 7 days
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={transformedData}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                }}
              />
              <Legend />
              <Bar
                dataKey="flashcards"
                fill="#3b82f6"
                name="Flashcards"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="quizzes"
                fill="#10b981"
                name="Quizzes"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          {isTrendingUp ? "Trending up" : "Trending down"} by{" "}
          {Math.abs(trendPercentage)}% this week
          <TrendingUp
            className={`h-4 w-4 ${isTrendingUp ? "" : "rotate-180"}`}
          />
        </div>
        <div className="text-muted-foreground leading-none">
          {weeklyTotals.total} total activities • Most active:{" "}
          {mostActiveDay.day}
        </div>
      </CardFooter>
    </Card>
  );
}
