'use server'

import { requireAuth } from '@/lib/auth'

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

export async function getActivityLogs(params: GetActivityLogsParams = {}) {
  const { page = 1, pageSize = 30, action } = params

  try {
    const { supabase } = await requireAuth()

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
