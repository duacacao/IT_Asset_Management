'use client'

import { useQuery } from '@tanstack/react-query'
import { getDevices, getDeviceWithSheets, getDeviceStats } from '@/app/actions/devices'
import {
  toFrontendDevice,
  toFrontendDeviceWithSheets,
  buildSheetIdMap,
} from '@/lib/supabase-adapter'
import { queryKeys } from './queryKeys'

export function useDevicesQuery() {
  return useQuery({
    queryKey: queryKeys.devices.list(),
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await getDevices()
      if (error || !data) throw new Error(error || 'Không thể tải danh sách devices')

      const { devices, assignments } = data

      // Pre-build Map để tránh O(n²) — .find() bên trong toFrontendDevice
      // Trước: devices.map(d => toFrontendDevice(d, assignments)) → O(n×m)
      // Sau: Map lookup → O(n+m)
      const assignmentMap = new Map(
        assignments.map((a: any) => [a.device_id, a])
      )

      return devices.map((d: any) => {
        const matched = assignmentMap.get(d.id)
        return toFrontendDevice(d, matched ? [matched] : [])
      })
    },
  })
}

export function useDeviceDetailQuery(deviceId: string | null) {
  return useQuery({
    queryKey: queryKeys.devices.detail(deviceId!),
    enabled: !!deviceId,
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
    // Luôn refetch khi mount — safety net cho staleTime: Infinity global
    // Đảm bảo device detail luôn có data mới nhất khi navigate vào
    refetchOnMount: 'always',
    queryFn: async () => {
      const { data, error } = await getDeviceWithSheets(deviceId!)
      if (error || !data) throw new Error(error || 'Không thể tải device')

      const { device, sheets = [], assignment } = data as any

      return {
        device: toFrontendDeviceWithSheets(device, sheets, assignment),
        sheetIdMap: buildSheetIdMap(sheets),
        rawSheets: sheets,
      }
    },
  })
}

export function useDeviceStatsQuery() {
  return useQuery({
    queryKey: queryKeys.devices.stats(),
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    queryFn: () => getDeviceStats(),
  })
}
