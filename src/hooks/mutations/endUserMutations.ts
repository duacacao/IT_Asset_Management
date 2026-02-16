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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.endUsers.list() })
      toast.success('Tạo ngườ dùng thành công!')
    },
    onError: (err) => {
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
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.endUsers.list() })
      queryClient.invalidateQueries({ queryKey: queryKeys.endUsers.detail(vars.id) })
      toast.success('Cập nhật ngườ dùng thành công!')
    },
    onError: (err) => {
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.endUsers.list() })
      toast.success('Xóa ngườ dùng thành công!')
    },
    onError: (err) => {
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
