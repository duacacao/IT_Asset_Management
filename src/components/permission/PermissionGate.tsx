'use client'

// ============================================
// PermissionGate — ẩn/hiện children dựa trên permission
// Viewer không thấy nút CRUD, member không thấy admin panel, etc.
// ============================================

import { type ReactNode } from 'react'
import { usePermission } from '@/hooks/usePermission'
import { type Permission } from '@/types/permission'

interface PermissionGateProps {
    permission: Permission
    fallback?: ReactNode
    children: ReactNode
}

export function PermissionGate({ permission, fallback = null, children }: PermissionGateProps) {
    const allowed = usePermission(permission)
    if (!allowed) return fallback
    return children
}
