import { ColumnDef } from '@tanstack/react-table'
import { Department } from '@/types/department'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Pencil, MoreHorizontal, Trash, Users } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface CreateDepartmentColumnsProps {
  onEdit: (dept: Department) => void
  onDelete: (id: string) => void
  departments: Department[]
  memberCounts: Map<string, number>
}

export const createDepartmentColumns = ({
  onEdit,
  onDelete,
  departments,
  memberCounts,
}: CreateDepartmentColumnsProps): ColumnDef<Department>[] => [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: 'Tên phòng ban',
    cell: ({ row }) => {
      const dept = row.original
      const isRoot = !dept.parent_id
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">{dept.name}</span>
          {isRoot && (
            <Badge
              variant="outline"
              className="border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-400"
            >
              Gốc
            </Badge>
          )}
        </div>
      )
    },
  },
  {
    id: 'parent',
    header: 'Phòng ban cha',
    cell: ({ row }) => {
      const parentId = row.original.parent_id
      if (!parentId) {
        return <span className="text-muted-foreground text-sm">—</span>
      }
      const parent = departments.find((d) => d.id === parentId)
      return (
        <span className="text-sm text-foreground">{parent?.name || 'N/A'}</span>
      )
    },
  },
  {
    id: 'member_count',
    header: 'Nhân viên',
    cell: ({ row }) => {
      const count = memberCounts.get(row.original.id) || 0
      return (
        <div className="flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-sm text-foreground">{count}</span>
        </div>
      )
    },
  },
  {
    accessorKey: 'created_at',
    header: 'Ngày tạo',
    cell: ({ row }) => {
      const date = new Date(row.getValue('created_at') as string)
      return (
        <span className="text-sm text-muted-foreground">
          {date.toLocaleDateString('vi-VN')}
        </span>
      )
    },
  },
  {
    id: 'actions',
    header: () => <span className="sr-only">Thao tác</span>,
    cell: ({ row }) => {
      const dept = row.original
      return (
        <div className="flex items-center justify-end gap-1 pr-1">
          <Button variant="ghost" className="h-8 w-8 p-0" onClick={() => onEdit(dept)} title="Sửa">
            <Pencil className="text-muted-foreground h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="text-muted-foreground h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl border-border/50 shadow-md">
              <DropdownMenuItem
                onClick={() => onDelete(dept.id)}
                className="text-destructive focus:text-destructive cursor-pointer"
              >
                <Trash className="mr-2 h-4 w-4" />
                Xóa
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
]
