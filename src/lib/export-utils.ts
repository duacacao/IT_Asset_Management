import { Device } from '@/types/device'

/**
 * Chuyển đổi danh sách thiết bị thành chuỗi CSV
 * Bao gồm BOM (Byte Order Mark) để Excel nhận diện UTF-8
 */
export function devicesToCSV(devices: Device[]): string {
  const headers = [
    'Tên thiết bị',
    'OS',
    'CPU',
    'RAM',
    'IP',
    'MAC',
    'Trạng thái',
    'Cập nhật lần cuối',
  ]

  const rows = devices.map((device) => [
    device.deviceInfo.name,
    device.deviceInfo.os,
    device.deviceInfo.cpu || '',
    device.deviceInfo.ram || '',
    device.deviceInfo.ip || '',
    device.deviceInfo.mac || '',
    device.status,
    device.deviceInfo.lastUpdate || device.metadata.importedAt,
  ])

  // Escape ký tự đặc biệt trong CSV (dấu phẩy, xuống dòng, dấu ngoặc kép)
  const escapeCSV = (val: string) => {
    if (val.includes(',') || val.includes('\n') || val.includes('"')) {
      return `"${val.replace(/"/g, '""')}"`
    }
    return val
  }

  const csvContent = [
    headers.map(escapeCSV).join(','),
    ...rows.map((row) => row.map(escapeCSV).join(',')),
  ].join('\n')

  // Thêm BOM để Excel hiểu đúng UTF-8
  return '\uFEFF' + csvContent
}

/**
 * Tải file CSV xuống trình duyệt
 */
export function downloadCSV(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()

  // Dọn dẹp DOM và revoke URL
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Export thiết bị ra CSV với tên file tự động theo ngày
 */
export function exportDevicesToCSV(devices: Device[]): void {
  const date = new Date().toISOString().split('T')[0]
  const csv = devicesToCSV(devices)
  downloadCSV(csv, `devices_${date}.csv`)
}
