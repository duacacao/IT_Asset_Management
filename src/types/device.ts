// Trạng thái thiết bị
export type DeviceStatus = 'active' | 'broken' | 'inactive'

// Loại thiết bị
export type DeviceType =
  | 'PC'
  | 'Laptop'
  | 'Monitor'
  | 'Printer'
  | 'Phone'
  | 'Tablet'
  | 'Network'
  | 'Other'

// Status config moved to @/constants/device

// Device data structure
export interface DeviceInfo {
  name: string
  os: string
  cpu: string
  ram: string
  architecture: string
  ip: string
  mac: string
  lastUpdate: string
  type?: DeviceType
  screenSize?: string
  resolution?: string
  connectionType?: string
}

export interface DeviceMetadata {
  totalSheets: number
  totalRows: number
  fileSize: string
  importedAt: string
  tags: string[]
  // Sheet nào được hiển thị (override per device, null = dùng global default)
  visibleSheets?: string[]
  sheetIdMap?: Record<string, string>
}

export interface Device {
  id: string
  name: string // Adding name to top level if convenient, but refering to schema it is in deviceInfo? Wait.
  // In Schema: id, name, status, type, ...
  // In Interface Device: id, status, deviceInfo...
  // The 'name' is in deviceInfo currently in the frontend type.
  // But in DB it is a column 'name'.
  // I should check if I should add 'type' to Device interface.
  type: DeviceType
  status: DeviceStatus
  deviceInfo: DeviceInfo
  fileName: string
  sheets: {
    [sheetName: string]: any[]
  }
  metadata: DeviceMetadata
  assignment?: {
    id: string
    end_user_id: string
    assignee_name?: string
    assignee_email?: string
    assigned_at: string
  }
}

// Sheet names mapping - Tieng Viet khong dau de nhat quan voi Python output
export const SHEET_NAMES = {
  cau_hinh: 'Cau hinh',
  license: 'License',
  driver: 'Driver',
  o_cung: 'O cung',
  ram: 'RAM',
  phan_mem: 'Phan mem',
  bios_info: 'BIOS Info',
  lan: 'LAN',
} as const

export type SheetNameKey = keyof typeof SHEET_NAMES

// ============================================
// Overview Data Types (từ XLSX import)
// ============================================
export interface RamSlot {
  slot: string
  size: string
  type: string
  speed: string
  manufacturer: string
}

export interface OverviewData {
  import_source?: 'xlsx' | 'manual'
  device_type?: DeviceType

  // OS
  os_name?: string
  architecture?: string
  bios_mode?: string
  activation_status?: string
  bios_version?: string
  bios_date?: string

  // CPU / Hardware
  processor?: string
  device_manufacturer?: string
  device_model?: string
  device_serial?: string

  // GPU
  gpu_integrated?: string
  gpu_discrete?: string

  // Storage
  storage_c_raw?: string
  storage_d_raw?: string
  disk_model?: string
  disk_type?: string
  disk_health?: string
  disk_wear?: string
  disk_temperature?: string
  disk_hours?: string

  // RAM
  ram_total?: string
  ram_slots?: RamSlot[]

  // Network
  ip_address?: string
  mac_address?: string

  // Software
  software_count?: number
  driver_count?: number
}

// Helper: Optimistic merge logic
export function mergeDeviceSpecs(
  currentSpecs: DeviceInfo,
  updates: Partial<DeviceInfo>
): DeviceInfo {
  return {
    ...currentSpecs,
    ...updates,
    lastUpdate: new Date().toISOString(),
  }
}
