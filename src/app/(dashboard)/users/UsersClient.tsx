'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { EndUserTable } from '@/components/dashboard/end-user/EndUserTable'
import { EndUserDialog } from '@/components/dashboard/end-user/EndUserDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search, FileDown } from 'lucide-react'
import { EndUserWithDevice } from '@/types/end-user'
import { useDeleteEndUserMutation } from '@/hooks/mutations/endUserMutations'
import {
  useEndUsersQuery, // Added this hook
  useDepartmentsQuery,
  usePositionsQuery,
  usePositionsRawQuery,
  useAvailableDevicesQuery,
} from '@/hooks/queries/endUserQueries'
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

interface UsersClientProps {
  initialData: EndUserWithDevice[]
}

export function UsersClient({ initialData }: UsersClientProps) {
  const router = useRouter()

  // Use React Query for data to keep sync with mutations
  // Pass initialData to hydrate cache immediately
  const { data: users = initialData, refetch } = useEndUsersQuery()

  // Local UI State
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [userToEdit, setUserToEdit] = useState<EndUserWithDevice | null>(null)

  // Delete Confirmation State
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // Remote Data Hooks for Selects
  const { data: departments = [] } = useDepartmentsQuery()
  const { data: positions = [] } = usePositionsQuery()
  const { data: rawPositions = [] } = usePositionsRawQuery()
  const { data: availableDevices = [] } = useAvailableDevicesQuery()

  // Mutations
  const deleteMutation = useDeleteEndUserMutation()

  // Filter Logic on Client Side (for now)
  const filteredData = (users || []).filter(
    (user) =>
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.department?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Handle Selection
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredData.map((u) => u.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleSelectId = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id])
    } else {
      setSelectedIds((prev) => prev.filter((i) => i !== id))
    }
  }

  // Handle Actions
  const handleCreate = () => {
    setUserToEdit(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (user: EndUserWithDevice) => {
    setUserToEdit(user)
    setIsDialogOpen(true)
  }

  const handleDeleteClick = (id: string) => {
    setDeleteId(id)
  }

  const confirmDelete = async () => {
    if (!deleteId) return

    try {
      await deleteMutation.mutateAsync(deleteId)
      // Query will automatically invalidate due to mutation onSuccess
      // remove from selection
      setSelectedIds((prev) => prev.filter((id) => id !== deleteId))
    } catch (error) {
      // Error handled by mutation hook
    } finally {
      setDeleteId(null)
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2">
        <div className="relative flex-1 md:max-w-sm">
          <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
          <Input
            placeholder="Tìm kiếm nhân viên, email, phòng ban..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <FileDown className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button size="sm" onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Thêm nhân viên
          </Button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-card text-card-foreground flex-1 rounded-xl border shadow-sm">
        <EndUserTable
          data={filteredData}
          selectedIds={selectedIds}
          onSelectAll={handleSelectAll}
          onSelectId={handleSelectId}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          onView={(id) => console.log('View', id)} // Placeholder
        />
      </div>

      {/* Create/Edit Generic Dialog */}
      <EndUserDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        userToEdit={userToEdit}
        departments={departments}
        positions={positions}
        rawPositions={rawPositions}
        selectableDevices={availableDevices}
        onSuccess={() => {
          // onSuccess of Dialog calls refetch/invalidateQueries via mutation
          // We can also manually refresh router for server components
          router.refresh()
        }}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này sẽ xóa nhân viên khỏi hệ thống. Các thiết bị đang gán cho nhân viên này
              sẽ được tự động thu hồi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Xóa nhân viên
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
