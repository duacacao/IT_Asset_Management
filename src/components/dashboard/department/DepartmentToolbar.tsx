'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search, Trash } from 'lucide-react'

interface DepartmentToolbarProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  selectedCount: number
  onAdd: () => void
  onBulkDelete: () => void
}

export function DepartmentToolbar({
  searchTerm,
  onSearchChange,
  selectedCount,
  onAdd,
  onBulkDelete,
}: DepartmentToolbarProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      {/* Left: Search */}
      <div className="relative w-full md:w-72">
        <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Tìm theo tên phòng ban..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="rounded-xl border-border/50 bg-white pl-9 shadow-sm dark:bg-card"
        />
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {selectedCount > 0 && (
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
        <Button
          variant="outline"
          size="icon"
          onClick={onAdd}
          title="Thêm phòng ban"
          className="cursor-pointer rounded-xl border-border/50 shadow-sm"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
