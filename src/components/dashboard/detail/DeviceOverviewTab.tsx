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
  HardDriveDownload,
  CheckCircle2,
  XCircle,
  HardDrive,
} from 'lucide-react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { DEVICE_STATUS_CONFIG, DEVICE_TYPE_LABELS } from '@/constants/device'
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

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      {/* Header Actions */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        {/* Left: Device Identity */}
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

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onExport} className="h-9">
            <Download className="mr-2 h-4 w-4" /> Xuất
          </Button>

          {/* Delete Confirmation */}
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
                onClick={() => {
                  // Delete triggered via main button or we can open dialog here too
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Xóa thiết bị
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* THE GRID */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2">
        {/* 1. Assignment Card */}
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

        {/* 4. OS Card */}
        <DetailCard
          title="Hệ điều hành"
          icon={<HardDriveDownload className="h-5 w-5 text-purple-600" />}
        >
          <OSInfoSection device={device} />
        </DetailCard>

        {/* 5. Hardware Specs */}
        <DetailCard title="Phần cứng" icon={<Cpu className="h-5 w-5 text-orange-600" />}>
          <HardwareSpecsSection device={device} />
        </DetailCard>

        {/* 6. Network Info */}
        <DetailCard title="Mạng & Kết nối" icon={<Wifi className="h-5 w-5 text-sky-600" />}>
          <div className="space-y-3">
            <div className="border-border/40 flex items-center justify-between border-b pb-2">
              <span className="text-muted-foreground text-xs">IP Address</span>
              <span className="font-mono text-sm">{device.deviceInfo.ip}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-xs">MAC Address</span>
              <span className="font-mono text-sm">{device.deviceInfo.mac}</span>
            </div>
          </div>
        </DetailCard>
      </div>

      {/* Dialogs */}
      <DeviceAssignmentDialog
        isOpen={assignmentDialogOpen}
        onClose={() => setAssignmentDialogOpen(false)}
        onSuccess={() => {}}
        deviceId={device.id}
        deviceName={device.deviceInfo.name}
      />

      {/* AlertDialog xác nhận thu hồi */}
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

// Reuseable Detail Card Component
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

// ------------------------------------------------------------------
// Helper: Extract OS Activation Info & BIOS
// ------------------------------------------------------------------
function OSInfoSection({ device }: { device: Device }) {
  // Memoize extraction logic so it doesn't re-run on every render
  const osInfo = useMemo(() => {
    let activationStatus: 'Actived' | 'Inactived' | 'Unknown' = 'Unknown'
    let biosMode: string | null = null

    const sheetKeys = Object.keys(device.sheets || {})

    // Search in License, Config, or similarly named sheets
    const targetSheets = sheetKeys.filter(
      (k) =>
        k.toLowerCase().includes('license') ||
        k.toLowerCase().includes('ban quyen') ||
        k.toLowerCase().includes('cau hinh') ||
        k.toLowerCase().includes('config') ||
        k.toLowerCase().includes('bios')
    )

    // Helper: Normalized search
    const searchData = (data: any[]) => {
      if (!Array.isArray(data)) return
      for (const row of data) {
        const entries = Object.entries(row)
        for (const [key, val] of entries) {
          const header = key.toLowerCase()
          const value = String(val).trim()
          if (!value) continue

          // Activation Status (License Sheet primarily, but keep robust)
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

          // BIOS Mode
          if (!biosMode && (header.includes('bios mode') || header.includes('che do bios'))) {
            biosMode = value
          }
        }
      }
    }

    // Iterate found sheets
    for (const sheetKey of targetSheets) {
      searchData(device.sheets[sheetKey])
    }

    // Fallback: search ALL sheets if still missing info
    if (activationStatus === 'Unknown' || !biosMode) {
      for (const key of sheetKeys) {
        if (targetSheets.includes(key)) continue
        searchData(device.sheets[key])
      }
    }

    return { activationStatus, biosMode }
  }, [device.sheets])

  return (
    <div className="flex flex-col gap-3">
      {/* OS Name & Arch */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="text-base font-medium">{device.deviceInfo.os}</span>
          {osInfo.activationStatus !== 'Unknown' && (
            <Badge
              variant="outline"
              className={cn(
                'flex h-5 items-center gap-1 px-1.5 py-0 text-[10px] font-normal',
                osInfo.activationStatus === 'Actived'
                  ? 'border-green-200 bg-green-50 text-green-700'
                  : 'border-red-200 bg-red-50 text-red-700'
              )}
            >
              {osInfo.activationStatus === 'Actived' ? (
                <CheckCircle2 className="h-3 w-3" />
              ) : (
                <XCircle className="h-3 w-3" />
              )}
              {osInfo.activationStatus}
            </Badge>
          )}
        </div>
        <span className="text-muted-foreground text-sm">{device.deviceInfo.architecture}</span>
      </div>

      {/* BIOS Mode Section */}
      <div className="bg-muted/30 border-border/50 mt-1 flex items-center justify-between rounded-md border p-2">
        <span className="text-muted-foreground flex items-center gap-1 text-[10px] font-semibold uppercase">
          <Activity className="h-3 w-3" /> BIOS Mode
        </span>
        <span className="font-mono text-xs font-medium">{osInfo.biosMode || 'Unknown'}</span>
      </div>
    </div>
  )
}

// ------------------------------------------------------------------
// Helper: Extract Hardware Specs (GPU, Storage, etc.)
// ------------------------------------------------------------------
function HardwareSpecsSection({ device }: { device: Device }) {
  const specs = useMemo(() => {
    let gpuRoi: string | null = null
    let gpuTichHop: string | null = null
    let genericGpu: string | null = null
    let storage: string | null = null

    const sheetKeys = Object.keys(device.sheets || {})

    // Helper: Normalized search
    const searchData = (data: any[], type: 'gpu' | 'storage') => {
      if (!Array.isArray(data)) return
      for (const row of data) {
        const entries = Object.entries(row)
        for (const [key, val] of entries) {
          const header = key.toLowerCase()
          const value = String(val).trim()
          if (!value) continue

          if (type === 'gpu') {
            // 1. Explicit keys from specific system info
            if (header.includes('gpu roi')) {
              gpuRoi = value
            } else if (header.includes('gpu tich hop')) {
              gpuTichHop = value
            }

            // 2. Generic scan (Video Controller, etc.)
            else if (
              header.includes('name') ||
              header.includes('caption') ||
              header.includes('ten') ||
              header.includes('processor')
            ) {
              // Priority logic: If we already have a GPU, check if the new one is "better" (e.g. Dedicated vs Integrated)
              // Heuristic: NVIDIA/AMD > Intel.
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
                // If current GPU is NOT dedicated, and new one IS, replace it
                const currentIsDedicated =
                  genericGpu.toLowerCase().includes('nvidia') ||
                  genericGpu.toLowerCase().includes('amd') ||
                  genericGpu.toLowerCase().includes('radeon')
                if (!currentIsDedicated && isDedicated) {
                  genericGpu = value
                }
              }
            }
          }

          if (type === 'storage') {
            // Look for Size, Dung Luong, Capacity
            if (
              header.includes('size') ||
              header.includes('dung luong') ||
              header.includes('capacity')
            ) {
              // Simply take the first valid one
              if (!storage) storage = value
            }
          }
        }
      }
    }

    // 1. Scan ALL sheets for explicit GPU keys (since they might be in General/System Info)
    // We assume explicit keys might be anywhere.
    for (const key of sheetKeys) {
      searchData(device.sheets[key], 'gpu')
    }

    // 2. If no generic GPU found yet, scan named sheets specifically for it?
    // Actually the loop above already scanned generic keys in ALL sheets.
    // But typically 'Name' is common, we might pick up noise.
    // The previous logic was safer: Generic keys ONLY in Video sheets.
    // Let's refine:
    // We want explicit keys from ANYWHERE.
    // We want generic keys ONLY from Video sheets.

    // Reset genericGpu to null and re-scan properly to avoid noise?
    // No, let's just do it cleanly.

    // Reset logic:
    gpuRoi = null
    gpuTichHop = null
    genericGpu = null
    storage = null

    // Helper: normalize sheet name (handle underscores)
    const normalizeKey = (k: string) => k.toLowerCase().replace(/_/g, ' ')

    // Redefine searchData slightly to be context aware or just split loops.
    // Let's split loops for clarity and safety.

    // Loop A: All sheets for Explicit GPU ROI/TICH HOP
    for (const key of sheetKeys) {
      const data = device.sheets[key]
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

    // Loop B: Video sheets for Generic GPU - normalize underscores
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
      const data = device.sheets[key]
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

    // Loop C: Storage sheets
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

    // Sort to prioritize "O cung" keys first
    storageSheets.sort((a, b) => {
      const aHas = normalizeKey(a).includes('o cung')
      const bHas = normalizeKey(b).includes('o cung')
      return aHas === bHas ? 0 : aHas ? -1 : 1
    })

    for (const key of storageSheets) {
      if (storage) break // Stop if found
      const data = device.sheets[key]
      if (!Array.isArray(data)) continue
      for (const row of data) {
        for (const [k, v] of Object.entries(row)) {
          // Normalize: "DUNG_LUONG" -> "dung luong", "Total Size" -> "total size"
          const header = k
            .toLowerCase()
            .replace(/[\s_-]+/g, ' ')
            .trim()
          const value = String(v).trim()

          if (!value || value.toLowerCase() === 'unknown' || value === '0') continue

          // Robust check for "dung luong" (handles dung_luong, dung-luong, etc)
          const isDungLuong = header.includes('dung') && header.includes('luong')

          // Matches: "dung luong", "capacity", "size"
          if (isDungLuong || header.includes('capacity') || header.includes('size')) {
            // Check if value looks like storage (has digits)
            if (/\d/.test(value)) {
              storage = value
              break
            }
          }
        }
        if (storage) break
      }
    }

    // Fallback: If no generic GPU from specific sheets, try all sheets as last resort for 'name'/'caption'?
    // Previous logic had this. Let's keep it but only if absolutely no GPU info.
    if (!gpuRoi && !gpuTichHop && !genericGpu) {
      for (const key of sheetKeys) {
        if (gpuSheets.includes(key)) continue
        const data = device.sheets[key]
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
              genericGpu = value // Simple fallback
            }
          }
        }
      }
    }

    return { gpu: gpuRoi || gpuTichHop || genericGpu || 'Unknown', storage: storage || 'Unknown' }
  }, [device.sheets])

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Processor */}
      <div className="flex flex-col overflow-hidden">
        <span className="text-muted-foreground mb-0.5 text-[10px] font-semibold tracking-wider uppercase">
          Processor
        </span>
        <span
          className="text-foreground truncate text-sm font-medium"
          title={device.deviceInfo.cpu}
        >
          {device.deviceInfo.cpu || 'N/A'}
        </span>
      </div>

      {/* Graphics */}
      <div className="flex flex-col overflow-hidden">
        <span className="text-muted-foreground mb-0.5 text-[10px] font-semibold tracking-wider uppercase">
          Graphics
        </span>
        <span className="text-foreground truncate text-sm font-medium" title={specs.gpu}>
          {specs.gpu}
        </span>
      </div>

      {/* Memory */}
      <div className="flex flex-col overflow-hidden">
        <span className="text-muted-foreground mb-0.5 text-[10px] font-semibold tracking-wider uppercase">
          Memory
        </span>
        <span className="text-foreground text-sm font-medium">
          {device.deviceInfo.ram || 'N/A'}
        </span>
      </div>

      {/* Storage */}
      <div className="flex flex-col overflow-hidden">
        <span className="text-muted-foreground mb-0.5 text-[10px] font-semibold tracking-wider uppercase">
          Storage
        </span>
        <span className="text-foreground truncate text-sm font-medium" title={specs.storage}>
          {specs.storage}
        </span>
      </div>
    </div>
  )
}
