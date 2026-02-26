import { Device } from '@/types/device'
import { Badge } from '@/components/ui/badge'
import {
  Cpu,
  Monitor,
  Download,
  Pencil,
  Trash2,
  User,
  MoreVertical,
  ChevronRight,
  Wifi,
  HardDrive,
  Printer,
  Smartphone,
  Tablet,
  Network,
  CheckCircle2,
  Check,
  XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DEVICE_STATUS_CONFIG,
  DEVICE_TYPE_LABELS,
  DEVICE_DETAIL_CARDS,
  DEVICE_TYPES,
  STATUS_DOT_COLORS,
} from '@/constants/device'
import { useState } from 'react'
import { toast } from 'sonner'
import { AppLoader } from '@/components/ui/app-loader'
import { useQueryClient } from '@tanstack/react-query'
import { DeviceAssignmentDialog } from '../DeviceAssignmentDialog'
import { returnDevice } from '@/app/actions/device-assignments'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'
import type { DetailCardConfig } from '@/constants/device'
import { useUpdateDeviceMutation, useUpdateStatusMutation } from '@/hooks/useDevicesQuery'
import { DeviceStatus, DeviceType } from '@/types/device'
import { useComputedDeviceData, type ComputedDeviceData } from '@/hooks/useComputedDeviceData'

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Cpu,
  Monitor,
  Wifi,
  HardDrive,
  Printer,
  Smartphone,
  Tablet,
  Network,
  CheckCircle2,
}

interface DeviceOverviewTabProps {
  device: Device
  onExport: () => void
  onDelete: (id: string) => void
  onUpdate: () => void
  onClose: () => void
}

