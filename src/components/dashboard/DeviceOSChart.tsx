"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import { Device } from "@/types/device"

interface DeviceOSChartProps {
    devices: Device[]
}

const chartConfig = {
    count: {
        label: "Devices",
        color: "hsl(var(--chart-1))",
    },
} satisfies ChartConfig

export function DeviceOSChart({ devices }: DeviceOSChartProps) {
    const chartData = React.useMemo(() => {
        const osCounts: Record<string, number> = {}
        devices.forEach((device) => {
            const os = device.deviceInfo.os || "Unknown"
            osCounts[os] = (osCounts[os] || 0) + 1
        })

        return Object.entries(osCounts).map(([os, count]) => ({
            os,
            count,
            fill: "var(--color-count)",
        }))
    }, [devices])

    return (
        <Card>
            <CardHeader>
                <CardTitle>Device Operating Systems</CardTitle>
                <CardDescription>Distribution of devices by OS</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig}>
                    <BarChart accessibilityLayer data={chartData} layout="vertical" margin={{ left: 0 }}>
                        <CartesianGrid horizontal={false} />
                        <YAxis
                            dataKey="os"
                            type="category"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            width={100}
                        />
                        <XAxis dataKey="count" type="number" hide />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Bar dataKey="count" radius={5} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
