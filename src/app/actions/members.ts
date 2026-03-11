'use server'

import { requireAuth } from '@/lib/auth'
import { requirePermission, canManageMember } from '@/lib/permissions'
import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import type { Role } from '@/types/permission'
import type { OrganizationMember } from '@/types/organization'

// ============================================
// Lấy admin Supabase client — dùng service_role_key
// Bypass RLS để thao tác auth.admin.* (createUser, deleteUser, etc.)
// ============================================
function getAdminClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY')
    return createClient(url, key)
}

// ============================================
// Lấy toàn bộ members của org — join profiles để có tên, email, avatar
// ============================================
export async function getMembers(): Promise<{
    data: OrganizationMember[]
    error: string | null
}> {
    const { supabase, organization, role } = await requireAuth()
    requirePermission(role, 'members:read')

    const { data, error } = await supabase
        .from('organization_members')
        .select(`
      id,
      organization_id,
      user_id,
      role,
      created_at,
      updated_at,
      profiles:user_id (
        full_name,
        email,
        avatar_url
      )
    `)
        .eq('organization_id', organization.id)
        .order('created_at', { ascending: true })

    if (error) {
        console.error('Lỗi lấy members:', error.message)
        return { data: [], error: error.message }
    }

    return { data: (data || []) as unknown as OrganizationMember[], error: null }
}

// ============================================
// Tạo tài khoản member mới — dùng auth.admin.createUser()
// Flow: tạo user → tạo profile → gắn vào organization
// ============================================
export async function createMemberAccount(input: {
    username: string
    password: string
    full_name: string
    role: Role
}): Promise<{ data: OrganizationMember | null; error: string | null }> {
    const { organization, role: actorRole } = await requireAuth()
    requirePermission(actorRole, 'members:write')

    // Admin không được tạo owner hoặc admin khác
    if (!canManageMember(actorRole, input.role)) {
        return { data: null, error: 'Bạn không có quyền tạo tài khoản với role này' }
    }

    const adminClient = getAdminClient()
    const email = `${input.username}@it-management.local`

    // B1: Tạo user qua auth.admin (bypass email verification)
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
        email,
        password: input.password,
        email_confirm: true,
        user_metadata: { full_name: input.full_name },
    })

    if (authError) {
        console.error('Lỗi tạo auth user:', authError.message)
        // Map lỗi duplicate email → thông báo thân thiện
        if (authError.message.includes('already been registered')) {
            return { data: null, error: 'Username đã tồn tại' }
        }
        return { data: null, error: authError.message }
    }

    const newUserId = authData.user.id

    // B2: Upsert profile (trigger có thể tự tạo, nhưng update full_name)
    await adminClient
        .from('profiles')
        .upsert({
            id: newUserId,
            full_name: input.full_name,
            email,
            current_organization_id: organization.id,
        })

    // B3: Tạo membership trong org
    const { data: member, error: memberError } = await adminClient
        .from('organization_members')
        .insert({
            organization_id: organization.id,
            user_id: newUserId,
            role: input.role,
        })
        .select(`
      id,
      organization_id,
      user_id,
      role,
      created_at,
      updated_at,
      profiles:user_id (
        full_name,
        email,
        avatar_url
      )
    `)
        .single()

    if (memberError) {
        console.error('Lỗi tạo membership:', memberError.message)
        return { data: null, error: memberError.message }
    }

    revalidatePath('/settings/permissions')
    return { data: member as unknown as OrganizationMember, error: null }
}

// ============================================
// Đổi role thành viên — check canManageMember trước
// ============================================
export async function updateMemberRole(
    memberId: string,
    newRole: Role
): Promise<{ success: boolean; error: string | null }> {
    const { supabase, organization, role: actorRole } = await requireAuth()
    requirePermission(actorRole, 'members:write')

    // Lấy member hiện tại để check role
    const { data: target } = await supabase
        .from('organization_members')
        .select('id, role, user_id')
        .eq('id', memberId)
        .eq('organization_id', organization.id)
        .single()

    if (!target) return { success: false, error: 'Không tìm thấy thành viên' }

    // Check: actor có quyền quản lý target không
    if (!canManageMember(actorRole, target.role as Role)) {
        return { success: false, error: 'Bạn không có quyền thay đổi role thành viên này' }
    }

    // Check: actor có quyền gán newRole không
    if (!canManageMember(actorRole, newRole)) {
        return { success: false, error: 'Bạn không có quyền gán role này' }
    }

    const { error } = await supabase
        .from('organization_members')
        .update({ role: newRole })
        .eq('id', memberId)

    if (error) {
        console.error('Lỗi đổi role:', error.message)
        return { success: false, error: error.message }
    }

    revalidatePath('/settings/permissions')
    return { success: true, error: null }
}

// ============================================
// Xóa thành viên khỏi org (không xóa user — chỉ xóa membership)
// ============================================
export async function removeMember(
    memberId: string
): Promise<{ success: boolean; error: string | null }> {
    const { supabase, organization, role: actorRole, user } = await requireAuth()
    requirePermission(actorRole, 'members:write')

    // Lấy target member
    const { data: target } = await supabase
        .from('organization_members')
        .select('id, role, user_id')
        .eq('id', memberId)
        .eq('organization_id', organization.id)
        .single()

    if (!target) return { success: false, error: 'Không tìm thấy thành viên' }

    // Không cho tự xóa chính mình
    if (target.user_id === user.id) {
        return { success: false, error: 'Không thể xóa chính mình khỏi tổ chức' }
    }

    // Check quản lý target
    if (!canManageMember(actorRole, target.role as Role)) {
        return { success: false, error: 'Bạn không có quyền xóa thành viên này' }
    }

    const { error } = await supabase
        .from('organization_members')
        .delete()
        .eq('id', memberId)

    if (error) {
        console.error('Lỗi xóa member:', error.message)
        return { success: false, error: error.message }
    }

    revalidatePath('/settings/permissions')
    return { success: true, error: null }
}

// ============================================
// Reset password cho member — dùng auth.admin.updateUserById()
// ============================================
export async function resetMemberPassword(
    memberId: string,
    newPassword: string
): Promise<{ success: boolean; error: string | null }> {
    const { supabase, organization, role: actorRole } = await requireAuth()
    requirePermission(actorRole, 'members:write')

    // Lấy target member
    const { data: target } = await supabase
        .from('organization_members')
        .select('id, role, user_id')
        .eq('id', memberId)
        .eq('organization_id', organization.id)
        .single()

    if (!target) return { success: false, error: 'Không tìm thấy thành viên' }

    if (!canManageMember(actorRole, target.role as Role)) {
        return { success: false, error: 'Bạn không có quyền reset password thành viên này' }
    }

    // Password validation cơ bản
    if (newPassword.length < 6) {
        return { success: false, error: 'Mật khẩu phải có ít nhất 6 ký tự' }
    }

    const adminClient = getAdminClient()
    const { error } = await adminClient.auth.admin.updateUserById(target.user_id, {
        password: newPassword,
    })

    if (error) {
        console.error('Lỗi reset password:', error.message)
        return { success: false, error: error.message }
    }

    return { success: true, error: null }
}
