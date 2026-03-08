import { ColumnDef } from '@tanstack/react-table'
import { Department, Position } from '@/types/department'
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
  positions: Position[]
  memberCounts: Map<string, number>
}

export const createDepartmentColumns = ({
  onEdit,
  onDelete,
  departments,
  positions,
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
      const parent = dept.parent_id ? departments.find((d) => d.id === dept.parent_id) : null
      return (
        <div className="flex flex-col gap-0.5">
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
          {parent && (
            <span className="text-xs text-muted-foreground">
              Trực thuộc: {parent.name}
            </span>
          )}
        </div>
      )
    },
  },
  {
    id: 'positions',
    header: 'Chức vụ',
    cell: ({ row }) => {
      const deptId = row.original.id
      const deptPositions = positions.filter((p) => p.department_id === deptId)
      if (deptPositions.length === 0) {
        return <span className="text-muted-foreground text-sm">—</span>
      }
      return (
        <div className="flex flex-wrap gap-1">
          {deptPositions.map((p) => (
            <Badge
              key={p.id}
              variant="secondary"
              className="text-xs"
            >
              {p.name}
            </Badge>
          ))}
        </div>
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
