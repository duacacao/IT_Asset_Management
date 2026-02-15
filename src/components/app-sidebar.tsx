"use client"

import * as React from "react"
import {
  LayoutDashboard,
  Settings,
  Laptop,
  Users,
  BookOpen,
} from "lucide-react"

import Link from "next/link"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { useDevicesQuery, useDeviceStatsQuery } from "@/hooks/useDevicesQuery"
import { Badge } from "@/components/ui/badge"
import { Logo } from "@/components/logo"
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
} from "@/components/ui/sidebar"


// Mini stats component — ẩn khi sidebar collapsed (icon mode)
function SidebarQuickStats() {
  const { data: stats } = useDeviceStatsQuery()
  const { state } = useSidebar()

  if (!stats || state === "collapsed") return null

  const { active, broken, inactive } = stats

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Thống kê nhanh</SidebarGroupLabel>
      <div className="px-2 py-1">
        <div className="grid grid-cols-3 gap-1.5 text-center">
          <div className="rounded-md bg-emerald-500/10 px-1.5 py-1.5">
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{active}</p>
            <p className="text-[10px] text-muted-foreground">Hoạt động</p>
          </div>
          <div className="rounded-md bg-red-500/10 px-1.5 py-1.5">
            <p className="text-sm font-bold text-red-600 dark:text-red-400">{broken}</p>
            <p className="text-[10px] text-muted-foreground">Hư hỏng</p>
          </div>
          <div className="rounded-md bg-gray-500/10 px-1.5 py-1.5">
            <p className="text-sm font-bold text-gray-600 dark:text-gray-400">{inactive}</p>
            <p className="text-[10px] text-muted-foreground">Không dùng</p>
          </div>
        </div>
      </div>
    </SidebarGroup>
  )
}

// Device count badge cho nav item
function DeviceCountBadge() {
  const { data: devices = [] } = useDevicesQuery()
  if (devices.length === 0) return null
  return (
    <Badge variant="secondary" className="ml-auto h-5 min-w-5 px-1.5 text-[10px] font-semibold">
      {devices.length}
    </Badge>
  )
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const navGroups = [
    {
      label: "Tổng quan",
      items: [
        {
          title: "Bảng điều khiển",
          url: "/dashboard",
          icon: LayoutDashboard,
        },
        {
          title: "Thiết bị",
          url: "/devices",
          icon: Laptop,
          badge: <DeviceCountBadge />,
        },
        {
          title: "End-Users",
          url: "/end-user",
          icon: Users,
        },
      ],
    },
    {
      label: "Hệ thống",
      items: [
        {
          title: "Tài liệu",
          url: "/docs",
          icon: BookOpen,
        },
        {
          title: "Cài đặt",
          url: "#",
          icon: Settings,
          items: [
            {
              title: "Tài khoản",
              url: "/settings/account",
            },
            {
              title: "Giao diện",
              url: "/settings/appearance",
            },
          ],
        },
      ],
    },
  ]

  // ... imports

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
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
