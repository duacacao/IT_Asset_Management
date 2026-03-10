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
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center">
                {/* Search */}
                <div className="relative w-full md:w-72">
                    <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
                    <Input
                        placeholder="Tìm thành viên..."
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="rounded-xl border-border/50 bg-white pl-9 shadow-sm dark:bg-card"
                    />
                </div>

                {/* Role Filter */}
                <div className="flex gap-2">
                    <Select value={roleFilter} onValueChange={onRoleFilterChange}>
                        <SelectTrigger className="w-full rounded-xl border-border/50 bg-white shadow-sm dark:bg-card md:w-[140px]">
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
                </div>
            </div>

            <div className="flex items-center gap-2">
                <PermissionGate permission="members:write">
                    <Button
                        onClick={onAdd}
                        variant="default"
                        size="icon"
                        title="Thêm thành viên"
                        className="cursor-pointer rounded-xl shadow-sm"
                    >
                        <UserPlus className="h-4 w-4" />
                    </Button>
                </PermissionGate>
                {viewOptions}
            </div>
        </div >
    )
}
