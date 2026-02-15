"use client"

import { useQuery } from "@tanstack/react-query"
import { getDevices, getDeviceWithSheets, getDeviceStats } from "@/app/actions/devices"
import {
    toFrontendDevice,
    toFrontendDeviceWithSheets,
    buildSheetIdMap,
} from "@/lib/supabase-adapter"

export const deviceKeys = {
    all: ["devices"] as const,
    list: () => [...deviceKeys.all, "list"] as const,
    detail: (id: string) => [...deviceKeys.all, "detail", id] as const,
    stats: () => [...deviceKeys.all, "stats"] as const,
}

export function useDevicesQuery() {
    return useQuery({
        queryKey: deviceKeys.list(),
        queryFn: async () => {
            const { data, error } = await getDevices()
            if (error || !data) throw new Error(error || "Không thể tải danh sách devices")
            return data.map(toFrontendDevice)
        },
    })
}

export function useDeviceDetailQuery(deviceId: string | null) {
    return useQuery({
        queryKey: deviceKeys.detail(deviceId!),
        enabled: !!deviceId,
        queryFn: async () => {
            const { data, error } = await getDeviceWithSheets(deviceId!)
            if (error || !data) throw new Error(error || "Không thể tải device")

            const { device_sheets = [], ...deviceRow } = data as any
            return {
                device: toFrontendDeviceWithSheets(deviceRow, device_sheets),
                sheetIdMap: buildSheetIdMap(device_sheets),
                rawSheets: device_sheets,
            }
        },
    })
}

export function useDeviceStatsQuery() {
    return useQuery({
        queryKey: deviceKeys.stats(),
        queryFn: () => getDeviceStats(),
    })
}
