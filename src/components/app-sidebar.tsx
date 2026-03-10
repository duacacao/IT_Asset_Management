'use client'

import * as React from 'react'
import { LayoutDashboard, Settings, Laptop, Users, BookOpen, UsersRound } from 'lucide-react'

import Link from 'next/link'

import { NavMain } from '@/components/nav-main'
import { NavUser } from '@/components/nav-user'
import { Logo } from '@/components/logo'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { useIsAdmin } from '@/hooks/usePermission'


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const isAdmin = useIsAdmin()

  // Xây dựng menu items cho Cài đặt — thêm "Thành viên" nếu admin+
  const settingsItems = [
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
  ]

  // Admin+ thấy link "Thành viên" — member/viewer không thấy
  if (isAdmin) {
    settingsItems.splice(0, 0, {
      title: 'Thành viên',
      url: '/settings/members',
    })
  }

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
              title: 'Phòng ban & Chức vụ',
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
          items: settingsItems,
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

