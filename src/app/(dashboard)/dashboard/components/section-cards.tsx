'use client'

import * as React from 'react'
import { Monitor, Users, Link2, AlertTriangle } from 'lucide-react'

import { Device } from '@/types/device'
import { EndUserWithDevice } from '@/types/end-user'

interface SectionCardsProps {
  devices: Device[]
  endUsers: EndUserWithDevice[]
}

interface StatCardProps {
  title: string
  value: number
  subtitle: React.ReactNode
  icon: React.ReactNode
  iconBg: string
  iconColor: string
}

function StatCard({ title, value, subtitle, icon, iconBg, iconColor }: StatCardProps) {
  return (
    <div className="relative overflow-hidden rounded-xl border-none bg-white p-5 shadow-md dark:bg-card">
      <div className="mb-4 flex items-center justify-between">
        {/* Icon bubble */}
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full shadow-sm ${iconBg}`}
        >
          <span className={iconColor}>
            {icon}
          </span>
        </div>
        <span className="text-xs font-medium tracking-wide text-gray-500 uppercase">{title}</span>
      </div>

      <div className="text-3xl font-bold tabular-nums text-foreground">{value}</div>
      <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
    </div>
  )
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
      <StatCard
        title="Tổng thiết bị"
        value={stats.totalDevices}
        subtitle={
          <>
            <span className="font-medium text-primary">{stats.assignedDevices}</span> đang được bàn giao
          </>
        }
        icon={<Monitor className="h-5 w-5" aria-hidden="true" />}
        iconBg="bg-blue-50 dark:bg-blue-950/50"
        iconColor="text-primary"
      />

      {/* 2. Sẵn sàng */}
      <StatCard
        title="Sẵn sàng (Active)"
        value={stats.activeDevices}
        subtitle="Sẵn sàng để cấp phát mới"
        icon={<Link2 className="h-5 w-5" aria-hidden="true" />}
        iconBg="bg-emerald-50 dark:bg-emerald-950/50"
        iconColor="text-emerald-600"
      />

      {/* 3. Đang sửa chữa */}
      <StatCard
        title="Đang sửa chữa"
        value={stats.brokenDevices}
        subtitle="Cần theo dõi bảo hành"
        icon={<AlertTriangle className="h-5 w-5" aria-hidden="true" />}
        iconBg="bg-red-50 dark:bg-red-950/50"
        iconColor="text-red-600"
      />

      {/* 4. Lưu kho */}
      <StatCard
        title="Lưu kho"
        value={stats.inactiveDevices}
        subtitle="Trong kho dự phòng"
        icon={<Monitor className="h-5 w-5" aria-hidden="true" />}
        iconBg="bg-slate-100 dark:bg-slate-800"
        iconColor="text-slate-500 dark:text-slate-400"
      />
    </div>
  )
}
