'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  createDevice as createDeviceAction,
  updateDevice as updateDeviceAction,
  deleteDevice as deleteDeviceAction,
  importDevice as importDeviceAction,
  bulkUpdateDeviceStatus as bulkUpdateDeviceStatusAction,
} from '@/app/actions/devices'
import {
  createSheet as createSheetAction,
  updateSheetData as updateSheetDataAction,
  updateSheetCell as updateSheetCellAction,
  addSheetRow as addSheetRowAction,
} from '@/app/actions/device-sheets'
import { toSupabaseDeviceInsert, toSupabaseDeviceUpdate } from '@/lib/supabase-adapter'
import type { DeviceInfo, DeviceStatus, DeviceType } from '@/types/device'
import { mergeDeviceSpecs } from '@/types/device'
import { queryKeys } from '../queries/queryKeys'

export function useCreateDeviceMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (info: {
      name: string
      os: string
      cpu: string
      ram: string
      architecture: string
      ip: string
      mac: string
      status?: DeviceStatus
      type?: DeviceType
      screenSize?: string
      resolution?: string
      connectionType?: string
      gpu?: string
      storage?: string
      activationStatus?: string
    }) => {
      const insertData = toSupabaseDeviceInsert(info)
      if (info.status) insertData.status = info.status

      const { data, error } = await createDeviceAction(insertData)
      if (error || !data) throw new Error(error || 'Lỗi tạo device')
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.devices.list() })
      queryClient.invalidateQueries({ queryKey: queryKeys.devices.stats() })
      toast.success(`Đã tạo thiết bị "${data.name}"`)
    },
    onError: (err) => {
      toast.error('Lỗi tạo thiết bị', { description: err.message })
    },
  })
}

export function useImportDeviceMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: {
      deviceData: ReturnType<typeof toSupabaseDeviceInsert>
      sheets: { sheet_name: string; sheet_data: any[]; sort_order: number }[]
    }) => {
      const { data, error } = await importDeviceAction(params.deviceData, params.sheets)
      if (error || !data) throw new Error(error || 'Lỗi import')
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.devices.list() })
      queryClient.invalidateQueries({ queryKey: queryKeys.devices.stats() })
      toast.success(`Import thành công "${data.name}"`)
    },
    onError: (err) => {
      toast.error('Import thất bại', { description: err.message })
    },
  })
}

export function useUpdateDeviceMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: {
      deviceId: string
      updates: Partial<DeviceInfo> & { status?: DeviceStatus }
    }) => {
      // Logic đã move vào server action: fetch device -> merge updates
      // Client chỉ cần gửi updates
      const payload = toSupabaseDeviceUpdate(params.updates) // currentSpecs removed
      const { data, error } = await updateDeviceAction(params.deviceId, payload)
      if (error || !data) throw new Error(error || 'Lỗi cập nhật')
      return data
    },
    onMutate: async (vars) => {
      // Cancel queries
      await queryClient.cancelQueries({ queryKey: queryKeys.devices.detail(vars.deviceId) })
      await queryClient.cancelQueries({ queryKey: queryKeys.devices.list() })

      // Snapshot previous value
      const previousDevice = queryClient.getQueryData(queryKeys.devices.detail(vars.deviceId))

      // Optimistic update
      queryClient.setQueryData(queryKeys.devices.detail(vars.deviceId), (old: any) => {
        if (!old || !old.device) return old

        // Remove status before merging specs
        const { status, ...specUpdates } = vars.updates

        return {
          ...old,
          device: {
            ...old.device,
            status: status !== undefined ? status : old.device.status,
            deviceInfo: mergeDeviceSpecs(old.device.deviceInfo, specUpdates),
          },
        }
      })

      return { previousDevice }
    },
    onSuccess: (_data, vars) => {
      toast.success('Cập nhật thiết bị thành công')
    },
    onError: (err, vars, context) => {
      // Rollback
      if (context?.previousDevice) {
        queryClient.setQueryData(queryKeys.devices.detail(vars.deviceId), context.previousDevice)
      }
      toast.error('Lỗi cập nhật thiết bị', { description: err.message })
    },
    onSettled: (_data, _error, vars) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.devices.detail(vars.deviceId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.devices.list() })
    },
  })
}

