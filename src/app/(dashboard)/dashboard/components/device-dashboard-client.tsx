'use client'

import { SectionCards } from './section-cards'
import { HardwareOverview } from '@/components/dashboard/HardwareOverview'
import { RecentActivity } from '@/components/dashboard/RecentActivity'
import { DeviceStatusChart } from '@/components/dashboard/DeviceStatusChart'
import { OSDistributionChart } from '@/components/dashboard/OSDistributionChart'
import { useDevicesQuery } from '@/hooks/useDevicesQuery'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, LayoutDashboard } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function DeviceDashboardClient() {
  const { data: devices = [] } = useDevicesQuery()
  const router = useRouter()

  // Empty dashboard state
  if (devices.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 p-4 pt-0">
        <Card className="w-full max-w-lg text-center">
          <CardHeader>
            <div className="bg-muted mx-auto mb-2 rounded-full p-4">
              <LayoutDashboard className="text-muted-foreground h-8 w-8" aria-hidden="true" />
            </div>
            <CardTitle className="text-xl">Chào mừng đến IT Asset Management</CardTitle>
            <CardDescription>
              Import file Excel (.xlsx) để bắt đầu theo dõi và quản lý thiết bị IT.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button size="lg" onClick={() => router.push('/devices')}>
              <Upload className="mr-2 h-5 w-5" aria-hidden="true" />
              Import thiết bị
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 p-4 lg:px-6">
      {/* Visually hidden h1 for screen readers */}
      <h1 className="sr-only">Device Management Dashboard</h1>

      {/* Row 1 — Stats Cards (4 cột) */}
      <SectionCards devices={devices} />

      {/* Row 2 — Charts: Trạng thái thiết bị + Phân bổ OS (full width, 50/50) */}
      <div className="grid gap-4 lg:grid-cols-2">
        <DeviceStatusChart devices={devices} />
        <OSDistributionChart devices={devices} />
      </div>

      {/* Row 3 — Hardware Overview (2/3) + Recent Activity (1/3) */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <HardwareOverview devices={devices} />
        </div>
        <RecentActivity devices={devices} />
      </div>
    </div>
  )
}
