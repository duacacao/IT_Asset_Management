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
import {
  DEVICE_STATUS_CONFIG,
  DEVICE_TYPE_LABELS,
  DEVICE_TYPE_COLORS,
  DEVICE_TYPES,
} from '@/constants/device'
import { Badge } from '@/components/ui/badge'
import { Laptop, Smartphone, Tablet, Monitor, Server, Printer, Network } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

const getDeviceIcon = (type: string | null) => {
  switch (type?.toLowerCase()) {
    case 'laptop':
      return <Laptop className="text-muted-foreground h-4 w-4" />
    case 'smartphone':
    case 'mobile':
    case 'phone':
      return <Smartphone className="text-muted-foreground h-4 w-4" />
    case 'tablet':
      return <Tablet className="text-muted-foreground h-4 w-4" />
    case 'monitor':
    case 'desktop':
    case 'pc':
      return <Monitor className="text-muted-foreground h-4 w-4" />
    case 'printer':
      return <Printer className="text-muted-foreground h-4 w-4" />
    case 'network':
      return <Network className="text-muted-foreground h-4 w-4" />
    default:
      return <Laptop className="text-muted-foreground h-4 w-4" />
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
          className="pl-4"
        >
          Tên thiết bị
          <ArrowUpDown className="ml-2 h-4 w-4" aria-hidden="true" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-3 py-1 pr-12 pl-4">
          <div className="bg-muted/50 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border">
            {getDeviceIcon(row.original.type)}
          </div>
          <div className="flex flex-col">
            <span className="text-foreground text-sm font-medium">
              {row.original.deviceInfo.name}
            </span>
            <span className="text-muted-foreground text-xs">
              {row.original.deviceInfo.os || 'Unknown OS'}
            </span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Loại',
      cell: ({ row }) => {
        const type = row.original.type
        const colors = DEVICE_TYPE_COLORS[type] || DEVICE_TYPE_COLORS[DEVICE_TYPES.OTHER]
        return (
          <Badge variant="secondary" className={`${colors.bg} ${colors.text} border-0 font-medium`}>
            {DEVICE_TYPE_LABELS[type] || type}
          </Badge>
        )
      },
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
            className="bg-background border-border text-foreground hover:bg-muted/50 flex w-fit items-center gap-2 rounded-full border px-1 py-0.5 pr-2.5 font-normal shadow-sm transition-all"
          >
            <Avatar className="h-5 w-5">
              <AvatarFallback className="bg-muted text-muted-foreground text-[9px]">
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
            <Eye className="text-muted-foreground h-4 w-4" />
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
            <Pencil className="text-muted-foreground h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Thêm hành động">
                <MoreHorizontal className="text-muted-foreground h-4 w-4" aria-hidden="true" />
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
