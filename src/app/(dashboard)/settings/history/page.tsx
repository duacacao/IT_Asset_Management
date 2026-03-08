'use client'

import { useState } from 'react'
import { useActivityLogsQuery } from '@/hooks/queries/activityLogQueries'
import { ACTIVITY_LOG_ACTIONS } from '@/constants/activity-log'
import type { ActivityLogWithRelations } from '@/app/actions/activity-logs'
import { timeAgo } from '@/lib/time'
import { AppLoader } from '@/components/ui/app-loader'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ScrollText,
  Plus,
  Pencil,
  Trash2,
  LogIn,
  LogOut,
  Upload,
  Download,
  UserCheck,
  Undo2,
  Wrench,
  ChevronLeft,
  ChevronRight,
  Activity,
  User,
  Laptop,
  Clock,
  Filter,
} from 'lucide-react'

// ============================================
// Action config — màu sắc + icon + label tiếng Việt
// ============================================
const ACTION_CONFIG: Record<
  string,
  {
    label: string
    icon: React.ComponentType<{ className?: string }>
    color: string
    bgLight: string
    bgDark: string
    borderLight: string
    borderDark: string
    textLight: string
    textDark: string
  }
> = {
  create: {
    label: 'Tạo mới',
    icon: Plus,
    color: 'text-emerald-600 dark:text-emerald-400',
    bgLight: 'bg-emerald-50',
    bgDark: 'dark:bg-emerald-950/40',
    borderLight: 'border-emerald-200',
    borderDark: 'dark:border-emerald-800',
    textLight: 'text-emerald-700',
    textDark: 'dark:text-emerald-400',
  },
  update: {
    label: 'Cập nhật',
    icon: Pencil,
    color: 'text-blue-600 dark:text-blue-400',
    bgLight: 'bg-blue-50',
    bgDark: 'dark:bg-blue-950/40',
    borderLight: 'border-blue-200',
    borderDark: 'dark:border-blue-800',
    textLight: 'text-blue-700',
    textDark: 'dark:text-blue-400',
  },
  delete: {
    label: 'Xóa',
    icon: Trash2,
    color: 'text-red-600 dark:text-red-400',
    bgLight: 'bg-red-50',
    bgDark: 'dark:bg-red-950/40',
    borderLight: 'border-red-200',
    borderDark: 'dark:border-red-800',
    textLight: 'text-red-700',
    textDark: 'dark:text-red-400',
  },
  login: {
    label: 'Đăng nhập',
    icon: LogIn,
    color: 'text-indigo-600 dark:text-indigo-400',
    bgLight: 'bg-indigo-50',
    bgDark: 'dark:bg-indigo-950/40',
    borderLight: 'border-indigo-200',
    borderDark: 'dark:border-indigo-800',
    textLight: 'text-indigo-700',
    textDark: 'dark:text-indigo-400',
  },
  logout: {
    label: 'Đăng xuất',
    icon: LogOut,
    color: 'text-slate-600 dark:text-slate-400',
    bgLight: 'bg-slate-50',
    bgDark: 'dark:bg-slate-950/40',
    borderLight: 'border-slate-200',
    borderDark: 'dark:border-slate-800',
    textLight: 'text-slate-700',
    textDark: 'dark:text-slate-400',
  },
  import: {
    label: 'Nhập dữ liệu',
    icon: Upload,
    color: 'text-violet-600 dark:text-violet-400',
    bgLight: 'bg-violet-50',
    bgDark: 'dark:bg-violet-950/40',
    borderLight: 'border-violet-200',
    borderDark: 'dark:border-violet-800',
    textLight: 'text-violet-700',
    textDark: 'dark:text-violet-400',
  },
  export: {
    label: 'Xuất dữ liệu',
    icon: Download,
    color: 'text-cyan-600 dark:text-cyan-400',
    bgLight: 'bg-cyan-50',
    bgDark: 'dark:bg-cyan-950/40',
    borderLight: 'border-cyan-200',
    borderDark: 'dark:border-cyan-800',
    textLight: 'text-cyan-700',
    textDark: 'dark:text-cyan-400',
  },
  assign: {
    label: 'Gán thiết bị',
    icon: UserCheck,
    color: 'text-amber-600 dark:text-amber-400',
    bgLight: 'bg-amber-50',
    bgDark: 'dark:bg-amber-950/40',
    borderLight: 'border-amber-200',
    borderDark: 'dark:border-amber-800',
    textLight: 'text-amber-700',
    textDark: 'dark:text-amber-400',
  },
  return: {
    label: 'Thu hồi',
    icon: Undo2,
    color: 'text-orange-600 dark:text-orange-400',
    bgLight: 'bg-orange-50',
    bgDark: 'dark:bg-orange-950/40',
    borderLight: 'border-orange-200',
    borderDark: 'dark:border-orange-800',
    textLight: 'text-orange-700',
    textDark: 'dark:text-orange-400',
  },
  maintenance: {
    label: 'Bảo trì',
    icon: Wrench,
    color: 'text-teal-600 dark:text-teal-400',
    bgLight: 'bg-teal-50',
    bgDark: 'dark:bg-teal-950/40',
    borderLight: 'border-teal-200',
    borderDark: 'dark:border-teal-800',
    textLight: 'text-teal-700',
    textDark: 'dark:text-teal-400',
  },
}

const DEFAULT_ACTION_CONFIG = {
  label: 'Khác',
  icon: Activity,
  color: 'text-gray-600 dark:text-gray-400',
  bgLight: 'bg-gray-50',
  bgDark: 'dark:bg-gray-950/40',
  borderLight: 'border-gray-200',
  borderDark: 'dark:border-gray-800',
  textLight: 'text-gray-700',
  textDark: 'dark:text-gray-400',
}

