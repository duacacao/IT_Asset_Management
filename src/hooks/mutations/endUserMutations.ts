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
import type { EndUserInsert, EndUserUpdate } from '@/types/end-user'
import type { Device } from '@/types/device'

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

      // Optimistic: loại bỏ các device đã chọn khỏi danh sách available
      if (newData.device_ids && newData.device_ids.length > 0) {
        const selectedIds = new Set(newData.device_ids)
        queryClient.setQueryData<Device[]>(queryKeys.availableDevices.list(), (old) => {
          if (!old) return old
          return old.filter((device) => !selectedIds.has(device.id))
        })
      }

      return { previousDevices }
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.endUsers.list() })
      queryClient.invalidateQueries({ queryKey: queryKeys.endUsers.stats() })
      queryClient.invalidateQueries({ queryKey: queryKeys.availableDevices.list() })
      // Invalidate devices list vì assign device → thay đổi status + người sử dụng
      // RealtimeProvider + optimistic update đã lo, bỏ refetchType: 'all'
      queryClient.invalidateQueries({ queryKey: queryKeys.devices.list() })
      queryClient.invalidateQueries({ queryKey: queryKeys.devices.stats() })
      toast.success('Tạo người dùng thành công!')
    },
    onError: (err, _vars, context) => {
      if (context?.previousDevices) {
        queryClient.setQueryData(queryKeys.availableDevices.list(), context.previousDevices)
      }
      toast.error('Lỗi tạo người dùng', { description: err.message })
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
    onMutate: async () => {
      // Lưu state cũ để rollback nếu lỗi
      await queryClient.cancelQueries({ queryKey: queryKeys.availableDevices.list() })
      const previousDevices = queryClient.getQueryData(queryKeys.availableDevices.list())
      return { previousDevices }
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.endUsers.list() })
      queryClient.invalidateQueries({ queryKey: queryKeys.endUsers.detail(vars.id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.endUsers.stats() })
      queryClient.invalidateQueries({ queryKey: queryKeys.availableDevices.list() })
      // Invalidate devices list vì assign/unassign device → thay đổi status + người sử dụng
      // RealtimeProvider + optimistic update đã lo, bỏ refetchType: 'all'
      queryClient.invalidateQueries({ queryKey: queryKeys.devices.list() })
      queryClient.invalidateQueries({ queryKey: queryKeys.devices.stats() })
      toast.success('Cập nhật người dùng thành công!')
    },
    onError: (err, _vars, context) => {
      if (context?.previousDevices) {
        queryClient.setQueryData(queryKeys.availableDevices.list(), context.previousDevices)
      }
      toast.error('Lỗi cập nhật người dùng', { description: err.message })
    },
  })
}

export function useDeleteEndUserMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteEndUserAction(id)
      if (!result.success) throw new Error(result.error || 'Lỗi xóa người dùng')
      return id
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKeys.availableDevices.list() })
      const previousDevices = queryClient.getQueryData(queryKeys.availableDevices.list())
      return { previousDevices }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.endUsers.list() })
      queryClient.invalidateQueries({ queryKey: queryKeys.endUsers.stats() })
      queryClient.invalidateQueries({ queryKey: queryKeys.availableDevices.list() })
      // Invalidate devices list vì xóa end-user → thu hồi device → thay đổi status
      // RealtimeProvider + optimistic update đã lo, bỏ refetchType: 'all'
      queryClient.invalidateQueries({ queryKey: queryKeys.devices.list() })
      queryClient.invalidateQueries({ queryKey: queryKeys.devices.stats() })
      toast.success('Xóa người dùng thành công!')
    },
    onError: (err, _vars, context) => {
      if (context?.previousDevices) {
        queryClient.setQueryData(queryKeys.availableDevices.list(), context.previousDevices)
      }
      toast.error('Lỗi xóa người dùng', { description: err.message })
    },
  })
}

// ============================================
// DEPARTMENTS MUTATIONS
// ============================================

export function useCreateDepartmentMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { name: string; parent_id?: string | null }) => {
      const result = await createDepartmentAction(data)
      if (result.error) throw new Error(result.error)
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.departments.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.organization.hierarchy() })
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
    mutationFn: async ({ id, name, parent_id }: { id: string; name: string; parent_id?: string | null }) => {
      const result = await updateDepartmentAction(id, { name, parent_id })
      if (result.error) throw new Error(result.error)
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.departments.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.endUsers.list() })
      queryClient.invalidateQueries({ queryKey: queryKeys.organization.hierarchy() })
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
      queryClient.invalidateQueries({ queryKey: queryKeys.departments.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.endUsers.list() })
      queryClient.invalidateQueries({ queryKey: queryKeys.organization.hierarchy() })
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
