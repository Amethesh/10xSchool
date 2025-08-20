"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  DotProps,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";

// --- Prop Interfaces (unchanged) ---
interface PerformanceDataPoint {
  date: string;
  score: number;
  level: string;
  weekNo: number;
  difficulty: string;
  timeSpent: number;
}

interface PerformanceChartProps {
  data: PerformanceDataPoint[];
  title?: string;
  showTrend?: boolean;
  height?: number;
}

// --- Helper function for difficulty color ---
const getDifficultyColor = (difficulty: string) => {
  switch (difficulty.toLowerCase()) {
    case "easy":
      return "#10b981"; // emerald-500
    case "medium":
      return "#f59e0b"; // amber-500
    case "hard":
      return "#ef4444"; // red-500
    default:
      return "#6b7280"; // gray-500
  }
};

// --- Custom Components for Recharts ---

// Custom Dot for the line chart, colored by difficulty
const CustomizedDot = (
  props: DotProps & { payload?: PerformanceDataPoint }
) => {
  const { cx, cy, payload } = props;
  if (!cx || !cy || !payload) return null;

  return (
    <circle
      cx={cx}
      cy={cy}
      r={6}
      stroke="white"
      strokeWidth={2}
      fill={getDifficultyColor(payload.difficulty)}
    />
  );
};

// Custom Tooltip to show detailed info on hover
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as PerformanceDataPoint & { trend: number };
    return (
      <div className="p-2 bg-black/80 text-white rounded-md border border-gray-700 text-sm">
        <p className="font-bold">{`Score: ${data.score}%`}</p>
        <p>{`${data.level} - Week ${data.weekNo}`}</p>
        <p className="capitalize">{`Difficulty: ${data.difficulty}`}</p>
        <p>{`Date: ${new Date(data.date).toLocaleDateString()}`}</p>
      </div>
    );
  }
  return null;
};

// --- Main Chart Component ---
export function PerformanceChart({
  data,
  title = "Performance Over Time",
  showTrend = true,
  height = 300, // Recharts works well with a slightly larger default height
}: PerformanceChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-gray-500">
            No performance data available
          </div>
        </CardContent>
      </Card>
    );
  }

  // --- Data Preparation ---

  // 1. Sort data by date
  const sortedData = [...data].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // 2. Calculate trend line if requested
  let trendSlope = 0;
  let trendData = [];

  if (showTrend && sortedData.length > 1) {
    const n = sortedData.length;
    const sumX = sortedData.reduce((sum, _, i) => sum + i, 0);
    const sumY = sortedData.reduce((sum, d) => sum + d.score, 0);
    const sumXY = sortedData.reduce((sum, d, i) => sum + i * d.score, 0);
    const sumXX = sortedData.reduce((sum, _, i) => sum + i * i, 0);

    trendSlope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - trendSlope * sumX) / n;

    // Add trend values and a formatted label to each data point for Recharts
    trendData = sortedData.map((d, i) => ({
      ...d,
      label: `W${d.weekNo}`, // X-axis label
      trend: parseFloat((trendSlope * i + intercept).toFixed(2)),
    }));
  } else {
    // If no trend, just format the data for Recharts
    trendData = sortedData.map((d) => ({ ...d, label: `W${d.weekNo}` }));
  }

  // --- Summary Statistics ---
  const lastScore = sortedData[sortedData.length - 1]?.score;
  const averageScore =
    sortedData.reduce((sum, d) => sum + d.score, 0) / sortedData.length;
  const bestScore = Math.max(...sortedData.map((d) => d.score));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex gap-4">
          <p className="text-xl">
            {title}
            <br></br>
            <span className="text-xs text-yellow-200">(Last 5 Attempts)</span>
          </p>
          {showTrend && sortedData.length > 1 && (
            <Badge
              className="h-8"
              variant={trendSlope > 0 ? "default" : "destructive"}
            >
              <span className="block sm:hidden">
                {trendSlope > 0.01 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : trendSlope < -0.01 ? (
                  <TrendingDown className="w-4 h-4" />
                ) : (
                  <Minus className="w-4 h-4" />
                )}
              </span>
              <span className="hidden sm:flex items-center gap-1">
                {trendSlope > 0.01 ? (
                  <>
                    <TrendingUp className="w-4 h-4" />
                    Improving
                  </>
                ) : trendSlope < -0.01 ? (
                  <>
                    <TrendingDown className="w-4 h-4" />
                    Declining
                  </>
                ) : (
                  <>
                    <Minus className="w-4 h-4" />
                    Stable
                  </>
                )}
              </span>
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ height: `${height}px`, width: "100%" }}>
          <ResponsiveContainer>
            <LineChart
              data={trendData}
              margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis
                dataKey="label"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                domain={[0, 100]}
                unit="%"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />

              {/* Trend Line */}
              {showTrend && (
                <Line
                  type="monotone"
                  dataKey="trend"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  opacity={0.6}
                />
              )}

              {/* Performance Line */}
              <Line
                type="monotone"
                dataKey="score"
                stroke="#3b82f6"
                strokeWidth={3}
                // @ts-ignore - Recharts type for dot is complex, but this works
                dot={<CustomizedDot />}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-4 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: getDifficultyColor("easy") }}
            ></div>
            <span>Easy</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: getDifficultyColor("medium") }}
            ></div>
            <span>Medium</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: getDifficultyColor("hard") }}
            ></div>
            <span>Hard</span>
          </div>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 text-center">
          <div className="bg-black/20 backdrop-blur-sm border border-white/30 p-2 rounded-lg">
            <p className="text-sm text-white">Latest</p>
            <p className="font-bold text-lg">{lastScore}%</p>
          </div>
          <div className="bg-black/20 backdrop-blur-sm border border-white/30 p-2 rounded-lg">
            <p className="text-sm text-white">Average</p>
            <p className="font-bold text-lg">{averageScore.toFixed(1)}%</p>
          </div>
          <div className="bg-black/20 backdrop-blur-sm border border-white/30 p-2 rounded-lg">
            <p className="text-sm text-white">Best</p>
            <p className="font-bold text-lg">{bestScore}%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
