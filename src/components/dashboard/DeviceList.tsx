import { useMemo, useState, useCallback } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    flexRender,
    ColumnDef,
    SortingState,
    VisibilityState,
    ColumnFiltersState,
    RowSelectionState,
} from '@tanstack/react-table';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Eye,
    MoreHorizontal,
    Download,
    Trash2,
    Search,
    ArrowUpDown,
    Filter,
    CheckCircle2,
    Pencil,
} from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Device, DeviceStatus, DEVICE_STATUS_CONFIG } from '@/types/device';
import { useDeviceStore } from '@/stores/useDeviceStore';
import { SoftLabel } from '@/components/ui/soft-label';
import { FilterBar, DeviceFilters } from './FilterBar';
import { isWithinInterval, parseISO } from 'date-fns';

interface DeviceListProps {
    devices: Device[];
    onViewDevice: (device: Device) => void;
    onUpdateDevice: (device: Device) => void;
    onExportDevice: (device: Device) => void;
    onDeleteDevice: (deviceId: string) => void;
}

// Thời gian tương đối (vd: "2 giờ trước")
function timeAgo(dateStr: string): string {
    const now = Date.now();
    const date = new Date(dateStr).getTime();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} ngày trước`;
    return new Date(dateStr).toLocaleDateString('vi-VN');
}

// Dot colors cho status dropdown items
const STATUS_DOT_COLORS: Record<DeviceStatus, string> = {
    active: 'bg-emerald-500',
    broken: 'bg-red-500',
    inactive: 'bg-gray-400',
};

function StatusLabel({ status }: { status: DeviceStatus }) {
    const config = DEVICE_STATUS_CONFIG[status];
    return (
        <SoftLabel color={config.softColor} size="sm">
            {config.label}
        </SoftLabel>
    );
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
    const [filters, setFilters] = useState<DeviceFilters>({});

    const setDeviceStatus = useDeviceStore((s) => s.setDeviceStatus);

    // Comprehensive filter logic
    const filteredDevices = useMemo(() => {
        return devices.filter((device) => {
            // Search filter - tìm trong deviceInfo.name, id, fileName
            if (filters.search) {
                const searchLower = filters.search.toLowerCase();
                const matchesSearch =
                    device.deviceInfo.name.toLowerCase().includes(searchLower) ||
                    device.id.toLowerCase().includes(searchLower) ||
                    device.fileName.toLowerCase().includes(searchLower) ||
                    device.deviceInfo.ip.toLowerCase().includes(searchLower);

                if (!matchesSearch) return false;
            }

            // Status filter
            if (filters.status && filters.status.length > 0) {
                if (!filters.status.includes(device.status)) return false;
            }

            // Date range filter - filter theo metadata.importedAt
            if (filters.dateRange?.from && filters.dateRange?.to) {
                try {
                    const deviceDate = parseISO(device.metadata.importedAt);
                    const isInRange = isWithinInterval(deviceDate, {
                        start: filters.dateRange.from,
                        end: filters.dateRange.to,
                    });
                    if (!isInRange) return false;
                } catch (error) {
                    // Nếu parse date lỗi, skip device này
                    return false;
                }
            }

            return true;
        });
    }, [devices, filters]);

    const columns: ColumnDef<Device>[] = useMemo(
        () => [
            {
                id: 'select',
                header: ({ table }) => (
                    <Checkbox
                        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
                        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                        aria-label="Select all"
                        className="translate-y-[2px]"
                    />
                ),
                cell: ({ row }) => (
                    <div data-no-row-click>
                        <Checkbox
                            checked={row.getIsSelected()}
                            onCheckedChange={(value) => row.toggleSelected(!!value)}
                            aria-label="Select row"
                            className="translate-y-[2px]"
                        />
                    </div>
                ),
                enableSorting: false,
                enableHiding: false,
            },
            {
                accessorKey: 'deviceInfo.name',
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    >
                        Tên thiết bị
                        <ArrowUpDown className="ml-2 h-4 w-4" aria-hidden="true" />
                    </Button>
                ),
                cell: ({ row }) => (
                    <p className="font-medium">{row.original.deviceInfo.name}</p>
                ),
            },
            {
                accessorKey: 'deviceInfo.os',
                header: 'OS',
                cell: ({ row }) => (
                    <span className="text-sm">{row.original.deviceInfo.os}</span>
                ),
            },
            {
                accessorKey: 'status',
                header: 'Trạng thái',
                cell: ({ row }) => <StatusLabel status={row.original.status ?? 'active'} />,
            },
            {
                accessorKey: 'metadata.importedAt',
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    >
                        Ngày import
                        <ArrowUpDown className="ml-2 h-4 w-4" aria-hidden="true" />
                    </Button>
                ),
                cell: ({ row }) => (
                    <span className="text-sm text-muted-foreground">
                        {timeAgo(row.original.metadata.importedAt)}
                    </span>
                ),
            },
            {
                id: 'actions',
                header: '',
                cell: ({ row }) => (
                    <div data-no-row-click>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" aria-label="Hành động">
                                    <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onViewDevice(row.original); }}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    Xem chi tiết
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onUpdateDevice(row.original); }}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Chỉnh sửa
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onExportDevice(row.original); }}>
                                    <Download className="mr-2 h-4 w-4" />
                                    Xuất file
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={(e) => { e.stopPropagation(); setDeleteId(row.original.id); }}
                                    className="text-destructive focus:text-destructive"
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Xóa
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                ),
            },
        ],
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
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={(e) => {
                                            // Không mở view modal khi click vào actions column hoặc checkbox
                                            const target = e.target as HTMLElement;
                                            if (target.closest('[data-no-row-click]')) return;
                                            onViewDevice(row.original);
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
                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                        Không tìm thấy thiết bị
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
                            onClick={() => {
                                if (deleteId) {
                                    onDeleteDevice(deleteId);
                                    setDeleteId(null);
                                }
                            }}
                        >
                            Xóa
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
                            onClick={() => {
                                const selectedRows = table.getFilteredSelectedRowModel().rows;
                                selectedRows.forEach((row) => onDeleteDevice(row.original.id));
                                setRowSelection({});
                                setBulkDeleteOpen(false);
                            }}
                        >
                            Xóa tất cả
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
