"use client"

import { StatsCards } from "@/components/dashboard/StatsCards"
import { DeviceOSChart } from "@/components/dashboard/DeviceOSChart"
import { RecentActivity } from "@/components/dashboard/RecentActivity"
import { StorageChart } from "@/components/dashboard/StorageChart"
import { useDevices } from "@/hooks/useDevices"

export function DeviceDashboardClient() {
    const { devices } = useDevices()

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <StatsCards devices={devices} />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4">
                    <DeviceOSChart devices={devices} />
                </div>
                <div className="col-span-3">
                    <RecentActivity devices={devices} />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <StorageChart devices={devices} className="col-span-4 lg:col-span-7" />
            </div>
        </div>
    )
}
