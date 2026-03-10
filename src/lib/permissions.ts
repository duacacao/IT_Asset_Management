// ============================================
// Permission helpers — check quyền hạn phía server + client
// ============================================

import { type Role, type Permission, ROLE_HIERARCHY, PERMISSIONS } from '@/types/permission'

/**
 * Check xem role có permission cụ thể không
 */
export function hasPermission(role: Role, permission: Permission): boolean {
    const allowedRoles = PERMISSIONS[permission]
    if (!allowedRoles) return false
    return (allowedRoles as readonly string[]).includes(role)
}

/**
 * Throw error 403 nếu không đủ quyền — dùng trong server actions
 */
export function requirePermission(role: Role, permission: Permission): void {
    if (!hasPermission(role, permission)) {
        throw new Error('Forbidden: Bạn không có quyền thực hiện thao tác này')
    }
}

/**
 * Check role hierarchy: role >= minimumRole?
 * Ví dụ: isRoleAtLeast('admin', 'member') → true
 */
export function isRoleAtLeast(role: Role, minimumRole: Role): boolean {
    return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY[minimumRole]
}

/**
 * Check xem actor có thể quản lý (đổi role, xóa) target member không
 * - Owner có thể quản lý tất cả
 * - Admin chỉ quản lý member/viewer (không quản lý owner hoặc admin khác)
 */
export function canManageMember(actorRole: Role, targetRole: Role): boolean {
    if (actorRole === 'owner') return true
    if (actorRole === 'admin') return ROLE_HIERARCHY[targetRole] < ROLE_HIERARCHY['admin']
    return false
}
