'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  createEndUser as createEndUserAction,
  updateEndUser as updateEndUserAction,
  deleteEndUser as deleteEndUserAction,
} from '@/app/actions/end-users'
import {
  createDepartment as createDepartmentAction,
  updateDepartment as updateDepartmentAction,
  deleteDepartment as deleteDepartmentAction,
} from '@/app/actions/departments'
import {
  createPosition as createPositionAction,
  updatePosition as updatePositionAction,
  deletePosition as deletePositionAction,
} from '@/app/actions/positions'
import { queryKeys } from '../queries/queryKeys'
import type { EndUserInsert, EndUserUpdate, EndUserWithDevice } from '@/types/end-user'
import type { Device, DeviceType } from '@/types/device'

// ============================================
// END USERS MUTATIONS
// ============================================

export function useCreateEndUserMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: EndUserInsert) => {
      const result = await createEndUserAction(data)
      if (result.error) throw new Error(result.error)
      return result.data
    },
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.availableDevices.list() })
      const previousDevices = queryClient.getQueryData(queryKeys.availableDevices.list())

      if (newData.device_id) {
        queryClient.setQueryData<Device[]>(queryKeys.availableDevices.list(), (old) => {
          if (!old) return old
          return old.filter((device) => device.id !== newData.device_id)
        })
      }

      return { previousDevices }
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.endUsers.list() })
      queryClient.invalidateQueries({ queryKey: queryKeys.availableDevices.list() })
      toast.success('Tạo ngườ dùng thành công!')
    },
    onError: (err, _vars, context) => {
      if (context?.previousDevices) {
        queryClient.setQueryData(queryKeys.availableDevices.list(), context.previousDevices)
      }
      toast.error('Lỗi tạo ngườ dùng', { description: err.message })
    },
  })
}

export function useUpdateEndUserMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: EndUserUpdate }) => {
      const result = await updateEndUserAction(id, data)
      if (result.error) throw new Error(result.error)
      return result.data
    },
    onMutate: async (vars) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.availableDevices.list() })
      const previousDevices = queryClient.getQueryData(queryKeys.availableDevices.list())

      const currentUser = queryClient
        .getQueryData<EndUserWithDevice[]>(queryKeys.endUsers.list())
        ?.find((u) => u.id === vars.id)

      const oldDeviceId = currentUser?.device_id
      const newDeviceId = vars.data.device_id

      if (oldDeviceId !== newDeviceId) {
        queryClient.setQueryData<Device[]>(queryKeys.availableDevices.list(), (old) => {
          if (!old) return old
          let updated = [...old]

          // Device was assigned -> now available
          if (oldDeviceId && !newDeviceId) {
            const removedDevice = updated.find((d) => d.id === oldDeviceId)
            if (!removedDevice && currentUser?.device_name) {
              updated.push({
                id: oldDeviceId,
                name: currentUser.device_name,
                type: (currentUser.device_type as DeviceType) || 'PC',
                status: 'active',
                deviceInfo: {
                  name: currentUser.device_name || '',
                  os: '',
                  cpu: '',
                  ram: '',
                  architecture: '',
                  ip: '',
                  mac: '',
                  lastUpdate: '',
                },
                fileName: '',
                sheets: {},
                metadata: {
                  totalSheets: 0,
                  totalRows: 0,
                  fileSize: '',
                  importedAt: '',
                  tags: [],
                },
              })
            }
          }

          // Device was unassigned -> now unavailable
          if (!oldDeviceId && newDeviceId) {
            updated = updated.filter((d) => d.id !== newDeviceId)
          }

          // Device changed from A to B
          if (oldDeviceId && newDeviceId) {
            const deviceB = updated.find((d) => d.id === newDeviceId)
            if (deviceB) {
              updated = updated.filter((d) => d.id !== newDeviceId)
              // Add old device back
              if (currentUser?.device_name) {
                updated.push({
                  id: oldDeviceId,
                  name: currentUser.device_name,
                  type: (currentUser.device_type as DeviceType) || 'PC',
                  status: 'active',
                  deviceInfo: {
                    name: currentUser.device_name || '',
                    os: '',
                    cpu: '',
                    ram: '',
                    architecture: '',
                    ip: '',
                    mac: '',
                    lastUpdate: '',
                  },
                  fileName: '',
                  sheets: {},
                  metadata: {
                    totalSheets: 0,
                    totalRows: 0,
                    fileSize: '',
                    importedAt: '',
                    tags: [],
                  },
                })
              }
            }
          }

          return updated
        })
      }

      return { previousDevices }
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.endUsers.list() })
      queryClient.invalidateQueries({ queryKey: queryKeys.endUsers.detail(vars.id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.availableDevices.list() })
      toast.success('Cập nhật ngườ dùng thành công!')
    },
    onError: (err, _vars, context) => {
      if (context?.previousDevices) {
        queryClient.setQueryData(queryKeys.availableDevices.list(), context.previousDevices)
      }
      toast.error('Lỗi cập nhật ngườ dùng', { description: err.message })
    },
  })
}

