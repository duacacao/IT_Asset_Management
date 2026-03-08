'use client'

import { memo, useMemo, useState } from 'react'
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
import { createEndUserColumns } from './end-user-columns'
import { EndUserWithDevice } from '@/types/end-user'
import { EmptyState } from '@/components/EmptyState'
import { Users2, ChevronsLeft, ChevronsRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EndUserTableProps {
  data: EndUserWithDevice[]
  selectedIds: string[]
  onSelectId: (id: string, checked: boolean) => void
  onSelectAll: (checked: boolean) => void
  onEdit: (user: EndUserWithDevice) => void
  onDelete: (id: string) => void
  onView: (id: string) => void
}

export const EndUserTable = memo(function EndUserTable({
  data,
  selectedIds,
  onSelectId,
  onSelectAll,
  onEdit,
  onDelete,
  onView,
}: EndUserTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  const columns = useMemo(
    () => createEndUserColumns({ onEdit, onDelete, onView }),
    [onEdit, onDelete, onView]
  )

  const table = useReactTable({
    data,
    columns,
    getRowId: (row) => row.id,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection: selectedIds.reduce((acc, id) => ({ ...acc, [id]: true }), {}),
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    enableRowSelection: true,
    onRowSelectionChange: (updater) => {
      const currentSelection = selectedIds.reduce((acc, id) => ({ ...acc, [id]: true }), {})
      const nextSelection = typeof updater === 'function' ? updater(currentSelection) : updater

      const nextSelectedIds = Object.keys(nextSelection)

      if (nextSelectedIds.length === data.length && data.length > 0) {
        onSelectAll(true)
        return
      }

      if (nextSelectedIds.length === 0) {
        onSelectAll(false)
        return
      }

      const added = nextSelectedIds.filter((id) => !selectedIds.includes(id))
      const removed = selectedIds.filter((id) => !nextSelectedIds.includes(id))

      added.forEach((id) => onSelectId(id, true))
      removed.forEach((id) => onSelectId(id, false))
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  return (
    <div className="space-y-4">
      <div className="relative rounded-xl border-none shadow-md bg-white dark:bg-card transition-all duration-300">
        <Table containerClassName="h-[calc(100vh-220px)] overflow-auto">
          <TableHeader className="bg-white dark:bg-card sticky top-0 z-10 shadow-sm">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-border/20 hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  let widthClass = ''
                  const id = header.id
                  if (id === 'select') widthClass = 'w-[40px] align-middle'
                  else if (id === 'full_name') widthClass = 'w-[25%] min-w-[250px]'
                  else if (id === 'department')
                    widthClass = 'w-[15%] min-w-[140px] whitespace-nowrap'
                  else if (id === 'position') widthClass = 'w-[15%] min-w-[140px] whitespace-nowrap'
                  else if (id === 'devices') widthClass = 'w-[30%] min-w-[350px]'
                  else if (id === 'actions') widthClass = 'w-[120px] text-right pr-4'

                  return (
                    <TableHead
                      key={header.id}
                      className={cn(
                        'text-muted-foreground text-xs font-semibold uppercase tracking-wider',
                        widthClass
                      )}
                    >
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
                  className="border-border/20 transition-colors hover:bg-muted/30"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-48">
                  <EmptyState
                    icon={Users2}
                    title="Không có dữ liệu"
                    description="Không tìm thấy người dùng nào phù hợp với bộ lọc."
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
          {selectedIds.length > 0 ? (
            <span>
              {selectedIds.length} / {table.getFilteredRowModel().rows.length} người dùng được chọn
            </span>
          ) : (
            <span>{table.getFilteredRowModel().rows.length} người dùng</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* Page size */}
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm whitespace-nowrap">Hiển thị</span>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value))
              }}
            >
              <SelectTrigger className="h-8 w-[70px] rounded-xl border-border/50 shadow-sm">
                <SelectValue placeholder={table.getState().pagination.pageSize} />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border/50 shadow-md">
                {[10, 20, 30, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
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
              className="h-8 w-8 cursor-pointer rounded-xl border-border/50 shadow-sm"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 cursor-pointer rounded-xl border-border/50 shadow-sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 cursor-pointer rounded-xl border-border/50 shadow-sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 cursor-pointer rounded-xl border-border/50 shadow-sm"
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
