'use server'

import { requireAuth } from '@/lib/auth'

// ============================================
// Lấy toàn bộ số lượng Devices và End-users trong một query (dùng Promise.all)
// ============================================
export async function getAppStats() {
    const { supabase, user } = await requireAuth()

    // Parallel count queries để giảm network overhead. 
    // 'id' thay vì '*' để tối ưu hóa payload
    const [deviceResult, endUserResult] = await Promise.all([
        supabase
            .from('devices')
            .select('id', { count: 'exact', head: true })
            .eq('owner_id', user.id)
            .is('deleted_at', null),
        supabase
            .from('end_users')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id)
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
