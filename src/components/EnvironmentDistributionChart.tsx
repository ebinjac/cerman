"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label, Pie, PieChart } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface EnvironmentDistributionChartProps {
  data: {
    name: string
    value: number
  }[]
}

const chartConfig = {
  production: {
    label: "Production",
    color: "hsl(var(--chart-1))",
  },
  staging: {
    label: "Staging",
    color: "hsl(var(--chart-2))",
  },
  development: {
    label: "Development",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig

export function EnvironmentDistributionChart({ data }: EnvironmentDistributionChartProps) {
  const chartData = data.map(item => ({
    environment: item.name.toLowerCase(),
    count: item.value,
    fill: `var(--color-${item.name.toLowerCase()})`
  }))

  const total = data.reduce((acc, curr) => acc + curr.value, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Environment Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="environment"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {total.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Total
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
} 