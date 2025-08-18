"use client";

import { TrendingUp } from "lucide-react";
import {
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
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
  "Study distribution pie chart showing flashcards vs quizzes";

// Transform chart data for study distribution
const transformDistributionData = (chartData) => {
  if (!chartData || !Array.isArray(chartData)) return [];

  const totalFlashcards = chartData.reduce(
    (sum, item) => sum + item.flashcardCount,
    0
  );
  const totalQuizzes = chartData.reduce((sum, item) => sum + item.quizCount, 0);

  return [
    {
      name: "Flashcards",
      value: totalFlashcards,
      fill: "#3b82f6",
      percentage:
        totalFlashcards + totalQuizzes > 0
          ? Math.round(
              (totalFlashcards / (totalFlashcards + totalQuizzes)) * 100
            )
          : 0,
    },
    {
      name: "Quizzes",
      value: totalQuizzes,
      fill: "#10b981",
      percentage:
        totalFlashcards + totalQuizzes > 0
          ? Math.round((totalQuizzes / (totalFlashcards + totalQuizzes)) * 100)
          : 0,
    },
  ].filter((item) => item.value > 0); // Only show items with data
};

const COLORS = ["#3b82f6", "#10b981"];

export function StudyDistributionPieChart({ chartData }) {
  const transformedData = transformDistributionData(chartData);

  const totalActivities = transformedData.reduce(
    (sum, item) => sum + item.value,
    0
  );
  const dominantActivity = transformedData.reduce((max, item) =>
    item.value > max.value ? item : max
  );

  // Calculate trend (comparing recent vs older days)
  const recentData = chartData.slice(-3);
  const olderData = chartData.slice(-6, -3);

  const recentTotal = recentData.reduce(
    (sum, item) => sum + item.flashcardCount + item.quizCount,
    0
  );
  const olderTotal = olderData.reduce(
    (sum, item) => sum + item.flashcardCount + item.quizCount,
    0
  );

  const trendPercentage =
    olderTotal > 0
      ? (((recentTotal - olderTotal) / olderTotal) * 100).toFixed(1)
      : 0;
  const isTrendingUp = trendPercentage > 0;

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Study Distribution</CardTitle>
        <CardDescription>
          Breakdown of study activities over the last 7 days
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <div className="mx-auto aspect-square max-h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={transformedData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name} ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {transformedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                }}
                formatter={(value, name) => [value, name]}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          {isTrendingUp ? "Trending up" : "Trending down"} by{" "}
          {Math.abs(trendPercentage)}% this week
          <TrendingUp
            className={`h-4 w-4 ${isTrendingUp ? "" : "rotate-180"}`}
          />
        </div>
        <div className="text-muted-foreground leading-none">
          {totalActivities} total activities • {dominantActivity.name} most used
          ({dominantActivity.percentage}%)
        </div>
      </CardFooter>
    </Card>
  );
}
