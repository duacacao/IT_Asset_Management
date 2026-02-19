import * as XLSX from 'xlsx'
import { toSupabaseDeviceInsert } from '@/lib/supabase-adapter'

// ============================================
// Scan tên sheet từ file Excel (không parse data)
// Dùng cho Sheet Selection Dialog
// ============================================
export const scanSheetNames = async (file: File): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array', bookSheets: true })
        const normalized = workbook.SheetNames.map((name) =>
          name.toLowerCase().replace(/\s+/g, '_')
        )
        resolve(normalized)
      } catch (error) {
        reject(error)
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsArrayBuffer(file)
  })
}

// ============================================
// Parse Excel file → dữ liệu sẵn sàng gửi lên Server Action
// Không tạo Device object client-side nữa — Server sẽ tạo
// ============================================
export interface ParsedExcelData {
  deviceData: ReturnType<typeof toSupabaseDeviceInsert>
  sheets: { sheet_name: string; sheet_data: any[]; sort_order: number }[]
}

export const parseExcelForImport = async (
  file: File,
  selectedSheets?: string[]
): Promise<ParsedExcelData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })

        // Parse sheets → mảng phẳng cho Supabase
        const sheets: ParsedExcelData['sheets'] = []
        let totalRows = 0
        let sortOrder = 0

        workbook.SheetNames.forEach((sheetName) => {
          const normalizedName = sheetName.toLowerCase().replace(/\s+/g, '_')

          // Chỉ parse sheet được chọn (nếu có filter)
          if (selectedSheets && !selectedSheets.includes(normalizedName)) return

          const sheet = workbook.Sheets[sheetName]
          const jsonData = XLSX.utils.sheet_to_json(sheet)

          // Sanitize data để đảm bảo chỉ có plain objects được gửi lên Server Action
          // Fix lỗi: "Only plain objects can be passed to Server Functions..."
          const sanitizedData = JSON.parse(JSON.stringify(jsonData))

          sheets.push({
            sheet_name: normalizedName,
            sheet_data: sanitizedData,
            sort_order: sortOrder++,
          })
          totalRows += jsonData.length
        })

        // Trích xuất thông tin thiết bị từ sheet đầu tiên
        const configSheet = sheets.find((s) => s.sheet_name === 'cau_hinh') || sheets[0]
        const firstRow: any = configSheet?.sheet_data?.[0] || {}

        const deviceName =
          firstRow['Ten may'] || firstRow['Tên máy'] || extractDeviceNameFromFile(file.name)

        // Normalize overview data từ tất cả sheets
        const overviewData = normalizeOverviewData(sheets)

        const deviceData = toSupabaseDeviceInsert(
          {
            name: deviceName,
            os: firstRow['He dieu hanh'] || firstRow['Hệ điều hành'] || 'Unknown OS',
            cpu: firstRow['CPU'] || 'Unknown CPU',
            ram: firstRow['RAM'] || 'Unknown RAM',
            architecture: firstRow['Kien truc'] || firstRow['Kiến trúc'] || '',
            ip: firstRow['IP'] || '',
            mac: firstRow['MAC'] || '',
          },
          {
            fileName: file.name,
            fileSize: formatFileSize(file.size),
            totalSheets: sheets.length,
            totalRows,
          }
        )

        // Merge overview_data vào specs
        deviceData.specs = {
          ...deviceData.specs,
          ...overviewData,
        }

        resolve({ deviceData, sheets })
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => reject(new Error('Không thể đọc file'))
    reader.readAsArrayBuffer(file)
  })
}

// ============================================
// Export device thành file Excel
// Nhận Device object (frontend type) — adapter đã convert
// ============================================
export const exportDeviceToExcel = (deviceName: string, sheets: Record<string, any[]>): void => {
  const workbook = XLSX.utils.book_new()

  Object.entries(sheets).forEach(([sheetName, sheetData]) => {
    const worksheet = XLSX.utils.json_to_sheet(sheetData)

    // Auto-size columns
    const maxWidth = 50
    const colWidths = Object.keys(sheetData[0] || {}).map((key) => ({
      wch: Math.min(
        maxWidth,
        Math.max(key.length, ...sheetData.map((row) => String(row[key] || '').length))
      ),
    }))
    worksheet['!cols'] = colWidths

    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
  })

  const filename = `${deviceName}_${new Date().toISOString().split('T')[0]}.xlsx`
  XLSX.writeFile(workbook, filename)
}

