import { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, Eye, Pencil, Download, Trash2, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SoftLabel } from '@/components/ui/soft-label'
import { Device, DeviceStatus } from '@/types/device'
import { DEVICE_STATUS_CONFIG, DEVICE_TYPE_LABELS } from '@/constants/device'
import { Badge } from '@/components/ui/badge'
import { Laptop, Smartphone, Tablet, Monitor, Server, Printer, Network } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

const getDeviceIcon = (type: string | null) => {
  switch (type?.toLowerCase()) {
    case 'laptop':
      return <Laptop className="h-4 w-4 text-muted-foreground" />
    case 'smartphone':
    case 'mobile':
    case 'phone':
      return <Smartphone className="h-4 w-4 text-muted-foreground" />
    case 'tablet':
      return <Tablet className="h-4 w-4 text-muted-foreground" />
    case 'monitor':
    case 'desktop':
    case 'pc':
      return <Monitor className="h-4 w-4 text-muted-foreground" />
    case 'printer':
      return <Printer className="h-4 w-4 text-muted-foreground" />
    case 'network':
      return <Network className="h-4 w-4 text-muted-foreground" />
    default:
      return <Laptop className="h-4 w-4 text-muted-foreground" />
  }
}

// Dot colors cho status dropdown items
export const STATUS_DOT_COLORS: Record<DeviceStatus, string> = {
  active: 'bg-emerald-500',
  broken: 'bg-red-500',
  inactive: 'bg-amber-500',
}

// Label hiển thị trạng thái thiết bị — dùng SoftLabel cho giao diện đẹp hơn
export function StatusLabel({ status }: { status: DeviceStatus }) {
  const config = DEVICE_STATUS_CONFIG[status]
  return (
    <SoftLabel color={config.softColor} size="sm">
      {config.label}
    </SoftLabel>
  )
}

// Định nghĩa columns cho bảng thiết bị — tách riêng để DeviceList gọn hơn
export function createDeviceColumns({
  onViewDevice,
  onUpdateDevice,
  onExportDevice,
  setDeleteId,
}: {
  onViewDevice: (device: Device) => void
  onUpdateDevice: (device: Device) => void
  onExportDevice: (device: Device) => void
  setDeleteId: (id: string) => void
}): ColumnDef<Device>[] {
  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-[2px]"
        />
      ),
      cell: ({ row }) => (
        <div data-no-row-click>
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            className="translate-y-[2px]"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'deviceInfo.name',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Tên thiết bị
          <ArrowUpDown className="ml-2 h-4 w-4" aria-hidden="true" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-3 py-1 pr-12">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted/50 border">
            {getDeviceIcon(row.original.type)}
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-sm text-foreground">
              {row.original.deviceInfo.name}
            </span>
            <span className="text-xs text-muted-foreground">
              {row.original.deviceInfo.os || 'Unknown OS'}
            </span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Loại',
      cell: ({ row }) => (
        <span className="text-sm">
          {DEVICE_TYPE_LABELS[row.original.type] || row.original.type}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Trạng thái',
      cell: ({ row }) => <StatusLabel status={row.original.status ?? 'active'} />,
    },
    {
      accessorKey: 'assignment.assignee_name',
      header: 'Người sử dụng',
      cell: ({ row }) => {
        const assignment = row.original.assignment
        return assignment && assignment.assignee_name ? (
          <Badge
            variant="secondary"
            className="flex w-fit items-center gap-2 px-1 py-0.5 pr-2.5 bg-background border border-border text-foreground hover:bg-muted/50 shadow-sm transition-all rounded-full font-normal"
          >
            <Avatar className="h-5 w-5">
              <AvatarFallback className="text-[9px] bg-muted text-muted-foreground">
                {assignment.assignee_name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs font-medium">{assignment.assignee_name}</span>
          </Badge>
        ) : (
          <span className="text-muted-foreground text-sm">-</span>
        )
      },
    },
    {
      id: 'actions',
      header: 'Thao tác',
      cell: ({ row }) => (
        <div className="flex items-center gap-1" data-no-row-click>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              onViewDevice(row.original)
            }}
            title="Xem chi tiết"
          >
            <Eye className="h-4 w-4 text-muted-foreground" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              onUpdateDevice(row.original)
            }}
            title="Chỉnh sửa"
          >
            <Pencil className="h-4 w-4 text-muted-foreground" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Thêm hành động">
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onExportDevice(row.original)
                }}
              >
                <Download className="mr-2 h-4 w-4" />
                Xuất file
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  setDeleteId(row.original.id)
                }}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Xóa
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ]
}
