"use client";

import { CartesianGrid, Line, LineChart, XAxis } from "recharts";

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
  students: {
    label: "Students",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

type ChartDatum = { label: string; students: number };

export function StudentsLineChart({
  data = [],
  totalStudents = 0,
  title = "Students added",
  description = "Last 7 days",
  viewMode = "days",
  onViewModeChange,
}: {
  data?: ChartDatum[];
  totalStudents?: number;
  title?: string;
  description?: string;
  viewMode?: "days" | "months";
  onViewModeChange?: (mode: "days" | "months") => void;
}) {
  const chartData =
    data.length > 0 ? data : [{ label: "—", students: 0 }];

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
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              stroke="var(--muted-foreground)"
              opacity={0.2}
            />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fill: "var(--muted-foreground)" }}
              tickFormatter={(value) =>
                value && value.length > 5 ? `${value.slice(0, 5)}.` : value
              }
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Line
              type="monotone"
              dataKey="students"
              stroke="var(--color-students)"
              strokeWidth={2}
              dot={{ fill: "var(--color-students)", strokeWidth: 0 }}
              activeDot={{ r: 6, fill: "var(--chart-2)" }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
