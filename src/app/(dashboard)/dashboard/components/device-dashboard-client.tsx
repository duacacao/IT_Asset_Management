'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { SectionCards } from './section-cards'
import { useDevicesQuery } from '@/hooks/useDevicesQuery'
import { useEndUsersQuery } from '@/hooks/queries/endUserQueries'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, LayoutDashboard } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Skeleton } from '@/components/ui/skeleton'

const RecentActivity = dynamic(
  () => import('@/components/dashboard/RecentActivity').then((mod) => mod.RecentActivity),
  { ssr: false, loading: () => <ActivitySkeleton /> }
)

const DeviceStatusChart = dynamic(
  () => import('@/components/dashboard/DeviceStatusChart').then((mod) => mod.DeviceStatusChart),
  { ssr: false }
)

const DepartmentChart = dynamic(
  () => import('@/components/dashboard/DepartmentChart').then((mod) => mod.DepartmentChart),
  { ssr: false }
)

const HardwareOverview = dynamic(
  () => import('@/components/dashboard/HardwareOverview').then((mod) => mod.HardwareOverview),
  { ssr: false }
)

function ChartSkeleton() {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-24" />
      </CardHeader>
      <CardContent className="flex flex-1 items-center justify-center pb-4">
        <Skeleton className="h-48 w-48 rounded-full" />
      </CardContent>
    </Card>
  )
}

function ActivitySkeleton() {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-24" />
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3 pb-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export function DeviceDashboardClient() {
  const { data: devices = [] } = useDevicesQuery()
  const { data: endUsers = [] } = useEndUsersQuery()
  const router = useRouter()

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
      <h1 className="sr-only">Device Management Dashboard</h1>

      {/* Row 1 — Stats Cards */}
      <SectionCards devices={devices} endUsers={endUsers} />

      {/* Row 2 — Charts: Device Status + Department Distribution */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Suspense fallback={<ChartSkeleton />}>
          <DeviceStatusChart devices={devices} />
        </Suspense>
        <Suspense fallback={<ChartSkeleton />}>
          <DepartmentChart endUsers={endUsers} />
        </Suspense>
      </div>

      {/* Row 3 — Hardware Overview + Recent Activity */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Suspense fallback={<ChartSkeleton />}>
          <HardwareOverview devices={devices} />
        </Suspense>
        <Suspense fallback={<ActivitySkeleton />}>
          <RecentActivity devices={devices} endUsers={endUsers} />
        </Suspense>
      </div>
    </div>
  )
}
