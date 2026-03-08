'use client'

import * as React from 'react'
import { BarChart, Bar, XAxis, CartesianGrid, Cell, Rectangle } from 'recharts'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Cpu } from 'lucide-react'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { Device } from '@/types/device'

interface HardwareOverviewProps {
  devices: Device[]
}

// Map chart colors to theme variables
const CHART_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
]

// Parse "16 GB" → 16, trả về -1 nếu rỗng
function parseRAM(ram: string): number {
  if (!ram) return -1
  const match = ram.match(/(\d+)/)
  return match ? parseInt(match[1]) : -1
}

// Nhóm RAM theo ranges
function groupRAM(devices: Device[]) {
  const ranges = [
    { label: '≤ 4 GB', min: 0, max: 5 },
    { label: '8 GB', min: 5, max: 12 },
    { label: '16 GB', min: 12, max: 24 },
    { label: '32 GB', min: 24, max: 48 },
    { label: '64+ GB', min: 48, max: Infinity },
  ]
  return ranges
    .map((r, index) => ({
      label: r.label,
      count: devices.filter((d) => {
        const v = parseRAM(d.deviceInfo.ram)
        return v >= 0 && v >= r.min && v < r.max
      }).length,
      fill: CHART_COLORS[index % CHART_COLORS.length],
    }))
    .filter((d) => d.count > 0)
}

// Nhóm CPU brands
function groupCPU(devices: Device[]) {
  const brands: Record<string, number> = {}
  devices.forEach((d) => {
    const cpu = (d.deviceInfo.cpu || '').toLowerCase()
    if (!cpu) return
    let brand = 'Other'
    if (cpu.includes('i3') || cpu.includes('core i3')) brand = 'Intel i3'
    else if (cpu.includes('i5') || cpu.includes('core i5')) brand = 'Intel i5'
    else if (cpu.includes('i7') || cpu.includes('core i7')) brand = 'Intel i7'
    else if (cpu.includes('i9') || cpu.includes('core i9')) brand = 'Intel i9'
    else if (cpu.includes('ryzen 3')) brand = 'Ryzen 3'
    else if (cpu.includes('ryzen 5')) brand = 'Ryzen 5'
    else if (cpu.includes('ryzen 7')) brand = 'Ryzen 7'
    else if (cpu.includes('ryzen 9')) brand = 'Ryzen 9'
    else if (cpu.includes('xeon')) brand = 'Xeon'
    else if (
      cpu.includes('apple') ||
      cpu.includes('m1') ||
      cpu.includes('m2') ||
      cpu.includes('m3')
    )
      brand = 'Apple Silicon'
    brands[brand] = (brands[brand] || 0) + 1
  })
  return Object.entries(brands)
    .map(([label, count], i) => ({
      label,
      count,
      fill: CHART_COLORS[i % CHART_COLORS.length],
    }))
    .sort((a, b) => b.count - a.count)
}

const chartConfig = {
  count: {
    label: 'Số lượng',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig

// Component Chart chung
function OverviewChart({ data }: { data: { label: string; count: number; fill: string }[] }) {
  if (data.length === 0) {
    return (
      <div className="text-muted-foreground flex h-[200px] items-center justify-center text-sm">
        Chưa có dữ liệu
      </div>
    )
  }

  return (
    <ChartContainer config={chartConfig} className="h-[200px] w-full">
      <BarChart data={data} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={10}
          fontSize={11}
          angle={-15}
          textAnchor="end"
          height={60}
          interval={0}
        />
        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
        <Bar
          dataKey="count"
          radius={[4, 4, 0, 0]}
          maxBarSize={50}
          activeBar={<Rectangle fillOpacity={0.8} strokeWidth={1} stroke="var(--color-border)" />}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}

export function HardwareOverview({ devices }: HardwareOverviewProps) {
  const ramData = React.useMemo(() => groupRAM(devices), [devices])
  const cpuData = React.useMemo(() => groupCPU(devices), [devices])

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-xl border-none bg-white p-5 shadow-md dark:bg-card">
      {/* Header */}
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-50 shadow-sm dark:bg-violet-950/50">
          <Cpu className="h-5 w-5 text-violet-600" />
        </div>
        <span className="text-xs font-medium tracking-wide text-gray-500 uppercase">Tổng quan phần cứng</span>
      </div>

      {/* Tabs */}
      <div className="flex-1">
        <Tabs defaultValue="ram" className="w-full">
          <TabsList className="mb-4 grid w-full grid-cols-2 rounded-xl">
            <TabsTrigger value="ram" className="rounded-lg">RAM</TabsTrigger>
            <TabsTrigger value="cpu" className="rounded-lg">CPU</TabsTrigger>
          </TabsList>
          <TabsContent value="ram">
            <OverviewChart data={ramData} />
          </TabsContent>
          <TabsContent value="cpu">
            <OverviewChart data={cpuData} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
