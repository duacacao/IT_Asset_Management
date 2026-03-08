'use client'

import { useMemo, useState } from 'react'
import { toast } from 'sonner'
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
import { DepartmentTable } from '@/components/dashboard/department/DepartmentTable'
import { DepartmentToolbar } from '@/components/dashboard/department/DepartmentToolbar'
import { DepartmentDialog } from '@/components/dashboard/department/DepartmentDialog'
import { useDepartmentsRawQuery, useEndUsersQuery } from '@/hooks/queries/endUserQueries'
import { useDeleteDepartmentMutation } from '@/hooks/mutations/endUserMutations'
import type { Department } from '@/types/department'

export default function DepartmentPage() {
  const { data: departments = [], isLoading } = useDepartmentsRawQuery()
  const { data: endUsers = [] } = useEndUsersQuery()
  const deleteMutation = useDeleteDepartmentMutation()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingDept, setEditingDept] = useState<Department | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Count members per department from end_users
  const memberCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const eu of endUsers) {
      const deptId = (eu as any).department_id
      if (deptId) {
        counts.set(deptId, (counts.get(deptId) || 0) + 1)
      }
    }
    return counts
  }, [endUsers])

  const handleAdd = () => {
    setEditingDept(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (dept: Department) => {
    setEditingDept(dept)
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    setDeleteId(id)
  }

  const handleBulkDelete = () => {
    setDeleteId('BULK')
  }

  const handleConfirmDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)
    try {
      if (deleteId === 'BULK') {
        await Promise.all(selectedIds.map((id) => deleteMutation.mutateAsync(id)))
        setSelectedIds([])
        toast.success(`Đã xóa ${selectedIds.length} phòng ban`)
      } else {
        await deleteMutation.mutateAsync(deleteId)
      }
    } catch {
      toast.error('Có lỗi xảy ra khi xóa')
    } finally {
      setIsDeleting(false)
      setDeleteId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <AppLoader layout="vertical" text="Đang tải..." />
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="space-y-4">
        <DepartmentToolbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedCount={selectedIds.length}
          onAdd={handleAdd}
          onBulkDelete={handleBulkDelete}
        />

        <DepartmentTable
          data={departments}
          onEdit={handleEdit}
          onDelete={handleDelete}
          memberCounts={memberCounts}
          searchTerm={searchTerm}
          selectedIds={selectedIds}
          onSelectedIdsChange={setSelectedIds}
        />
      </div>

      {/* Create/Edit Dialog */}
      <DepartmentDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        deptToEdit={editingDept}
        departments={departments}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteId === 'BULK'
                ? `Sẽ xóa ${selectedIds.length} phòng ban đã chọn. Hành động này không thể hoàn tác.`
                : 'Phòng ban này sẽ bị xóa. Hành động này không thể hoàn tác.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting} className="cursor-pointer rounded-xl">
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
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
