'use client'

import * as React from 'react'
import { LayoutDashboard, Settings, Laptop, Users, BookOpen } from 'lucide-react'

import Link from 'next/link'

import { NavMain } from '@/components/nav-main'
import { NavUser } from '@/components/nav-user'
import { useDeviceStatsQuery } from '@/hooks/useDevicesQuery'
import { useEndUserStatsQuery } from '@/hooks/useEndUsersQuery'
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
          <Link
            href="/devices"
            className="hover:bg-muted/50 bg-primary/5 flex items-center gap-2 rounded-md px-3 py-2 transition-colors"
          >
            <Laptop className="text-primary h-4 w-4" />
            <div>
              <p className="text-sm font-bold">{totalDevices}</p>
              <p className="text-muted-foreground text-[10px]">Thiết bị</p>
            </div>
          </Link>
          <Link
            href="/end-user"
            className="hover:bg-muted/50 flex items-center gap-2 rounded-md bg-blue-500/5 px-3 py-2 transition-colors"
          >
            <Users className="h-4 w-4 text-blue-500" />
            <div>
              <p className="text-sm font-bold">{totalUsers}</p>
              <p className="text-muted-foreground text-[10px]">Người dùng</p>
            </div>
          </Link>
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
          title: 'End-Users',
          url: '/end-user',
          icon: Users,
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
                <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
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