// ============================================
// Helper functions
// ============================================
const extractDeviceNameFromFile = (filename: string): string => {
  const match = filename.match(/^([^_]+)/)
  return match ? match[1] : filename.replace(/\.(xlsx|xls)$/i, '')
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

// ============================================
// Normalize overview data từ nhiều sheets
// Dùng cho Device Overview Tab
// ============================================
export interface OverviewData {
  import_source: 'xlsx'
  device_type: 'PC' | 'Laptop'

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
  ram_slots?: Array<{
    slot: string
    size: string
    type: string
    speed: string
    manufacturer: string
  }>

  // Network
  ip_address?: string
  mac_address?: string

  // Software
  software_count?: number
  driver_count?: number
}

export const normalizeOverviewData = (sheets: ParsedExcelData['sheets']): OverviewData => {
  const getSheet = (name: string) => sheets.find((s) => s.sheet_name === name)

  const cauHinhSheet = getSheet('cau_hinh')
  const cauHinhRow = cauHinhSheet?.sheet_data?.[0] || {}

  const licenseSheet = getSheet('license')
  const licenseRow = licenseSheet?.sheet_data?.[0] || {}

  const oCungSheet = getSheet('o_cung')
  const oCungRow = oCungSheet?.sheet_data?.[0] || {}

  const ramSheet = getSheet('ram')
  const ramRows = ramSheet?.sheet_data || []

  const biosSheet = getSheet('bios_info')
  const biosRow = biosSheet?.sheet_data?.[0] || {}

  const phanMemSheet = getSheet('phan_mem')
  const driverSheet = getSheet('driver')

  // Detect device type from file name or default to PC
  const deviceType: 'PC' | 'Laptop' = 'PC' // default

  return {
    import_source: 'xlsx',
    device_type: deviceType,

    // OS từ Cau hinh + License
    os_name: cauHinhRow['He dieu hanh'] || '',
    architecture: cauHinhRow['Kien truc'] || '',
    bios_mode: cauHinhRow['Che do BIOS'] || '',
    activation_status: licenseRow['Trang thai'] || '',

    // CPU từ Cau hinh + BIOS Info
    processor: cauHinhRow['CPU'] || '',
    device_manufacturer: biosRow['Hang SX'] || '',
    device_model: biosRow['Model'] || '',
    device_serial: biosRow['Serial'] || '',

    // BIOS từ BIOS Info
    bios_version: biosRow['Phien ban BIOS'] || '',
    bios_date: biosRow['Ngay BIOS'] || '',

    // GPU từ Cau hinh
    gpu_integrated: cauHinhRow['GPU Tich hop'] || '',
    gpu_discrete: cauHinhRow['GPU Roi'] || '',

    // Storage từ Cau hinh + O cung
    storage_c_raw: cauHinhRow['O C'] || '',
    storage_d_raw: cauHinhRow['O D'] || '',
    disk_model: oCungRow['Ten'] || '',
    disk_type: oCungRow['Loai'] || '',
    disk_health: oCungRow['Suc khoe'] || '',
    disk_wear: oCungRow['Muc hao mon'] || '',
    disk_temperature: oCungRow['Nhiet do'] || '',
    disk_hours: oCungRow['Gio hoat dong'] || '',

    // RAM từ Cau hinh + RAM sheet
    ram_total: cauHinhRow['RAM'] || '',
    ram_slots: ramRows.map((row: any) => ({
      slot: row['Slot'] || '',
      size: row['Dung luong'] || '',
      type: row['Loai'] || '',
      speed: row['Toc do'] || '',
      manufacturer: row['Hang SX'] || '',
    })),

    // Network từ Cau hinh
    ip_address: cauHinhRow['IP'] || '',
    mac_address: cauHinhRow['MAC'] || '',

    // Software counts
    software_count: phanMemSheet?.sheet_data?.length || 0,
    driver_count: driverSheet?.sheet_data?.length || 0,
  }
}
