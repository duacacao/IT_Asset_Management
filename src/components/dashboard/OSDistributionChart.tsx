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

interface OSDistributionChartProps {
  devices: Device[]
}

// Bảng màu cho các hệ điều hành — tông hiện đại, dễ phân biệt
const OS_COLORS: Record<string, string> = {
  'Windows 11': 'hsl(217, 91%, 60%)', // Blue
  'Windows 10': 'hsl(199, 89%, 48%)', // Cyan-blue
  'Windows 8': 'hsl(186, 70%, 52%)', // Teal
  'Windows 7': 'hsl(173, 58%, 39%)', // Dark teal
  'Windows Server': 'hsl(262, 83%, 58%)', // Purple
  Linux: 'hsl(25, 95%, 53%)', // Orange
  Ubuntu: 'hsl(15, 85%, 55%)', // Orange-red
  macOS: 'hsl(0, 0%, 45%)', // Gray
  Khác: 'hsl(220, 9%, 46%)', // Neutral gray
}

// Fallback colors cho OS không có trong bảng
const FALLBACK_COLORS = [
  'hsl(339, 82%, 51%)', // Pink
  'hsl(291, 64%, 42%)', // Violet
  'hsl(142, 71%, 45%)', // Green
  'hsl(48, 96%, 53%)', // Yellow
  'hsl(12, 76%, 61%)', // Coral
]

// Phân loại OS từ chuỗi tên — nhóm các phiên bản tương tự
function classifyOS(os: string): string {
  if (!os) return 'Khác'
  const lower = os.toLowerCase()

  // Windows Server trước để không bị nhầm với Windows khác
  if (lower.includes('server')) return 'Windows Server'
  if (lower.includes('windows 11') || lower.includes('win 11')) return 'Windows 11'
  if (lower.includes('windows 10') || lower.includes('win 10')) return 'Windows 10'
  if (lower.includes('windows 8') || lower.includes('win 8')) return 'Windows 8'
  if (lower.includes('windows 7') || lower.includes('win 7')) return 'Windows 7'
  if (lower.includes('windows')) return 'Windows (khác)'
  if (lower.includes('ubuntu')) return 'Ubuntu'
  if (
    lower.includes('linux') ||
    lower.includes('centos') ||
    lower.includes('debian') ||
    lower.includes('fedora')
  )
    return 'Linux'
  if (lower.includes('macos') || lower.includes('mac os') || lower.includes('darwin'))
    return 'macOS'

  return 'Khác'
}

export function OSDistributionChart({ devices }: OSDistributionChartProps) {
  // Nhóm thiết bị theo OS
  const { chartData, chartConfig, total } = React.useMemo(() => {
    const groups: Record<string, number> = {}
    devices.forEach((d) => {
      const os = classifyOS(d.deviceInfo.os)
      groups[os] = (groups[os] || 0) + 1
    })

    // Sắp xếp theo số lượng giảm dần
    const sorted = Object.entries(groups).sort((a, b) => b[1] - a[1])

    let fallbackIdx = 0
    const data = sorted.map(([os, count]) => ({
      os: os.replace(/\s/g, '_'), // key không có khoảng trắng cho chart config
      label: os,
      count,
      fill: `var(--color-${os.replace(/\s/g, '_')})`,
    }))

    // Tạo chart config động dựa trên data
    const config: ChartConfig = {
      count: { label: 'Thiết bị' },
    }
    sorted.forEach(([os]) => {
      const key = os.replace(/\s/g, '_')
      config[key] = {
        label: os,
        color: OS_COLORS[os] || FALLBACK_COLORS[fallbackIdx++ % FALLBACK_COLORS.length],
      }
    })

    return { chartData: data, chartConfig: config, total: devices.length }
  }, [devices])

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Phân bổ hệ điều hành</CardTitle>
        <CardDescription>Thiết bị theo hệ điều hành</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 items-center pb-4">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square w-full max-w-[280px]">
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="os"
              innerRadius={65}
              outerRadius={100}
              strokeWidth={3}
              stroke="hsl(var(--card))"
              paddingAngle={2}
            >
              {/* Label trung tâm — tổng số OS khác nhau */}
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
                          {chartData.length}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground text-sm"
                        >
                          Loại OS
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>

        {/* Legend bên phải — hiển thị OS + count + phần trăm */}
        <div className="flex min-w-[140px] flex-col gap-3">
          {chartData.map((item) => {
            const percent = total > 0 ? Math.round((item.count / total) * 100) : 0
            return (
              <div key={item.os} className="flex items-center gap-3">
                <span
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{
                    backgroundColor:
                      OS_COLORS[item.label] ||
                      FALLBACK_COLORS[chartData.indexOf(item) % FALLBACK_COLORS.length],
                  }}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm leading-tight font-medium">{item.label}</p>
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
