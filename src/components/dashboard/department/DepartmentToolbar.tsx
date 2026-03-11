'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search, Trash } from 'lucide-react'
import { usePermissions } from '@/hooks/use-permissions'

import { ReactNode } from 'react'

interface DepartmentToolbarProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  selectedCount: number
  onAdd: () => void
  onBulkDelete: () => void
  viewOptions?: ReactNode
}

export function DepartmentToolbar({
  searchTerm,
  onSearchChange,
  selectedCount,
  onAdd,
  onBulkDelete,
  viewOptions,
}: DepartmentToolbarProps) {
  const { canCreate, canDelete } = usePermissions()

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      {/* Left: Search */}
      <div className="relative w-full md:w-72">
        <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
        <Input
          placeholder="Tìm theo tên phòng ban..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="border-border/50 dark:bg-card rounded-xl bg-white pl-9 shadow-sm"
        />
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {canDelete && selectedCount > 0 && (
          <Button
            variant="destructive"
            size="sm"
            onClick={onBulkDelete}
            className="cursor-pointer gap-2 rounded-xl"
          >
            <Trash className="h-4 w-4" />
            Xóa ({selectedCount})
          </Button>
        )}
        {canCreate && (
          <Button
            variant="default"
            size="icon"
            onClick={onAdd}
            title="Thêm phòng ban"
            className="h-9 w-9 cursor-pointer rounded-xl shadow-sm"
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
        {viewOptions}
      </div>
    </div>
  )
}
