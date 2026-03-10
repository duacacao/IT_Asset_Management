'use client'

// ============================================
// RoleBadge — hiển thị role dưới dạng badge màu
// Owner = amber, Admin = blue, Member = teal, Viewer = gray
// ============================================

import { type Role, ROLE_LABELS } from '@/types/permission'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface RoleBadgeProps {
    role: Role
    className?: string
}

const ROLE_STYLES: Record<Role, string> = {
    owner: 'bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20',
    admin: 'bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/20',
    member: 'bg-teal-500/10 text-teal-600 border-teal-500/20 hover:bg-teal-500/20',
    viewer: 'bg-gray-500/10 text-gray-600 border-gray-500/20 hover:bg-gray-500/20',
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
    return (
        <Badge variant="outline" className={cn(ROLE_STYLES[role], className)}>
            {ROLE_LABELS[role]}
        </Badge>
    )
}
