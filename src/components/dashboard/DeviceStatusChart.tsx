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

// Cấu hình màu cho từng trạng thái — tông hiện đại, tương phản tốt
const chartConfig = {
  count: {
    label: 'Thiết bị',
  },
  active: {
    label: 'Đang sử dụng',
    color: 'hsl(160, 84%, 39%)', // Emerald — hoạt động tốt
  },
  broken: {
    label: 'Hư hỏng',
    color: 'hsl(0, 84%, 60%)', // Red — cần chú ý
  },
  inactive: {
    label: 'Không sử dụng',
    color: 'hsl(43, 96%, 56%)', // Amber — trung tính
  },
} satisfies ChartConfig

export function DeviceStatusChart({ devices }: DeviceStatusChartProps) {
  // Nhóm thiết bị theo trạng thái
  const chartData = React.useMemo(() => {
    const active = devices.filter((d) => (d.status ?? 'active') === 'active').length
    const broken = devices.filter((d) => d.status === 'broken').length
    const inactive = devices.filter((d) => d.status === 'inactive').length

    return [
      { status: 'active', count: active, fill: 'var(--color-active)' },
      { status: 'broken', count: broken, fill: 'var(--color-broken)' },
      { status: 'inactive', count: inactive, fill: 'var(--color-inactive)' },
    ].filter((d) => d.count > 0) // Chỉ hiển thị trạng thái có thiết bị
  }, [devices])

  const total = devices.length

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Trạng thái thiết bị</CardTitle>
        <CardDescription>Phân bổ theo trạng thái hoạt động</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 items-center pb-4">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square w-full max-w-[280px]">
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="status"
              innerRadius={65}
              outerRadius={100}
              strokeWidth={3}
              stroke="hsl(var(--card))"
              paddingAngle={2}
            >
              {/* Label trung tâm hiển thị tổng số thiết bị */}
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

        {/* Legend bên phải — giống style ảnh mẫu */}
        <div className="flex min-w-[140px] flex-col gap-3">
          {chartData.map((item) => {
            const config = chartConfig[item.status as keyof typeof chartConfig]
            const percent = total > 0 ? Math.round((item.count / total) * 100) : 0
            return (
              <div key={item.status} className="flex items-center gap-3">
                <span
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: item.fill.startsWith('var') ? undefined : item.fill }}
                  // Nếu dùng CSS variable, cần tham chiếu qua data attribute
                  data-status={item.status}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-tight font-medium">
                    {'label' in config ? String(config.label) : item.status}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {item.count} thiết bị · {percent}%
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
