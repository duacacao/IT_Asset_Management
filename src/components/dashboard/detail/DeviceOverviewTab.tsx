import { Device } from '@/types/device'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Laptop, Cpu, HardDrive, Monitor, Network, Tag, Calendar, Database } from 'lucide-react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Download, Trash2, ArrowLeftRight, Plus } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { DEVICE_STATUS_CONFIG, STATUS_DOT_COLORS, DEVICE_TYPE_LABELS } from '@/constants/device'
import { useState } from 'react'
import { DeviceAssignmentDialog } from '../DeviceAssignmentDialog'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
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

interface DeviceOverviewTabProps {
  device: Device
  onExport: () => void
  onDelete: (id: string) => void
  onClose: () => void
}

export function DeviceOverviewTab({ device, onExport, onDelete, onClose }: DeviceOverviewTabProps) {
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false)

  // Status config
  const statusConfig = DEVICE_STATUS_CONFIG[device.status ?? 'active']

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      {/* 1. Identity & Actions */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-lg">
              <Monitor className="text-primary h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{device.deviceInfo.name}</h1>
              <div className="mt-1 flex items-center gap-2">
                <Badge variant="outline" className="font-normal">
                  {DEVICE_TYPE_LABELS[device.type]}
                </Badge>
                <Badge
                  variant="outline"
                  className={`gap-1.5 pl-1.5 ${statusConfig.softColor === 'success' ? 'border-green-200 bg-green-50 text-green-700' : statusConfig.softColor === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-amber-200 bg-amber-50 text-amber-700'}`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${statusConfig.softColor === 'success' ? 'bg-green-500' : statusConfig.softColor === 'error' ? 'bg-red-500' : 'bg-amber-500'}`}
                  />
                  {statusConfig.label}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download className="mr-2 h-4 w-4" />
            Xuất file
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="mr-2 h-4 w-4" />
                Xóa
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
                >
                  Xóa
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* 2. Specs Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Laptop className="h-4 w-4" />
              Cấu hình
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-y-4 text-sm">
            <SpecItem
              label="Hệ điều hành"
              value={device.deviceInfo.os}
              icon={<Laptop className="h-3.5 w-3.5" />}
            />
            <SpecItem
              label="CPU"
              value={device.deviceInfo.cpu}
              icon={<Cpu className="h-3.5 w-3.5" />}
            />
            <SpecItem
              label="RAM"
              value={device.deviceInfo.ram}
              icon={<HardDrive className="h-3.5 w-3.5" />}
            />
            <SpecItem
              label="Kiến trúc"
              value={device.deviceInfo.architecture}
              icon={<Monitor className="h-3.5 w-3.5" />}
            />
            <SpecItem
              label="Địa chỉ MAC"
              value={device.deviceInfo.mac}
              icon={<Network className="h-3.5 w-3.5" />}
            />
          </CardContent>
        </Card>

        {/* 3. Assignment Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Tag className="h-4 w-4" />
              Thông tin sử dụng
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {device.assignment ? (
              <div className="bg-muted/50 flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold">
                    {device.assignment.assignee_name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{device.assignment.assignee_name}</p>
                    <p className="text-muted-foreground text-xs">
                      {device.assignment.assignee_email}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-muted-foreground mb-0.5 text-[10px] uppercase">Ngày gán</div>
                  <div className="text-xs font-medium">
                    {format(new Date(device.assignment.assigned_at), 'dd/MM/yyyy')}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-muted/20 flex flex-col items-center justify-center rounded-lg border border-dashed py-6 text-center">
                <p className="text-muted-foreground mb-2 text-sm">Thiết bị chưa được gán</p>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant={device.assignment ? 'outline' : 'default'}
                className="w-full"
                onClick={() => setAssignmentDialogOpen(true)}
                disabled={device.status !== 'active' && !device.assignment}
              >
                {device.assignment ? (
                  <>
                    <ArrowLeftRight className="mr-2 h-4 w-4" />
                    Điều chuyển / Thu hồi
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Gán thiết bị
                  </>
                )}
              </Button>
            </div>
            {device.status !== 'active' && !device.assignment && (
              <p className="text-destructive text-center text-[10px]">
                *Chỉ thiết bị "Active" mới có thể gán
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Assignment Dialog */}
      <DeviceAssignmentDialog
        isOpen={assignmentDialogOpen}
        onClose={() => setAssignmentDialogOpen(false)}
        onSuccess={() => {}}
        deviceId={device.id}
        deviceName={device.deviceInfo.name}
      />
    </div>
  )
}

function SpecItem({
  label,
  value,
  icon,
}: {
  label: string
  value?: string
  icon: React.ReactNode
}) {
  return (
    <div className="space-y-1">
      <dt className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
        {icon} {label}
      </dt>
      <dd className="pl-5 text-sm font-medium">{value || '—'}</dd>
    </div>
  )
}