export function DeviceOverviewTab({ device, onExport, onDelete, onUpdate, onClose }: DeviceOverviewTabProps) {
  const queryClient = useQueryClient()
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false)
  const [returnDialogOpen, setReturnDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isReturning, setIsReturning] = useState(false)

  const updateStatusMutation = useUpdateStatusMutation()
  const updateDeviceMutation = useUpdateDeviceMutation()

  const handleStatusChange = (newStatus: DeviceStatus) => {
    updateStatusMutation.mutate(
      { deviceId: device.id, status: newStatus },
      {
        onSuccess: () => toast.success('Đã cập nhật trạng thái'),
        onError: () => toast.error('Lỗi cập nhật trạng thái'),
      }
    )
  }

  const handleTypeChange = (newType: DeviceType) => {
    updateDeviceMutation.mutate(
      { deviceId: device.id, updates: { type: newType } },
      {
        onSuccess: () => toast.success('Đã cập nhật loại thiết bị'),
      }
      // Error is handled globally in useUpdateDeviceMutation
    )
  }

  const handleReturn = async () => {
    if (!device.assignment?.id) return
    setIsReturning(true)
    try {
      const result = await returnDevice(device.assignment.id)
      if (result.success) {
        toast.success('Đã thu hồi thiết bị thành công')
        queryClient.invalidateQueries({ queryKey: ['devices'] })
        queryClient.invalidateQueries({ queryKey: ['end-users'] })
        queryClient.invalidateQueries({ queryKey: ['available-devices'] })
        setReturnDialogOpen(false)
      } else {
        toast.error(result.error || 'Lỗi thu hồi thiết bị')
      }
    } catch {
      toast.error('Đã có lỗi xảy ra')
    } finally {
      setIsReturning(false)
    }
  }

  const statusConfig = DEVICE_STATUS_CONFIG[device.status ?? 'active']

  const computedData = useComputedDeviceData(device)
  const cardConfigs = DEVICE_DETAIL_CARDS[device.type] || DEVICE_DETAIL_CARDS.Other

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1.5 pt-2">
          <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-sm">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground flex h-auto w-40 items-center justify-between rounded-full px-3 py-2 text-xs font-medium"
                >
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    {(() => {
                      const TypeIcon = ICON_MAP[cardConfigs[0]?.icon || 'Monitor'] || Monitor
                      return <TypeIcon className="h-4 w-4 shrink-0" />
                    })()}
                    <span className="truncate">{DEVICE_TYPE_LABELS[device.type]}</span>
                  </div>
                  <ChevronRight className="ml-1 h-3 w-3 shrink-0 rotate-90 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuLabel>Đổi loại thiết bị</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {Object.values(DEVICE_TYPES).map((type) => {
                  const Icon =
                    ICON_MAP[DEVICE_DETAIL_CARDS[type]?.[0]?.icon || 'Monitor'] || Monitor
                  return (
                    <DropdownMenuItem
                      key={type}
                      onClick={() => handleTypeChange(type)}
                      className="gap-2"
                    >
                      <Icon className="h-4 w-4" />
                      {DEVICE_TYPE_LABELS[type]}
                      {device.type === type && <Check className="ml-auto h-4 w-4" />}
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* <div className="bg-border/50 h-5 w-px" /> */}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div
                  className={cn(
                    'flex w-40 items-center justify-between rounded-full border px-3 py-2 text-xs font-medium transition-colors hover:opacity-80',
                    statusConfig.softColor === 'success'
                      ? 'border-green-200 bg-green-50 text-green-700'
                      : statusConfig.softColor === 'error'
                        ? 'border-red-200 bg-red-50 text-red-700'
                        : 'border-amber-200 bg-amber-50 text-amber-700'
                  )}
                >
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    <span
                      className={cn(
                        'h-1.5 w-1.5 shrink-0 rounded-full',
                        statusConfig.softColor === 'success'
                          ? 'bg-green-600'
                          : statusConfig.softColor === 'error'
                            ? 'bg-red-600'
                            : 'bg-amber-600'
                      )}
                    />
                    <span className="truncate">{statusConfig.label}</span>
                  </div>
                  <ChevronRight className="ml-1 h-3 w-3 shrink-0 rotate-90 opacity-50" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuLabel>Đổi trạng thái</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {Object.entries(DEVICE_STATUS_CONFIG).map(([status, config]) => (
                  <DropdownMenuItem
                    key={status}
                    onClick={() => handleStatusChange(status as DeviceStatus)}
                    className="gap-2"
                  >
                    <div
                      className={cn(
                        'h-2 w-2 rounded-full',
                        STATUS_DOT_COLORS[status as DeviceStatus]
                      )}
                    />
                    {config.label}
                    {device.status === status && <Check className="ml-auto h-4 w-4" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Xác nhận xóa thiết bị?</AlertDialogTitle>
                <AlertDialogDescription>
                  Hành động này không thể hoàn tác. Dữ liệu sheet và lịch sử sẽ bị xóa vĩnh viễn.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Hủy</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    onDelete(device.id)
                    onClose()
                  }}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  Xóa
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Hành động</DropdownMenuLabel>
              <DropdownMenuItem onClick={onUpdate}>
                <Pencil className="mr-2 h-4 w-4" /> Sửa
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onExport}>
                <Download className="mr-2 h-4 w-4" /> Xuất file
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Xóa thiết bị
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        <DetailCard
          title="Người sử dụng"
          icon={<User className="h-5 w-5" />}
          actionLabel={!device.assignment ? 'Gán thiết bị' : undefined}
          onAction={!device.assignment ? () => setAssignmentDialogOpen(true) : undefined}
        >
          {device.assignment ? (
            <div className="flex flex-col gap-1">
              <span className="text-foreground text-lg font-semibold">
                {device.assignment.assignee_name}
              </span>
              <span className="text-muted-foreground text-sm">
                {device.assignment.assignee_email}
              </span>
              {/* Hai nút inline: Quản lý (gán lại) + Thu hồi (hủy bàn giao) */}
              <div className="mt-2 flex items-center gap-4 border-t border-gray-100 pt-2">
                <button
                  onClick={() => setAssignmentDialogOpen(true)}
                  className="group/btn flex items-center text-xs font-semibold text-gray-900 transition-all hover:translate-x-1"
                  type="button"
                >
                  Quản lý
                  <ChevronRight className="ml-1 h-3 w-3 transition-transform group-hover/btn:translate-x-1" />
                </button>
                <button
                  onClick={() => setReturnDialogOpen(true)}
                  className="group/btn flex items-center text-xs font-semibold text-red-600 transition-all hover:translate-x-1"
                  type="button"
                >
                  Thu hồi
                  <ChevronRight className="ml-1 h-3 w-3 transition-transform group-hover/btn:translate-x-1" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2 py-2">
              <span className="text-muted-foreground text-sm">Chưa được gán</span>
              <span className="text-foreground text-sm font-medium">Sẵn sàng sử dụng</span>
            </div>
          )}
        </DetailCard>

        {cardConfigs.map((config) => (
          <DynamicDetailCard
            key={config.title}
            config={config}
            device={device}
            computedData={computedData}
          />
        ))}
      </div>

      <DeviceAssignmentDialog
        isOpen={assignmentDialogOpen}
        onClose={() => setAssignmentDialogOpen(false)}
        onSuccess={() => { }}
        deviceId={device.id}
        deviceName={device.deviceInfo.name}
        currentEndUserId={device.assignment?.end_user_id}
      />

      <AlertDialog open={returnDialogOpen} onOpenChange={setReturnDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận thu hồi thiết bị</AlertDialogTitle>
            <AlertDialogDescription>
              Thiết bị <strong>"{device.deviceInfo.name}"</strong> đang được sử dụng bởi{' '}
              <strong>{device.assignment?.assignee_name}</strong>. Thu hồi sẽ gỡ gán thiết bị khỏi
              người này.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isReturning}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleReturn()
              }}
              disabled={isReturning}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isReturning && <AppLoader layout="horizontal" hideText className="mr-2" />}
              Xác nhận thu hồi
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function DetailCard({
  title,
  icon,
  children,
  actionLabel,
  onAction,
}: {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  actionLabel?: string
  onAction?: () => void
}) {
  return (
    <div className="group relative overflow-hidden rounded-sm border border-gray-200 bg-white p-4 transition-all duration-300 hover:border-gray-300 hover:shadow-md">
      <div className="absolute top-0 left-0 h-1 w-full bg-gray-900 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="mb-3 flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-gray-100 transition-colors duration-300 group-hover:bg-gray-900">
          <span className="text-gray-600 transition-colors duration-300 group-hover:text-white">
            {icon}
          </span>
        </div>
        <span className="text-xs font-medium tracking-wide text-gray-500 uppercase">{title}</span>
      </div>

      <div className="min-h-[40px]">{children}</div>

      {actionLabel && (
        <div className="mt-3 border-t border-gray-100 pt-2">
          <button
            onClick={onAction}
            className="group/btn flex items-center text-xs font-semibold text-gray-900 transition-all hover:translate-x-1"
            type="button"
          >
            {actionLabel}
            <ChevronRight className="ml-1 h-3 w-3 transition-transform group-hover/btn:translate-x-1" />
          </button>
        </div>
      )}
    </div>
  )
}

