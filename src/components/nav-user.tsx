'use client'

import { useState } from 'react'
import { EllipsisVertical, LogOut, CircleUser, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { useAuth } from '@/contexts/AuthContext'
import { RoleBadge } from '@/components/permission/RoleBadge'

// Parse display name từ email — capitalize chữ cái đầu
function getDisplayName(email: string | undefined): string {
  if (!email) return 'User'
  // Lấy phần trước @ và capitalize
  const username = email.split('@')[0]
  return username.charAt(0).toUpperCase() + username.slice(1)
}

export function NavUser() {
  const { isMobile } = useSidebar()
  const { user, isLoading, isLoggingOut, logout, organization, role, refreshAuth } = useAuth()
  const [isSyncing, setIsSyncing] = useState(false)

  // Handler: Đồng bộ quyền thủ công
  const handleSync = async () => {
    setIsSyncing(true)
    try {
      await refreshAuth()
      toast.success('Đã đồng bộ vai trò mới nhất')
    } catch {
      toast.error('Không thể đồng bộ. Vui lòng thử lại.')
    } finally {
      setIsSyncing(false)
    }
  }

  // Lấy thông tin từ Supabase Auth user object
  const displayName = user?.user_metadata?.full_name || getDisplayName(user?.email)
  const displayEmail = user?.email || ''
  const orgName = organization?.name || ''

  // Trạng thái đang đăng xuất — hiện text thay vì skeleton
  if (isLoggingOut) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" disabled>
            <div className="bg-muted flex h-8 w-8 shrink-0 items-center justify-center rounded-xl">
              <LogOut className="text-muted-foreground size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="text-muted-foreground truncate font-medium">Đang đăng xuất...</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  // Skeleton chỉ cho initial auth check — tránh flash "User" sau redirect
  if (isLoading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" className="animate-pulse">
            <div className="bg-muted flex h-8 w-8 shrink-0 items-center justify-center rounded-xl" />
            <div className="grid flex-1 gap-1">
              <div className="bg-muted h-3 w-20 rounded" />
              <div className="bg-muted h-2 w-28 rounded" />
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  // Không có user và không loading — middleware sẽ redirect
  if (!user) {
    return null
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer rounded-xl transition-colors duration-300"
            >
              <div className="dark:bg-card text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                <CircleUser className="size-5" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <div className="flex items-center gap-1.5">
                  <span className="truncate font-medium">{displayName}</span>
                  {role && <RoleBadge role={role} className="h-4 px-1.5 py-0 text-[10px]" />}
                </div>
                <span className="text-muted-foreground truncate text-xs">
                  {orgName || displayEmail}
                </span>
              </div>
              <EllipsisVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="border-border/50 w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-xl border shadow-md"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <div className="dark:bg-card text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                  <CircleUser className="size-5" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate font-medium">{displayName}</span>
                    {role && <RoleBadge role={role} className="h-4 px-1.5 py-0 text-[10px]" />}
                  </div>
                  <span className="text-muted-foreground truncate text-xs">
                    {orgName || displayEmail}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href="/settings/account">
                  <CircleUser />
                  Tài khoản
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={handleSync}
                disabled={isSyncing}
              >
                <RefreshCw className={isSyncing ? 'animate-spin' : ''} />
                {isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ quyền'}
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer" onClick={logout}>
              <LogOut />
              Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
