"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label, Pie, PieChart } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface CertificateStatusChartProps {
  data: {
    name: string
    value: number
  }[]
}

const chartConfig = {
  valid: {
    label: "Valid",
    color: "hsl(213, 94%, 50%)", // Bright blue
  },
  expiringsoon: {
    label: "Expiring Soon",
    color: "hsl(213, 94%, 65%)", // Light blue
  },
  expired: {
    label: "Expired",
    color: "hsl(213, 94%, 35%)", // Dark blue
  },
} satisfies ChartConfig

const getStatusColor = (status: string): string => {
  const normalizedStatus = status.toLowerCase().replace(/[^a-z]/g, '')
  return chartConfig[normalizedStatus as keyof typeof chartConfig]?.color || chartConfig.valid.color
}

export function CertificateStatusChart({ data }: CertificateStatusChartProps) {
  const chartData = data.map(item => ({
    status: item.name,
    count: item.value,
    fill: getStatusColor(item.name)
  }))

  const total = data.reduce((acc, curr) => acc + curr.value, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Certificate Status Distribution</CardTitle>
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
              nameKey="status"
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
            <ChartLegend
              content={<ChartLegendContent nameKey="status" />}
              className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
} 