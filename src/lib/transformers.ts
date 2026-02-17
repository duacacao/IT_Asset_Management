import { EndUserWithDevice, AssignedDeviceInfo } from '@/types/end-user'

// Type tạm thời khớp với kết quả trả về từ Supabase query (có join object)
// Cần sync với `getEndUsers` trong `actions/end-users.ts`
type RawEndUser = {
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
    departments: { name: string } | null
    positions: { name: string } | null
    device_assignments: Array<{
        id: string // assignment_id
        devices: {
            id: string
            name: string
            type: string
        } | null
    }> | null
}

export function transformEndUser(raw: any): EndUserWithDevice {
    // Safe cast raw input
    const user = raw as RawEndUser

    // Map device assignments
    // Filter assignments where device is not null (dữ liệu rác/lỗi)
    const devices: AssignedDeviceInfo[] = (user.device_assignments || [])
        .filter((a) => a.devices)
        .map((a) => ({
            id: a.devices!.id,
            name: a.devices!.name,
            type: a.devices!.type,
            assignment_id: a.id,
        }))

    // Backward compatibility fields (cho UI cũ hoặc hiển thị đơn giản)
    const firstDevice = devices[0] || null

    return {
        id: user.id,
        user_id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        department_id: user.department_id,
        position_id: user.position_id,
        notes: user.notes,
        created_at: user.created_at,
        updated_at: user.updated_at,

        // Flatten join objects
        department: user.departments?.name || null,
        position: user.positions?.name || null,

        // Devices list
        devices: devices,

        // Flatten first device info
        device_name: firstDevice?.name || null,
        device_type: firstDevice?.type || null,
        assignment_id: firstDevice?.assignment_id || null,
        device_id: firstDevice?.id || null,
    }
}

export function transformEndUserList(rawList: any[] | null): EndUserWithDevice[] {
    if (!rawList) return []
    return rawList.map(transformEndUser)
}
