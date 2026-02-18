import { Device } from '@/types/device'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Cpu,
  Monitor,
  Download,
  Trash2,
  Loader2,
  User,
  MoreVertical,
  Activity,
  ChevronRight,
  Wifi,
  HardDrive,
  Printer,
  Smartphone,
  Tablet,
  Network,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DEVICE_STATUS_CONFIG, DEVICE_TYPE_LABELS, DEVICE_DETAIL_CARDS } from '@/constants/device'
import { useState, useMemo } from 'react'
import { toast } from 'sonner'
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

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Cpu,
  Monitor,
  Wifi,
  HardDrive,
  Printer,
  Smartphone,
  Tablet,
  Network,
}

interface DeviceOverviewTabProps {
  device: Device
  onExport: () => void
  onDelete: (id: string) => void
  onClose: () => void
}

export function DeviceOverviewTab({ device, onExport, onDelete, onClose }: DeviceOverviewTabProps) {
  const queryClient = useQueryClient()
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false)
  const [returnDialogOpen, setReturnDialogOpen] = useState(false)
  const [isReturning, setIsReturning] = useState(false)

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
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <h2 className="text-foreground text-2xl font-bold tracking-tight">
              {device.deviceInfo.name}
            </h2>
            <div
              className={cn(
                'flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
                statusConfig.softColor === 'success'
                  ? 'border-green-200 bg-green-50 text-green-700'
                  : statusConfig.softColor === 'error'
                    ? 'border-red-200 bg-red-50 text-red-700'
                    : 'border-amber-200 bg-amber-50 text-amber-700'
              )}
            >
              <span
                className={cn(
                  'h-1.5 w-1.5 rounded-full',
                  statusConfig.softColor === 'success'
                    ? 'bg-green-600'
                    : statusConfig.softColor === 'error'
                      ? 'bg-red-600'
                      : 'bg-amber-600'
                )}
              />
              {statusConfig.label}
            </div>
          </div>

          <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-sm">
            <div className="flex items-center gap-1.5">
              <Monitor className="h-4 w-4" />
              <span>{DEVICE_TYPE_LABELS[device.type]}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onExport} className="h-9">
            <Download className="mr-2 h-4 w-4" /> Xuất
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive h-9"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Xóa
              </Button>
            </AlertDialogTrigger>
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
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Hành động</DropdownMenuLabel>
              <DropdownMenuItem onClick={onExport}>
                <Download className="mr-2 h-4 w-4" /> Xuất file
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => {}}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Xóa thiết bị
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2">
        <DetailCard
          title="Người sử dụng"
          icon={<User className="text-primary h-5 w-5" />}
          actionLabel={device.assignment ? 'Quản lý' : 'Gán thiết bị'}
          onAction={() => setAssignmentDialogOpen(true)}
        >
          {device.assignment ? (
            <div className="flex flex-col gap-1">
              <span className="text-foreground text-lg font-semibold">
                {device.assignment.assignee_name}
              </span>
              <span className="text-muted-foreground text-sm">
                {device.assignment.assignee_email}
              </span>
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
            key={config.type}
            config={config}
            device={device}
            computedData={computedData}
          />
        ))}
      </div>

      <DeviceAssignmentDialog
        isOpen={assignmentDialogOpen}
        onClose={() => setAssignmentDialogOpen(false)}
        onSuccess={() => {}}
        deviceId={device.id}
        deviceName={device.deviceInfo.name}
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
              {isReturning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
    <Card className="border-border/60 hover:border-border/80 flex flex-col overflow-hidden shadow-sm transition-colors">
      <CardContent className="flex flex-1 flex-col p-5">
        <div className="mb-4 flex items-center gap-2.5">
          <div className="bg-muted/40 flex h-8 w-8 items-center justify-center rounded-md p-1.5">
            {icon}
          </div>
          <span className="text-muted-foreground text-sm font-medium">{title}</span>
        </div>

        <div className="flex-1">{children}</div>

        {actionLabel && (
          <div className="mt-5 pt-0">
            <button
              onClick={onAction}
              className="group flex items-center text-xs font-semibold text-blue-600 transition-colors hover:text-blue-700"
              type="button"
            >
              {actionLabel}
              <ChevronRight className="ml-0.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        )}
      </CardContent>
    </Card>
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

  return (
    <DetailCard
      title={config.title}
      icon={<IconComponent className={cn('h-5 w-5', config.iconColor)} />}
    >
      <div className="grid grid-cols-2 gap-4">
        {config.fields.map((field) => {
          let value: string | null = null

          if (field.source === 'deviceInfo') {
            const info = device.deviceInfo as unknown as Record<string, unknown>
            value = info[field.key] as string | null
          } else if (field.source === 'computed' && field.computedKey) {
            const key = field.computedKey as keyof ComputedDeviceData
            value = computedData[key] as string | null
          }

          if (!value || value === 'Unknown') {
            return (
              <div key={field.key} className="flex flex-col overflow-hidden">
                <span className="text-muted-foreground mb-0.5 text-[10px] font-semibold tracking-wider uppercase">
                  {field.label}
                </span>
                <span className="text-muted-foreground truncate text-sm">N/A</span>
              </div>
            )
          }

          if (field.key === 'activationStatus') {
            return (
              <div key={field.key} className="col-span-2 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-base font-medium">{device.deviceInfo.os}</span>
                  {value !== 'Unknown' && (
                    <Badge
                      variant="outline"
                      className={cn(
                        'flex h-5 items-center gap-1 px-1.5 py-0 text-[10px] font-normal',
                        value === 'Actived'
                          ? 'border-green-200 bg-green-50 text-green-700'
                          : 'border-red-200 bg-red-50 text-red-700'
                      )}
                    >
                      {value === 'Actived' ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : (
                        <XCircle className="h-3 w-3" />
                      )}
                      {value}
                    </Badge>
                  )}
                </div>
                <span className="text-muted-foreground text-sm">
                  {device.deviceInfo.architecture}
                </span>
              </div>
            )
          }

          return (
            <div key={field.key} className="flex flex-col overflow-hidden">
              <span className="text-muted-foreground mb-0.5 text-[10px] font-semibold tracking-wider uppercase">
                {field.label}
              </span>
              <span className="text-foreground truncate text-sm font-medium" title={value}>
                {value}
              </span>
            </div>
          )
        })}
      </div>

      {config.type === 'os' && computedData.biosMode && (
        <div className="bg-muted/30 border-border/50 mt-4 flex items-center justify-between rounded-md border p-2">
          <span className="text-muted-foreground flex items-center gap-1 text-[10px] font-semibold uppercase">
            <Activity className="h-3 w-3" /> BIOS Mode
          </span>
          <span className="font-mono text-xs font-medium">{computedData.biosMode}</span>
        </div>
      )}
    </DetailCard>
  )
}

interface ComputedDeviceData {
  gpu: string
  storage: string
  activationStatus: 'Actived' | 'Inactived' | 'Unknown'
  biosMode: string | null
}

function useComputedDeviceData(device: Device): ComputedDeviceData {
  return useMemo(() => {
    const result: ComputedDeviceData = {
      gpu: 'Unknown',
      storage: 'Unknown',
      activationStatus: 'Unknown',
      biosMode: null,
    }

    const sheetKeys = Object.keys(device.sheets || {})
    const normalizeKey = (k: string) => k.toLowerCase().replace(/_/g, ' ')
    const sheets = device.sheets as Record<string, Record<string, unknown>[]>

    result.gpu = extractGpu(sheets, sheetKeys, normalizeKey)
    result.storage = extractStorage(sheets, sheetKeys, normalizeKey)
    const osInfo = extractOsInfo(sheets, sheetKeys)
    result.activationStatus = osInfo.activationStatus
    result.biosMode = osInfo.biosMode

    return result
  }, [device.sheets])
}

function extractGpu(
  sheets: Record<string, Record<string, unknown>[]>,
  sheetKeys: string[],
  normalizeKey: (k: string) => string
): string {
  let gpuRoi: string | null = null
  let gpuTichHop: string | null = null
  let genericGpu: string | null = null

  for (const key of sheetKeys) {
    const data = sheets[key]
    if (!Array.isArray(data)) continue
    for (const row of data) {
      for (const [k, v] of Object.entries(row)) {
        const header = k.toLowerCase()
        const val = String(v).trim()
        if (!val) continue
        if (header.includes('gpu roi')) gpuRoi = val
        else if (header.includes('gpu tich hop')) gpuTichHop = val
      }
    }
  }

  const gpuSheets = sheetKeys.filter((k) => {
    const normalized = normalizeKey(k)
    return (
      normalized.includes('video') ||
      normalized.includes('display') ||
      normalized.includes('do hoa') ||
      normalized.includes('man hinh')
    )
  })

  for (const key of gpuSheets) {
    const data = sheets[key]
    if (!Array.isArray(data)) continue
    for (const row of data) {
      for (const [k, v] of Object.entries(row)) {
        const header = k.toLowerCase()
        const value = String(v).trim()
        if (!value) continue

        if (
          header.includes('name') ||
          header.includes('caption') ||
          header.includes('ten') ||
          header.includes('processor')
        ) {
          const lowerVal = value.toLowerCase()
          const isDedicated =
            lowerVal.includes('nvidia') ||
            lowerVal.includes('amd') ||
            lowerVal.includes('radeon') ||
            lowerVal.includes('geforce') ||
            lowerVal.includes('rtx') ||
            lowerVal.includes('gtx')
          if (!genericGpu) {
            genericGpu = value
          } else {
            const currentIsDedicated =
              genericGpu.toLowerCase().includes('nvidia') ||
              genericGpu.toLowerCase().includes('amd') ||
              genericGpu.toLowerCase().includes('radeon')
            if (!currentIsDedicated && isDedicated) genericGpu = value
          }
        }
      }
    }
  }

  if (!gpuRoi && !gpuTichHop && !genericGpu) {
    for (const key of sheetKeys) {
      if (gpuSheets.includes(key)) continue
      const data = sheets[key]
      if (!Array.isArray(data)) continue
      for (const row of data) {
        for (const [k, v] of Object.entries(row)) {
          const header = k.toLowerCase()
          const value = String(v).trim()
          if (
            header.includes('name') &&
            (value.toLowerCase().includes('graphics') ||
              value.toLowerCase().includes('nvidia') ||
              value.toLowerCase().includes('amd'))
          ) {
            genericGpu = value
          }
        }
      }
    }
  }

  return gpuRoi || gpuTichHop || genericGpu || 'Unknown'
}

function extractStorage(
  sheets: Record<string, Record<string, unknown>[]>,
  sheetKeys: string[],
  normalizeKey: (k: string) => string
): string {
  let storage: string | null = null

  const storageSheets = sheetKeys.filter((k) => {
    const normalized = normalizeKey(k)
    return (
      normalized.includes('disk') ||
      normalized.includes('drive') ||
      normalized.includes('o cung') ||
      normalized.includes('o dia') ||
      normalized.includes('storage') ||
      normalized.includes('hdd') ||
      normalized.includes('ssd')
    )
  })

  storageSheets.sort((a, b) => {
    const aHas = normalizeKey(a).includes('o cung')
    const bHas = normalizeKey(b).includes('o cung')
    return aHas === bHas ? 0 : aHas ? -1 : 1
  })

  for (const key of storageSheets) {
    if (storage) break
    const data = sheets[key]
    if (!Array.isArray(data)) continue
    for (const row of data) {
      for (const [k, v] of Object.entries(row)) {
        const header = k
          .toLowerCase()
          .replace(/[\s_-]+/g, ' ')
          .trim()
        const value = String(v).trim()

        if (!value || value.toLowerCase() === 'unknown' || value === '0') continue

        const isDungLuong = header.includes('dung') && header.includes('luong')

        if (isDungLuong || header.includes('capacity') || header.includes('size')) {
          if (/\d/.test(value)) {
            storage = value
            break
          }
        }
      }
      if (storage) break
    }
  }

  return storage || 'Unknown'
}

function extractOsInfo(
  sheets: Record<string, Record<string, unknown>[]>,
  sheetKeys: string[]
): { activationStatus: 'Actived' | 'Inactived' | 'Unknown'; biosMode: string | null } {
  let activationStatus: 'Actived' | 'Inactived' | 'Unknown' = 'Unknown'
  let biosMode: string | null = null

  const targetSheets = sheetKeys.filter(
    (k) =>
      k.toLowerCase().includes('license') ||
      k.toLowerCase().includes('ban quyen') ||
      k.toLowerCase().includes('cau hinh') ||
      k.toLowerCase().includes('config') ||
      k.toLowerCase().includes('bios')
  )

  const searchData = (data: Record<string, unknown>[]) => {
    if (!Array.isArray(data)) return
    for (const row of data) {
      for (const [key, val] of Object.entries(row)) {
        const header = key.toLowerCase()
        const value = String(val).trim()
        if (!value) continue

        if (activationStatus === 'Unknown') {
          if (
            header.includes('active windows') ||
            header.includes('trang thai') ||
            header.includes('status')
          ) {
            const lowerVal = value.toLowerCase()
            if (
              lowerVal === 'true' ||
              lowerVal === 'yes' ||
              lowerVal.includes('active') ||
              lowerVal.includes('da kich hoat')
            ) {
              activationStatus = 'Actived'
            } else if (
              lowerVal === 'false' ||
              lowerVal === 'no' ||
              lowerVal.includes('inactive') ||
              lowerVal.includes('chua')
            ) {
              activationStatus = 'Inactived'
            }
          }
        }

        if (!biosMode && (header.includes('bios mode') || header.includes('che do bios'))) {
          biosMode = value
        }
      }
    }
  }

  for (const sheetKey of targetSheets) {
    searchData(sheets[sheetKey])
  }

  if (activationStatus === 'Unknown' || !biosMode) {
    for (const key of sheetKeys) {
      if (targetSheets.includes(key)) continue
      searchData(sheets[key])
    }
  }

  return { activationStatus, biosMode }
}
