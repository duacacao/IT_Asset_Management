'use client'

import * as React from 'react'
import { Label, Pie, PieChart } from 'recharts'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Device } from '@/types/device'

interface DeviceStatusChartProps {
  devices: Device[]
}

const chartConfig = {
  count: {
    label: 'Thiết bị',
  },
  active: {
    label: 'Đang sử dụng',
    color: 'hsl(160, 84%, 39%)',
  },
  broken: {
    label: 'Hư hỏng',
    color: 'hsl(0, 84%, 60%)',
  },
  inactive: {
    label: 'Không sử dụng',
    color: 'hsl(43, 96%, 56%)',
  },
} satisfies ChartConfig

export function DeviceStatusChart({ devices }: DeviceStatusChartProps) {
  const chartData = React.useMemo(() => {
    const active = devices.filter((d) => (d.status ?? 'active') === 'active').length
    const broken = devices.filter((d) => d.status === 'broken').length
    const inactive = devices.filter((d) => d.status === 'inactive').length

    return [
      { status: 'active', count: active, fill: 'var(--color-active)' },
      { status: 'broken', count: broken, fill: 'var(--color-broken)' },
      { status: 'inactive', count: inactive, fill: 'var(--color-inactive)' },
    ].filter((d) => d.count > 0)
  }, [devices])

  const total = devices.length

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Trạng thái thiết bị</CardTitle>
        <CardDescription>Phân bổ theo trạng thái</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col items-center gap-4 pb-0 lg:flex-row lg:gap-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-square max-h-[250px] w-full max-w-[250px]"
        >
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="status"
              innerRadius={60}
              outerRadius={90}
              strokeWidth={5}
              stroke="hsl(var(--card))"
              paddingAngle={2}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
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
                          className="fill-muted-foreground text-sm"
                        >
                          Thiết bị
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>

        <div className="flex w-full flex-row flex-wrap justify-center gap-3 lg:w-auto lg:flex-col lg:gap-2">
          {chartData.map((item) => {
            const config = chartConfig[item.status as keyof typeof chartConfig]
            const percent = total > 0 ? Math.round((item.count / total) * 100) : 0
            return (
              <div key={item.status} className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: 'color' in config ? config.color : undefined }}
                />
                <span className="text-sm font-medium">
                  {'label' in config ? String(config.label) : item.status}
                </span>
                <span className="text-muted-foreground text-xs">({percent}%)</span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
