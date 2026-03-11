import { useMemo, useState, useEffect, ReactNode } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  SortingState,
  VisibilityState,
  ColumnFiltersState,
  RowSelectionState,
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
import { SearchX } from 'lucide-react'
import { AppLoader } from '@/components/ui/app-loader'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Device, DeviceStatus } from '@/types/device'
import { useUpdateStatusMutation, useBulkUpdateStatusMutation } from '@/hooks/useDevicesQuery'
import { checkDeviceAssignment, checkDevicesAssignments } from '@/app/actions/devices'
import { createDeviceColumns } from './device-columns'
import { EmptyState } from '@/components/EmptyState'
import { DataTableViewOptions } from '@/components/ui/data-table-view-options'
import { usePermissions } from '@/hooks/use-permissions'

// Params truyền vào toolbar render prop — export để page có thể tham chiếu type
export interface DeviceToolbarParams {
  viewOptions: ReactNode
  selectedCount: number
  onBulkDelete: () => void
  isBulkPending: boolean
}

interface DeviceListProps {
  devices: Device[]
  onViewDevice: (device: Device) => void
  onUpdateDevice: (device: Device) => void
  onExportDevice: (device: Device) => void
  onDeleteDevice: (deviceId: string) => void
  onSelectionChange?: (selectedDevices: Device[]) => void
  onHoverDevice?: (deviceId: string) => void
  highlightId?: string | null
  toolbar?: (params: DeviceToolbarParams) => ReactNode
}

