'use client'

import { useMemo, useState } from 'react'
import { AppLoader } from '@/components/ui/app-loader'

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
import { EndUserTable } from '@/components/dashboard/end-user/EndUserTable'
import { EndUserToolbar } from '@/components/dashboard/end-user/EndUserToolbar'
import { EndUserDialog } from '@/components/dashboard/end-user/EndUserDialog'
import { EndUserDetailDialog } from '@/components/dashboard/end-user/EndUserDetailDialog'

import { useEndUsersQuery, useDepartmentsQuery, usePositionsQuery, usePositionsRawQuery } from '@/hooks/queries/endUserQueries'
import { useDeleteEndUserMutation } from '@/hooks/mutations/endUserMutations'
import { useDevicesQuery } from '@/hooks/useDevicesQuery'
import { EndUserWithDevice } from '@/types/end-user'

export default function EndUsersPage() {
  // Queries
  const { data: endUsers = [], isLoading: isLoadingUsers } = useEndUsersQuery()
  const { data: deptOptions = [], isLoading: isLoadingDepartments } = useDepartmentsQuery()
  const { data: posOptions = [], isLoading: isLoadingPositions } = usePositionsQuery()
  const { data: rawPositions = [] } = usePositionsRawQuery()

  const isLoading = isLoadingUsers || isLoadingDepartments || isLoadingPositions

  const { data: availableDevices, isLoading: isLoadingDevices } = useDevicesQuery()
  const deleteMutation = useDeleteEndUserMutation()

  // State
  const [filters, setFilters] = useState({
    search: '',
    department: 'ALL',
    position: 'ALL',
  })
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<EndUserWithDevice | null>(null)
  const [viewingUser, setViewingUser] = useState<EndUserWithDevice | null>(null)

  // Delete State
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Filter Logic
  const filteredUsers = useMemo(() => {
    return endUsers.filter((user) => {
      const matchSearch =
        filters.search === '' ||
        user.full_name.toLowerCase().includes(filters.search.toLowerCase()) ||
        user.email?.toLowerCase().includes(filters.search.toLowerCase()) ||
        user.phone?.includes(filters.search)

      const matchDept = filters.department === 'ALL' || user.department_id === filters.department

      const matchPos = filters.position === 'ALL' || user.position_id === filters.position

      return matchSearch && matchDept && matchPos
    })
  }, [endUsers, filters])

  // Selectable Devices Logic (for Dialog)
  const selectableDevices = useMemo(() => {
    if (!availableDevices) return []
    return availableDevices
      .filter((d) => {
        // Device is available if status is 'inactive' (Sẵn sàng) AND it has no assignment
        const isAvailable = d.status === 'inactive' && !d.assignment
        // If editing, allow devices currently assigned to this user
        const isAssignedToCurrentUser = editingUser?.devices?.some((ud) => ud.id === d.id)
        return isAvailable || isAssignedToCurrentUser
      })
      .map((d) => ({
        id: d.id,
        name: d.name,
        type: d.type,
      }))
  }, [availableDevices, editingUser])

  // Handlers
  const handleOpenCreate = () => {
    setEditingUser(null)
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (user: EndUserWithDevice) => {
    setEditingUser(user)
    setIsDialogOpen(true)
  }

  const handleView = (id: string) => {
    const user = endUsers.find((u) => u.id === id) || null
    setViewingUser(user)
  }

  const handleDeleteClick = (id: string) => {
    setDeleteId(id)
  }

  const handleConfirmDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)
    try {
      if (deleteId === 'BULK') {
        // Bulk delete logic
        await Promise.all(selectedIds.map((id) => deleteMutation.mutateAsync(id)))
        setSelectedIds([])
      } else {
        await deleteMutation.mutateAsync(deleteId)
      }
    } catch (error) {
      console.error('Delete error:', error)
    } finally {
      setIsDeleting(false)
      setDeleteId(null)
    }
  }

  const handleSelectId = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id])
    } else {
      setSelectedIds((prev) => prev.filter((i) => i !== id))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredUsers.map((u) => u.id))
    } else {
      setSelectedIds([])
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      {isLoading ? (
        <div className="flex min-h-[50vh] items-center justify-center">
          <AppLoader layout="vertical" text="Đang tải danh sách end-user..." />
        </div>
      ) : (
        <div className="space-y-4">
          <EndUserTable
            data={filteredUsers}
            selectedIds={selectedIds}
            onSelectId={handleSelectId}
            onSelectAll={handleSelectAll}
            onEdit={handleOpenEdit}
            onDelete={handleDeleteClick}
            onView={(id) => handleView(id)}
            toolbar={(viewOptions) => (
              <EndUserToolbar
                filters={filters}
                setFilters={setFilters}
                departments={deptOptions}
                positions={posOptions}
                onAdd={handleOpenCreate}
                onBulkDelete={() => setDeleteId('BULK')}
                selectedCount={selectedIds.length}
                totalCount={endUsers.length}
                filteredCount={filteredUsers.length}
                viewOptions={viewOptions}
              />
            )}
          />
        </div>
      )}

      {/* Dialogs */}
      <EndUserDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        userToEdit={editingUser}
        departments={deptOptions}
        positions={posOptions}
        rawPositions={rawPositions}
        selectableDevices={selectableDevices}
        onSuccess={() => {
          // Query invalidation handled in mutation hooks
        }}
      />

      <EndUserDetailDialog
        open={!!viewingUser}
        onOpenChange={(open) => !open && setViewingUser(null)}
        user={viewingUser}
        onEdit={(user) => {
          setViewingUser(null)
          handleOpenEdit(user)
        }}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteId === 'BULK'
                ? `Hành động này sẽ xóa ${selectedIds.length} người dùng đã chọn.`
                : 'Hành động này sẽ xóa người dùng này khỏi hệ thống.'}{' '}
              Việc này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting} className="cursor-pointer rounded-xl">Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleConfirmDelete()
              }}
              disabled={isDeleting}
              className="cursor-pointer rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <AppLoader layout="horizontal" hideText className="mr-2" />
                  Đang xóa...
                </>
              ) : (
                'Xóa'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
