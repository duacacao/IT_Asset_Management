export interface EndUser {
  id: string
  user_id: string
  full_name: string
  email: string | null
  phone: string | null
  department_id: string
  position_id: string
  notes: string | null
  created_at: string
  updated_at: string
}

// Thông tin 1 thiết bị đang assign cho end-user
export interface AssignedDeviceInfo {
  id: string
  name: string
  type: string
  assignment_id: string
}

// Mở rộng EndUser với tên phòng ban/chức vụ (resolve từ FK)
// và thông tin thiết bị đang assign (resolve từ device_assignments)
// 1 user có thể có nhiều device → field `devices` là mảng
export interface EndUserWithDevice extends EndUser {
  department: string | null
  position: string | null
  // Danh sách tất cả thiết bị đang assign (1:N)
  devices: AssignedDeviceInfo[]
  // Backward compat — lấy từ device đầu tiên (hoặc null)
  device_name: string | null
  device_type: string | null
  assignment_id: string | null
  device_id: string | null
}

export interface EndUserInsert {
  user_id?: string
  full_name: string
  email?: string
  phone?: string
  department_id: string // Bắt buộc — NOT NULL trong DB
  position_id: string // Bắt buộc — NOT NULL trong DB
  notes?: string
  device_ids?: string[] // Danh sách thiết bị muốn gán (1:N)
}

export interface EndUserUpdate {
  full_name?: string
  email?: string
  phone?: string
  department_id?: string
  position_id?: string
  notes?: string
  device_ids?: string[] // Danh sách thiết bị muốn gán (1:N)
  existing_devices?: AssignedDeviceInfo[] // Devices hiện tại để diff thêm/bớt
}
