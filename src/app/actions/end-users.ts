'use server'

import { requireAuth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import type { EndUser, EndUserInsert, EndUserUpdate, EndUserWithDevice } from '@/types/end-user'
import { assignDevice, returnDevice, bulkAssignDevices, bulkReturnDevices } from './device-assignments'

// ============================================
// Lấy danh sách end-users + thông tin phòng ban, chức vụ, thiết bị đang assign
// Refactor: Trả về raw data để Frontend Query Hook tự xử lý qua adapter
// ============================================
export async function getEndUsers() {
  const { supabase, user } = await requireAuth()

  // Parallel queries with Promise.all for performance
  const [endUsersResult, assignmentsResult] = await Promise.all([
    supabase
      .from('end_users')
      .select(
        `
        *,
        departments:department_id (
            name
        ),
        positions:position_id (
            name
        )
        `
      )
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false }),
    supabase
      .from('device_assignments')
      .select(
        `
        id,
        end_user_id,
        device_id,
        devices:device_id (
            id,
            name,
            type
        )
        `
      )
      .eq('user_id', user.id)
      .is('returned_at', null),
  ])

  if (endUsersResult.error) {
    console.error('Lỗi lấy end_users:', endUsersResult.error.message)
    return { data: { endUsers: [], assignments: [] }, error: endUsersResult.error.message }
  }

  if (assignmentsResult.error) {
    console.error('Lỗi lấy device_assignments:', assignmentsResult.error.message)
    return {
      data: { endUsers: endUsersResult.data || [], assignments: [] },
      error: assignmentsResult.error.message,
    }
  }

  return {
    data: {
      endUsers: endUsersResult.data || [],
      assignments: assignmentsResult.data || [],
    },
    error: null,
  }
}

