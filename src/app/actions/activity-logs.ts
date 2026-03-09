'use server'

import { requireAuth } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

// Số ngày lưu trữ log — thay đổi giá trị này nếu muốn điều chỉnh retention
const LOG_RETENTION_DAYS = 30

export interface ActivityLogWithRelations {
  id: number
  action: string
  details: string | null
  device_id: string | null
  user_id: string | null
  created_at: string
  // Joined data
  profile_name: string | null
  profile_email: string | null
  device_name: string | null
}

interface GetActivityLogsParams {
  page?: number
  pageSize?: number
  action?: string
}

/**
 * Lấy danh sách activity logs trong vòng 30 ngày gần nhất.
 * Log cũ hơn 30 ngày sẽ không được hiển thị.
 */
export async function getActivityLogs(params: GetActivityLogsParams = {}) {
  const { page = 1, pageSize = 30, action } = params

  try {
    const { supabase } = await requireAuth()

    // Tính mốc thời gian 30 ngày trước để filter
    const retentionDate = new Date()
    retentionDate.setDate(retentionDate.getDate() - LOG_RETENTION_DAYS)
    const retentionDateISO = retentionDate.toISOString()

    let query = supabase
      .from('activity_logs')
      .select(
        `
        id,
        action,
        details,
        device_id,
        user_id,
        created_at,
        profiles:user_id (full_name, email),
        devices:device_id (name)
      `,
        { count: 'exact' }
      )
      .gte('created_at', retentionDateISO)
      .order('created_at', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1)

    if (action && action !== 'all') {
      query = query.eq('action', action)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching activity logs:', error)
      return { data: [], count: 0, error: error.message }
    }

    // Flatten the joined data
    const logs: ActivityLogWithRelations[] = (data || []).map((log: any) => ({
      id: log.id,
      action: log.action,
      details: log.details,
      device_id: log.device_id,
      user_id: log.user_id,
      created_at: log.created_at,
      profile_name: log.profiles?.full_name || null,
      profile_email: log.profiles?.email || null,
      device_name: log.devices?.name || null,
    }))

    return { data: logs, count: count || 0, error: null }
  } catch (error) {
    console.error('Error in getActivityLogs:', error)
    return { data: [], count: 0, error: 'Unauthorized' }
  }
}

/**
 * Xóa tất cả activity logs cũ hơn 30 ngày.
 * Sử dụng service role key để bypass RLS — chỉ gọi từ cron endpoint được bảo vệ bởi CRON_SECRET.
 */
export async function deleteOldActivityLogs(): Promise<{
  success: boolean
  deletedCount: number
  error: string | null
}> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    // Kiểm tra env variables — service role key cần để bypass RLS khi xóa
    if (!supabaseUrl || !serviceRoleKey) {
      return {
        success: false,
        deletedCount: 0,
        error: 'Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL',
      }
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

    // Tính mốc thời gian 30 ngày trước
    const retentionDate = new Date()
    retentionDate.setDate(retentionDate.getDate() - LOG_RETENTION_DAYS)
    const retentionDateISO = retentionDate.toISOString()

    // Đếm số records sẽ bị xóa trước khi xóa (để báo cáo)
    const { count } = await supabaseAdmin
      .from('activity_logs')
      .select('id', { count: 'exact', head: true })
      .lt('created_at', retentionDateISO)

    // Xóa records cũ hơn 30 ngày
    const { error } = await supabaseAdmin
      .from('activity_logs')
      .delete()
      .lt('created_at', retentionDateISO)

    if (error) {
      console.error('Error deleting old activity logs:', error)
      return { success: false, deletedCount: 0, error: error.message }
    }

    const deletedCount = count || 0
    console.log(`[Cleanup] Đã xóa ${deletedCount} activity logs cũ hơn ${LOG_RETENTION_DAYS} ngày`)

    return { success: true, deletedCount, error: null }
  } catch (error) {
    console.error('Error in deleteOldActivityLogs:', error)
    return {
      success: false,
      deletedCount: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
