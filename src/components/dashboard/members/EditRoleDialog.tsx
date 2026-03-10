'use client'

import { useState } from 'react'
import {
    Dialog,
    DialogContent,
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
import { canManageMember } from '@/lib/permissions'
import type { OrganizationMember } from '@/types/organization'
import { ArrowRight } from 'lucide-react'

interface EditRoleDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    member: OrganizationMember | null
}

export function EditRoleDialog({ open, onOpenChange, member }: EditRoleDialogProps) {
    const { role: actorRole } = useAuth()
    const updateMutation = useUpdateRoleMutation()
    const [newRole, setNewRole] = useState<Role>('member')

    const currentRole = member?.role || 'member'

    // Roles mà actor có thể gán — lọc theo quyền hạn
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
    const initials = memberName
        .split(' ')
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="rounded-xl border-border/50 shadow-2xl sm:max-w-sm">
                <DialogHeader className="pb-0">
                    {/* Avatar + tên thành viên — context rõ ràng */}
                    <div className="mb-3 flex items-center gap-3">
                        <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold">
                            {initials}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{memberName}</p>
                            <p className="text-muted-foreground text-xs">{member?.profiles?.email}</p>
                        </div>
                    </div>
                    <DialogTitle className="text-base">Đổi vai trò</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-1">
                    {/* Flow: Hiện tại → Mới */}
                    <div className="flex items-center gap-2">
                        <div className="flex flex-1 flex-col items-start gap-1">
                            <span className="text-muted-foreground text-xs">Hiện tại</span>
                            <RoleBadge role={currentRole} className="text-xs px-2.5 py-0.5" />
                        </div>
                        <ArrowRight className="text-muted-foreground mt-4 size-4 shrink-0" />
                        <div className="flex flex-1 flex-col gap-1">
                            <span className="text-muted-foreground text-xs">Thay đổi thành</span>
                            <RoleBadge role={newRole} className="text-xs px-2.5 py-0.5" />
                        </div>
                    </div>

                    {/* Chọn vai trò */}
                    <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">Chọn vai trò mới</Label>
                        <Select value={newRole} onValueChange={(v) => setNewRole(v as Role)}>
                            <SelectTrigger className="h-9 w-full cursor-pointer rounded-lg border-border/60 text-sm">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-border/50 shadow-md">
                                {assignableRoles.map((role) => (
                                    <SelectItem key={role} value={role} className="cursor-pointer text-sm">
                                        {ROLE_LABELS[role]}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter className="pt-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onOpenChange(false)}
                        className="cursor-pointer rounded-lg border-border/50"
                    >
                        Hủy
                    </Button>
                    <Button
                        size="sm"
                        onClick={handleSubmit}
                        disabled={updateMutation.isPending || newRole === currentRole}
                        className="cursor-pointer rounded-lg"
                    >
                        {updateMutation.isPending ? (
                            <>
                                <AppLoader layout="horizontal" hideText className="mr-1.5" />
                                Đang lưu…
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
