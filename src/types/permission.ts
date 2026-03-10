// ============================================
// Permission types — định nghĩa roles và quyền hạn
// ============================================

export const ROLES = ['owner', 'admin', 'member', 'viewer'] as const
export type Role = (typeof ROLES)[number]

export const ROLE_LABELS: Record<Role, string> = {
    owner: 'Owner',
    admin: 'Admin',
    member: 'Member',
    viewer: 'Viewer',
}

// Thứ tự ưu tiên: owner > admin > member > viewer
export const ROLE_HIERARCHY: Record<Role, number> = {
    owner: 4,
    admin: 3,
    member: 2,
    viewer: 1,
}

// Mỗi permission key → danh sách roles được phép
export const PERMISSIONS = {
    // Data read — tất cả roles đều xem được
    'devices:read': ['owner', 'admin', 'member', 'viewer'],
    'end-users:read': ['owner', 'admin', 'member', 'viewer'],
    'departments:read': ['owner', 'admin', 'member', 'viewer'],
    'activity-logs:read': ['owner', 'admin', 'member', 'viewer'],
    'stats:read': ['owner', 'admin', 'member', 'viewer'],

    // Data write — viewer không được ghi
    'devices:write': ['owner', 'admin', 'member'],
    'end-users:write': ['owner', 'admin', 'member'],
    'departments:write': ['owner', 'admin', 'member'],
    'assignments:write': ['owner', 'admin', 'member'],
    'import-export': ['owner', 'admin', 'member'],
    'device-sheets:write': ['owner', 'admin', 'member'],

    // Admin — chỉ owner + admin
    'members:read': ['owner', 'admin'],
    'members:write': ['owner', 'admin'],
    'organization:write': ['owner', 'admin'],

    // Owner-only
    'organization:delete': ['owner'],
    'organization:transfer': ['owner'],
} as const

export type Permission = keyof typeof PERMISSIONS
