'use client'

import * as React from 'react'
import { Monitor, Users, Link2, AlertTriangle } from 'lucide-react'

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
import { EndUserWithDevice } from '@/types/end-user'

interface SectionCardsProps {
  devices: Device[]
  endUsers: EndUserWithDevice[]
}

export function SectionCards({ devices, endUsers }: SectionCardsProps) {
  const stats = React.useMemo(() => {
    const totalDevices = devices.length
    const activeDevices = devices.filter((d) => (d.status ?? 'active') === 'active').length
    const brokenDevices = devices.filter((d) => d.status === 'broken').length
    const inactiveDevices = devices.filter((d) => d.status === 'inactive').length

    const totalUsers = endUsers.length
    const usersWithDevices = endUsers.filter((u) => u.devices && u.devices.length > 0).length
    const usersWithoutDevices = totalUsers - usersWithDevices

    const assignedDevices = devices.filter((d) => d.assignment && d.assignment.assignee_name).length
    const assignmentRate = totalDevices > 0 ? Math.round((assignedDevices / totalDevices) * 100) : 0

    const deviceIssues = brokenDevices + inactiveDevices

    return {
      totalDevices,
      activeDevices,
      brokenDevices,
      inactiveDevices,
      totalUsers,
      usersWithDevices,
      usersWithoutDevices,
      assignedDevices,
      assignmentRate,
      deviceIssues,
    }
  }, [devices, endUsers])

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs sm:grid-cols-2 xl:grid-cols-4">
      {/* Thiết bị */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Thiết bị</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.totalDevices}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <Monitor className="size-3" aria-hidden="true" />
              Tổng
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {stats.activeDevices} đang hoạt động
          </div>
          <div className="text-muted-foreground">
            {stats.assignedDevices} đã bàn giao ({stats.assignmentRate}%)
          </div>
        </CardFooter>
      </Card>

      {/* Người dùng */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Người dùng</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.totalUsers}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="border-blue-200 text-blue-600">
              <Users className="size-3" aria-hidden="true" />
              End-users
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {stats.usersWithDevices} có thiết bị
          </div>
          <div className="text-muted-foreground">
            {stats.usersWithoutDevices > 0
              ? `${stats.usersWithoutDevices} chưa được gán`
              : 'Tất cả đã có thiết bị'}
          </div>
        </CardFooter>
      </Card>

      {/* Đang bàn giao */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Đang bàn giao</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.assignedDevices}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="border-emerald-200 text-emerald-600">
              <Link2 className="size-3" aria-hidden="true" />
              {stats.assignmentRate}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Tỷ lệ sử dụng {stats.assignmentRate}%
          </div>
          <div className="text-muted-foreground">
            {stats.totalDevices - stats.assignedDevices} thiết bị sẵn sàng
          </div>
        </CardFooter>
      </Card>

      {/* Cần chú ý */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Cần chú ý</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.deviceIssues + stats.usersWithoutDevices}
          </CardTitle>
          <CardAction>
            <Badge
              variant="outline"
              className={
                stats.deviceIssues + stats.usersWithoutDevices > 0
                  ? 'border-amber-200 text-amber-600'
                  : ''
              }
            >
              <AlertTriangle className="size-3" aria-hidden="true" />
              Issues
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {stats.deviceIssues > 0 && <>{stats.deviceIssues} thiết bị</>}
            {stats.deviceIssues > 0 && stats.usersWithoutDevices > 0 && ' · '}
            {stats.usersWithoutDevices > 0 && <>{stats.usersWithoutDevices} chưa gán</>}
            {stats.deviceIssues === 0 && stats.usersWithoutDevices === 0 && 'Tất cả tốt'}
          </div>
          <div className="text-muted-foreground">
            {stats.brokenDevices > 0 ? `${stats.brokenDevices} hư hỏng` : 'Không có vấn đề'}
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
