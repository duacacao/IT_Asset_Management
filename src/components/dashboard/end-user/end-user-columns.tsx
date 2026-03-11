import { ColumnDef } from '@tanstack/react-table'
import { EndUserWithDevice } from '@/types/end-user'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header'
import { getDepartmentColor, getPositionColor } from '@/constants/end-user'
import {
  Laptop,
  Smartphone,
  Tablet,
  Monitor,
  Eye,
  Pencil,
  MoreHorizontal,
  Trash,
} from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export const getDeviceIcon = (type: string | null) => {
  switch (type?.toLowerCase()) {
    case 'laptop':
      return <Laptop className="h-3 w-3" />
    case 'smartphone':
    case 'mobile':
      return <Smartphone className="h-3 w-3" />
    case 'tablet':
      return <Tablet className="h-3 w-3" />
    case 'monitor':
    case 'desktop':
      return <Monitor className="h-3 w-3" />
    default:
      return <Laptop className="h-3 w-3" />
  }
}

interface CreateEndUserColumnsProps {
  onEdit: (user: EndUserWithDevice) => void
  onDelete: (id: string) => void
  onView: (id: string) => void
  canEdit?: boolean
  canDelete?: boolean
}

export const createEndUserColumns = ({
  onEdit,
  onDelete,
  onView,
  canEdit = true,
  canDelete = true,
}: CreateEndUserColumnsProps): ColumnDef<EndUserWithDevice>[] => [
  // Conditionally include select column — viewers don't need it
  ...(canDelete
    ? [
        {
          id: 'select',
          header: ({
            table,
          }: {
            table: import('@tanstack/react-table').Table<EndUserWithDevice>
          }) => (
            <Checkbox
              checked={
                table.getIsAllPageRowsSelected() ||
                (table.getIsSomePageRowsSelected() && 'indeterminate')
              }
              onCheckedChange={(value: boolean) => table.toggleAllPageRowsSelected(!!value)}
              aria-label="Select all"
            />
          ),
          cell: ({ row }: { row: import('@tanstack/react-table').Row<EndUserWithDevice> }) => (
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value: boolean) => row.toggleSelected(!!value)}
              aria-label="Select row"
            />
          ),
          enableSorting: false,
          enableHiding: false,
        } as ColumnDef<EndUserWithDevice>,
      ]
    : []),
  {
    accessorKey: 'full_name',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Tên" />,
    cell: ({ row }) => {
      const user = row.original
      return (
        <div className="flex items-center gap-3 py-1 pr-12">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="font-medium">
              {user.full_name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-foreground text-sm font-medium">{user.full_name}</span>
            {user.email && <span className="text-muted-foreground text-xs">{user.email}</span>}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'department',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Phòng ban" />,
    cell: ({ row }) => {
      const dept = row.getValue('department') as string
      return (
        <Badge variant="outline" className={getDepartmentColor(dept || '')}>
          {dept || 'N/A'}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'position',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Chức vụ" />,
    cell: ({ row }) => {
      const pos = row.getValue('position') as string
      return (
        <Badge variant="secondary" className={getPositionColor(pos || '')}>
          {pos || 'N/A'}
        </Badge>
      )
    },
  },
  {
    id: 'devices',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Thiết bị" />,
    cell: ({ row }) => {
      const devices = row.original.devices
      if (!devices || devices.length === 0) {
        return <span className="text-muted-foreground text-sm">-</span>
      }

      return (
        <div className="flex flex-wrap items-center gap-2">
          {/* Show first device fully */}
          <div className="dark:bg-card/80 border-border/20 flex items-center gap-2 rounded-full border bg-white px-2 py-1 shadow-sm">
            {getDeviceIcon(devices[0].type)}
            <span className="text-xs font-medium">{devices[0].name}</span>
          </div>

          {/* Show +N for others */}
          {devices.length > 1 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="secondary" className="h-auto cursor-help px-2 py-1 text-xs">
                    +{devices.length - 1}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="flex flex-col gap-1 p-1">
                    {devices.slice(1).map((d) => (
                      <div key={d.id} className="flex items-center gap-2 text-xs">
                        {getDeviceIcon(d.type)}
                        <span>{d.name}</span>
                      </div>
                    ))}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      )
    },
  },
  {
    id: 'actions',
    header: 'Thao tác',
    cell: ({ row }) => {
      const user = row.original
      return (
        <div className="flex items-center justify-end gap-1 pr-1">
          <Button
            variant="ghost"
            className="h-8 w-8 cursor-pointer rounded-xl p-0"
            onClick={() => onView(user.id)}
            title="Xem chi tiết"
          >
            <Eye className="text-muted-foreground h-4 w-4" />
          </Button>
          {canEdit && (
            <Button
              variant="ghost"
              className="h-8 w-8 cursor-pointer rounded-xl p-0"
              onClick={() => onEdit(user)}
              title="Sửa"
            >
              <Pencil className="text-muted-foreground h-4 w-4" />
            </Button>
          )}
          {canDelete && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 cursor-pointer rounded-xl p-0">
                  <MoreHorizontal className="text-muted-foreground h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="border-border/50 rounded-xl shadow-md">
                <DropdownMenuItem
                  onClick={() => onDelete(user.id)}
                  className="text-destructive focus:text-destructive cursor-pointer"
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Xóa
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      )
    },
  },
]
