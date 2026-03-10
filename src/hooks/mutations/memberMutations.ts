'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
    createMemberAccount as createAction,
    updateMemberRole as updateRoleAction,
    removeMember as removeAction,
    resetMemberPassword as resetPwAction,
} from '@/app/actions/members'
import { queryKeys } from '../queries/queryKeys'
import type { Role } from '@/types/permission'

// ============================================
// Tạo member mới — invalidate members list on success
// ============================================
export function useCreateMemberMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (input: {
            username: string
            password: string
            full_name: string
            role: Role
        }) => {
            const result = await createAction(input)
            if (result.error) throw new Error(result.error)
            return result.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.members.list() })
            toast.success('Tạo tài khoản thành viên thành công!')
        },
        onError: (err) => {
            toast.error('Lỗi tạo tài khoản', { description: err.message })
        },
    })
}

// ============================================
// Đổi role member
// ============================================
export function useUpdateRoleMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ memberId, newRole }: { memberId: string; newRole: Role }) => {
            const result = await updateRoleAction(memberId, newRole)
            if (!result.success) throw new Error(result.error || 'Lỗi đổi role')
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.members.list() })
            toast.success('Đổi vai trò thành công!')
        },
        onError: (err) => {
            toast.error('Lỗi đổi vai trò', { description: err.message })
        },
    })
}

// ============================================
// Xóa member khỏi org
// ============================================
export function useRemoveMemberMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (memberId: string) => {
            const result = await removeAction(memberId)
            if (!result.success) throw new Error(result.error || 'Lỗi xóa thành viên')
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.members.list() })
            toast.success('Đã xóa thành viên khỏi tổ chức!')
        },
        onError: (err) => {
            toast.error('Lỗi xóa thành viên', { description: err.message })
        },
    })
}

// ============================================
// Reset password cho member
// ============================================
export function useResetPasswordMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ memberId, newPassword }: { memberId: string; newPassword: string }) => {
            const result = await resetPwAction(memberId, newPassword)
            if (!result.success) throw new Error(result.error || 'Lỗi reset password')
        },
        onSuccess: () => {
            // Không cần invalidate — password change không ảnh hưởng list
            toast.success('Đặt lại mật khẩu thành công!')
        },
        onError: (err) => {
            toast.error('Lỗi đặt lại mật khẩu', { description: err.message })
        },
    })
}
