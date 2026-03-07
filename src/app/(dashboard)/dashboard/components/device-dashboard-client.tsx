'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { SectionCards } from './section-cards'
import { useDevicesQuery } from '@/hooks/useDevicesQuery'
import { useEndUsersQuery } from '@/hooks/queries/endUserQueries'
import { Button } from '@/components/ui/button'
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
    <div className="relative overflow-hidden rounded-xl border-none bg-white p-5 shadow-md dark:bg-card">
      <div className="mb-4 flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-3 w-32" />
      </div>
      <div className="flex items-center justify-center py-6">
        <Skeleton className="h-48 w-48 rounded-full" />
      </div>
    </div>
  )
}

function ActivitySkeleton() {
  return (
    <div className="relative overflow-hidden rounded-xl border-none bg-white p-5 shadow-md dark:bg-card">
      <div className="mb-4 flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-3 w-40" />
      </div>
      <div className="flex flex-col gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3 px-2 py-2">
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function DeviceDashboardClient() {
  const { data: devices = [] } = useDevicesQuery()
  const { data: endUsers = [] } = useEndUsersQuery()
  const router = useRouter()

  if (devices.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 p-4 pt-0">
        <div className="group relative w-full max-w-lg overflow-hidden rounded-xl border-none bg-white p-8 text-center shadow-md dark:bg-card">
          {/* Top accent bar */}
          <div className="absolute top-0 left-0 h-1 w-full bg-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 shadow-sm dark:bg-blue-950/50">
            <LayoutDashboard className="h-8 w-8 text-primary" aria-hidden="true" />
          </div>

          <h2 className="mb-2 text-xl font-bold tracking-tight text-foreground">
            Chào mừng đến IT Asset Management
          </h2>
          <p className="mb-6 text-sm text-muted-foreground">
            Import file Excel (.xlsx) để bắt đầu theo dõi và quản lý thiết bị IT.
          </p>
          <Button size="lg" className="rounded-xl" onClick={() => router.push('/devices')}>
            <Upload className="mr-2 h-5 w-5" aria-hidden="true" />
            Import thiết bị
          </Button>
        </div>
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
