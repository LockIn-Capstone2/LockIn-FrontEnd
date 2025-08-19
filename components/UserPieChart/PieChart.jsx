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
    (sum, item) => sum + (item.flashcardCount || 0),
    0
  );
  const totalQuizzes = chartData.reduce(
    (sum, item) => sum + (item.quizCount || 0),
    0
  );

  const total = totalFlashcards + totalQuizzes;

  return [
    {
      name: "Flashcards",
      value: totalFlashcards,
      fill: "#3b82f6", // Tailwind blue-500
      percentage: total > 0 ? Math.round((totalFlashcards / total) * 100) : 0,
    },
    {
      name: "Quizzes",
      value: totalQuizzes,
      fill: "#10b981", // Tailwind green-500
      percentage: total > 0 ? Math.round((totalQuizzes / total) * 100) : 0,
    },
  ].filter((item) => item.value > 0); // Only show items with data
};

export function StudyDistributionPieChart({ chartData }) {
  const transformedData = transformDistributionData(chartData);

  const totalActivities = transformedData.reduce(
    (sum, item) => sum + item.value,
    0
  );

  const dominantActivity =
    transformedData.length > 0
      ? transformedData.reduce((max, item) =>
          item.value > max.value ? item : max
        )
      : { name: "N/A", value: 0, percentage: 0 };

  // Calculate trend (compare recent 3 days vs previous 3 days)
  const recentData = chartData?.slice(-3) || [];
  const olderData = chartData?.slice(-6, -3) || [];

  const recentTotal = recentData.reduce(
    (sum, item) => sum + (item.flashcardCount || 0) + (item.quizCount || 0),
    0
  );
  const olderTotal = olderData.reduce(
    (sum, item) => sum + (item.flashcardCount || 0) + (item.quizCount || 0),
    0
  );

  const trendPercentage =
    olderTotal > 0
      ? (((recentTotal - olderTotal) / olderTotal) * 100).toFixed(1)
      : "0.0";

  const isTrendingUp = parseFloat(trendPercentage) > 0;

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle className="text-lg font-semibold">
          🥧 Study Distribution
        </CardTitle>
        <CardDescription className="text-center text-sm">
          Breakdown of study activities and preferences
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 flex items-center justify-center pb-0">
        <div className="w-full max-w-[280px] h-64 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={transformedData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                dataKey="value"
              >
                {transformedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "14px",
                  padding: "8px 12px",
                }}
                formatter={(value, name, props) => [
                  `${value} (${props.payload.percentage}%)`,
                  name,
                ]}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>

      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center justify-center gap-2 font-medium">
          {isTrendingUp ? (
            <>
              Trending Up <TrendingUp className="h-4 w-4 text-green-600" />
            </>
          ) : (
            <>
              Trending Down <TrendingUp className="h-4 w-4 text-blue-600" />
            </>
          )}
        </div>
        <div className="text-center text-muted-foreground text-xs">
          {Math.abs(trendPercentage)}% change this week
        </div>
        <div className="text-xs font-medium text-center">
          {totalActivities} total activities • {dominantActivity.name} most used{" "}
          ({dominantActivity.percentage}%)
        </div>
      </CardFooter>
    </Card>
  );
}
