"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import type { EndUser, EndUserInsert, EndUserUpdate, EndUserWithDevice } from "@/types/end-user"

export async function getEndUsers(): Promise<{
    data: EndUserWithDevice[] | null
    error: string | null
}> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { data: [], error: null }
    }

    const { data, error } = await supabase
        .from("end_users")
        .select(`
            *,
            devices:device_id (
                name,
                type
            )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

    if (error) {
        console.error("Lỗi lấy end_users:", error.message)
        return { data: [], error: null }
    }

    const formattedData: EndUserWithDevice[] = (data || []).map((item: any) => ({
        ...item,
        device_name: item.devices?.name || null,
        device_type: item.devices?.type || null,
    }))

    return { data: formattedData, error: null }
}

export async function getEndUser(id: string): Promise<{
    data: EndUser | null
    error: string | null
}> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { data: null, error: "Người dùng chưa đăng nhập" }
    }

    const { data, error } = await supabase
        .from("end_users")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single()

    if (error) {
        console.error("Lỗi lấy end_user:", error.message)
        return { data: null, error: error.message }
    }

    return { data, error: null }
}

export async function createEndUser(endUser: EndUserInsert): Promise<{
    data: EndUser | null
    error: string | null
}> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { data: null, error: "Người dùng chưa đăng nhập" }
    }

    const { data, error } = await supabase
        .from("end_users")
        .insert({
            ...endUser,
            user_id: user.id,
        })
        .select()
        .single()

    if (error) {
        console.error("Lỗi tạo end_user:", error.message)
        return { data: null, error: error.message }
    }

    if (endUser.device_id) {
        await supabase
            .from("devices")
            .update({ end_user_id: data.id })
            .eq("id", endUser.device_id)
    }

    revalidatePath("/end-user")
    return { data, error: null }
}

export async function updateEndUser(id: string, updates: EndUserUpdate): Promise<{
    data: EndUser | null
    error: string | null
}> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { data: null, error: "Người dùng chưa đăng nhập" }
    }

    const { data: current, error: fetchError } = await supabase
        .from("end_users")
        .select("device_id, user_id")
        .eq("id", id)
        .eq("user_id", user.id)
        .single()

    if (fetchError) {
        return { data: null, error: "Không tìm thấy end-user hoặc bạn không có quyền sửa" }
    }

    const { data, error } = await supabase
        .from("end_users")
        .update({
            ...updates,
            updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single()

    if (error) {
        console.error("Lỗi cập nhật end_user:", error.message)
        return { data: null, error: error.message }
    }

    if (updates.device_id !== undefined) {
        if (current.device_id && current.device_id !== updates.device_id) {
            await supabase
                .from("devices")
                .update({ end_user_id: null })
                .eq("id", current.device_id)
        }

        if (updates.device_id) {
            await supabase
                .from("devices")
                .update({ end_user_id: id })
                .eq("id", updates.device_id)
        }
    }

    revalidatePath("/end-user")
    return { data, error: null }
}

export async function deleteEndUser(id: string): Promise<{
    success: boolean
    error: string | null
}> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { success: false, error: "Người dùng chưa đăng nhập" }
    }

    const { data: current, error: fetchError } = await supabase
        .from("end_users")
        .select("device_id")
        .eq("id", id)
        .eq("user_id", user.id)
        .single()

    if (fetchError) {
        return { success: false, error: "Không tìm thấy end-user hoặc bạn không có quyền xóa" }
    }

    if (current) {
        await supabase
            .from("devices")
            .update({ end_user_id: null })
            .eq("end_user_id", id)
    }

    const { error } = await supabase
        .from("end_users")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id)

    if (error) {
        console.error("Lỗi xóa end_user:", error.message)
        return { success: false, error: error.message }
    }

    revalidatePath("/end-user")
    return { success: true, error: null }
}

export async function getAvailableDevices(): Promise<{
    data: { id: string; name: string; type: string }[] | null
    error: string | null
}> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { data: [], error: null }
    }

    // Lấy devices đã assign cho end_users của user này
    const { data: endUserDevices } = await supabase
        .from("end_users")
        .select("device_id")
        .eq("user_id", user.id)
        .not("device_id", "is", null)

    const assignedIds = (endUserDevices || [])
        .map(eu => eu.device_id)
        .filter(Boolean)

    // Query devices - filter theo owner_id (devices dùng owner_id, không phải user_id)
    const { data, error } = await supabase
        .from("devices")
        .select("id, name, type")
        .eq("owner_id", user.id)
        .order("name")

    // Graceful fallback - không return error, chỉ return empty array
    if (error) {
        console.error("Lỗi lấy devices:", error.message)
        return { data: [], error: null }
    }

    // Lọc bỏ devices đã được assign cho end_users khác
    let availableDevices = data || []
    if (assignedIds.length > 0) {
        availableDevices = availableDevices.filter(d => !assignedIds.includes(d.id))
    }

    return { data: availableDevices, error: null }
}
