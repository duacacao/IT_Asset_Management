'use client'

import * as React from 'react'
import { LayoutDashboard, Settings, Laptop, Users, BookOpen } from 'lucide-react'

import Link from 'next/link'

import { NavMain } from '@/components/nav-main'
import { NavUser } from '@/components/nav-user'
import { useDeviceStatsQuery } from '@/hooks/useDevicesQuery'
import { useEndUserStatsQuery } from '@/hooks/queries/endUserQueries'
import { Logo } from '@/components/logo'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  useSidebar,
} from '@/components/ui/sidebar'

function SidebarQuickStats() {
  const { data: deviceStats } = useDeviceStatsQuery()
  const { data: endUserStats } = useEndUserStatsQuery()
  const { state } = useSidebar()

  if (state === 'collapsed') return null

  const totalDevices = deviceStats?.total ?? 0
  const totalUsers = endUserStats?.total ?? 0

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Thống kê nhanh</SidebarGroupLabel>
      <div className="px-2 py-1">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center justify-center gap-2 rounded-xl bg-teal-500/5 px-3 py-2 cursor-pointer hover:bg-teal-500/10 transition-colors duration-300">
            <Laptop className="h-4 w-4 text-teal-500" />
            <p className="text-sm font-bold">{totalDevices}</p>
          </div>
          <div className="flex items-center justify-center gap-2 rounded-xl bg-blue-500/5 px-3 py-2 cursor-pointer hover:bg-blue-500/10 transition-colors duration-300">
            <Users className="h-4 w-4 text-blue-500" />
            <p className="text-sm font-bold">{totalUsers}</p>
          </div>
        </div>
      </div>
    </SidebarGroup>
  )
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const navGroups = [
    {
      label: 'Tổng quan',
      items: [
        {
          title: 'Bảng điều khiển',
          url: '/dashboard',
          icon: LayoutDashboard,
        },
        {
          title: 'Thiết bị',
          url: '/devices',
          icon: Laptop,
        },
        {
          title: 'Nhân viên',
          url: '#',
          icon: Users,
          items: [
            {
              title: 'Thông tin nhân viên',
              url: '/end-user',
            },
            {
              title: 'Phòng ban',
              url: '/department',
            },
            {
              title: 'Sơ đồ tổ chức',
              url: '/organization',
            },
          ],
        },
      ],
    },
    {
      label: 'Hệ thống',
      items: [
        {
          title: 'Tài liệu',
          url: '/docs',
          icon: BookOpen,
        },
        {
          title: 'Cài đặt',
          url: '#',
          icon: Settings,
          items: [
            {
              title: 'Tài khoản',
              url: '/settings/account',
            },
            {
              title: 'Giao diện',
              url: '/settings/appearance',
            },
            {
              title: 'Lịch sử hệ thống',
              url: '/settings/history',
            },
          ],
        },
      ],
    },
  ]

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-xl shadow-sm">
                  <Logo size={24} className="text-current" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">IT Asset Management</span>
                  <span className="truncate text-xs">Quản lý tài sản</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarQuickStats />
        {navGroups.map((group) => (
          <NavMain key={group.label} label={group.label} items={group.items} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
