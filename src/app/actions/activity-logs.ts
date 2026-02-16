"use server"

import { createClient } from "@/utils/supabase/server"
import type { ActivityLogAction } from "@/constants/activity-log"

// ============================================
// Lấy activity logs của user (hoặc theo device)
// RLS tự động filter theo user_id = auth.uid()
// ============================================
export async function getActivityLogs(options?: {
    deviceId?: string
    limit?: number
}) {
    const supabase = await createClient()
    const { deviceId, limit = 50 } = options || {}

    let query = supabase
        .from("activity_logs")
        .select(`
      *,
      devices ( name, type )
    `)
        .order("created_at", { ascending: false })
        .limit(limit)

    if (deviceId) {
        query = query.eq("device_id", deviceId)
    }

    const { data, error } = await query

    if (error) {
        console.error("Lỗi lấy activity logs:", error.message)
        return { data: null, error: error.message }
    }

    return { data, error: null }
}

// ============================================
// Ghi log hoạt động
// ============================================
export async function createActivityLog(logData: {
    device_id?: string
    action: ActivityLogAction
    details?: string
}) {
    const supabase = await createClient()

    // Lấy user hiện tại
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        return { data: null, error: "Chưa đăng nhập" }
    }

    const { data, error } = await supabase
        .from("activity_logs")
        .insert({
            ...logData,
            user_id: user.id,
        })
        .select()
        .single()

    if (error) {
        console.error("Lỗi ghi log:", error.message)
        return { data: null, error: error.message }
    }

    return { data, error: null }
}
