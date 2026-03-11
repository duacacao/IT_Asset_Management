import { ColumnDef } from '@tanstack/react-table'
import { Department, Position } from '@/types/department'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header'
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
  canEdit?: boolean
  canDelete?: boolean
}

export const createDepartmentColumns = ({
  onEdit,
  onDelete,
  departments,
  positions,
  memberCounts,
  canEdit = true,
  canDelete = true,
}: CreateDepartmentColumnsProps): ColumnDef<Department>[] => {
  // Viewer không cần select column (không có bulk actions)
  const showSelect = canEdit || canDelete

  return [
    ...(showSelect
      ? [
          {
            id: 'select',
            header: ({ table }: { table: import('@tanstack/react-table').Table<Department> }) => (
              <Checkbox
                checked={
                  table.getIsAllPageRowsSelected() ||
                  (table.getIsSomePageRowsSelected() && 'indeterminate')
                }
                onCheckedChange={(value: boolean) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
              />
            ),
            cell: ({ row }: { row: import('@tanstack/react-table').Row<Department> }) => (
              <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value: boolean) => row.toggleSelected(!!value)}
                aria-label="Select row"
              />
            ),
            enableSorting: false,
            enableHiding: false,
          } as ColumnDef<Department>,
        ]
      : []),
    {
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Tên phòng ban" />,
      cell: ({ row }) => {
        const dept = row.original
        const isRoot = !dept.parent_id
        const parent = dept.parent_id ? departments.find((d) => d.id === dept.parent_id) : null
        return (
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <span className="text-foreground text-sm font-medium">{dept.name}</span>
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
              <span className="text-muted-foreground text-xs">Trực thuộc: {parent.name}</span>
            )}
          </div>
        )
      },
    },
    {
      id: 'positions',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Chức vụ" />,
      cell: ({ row }) => {
        const deptId = row.original.id
        const deptPositions = positions.filter((p) => p.department_id === deptId)
        if (deptPositions.length === 0) {
          return <span className="text-muted-foreground text-sm">—</span>
        }
        return (
          <div className="flex flex-wrap gap-1">
            {deptPositions.map((p) => (
              <Badge key={p.id} variant="secondary" className="text-xs">
                {p.name}
              </Badge>
            ))}
          </div>
        )
      },
    },
    {
      id: 'member_count',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Nhân viên" />,
      cell: ({ row }) => {
        const count = memberCounts.get(row.original.id) || 0
        return (
          <div className="flex items-center gap-1.5">
            <Users className="text-muted-foreground h-3.5 w-3.5" />
            <span className="text-foreground text-sm">{count}</span>
          </div>
        )
      },
    },
    {
      accessorKey: 'created_at',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Ngày tạo" />,
      cell: ({ row }) => {
        const date = new Date(row.getValue('created_at') as string)
        return (
          <span className="text-muted-foreground text-sm">{date.toLocaleDateString('vi-VN')}</span>
        )
      },
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">Thao tác</span>,
      cell: ({ row }) => {
        const dept = row.original

        // Viewer không thấy actions
        if (!canEdit && !canDelete) return null

        return (
          <div className="flex items-center justify-end gap-1 pr-1">
            {canEdit && (
              <Button
                variant="ghost"
                className="h-8 w-8 p-0"
                onClick={() => onEdit(dept)}
                title="Sửa"
              >
                <Pencil className="text-muted-foreground h-4 w-4" />
              </Button>
            )}
            {canDelete && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal className="text-muted-foreground h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="border-border/50 rounded-xl shadow-md">
                  <DropdownMenuItem
                    onClick={() => onDelete(dept.id)}
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
}