export function useDeleteEndUserMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteEndUserAction(id)
      if (!result.success) throw new Error(result.error || 'Lỗi xóa ngườ dùng')
      return id
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.availableDevices.list() })
      const previousDevices = queryClient.getQueryData(queryKeys.availableDevices.list())

      const deletedUser = queryClient
        .getQueryData<EndUserWithDevice[]>(queryKeys.endUsers.list())
        ?.find((u) => u.id === id)

      if (deletedUser?.device_id) {
        const deviceIdToAdd = deletedUser.device_id
        const deviceNameToAdd = deletedUser.device_name || ''
        const deviceTypeToAdd = deletedUser.device_type as DeviceType | undefined

        queryClient.setQueryData<Device[]>(queryKeys.availableDevices.list(), (old) => {
          if (!old) return old
          // Add the device back to available list
          const newDevice: Device = {
            id: deviceIdToAdd,
            name: deviceNameToAdd,
            type: deviceTypeToAdd || 'PC',
            status: 'active',
            deviceInfo: {
              name: deviceNameToAdd,
              os: '',
              cpu: '',
              ram: '',
              architecture: '',
              ip: '',
              mac: '',
              lastUpdate: '',
            },
            fileName: '',
            sheets: {},
            metadata: {
              totalSheets: 0,
              totalRows: 0,
              fileSize: '',
              importedAt: '',
              tags: [],
            },
          }
          return [...old, newDevice]
        })
      }

      return { previousDevices }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.endUsers.list() })
      queryClient.invalidateQueries({ queryKey: queryKeys.availableDevices.list() })
      toast.success('Xóa ngườ dùng thành công!')
    },
    onError: (err, _vars, context) => {
      if (context?.previousDevices) {
        queryClient.setQueryData(queryKeys.availableDevices.list(), context.previousDevices)
      }
      toast.error('Lỗi xóa ngườ dùng', { description: err.message })
    },
  })
}

// ============================================
// DEPARTMENTS MUTATIONS
// ============================================

export function useCreateDepartmentMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (name: string) => {
      const result = await createDepartmentAction({ name })
      if (result.error) throw new Error(result.error)
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.departments.list() })
      toast.success('Tạo phòng ban thành công!')
    },
    onError: (err) => {
      toast.error('Lỗi tạo phòng ban', { description: err.message })
    },
  })
}

export function useUpdateDepartmentMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const result = await updateDepartmentAction(id, { name })
      if (result.error) throw new Error(result.error)
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.departments.list() })
      queryClient.invalidateQueries({ queryKey: queryKeys.endUsers.list() })
      toast.success('Cập nhật phòng ban thành công!')
    },
    onError: (err) => {
      toast.error('Lỗi cập nhật phòng ban', { description: err.message })
    },
  })
}

export function useDeleteDepartmentMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteDepartmentAction(id)
      if (!result.success) throw new Error(result.error || 'Lỗi xóa phòng ban')
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.departments.list() })
      queryClient.invalidateQueries({ queryKey: queryKeys.endUsers.list() })
      toast.success('Xóa phòng ban thành công!')
    },
    onError: (err) => {
      toast.error('Lỗi xóa phòng ban', { description: err.message })
    },
  })
}

// ============================================
// POSITIONS MUTATIONS
// ============================================

export function useCreatePositionMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (name: string) => {
      const result = await createPositionAction({ name })
      if (result.error) throw new Error(result.error)
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.positions.list() })
      toast.success('Tạo chức vụ thành công!')
    },
    onError: (err) => {
      toast.error('Lỗi tạo chức vụ', { description: err.message })
    },
  })
}

export function useUpdatePositionMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const result = await updatePositionAction(id, { name })
      if (result.error) throw new Error(result.error)
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.positions.list() })
      queryClient.invalidateQueries({ queryKey: queryKeys.endUsers.list() })
      toast.success('Cập nhật chức vụ thành công!')
    },
    onError: (err) => {
      toast.error('Lỗi cập nhật chức vụ', { description: err.message })
    },
  })
}

export function useDeletePositionMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deletePositionAction(id)
      if (!result.success) throw new Error(result.error || 'Lỗi xóa chức vụ')
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.positions.list() })
      queryClient.invalidateQueries({ queryKey: queryKeys.endUsers.list() })
      toast.success('Xóa chức vụ thành công!')
    },
    onError: (err) => {
      toast.error('Lỗi xóa chức vụ', { description: err.message })
    },
  })
}
