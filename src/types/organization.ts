// ============================================
// Organization types — dùng cho UI components
// ============================================

import type { Role } from './permission'

export interface Organization {
    id: string
    name: string
    slug: string
    logo_url: string | null
    settings: Record<string, unknown>
    created_by: string | null
    created_at: string | null
    updated_at: string | null
}

export interface OrganizationMember {
    id: string
    organization_id: string
    user_id: string
    role: Role
    created_at: string | null
    updated_at: string | null
    // Joined fields — khi query kèm profiles
    profiles?: {
        full_name: string | null
        email: string
        avatar_url: string | null
    }
}
