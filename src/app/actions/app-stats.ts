'use server'

import { requireAuth } from '@/lib/auth'

// ============================================
// Lấy toàn bộ số lượng Devices và End-users của organization (dùng Promise.all)
// ============================================
export async function getAppStats() {
    const { supabase, organization } = await requireAuth()

    // Parallel count queries để giảm network overhead.
    // 'id' thay vì '*' để tối ưu hóa payload
    const [deviceResult, endUserResult] = await Promise.all([
        supabase
            .from('devices')
            .select('id', { count: 'exact', head: true })
            .eq('organization_id', organization.id)
            .is('deleted_at', null),
        supabase
            .from('end_users')
            .select('id', { count: 'exact', head: true })
            .eq('organization_id', organization.id)
            .is('deleted_at', null),
    ])

    if (deviceResult.error) {
        console.error('Lỗi đếm device:', deviceResult.error.message)
    }

    if (endUserResult.error) {
        console.error('Lỗi đếm end_users:', endUserResult.error.message)
    }

    return {
        devicesCount: deviceResult.count || 0,
        endUsersCount: endUserResult.count || 0,
    }
}
