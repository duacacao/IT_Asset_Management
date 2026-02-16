'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { ACTIVITY_LOG_ACTIONS } from '@/constants/activity-log'

// ============================================
// Gán thiết bị cho end-user (tạo assignment mới)
// Kiểm tra xem cả device và end-user đều chưa có assignment active
// ============================================
export async function assignDevice(
  deviceId: string,
  endUserId: string
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Người dùng chưa đăng nhập' }
  }

  // Kiểm tra device chưa được assign cho ai
  const { data: existingDeviceAssignment } = await supabase
    .from('device_assignments')
    .select('id')
    .eq('device_id', deviceId)
    .is('returned_at', null)
    .maybeSingle()

  if (existingDeviceAssignment) {
    return { success: false, error: 'Thiết bị này đã được gán cho người khác' }
  }

  // Kiểm tra end-user chưa có thiết bị nào
  const { data: existingUserAssignment } = await supabase
    .from('device_assignments')
    .select('id')
    .eq('end_user_id', endUserId)
    .is('returned_at', null)
    .maybeSingle()

  if (existingUserAssignment) {
    return { success: false, error: 'End-user này đã có thiết bị được gán' }
  }

  // Tạo assignment mới
  const { error } = await supabase.from('device_assignments').insert({
    device_id: deviceId,
    end_user_id: endUserId,
    user_id: user.id,
  })

  if (error) {
    console.error('Lỗi gán thiết bị:', error.message)
    return { success: false, error: error.message }
  }

  // Log activity
  await supabase.from('activity_logs').insert({
    device_id: deviceId,
    user_id: user.id,
    action: ACTIVITY_LOG_ACTIONS.ASSIGN,
    details: `Gán thiết bị cho end-user ${endUserId}`,
  })

  revalidatePath('/end-user')
  revalidatePath('/devices')
  return { success: true, error: null }
}

// ============================================
// Trả thiết bị (đánh dấu returned_at = now)
// ============================================
export async function returnDevice(
  assignmentId: string
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Người dùng chưa đăng nhập' }
  }

  const { data: assignment, error } = await supabase
    .from('device_assignments')
    .update({ returned_at: new Date().toISOString() })
    .eq('id', assignmentId)
    .eq('user_id', user.id)
    .is('returned_at', null)
    .select()
    .single()

  if (error) {
    console.error('Lỗi trả thiết bị:', error.message)
    return { success: false, error: error.message }
  }

  if (assignment) {
    await supabase.from('activity_logs').insert({
      device_id: assignment.device_id,
      user_id: user.id,
      action: ACTIVITY_LOG_ACTIONS.RETURN,
      details: `Trả thiết bị (Assignment ID: ${assignmentId})`,
    })
  }

  revalidatePath('/end-user')
  revalidatePath('/devices')
  return { success: true, error: null }
}

// ============================================
// Lấy lịch sử gán thiết bị của 1 end-user
// ============================================
export async function getDeviceHistory(endUserId: string): Promise<{
  data:
    | {
        id: string
        device_id: string
        device_name: string
        device_type: string
        assigned_at: string
        returned_at: string | null
      }[]
    | null
  error: string | null
}> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { data: [], error: null }
  }

  const { data, error } = await supabase
    .from('device_assignments')
    .select(
      `
            id,
            device_id,
            assigned_at,
            returned_at,
            devices:device_id (
                name,
                type
            )
        `
    )
    .eq('end_user_id', endUserId)
    .eq('user_id', user.id)
    .order('assigned_at', { ascending: false })

  if (error) {
    console.error('Lỗi lấy lịch sử gán:', error.message)
    return { data: [], error: null }
  }

  // Format lại data để dễ dùng ở frontend
  const formatted = (data || []).map((item: any) => ({
    id: item.id,
    device_id: item.device_id,
    device_name: item.devices?.name || 'N/A',
    device_type: item.devices?.type || 'N/A',
    assigned_at: item.assigned_at,
    returned_at: item.returned_at,
  }))

  return { data: formatted, error: null }
}

// ============================================
// Lấy assignment hiện tại (active) của 1 end-user
// ============================================
export async function getCurrentAssignment(endUserId: string): Promise<{
  data: {
    id: string
    device_id: string
    device_name: string
    device_type: string
    assigned_at: string
  } | null
  error: string | null
}> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: null }
  }

  const { data, error } = await supabase
    .from('device_assignments')
    .select(
      `
            id,
            device_id,
            assigned_at,
            devices:device_id (
                name,
                type
            )
        `
    )
    .eq('end_user_id', endUserId)
    .eq('user_id', user.id)
    .is('returned_at', null)
    .maybeSingle()

  if (error) {
    console.error('Lỗi lấy assignment hiện tại:', error.message)
    return { data: null, error: null }
  }

  if (!data) {
    return { data: null, error: null }
  }

  const formatted = {
    id: data.id,
    device_id: data.device_id,
    device_name: (data as any).devices?.name || 'N/A',
    device_type: (data as any).devices?.type || 'N/A',
    assigned_at: data.assigned_at,
  }

  return { data: formatted, error: null }
}
