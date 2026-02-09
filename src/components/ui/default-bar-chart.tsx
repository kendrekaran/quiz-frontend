"use client";

import { Bar, BarChart, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardAction,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const chartConfig = {
  quizzes: {
    label: "Quizzes",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

type ChartDatum = { label: string; quizzes: number };

export function DefaultBarChart({
  data = [],
  totalQuizzes = 0,
  title = "Quizzes created",
  description = "Last 7 days",
  viewMode = "days",
  onViewModeChange,
}: {
  data?: ChartDatum[];
  totalQuizzes?: number;
  title?: string;
  description?: string;
  viewMode?: "days" | "months";
  onViewModeChange?: (mode: "days" | "months") => void;
}) {
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-foreground">
          {title}
          <Badge
            variant="outline"
            className="ml-2 border-none bg-chart-2/10 text-chart-2"
          >
            <span>{totalQuizzes} total</span>
          </Badge>
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          {description}
        </CardDescription>
        {onViewModeChange && (
          <CardAction>
            <Select
              value={viewMode}
              onValueChange={(value) =>
                onViewModeChange(value as "days" | "months")
              }
            >
              <SelectTrigger className="h-8 w-[7.5rem] border-border bg-input text-foreground">
                <SelectValue placeholder="View" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="days">Days</SelectItem>
                <SelectItem value="months">Months</SelectItem>
              </SelectContent>
            </Select>
          </CardAction>
        )}
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={data.length ? data : [{ label: "—", quizzes: 0 }]}
          >
            <rect
              x="0"
              y="0"
              width="100%"
              height="85%"
              fill="url(#default-pattern-dots)"
            />
            <defs>
              <DottedBackgroundPattern />
            </defs>
            <XAxis
              dataKey="label"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tick={{ fill: "var(--muted-foreground)" }}
              tickFormatter={(value) =>
                value && value.length > 5 ? `${value.slice(0, 5)}.` : value
              }
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="quizzes" fill="var(--color-quizzes)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

const DottedBackgroundPattern = () => {
  return (
    <pattern
      id="default-pattern-dots"
      x="0"
      y="0"
      width="10"
      height="10"
      patternUnits="userSpaceOnUse"
    >
      <circle
        cx="2"
        cy="2"
        r="1"
        fill="var(--muted-foreground)"
        opacity={0.25}
      />
    </pattern>
  );
};
