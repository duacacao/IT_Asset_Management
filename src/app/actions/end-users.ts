'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import type { EndUser, EndUserInsert, EndUserUpdate, EndUserWithDevice } from '@/types/end-user'
import { assignDevice, returnDevice } from './device-assignments'

// ============================================
// Lấy danh sách end-users + thông tin phòng ban, chức vụ, thiết bị đang assign
// Join qua device_assignments để lấy thiết bị hiện tại (returned_at IS NULL)
// ============================================
export async function getEndUsers(): Promise<{
  data: EndUserWithDevice[] | null
  error: string | null
}> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { data: [], error: null }
  }

  // Lấy end_users + join FK phòng ban/chức vụ
  const { data, error } = await supabase
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
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Lỗi lấy end_users:', error.message)
    return { data: [], error: null }
  }

  // Lấy tất cả active assignments của user này để map device cho mỗi end-user
  const { data: assignments } = await supabase
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
    .is('returned_at', null)

  // Tạo map end_user_id → device info cho lookup nhanh
  const assignmentMap = new Map<string, { name: string; type: string }>()
  for (const a of (assignments || []) as any[]) {
    if (a.end_user_id && a.devices) {
      assignmentMap.set(a.end_user_id, {
        name: a.devices.name,
        type: a.devices.type,
      })
    }
  }

  // Format data với tên phòng ban/chức vụ + thiết bị
  const formattedData: EndUserWithDevice[] = (data || []).map((item: any) => {
    const assignment = (assignments || []).find((a: any) => a.end_user_id === item.id)

    // Handle devices being array or object
    const deviceData = assignment?.devices
    const device = Array.isArray(deviceData) ? deviceData[0] : deviceData

    return {
      ...item,
      department: item.departments?.name || null,
      position: item.positions?.name || null,
      device_name: device?.name || null,
      device_type: device?.type || null,
      assignment_id: assignment?.id || null,
      device_id: device?.id || null,
    }
  })

  return { data: formattedData, error: null }
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

  // Nếu có device_id, gán thiết bị cho user vừa tạo
  if (data && endUser.device_id) {
    const assignResult = await assignDevice(endUser.device_id, data.id)
    if (assignResult.error) {
      console.error('Lỗi gán thiết bị:', assignResult.error)
      // Không throw error, vẫn trả về user đã tạo
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

  // Xử lý device assignment nếu device_id thay đổi
  if (data && updates.device_id !== undefined) {
    const currentDeviceId = updates.device_id
    const assignmentId = updates.assignment_id

    // Nếu có assignment hiện tại và đổi sang device khác hoặc bỏ gán
    if (assignmentId && currentDeviceId !== data.device_id) {
      // Return thiết bị cũ
      const returnResult = await returnDevice(assignmentId)
      if (returnResult.error) {
        console.error('Lỗi trả thiết bị cũ:', returnResult.error)
        return { data: null, error: `Không thể trả thiết bị cũ: ${returnResult.error}` }
      }
    }

    // Nếu có device_id mới và khác với cũ (hoặc chưa có assignment)
    if (currentDeviceId && currentDeviceId !== data.device_id) {
      const assignResult = await assignDevice(currentDeviceId, id)
      if (assignResult.error) {
        console.error('Lỗi gán thiết bị mới:', assignResult.error)
        return { data: null, error: `Không thể gán thiết bị mới: ${assignResult.error}` }
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
