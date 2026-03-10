import { ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header'
import { RoleBadge } from '@/components/permission/RoleBadge'
import { MoreHorizontal, ShieldCheck, KeyRound, UserMinus } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { OrganizationMember } from '@/types/organization'

// ============================================
// Tên hiển thị từ member — lấy từ profiles joined data
// ============================================
function getMemberDisplayName(member: OrganizationMember): string {
    return member.profiles?.full_name || member.profiles?.email?.split('@')[0] || 'Unknown'
}

function getMemberInitials(member: OrganizationMember): string {
    const name = getMemberDisplayName(member)
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
}

// Relative time — hiện "3 ngày trước", "1 tháng trước", etc.
function getRelativeTime(dateStr: string | null): string {
    if (!dateStr) return '-'
    const now = new Date()
    const date = new Date(dateStr)
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Hôm nay'
    if (diffDays === 1) return 'Hôm qua'
    if (diffDays < 30) return `${diffDays} ngày trước`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} tháng trước`
    return `${Math.floor(diffDays / 365)} năm trước`
}

interface CreateMemberColumnsProps {
    onEditRole: (member: OrganizationMember) => void
    onRemove: (member: OrganizationMember) => void
    onResetPassword: (member: OrganizationMember) => void
    currentUserId: string | undefined
}

export function createMemberColumns({
    onEditRole,
    onRemove,
    onResetPassword,
    currentUserId,
}: CreateMemberColumnsProps): ColumnDef<OrganizationMember>[] {
    return [
        {
            id: 'select',
            header: ({ table }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: 'full_name',
            accessorFn: (row) => getMemberDisplayName(row),
            header: ({ column }) => <DataTableColumnHeader column={column} title="Thành viên" />,
            cell: ({ row }) => {
                const member = row.original
                const isCurrentUser = member.user_id === currentUserId
                return (
                    <div className="flex items-center gap-3 py-1 pr-4">
                        <Avatar className="h-9 w-9">
                            <AvatarFallback className="text-xs font-medium">
                                {getMemberInitials(member)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <span className="text-foreground text-sm font-medium">
                                    {getMemberDisplayName(member)}
                                </span>
                                {isCurrentUser && (
                                    <span className="text-muted-foreground text-xs">(bạn)</span>
                                )}
                            </div>
                            {member.profiles?.email && (
                                <span className="text-muted-foreground text-xs">{member.profiles.email}</span>
                            )}
                        </div>
                    </div>
                )
            },
        },
        {
            accessorKey: 'role',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Vai trò" />,
            cell: ({ row }) => <RoleBadge role={row.original.role} />,
            filterFn: (row, _id, filterValue) => {
                if (filterValue === 'ALL') return true
                return row.original.role === filterValue
            },
        },
        {
            accessorKey: 'created_at',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Ngày tham gia" />,
            cell: ({ row }) => (
                <span className="text-muted-foreground text-sm">
                    {getRelativeTime(row.original.created_at)}
                </span>
            ),
        },
        {
            id: 'actions',
            header: 'Thao tác',
            cell: ({ row }) => {
                const member = row.original
                const isCurrentUser = member.user_id === currentUserId

                // Không cho thao tác trên chính mình
                if (isCurrentUser) return null

                return (
                    <div className="flex items-center justify-end pr-1">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 cursor-pointer rounded-xl p-0">
                                    <MoreHorizontal className="text-muted-foreground h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-xl border-border/50 shadow-md">
                                <DropdownMenuItem onClick={() => onEditRole(member)} className="cursor-pointer">
                                    <ShieldCheck className="mr-2 h-4 w-4" />
                                    Đổi vai trò
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onResetPassword(member)} className="cursor-pointer">
                                    <KeyRound className="mr-2 h-4 w-4" />
                                    Đặt lại mật khẩu
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => onRemove(member)}
                                    className="text-destructive focus:text-destructive cursor-pointer"
                                >
                                    <UserMinus className="mr-2 h-4 w-4" />
                                    Xóa khỏi tổ chức
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )
            },
        },
    ]
}
