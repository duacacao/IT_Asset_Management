'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { ModeToggle } from '@/components/mode-toggle'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

// ============================================
// Route → Breadcrumb label mapping
// Static routes chỉ cần khai báo tên hiển thị
// Dynamic routes ([id], [slug]) xử lý riêng bên dưới
// ============================================
const ROUTE_LABELS: Record<string, string> = {
  '/dashboard': 'Bảng điều khiển',
  '/devices': 'Thiết bị',
  '/end-user': 'Thông tin nhân viên',
  '/department': 'Phòng ban & Chức vụ',
  '/users': 'Nhân sự',
  '/organization': 'Sơ đồ tổ chức',
  '/permission': 'Quản trị & Phân quyền',
  '/settings': 'Cài đặt',
  '/settings/account': 'Tài khoản',
  '/settings/appearance': 'Giao diện',
  '/settings/history': 'Lịch sử hệ thống',
}

// Parent group labels cho breadcrumb hierarchy
const ROUTE_PARENTS: Record<string, { label: string; href: string }[]> = {
  '/end-user': [{ label: 'Nhân viên', href: '/end-user' }],
  '/department': [{ label: 'Nhân viên', href: '/end-user' }],
  '/organization': [{ label: 'Nhân viên', href: '/end-user' }],
  '/settings/account': [{ label: 'Cài đặt', href: '/settings/account' }],
  '/settings/appearance': [{ label: 'Cài đặt', href: '/settings/account' }],
  '/settings/history': [{ label: 'Cài đặt', href: '/settings/account' }],
}

/**
 * Build breadcrumb items từ pathname hiện tại
 * Trả về array { label, href?, isCurrentPage }
 */
function useBreadcrumbs() {
  const pathname = usePathname()

  return React.useMemo(() => {
    const crumbs: { label: string; href?: string; isCurrentPage: boolean }[] = []

    // Dynamic route: /device/[id] → "Thiết bị > Chi tiết"
    if (pathname.startsWith('/device/')) {
      crumbs.push({ label: 'Thiết bị', href: '/devices', isCurrentPage: false })
      crumbs.push({ label: 'Chi tiết thiết bị', isCurrentPage: true })
      return crumbs
    }

    // Static routes: check parents first
    const parents = ROUTE_PARENTS[pathname]
    if (parents) {
      for (const parent of parents) {
        crumbs.push({ label: parent.label, href: parent.href, isCurrentPage: false })
      }
    }

    // Current page label
    const currentLabel = ROUTE_LABELS[pathname]
    if (currentLabel) {
      // Nếu là parent group (e.g. "/settings"), chỉ hiển thị 1 crumb
      const isAlsoParent = parents?.some((p) => p.label === currentLabel)
      if (!isAlsoParent) {
        crumbs.push({ label: currentLabel, isCurrentPage: true })
      }
    }

    return crumbs
  }, [pathname])
}

export function SiteHeader() {
  const breadcrumbs = useBreadcrumbs()

  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 flex h-(--header-height) w-full shrink-0 items-center gap-2 border-b backdrop-blur transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 py-3 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />

        {/* Breadcrumb */}
        {breadcrumbs.length > 0 && (
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={crumb.label + index}>
                  {index > 0 && <BreadcrumbSeparator />}
                  <BreadcrumbItem>
                    {crumb.isCurrentPage ? (
                      <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link href={crumb.href!}>{crumb.label}</Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        )}

        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" asChild size="sm" className="hidden sm:flex">
            <a
              href="https://github.com/zaza04/IT_Asset_Management"
              rel="noopener noreferrer"
              target="_blank"
              className="dark:text-foreground"
            >
              GitHub
            </a>
          </Button>
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}
