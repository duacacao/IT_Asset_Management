'use client'

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { AppLoader } from '@/components/ui/app-loader'
import { useRemoveMemberMutation } from '@/hooks/mutations/memberMutations'
import type { OrganizationMember } from '@/types/organization'

interface RemoveMemberDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    member: OrganizationMember | null
}

export function RemoveMemberDialog({ open, onOpenChange, member }: RemoveMemberDialogProps) {
    const removeMutation = useRemoveMemberMutation()

    const handleConfirm = async () => {
        if (!member) return
        try {
            await removeMutation.mutateAsync(member.id)
            onOpenChange(false)
        } catch {
            // Error handled by mutation
        }
    }

    const memberName = member?.profiles?.full_name || 'thành viên này'

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="rounded-xl border-border/50 shadow-2xl" style={{ maxWidth: 400 }}>
                <AlertDialogHeader>
                    <AlertDialogTitle>Xóa thành viên khỏi tổ chức?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Bạn có chắc chắn muốn xóa <strong>{memberName}</strong> khỏi tổ chức?
                        Thành viên sẽ không thể truy cập dữ liệu của tổ chức nữa.
                        Hành động này không thể hoàn tác.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={removeMutation.isPending} className="cursor-pointer rounded-xl">
                        Hủy
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault()
                            handleConfirm()
                        }}
                        disabled={removeMutation.isPending}
                        className="cursor-pointer rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {removeMutation.isPending ? (
                            <>
                                <AppLoader layout="horizontal" hideText className="mr-2" />
                                Đang xóa...
                            </>
                        ) : (
                            'Xóa thành viên'
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
