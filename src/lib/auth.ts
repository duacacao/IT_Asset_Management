import { createClient } from '@/utils/supabase/server'
import { type SupabaseClient } from '@supabase/supabase-js'
import { type User } from '@supabase/supabase-js'
import { type Role, type Permission } from '@/types/permission'
import { requirePermission as checkPermission } from '@/lib/permissions'

// ============================================
// AuthContext — thông tin authentication + organization + role
// Trả về từ requireAuth(), dùng trong tất cả server actions
// ============================================
export interface AuthContext {
    supabase: SupabaseClient
    user: User
    organization: { id: string; name: string; slug: string }
    role: Role
}

// ============================================
// requireAuth() — helper dùng chung cho tất cả server actions
// Trả về { supabase, user, organization, role } hoặc throw Error
// So với phiên bản cũ: thêm organization + role từ organization_members
// ============================================
export async function requireAuth(): Promise<AuthContext> {
    const supabase = await createClient()
    const {
        data: { user },
        error,
    } = await supabase.auth.getUser()

    if (error || !user) {
        throw new Error('Unauthorized')
    }

    // Lấy org membership — join organizations để lấy thông tin org
    const { data: membership } = await supabase
        .from('organization_members')
        .select('role, organizations(id, name, slug)')
        .eq('user_id', user.id)
        .single()

    if (!membership || !membership.organizations) {
        throw new Error('No organization: Tài khoản chưa thuộc tổ chức nào')
    }

    // Supabase trả về organizations dạng object (single) vì dùng .single() trên parent
    const org = membership.organizations as unknown as { id: string; name: string; slug: string }

    return {
        supabase,
        user,
        organization: org,
        role: membership.role as Role,
    }
}

// ============================================
// requirePermissionAuth() — requireAuth + check permission cụ thể
// Dùng cho server actions cần kiểm tra quyền ghi
// Ví dụ: const ctx = await requirePermissionAuth('devices:write')
// ============================================
export async function requirePermissionAuth(permission: Permission): Promise<AuthContext> {
    const ctx = await requireAuth()
    checkPermission(ctx.role, permission)
    return ctx
}
