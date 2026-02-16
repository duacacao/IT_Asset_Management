export interface EndUser {
    id: string;
    user_id: string;
    full_name: string;
    email: string | null;
    phone: string | null;
    department_id: string;
    position_id: string;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

// Mở rộng EndUser với tên phòng ban/chức vụ (resolve từ FK)
// và thông tin thiết bị đang assign (resolve từ device_assignments)
export interface EndUserWithDevice extends EndUser {
    department: string | null;
    position: string | null;
    device_name: string | null;
    device_type: string | null;
}

export interface EndUserInsert {
    user_id?: string;
    full_name: string;
    email?: string;
    phone?: string;
    department_id: string;  // Bắt buộc — NOT NULL trong DB
    position_id: string;    // Bắt buộc — NOT NULL trong DB
    notes?: string;
}

export interface EndUserUpdate {
    full_name?: string;
    email?: string;
    phone?: string;
    department_id?: string;
    position_id?: string;
    notes?: string;
}
