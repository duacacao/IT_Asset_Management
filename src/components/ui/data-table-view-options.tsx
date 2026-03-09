'use client'

import { Table } from '@tanstack/react-table'
import { Settings2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface DataTableViewOptionsProps<TData> {
    table: Table<TData>
}

const columnTranslations: Record<string, string> = {
    'deviceInfo_name': 'Tên thiết bị',
    'type': 'Loại',
    'status': 'Trạng thái',
    'assignment_assignee_name': 'Người sử dụng',
    'name': 'Tên phòng ban',
    'positions': 'Chức vụ',
    'member_count': 'Số lượng',
    'created_at': 'Ngày tạo',
    'full_name': 'Họ và tên',
    'department': 'Phòng ban',
    'position': 'Chức vụ',
    'devices': 'Thiết bị đang mượn'
}

export function DataTableViewOptions<TData>({
    table,
}: DataTableViewOptionsProps<TData>) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="icon"
                    className="cursor-pointer rounded-xl border-border/50 bg-white shadow-sm dark:bg-card h-9 w-9"
                    title="Hiển thị cột"
                >
                    <Settings2 className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px] rounded-xl border-border/50 shadow-md">
                <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
                    Hiển thị cột
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {table
                    .getAllColumns()
                    .filter(
                        (column) =>
                            typeof column.accessorFn !== 'undefined' && column.getCanHide()
                    )
                    .map((column) => {
                        const label = columnTranslations[column.id] || column.id.replace(/_/g, ' ')
                        return (
                            <DropdownMenuCheckboxItem
                                key={column.id}
                                className="cursor-pointer rounded-lg capitalize"
                                checked={column.getIsVisible()}
                                onCheckedChange={(value) => column.toggleVisibility(!!value)}
                            >
                                {label}
                            </DropdownMenuCheckboxItem>
                        )
                    })}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
