'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import type { EndUser, EndUserInsert, EndUserUpdate, EndUserWithDevice } from '@/types/end-user'
import { assignDevice, returnDevice } from './device-assignments'

// ============================================
// Lấy danh sách end-users + thông tin phòng ban, chức vụ, thiết bị đang assign
// Refactor: Trả về raw data để Frontend Query Hook tự xử lý qua adapter
// ============================================
export async function getEndUsers() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { data: { endUsers: [], assignments: [] }, error: null }
  }

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
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: 'Người dùng chưa đăng nhập' }
  }

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
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: 'Người dùng chưa đăng nhập' }
  }

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

  // Nếu có device_ids, gán tất cả thiết bị cho user vừa tạo (1:N)
  if (data && endUser.device_ids && endUser.device_ids.length > 0) {
    for (const deviceId of endUser.device_ids) {
      const assignResult = await assignDevice(deviceId, data.id)
      if (assignResult.error) {
        console.error(`Lỗi gán thiết bị ${deviceId}:`, assignResult.error)
        // Không throw error, vẫn tiếp tục gán các device khác
      }
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
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: 'Ngườ dùng chưa đăng nhập' }
  }

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
    for (const device of toReturn) {
      const returnResult = await returnDevice(device.assignment_id)
      if (returnResult.error) {
        console.error(`Lỗi thu hồi thiết bị ${device.name}:`, returnResult.error)
      }
    }

    // Devices cần gán mới (có trong new nhưng không có trong existing)
    const toAssign = newIds.filter((id) => !existingIds.includes(id))
    for (const deviceId of toAssign) {
      const assignResult = await assignDevice(deviceId, id)
      if (assignResult.error) {
        console.error(`Lỗi gán thiết bị ${deviceId}:`, assignResult.error)
      }
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
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Người dùng chưa đăng nhập' }
  }

  // B1: Trả TẤT CẢ thiết bị đang được gán (1:N)
  const { data: activeAssignments } = await supabase
    .from('device_assignments')
    .select('id')
    .eq('end_user_id', id)
    .eq('user_id', user.id)
    .is('returned_at', null)

  if (activeAssignments && activeAssignments.length > 0) {
    for (const assignment of activeAssignments) {
      const returnResult = await returnDevice(assignment.id)
      // Nếu lỗi trả thiết bị, ta vẫn tiếp tục xóa user nhưng log lại
      if (!returnResult.success) {
        console.error(`Lỗi tự động trả thiết bị ${assignment.id} khi xóa user:`, returnResult.error)
      }
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
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { data: [], error: null }
  }

  // Lấy device_ids đang được assign (returned_at IS NULL)
  const { data: activeAssignments } = await supabase
    .from('device_assignments')
    .select('device_id')
    .eq('user_id', user.id)
    .is('returned_at', null)

  const assignedDeviceIds = (activeAssignments || []).map((a) => a.device_id)

  // Lấy tất cả devices của user
  const { data, error } = await supabase
    .from('devices')
    .select('id, name, type')
    .eq('owner_id', user.id)
    .is('deleted_at', null)
    .order('name')

  if (error) {
    console.error('Lỗi lấy devices:', error.message)
    return { data: [], error: null }
  }

  // Lọc bỏ devices đã được assign
  const availableDevices = (data || []).filter((d) => !assignedDeviceIds.includes(d.id))

  return { data: availableDevices, error: null }
}
