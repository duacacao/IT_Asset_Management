'use client'

import { useMemo, useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  type SortingState,
  type ColumnFiltersState,
  flexRender,
} from '@tanstack/react-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { createDepartmentColumns } from './department-columns'
import type { Department, Position } from '@/types/department'

interface DepartmentTableProps {
  data: Department[]
  positions: Position[]
  onEdit: (dept: Department) => void
  onDelete: (id: string) => void
  memberCounts: Map<string, number>
  searchTerm: string
  selectedIds: string[]
  onSelectedIdsChange: (ids: string[]) => void
}

export function DepartmentTable({
  data,
  positions,
  onEdit,
  onDelete,
  memberCounts,
  searchTerm,
  selectedIds,
  onSelectedIdsChange,
}: DepartmentTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const columns = useMemo(
    () => createDepartmentColumns({ onEdit, onDelete, departments: data, positions, memberCounts }),
    [onEdit, onDelete, data, positions, memberCounts]
  )

  // Client-side search filter
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data
    const term = searchTerm.toLowerCase()
    return data.filter((d) => d.name.toLowerCase().includes(term))
  }, [data, searchTerm])

  const rowSelection = useMemo(() => {
    return selectedIds.reduce(
      (acc, id) => ({ ...acc, [id]: true }),
      {} as Record<string, boolean>
    )
  }, [selectedIds])

  const table = useReactTable({
    data: filteredData,
    columns,
    getRowId: (row) => row.id,
    state: { sorting, columnFilters, rowSelection },
    enableRowSelection: true,
    onRowSelectionChange: (updater) => {
      const newSelection = typeof updater === 'function' ? updater(rowSelection) : updater
      onSelectedIdsChange(Object.keys(newSelection).filter((k) => newSelection[k]))
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  return (
    <div className="relative rounded-xl border-none bg-white shadow-md transition-all duration-300 dark:bg-card">
      <div className="h-[calc(100vh-280px)] overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-white shadow-sm dark:bg-card">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-border/30 hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  let widthClass = ''
                  const id = header.column.id
                  if (id === 'select') widthClass = 'w-[40px]'
                  else if (id === 'name') widthClass = 'w-[30%] min-w-[200px]'
                  else if (id === 'positions') widthClass = 'w-[25%] min-w-[160px]'
                  else if (id === 'member_count') widthClass = 'w-[15%] min-w-[100px]'
                  else if (id === 'created_at') widthClass = 'w-[15%] min-w-[120px]'
                  else if (id === 'actions') widthClass = 'w-[100px] text-right pr-4'

                  return (
                    <TableHead key={header.id} className={`text-muted-foreground text-xs font-semibold uppercase tracking-wider ${widthClass}`}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
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
                    <TableCell key={cell.id} className="py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <span className="text-muted-foreground">Không có phòng ban nào</span>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
