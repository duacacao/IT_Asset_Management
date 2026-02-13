import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, Eye, Pencil, Download, Trash2, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu, DropdownMenuContent,
    DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SoftLabel } from '@/components/ui/soft-label';
import { Device, DeviceStatus, DEVICE_STATUS_CONFIG } from '@/types/device';
import { timeAgo } from '@/lib/time';

// Dot colors cho status dropdown items
export const STATUS_DOT_COLORS: Record<DeviceStatus, string> = {
    active: 'bg-emerald-500',
    broken: 'bg-red-500',
    inactive: 'bg-amber-500',
};

// Label hiển thị trạng thái thiết bị — dùng SoftLabel cho giao diện đẹp hơn
export function StatusLabel({ status }: { status: DeviceStatus }) {
    const config = DEVICE_STATUS_CONFIG[status];
    return (
        <SoftLabel color={config.softColor} size="sm">
            {config.label}
        </SoftLabel>
    );
}

// Định nghĩa columns cho bảng thiết bị — tách riêng để DeviceList gọn hơn
export function createDeviceColumns({
    onViewDevice,
    onUpdateDevice,
    onExportDevice,
    setDeleteId,
}: {
    onViewDevice: (device: Device) => void;
    onUpdateDevice: (device: Device) => void;
    onExportDevice: (device: Device) => void;
    setDeleteId: (id: string) => void;
}): ColumnDef<Device>[] {
    return [
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
    ];
}