function DynamicDetailCard({
  config,
  device,
  computedData,
}: {
  config: DetailCardConfig
  device: Device
  computedData: ComputedDeviceData
}) {
  const IconComponent = ICON_MAP[config.icon] || Cpu

  // Hàm thống nhất lấy giá trị: ưu tiên deviceInfo, fallback sang computedData
  // Logic giống hệt resolveField trong DeviceUpdateForm
  const getFieldValue = (field: DetailCardConfig['fields'][0]): string | null => {
    const info = device.deviceInfo as unknown as Record<string, unknown>
    const manualValue = info[field.key] as string | null

    // Kiểm tra manualValue hợp lệ (case-insensitive, lọc rác)
    if (manualValue) {
      const lower = manualValue.toLowerCase().trim()
      if (
        lower !== '' &&
        lower !== 'unknown' &&
        lower !== 'n/a' &&
        lower !== '-' &&
        lower !== '0' &&
        lower !== 'none' &&
        lower !== 'khong co' &&
        lower !== 'không có'
      ) {
        return manualValue.trim()
      }
    }

    // Fallback: lấy từ computedData (cho cả 'computed' và 'deviceInfo' source)
    const computedKey = field.computedKey || field.key
    const key = computedKey as keyof ComputedDeviceData
    if (key in computedData) {
      const computedValue = computedData[key] as string | null
      if (computedValue) {
        const compLower = computedValue.toLowerCase().trim()
        if (
          compLower !== 'unknown' &&
          compLower !== 'n/a' &&
          compLower !== '-' &&
          compLower !== '0' &&
          compLower !== 'none'
        ) {
          return computedValue.trim()
        }
      }
    }

    return null
  }

  // ActivationStatus cũng dùng cùng logic getFieldValue
  const hasActivationStatus = config.fields.some((f) => f.key === 'activationStatus')
  let activationValue: string | null = null
  if (hasActivationStatus) {
    const activationField = config.fields.find((f) => f.key === 'activationStatus')!
    activationValue = getFieldValue(activationField)
  }

  return (
    <div className="group relative overflow-hidden rounded-sm border border-gray-200 bg-white p-4 transition-all duration-300 hover:border-gray-300 hover:shadow-md">
      <div className="absolute top-0 left-0 h-1 w-full bg-gray-900 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-gray-100 transition-colors duration-300 group-hover:bg-gray-900">
          <IconComponent
            className={cn(
              'h-4 w-4 text-gray-600 group-hover:text-white',
              config.iconColor?.replace('text-', '')
            )}
          />
        </div>
        <span className="text-xs font-medium tracking-wide text-gray-500 uppercase">
          {config.title}
        </span>
      </div>

      <div className="space-y-1.5">
        {config.fields.map((field) => {
          if (field.key === 'activationStatus') {
            if (activationValue && activationValue !== 'Unknown') {
              return (
                <div key={field.key} className="mt-1 flex flex-col items-start">
                  <span
                    className={cn(
                      'flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase',
                      activationValue === 'Actived'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    )}
                  >
                    {activationValue === 'Actived' ? (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5" />
                    )}
                    {activationValue}
                  </span>
                </div>
              )
            }
            return (
              <div key={field.key} className="mt-1 flex flex-col items-start">
                <span className="flex items-center gap-1.5 rounded-md bg-gray-100 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-gray-500 uppercase">
                  <XCircle className="h-3.5 w-3.5" /> N/A
                </span>
              </div>
            )
          }

          const value = getFieldValue(field)

          if (!value || value === 'Unknown') {
            return (
              <div key={field.key} className="flex flex-col">
                <span className="mb-1 text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                  {field.label}
                </span>
                <span className="text-sm text-gray-400">N/A</span>
              </div>
            )
          }

          return (
            <div key={field.key} className="flex flex-col">
              <span className="mb-1 text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                {field.label}
              </span>
              <span className="text-sm font-medium text-gray-900" title={value}>
                {value}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
