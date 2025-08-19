"use client";

import {
  Bar,
  BarChart,
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

export const description = "Bar chart showing weekly study activity";

export function WeeklyActivityBarChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>⏰ Study Time Analysis</CardTitle>
          <CardDescription>Time spent studying each day</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <p className="text-sm">No data available</p>
            <p className="text-xs">
              Complete some study sessions to see your activity
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Dynamic colors that work well in both light and dark modes
  const barColor = "hsl(var(--chart-3))";

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>⏰ Study Time Analysis</CardTitle>
        <CardDescription>Time spent studying each day</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={{ stroke: "hsl(var(--border))" }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={{ stroke: "hsl(var(--border))" }}
              label={{
                value: "Minutes",
                angle: -90,
                position: "insideLeft",
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
                          {entry.name}: {entry.value} minutes
                        </p>
                      ))}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey="minutes"
              fill={barColor}
              radius={[4, 4, 0, 0]}
              name="Study Minutes"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
