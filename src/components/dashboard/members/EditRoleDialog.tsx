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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { AppLoader } from '@/components/ui/app-loader'
import { RoleBadge } from '@/components/permission/RoleBadge'
import { useUpdateRoleMutation } from '@/hooks/mutations/memberMutations'
import { useAuth } from '@/contexts/AuthContext'
import { ROLES, ROLE_LABELS, type Role } from '@/types/permission'
import { isRoleAtLeast, canManageMember } from '@/lib/permissions'
import type { OrganizationMember } from '@/types/organization'

interface EditRoleDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    member: OrganizationMember | null
}

export function EditRoleDialog({ open, onOpenChange, member }: EditRoleDialogProps) {
    const { role: actorRole } = useAuth()
    const updateMutation = useUpdateRoleMutation()
    const [newRole, setNewRole] = useState<Role>('member')

    // Sync khi member thay đổi
    const currentRole = member?.role || 'member'

    // Roles mà actor có thể gán cho target
    const assignableRoles = ROLES.filter((r) => {
        if (r === 'owner') return false
        if (!actorRole) return false
        return canManageMember(actorRole, r)
    })

    const handleSubmit = async () => {
        if (!member) return
        try {
            await updateMutation.mutateAsync({ memberId: member.id, newRole })
            onOpenChange(false)
        } catch {
            // Error handled by mutation
        }
    }

    const memberName = member?.profiles?.full_name || 'Thành viên'

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="rounded-xl sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Đổi vai trò</DialogTitle>
                    <DialogDescription>
                        Thay đổi vai trò của <strong>{memberName}</strong> trong tổ chức.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <div className="flex items-center gap-2">
                        <span className="text-muted-foreground text-sm">Vai trò hiện tại:</span>
                        <RoleBadge role={currentRole} />
                    </div>

                    <div className="space-y-2">
                        <Label>Vai trò mới</Label>
                        <Select value={newRole} onValueChange={(v) => setNewRole(v as Role)}>
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
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="cursor-pointer rounded-xl">
                        Hủy
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={updateMutation.isPending || newRole === currentRole}
                        className="cursor-pointer rounded-xl"
                    >
                        {updateMutation.isPending ? (
                            <>
                                <AppLoader layout="horizontal" hideText className="mr-2" />
                                Đang lưu...
                            </>
                        ) : (
                            'Lưu thay đổi'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
