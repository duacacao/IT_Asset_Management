"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Device, DeviceStatus, DEVICE_STATUS_CONFIG } from "@/types/device"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { timeAgo } from '@/lib/time'
import { Laptop, Server, Smartphone, Circle } from "lucide-react"

interface RecentActivityProps {
    devices: Device[]
}

const STATUS_VARIANTS: Record<DeviceStatus, "default" | "secondary" | "destructive" | "outline"> = {
    active: "default",   // Green context usually
    broken: "destructive", // Red
    inactive: "secondary", // Yellow/Grey
}

const STATUS_COLORS: Record<DeviceStatus, string> = {
    active: 'text-emerald-500 fill-emerald-500',
    broken: 'text-red-500 fill-red-500',
    inactive: 'text-amber-500 fill-amber-500',
}

function getDeviceIcon(name: string) {
    const n = name.toLowerCase()
    if (n.includes('server')) return Server
    if (n.includes('iphone') || n.includes('android')) return Smartphone
    return Laptop
}

export function RecentActivity({ devices }: RecentActivityProps) {
    const recentDevices = React.useMemo(() =>
        [...devices]
            .sort((a, b) => new Date(b.metadata.importedAt).getTime() - new Date(a.metadata.importedAt).getTime())
            .slice(0, 10), // Tăng lên 10 items vì có scroll
        [devices]
    );

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Hoạt động gần đây</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0">
                {recentDevices.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center text-sm text-muted-foreground">
                        <p>Chưa có hoạt động nào</p>
                    </div>
                ) : (
                    <ScrollArea className="h-[300px]">
                        <div className="flex flex-col gap-0 p-4 pt-0">
                            {recentDevices.map((device, index) => {
                                const status = device.status ?? 'active'
                                const config = DEVICE_STATUS_CONFIG[status]
                                const Icon = getDeviceIcon(device.deviceInfo.name)
                                const isLast = index === recentDevices.length - 1

                                return (
                                    <div
                                        key={device.id}
                                        className={`group flex items-center justify-between gap-3 py-3 px-2 rounded-md hover:bg-muted/50 transition-colors cursor-pointer ${!isLast ? 'border-b border-border/40' : ''}`}
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border bg-background shadow-xs group-hover:border-primary/20 transition-colors">
                                                <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                                <span className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ring-2 ring-background ${status === 'active' ? 'bg-emerald-500' :
                                                        status === 'broken' ? 'bg-red-500' : 'bg-amber-500'
                                                    }`} />
                                            </div>

                                            <div className="flex flex-col min-w-0">
                                                <p className="text-sm font-medium leading-none truncate group-hover:text-primary transition-colors">
                                                    {device.deviceInfo.name}
                                                </p>
                                                <span className="text-[11px] text-muted-foreground mt-1">
                                                    {timeAgo(device.metadata.importedAt)}
                                                </span>
                                            </div>
                                        </div>

                                        <Badge
                                            variant="outline"
                                            className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-medium border ${status === 'active'
                                                    ? 'border-emerald-200 text-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800'
                                                    : status === 'broken'
                                                        ? 'border-red-200 text-red-700 bg-red-50/50 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800'
                                                        : 'border-amber-200 text-amber-700 bg-amber-50/50 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800'
                                                }`}
                                        >
                                            {config.label}
                                        </Badge>
                                    </div>
                                )
                            })}
                        </div>
                    </ScrollArea>
                )}
            </CardContent>
        </Card>
    )
}
