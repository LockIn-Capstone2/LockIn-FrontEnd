"use client";

import { TrendingUp } from "lucide-react";
import { AreaChart, Area, CartesianGrid, XAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const description = "User progress area chart showing daily performance";

// Transform chart data from API
const transformChartData = (chartData) => {
  if (!chartData || !Array.isArray(chartData)) return [];

  return chartData.map((item) => ({
    day: item.day,
    flashcardAccuracy: item.flashcardAccuracy,
    quizScore: item.quizScore,
  }));
};

const chartConfig = {
  flashcardAccuracy: {
    label: "Flashcard Accuracy",
    color: "var(--chart-1)",
  },
  quizScore: {
    label: "Quiz Score",
    color: "var(--chart-2)",
  },
};

export function ProgressAreaChart({ chartData }) {
  const transformedData = transformChartData(chartData);

  // Calculate trend
  const recentData = transformedData.slice(-3);
  const olderData = transformedData.slice(-6, -3);

  const recentAvg =
    recentData.reduce((sum, item) => sum + item.flashcardAccuracy, 0) /
    recentData.length;
  const olderAvg =
    olderData.reduce((sum, item) => sum + item.flashcardAccuracy, 0) /
    olderData.length;

  const trendPercentage =
    olderAvg > 0 ? (((recentAvg - olderAvg) / olderAvg) * 100).toFixed(1) : 0;
  const isTrendingUp = trendPercentage > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Progress</CardTitle>
        <CardDescription>
          Flashcard accuracy and quiz scores over the last 7 days
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={transformedData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Area
              dataKey="flashcardAccuracy"
              type="natural"
              fill="var(--color-flashcardAccuracy)"
              fillOpacity={0.4}
              stroke="var(--color-flashcardAccuracy)"
            />
            <Area
              dataKey="quizScore"
              type="natural"
              fill="var(--color-quizScore)"
              fillOpacity={0.4}
              stroke="var(--color-quizScore)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 leading-none font-medium">
              {isTrendingUp ? "Trending up" : "Trending down"} by{" "}
              {Math.abs(trendPercentage)}% this week
              <TrendingUp
                className={`h-4 w-4 ${isTrendingUp ? "" : "rotate-180"}`}
              />
            </div>
            <div className="text-muted-foreground flex items-center gap-2 leading-none">
              Last 7 days performance
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
