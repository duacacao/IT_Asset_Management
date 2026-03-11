'use client'

// ============================================
// usePermissions — convenience hook trả về boolean flags
// Thay vì gọi usePermission('devices:write') nhiều lần,
// component chỉ cần destructure: const { canEdit, canDelete } = usePermissions()
// ============================================

import { useAuth } from '@/contexts/AuthContext'
import { hasPermission } from '@/lib/permissions'

/**
 * Hook trả về tập hợp boolean flags cho các quyền phổ biến.
 * Dùng trong component để ẩn/hiện UI nhanh gọn.
 *
 * @example
 * const { canCreate, canEdit, canDelete, canImportExport, canManageMembers } = usePermissions()
 * {canCreate && <Button>Thêm mới</Button>}
 */
export function usePermissions() {
  const { role } = useAuth()

  // Nếu chưa có role (đang loading hoặc chưa auth) → tất cả false
  if (!role) {
    return {
      canCreate: false,
      canEdit: false,
      canDelete: false,
      canImportExport: false,
      canManageMembers: false,
      canManageOrganization: false,
      canDeleteOrganization: false,
      canAssign: false,
      isAdmin: false,
      isOwner: false,
    }
  }

  return {
    // Data write — viewer không được ghi
    canCreate: hasPermission(role, 'devices:write'),
    canEdit: hasPermission(role, 'devices:write'),
    canDelete: hasPermission(role, 'devices:write'),
    canImportExport: hasPermission(role, 'import-export'),
    canAssign: hasPermission(role, 'assignments:write'),

    // Admin — chỉ owner + admin
    canManageMembers: hasPermission(role, 'members:write'),
    canManageOrganization: hasPermission(role, 'organization:write'),

    // Owner-only
    canDeleteOrganization: hasPermission(role, 'organization:delete'),

    // Role shortcuts
    isAdmin: role === 'owner' || role === 'admin',
    isOwner: role === 'owner',
  }
}