function getActionConfig(action: string) {
  return ACTION_CONFIG[action] || DEFAULT_ACTION_CONFIG
}

// ============================================
// Filter labels for the Select dropdown
// ============================================
const FILTER_OPTIONS = [
  { value: 'all', label: 'Tất cả hoạt động' },
  { value: ACTIVITY_LOG_ACTIONS.CREATE, label: 'Tạo mới' },
  { value: ACTIVITY_LOG_ACTIONS.UPDATE, label: 'Cập nhật' },
  { value: ACTIVITY_LOG_ACTIONS.DELETE, label: 'Xóa' },
  { value: ACTIVITY_LOG_ACTIONS.LOGIN, label: 'Đăng nhập' },
  { value: ACTIVITY_LOG_ACTIONS.LOGOUT, label: 'Đăng xuất' },
  { value: ACTIVITY_LOG_ACTIONS.IMPORT, label: 'Nhập dữ liệu' },
  { value: ACTIVITY_LOG_ACTIONS.EXPORT, label: 'Xuất dữ liệu' },
  { value: ACTIVITY_LOG_ACTIONS.ASSIGN, label: 'Gán thiết bị' },
  { value: ACTIVITY_LOG_ACTIONS.RETURN, label: 'Thu hồi' },
  { value: ACTIVITY_LOG_ACTIONS.MAINTENANCE, label: 'Bảo trì' },
]

const PAGE_SIZE = 20

// ============================================
// Activity Log Row Component
// ============================================
function ActivityLogRow({ log }: { log: ActivityLogWithRelations }) {
  const config = getActionConfig(log.action)
  const Icon = config.icon

  return (
    <div className="group/item flex items-start gap-4 rounded-xl px-4 py-3.5 transition-colors hover:bg-muted/40">
      {/* Icon bubble */}
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${config.bgLight} ${config.bgDark} shadow-sm`}
      >
        <Icon className={`h-4 w-4 ${config.color}`} />
      </div>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {/* Action badge + timestamp */}
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={`rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${config.borderLight} ${config.borderDark} ${config.bgLight}/50 ${config.textLight} ${config.textDark}`}
          >
            {config.label}
          </Badge>
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Clock className="h-3 w-3" />
            {timeAgo(log.created_at)}
          </span>
        </div>

        {/* Details */}
        {log.details && (
          <p className="text-sm leading-relaxed text-foreground/80">{log.details}</p>
        )}

        {/* Meta: user + device */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          {(log.profile_name || log.profile_email) && (
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {log.profile_name || log.profile_email}
            </span>
          )}
          {log.device_name && (
            <span className="flex items-center gap-1">
              <Laptop className="h-3 w-3" />
              {log.device_name}
            </span>
          )}
        </div>
      </div>

      {/* Exact timestamp on hover */}
      <span className="hidden shrink-0 text-[10px] text-muted-foreground/60 lg:block">
        {new Date(log.created_at).toLocaleString('vi-VN')}
      </span>
    </div>
  )
}

// ============================================
// Main Page Component
// ============================================
export default function SystemHistoryPage() {
  const [page, setPage] = useState(1)
  const [actionFilter, setActionFilter] = useState('all')

  const { data, isLoading, isError, error } = useActivityLogsQuery({
    page,
    pageSize: PAGE_SIZE,
    action: actionFilter === 'all' ? undefined : actionFilter,
  })

  const totalCount = data?.totalCount ?? 0
  const logs = data?.logs ?? []
  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  const handleFilterChange = (value: string) => {
    setActionFilter(value)
    setPage(1) // Reset về trang 1 khi đổi filter
  }

  return (
    <div className="space-y-6 px-4 lg:px-6">
      <Separator />

      {/* Toolbar: filter + stats */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 shadow-sm dark:bg-blue-950/50">
            <ScrollText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Nhật ký hoạt động
            </span>
            {!isLoading && (
              <p className="text-sm text-muted-foreground">
                {totalCount} bản ghi
                {actionFilter !== 'all' && (
                  <> · Lọc: <span className="font-medium text-foreground">{getActionConfig(actionFilter).label}</span></>
                )}
              </p>
            )}
          </div>
        </div>

        {/* Filter select */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={actionFilter} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-[180px] rounded-xl border-border/50 bg-white shadow-sm dark:bg-card">
              <SelectValue placeholder="Lọc theo hành động" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border/50 shadow-md">
              {FILTER_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content Card */}
      <div className="overflow-hidden rounded-xl border-none bg-white shadow-md dark:bg-card">
        {isLoading ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <AppLoader layout="vertical" text="Đang tải lịch sử..." />
          </div>
        ) : isError ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center gap-2 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/40">
              <Activity className="h-6 w-6 text-red-500" />
            </div>
            <p className="text-sm font-medium text-foreground">Không thể tải dữ liệu</p>
            <p className="text-xs text-muted-foreground">
              {error instanceof Error ? error.message : 'Đã xảy ra lỗi không xác định'}
            </p>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center gap-2 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/50">
              <ScrollText className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">Chưa có hoạt động nào</p>
            <p className="text-xs text-muted-foreground">
              Các hoạt động trong hệ thống sẽ được ghi lại tại đây.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {logs.map((log) => (
              <ActivityLogRow key={log.id} log={log} />
            ))}
          </div>
        )}

        {/* Pagination footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border/40 px-4 py-3">
            <span className="text-xs text-muted-foreground">
              Trang {page} / {totalPages}
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 rounded-lg border-border/50 p-0"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 rounded-lg border-border/50 p-0"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
