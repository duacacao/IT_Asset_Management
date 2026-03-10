'use client'

import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AppLoader } from '@/components/ui/app-loader'
import { useResetPasswordMutation } from '@/hooks/mutations/memberMutations'
import type { OrganizationMember } from '@/types/organization'
import { KeyRound } from 'lucide-react'

interface ResetPasswordDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    member: OrganizationMember | null
}

export function ResetPasswordDialog({ open, onOpenChange, member }: ResetPasswordDialogProps) {
    const resetMutation = useResetPasswordMutation()
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')

    const handleSubmit = async () => {
        setError('')

        if (newPassword.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự')
            return
        }

        if (newPassword !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp')
            return
        }

        if (!member) return

        try {
            await resetMutation.mutateAsync({ memberId: member.id, newPassword })
            setNewPassword('')
            setConfirmPassword('')
            onOpenChange(false)
        } catch {
            // Error handled by mutation
        }
    }

    const memberName = member?.profiles?.full_name || 'thành viên'

    const handleClose = (v: boolean) => {
        if (!v) {
            setNewPassword('')
            setConfirmPassword('')
            setError('')
        }
        onOpenChange(v)
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="rounded-xl border-border/50 shadow-2xl sm:max-w-sm">
                <DialogHeader>
                    {/* Icon + tiêu đề dạng compact */}
                    <div className="flex items-center gap-3 mb-1">
                        <div className="bg-amber-500/10 text-amber-600 flex size-9 shrink-0 items-center justify-center rounded-full">
                            <KeyRound className="size-4" />
                        </div>
                        <DialogTitle className="text-base">Đặt lại mật khẩu</DialogTitle>
                    </div>
                    <DialogDescription className="text-xs leading-relaxed">
                        Đặt mật khẩu mới cho <strong className="text-foreground">{memberName}</strong>.
                        Thành viên sẽ cần dùng mật khẩu này để đăng nhập.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 py-1">
                    {/* Mật khẩu mới */}
                    <div className="space-y-1.5">
                        <Label htmlFor="new-password" className="text-xs">
                            Mật khẩu mới <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="new-password"
                            type="password"
                            placeholder="Ít nhất 6 ký tự"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                            className="h-9 rounded-lg border-border/60 text-sm"
                        />
                    </div>

                    {/* Xác nhận mật khẩu */}
                    <div className="space-y-1.5">
                        <Label htmlFor="confirm-new-password" className="text-xs">
                            Xác nhận mật khẩu <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="confirm-new-password"
                            type="password"
                            placeholder="Nhập lại mật khẩu mới"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                            className="h-9 rounded-lg border-border/60 text-sm"
                        />
                    </div>

                    {/* Error inline — chỉ hiện khi có lỗi */}
                    {error && (
                        <div className="flex items-center gap-2 rounded-lg bg-destructive/8 px-3 py-2 text-xs text-destructive">
                            <span className="shrink-0">⚠</span>
                            <span>{error}</span>
                        </div>
                    )}
                </div>

                <DialogFooter className="pt-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleClose(false)}
                        className="cursor-pointer rounded-lg border-border/50"
                    >
                        Hủy
                    </Button>
                    <Button
                        size="sm"
                        onClick={handleSubmit}
                        disabled={resetMutation.isPending || !newPassword}
                        className="cursor-pointer rounded-lg"
                    >
                        {resetMutation.isPending ? (
                            <>
                                <AppLoader layout="horizontal" hideText className="mr-1.5" />
                                Đang lưu…
                            </>
                        ) : (
                            'Đặt lại mật khẩu'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
