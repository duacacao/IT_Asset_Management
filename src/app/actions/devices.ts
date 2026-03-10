'use server'

import { requireAuth } from '@/lib/auth'
import { requirePermission } from '@/lib/permissions'
import { revalidatePath } from 'next/cache'
import type { DeviceInsert, DeviceUpdate } from '@/types/supabase'
import { ACTIVITY_LOG_ACTIONS } from '@/constants/activity-log'
import { returnDevice } from './device-assignments'

// ============================================
// Lấy danh sách devices của organization hiện tại
// RLS filter theo organization_id, explicit filter cho rõ ràng
// ============================================
export async function getDevices() {
  const { supabase, organization } = await requireAuth()

  // Parallel queries with Promise.all for performance
  const [devicesResult, assignmentsResult] = await Promise.all([
    supabase
      .from('devices')
      // Chỉ select columns cần cho list view — giảm payload size
      .select('id, name, status, type, specs, created_at, updated_at')
      .eq('organization_id', organization.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false }),
    supabase
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
      .eq('organization_id', organization.id)
      .is('returned_at', null),
  ])

  if (devicesResult.error) {
    console.error('Lỗi lấy danh sách devices:', devicesResult.error.message)
    return { data: { devices: [], assignments: [] }, error: devicesResult.error.message }
  }

  if (assignmentsResult.error) {
    console.error('Lỗi lấy assignments:', assignmentsResult.error.message)
    return {
      data: { devices: devicesResult.data || [], assignments: [] },
      error: assignmentsResult.error.message,
    }
  }

  return {
    data: {
      devices: devicesResult.data || [],
      assignments: assignmentsResult.data || [],
    },
    error: null,
  }
}

// ============================================
// Lấy chi tiết 1 device + sheets
// RLS đảm bảo chỉ members cùng org mới xem được
// ============================================
export async function getDeviceWithSheets(deviceId: string) {
  const { supabase } = await requireAuth()

  // Parallel: device+sheets and assignment
  const [deviceResult, assignmentResult] = await Promise.all([
    supabase
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
      .single(),
    supabase
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
      .eq('device_id', deviceId)
      .is('returned_at', null)
      .maybeSingle(),
  ])

  if (deviceResult.error) {
    console.error('Lỗi lấy device:', deviceResult.error.message)
    return { data: null, error: deviceResult.error.message }
  }

  const { device_sheets, ...deviceData } = deviceResult.data

  return {
    data: {
      device: deviceData,
      sheets: device_sheets || [],
      assignment: assignmentResult.data,
    },
    error: null,
  }
}

