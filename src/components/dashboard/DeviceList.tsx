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
import { Badge } from '@/components/ui/badge';
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
    Tag,
    Filter,
    CheckCircle2,
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

interface DeviceListProps {
    devices: Device[];
    onViewDevice: (device: Device) => void;
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

function StatusBadge({ status }: { status: DeviceStatus }) {
    const config = DEVICE_STATUS_CONFIG[status];
    return (
        <Badge variant={config.variant} className="text-xs">
            <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${config.color} inline-block`} />
            {config.label}
        </Badge>
    );
}

export function DeviceList({
    devices,
    onViewDevice,
    onExportDevice,
    onDeleteDevice,
}: DeviceListProps) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [globalFilter, setGlobalFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

    const setDeviceStatus = useDeviceStore((s) => s.setDeviceStatus);

    // Lọc theo status trước khi đưa vào table
    const filteredDevices = useMemo(() => {
        if (statusFilter === 'all') return devices;
        return devices.filter((d) => d.status === statusFilter);
    }, [devices, statusFilter]);

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
                    <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={(value) => row.toggleSelected(!!value)}
                        aria-label="Select row"
                        className="translate-y-[2px]"
                        onClick={(e) => e.stopPropagation()}
                    />
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
                        Device Name
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
                cell: ({ row }) => (
                    <div>
                        <p className="font-medium">{row.original.deviceInfo.name}</p>
                        <p className="text-xs text-muted-foreground">
                            {row.original.deviceInfo.os} • {row.original.deviceInfo.ram}
                        </p>
                    </div>
                ),
            },
            {
                accessorKey: 'status',
                header: 'Status',
                cell: ({ row }) => <StatusBadge status={row.original.status ?? 'active'} />,
            },
            {
                accessorKey: 'deviceInfo.cpu',
                header: 'CPU',
                cell: ({ row }) => (
                    <div className="max-w-[180px] truncate text-sm" title={row.original.deviceInfo.cpu}>
                        {row.original.deviceInfo.cpu}
                    </div>
                ),
            },
            {
                accessorKey: 'metadata.totalSheets',
                header: 'Sheets',
                cell: ({ row }) => (
                    <Badge variant="secondary">{row.original.metadata.totalSheets}</Badge>
                ),
            },
            {
                accessorKey: 'metadata.fileSize',
                header: 'Size',
                cell: ({ row }) => (
                    <span className="text-sm text-muted-foreground">{row.original.metadata.fileSize}</span>
                ),
            },
            {
                accessorKey: 'metadata.importedAt',
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    >
                        Imported
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
                cell: ({ row }) => (
                    <span className="text-sm text-muted-foreground">
                        {timeAgo(row.original.metadata.importedAt)}
                    </span>
                ),
            },
            {
                id: 'tags',
                header: 'Tags',
                cell: ({ row }) => {
                    const tags = row.original.metadata.tags;
                    if (!tags || tags.length === 0) return <span className="text-xs text-muted-foreground">—</span>;
                    return (
                        <div className="flex gap-1 flex-wrap max-w-[150px]">
                            {tags.slice(0, 2).map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs px-1.5">
                                    {tag}
                                </Badge>
                            ))}
                            {tags.length > 2 && (
                                <Badge variant="outline" className="text-xs px-1.5">
                                    +{tags.length - 2}
                                </Badge>
                            )}
                        </div>
                    );
                },
            },
            {
                id: 'actions',
                header: '',
                cell: ({ row }) => (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onViewDevice(row.original)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onExportDevice(row.original)}>
                                <Download className="mr-2 h-4 w-4" />
                                Export
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => setDeleteId(row.original.id)}
                                className="text-destructive focus:text-destructive"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ),
            },
        ],
        [onViewDevice, onExportDevice]
    );

    const table = useReactTable({
        data: filteredDevices,
        columns,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            globalFilter,
            rowSelection,
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onGlobalFilterChange: setGlobalFilter,
        onRowSelectionChange: setRowSelection,
        enableRowSelection: true,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    return (
        <div className="space-y-4">
            {/* Search + Filter bar */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search devices..."
                        value={globalFilter ?? ''}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        className="pl-8 h-9"
                    />
                </div>
                {/* Status filter */}
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px] h-9">
                        <Filter className="mr-2 h-3.5 w-3.5" />
                        <SelectValue placeholder="Filter status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status ({devices.length})</SelectItem>
                        <SelectItem value="active">
                            🟢 Đang sử dụng ({devices.filter(d => (d.status ?? 'active') === 'active').length})
                        </SelectItem>
                        <SelectItem value="broken">
                            🔴 Hư hỏng ({devices.filter(d => d.status === 'broken').length})
                        </SelectItem>
                        <SelectItem value="inactive">
                            ⚫ Không sử dụng ({devices.filter(d => d.status === 'inactive').length})
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Bulk Actions toolbar */}
            {Object.keys(rowSelection).length > 0 && (
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border">
                    <span className="text-sm font-medium">
                        {Object.keys(rowSelection).length} selected
                    </span>
                    <div className="flex items-center gap-2 ml-auto">
                        {/* Bulk set status */}
                        <Select onValueChange={(val) => {
                            const selectedRows = table.getFilteredSelectedRowModel().rows;
                            selectedRows.forEach((row) => setDeviceStatus(row.original.id, val as DeviceStatus));
                            setRowSelection({});
                        }}>
                            <SelectTrigger className="w-[150px] h-8 text-xs">
                                <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                                <SelectValue placeholder="Set Status" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(DEVICE_STATUS_CONFIG).map(([key, config]) => (
                                    <SelectItem key={key} value={key}>
                                        <span className={`mr-1.5 h-2 w-2 rounded-full ${config.color} inline-block`} />
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
                            <Download className="mr-1 h-3.5 w-3.5" />
                            Export
                        </Button>

                        {/* Bulk delete */}
                        <Button variant="destructive" size="sm" className="h-8" onClick={() => setBulkDeleteOpen(true)}>
                            <Trash2 className="mr-1 h-3.5 w-3.5" />
                            Delete
                        </Button>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
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
                                    onClick={() => onViewDevice(row.original)}
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
                                    No devices found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                    {table.getFilteredRowModel().rows.length} device(s)
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Next
                    </Button>
                </div>
            </div>

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the device
                            and remove its data.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => {
                                if (deleteId) {
                                    onDeleteDevice(deleteId);
                                    setDeleteId(null);
                                }
                            }}
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Bulk delete confirmation */}
            <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete {Object.keys(rowSelection).length} devices?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete all selected devices and their data.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => {
                                const selectedRows = table.getFilteredSelectedRowModel().rows;
                                selectedRows.forEach((row) => onDeleteDevice(row.original.id));
                                setRowSelection({});
                                setBulkDeleteOpen(false);
                            }}
                        >
                            Delete All
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