// ============================================
// Lấy chi tiết 1 end-user
// ============================================
export async function getEndUser(id: string): Promise<{
  data: EndUser | null
  error: string | null
}> {
  const { supabase, user } = await requireAuth()

  const { data, error } = await supabase
    .from('end_users')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .single()

  if (error) {
    console.error('Lỗi lấy end_user:', error.message)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

// ============================================
// Tạo end-user mới
// department_id và position_id bắt buộc (NOT NULL trong DB)
// ============================================
export async function createEndUser(endUser: EndUserInsert): Promise<{
  data: EndUser | null
  error: string | null
}> {
  const { supabase, user } = await requireAuth()

  // Validate bắt buộc
  if (!endUser.department_id) {
    return { data: null, error: 'Phòng ban là bắt buộc' }
  }
  if (!endUser.position_id) {
    return { data: null, error: 'Chức vụ là bắt buộc' }
  }

  const { data, error } = await supabase
    .from('end_users')
    .insert({
      full_name: endUser.full_name,
      email: endUser.email,
      phone: endUser.phone,
      department_id: endUser.department_id,
      position_id: endUser.position_id,
      notes: endUser.notes,
      user_id: user.id,
    })
    .select()
    .single()

  if (error) {
    console.error('Lỗi tạo end_user:', error.message)
    return { data: null, error: error.message }
  }

  // Nếu có device_ids, bulk gán thiết bị cho user vừa tạo (1 round-trip)
  if (data && endUser.device_ids && endUser.device_ids.length > 0) {
    const { error: assignError } = await bulkAssignDevices(endUser.device_ids, data.id)
    if (assignError) {
      console.error('Lỗi bulk gán thiết bị:', assignError)
    }
  }

  revalidatePath('/end-user')
  return { data, error: null }
}

// ============================================
// Cập nhật end-user
// Xử lý device assignment nếu device_id thay đổi
// ============================================
export async function updateEndUser(
  id: string,
  updates: EndUserUpdate
): Promise<{
  data: EndUser | null
  error: string | null
}> {
  const { supabase, user } = await requireAuth()

  const { data, error } = await supabase
    .from('end_users')
    .update({
      full_name: updates.full_name,
      email: updates.email,
      phone: updates.phone,
      department_id: updates.department_id,
      position_id: updates.position_id,
      notes: updates.notes,
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    console.error('Lỗi cập nhật end_user:', error.message)
    return { data: null, error: error.message }
  }

  // Xử lý device assignment theo diff (1:N)
  // So sánh device_ids mới vs existing_devices → biết thêm/bớt
  if (data && updates.device_ids !== undefined) {
    const newIds = updates.device_ids || []
    const existingDevices = updates.existing_devices || []
    const existingIds = existingDevices.map((d) => d.id)

    // Devices cần thu hồi (có trong existing nhưng không có trong new)
    const toReturn = existingDevices.filter((d) => !newIds.includes(d.id))
    const assignmentIdsToReturn = toReturn.map((device) => device.assignment_id)
    if (assignmentIdsToReturn.length > 0) {
      const { error: returnError } = await bulkReturnDevices(assignmentIdsToReturn)
      if (returnError) console.error('Lỗi bulk thu hồi thiết bị:', returnError)
    }

    // Devices cần gán mới (có trong new nhưng không có trong existing)
    const toAssign = newIds.filter((id) => !existingIds.includes(id))
    if (toAssign.length > 0) {
      const { error: assignError } = await bulkAssignDevices(toAssign, id)
      if (assignError) console.error('Lỗi bulk gán thiết bị mới:', assignError)
    }
  }

  revalidatePath('/end-user')
  return { data, error: null }
}

// ============================================
// Xóa end-user
// device_assignments sẽ tự CASCADE delete theo FK
// ============================================
export async function deleteEndUser(id: string): Promise<{
  success: boolean
  error: string | null
}> {
  const { supabase, user } = await requireAuth()

  // B1: Trả TẤT CẢ thiết bị đang được gán (1:N)
  const { data: activeAssignments } = await supabase
    .from('device_assignments')
    .select('id')
    .eq('end_user_id', id)
    .eq('user_id', user.id)
    .is('returned_at', null)

  if (activeAssignments && activeAssignments.length > 0) {
    const assignmentIds = activeAssignments.map((a) => a.id)
    const { success, error } = await bulkReturnDevices(assignmentIds)
    if (!success) {
      console.error('Lỗi tự động bulk trả thiết bị khi xóa user:', error)
    }
  }

  // B2: Soft delete end-user
  const { error } = await supabase
    .from('end_users')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Lỗi xóa end_user:', error.message)
    return { success: false, error: error.message }
  }

  revalidatePath('/end-user')
  return { success: true, error: null }
}

// ============================================
// Lấy danh sách devices chưa được assign (dùng cho dropdown gán thiết bị)
// Query device_assignments thay vì end_users.device_id
// ============================================
export async function getAvailableDevices(): Promise<{
  data: { id: string; name: string; type: string }[] | null
  error: string | null
}> {
  const { supabase, user } = await requireAuth()

  // Single query: fetch all devices with their active assignment status
  // LEFT JOIN với device_assignments để lọc trực tiếp trên DB — tránh 2 round-trips
  const { data, error } = await supabase
    .from('devices')
    .select(
      `
      id, name, type,
      device_assignments!left (
        id,
        returned_at
      )
      `
    )
    .eq('owner_id', user.id)
    .in('status', ['active', 'inactive'])
    .is('deleted_at', null)
    .order('name')

  if (error) {
    console.error('Lỗi lấy devices:', error.message)
    return { data: [], error: null }
  }

  // Lọc bỏ devices có active assignment (returned_at IS NULL)
  const availableDevices = (data || [])
    .filter((d: any) => {
      const assignments = d.device_assignments || []
      const hasActiveAssignment = assignments.some((a: any) => a.returned_at === null)
      return !hasActiveAssignment
    })
    .map((d: any) => ({ id: d.id, name: d.name, type: d.type }))

  return { data: availableDevices, error: null }
}

// ============================================
// Lấy thống kê end-users cho sidebar
// ============================================
export async function getEndUserStats() {
  const { supabase, user } = await requireAuth()

  const { count, error } = await supabase
    .from('end_users')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .is('deleted_at', null)

  if (error) {
    console.error('Lỗi lấy thống kê end-users:', error.message)
    return { total: 0 }
  }

  return { total: count || 0 }
}
