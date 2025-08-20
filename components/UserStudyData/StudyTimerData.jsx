// import { BarChart, Bar, barColor } from "@mui/x-charts";
// import { CartesianGrid } from "recharts";
// import { XAxis, YAxis, Tooltip } from "recharts";
// function StudyTimerData({ data }) {
//   return (
//     <BarChart data={data}>
//       <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
//       <XAxis
//         dataKey="formattedDate"
//         tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
//         tickLine={false}
//         axisLine={{ stroke: "hsl(var(--border))" }}
//       />
//       <YAxis
//         tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
//         tickLine={false}
//         axisLine={{ stroke: "hsl(var(--border))" }}
//         label={{
//           value: "Minutes",
//           angle: -90,
//           position: "insideLeft",
//           style: { fill: "hsl(var(--muted-foreground))" },
//         }}
//       />
//       <Tooltip
//         content={({ active, payload, label }) => {
//           if (active && payload && payload.length) {
//             return (
//               <div className="bg-card border border-border rounded-lg shadow-lg p-3 backdrop-blur-sm">
//                 <p className="font-medium text-foreground mb-2">{label}</p>
//                 {payload.map((entry, index) => (
//                   <p
//                     key={index}
//                     className="text-sm text-muted-foreground"
//                     style={{ color: entry.color }}
//                   >
//                     {entry.name}: {entry.value} minutes
//                   </p>
//                 ))}
//               </div>
//             );
//           }
//           return null;
//         }}
//       />
//       <Bar
//         dataKey="duration"
//         fill={barColor}
//         radius={[4, 4, 0, 0]}
//         name="Study Minutes"
//       />
//     </BarChart>
//   );
// }

// export default StudyTimerData;

/*---------------------------------------------------*/

"use client";

import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function StudyTimerData({ data }) {
  // if (!data || data.length === 0) {
  //   return (
  //     <Card className="flex flex-col w-full max-w-3xl mx-auto shadow-lg rounded-2xl flex-container">
  //       <CardHeader className="pb-2">
  //         <CardTitle className="text-lg font-semibold">
  //           ⏰ Study Time Analysis
  //         </CardTitle>
  //         <CardDescription className="text-sm text-muted-foreground">
  //           Time spent studying each day
  //         </CardDescription>
  //       </CardHeader>
  //       <CardContent className="flex-1 flex items-center justify-center py-12">
  //         <div className="text-center text-muted-foreground">
  //           <p className="text-sm">No data available</p>
  //           <p className="text-xs">
  //             Complete some study sessions to see your activity
  //           </p>
  //         </div>
  //       </CardContent>
  //     </Card>
  //   );
  // }

  const barColor = "hsl(var(--chart-3))";

  return (
    <Card className="flex flex-col w-full max-w-3xl mx-auto shadow-lg rounded-2xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">
          ⏰ Study Time Analysis
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Time spent studying each day
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 20, left: 10, bottom: 20 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="formattedDate"
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
                  style: { fill: "hsl(var(--muted-foreground))", fontSize: 12 },
                }}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white dark:bg-neutral-900 border border-border rounded-lg shadow-lg p-3">
                        <p className="font-medium text-foreground mb-1">
                          {label}
                        </p>
                        {payload.map((entry, index) => (
                          <p
                            key={index}
                            className="text-sm"
                            style={{ color: entry.fill }}
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
                dataKey="duration"
                fill={barColor}
                radius={[6, 6, 0, 0]}
                name="Study Duration"
                barSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export default StudyTimerData;
