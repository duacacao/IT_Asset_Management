import { createClient } from '@/utils/supabase/server'

// ============================================
// requireAuth() — helper dùng chung cho tất cả server actions
// Trả về { supabase, user } hoặc throw Error('Unauthorized')
// Thay thế boilerplate `createClient → auth.getUser → check error → return user`
// lặp lại 30+ lần trong codebase
// ============================================
export async function requireAuth() {
    const supabase = await createClient()
    const {
        data: { user },
        error,
    } = await supabase.auth.getUser()

    if (error || !user) {
        throw new Error('Unauthorized')
    }

    return { supabase, user }
}
