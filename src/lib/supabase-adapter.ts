import type { Tables } from "@/types/supabase"
import type { Device, DeviceInfo, DeviceStatus, DeviceType } from "@/types/device"

// ============================================
// Type alias cho database rows
// ============================================
type DbDevice = Tables<"devices">
type DbSheet = Tables<"device_sheets">

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
}

// ============================================
// Supabase Row → Frontend Device (không có sheets)
// Dùng cho list view — không cần load sheets
// ============================================
// ============================================
// Supabase Row → Frontend Device (không có sheets)
// Dùng cho list view — không cần load sheets
// ============================================
export function toFrontendDevice(dbDevice: DbDevice & { assignment?: any }): Device {
    const specs = (dbDevice.specs as DeviceSpecs) || {}

    return {
        id: dbDevice.id,
        name: dbDevice.name,
        status: (dbDevice.status as DeviceStatus) || "active",
        type: (dbDevice.type as DeviceType) || "PC",
        deviceInfo: {
            name: dbDevice.name,
            os: specs.os || "",
            cpu: specs.cpu || "",
            ram: specs.ram || "",
            architecture: specs.architecture || "",
            ip: specs.ip || "",
            mac: specs.mac || "",
            lastUpdate: dbDevice.updated_at,
            type: (dbDevice.type as DeviceType) || "PC",
        },
        fileName: specs.fileName || "",
        sheets: {},
        metadata: {
            totalSheets: specs.totalSheets || 0,
            totalRows: specs.totalRows || 0,
            fileSize: specs.fileSize || "",
            importedAt: dbDevice.created_at,
            tags: specs.tags || [],
            visibleSheets: specs.visibleSheets,
        },
        assignment: dbDevice.assignment,
    }
}

// ============================================
// Supabase Device + Sheets → Frontend Device (đầy đủ)
// Dùng cho detail view — load sheets kèm theo
// ============================================
export function toFrontendDeviceWithSheets(
    dbDevice: DbDevice,
    dbSheets: DbSheet[]
): Device {
    const base = toFrontendDevice(dbDevice)

    // Convert mảng sheets DB → Record<sheetName, data[]>
    const sheets: Record<string, any[]> = {}
    const sortedSheets = [...dbSheets].sort(
        (a, b) => (a.sort_order || 0) - (b.sort_order || 0)
    )
    sortedSheets.forEach((sheet) => {
        sheets[sheet.sheet_name] = (sheet.sheet_data as any[]) || []
    })

    return {
        ...base,
        sheets,
        metadata: {
            ...base.metadata,
            totalSheets: dbSheets.length,
            totalRows: Object.values(sheets).reduce(
                (sum, rows) => sum + rows.length,
                0
            ),
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
        name: info.name || "Thiết bị mới",
        type: info.type || "PC",
        status: "active",
        specs: {
            os: info.os || "",
            cpu: info.cpu || "",
            ram: info.ram || "",
            architecture: info.architecture || "",
            ip: info.ip || "",
            mac: info.mac || "",
            fileName: meta?.fileName || "",
            fileSize: meta?.fileSize || "",
            totalSheets: meta?.totalSheets || 0,
            totalRows: meta?.totalRows || 0,
            tags: [] as string[],
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
