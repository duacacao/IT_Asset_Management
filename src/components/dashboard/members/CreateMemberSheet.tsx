'use client'

import { useState } from 'react'
import { z } from 'zod'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AppLoader } from '@/components/ui/app-loader'
import { useCreateMemberMutation } from '@/hooks/mutations/memberMutations'
import { useAuth } from '@/contexts/AuthContext'
import { ROLES, ROLE_LABELS, type Role } from '@/types/permission'
import { isRoleAtLeast } from '@/lib/permissions'

// Zod validation cho create member form
const createMemberSchema = z.object({
    username: z
        .string()
        .min(3, 'Username phải có ít nhất 3 ký tự')
        .max(50, 'Username tối đa 50 ký tự')
        .regex(/^[a-zA-Z0-9_]+$/, 'Username chỉ chứa chữ cái, số và dấu gạch dưới'),
    password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
    confirmPassword: z.string(),
    full_name: z.string().min(1, 'Tên không được để trống').max(100, 'Tên tối đa 100 ký tự'),
    role: z.enum(['admin', 'member', 'viewer'] as const),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
})

interface CreateMemberSheetProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function CreateMemberSheet({ open, onOpenChange }: CreateMemberSheetProps) {
    const { role: actorRole } = useAuth()
    const createMutation = useCreateMemberMutation()

    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        full_name: '',
        role: 'member' as Role,
    })
    const [errors, setErrors] = useState<Record<string, string>>({})

    // Lọc roles mà actor có quyền gán
    // Admin chỉ tạo được member/viewer, Owner tạo được tất cả trừ owner
    const assignableRoles = ROLES.filter((r) => {
        if (r === 'owner') return false // Không ai tạo được owner mới
        if (actorRole === 'owner') return true
        if (actorRole === 'admin') return !isRoleAtLeast(r, 'admin') // Admin chỉ gán member/viewer
        return false
    })

    const handleSubmit = async () => {
        setErrors({})

        const parsed = createMemberSchema.safeParse(formData)
        if (!parsed.success) {
            const fieldErrors: Record<string, string> = {}
            parsed.error.issues.forEach((issue) => {
                const field = issue.path[0] as string
                fieldErrors[field] = issue.message
            })
            setErrors(fieldErrors)
            return
        }

        try {
            await createMutation.mutateAsync({
                username: parsed.data.username,
                password: parsed.data.password,
                full_name: parsed.data.full_name,
                role: parsed.data.role,
            })
            // Reset form + đóng sheet
            setFormData({ username: '', password: '', confirmPassword: '', full_name: '', role: 'member' })
            onOpenChange(false)
        } catch {
            // Error đã được handle bởi mutation onError
        }
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-md overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>Thêm thành viên mới</SheetTitle>
                    <SheetDescription>
                        Tạo tài khoản mới và thêm vào tổ chức của bạn.
                    </SheetDescription>
                </SheetHeader>

                <div className="mt-6 space-y-5 px-1">
                    {/* Full Name */}
                    <div className="space-y-2">
                        <Label htmlFor="full_name">Họ tên</Label>
                        <Input
                            id="full_name"
                            placeholder="Nguyễn Văn A"
                            value={formData.full_name}
                            onChange={(e) => setFormData((prev) => ({ ...prev, full_name: e.target.value }))}
                            className="rounded-xl"
                        />
                        {errors.full_name && <p className="text-destructive text-xs">{errors.full_name}</p>}
                    </div>

                    {/* Username */}
                    <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                            id="username"
                            placeholder="nguyenvana"
                            value={formData.username}
                            onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
                            className="rounded-xl"
                        />
                        {errors.username && <p className="text-destructive text-xs">{errors.username}</p>}
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                        <Label htmlFor="password">Mật khẩu</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="Ít nhất 6 ký tự"
                            value={formData.password}
                            onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                            className="rounded-xl"
                        />
                        {errors.password && <p className="text-destructive text-xs">{errors.password}</p>}
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            placeholder="Nhập lại mật khẩu"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                            className="rounded-xl"
                        />
                        {errors.confirmPassword && (
                            <p className="text-destructive text-xs">{errors.confirmPassword}</p>
                        )}
                    </div>

                    {/* Role */}
                    <div className="space-y-2">
                        <Label>Vai trò</Label>
                        <Select
                            value={formData.role}
                            onValueChange={(v) => setFormData((prev) => ({ ...prev, role: v as Role }))}
                        >
                            <SelectTrigger className="rounded-xl cursor-pointer">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                {assignableRoles.map((role) => (
                                    <SelectItem key={role} value={role} className="cursor-pointer">
                                        {ROLE_LABELS[role]}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.role && <p className="text-destructive text-xs">{errors.role}</p>}
                    </div>

                    {/* Submit */}
                    <Button
                        onClick={handleSubmit}
                        disabled={createMutation.isPending}
                        className="w-full cursor-pointer rounded-xl"
                    >
                        {createMutation.isPending ? (
                            <>
                                <AppLoader layout="horizontal" hideText className="mr-2" />
                                Đang tạo...
                            </>
                        ) : (
                            'Tạo tài khoản'
                        )}
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    )
}
