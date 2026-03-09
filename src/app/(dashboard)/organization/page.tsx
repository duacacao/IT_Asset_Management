'use client'

import dynamic from 'next/dynamic'
import { useOrganizationQuery } from '@/hooks/queries/organizationQueries'
import { AppLoader } from '@/components/ui/app-loader'
import { AlertTriangle, RefreshCw, Network } from 'lucide-react'
import { Button } from '@/components/ui/button'

const OrganizationChart = dynamic(
  () =>
    import('@/components/dashboard/org-chart/OrganizationChart').then((mod) => mod.OrganizationChart),
  { ssr: false, loading: () => <AppLoader layout="vertical" text="Đang tải sơ đồ tổ chức..." /> }
)

export default function OrganizationPage() {
  const { data: departments, isLoading, error, refetch } = useOrganizationQuery()

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center">
        <AppLoader layout="vertical" text="Đang tải sơ đồ tổ chức..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-[calc(100vh-64px)] flex-col items-center justify-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 shadow-sm dark:bg-red-950">
          <AlertTriangle className="h-7 w-7 text-red-500" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold">Không thể tải dữ liệu</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {error.message || 'Đã xảy ra lỗi khi tải sơ đồ tổ chức'}
          </p>
        </div>
        <Button
          onClick={() => refetch()}
          variant="outline"
          className="mt-2 cursor-pointer gap-2 rounded-xl"
        >
          <RefreshCw className="h-4 w-4" />
          Thử lại
        </Button>
      </div>
    )
  }

  if (!departments || departments.length === 0) {
    return (
      <div className="flex h-[calc(100vh-64px)] flex-col items-center justify-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 shadow-sm dark:bg-amber-950">
          <Network className="h-7 w-7 text-amber-500" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold">Chưa có dữ liệu</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Hãy tạo phòng ban và chức vụ trước khi xem sơ đồ tổ chức
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col">
      {/* Chart container */}
      <div className="mx-4 mt-4 mb-4 flex-1 overflow-hidden rounded-xl border-none bg-white shadow-md dark:bg-card lg:mx-6">
        <OrganizationChart departments={departments} />
      </div>
    </div>
  )
}
