'use client'

import { useQuery } from '@tanstack/react-query'
import { getDevices, getDeviceWithSheets, getDeviceStats } from '@/app/actions/devices'
import {
  toFrontendDevice,
  toFrontendDeviceWithSheets,
  buildSheetIdMap,
} from '@/lib/supabase-adapter'

export const deviceKeys = {
  all: ['devices'] as const,
  list: () => [...deviceKeys.all, 'list'] as const,
  detail: (id: string) => [...deviceKeys.all, 'detail', id] as const,
  stats: () => [...deviceKeys.all, 'stats'] as const,
}

export function useDevicesQuery() {
  return useQuery({
    queryKey: deviceKeys.list(),
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await getDevices()
      if (error || !data) throw new Error(error || 'Không thể tải danh sách devices')

      const { devices, assignments } = data

      return devices.map((d: any) => toFrontendDevice(d, assignments))
    },
  })
}

export function useDeviceDetailQuery(deviceId: string | null) {
  return useQuery({
    queryKey: deviceKeys.detail(deviceId!),
    enabled: !!deviceId,
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
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
    queryKey: deviceKeys.stats(),
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    queryFn: () => getDeviceStats(),
  })
}
