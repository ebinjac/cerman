"use client"

import { ReactNode } from "react"
import { Cell, Dot, Label, LabelList, Legend, Tooltip } from "recharts"

export type ChartConfig = Record<string, { label: string; color: string }>

interface ChartContainerProps {
  children: ReactNode
  config: ChartConfig
}

export function ChartContainer({ children, config }: ChartContainerProps) {
  const style = Object.entries(config).reduce((acc, [key, value]) => {
    return {
      ...acc,
      [`--color-${key}`]: value.color,
    }
  }, {})

  return <div style={style}>{children}</div>
}

interface ChartTooltipContentProps {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
  indicator?: "dot" | "dashed"
  hideLabel?: boolean
}

export function ChartTooltipContent({
  active,
  payload,
  label,
  indicator = "dot",
  hideLabel = false,
}: ChartTooltipContentProps) {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-lg border bg-background p-2 shadow-sm">
      {!hideLabel && <div className="text-xs text-muted-foreground">{label}</div>}
      <div className="flex flex-col gap-0.5">
        {payload.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            {indicator === "dot" ? (
              <Dot className="h-2 w-2" fill={item.color} />
            ) : (
              <div
                className="h-0.5 w-2"
                style={{ backgroundColor: item.color }}
              />
            )}
            <span className="text-sm font-medium">
              {item.name}: {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
} 