export function useUpdateStatusMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: { deviceId: string; status: DeviceStatus }) => {
      const { data, error } = await updateDeviceAction(params.deviceId, {
        status: params.status,
        updated_at: new Date().toISOString(),
      })
      if (error || !data) {
        throw new Error(error || 'Lỗi cập nhật status')
      }
      return data
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.devices.list() })
      queryClient.invalidateQueries({ queryKey: queryKeys.devices.detail(vars.deviceId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.devices.stats() })
    },
  })
}

export function useBulkUpdateStatusMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: { deviceIds: string[]; status: DeviceStatus }) => {
      const { success, error } = await bulkUpdateDeviceStatusAction(params.deviceIds, params.status)
      if (!success) throw new Error(error || 'Lỗi batch cập nhật status')
      return params.deviceIds.length
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.devices.list() })
      queryClient.invalidateQueries({ queryKey: queryKeys.devices.stats() })
      toast.success('Đã cập nhật trạng thái')
    },
    onError: (err) => {
      toast.error('Lỗi cập nhật trạng thái', { description: err.message })
    },
  })
}


export function useDeleteDeviceMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (deviceId: string) => {
      const { success, error } = await deleteDeviceAction(deviceId)
      if (!success) throw new Error(error || 'Lỗi xóa')
      return deviceId
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.devices.list() })
      queryClient.invalidateQueries({ queryKey: queryKeys.devices.stats() })
      // Xóa device có thể thu hồi assignment → cập nhật lại end-user list
      queryClient.invalidateQueries({ queryKey: ['end-users'] })
      queryClient.invalidateQueries({ queryKey: ['available-devices'] })
      toast.success('Đã xóa thiết bị')
    },
    onError: (err) => {
      toast.error('Lỗi xóa thiết bị', { description: err.message })
    },
  })
}

export function useCreateSheetMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: { deviceId: string; sheetName: string; sortOrder?: number }) => {
      const { data, error } = await createSheetAction({
        device_id: params.deviceId,
        sheet_name: params.sheetName,
        sheet_data: [],
        sort_order: params.sortOrder ?? 0,
      })
      if (error || !data) throw new Error(error || 'Lỗi tạo sheet')
      return data
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.devices.detail(vars.deviceId) })
    },
  })
}

export function useUpdateCellMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: {
      deviceId: string
      sheetId: string
      sheetName: string
      rowIndex: number
      columnKey: string
      value: any
    }) => {
      const { data, error } = await updateSheetCellAction(
        params.sheetId,
        params.rowIndex,
        params.columnKey,
        params.value
      )
      if (error || !data) throw new Error(error || 'Lỗi cập nhật cell')
      return data
    },
    onMutate: async (vars) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.devices.detail(vars.deviceId) })

      const previous = queryClient.getQueryData(queryKeys.devices.detail(vars.deviceId))

      queryClient.setQueryData(queryKeys.devices.detail(vars.deviceId), (old: any) => {
        if (!old) return old
        const updatedDevice = { ...old.device }
        const sheetData = [...(updatedDevice.sheets[vars.sheetName] || [])]
        if (sheetData[vars.rowIndex]) {
          sheetData[vars.rowIndex] = {
            ...sheetData[vars.rowIndex],
            [vars.columnKey]: vars.value,
          }
          updatedDevice.sheets = {
            ...updatedDevice.sheets,
            [vars.sheetName]: sheetData,
          }
        }
        return { ...old, device: updatedDevice }
      })

      return { previous }
    },
    onError: (_err, vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.devices.detail(vars.deviceId), context.previous)
      }
    },
    onSettled: (_data, _err, vars) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.devices.detail(vars.deviceId) })
    },
  })
}


export function useAddRowMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: {
      deviceId: string
      sheetId: string
      rowData?: Record<string, any>
    }) => {
      const { data, error } = await addSheetRowAction(params.sheetId, params.rowData || {})
      if (error || !data) throw new Error(error || 'Lỗi thêm row')
      return data
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.devices.detail(vars.deviceId) })
    },
  })
}


export function useAddColumnMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: {
      deviceId: string
      sheetId: string
      columnName: string
      sheetData: any[]
    }) => {
      const updatedData = params.sheetData.map((row) => ({
        ...row,
        [params.columnName]: '',
      }))
      const { data, error } = await updateSheetDataAction(params.sheetId, updatedData)
      if (error || !data) throw new Error(error || 'Lỗi thêm column')
      return data
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.devices.detail(vars.deviceId) })
    },
  })
}
