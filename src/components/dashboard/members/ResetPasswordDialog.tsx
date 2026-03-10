'use client'

import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AppLoader } from '@/components/ui/app-loader'
import { useResetPasswordMutation } from '@/hooks/mutations/memberMutations'
import type { OrganizationMember } from '@/types/organization'

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

    return (
        <Dialog
            open={open}
            onOpenChange={(v) => {
                if (!v) {
                    setNewPassword('')
                    setConfirmPassword('')
                    setError('')
                }
                onOpenChange(v)
            }}
        >
            <DialogContent className="rounded-xl sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Đặt lại mật khẩu</DialogTitle>
                    <DialogDescription>
                        Đặt mật khẩu mới cho <strong>{memberName}</strong>.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label htmlFor="new-password">Mật khẩu mới</Label>
                        <Input
                            id="new-password"
                            type="password"
                            placeholder="Ít nhất 6 ký tự"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="rounded-xl"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirm-new-password">Xác nhận mật khẩu</Label>
                        <Input
                            id="confirm-new-password"
                            type="password"
                            placeholder="Nhập lại mật khẩu mới"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="rounded-xl"
                        />
                    </div>

                    {error && <p className="text-destructive text-sm">{error}</p>}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="cursor-pointer rounded-xl">
                        Hủy
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={resetMutation.isPending}
                        className="cursor-pointer rounded-xl"
                    >
                        {resetMutation.isPending ? (
                            <>
                                <AppLoader layout="horizontal" hideText className="mr-2" />
                                Đang lưu...
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
