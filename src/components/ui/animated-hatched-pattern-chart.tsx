"use client";

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import React from "react";

const chartConfig = {
  students: {
    label: "Students",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

type ChartDatum = { name: string; students: number };

export function AnimatedHatchedPatternAreaChart({
  data = [],
  totalStudents = 0,
  title = "Students by class",
  description = "Distribution across classes",
}: {
  data?: ChartDatum[];
  totalStudents?: number;
  title?: string;
  description?: string;
}) {
  const [active, setActive] = React.useState(false);
  const chartData =
    data.length > 0 ? data : [{ name: "—", students: 0 }];

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-foreground">
          {title}
          <Badge
            variant="outline"
            className="ml-2 border-none bg-chart-2/10 text-chart-2"
          >
            <span>{totalStudents} total</span>
          </Badge>
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart accessibilityLayer data={chartData}>
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              stroke="var(--muted-foreground)"
              opacity={0.2}
            />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fill: "var(--muted-foreground)" }}
              tickFormatter={(value) =>
                value && value.length > 4 ? `${value.slice(0, 4)}.` : value
              }
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <defs>
              <HatchedBackgroundPattern config={chartConfig} />
              <linearGradient
                id="hatched-background-pattern-grad-students"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="var(--color-students)"
                  stopOpacity={0.4}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-students)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <Area
              onMouseEnter={() => setActive(true)}
              onMouseLeave={() => setActive(false)}
              dataKey="students"
              type="natural"
              fill={
                active
                  ? "url(#hatched-background-pattern-students)"
                  : "url(#hatched-background-pattern-grad-students)"
              }
              fillOpacity={0.4}
              stroke="var(--color-students)"
              stackId="a"
              strokeWidth={0.8}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

const HatchedBackgroundPattern = ({ config }: { config: ChartConfig }) => {
  const items = Object.fromEntries(
    Object.entries(config).map(([key, value]) => [key, value.color])
  );
  return (
    <>
      {Object.entries(items).map(([key, value]) => (
        <pattern
          key={key}
          id={`hatched-background-pattern-${key}`}
          x="0"
          y="0"
          width="6.81"
          height="6.81"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(-45)"
          overflow="visible"
        >
          <g overflow="visible" className="will-change-transform">
            <animateTransform
              attributeName="transform"
              type="translate"
              from="0 0"
              to="6 0"
              dur="1s"
              repeatCount="indefinite"
            />
            <rect width="10" height="10" opacity={0.05} fill={value} />
            <rect width="1" height="10" fill={value} />
          </g>
        </pattern>
      ))}
    </>
  );
};
