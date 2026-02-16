'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import type { DeviceInsert, DeviceUpdate } from '@/types/supabase'
import { ACTIVITY_LOG_ACTIONS } from '@/constants/activity-log'
import { returnDevice } from './device-assignments'

// ============================================
// Lấy danh sách devices của user hiện tại
// RLS tự động filter theo owner_id = auth.uid()
// ============================================
export async function getDevices() {
  const supabase = await createClient()

  // 1. Lấy danh sách devices
  const { data: devices, error: deviceError } = await supabase
    .from('devices')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (deviceError) {
    console.error('Lỗi lấy danh sách devices:', deviceError.message)
    return { data: null, error: deviceError.message }
  }

  // 2. Lấy danh sách assignments active (chưa trả)
  // Để tối ưu, chỉ lấy các assignment của devices vừa fetch được
  const deviceIds = devices.map((d) => d.id)
  const { data: assignments, error: assignmentError } = await supabase
    .from('device_assignments')
    .select(
      `
            id,
            device_id,
            end_user_id,
            assigned_at,
            end_users (full_name, email)
        `
    )
    .in('device_id', deviceIds)
    .is('returned_at', null)

  if (assignmentError) {
    console.error('Lỗi lấy assignments:', assignmentError.message)
    // Không return error, vẫn trả về device list nhưng không có info assignment
  }

  // 3. Map assignment vào device
  const devicesWithAssignment = devices.map((device) => {
    const assignment = assignments?.find((a) => a.device_id === device.id)
    // Handle end_users being array or object
    const user = Array.isArray(assignment?.end_users)
      ? assignment?.end_users[0]
      : assignment?.end_users

    return {
      ...device,
      assignment: assignment
        ? {
          id: assignment.id,
          end_user_id: assignment.end_user_id,
          assignee_name: user?.full_name,
          assignee_email: user?.email,
          assigned_at: assignment.assigned_at,
        }
        : undefined,
    }
  })

  return { data: devicesWithAssignment, error: null }
}

// ============================================
// Lấy chi tiết 1 device + sheets
// RLS đảm bảo chỉ owner mới xem được
// ============================================
export async function getDeviceWithSheets(deviceId: string) {
  const supabase = await createClient()

  // Lấy device + sheets trong 1 query (join)
  const { data, error } = await supabase
    .from('devices')
    .select(
      `
      *,
      device_sheets (
        id,
        sheet_name,
        sheet_data,
        sort_order,
        created_at
      )
    `
    )
    .eq('id', deviceId)
    .is('deleted_at', null)
    .single()

  if (error) {
    console.error('Lỗi lấy device:', error.message)
    return { data: null, error: error.message }
  }

  // 2. Fetch active assignment
  const { data: assignment } = await supabase
    .from('device_assignments')
    .select(
      `
         id,
         end_user_id,
         assigned_at,
         end_users (full_name, email)
       `
    )
    .eq('device_id', deviceId)
    .is('returned_at', null)
    .maybeSingle()

  // Handle end_users being array or object
  const user = Array.isArray(assignment?.end_users)
    ? assignment?.end_users[0]
    : assignment?.end_users

  // Map assignment info
  const deviceWithAssignment = {
    ...data,
    assignment: assignment
      ? {
        id: assignment.id,
        end_user_id: assignment.end_user_id,
        assignee_name: user?.full_name,
        assignee_email: user?.email,
        assigned_at: assignment.assigned_at,
      }
      : undefined,
  }

  return { data: deviceWithAssignment, error: null }
}

// ============================================
// Tạo device mới — tự động gắn owner_id = auth.uid()
// ============================================
export async function createDevice(
  deviceData: Omit<DeviceInsert, 'owner_id' | 'id' | 'created_at' | 'updated_at'>
) {
  const supabase = await createClient()

  // Lấy user hiện tại để gắn owner_id
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { data: null, error: 'Chưa đăng nhập' }
  }

  const { data, error } = await supabase
    .from('devices')
    .insert({
      ...deviceData,
      owner_id: user.id,
    })
    .select()
    .single()

  if (error) {
    console.error('Lỗi tạo device:', error.message)
    return { data: null, error: error.message }
  }

  revalidatePath('/devices')
  return { data, error: null }
}

// ============================================
// Cập nhật device — RLS đảm bảo chỉ owner mới sửa được
// ============================================
export async function updateDevice(deviceId: string, updates: DeviceUpdate) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('devices')
    .update(updates)
    .eq('id', deviceId)
    .select()
    .single()

  if (error) {
    console.error('Lỗi cập nhật device:', error.message)
    return { data: null, error: error.message }
  }

  revalidatePath('/devices')
  return { data, error: null }
}

// ============================================
// Kiểm tra device có đang bàn giao cho end-user không
// Dùng cho confirm dialog trước khi xóa
// ============================================
export async function checkDeviceAssignment(deviceId: string): Promise<{
  hasAssignment: boolean
  endUserName: string | null
  assignmentId: string | null
}> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('device_assignments')
    .select(`
      id,
      end_users:end_user_id (
        full_name
      )
    `)
    .eq('device_id', deviceId)
    .is('returned_at', null)
    .maybeSingle()

  if (!data) {
    return { hasAssignment: false, endUserName: null, assignmentId: null }
  }

  return {
    hasAssignment: true,
    endUserName: (data as any).end_users?.full_name || null,
    assignmentId: data.id,
  }
}