// ============================================
// Tạo device mới — gắn organization_id + owner_id (audit)
// Viewer bị chặn bởi requirePermission
// ============================================
export async function createDevice(
  deviceData: Omit<DeviceInsert, 'owner_id' | 'organization_id' | 'id' | 'created_at' | 'updated_at'>
) {
  const { supabase, user, organization, role } = await requireAuth()
  requirePermission(role, 'devices:write')

  const { data, error } = await supabase
    .from('devices')
    .insert({
      ...deviceData,
      owner_id: user.id,
      organization_id: organization.id,
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
// Cập nhật device — RLS đảm bảo chỉ cùng org mới sửa được
// ============================================
export async function updateDevice(deviceId: string, updates: DeviceUpdate) {
  const { supabase, role } = await requireAuth()
  requirePermission(role, 'devices:write')

  // 1. Fetch current device data to get existing specs
  const { data: currentDevice, error: fetchError } = await supabase
    .from('devices')
    .select('specs')
    .eq('id', deviceId)
    .single()

  if (fetchError || !currentDevice) {
    console.error('Lỗi lấy thông tin device trước khi update:', fetchError?.message)
    return { data: null, error: fetchError?.message || 'Không tìm thấy thiết bị' }
  }

  // 2. Prepare payload — merge specs nếu có
  let finalUpdates = { ...updates }

  if (updates.specs) {
    const currentSpecs = (currentDevice.specs as Record<string, any>) || {}
    const newSpecs = (updates.specs as Record<string, any>) || {}
    finalUpdates.specs = {
      ...currentSpecs,
      ...newSpecs,
    }
  }

  // 3. Execute update
  const { data, error } = await supabase
    .from('devices')
    .update(finalUpdates)
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
// ============================================
export async function checkDeviceAssignment(deviceId: string): Promise<{
  hasAssignment: boolean
  endUserName: string | null
  assignmentId: string | null
}> {
  const { supabase } = await requireAuth()

  const { data } = await supabase
    .from('device_assignments')
    .select(
      `
      id,
      end_users:end_user_id (
        full_name
      )
    `
    )
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
// Kiểm tra batch nhiều devices có đang bàn giao không (1 round-trip)
// ============================================
export async function checkDevicesAssignments(deviceIds: string[]): Promise<{
  assignedCount: number
  assignedDeviceIds: string[]
}> {
  if (!deviceIds.length) return { assignedCount: 0, assignedDeviceIds: [] }

  const { supabase } = await requireAuth()

  const { data } = await supabase
    .from('device_assignments')
    .select('device_id')
    .in('device_id', deviceIds)
    .is('returned_at', null)

  const assignedDeviceIds = (data || []).map((a) => a.device_id as string)

  return {
    assignedCount: assignedDeviceIds.length,
    assignedDeviceIds,
  }
}

// ============================================
// Xóa device — tự động thu hồi assignment trước khi soft delete
// ============================================
export async function deleteDevice(deviceId: string) {
  const { supabase, role } = await requireAuth()
  requirePermission(role, 'devices:write')

  // B1: Thu hồi thiết bị đang bàn giao (nếu có)
  const { data: activeAssignment } = await supabase
    .from('device_assignments')
    .select('id')
    .eq('device_id', deviceId)
    .is('returned_at', null)
    .maybeSingle()

  if (activeAssignment) {
    const returnResult = await returnDevice(activeAssignment.id)
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
  deviceData: Omit<DeviceInsert, 'owner_id' | 'organization_id' | 'id' | 'created_at' | 'updated_at'>,
  sheets: { sheet_name: string; sheet_data: any[]; sort_order: number }[]
) {
  const { supabase, user, organization, role } = await requireAuth()
  requirePermission(role, 'devices:write')

  // Bước 1: Tạo device
  const { data: device, error: deviceError } = await supabase
    .from('devices')
    .insert({
      ...deviceData,
      owner_id: user.id,
      organization_id: organization.id,
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
      // Rollback: soft delete device nếu tạo sheets thất bại
      console.error('Lỗi tạo sheets, rollback device (soft-delete):', sheetsError.message)
      await supabase
        .from('devices')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', device.id)
      return { data: null, error: 'Lỗi tạo sheets: ' + sheetsError.message }
    }
  }

  // Bước 3: Log activity
  await supabase.from('activity_logs').insert({
    device_id: device.id,
    user_id: user.id,
    organization_id: organization.id,
    action: ACTIVITY_LOG_ACTIONS.IMPORT,
    details: `Import ${deviceData.name} với ${sheets.length} sheets`,
  })

  revalidatePath('/devices')
  return { data: device, error: null }
}

// ============================================
// Lấy thống kê devices cho dashboard
// ============================================
export async function getDeviceStats() {
  const { supabase, organization } = await requireAuth()

  // Dùng 4 count queries song song thay vì fetch toàn bộ rows
  const baseQuery = () =>
    supabase
      .from('devices')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organization.id)
      .is('deleted_at', null)

  const [totalResult, activeResult, brokenResult, inactiveResult] = await Promise.all([
    baseQuery(),
    baseQuery().eq('status', 'active'),
    baseQuery().eq('status', 'broken'),
    baseQuery().eq('status', 'inactive'),
  ])

  return {
    total: totalResult.count ?? 0,
    active: activeResult.count ?? 0,
    broken: brokenResult.count ?? 0,
    inactive: inactiveResult.count ?? 0,
  }
}


// ============================================
// Cập nhật danh sách sheets hiển thị (visibleSheets)
// ============================================
export async function updateDeviceVisibleSheets(deviceId: string, visibleSheets: string[]) {
  const { supabase, role } = await requireAuth()
  requirePermission(role, 'devices:write')

  // Atomic JSONB merge tại DB level
  const { error } = await supabase.rpc('set_device_visible_sheets', {
    p_device_id: deviceId,
    p_visible_sheets: JSON.stringify(visibleSheets),
  })

  if (error) {
    console.error('Lỗi cập nhật visible sheets:', error.message)
    return { success: false, error: error.message }
  }

  revalidatePath('/devices')
  return { success: true, error: null }
}

// ============================================
// Batch update status for multiple devices (1 request)
// ============================================
export async function bulkUpdateDeviceStatus(deviceIds: string[], status: string) {
  if (!deviceIds.length) return { success: true, error: null }

  const { supabase, organization, role } = await requireAuth()
  requirePermission(role, 'devices:write')

  const { error } = await supabase
    .from('devices')
    .update({ status, updated_at: new Date().toISOString() })
    .in('id', deviceIds)
    .eq('organization_id', organization.id)

  if (error) {
    console.error('Lỗi batch update status:', error.message)
    return { success: false, error: error.message }
  }

  revalidatePath('/devices')
  return { success: true, error: null }
}
