import { useMemo, useState, useCallback } from 'react';
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
} from '@tanstack/react-table';
import {
    Table, TableBody, TableCell,
    TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { CheckCircle2, SearchX, Loader2, FileDown, Download, Trash2 } from 'lucide-react';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription,
    AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Device, DeviceStatus, DEVICE_STATUS_CONFIG } from '@/types/device';
import { useDeviceStore } from '@/stores/useDeviceStore';
import { FilterBar, DeviceFilters } from './FilterBar';
import { createDeviceColumns, STATUS_DOT_COLORS } from './device-columns';
import { isWithinInterval, parseISO } from 'date-fns';
import { EmptyState } from '@/components/EmptyState';
import { exportDevicesToCSV } from '@/lib/export-utils';

interface DeviceListProps {
    devices: Device[];
    onViewDevice: (device: Device) => void;
    onUpdateDevice: (device: Device) => void;
    onExportDevice: (device: Device) => void;
    onDeleteDevice: (deviceId: string) => void;
}


export function DeviceList({
    devices,
    onViewDevice,
    onUpdateDevice,
    onExportDevice,
    onDeleteDevice,
}: DeviceListProps) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [filters, setFilters] = useState<DeviceFilters>({});

    const setDeviceStatus = useDeviceStore((s) => s.setDeviceStatus);

    // Comprehensive filter logic — tìm theo tên, id, fileName, IP + status + date range
    const filteredDevices = useMemo(() => {
        return devices.filter((device) => {
            if (filters.search) {
                const searchLower = filters.search.toLowerCase();
                const matchesSearch =
                    device.deviceInfo.name.toLowerCase().includes(searchLower) ||
                    device.id.toLowerCase().includes(searchLower) ||
                    device.fileName.toLowerCase().includes(searchLower) ||
                    device.deviceInfo.ip.toLowerCase().includes(searchLower);
                if (!matchesSearch) return false;
            }
            if (filters.status && filters.status.length > 0) {
                if (!filters.status.includes(device.status)) return false;
            }
            if (filters.dateRange?.from && filters.dateRange?.to) {
                try {
                    const deviceDate = parseISO(device.metadata.importedAt);
                    const isInRange = isWithinInterval(deviceDate, {
                        start: filters.dateRange.from,
                        end: filters.dateRange.to,
                    });
                    if (!isInRange) return false;
                } catch {
                    return false;
                }
            }
            return true;
        });
    }, [devices, filters]);

    // Columns — lấy từ device-columns.tsx để giữ file gọn
    const columns = useMemo(
        () => createDeviceColumns({ onViewDevice, onUpdateDevice, onExportDevice, setDeleteId }),
        [onViewDevice, onUpdateDevice, onExportDevice, setDeleteId]
    );

    const table = useReactTable({
        data: filteredDevices,
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
    });

    return (
        <div className="space-y-4">
            {/* FilterBar */}
            <FilterBar
                onFilterChange={setFilters}
                onReset={() => setFilters({})}
            />
            {/* Export CSV — luôn hiển thị, export thiết bị đang filter */}
            <div className="flex justify-end">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                        // Export selected rows nếu có, ngược lại export tất cả thiết bị đang filter
                        const selectedRows = table.getFilteredSelectedRowModel().rows;
                        const dataToExport = selectedRows.length > 0
                            ? selectedRows.map(r => r.original)
                            : filteredDevices;
                        exportDevicesToCSV(dataToExport);
                    }}
                >
                    <FileDown className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
                    Export CSV
                </Button>
            </div>

            {/* Bulk Actions toolbar */}
            {Object.keys(rowSelection).length > 0 && (
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border">
                    <span className="text-sm font-medium">
                        {Object.keys(rowSelection).length} đã chọn
                    </span>
                    <div className="flex items-center gap-2 ml-auto">
                        {/* Bulk set status */}
                        <Select onValueChange={(val) => {
                            const selectedRows = table.getFilteredSelectedRowModel().rows;
                            selectedRows.forEach((row) => setDeviceStatus(row.original.id, val as DeviceStatus));
                            setRowSelection({});
                        }}>
                            <SelectTrigger className="w-[150px] h-8 text-xs">
                                <CheckCircle2 className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
                                <SelectValue placeholder="Đặt trạng thái" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(DEVICE_STATUS_CONFIG).map(([key, config]) => (
                                    <SelectItem key={key} value={key}>
                                        <span className={`mr-1.5 h-2 w-2 rounded-full ${STATUS_DOT_COLORS[key as DeviceStatus]} inline-block`} />
                                        {config.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Bulk export */}
                        <Button variant="outline" size="sm" className="h-8" onClick={() => {
                            const selectedRows = table.getFilteredSelectedRowModel().rows;
                            selectedRows.forEach((row) => onExportDevice(row.original));
                            setRowSelection({});
                        }}>
                            <Download className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
                            Xuất file
                        </Button>

                        {/* Bulk delete */}
                        <Button variant="destructive" size="sm" className="h-8" onClick={() => setBulkDeleteOpen(true)}>
                            <Trash2 className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
                            Xóa
                        </Button>
                    </div>
                </div>
            )}

            {/* Table — chiều cao cố định, scroll nếu nhiều thiết bị */}
            <div className="rounded-md border">
                <div className="h-[480px] overflow-auto">
                    <Table>
                        <TableHeader className="sticky top-0 z-10 bg-background">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id}>
                                            {flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        role="row"
                                        aria-label={`Device ${row.original.deviceInfo.name}, Status ${row.original.status}, IP ${row.original.deviceInfo.ip || 'Not set'}, OS ${row.original.deviceInfo.os}`}
                                        className="cursor-pointer hover:bg-muted/50"
                                        tabIndex={0}
                                        onClick={(e) => {
                                            // Không mở view modal khi click vào actions column hoặc checkbox
                                            const target = e.target as HTMLElement;
                                            if (target.closest('[data-no-row-click]')) return;
                                            onViewDevice(row.original);
                                        }}
                                        onKeyDown={(e) => {
                                            // B1: Hỗ trợ keyboard navigation — Enter mở detail
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                onViewDevice(row.original);
                                            }
                                        }}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )}
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
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
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

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Hành động này không thể hoàn tác. Thiết bị và toàn bộ dữ liệu sẽ bị xóa vĩnh viễn.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={isDeleting}
                            onClick={async () => {
                                if (deleteId) {
                                    setIsDeleting(true);
                                    onDeleteDevice(deleteId);
                                    setDeleteId(null);
                                    setIsDeleting(false);
                                }
                            }}
                        >
                            {isDeleting ? (
                                <><Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />Đang xóa…</>
                            ) : 'Xóa'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Bulk delete confirmation */}
            <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xóa {Object.keys(rowSelection).length} thiết bị?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tất cả thiết bị đã chọn và dữ liệu sẽ bị xóa vĩnh viễn.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={isDeleting}
                            onClick={async () => {
                                setIsDeleting(true);
                                const selectedRows = table.getFilteredSelectedRowModel().rows;
                                selectedRows.forEach((row) => onDeleteDevice(row.original.id));
                                setRowSelection({});
                                setBulkDeleteOpen(false);
                                setIsDeleting(false);
                            }}
                        >
                            {isDeleting ? (
                                <><Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />Đang xóa…</>
                            ) : 'Xóa tất cả'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
