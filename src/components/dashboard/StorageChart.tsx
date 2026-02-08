"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Device } from "@/types/device"

import { cn } from "@/lib/utils"

interface StorageChartProps {
    devices: Device[]
    className?: string
}

export function StorageChart({ devices, className }: StorageChartProps) {
    const chartData = React.useMemo(() => {
        const ranges = {
            "Under 256GB": 0,
            "256GB - 512GB": 0,
            "512GB - 1TB": 0,
            "Over 1TB": 0,
            "Unknown": 0
        };

        devices.forEach(device => {
            // Try to find hard drive info in 'o_cung' sheet
            // The sheet key is normalized in deviceUtils.ts (lowercase, replace space with underscore)
            // It might be 'o_cung' or derived from 'Hard Drive' etc. as per SHEET_NAMES mapping
            // But deviceUtils uses simple normalization logic.
            // Let's assume 'o_cung' or look for likely keys.

            const driveSheet = device.sheets['o_cung'] || device.sheets['hard_drive'] || device.sheets['disk'];
            let sizeGB = 0;

            if (Array.isArray(driveSheet) && driveSheet.length > 0) {
                // Try to find a size field in the first row
                const info = driveSheet[0];
                // Common headers: "Dung luong", "Size", "Capacity"
                const sizeStr = String(info['Dung luong'] || info['Dung lượng'] || info['Size'] || info['Capacity'] || "0");

                // Parse size string (e.g., "256 GB", "500GB", "1 TB")
                const lowerSize = sizeStr.toLowerCase();
                const numericPart = parseFloat(lowerSize.replace(/[^0-9.]/g, ''));

                if (!isNaN(numericPart)) {
                    if (lowerSize.includes('tb')) {
                        sizeGB = numericPart * 1024;
                    } else if (lowerSize.includes('mb')) {
                        sizeGB = numericPart / 1024;
                    } else {
                        // Assume GB if no unit or GB is present
                        sizeGB = numericPart;
                    }
                }
            }

            if (sizeGB === 0) {
                ranges["Unknown"]++;
            } else if (sizeGB < 256) {
                ranges["Under 256GB"]++;
            } else if (sizeGB < 512) {
                ranges["256GB - 512GB"]++;
            } else if (sizeGB < 1024) {
                ranges["512GB - 1TB"]++;
            } else {
                ranges["Over 1TB"]++;
            }
        });

        return Object.entries(ranges).map(([range, count]) => ({
            range,
            count,
        })).filter(item => item.count > 0); // Only show ranges that have devices
    }, [devices]);

    return (
        <Card className={cn("col-span-4", className)}>
            <CardHeader>
                <CardTitle>Storage Capacity</CardTitle>
                <CardDescription>Device storage distribution</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                            dataKey="range"
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `${value}`}
                        />
                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="count" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" maxBarSize={50} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
