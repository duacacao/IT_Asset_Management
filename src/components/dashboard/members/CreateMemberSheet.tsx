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

// Schema validation cho form tạo thành viên mới
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

    // Lọc roles mà actor có quyền gán — Owner tạo tất cả trừ owner, Admin chỉ member/viewer
    const assignableRoles = ROLES.filter((r) => {
        if (r === 'owner') return false
        if (actorRole === 'owner') return true
        if (actorRole === 'admin') return !isRoleAtLeast(r, 'admin')
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
            // Reset form + đóng sheet sau khi tạo thành công
            setFormData({ username: '', password: '', confirmPassword: '', full_name: '', role: 'member' })
            onOpenChange(false)
        } catch {
            // Error đã được handle bởi mutation onError
        }
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                hideClose
                className="flex w-full flex-col sm:m-2 sm:h-[calc(100vh-1rem)] sm:max-w-xl sm:rounded-xl sm:border sm:border-border/50 sm:shadow-2xl"
            >
                <SheetHeader className="mb-0 space-y-1 pb-0">
                    <div className="flex items-center space-x-2">
                        <span className="dark:bg-card text-primary rounded-md bg-white px-2 py-0.5 text-xs font-medium tracking-wider shadow-sm">
                            Tạo mới
                        </span>
                    </div>
                    <SheetTitle>Thêm thành viên</SheetTitle>
                    <SheetDescription>
                        Tạo tài khoản mới và thêm vào tổ chức của bạn.
                    </SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-hidden">
                    <div className="bg-muted/10 flex h-full flex-col overflow-hidden rounded-lg p-1">
                        {/* Scrollable form area — fade mask cho trải nghiệm mượt khi scroll */}
                        <div
                            className="flex-1 overflow-y-auto pr-3 pl-4"
                            style={{
                                maskImage:
                                    'linear-gradient(to bottom, transparent, black 8px, black calc(100% - 16px), transparent)',
                                WebkitMaskImage:
                                    'linear-gradient(to bottom, transparent, black 8px, black calc(100% - 16px), transparent)',
                            }}
                        >
                            <div className="space-y-6 pt-2 pb-6">
                                {/* Họ tên */}
                                <div className="space-y-2">
                                    <Label htmlFor="full_name">Họ tên *</Label>
                                    <Input
                                        id="full_name"
                                        placeholder="Nguyễn Văn A"
                                        value={formData.full_name}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, full_name: e.target.value }))}
                                    />
                                    {errors.full_name && <p className="text-destructive text-xs">{errors.full_name}</p>}
                                </div>

                                {/* Username */}
                                <div className="space-y-2">
                                    <Label htmlFor="username">Username *</Label>
                                    <Input
                                        id="username"
                                        placeholder="nguyenvana"
                                        value={formData.username}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
                                    />
                                    {errors.username && <p className="text-destructive text-xs">{errors.username}</p>}
                                </div>

                                {/* Password + Confirm — 2 cột trên desktop */}
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="password">Mật khẩu *</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            placeholder="Ít nhất 6 ký tự"
                                            value={formData.password}
                                            onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                                        />
                                        {errors.password && <p className="text-destructive text-xs">{errors.password}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword">Xác nhận mật khẩu *</Label>
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            placeholder="Nhập lại mật khẩu"
                                            value={formData.confirmPassword}
                                            onChange={(e) => setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                                        />
                                        {errors.confirmPassword && (
                                            <p className="text-destructive text-xs">{errors.confirmPassword}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Vai trò */}
                                <div className="space-y-2">
                                    <Label>Vai trò</Label>
                                    <Select
                                        value={formData.role}
                                        onValueChange={(v) => setFormData((prev) => ({ ...prev, role: v as Role }))}
                                    >
                                        <SelectTrigger className="cursor-pointer rounded-xl border-border/50 shadow-sm">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-border/50 shadow-md">
                                            {assignableRoles.map((role) => (
                                                <SelectItem key={role} value={role} className="cursor-pointer">
                                                    {ROLE_LABELS[role]}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.role && <p className="text-destructive text-xs">{errors.role}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Fixed sticky footer — luôn hiển thị nút hành động */}
                        <div className="border-border/40 bg-background/50 -mx-1 mt-auto -mb-1 flex-shrink-0 rounded-b-lg border-t px-6 py-3 backdrop-blur-md">
                            <div className="flex items-center justify-end space-x-3">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => onOpenChange(false)}
                                    disabled={createMutation.isPending}
                                    className="text-muted-foreground hover:text-foreground font-medium"
                                >
                                    Hủy bỏ
                                </Button>
                                <Button
                                    onClick={handleSubmit}
                                    disabled={createMutation.isPending}
                                    className="min-w-[100px] font-medium shadow-md"
                                >
                                    {createMutation.isPending ? (
                                        <>
                                            <AppLoader layout="horizontal" hideText className="mr-2 h-4 w-4" />
                                            <span>Đang tạo…</span>
                                        </>
                                    ) : (
                                        <span>Tạo tài khoản</span>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
