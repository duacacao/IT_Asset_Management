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

// Mở rộng EndUser với tên phòng ban/chức vụ (resolve từ FK)
// và thông tin thiết bị đang assign (resolve từ device_assignments)
export interface EndUserWithDevice extends EndUser {
  department: string | null
  position: string | null
  device_name: string | null
  device_type: string | null
  assignment_id: string | null // ID của assignment hiện tại
  device_id: string | null // ID của device đang được gán
}

export interface EndUserInsert {
  user_id?: string
  full_name: string
  email?: string
  phone?: string
  department_id: string // Bắt buộc — NOT NULL trong DB
  position_id: string // Bắt buộc — NOT NULL trong DB
  notes?: string
  device_id?: string | null // Thiết bị muốn gán (optional)
}

export interface EndUserUpdate {
  full_name?: string
  email?: string
  phone?: string
  department_id?: string
  position_id?: string
  notes?: string
  device_id?: string | null // Thiết bị muốn gán (null = bỏ gán)
  assignment_id?: string | null // Assignment hiện tại để return nếu đổi device
}
