'use client'

import { useMemo, useState, useCallback } from 'react'
import { AppLoader } from '@/components/ui/app-loader'
import { PermissionGate } from '@/components/permission/PermissionGate'
import { MembersTable } from '@/components/dashboard/members/MembersTable'
import { MembersToolbar } from '@/components/dashboard/members/MembersToolbar'
import { CreateMemberSheet } from '@/components/dashboard/members/CreateMemberSheet'
import { EditRoleDialog } from '@/components/dashboard/members/EditRoleDialog'
import { RemoveMemberDialog } from '@/components/dashboard/members/RemoveMemberDialog'
import { ResetPasswordDialog } from '@/components/dashboard/members/ResetPasswordDialog'
import { useMembersQuery } from '@/hooks/queries/organizationQueries'
import { useAuth } from '@/contexts/AuthContext'
import { canManageMember } from '@/lib/permissions'
import type { OrganizationMember } from '@/types/organization'

export default function MembersPage() {
    const { user, role: actorRole } = useAuth()
    const { data: members = [], isLoading } = useMembersQuery()

    // Filter state
    const [search, setSearch] = useState('')
    const [roleFilter, setRoleFilter] = useState('ALL')

    // Dialog state
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [editRoleMember, setEditRoleMember] = useState<OrganizationMember | null>(null)
    const [removeMember, setRemoveMember] = useState<OrganizationMember | null>(null)
    const [resetPwMember, setResetPwMember] = useState<OrganizationMember | null>(null)

    // Filter logic — search + role filter
    const filteredMembers = useMemo(() => {
        return members.filter((member) => {
            const name = member.profiles?.full_name?.toLowerCase() || ''
            const email = member.profiles?.email?.toLowerCase() || ''
            const matchSearch =
                search === '' || name.includes(search.toLowerCase()) || email.includes(search.toLowerCase())

            const matchRole = roleFilter === 'ALL' || member.role === roleFilter

            return matchSearch && matchRole
        })
    }, [members, search, roleFilter])

    // Handlers — chỉ cho phép thao tác nếu actor có quyền quản lý target
    const handleEditRole = useCallback(
        (member: OrganizationMember) => {
            if (!actorRole || !canManageMember(actorRole, member.role)) return
            setEditRoleMember(member)
        },
        [actorRole]
    )

    const handleRemove = useCallback(
        (member: OrganizationMember) => {
            if (!actorRole || !canManageMember(actorRole, member.role)) return
            setRemoveMember(member)
        },
        [actorRole]
    )

    const handleResetPassword = useCallback(
        (member: OrganizationMember) => {
            if (!actorRole || !canManageMember(actorRole, member.role)) return
            setResetPwMember(member)
        },
        [actorRole]
    )

    return (
        <PermissionGate
            permission="members:read"
            fallback={
                <div className="flex min-h-[50vh] items-center justify-center">
                    <p className="text-muted-foreground">Bạn không có quyền xem trang này.</p>
                </div>
            }
        >
            <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
                {isLoading ? (
                    <div className="flex min-h-[50vh] items-center justify-center">
                        <AppLoader layout="vertical" text="Đang tải danh sách thành viên..." />
                    </div>
                ) : (
                    <div className="space-y-4">
                        <MembersTable
                            data={filteredMembers}
                            currentUserId={user?.id}
                            onEditRole={handleEditRole}
                            onRemove={handleRemove}
                            onResetPassword={handleResetPassword}
                            toolbar={(viewOptions) => (
                                <MembersToolbar
                                    search={search}
                                    onSearchChange={setSearch}
                                    roleFilter={roleFilter}
                                    onRoleFilterChange={setRoleFilter}
                                    onAdd={() => setIsCreateOpen(true)}
                                    totalCount={members.length}
                                    filteredCount={filteredMembers.length}
                                    viewOptions={viewOptions}
                                />
                            )}
                        />
                    </div>
                )}

                {/* Dialogs */}
                <CreateMemberSheet open={isCreateOpen} onOpenChange={setIsCreateOpen} />

                <EditRoleDialog
                    open={!!editRoleMember}
                    onOpenChange={(open) => !open && setEditRoleMember(null)}
                    member={editRoleMember}
                />

                <RemoveMemberDialog
                    open={!!removeMember}
                    onOpenChange={(open) => !open && setRemoveMember(null)}
                    member={removeMember}
                />

                <ResetPasswordDialog
                    open={!!resetPwMember}
                    onOpenChange={(open) => !open && setResetPwMember(null)}
                    member={resetPwMember}
                />
            </div>
        </PermissionGate>
    )
}
