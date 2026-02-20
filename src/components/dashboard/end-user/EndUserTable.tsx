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
import { createEndUserColumns } from './end-user-columns'
import { EndUserWithDevice } from '@/types/end-user'
import { EmptyState } from '@/components/EmptyState'
import { Users2 } from 'lucide-react'

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
      // Handle functional update
      const currentSelection = selectedIds.reduce((acc, id) => ({ ...acc, [id]: true }), {})
      const nextSelection = typeof updater === 'function' ? updater(currentSelection) : updater

      const nextSelectedIds = Object.keys(nextSelection)

      // If all selected (or close to all, considering potential deselects)
      if (nextSelectedIds.length === data.length && data.length > 0) {
        onSelectAll(true)
        return
      }

      if (nextSelectedIds.length === 0) {
        onSelectAll(false)
        return
      }

      // Identify differences
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
      <div className="relative rounded-md border">
        <Table containerClassName="h-[calc(100vh-220px)] overflow-auto">
          <TableHeader className="bg-background sticky top-0 z-10 shadow-sm">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
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
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
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

      <div className="flex items-center justify-between">
        <div className="text-muted-foreground text-sm">
          {table.getFilteredRowModel().rows.length} người dùng
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Trước
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Sau
          </Button>
        </div>
      </div>
    </div>
  )
})
