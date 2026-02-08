"use client"

import { StatusDonut } from "@/components/dashboard/StatusDonut"
import { DeviceOSChart } from "@/components/dashboard/DeviceOSChart"
import { HardwareOverview } from "@/components/dashboard/HardwareOverview"
import { RecentActivity } from "@/components/dashboard/RecentActivity"
import { useDevices } from "@/hooks/useDevices"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, LayoutDashboard } from "lucide-react"
import { useRouter } from "next/navigation"

export function DeviceDashboardClient() {
    const { devices } = useDevices()
    const router = useRouter()

    // Empty dashboard state
    if (devices.length === 0) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center gap-6 p-4 pt-0">
                <Card className="w-full max-w-lg text-center">
                    <CardHeader>
                        <div className="mx-auto rounded-full bg-muted p-4 mb-2">
                            <LayoutDashboard className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <CardTitle className="text-xl">Chào mừng đến IT Assets Management</CardTitle>
                        <CardDescription>
                            Import file Excel (.xlsx) để bắt đầu theo dõi và quản lý thiết bị IT.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button size="lg" onClick={() => router.push('/devices')}>
                            <Upload className="mr-2 h-5 w-5" />
                            Import thiết bị
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const now = new Date()
    const greeting = now.getHours() < 12 ? 'Chào buổi sáng' : now.getHours() < 18 ? 'Chào buổi chiều' : 'Chào buổi tối'

    return (
        <div className="flex flex-1 flex-col gap-5 p-4 pt-0">
            {/* Header greeting */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">{greeting} 👋</h2>
                    <p className="text-sm text-muted-foreground">
                        {now.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => router.push('/devices')}>
                    <Upload className="mr-2 h-4 w-4" />
                    Import thêm
                </Button>
            </div>

            {/* Row 1 — Status Donut + OS Area Chart */}
            <div className="grid gap-4 lg:grid-cols-5">
                <div className="lg:col-span-2">
                    <StatusDonut devices={devices} />
                </div>
                <div className="lg:col-span-3">
                    <DeviceOSChart devices={devices} />
                </div>
            </div>

            {/* Row 2 — Hardware Column Stacked + Recent Activity */}
            <div className="grid gap-4 lg:grid-cols-2">
                <HardwareOverview devices={devices} />
                <RecentActivity devices={devices} />
            </div>
        </div>
    )
}
