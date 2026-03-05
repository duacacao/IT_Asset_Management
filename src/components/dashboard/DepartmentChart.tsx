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
      <Card className="flex flex-col rounded-xl border-none bg-white shadow-md dark:bg-card">
        <CardHeader className="items-center pb-0">
          <CardTitle>Phân bổ phòng ban</CardTitle>
          <CardDescription>Người dùng theo phòng ban</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-1 items-center justify-center pb-0">
          <p className="text-muted-foreground text-sm">Chưa có dữ liệu</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="flex flex-col rounded-xl border-none bg-white shadow-md dark:bg-card">
      <CardHeader className="items-center pb-0">
        <CardTitle>Phân bổ phòng ban</CardTitle>
        <CardDescription>Người dùng theo phòng ban</CardDescription>
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
              nameKey="department"
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
                          {total}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground text-sm"
                        >
                          Người dùng
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
          {chartData.slice(0, 5).map((item) => {
            const config = chartConfig[item.department as keyof typeof chartConfig]
            const percent = total > 0 ? Math.round((item.count / total) * 100) : 0
            return (
              <div key={item.department} className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{
                    backgroundColor: config?.color || CHART_COLORS[0],
                  }}
                />
                <span className="truncate text-sm font-medium" title={item.label}>
                  {item.label}
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
