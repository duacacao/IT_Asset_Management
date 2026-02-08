"use client"

import * as React from "react"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Device } from "@/types/device"

interface HardwareOverviewProps {
    devices: Device[]
}

// RAM color palette — tông xanh gradient
const RAM_COLORS: Record<string, string> = {
    '≤ 4 GB': '#93c5fd',
    '8 GB': '#60a5fa',
    '16 GB': '#3b82f6',
    '32 GB': '#2563eb',
    '64+ GB': '#1d4ed8',
}

// CPU color palette — tông tím gradient
const CPU_COLORS = ['#c4b5fd', '#a78bfa', '#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6', '#4c1d95']

// Parse "16 GB" → 16
function parseRAM(ram: string): number {
    const match = ram.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
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
    return ranges.map(r => ({
        label: r.label,
        count: devices.filter(d => {
            const v = parseRAM(d.deviceInfo.ram)
            return v >= r.min && v < r.max
        }).length,
        fill: RAM_COLORS[r.label] || '#3b82f6',
    })).filter(d => d.count > 0)
}

// Nhóm CPU brands
function groupCPU(devices: Device[]) {
    const brands: Record<string, number> = {}
    devices.forEach(d => {
        const cpu = d.deviceInfo.cpu.toLowerCase()
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
        else if (cpu.includes('intel')) brand = 'Intel Other'
        else if (cpu.includes('amd')) brand = 'AMD Other'
        else if (cpu.includes('apple') || cpu.includes('m1') || cpu.includes('m2') || cpu.includes('m3')) brand = 'Apple Silicon'
        brands[brand] = (brands[brand] || 0) + 1
    })
    return Object.entries(brands)
        .map(([label, count], i) => ({ label, count, fill: CPU_COLORS[i % CPU_COLORS.length] }))
        .sort((a, b) => b.count - a.count)
}

// Recharts BarChart với Cell colors — Minimal.cc column style
function ColumnChart({ data }: { data: { label: string; count: number; fill: string }[] }) {
    return (
        <ResponsiveContainer width="100%" height={220}>
            <BarChart
                data={data}
                margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
                barCategoryGap="20%"
            >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" strokeOpacity={0.5} />
                <XAxis
                    dataKey="label"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    stroke="hsl(var(--muted-foreground))"
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                    height={50}
                />
                <YAxis
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    stroke="hsl(var(--muted-foreground))"
                    allowDecimals={false}
                />
                <Tooltip
                    contentStyle={{
                        borderRadius: '10px',
                        border: 'none',
                        boxShadow: '0 4px 14px rgb(0 0 0 / 0.1)',
                        fontSize: '12px',
                        backgroundColor: 'hsl(var(--card))',
                        color: 'hsl(var(--foreground))',
                    }}
                    formatter={(value) => [`${value} devices`, 'Số lượng']}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={40}>
                    {data.map((entry) => (
                        <Cell key={entry.label} fill={entry.fill} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    )
}

export function HardwareOverview({ devices }: HardwareOverviewProps) {
    const ramData = React.useMemo(() => groupRAM(devices), [devices])
    const cpuData = React.useMemo(() => groupCPU(devices), [devices])

    return (
        <Card className="h-full">
            <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Hardware Overview</CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="ram">
                    <TabsList className="h-8 mb-3">
                        <TabsTrigger value="ram" className="text-xs px-3 h-7">RAM</TabsTrigger>
                        <TabsTrigger value="cpu" className="text-xs px-3 h-7">CPU</TabsTrigger>
                    </TabsList>
                    <TabsContent value="ram" className="mt-0">
                        <ColumnChart data={ramData} />
                    </TabsContent>
                    <TabsContent value="cpu" className="mt-0">
                        <ColumnChart data={cpuData} />
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}
