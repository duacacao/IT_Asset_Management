'use client'

// ============================================
// Permission hooks — check quyền hạn phía client
// Dùng kèm AuthContext để ẩn/hiện UI elements
// ============================================

import { useAuth } from '@/contexts/AuthContext'
import { hasPermission } from '@/lib/permissions'
import { type Role, type Permission } from '@/types/permission'

/**
 * Check xem user hiện tại có permission cụ thể không
 * Trả về boolean — dùng để conditional render UI
 */
export function usePermission(permission: Permission): boolean {
    const { role } = useAuth()
    if (!role) return false
    return hasPermission(role, permission)
}

/**
 * Lấy role hiện tại của user
 */
export function useRole(): Role | null {
    const { role } = useAuth()
    return role
}

/**
 * Check xem user có phải admin+ không (owner hoặc admin)
 */
export function useIsAdmin(): boolean {
    const { role } = useAuth()
    return role === 'owner' || role === 'admin'
}

/**
 * Check xem user có phải owner không
 */
export function useIsOwner(): boolean {
    const { role } = useAuth()
    return role === 'owner'
}
