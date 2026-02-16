'use client'

import * as React from 'react'
import { Monitor, CheckCircle2, AlertTriangle, Layers } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Device } from '@/types/device'

interface SectionCardsProps {
  devices: Device[]
}

export function SectionCards({ devices }: SectionCardsProps) {
  const stats = React.useMemo(() => {
    const total = devices.length
    const active = devices.filter((d) => (d.status ?? 'active') === 'active').length
    const broken = devices.filter((d) => d.status === 'broken').length
    const inactive = devices.filter((d) => d.status === 'inactive').length
    const totalSheets = devices.reduce((sum, d) => sum + Object.keys(d.sheets).length, 0)
    const avgSheets = total > 0 ? (totalSheets / total).toFixed(1) : '0'
    const activePercent = total > 0 ? Math.round((active / total) * 100) : 0
    const issueCount = broken + inactive

    return { total, active, broken, inactive, totalSheets, avgSheets, activePercent, issueCount }
  }, [devices])

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs sm:grid-cols-2 xl:grid-cols-4">
      {/* Tổng số thiết bị */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Tổng thiết bị</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.total}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <Monitor className="size-3" aria-hidden="true" />
              Thiết bị
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {stats.totalSheets} sheets được quản lý
          </div>
          <div className="text-muted-foreground">Trung bình {stats.avgSheets} sheet/thiết bị</div>
        </CardFooter>
      </Card>

      {/* Thiết bị hoạt động */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Đang hoạt động</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.active}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="border-emerald-200 text-emerald-600">
              <CheckCircle2 className="size-3" aria-hidden="true" />
              {stats.activePercent}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {stats.activePercent}% thiết bị hoạt động{' '}
            <CheckCircle2 className="size-4 text-emerald-500" aria-hidden="true" />
          </div>
          <div className="text-muted-foreground">Trên tổng {stats.total} thiết bị</div>
        </CardFooter>
      </Card>

      {/* Thiết bị cần chú ý */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Cần chú ý</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.issueCount}
          </CardTitle>
          <CardAction>
            <Badge
              variant="outline"
              className={stats.issueCount > 0 ? 'border-amber-200 text-amber-600' : ''}
            >
              <AlertTriangle className="size-3" aria-hidden="true" />
              {stats.broken} hư hỏng
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {stats.broken > 0 && <>{stats.broken} hư hỏng</>}
            {stats.broken > 0 && stats.inactive > 0 && ' · '}
            {stats.inactive > 0 && <>{stats.inactive} không dùng</>}
            {stats.issueCount === 0 && 'Tất cả hoạt động tốt'}
          </div>
          <div className="text-muted-foreground">
            {stats.issueCount > 0 ? 'Cần kiểm tra bảo trì' : 'Không có vấn đề'}
          </div>
        </CardFooter>
      </Card>

      {/* Tổng sheets */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Tổng Sheets</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.totalSheets}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <Layers className="size-3" aria-hidden="true" />
              Dữ liệu
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {stats.avgSheets} sheets trung bình <Layers className="size-4" aria-hidden="true" />
          </div>
          <div className="text-muted-foreground">Dữ liệu từ {stats.total} thiết bị</div>
        </CardFooter>
      </Card>
    </div>
  )
}
