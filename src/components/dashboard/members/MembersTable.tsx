'use client'

import { memo, useMemo, useState, ReactNode } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { EmptyState } from '@/components/EmptyState'
import { DataTableViewOptions } from '@/components/ui/data-table-view-options'
import { Users2, ChevronsLeft, ChevronsRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { createMemberColumns } from './member-columns'
import type { OrganizationMember } from '@/types/organization'
import { usePermissions } from '@/hooks/use-permissions'

interface MembersTableProps {
  data: OrganizationMember[]
  currentUserId: string | undefined
  onEditRole: (member: OrganizationMember) => void
  onRemove: (member: OrganizationMember) => void
  onResetPassword: (member: OrganizationMember) => void
  toolbar?: (viewOptions: ReactNode) => ReactNode
}

export const MembersTable = memo(function MembersTable({
  data,
  currentUserId,
  onEditRole,
  onRemove,
  onResetPassword,
  toolbar,
}: MembersTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  // Permission flags — ẩn actions cho non-Admin/Owner
  const { canManageMembers } = usePermissions()

  const columns = useMemo(
    () =>
      createMemberColumns({
        onEditRole,
        onRemove,
        onResetPassword,
        currentUserId,
        canManageMembers,
      }),
    [onEditRole, onRemove, onResetPassword, currentUserId, canManageMembers]
  )

  const table = useReactTable({
    data,
    columns,
    getRowId: (row) => row.id,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    enableRowSelection: true,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  return (
    <div className="space-y-4">
      {/* Toolbar with view options */}
      {toolbar && toolbar(<DataTableViewOptions table={table} />)}

      <div className="dark:bg-card relative overflow-hidden rounded-xl border-none bg-white shadow-md transition-all duration-300">
        <Table containerClassName="h-[calc(100vh-220px)] overflow-auto">
          <TableHeader className="bg-background sticky top-0 z-10 shadow-sm">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  let widthClass = ''
                  const id = header.id

                  if (id === 'select') widthClass = 'w-[40px] align-middle'
                  else if (id === 'full_name') widthClass = 'w-[40%] min-w-[250px]'
                  else if (id === 'role') widthClass = 'w-[20%] min-w-[150px]'
                  else if (id === 'created_at') widthClass = 'w-[20%] min-w-[150px]'
                  else if (id === 'actions') widthClass = 'w-[120px] text-right pr-4'

                  return (
                    <TableHead key={header.id} className={widthClass}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className="border-border/30 hover:bg-muted/50 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-2">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-48 text-center">
                  <EmptyState
                    icon={Users2}
                    title="Không có thành viên"
                    description="Không tìm thấy thành viên nào phù hợp với bộ lọc."
                    iconSize={48}
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-muted-foreground text-sm">
          <span>{table.getFilteredRowModel().rows.length} thành viên</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Page size */}
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm whitespace-nowrap">Hiển thị</span>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => table.setPageSize(Number(value))}
            >
              <SelectTrigger className="border-border/50 h-8 w-[70px] cursor-pointer rounded-xl shadow-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-border/50 rounded-xl shadow-md">
                {[10, 20, 30, 50].map((size) => (
                  <SelectItem key={size} value={`${size}`} className="cursor-pointer">
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Page indicator */}
          <span className="text-muted-foreground text-sm whitespace-nowrap">
            Trang {table.getState().pagination.pageIndex + 1} / {table.getPageCount() || 1}
          </span>

          {/* Navigation */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="border-border/50 h-8 w-8 cursor-pointer rounded-xl shadow-sm"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="border-border/50 h-8 w-8 cursor-pointer rounded-xl shadow-sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="border-border/50 h-8 w-8 cursor-pointer rounded-xl shadow-sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="border-border/50 h-8 w-8 cursor-pointer rounded-xl shadow-sm"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
})
