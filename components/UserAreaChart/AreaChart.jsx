"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const description = "Area chart showing daily progress trends";

export function ProgressAreaChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <Card className="flex flex-col h-full">
        <CardHeader>
          <CardTitle>📈 Daily Progress Trends</CardTitle>
          <CardDescription>
            Flashcard accuracy and study minutes over time
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <p className="text-sm">No data available</p>
            <p className="text-xs">
              Complete some study sessions to see your progress
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Dynamic colors that work well in both light and dark modes
  const accuracyColor = "hsl(var(--chart-1))";
  const minutesColor = "hsl(var(--chart-2))";

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>📈 Daily Progress Trends</CardTitle>
        <CardDescription>
          Flashcard accuracy and study minutes over time
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={{ stroke: "hsl(var(--border))" }}
            />
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={{ stroke: "hsl(var(--border))" }}
              label={{
                value: "Accuracy (%)",
                angle: -90,
                position: "insideLeft",
                style: { fill: "hsl(var(--muted-foreground))" },
              }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={{ stroke: "hsl(var(--border))" }}
              label={{
                value: "Minutes",
                angle: 90,
                position: "insideRight",
                style: { fill: "hsl(var(--muted-foreground))" },
              }}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-card border border-border rounded-lg shadow-lg p-3 backdrop-blur-sm">
                      <p className="font-medium text-foreground mb-2">
                        {label}
                      </p>
                      {payload.map((entry, index) => (
                        <p
                          key={index}
                          className="text-sm text-muted-foreground"
                          style={{ color: entry.color }}
                        >
                          {entry.name}: {entry.value}
                        </p>
                      ))}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="accuracy"
              stroke={accuracyColor}
              fill={accuracyColor}
              fillOpacity={0.3}
              name="Accuracy %"
              strokeWidth={2}
            />
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="minutes"
              stroke={minutesColor}
              fill={minutesColor}
              fillOpacity={0.3}
              name="Minutes"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