// ============================================
// Xóa device — tự động thu hồi assignment trước khi soft delete
// Pattern nhất quán với deleteEndUser()
// ============================================
export async function deleteDevice(deviceId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Người dùng chưa đăng nhập' }
  }

  // B1: Thu hồi thiết bị đang bàn giao (nếu có)
  const { data: activeAssignment } = await supabase
    .from('device_assignments')
    .select('id')
    .eq('device_id', deviceId)
    .is('returned_at', null)
    .maybeSingle()

  if (activeAssignment) {
    const returnResult = await returnDevice(activeAssignment.id)
    // Nếu lỗi thu hồi, vẫn tiếp tục xóa device nhưng log warning
    if (!returnResult.success) {
      console.error('Lỗi tự động thu hồi thiết bị khi xóa device:', returnResult.error)
    }
  }

  // B2: Soft delete device
  const { error } = await supabase
    .from('devices')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', deviceId)

  if (error) {
    console.error('Lỗi xóa device:', error.message)
    return { success: false, error: error.message }
  }

  revalidatePath('/devices')
  revalidatePath('/end-user')
  return { success: true, error: null }
}

// ============================================
// Import device từ Excel — tạo device + nhiều sheets cùng lúc
// ============================================
export async function importDevice(
  deviceData: Omit<DeviceInsert, 'owner_id' | 'id' | 'created_at' | 'updated_at'>,
  sheets: { sheet_name: string; sheet_data: any[]; sort_order: number }[]
) {
  const supabase = await createClient()

  // Lấy user hiện tại
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { data: null, error: 'Chưa đăng nhập' }
  }

  // Bước 1: Tạo device
  const { data: device, error: deviceError } = await supabase
    .from('devices')
    .insert({
      ...deviceData,
      owner_id: user.id,
    })
    .select()
    .single()

  if (deviceError || !device) {
    console.error('Lỗi import device:', deviceError?.message)
    return { data: null, error: deviceError?.message || 'Lỗi tạo device' }
  }

  // Bước 2: Tạo sheets cho device
  if (sheets.length > 0) {
    const sheetsToInsert = sheets.map((sheet) => ({
      device_id: device.id,
      sheet_name: sheet.sheet_name,
      sheet_data: sheet.sheet_data,
      sort_order: sheet.sort_order,
    }))

    const { error: sheetsError } = await supabase.from('device_sheets').insert(sheetsToInsert)

    if (sheetsError) {
      // Rollback: xóa device nếu tạo sheets thất bại
      console.error('Lỗi tạo sheets, rollback device:', sheetsError.message)
      await supabase.from('devices').delete().eq('id', device.id)
      return { data: null, error: 'Lỗi tạo sheets: ' + sheetsError.message }
    }
  }

  // Bước 3: Log activity
  await supabase.from('activity_logs').insert({
    device_id: device.id,
    user_id: user.id,
    action: ACTIVITY_LOG_ACTIONS.IMPORT,
    details: `Import ${deviceData.name} với ${sheets.length} sheets`,
  })

  revalidatePath('/devices')
  return { data: device, error: null }
}

// ============================================
// Lấy thống kê devices cho sidebar
// ============================================
export async function getDeviceStats() {
  const supabase = await createClient()

  const { data, error } = await supabase.from('devices').select('status')

  if (error) {
    return { total: 0, active: 0, broken: 0, inactive: 0 }
  }

  return {
    total: data.length,
    active: data.filter((d) => d.status === 'active').length,
    broken: data.filter((d) => d.status === 'broken').length,
    inactive: data.filter((d) => d.status === 'inactive').length,
  }
}

// ============================================
// Cập nhật danh sách sheets hiển thị (visibleSheets)
// ============================================
export async function updateDeviceVisibleSheets(deviceId: string, visibleSheets: string[]) {
  const supabase = await createClient()

  // 1. Lấy specs (jsonb) hiện tại
  const { data: device, error: readError } = await supabase
    .from('devices')
    .select('specs')
    .eq('id', deviceId)
    .single()

  if (readError || !device) {
    return { success: false, error: readError?.message || 'Không tìm thấy device' }
  }

  // 2. Update visibleSheets trong specs
  const currentSpecs = (device.specs as Record<string, any>) || {}
  const newSpecs = {
    ...currentSpecs,
    visibleSheets,
  }

  // 3. Ghi lại vào DB
  const { error: writeError } = await supabase
    .from('devices')
    .update({ specs: newSpecs })
    .eq('id', deviceId)

  if (writeError) {
    console.error('Lỗi cập nhật visible sheets:', writeError.message)
    return { success: false, error: writeError.message }
  }

  revalidatePath('/devices')
  return { success: true, error: null }
}
