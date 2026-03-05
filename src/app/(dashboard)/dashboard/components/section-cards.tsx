'use client'

import * as React from 'react'
import { Monitor, Users, Link2, AlertTriangle } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
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
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {/* 1. Tổng số thiết bị */}
      <Card className="rounded-xl border-none bg-white shadow-md transition-all hover:shadow-lg dark:bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Tổng số thiết bị</CardTitle>
          <div className="rounded-full bg-blue-50 p-2 dark:bg-blue-950/50">
            <Monitor className="size-4 text-primary" aria-hidden="true" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold tabular-nums text-foreground">{stats.totalDevices}</div>
          <p className="mt-1 text-sm text-muted-foreground">
            <span className="font-medium text-primary">{stats.assignedDevices}</span> đang được bàn giao
          </p>
        </CardContent>
      </Card>

      {/* 2. Sẵn sàng */}
      <Card className="rounded-xl border-none bg-white shadow-md transition-all hover:shadow-lg dark:bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Sẵn sàng (Active)</CardTitle>
          <div className="rounded-full bg-emerald-50 p-2 dark:bg-emerald-950/50">
            <Link2 className="size-4 text-emerald-600" aria-hidden="true" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold tabular-nums text-foreground">{stats.activeDevices}</div>
          <p className="mt-1 text-sm text-muted-foreground">
            Sẵn sàng để cấp phát mới
          </p>
        </CardContent>
      </Card>

      {/* 3. Đang sửa chữa */}
      <Card className="rounded-xl border-none bg-white shadow-md transition-all hover:shadow-lg dark:bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Đang sửa chữa</CardTitle>
          <div className="rounded-full bg-red-50 p-2 dark:bg-red-950/50">
            <AlertTriangle className="size-4 text-red-600" aria-hidden="true" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold tabular-nums text-foreground">{stats.brokenDevices}</div>
          <p className="mt-1 text-sm text-muted-foreground">
            Cần theo dõi bảo hành
          </p>
        </CardContent>
      </Card>

      {/* 4. Lưu kho */}
      <Card className="rounded-xl border-none bg-white shadow-md transition-all hover:shadow-lg dark:bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Lưu kho</CardTitle>
          <div className="rounded-full bg-slate-100 p-2 dark:bg-slate-800">
            <Monitor className="size-4 text-slate-500 dark:text-slate-400" aria-hidden="true" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold tabular-nums text-foreground">{stats.inactiveDevices}</div>
          <p className="mt-1 text-sm text-muted-foreground">
            Trong kho dự phòng
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
