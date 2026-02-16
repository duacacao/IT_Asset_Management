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
