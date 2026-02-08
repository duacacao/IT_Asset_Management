"use client"

import * as React from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Device } from "@/types/device"

interface DeviceOSChartProps {
    devices: Device[]
}

// Màu riêng biệt cho từng OS — dễ phân biệt trên pie chart
const OS_COLORS: Record<string, string> = {
    'Windows 10': '#0078d4',   // Microsoft blue
    'Windows 11': '#6366f1',   // Indigo
    'Windows': '#0078d4',
    'macOS': '#333333',        // Dark
    'Linux': '#f59e0b',        // Amber
    'Ubuntu': '#e95420',       // Ubuntu orange
    'CentOS': '#932279',       // CentOS purple
    'Chrome OS': '#34a853',    // Google green
}
const FALLBACK_COLORS = ['#06b6d4', '#ec4899', '#8b5cf6', '#f97316', '#14b8a6', '#eab308', '#3b82f6', '#ef4444']

function getOSColor(os: string, index: number): string {
    const match = Object.entries(OS_COLORS).find(([key]) => os.toLowerCase().includes(key.toLowerCase()))
    return match ? match[1] : FALLBACK_COLORS[index % FALLBACK_COLORS.length]
}

export function DeviceOSChart({ devices }: DeviceOSChartProps) {
    const chartData = React.useMemo(() => {
        const osCounts: Record<string, number> = {}
        devices.forEach(d => {
            const os = d.deviceInfo.os || 'Unknown'
            osCounts[os] = (osCounts[os] || 0) + 1
        })

        return Object.entries(osCounts)
            .map(([os, count]) => ({
                name: os,
                value: count,
                percent: Math.round((count / devices.length) * 100),
            }))
            .sort((a, b) => b.value - a.value)
    }, [devices])

    // OS chiếm nhiều nhất
    const topOS = chartData.length > 0 ? chartData[0] : null

    if (chartData.length === 0) {
        return (
            <Card className="h-full">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold">OS Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground text-center py-8">No data</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="h-full">
            <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">OS Distribution</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-6">
                    {/* Pie chart */}
                    <div className="relative">
                        <ResponsiveContainer width={160} height={160}>
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={72}
                                    paddingAngle={2}
                                    dataKey="value"
                                    strokeWidth={0}
                                >
                                    {chartData.map((entry, i) => (
                                        <Cell key={entry.name} fill={getOSColor(entry.name, i)} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '10px',
                                        border: 'none',
                                        boxShadow: '0 4px 14px rgb(0 0 0 / 0.1)',
                                        fontSize: '12px',
                                        backgroundColor: 'hsl(var(--card))',
                                        color: 'hsl(var(--foreground))',
                                    }}
                                    formatter={(value, name) => [`${value} devices`, name]}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Legend */}
                    <div className="flex flex-col gap-2.5 flex-1 min-w-0">
                        {chartData.map((entry, i) => (
                            <div key={entry.name} className="flex items-center gap-2.5">
                                <span
                                    className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: getOSColor(entry.name, i) }}
                                />
                                <span className="text-sm truncate flex-1">{entry.name}</span>
                                <span className="text-sm font-semibold tabular-nums">{entry.value}</span>
                                <span className="text-xs text-muted-foreground tabular-nums w-10 text-right">
                                    {entry.percent}%
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
