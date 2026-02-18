import type { Tables } from '@/types/supabase'
import type { Device, DeviceInfo, DeviceStatus, DeviceType } from '@/types/device'
import type { EndUser, EndUserWithDevice, AssignedDeviceInfo } from '@/types/end-user'

// ============================================
// Type alias cho database rows
// ============================================
type DbDevice = Tables<'devices'>
type DbSheet = Tables<'device_sheets'>
type DbEndUser = Tables<'end_users'>

// Cấu trúc specs JSONB lưu trong database
interface DeviceSpecs {
  os?: string
  cpu?: string
  ram?: string
  architecture?: string
  ip?: string
  mac?: string
  fileName?: string
  fileSize?: string
  totalSheets?: number
  totalRows?: number
  tags?: string[]
  visibleSheets?: string[]
  screenSize?: string
  resolution?: string
  connectionType?: string
}

// ============================================
// Supabase Row → Frontend Device (không có sheets)
// Dùng cho list view — không cần load sheets
// ============================================
// ============================================
// Supabase Row → Frontend Device (không có sheets)
// Dùng cho list view — không cần load sheets
// ============================================
// ============================================
// Supabase Row → Frontend Device (không có sheets)
// Dùng cho list view — không cần load sheets
// Update: Accepts raw assignments array for unification
// ============================================
export function toFrontendDevice(dbDevice: DbDevice, assignments: any[] = []): Device {
  const specs = (dbDevice.specs as DeviceSpecs) || {}

  // Find assignment for this device from the raw list
  const assignment = assignments.find((a) => a.device_id === dbDevice.id)

  const mappedAssignment = assignment
    ? {
        id: assignment.id,
        end_user_id: assignment.end_user_id,
        assignee_name: assignment.end_users?.full_name || assignment.end_users?.[0]?.full_name,
        assignee_email: assignment.end_users?.email || assignment.end_users?.[0]?.email,
        assigned_at: assignment.assigned_at,
      }
    : undefined

  return {
    id: dbDevice.id,
    name: dbDevice.name,
    status: (dbDevice.status as DeviceStatus) || 'active',
    type: (dbDevice.type as DeviceType) || 'PC',
    deviceInfo: {
      name: dbDevice.name,
      os: specs.os || '',
      cpu: specs.cpu || '',
      ram: specs.ram || '',
      architecture: specs.architecture || '',
      ip: specs.ip || '',
      mac: specs.mac || '',
      lastUpdate: dbDevice.updated_at,
      type: (dbDevice.type as DeviceType) || 'PC',
      screenSize: specs.screenSize,
      resolution: specs.resolution,
      connectionType: specs.connectionType,
    },
    fileName: specs.fileName || '',
    sheets: {},
    metadata: {
      totalSheets: specs.totalSheets || 0,
      totalRows: specs.totalRows || 0,
      fileSize: specs.fileSize || '',
      importedAt: dbDevice.created_at,
      tags: specs.tags || [],
      visibleSheets: specs.visibleSheets,
    },
    assignment: mappedAssignment,
  }
}

// ============================================
// Supabase Row → Frontend EndUser
// Dùng cho list view / detail view
// ============================================
export function toFrontendEndUser(
  dbUser: DbEndUser & {
    departments?: { name: string } | null
    positions?: { name: string } | null
  },
  assignments: any[] = [] // Raw assignments from DB
): EndUserWithDevice {
  // Lọc assignments của user này (match theo end_user_id)
  const userAssignments = assignments.filter((a) => a.end_user_id === dbUser.id)

  const devices: AssignedDeviceInfo[] = userAssignments.map((a) => ({
    id: a.devices?.id, // Use devices joined data
    name: a.devices?.name || 'Unknown Device',
    type: a.devices?.type || 'Unknown Type',
    assignment_id: a.id,
  }))

  const firstDevice = devices[0] || null

  return {
    id: dbUser.id,
    user_id: dbUser.user_id,
    full_name: dbUser.full_name,
    email: dbUser.email,
    phone: dbUser.phone,
    department_id: dbUser.department_id,
    position_id: dbUser.position_id,
    notes: dbUser.notes,
    created_at: dbUser.created_at,
    updated_at: dbUser.updated_at,
    department: dbUser.departments?.name || null,
    position: dbUser.positions?.name || null,
    devices: devices,
    // Backward compatibility fields
    device_name: firstDevice?.name || null,
    device_type: firstDevice?.type || null,
    assignment_id: firstDevice?.assignment_id || null,
    device_id: firstDevice?.id || null,
  }
}

