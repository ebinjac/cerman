"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, Legend, Tooltip } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface CertificateOverviewChartProps {
  data: {
    month: string
    valid: number
    expiringSoon: number
    expired: number
    certificates: number
    serviceIds: number
    total: number
  }[]
}

const chartConfig = {
  valid: {
    label: "Valid",
    color: "hsl(142, 76%, 36%)", // Forest green
  },
  expiringSoon: {
    label: "Expiring Soon",
    color: "hsl(38, 92%, 50%)", // Amber
  },
  expired: {
    label: "Expired",
    color: "hsl(0, 84%, 60%)", // Red
  },
  certificates: {
    label: "Certificates",
    color: "hsl(217, 91%, 60%)", // Bright blue
  },
  serviceIds: {
    label: "Service IDs",
    color: "hsl(142, 76%, 36%)", // Forest green
  }
} satisfies ChartConfig

export function CertificateOverviewChart({ data }: CertificateOverviewChartProps) {
  return (
    <div className="space-y-8">
      {/* Certificate Status Distribution */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Certificate Status Distribution</h3>
        <ChartContainer config={chartConfig}>
          <BarChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
            height={350}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar
              dataKey="valid"
              fill={chartConfig.valid.color}
              radius={[4, 4, 0, 0]}
              name="Valid"
            />
            <Bar
              dataKey="expiringSoon"
              fill={chartConfig.expiringSoon.color}
              radius={[4, 4, 0, 0]}
              name="Expiring Soon"
            />
            <Bar
              dataKey="expired"
              fill={chartConfig.expired.color}
              radius={[4, 4, 0, 0]}
              name="Expired"
            />
            <Legend />
          </BarChart>
        </ChartContainer>
      </div>

      {/* Distribution Over Time */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Distribution Over Time</h3>
        <ChartContainer config={chartConfig}>
          <BarChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
            height={350}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar
              dataKey="certificates"
              fill={chartConfig.certificates.color}
              radius={[4, 4, 0, 0]}
              name="Certificates"
            />
            <Bar
              dataKey="serviceIds"
              fill={chartConfig.serviceIds.color}
              radius={[4, 4, 0, 0]}
              name="Service IDs"
            />
            <Legend />
          </BarChart>
        </ChartContainer>
      </div>
    </div>
  )
} 