"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import type { EndUser, EndUserInsert, EndUserUpdate, EndUserWithDevice } from "@/types/end-user"

export async function getEndUsers(): Promise<{
    data: EndUserWithDevice[] | null
    error: string | null
}> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from("end_users")
        .select(`
            *,
            devices:device_id (
                name,
                type
            )
        `)
        .order("created_at", { ascending: false })

    if (error) {
        console.error("Lỗi lấy end_users:", error.message)
        return { data: null, error: error.message }
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

    const { data, error } = await supabase
        .from("end_users")
        .select("*")
        .eq("id", id)
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

    const { data, error } = await supabase
        .from("end_users")
        .insert(endUser)
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

    const { data: current, error: fetchError } = await supabase
        .from("end_users")
        .select("device_id")
        .eq("id", id)
        .single()

    if (fetchError) {
        return { data: null, error: fetchError.message }
    }

    const { data, error } = await supabase
        .from("end_users")
        .update({
            ...updates,
            updated_at: new Date().toISOString(),
        })
        .eq("id", id)
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

    const { error: fetchError } = await supabase
        .from("end_users")
        .select("device_id")
        .eq("id", id)
        .single()

    if (!fetchError) {
        await supabase
            .from("devices")
            .update({ end_user_id: null })
            .eq("end_user_id", id)
    }

    const { error } = await supabase
        .from("end_users")
        .delete()
        .eq("id", id)

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

    const { data: endUserDevices, error: euError } = await supabase
        .from("end_users")
        .select("device_id")
        .not("device_id", "is", null)

    if (euError) {
        console.error("Lỗi lấy devices đã assign:", euError.message)
    }

    const assignedIds = (endUserDevices || []).map(eu => eu.device_id).filter(Boolean)

    let query = supabase
        .from("devices")
        .select("id, name, type")
        .order("name")

    if (assignedIds.length > 0) {
        query = query.not("id", "in", `(${assignedIds.join(",")})`)
    }

    const { data, error } = await query

    if (error) {
        console.error("Lỗi lấy devices:", error.message)
        return { data: null, error: error.message }
    }

    return { data, error: null }
}