// ============================================
// Supabase Device + Sheets → Frontend Device (đầy đủ)
// Dùng cho detail view — load sheets kèm theo
// ============================================
export function toFrontendDeviceWithSheets(
  dbDevice: DbDevice,
  dbSheets: DbSheet[],
  assignment: any = null
): Device {
  const base = toFrontendDevice(dbDevice, assignment ? [assignment] : [])

  // Convert mảng sheets DB → Record<sheetName, data[]>
  const sheets: Record<string, any[]> = {}
  const sortedSheets = [...dbSheets].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
  sortedSheets.forEach((sheet) => {
    sheets[sheet.sheet_name] = (sheet.sheet_data as any[]) || []
  })

  // Create Sheet ID Map
  const sheetIdMap: Record<string, string> = {}
  sortedSheets.forEach((s) => {
    sheetIdMap[s.sheet_name] = s.id
  })

  return {
    ...base,
    sheets,
    metadata: {
      ...base.metadata,
      totalSheets: dbSheets.length,
      totalRows: Object.values(sheets).reduce((sum, rows) => sum + rows.length, 0),
      sheetIdMap,
    },
  }
}

// ============================================
// Frontend DeviceInfo → Supabase update payload
// Merge specs cũ + updates mới → tránh mất dữ liệu
// ============================================
export function toSupabaseDeviceUpdate(
  currentSpecs: DeviceSpecs | null,
  updates: Partial<DeviceInfo>
) {
  const prevSpecs = currentSpecs || {}
  // Tách name ra khỏi specs (name là column riêng)
  const { name, type, lastUpdate, ...specFields } = updates

  const result: Record<string, any> = {
    specs: { ...prevSpecs, ...specFields },
    updated_at: new Date().toISOString(),
  }

  // Name là column riêng trong devices table
  if (name !== undefined) {
    result.name = name
  }
  if (type !== undefined) {
    result.type = type
  }

  return result
}

// ============================================
// Frontend Device → Supabase insert payload
// Dùng khi tạo device mới (create / import)
// ============================================
export function toSupabaseDeviceInsert(
  info: Partial<DeviceInfo>,
  meta?: { fileName?: string; fileSize?: string; totalSheets?: number; totalRows?: number }
): { name: string; type: string; status: string; specs: Record<string, any> } {
  return {
    name: info.name || 'Thiết bị mới',
    type: info.type || 'PC',
    status: 'active',
    specs: {
      os: info.os || '',
      cpu: info.cpu || '',
      ram: info.ram || '',
      architecture: info.architecture || '',
      ip: info.ip || '',
      mac: info.mac || '',
      fileName: meta?.fileName || '',
      fileSize: meta?.fileSize || '',
      totalSheets: meta?.totalSheets || 0,
      totalRows: meta?.totalRows || 0,
      tags: [] as string[],
      screenSize: info.screenSize || '',
      resolution: info.resolution || '',
      connectionType: info.connectionType || '',
    },
  }
}

// ============================================
// Tạo mapping sheetName → sheetId (database UUID)
// Component cần ID để gọi mutations
// ============================================
export function buildSheetIdMap(dbSheets: DbSheet[]): Record<string, string> {
  const map: Record<string, string> = {}
  dbSheets.forEach((s) => {
    map[s.sheet_name] = s.id
  })
  return map
}
