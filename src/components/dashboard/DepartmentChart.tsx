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
import { EndUserWithDevice } from '@/types/end-user'

interface DepartmentChartProps {
  endUsers: EndUserWithDevice[]
}

const CHART_COLORS = [
  'hsl(160, 84%, 39%)',
  'hsl(217, 91%, 60%)',
  'hsl(25, 95%, 53%)',
  'hsl(339, 82%, 51%)',
  'hsl(262, 83%, 58%)',
  'hsl(142, 71%, 45%)',
  'hsl(48, 96%, 53%)',
  'hsl(199, 89%, 48%)',
]

export function DepartmentChart({ endUsers }: DepartmentChartProps) {
  const { chartData, chartConfig, total } = React.useMemo(() => {
    const groups: Record<string, number> = {}
    endUsers.forEach((user) => {
      const dept = user.department || 'Khác'
      groups[dept] = (groups[dept] || 0) + 1
    })

    const sorted = Object.entries(groups).sort((a, b) => b[1] - a[1])

    const data = sorted.map(([dept, count], index) => ({
      department: dept.replace(/\s/g, '_'),
      label: dept,
      count,
      fill: `var(--color-${dept.replace(/\s/g, '_')})`,
    }))

    const config: ChartConfig = {
      count: { label: 'Người dùng' },
    }
    sorted.forEach(([dept], index) => {
      const key = dept.replace(/\s/g, '_')
      config[key] = {
        label: dept,
        color: CHART_COLORS[index % CHART_COLORS.length],
      }
    })

    return { chartData: data, chartConfig: config, total: endUsers.length }
  }, [endUsers])

  if (chartData.length === 0) {
    return (
      <Card className="flex h-full flex-col">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Phân bổ phòng ban</CardTitle>
          <CardDescription>Người dùng theo phòng ban</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-1 items-center justify-center pb-4">
          <p className="text-muted-foreground text-sm">Chưa có dữ liệu</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Phân bổ phòng ban</CardTitle>
        <CardDescription>Người dùng theo phòng ban</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 items-center justify-center gap-2 pb-4 sm:gap-4">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square w-full max-w-[180px] sm:max-w-[240px] lg:max-w-[280px]"
        >
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="department"
              innerRadius={45}
              outerRadius={70}
              strokeWidth={2}
              stroke="hsl(var(--card))"
              paddingAngle={2}
              className="sm:[&_.recharts-pie-sector]:innerRadius-[55px] sm:[&_.recharts-pie-sector]:outerRadius-[85px] lg:[&_.recharts-pie-sector]:innerRadius-[65px] lg:[&_.recharts-pie-sector]:outerRadius-[100px]"
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
                          className="fill-foreground text-xl font-bold sm:text-2xl lg:text-3xl"
                        >
                          {chartData.length}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 18}
                          className="fill-muted-foreground text-xs sm:text-sm"
                        >
                          Phòng ban
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>

        <div className="hidden min-w-[100px] flex-col gap-2 sm:flex sm:min-w-[120px] sm:gap-2.5 lg:flex lg:min-w-[140px] lg:gap-3">
          {chartData.slice(0, 5).map((item) => {
            const config = chartConfig[item.department as keyof typeof chartConfig]
            const percent = total > 0 ? Math.round((item.count / total) * 100) : 0
            return (
              <div key={item.department} className="flex items-center gap-2 lg:gap-3">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full lg:h-3 lg:w-3"
                  style={{
                    backgroundColor: config?.color || CHART_COLORS[0],
                  }}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs leading-tight font-medium lg:text-sm">
                    {item.label}
                  </p>
                  <p className="text-muted-foreground text-[10px] lg:text-xs">
                    {item.count} · {percent}%
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