export function DeviceList({
  devices,
  onViewDevice,
  onUpdateDevice,
  onExportDevice,
  onDeleteDevice,
  onSelectionChange,
  onHoverDevice,
  highlightId,
  toolbar,
}: DeviceListProps) {
  // Table state
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  // Delete dialog state
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  // State cho cảnh báo thiết bị đang bàn giao
  const [assignmentWarning, setAssignmentWarning] = useState<{
    endUserName: string | null
  } | null>(null)
  const [bulkAssignmentCount, setBulkAssignmentCount] = useState(0)
  const [isCheckingAssignment, setIsCheckingAssignment] = useState(false)

  // Effect: Scroll to highlighted row
  useEffect(() => {
    if (highlightId) {
      const rowElement = document.getElementById(`device-row-${highlightId}`)
      if (rowElement) {
        rowElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }, [highlightId])

  // Effect: Kiểm tra assignment khi user click xóa device
  useEffect(() => {
    if (!deleteId) return
    let cancelled = false

    async function check() {
      setIsCheckingAssignment(true)
      try {
        const result = await checkDeviceAssignment(deleteId!)
        if (!cancelled) {
          setAssignmentWarning(result.hasAssignment ? { endUserName: result.endUserName } : null)
        }
      } catch {
        // Nếu lỗi check → fallback về dialog thường (an toàn)
        if (!cancelled) setAssignmentWarning(null)
      } finally {
        if (!cancelled) setIsCheckingAssignment(false)
      }
    }

    check()
    return () => {
      cancelled = true
    }
  }, [deleteId])

  const updateStatusMutation = useUpdateStatusMutation()
  const bulkUpdateStatusMutation = useBulkUpdateStatusMutation()

  // Permission flags — ẩn actions cho viewer
  const { canEdit, canDelete, canImportExport } = usePermissions()

  // Columns — lấy từ device-columns.tsx để giữ file gọn
  const columns = useMemo(
    () =>
      createDeviceColumns({
        onViewDevice,
        onUpdateDevice,
        onExportDevice,
        setDeleteId,
        canEdit,
        canDelete,
        canExport: canImportExport,
      }),
    [onViewDevice, onUpdateDevice, onExportDevice, setDeleteId, canEdit, canDelete, canImportExport]
  )

  const table = useReactTable({
    data: devices,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    enableRowSelection: true,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  // Memoize selected devices computation to avoid unnecessary recalculations
  const selectedDevices = useMemo(() => {
    const selectedRows = table.getFilteredSelectedRowModel().rows
    return selectedRows.map((row) => row.original)
  }, [table, rowSelection])

  // Effect: Notify parent of selection changes
  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(selectedDevices)
    }
  }, [selectedDevices, onSelectionChange])

  // Bulk action: set status cho tất cả device đã chọn
  const handleBulkSetStatus = (status: DeviceStatus) => {
    const selectedRows = table.getFilteredSelectedRowModel().rows
    const selectedIds = selectedRows.map((row) => row.original.id)
    bulkUpdateStatusMutation.mutate({
      deviceIds: selectedIds,
      status,
    })
    setRowSelection({})
  }

  // Bulk action: mở dialog xác nhận xóa hàng loạt
  const handleBulkDeleteClick = async () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows
    const selectedIds = selectedRows.map((row) => row.original.id)
    try {
      const { assignedCount } = await checkDevicesAssignments(selectedIds)
      setBulkAssignmentCount(assignedCount)
    } catch {
      setBulkAssignmentCount(0)
    }
    setBulkDeleteOpen(true)
  }

  return (
    <div className="space-y-4">
      {/* Toolbar via render prop — truyền viewOptions + selection info cho DeviceToolbar */}
      {toolbar &&
        toolbar({
          viewOptions: <DataTableViewOptions table={table} />,
          selectedCount: Object.keys(rowSelection).length,
          onBulkDelete: handleBulkDeleteClick,
          isBulkPending: bulkUpdateStatusMutation.isPending || updateStatusMutation.isPending,
        })}

      {/* Table — chiều cao cố định, scroll nếu nhiều thiết bị */}
      <div className="dark:bg-card relative overflow-hidden rounded-xl border-none bg-white shadow-md">
        <Table containerClassName="h-[calc(100vh-220px)] overflow-auto">
          <TableHeader className="bg-background sticky top-0 z-10 shadow-sm">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  // Determine column width based on header ID
                  let widthClass = ''
                  const id = header.id

                  if (id === 'select') widthClass = 'w-[40px] align-middle'
                  else if (id === 'deviceInfo_name') widthClass = 'w-[30%] min-w-[300px]'
                  else if (id === 'type') widthClass = 'w-[15%] min-w-[120px]'
                  else if (id === 'status') widthClass = 'w-[15%] min-w-[120px]'
                  else if (id === 'assignment_assignee_name') widthClass = 'w-[25%] min-w-[200px]'
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
                  id={`device-row-${row.original.id}`}
                  role="row"
                  data-highlighted={highlightId === row.original.id}
                  aria-label={`Device ${row.original.deviceInfo.name}, Status ${row.original.status}, IP ${row.original.deviceInfo.ip || 'Not set'}, OS ${row.original.deviceInfo.os}`}
                  className={`${highlightId === row.original.id ? 'bg-primary/10 transition-colors duration-1000' : ''}`}
                  tabIndex={0}
                  onMouseEnter={() => onHoverDevice?.(row.original.id)}
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
                    icon={SearchX}
                    iconSize={48}
                    title="Không tìm thấy thiết bị"
                    description="Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-muted-foreground text-sm">
          {table.getFilteredRowModel().rows.length} thiết bị
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

      {/* Single delete confirmation */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteId(null)
            setAssignmentWarning(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {assignmentWarning?.endUserName
                ? '⚠️ Thiết bị đang được sử dụng'
                : 'Bạn có chắc chắn muốn xóa?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isCheckingAssignment ? (
                <span className="flex items-center gap-2">
                  <AppLoader layout="horizontal" hideText />
                  Đang kiểm tra trạng thái bàn giao...
                </span>
              ) : assignmentWarning?.endUserName ? (
                <>
                  Thiết bị này đang được bàn giao cho{' '}
                  <strong>{assignmentWarning.endUserName}</strong>.
                  <br />
                  Nếu xóa, thiết bị sẽ tự động được thu hồi và end-user sẽ không còn thiết bị.
                </>
              ) : (
                'Hành động này không thể hoàn tác. Thiết bị và toàn bộ dữ liệu sẽ bị xóa vĩnh viễn.'
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting || isCheckingAssignment}
              onClick={async () => {
                if (deleteId) {
                  setIsDeleting(true)
                  onDeleteDevice(deleteId)
                  setDeleteId(null)
                  setAssignmentWarning(null)
                  setIsDeleting(false)
                }
              }}
            >
              {isDeleting ? (
                <>
                  <AppLoader layout="horizontal" hideText className="mr-2" />
                  Đang xóa…
                </>
              ) : assignmentWarning?.endUserName ? (
                'Thu hồi & Xóa'
              ) : (
                'Xóa'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk delete confirmation */}
      <AlertDialog
        open={bulkDeleteOpen}
        onOpenChange={(open) => {
          setBulkDeleteOpen(open)
          if (!open) setBulkAssignmentCount(0)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa {Object.keys(rowSelection).length} thiết bị?</AlertDialogTitle>
            <AlertDialogDescription>
              {bulkAssignmentCount > 0 ? (
                <>
                  ⚠️ <strong>{bulkAssignmentCount}</strong> trong {Object.keys(rowSelection).length}{' '}
                  thiết bị đang được bàn giao cho end-user.
                  <br />
                  Tất cả sẽ tự động được thu hồi nếu bạn xóa.
                </>
              ) : (
                'Tất cả thiết bị đã chọn và dữ liệu sẽ bị xóa vĩnh viễn.'
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
              onClick={async () => {
                setIsDeleting(true)
                const selectedRows = table.getFilteredSelectedRowModel().rows
                selectedRows.forEach((row) => onDeleteDevice(row.original.id))
                setRowSelection({})
                setBulkDeleteOpen(false)
                setBulkAssignmentCount(0)
                setIsDeleting(false)
              }}
            >
              {isDeleting ? (
                <>
                  <AppLoader layout="horizontal" hideText className="mr-2" />
                  Đang xóa…
                </>
              ) : (
                'Xóa tất cả'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
