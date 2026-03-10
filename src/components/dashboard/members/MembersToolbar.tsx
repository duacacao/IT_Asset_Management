'use client'

import { ReactNode } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, UserPlus } from 'lucide-react'
import { ROLES, ROLE_LABELS } from '@/types/permission'
import { PermissionGate } from '@/components/permission/PermissionGate'

interface MembersToolbarProps {
    search: string
    onSearchChange: (value: string) => void
    roleFilter: string
    onRoleFilterChange: (value: string) => void
    onAdd: () => void
    totalCount: number
    filteredCount: number
    viewOptions?: ReactNode
}

export function MembersToolbar({
    search,
    onSearchChange,
    roleFilter,
    onRoleFilterChange,
    onAdd,
    totalCount,
    filteredCount,
    viewOptions,
}: MembersToolbarProps) {
    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 items-center gap-2">
                {/* Search */}
                <div className="relative max-w-xs flex-1">
                    <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                    <Input
                        placeholder="Tìm thành viên..."
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="h-9 rounded-xl border-border/50 pl-9 shadow-sm"
                    />
                </div>

                {/* Role Filter */}
                <Select value={roleFilter} onValueChange={onRoleFilterChange}>
                    <SelectTrigger className="h-9 w-[140px] cursor-pointer rounded-xl border-border/50 shadow-sm">
                        <SelectValue placeholder="Vai trò" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border/50 shadow-md">
                        <SelectItem value="ALL" className="cursor-pointer">
                            Tất cả ({totalCount})
                        </SelectItem>
                        {ROLES.map((role) => (
                            <SelectItem key={role} value={role} className="cursor-pointer">
                                {ROLE_LABELS[role]}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {viewOptions}
            </div>

            <div className="flex items-center gap-2">
                {/* Nút thêm thành viên — chỉ admin+ thấy */}
                <PermissionGate permission="members:write">
                    <Button
                        onClick={onAdd}
                        className="h-9 cursor-pointer rounded-xl bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
                    >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Thêm thành viên
                    </Button>
                </PermissionGate>
            </div>
        </div>
    )
}
