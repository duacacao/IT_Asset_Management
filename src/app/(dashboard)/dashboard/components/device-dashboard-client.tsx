"use client"

import { StatsCards } from "@/components/dashboard/StatsCards"
import { DeviceOSChart } from "@/components/dashboard/DeviceOSChart"
import { RecentActivity } from "@/components/dashboard/RecentActivity"
import { StorageChart } from "@/components/dashboard/StorageChart"
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

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            {/* Quick actions */}
            <div className="flex items-center justify-end">
                <Button variant="outline" size="sm" onClick={() => router.push('/devices')}>
                    <Upload className="mr-2 h-4 w-4" />
                    Import thêm
                </Button>
            </div>

            <StatsCards devices={devices} />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4">
                    <DeviceOSChart devices={devices} />
                </div>
                <div className="col-span-3">
                    <RecentActivity devices={devices} />
                </div>
            </div>

            <StorageChart devices={devices} className="w-full" />
        </div>
    )
}
