'use client'

import { Search, Plus, Trash, FilterX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { ReactNode } from 'react'
import { usePermissions } from '@/hooks/use-permissions'

interface Option {
  label: string
  value: string
}

interface EndUserFilters {
  search: string
  department: string // "ALL" or specific ID
  position: string // "ALL" or specific ID
}

interface EndUserToolbarProps {
  filters: EndUserFilters
  setFilters: (filters: EndUserFilters) => void
  departments: Option[]
  positions: Option[]
  onAdd: () => void
  onBulkDelete: () => void
  selectedCount: number
  totalCount: number
  filteredCount: number
  viewOptions?: ReactNode
}

export function EndUserToolbar({
  filters,
  setFilters,
  departments,
  positions,
  onAdd,
  onBulkDelete,
  selectedCount,
  totalCount,
  filteredCount,
  viewOptions,
}: EndUserToolbarProps) {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, search: e.target.value })
  }

  const handleDeptChange = (value: string) => {
    setFilters({ ...filters, department: value })
  }

  const handlePosChange = (value: string) => {
    setFilters({ ...filters, position: value })
  }

  const handleClearFilters = () => {
    setFilters({ search: '', department: 'ALL', position: 'ALL' })
  }

  const { canCreate, canDelete } = usePermissions()

  const hasActiveFilters =
    filters.search !== '' || filters.department !== 'ALL' || filters.position !== 'ALL'

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
          <Input
            placeholder="Tìm theo tên, email, SĐT..."
            className="border-border/50 dark:bg-card rounded-xl bg-white pl-9 shadow-sm"
            value={filters.search}
            onChange={handleSearchChange}
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <Select value={filters.department} onValueChange={handleDeptChange}>
            <SelectTrigger className="border-border/50 dark:bg-card w-full rounded-xl bg-white shadow-sm md:w-[180px]">
              <SelectValue placeholder="Phòng ban" />
            </SelectTrigger>
            <SelectContent className="border-border/50 rounded-xl shadow-md">
              <SelectItem value="ALL">Tất cả phòng ban</SelectItem>
              {departments.map((d) => (
                <SelectItem key={d.value} value={d.value}>
                  {d.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.position} onValueChange={handlePosChange}>
            <SelectTrigger className="border-border/50 dark:bg-card w-full rounded-xl bg-white shadow-sm md:w-[180px]">
              <SelectValue placeholder="Chức vụ" />
            </SelectTrigger>
            <SelectContent className="border-border/50 rounded-xl shadow-md">
              <SelectItem value="ALL">Tất cả chức vụ</SelectItem>
              {positions.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClearFilters}
              title="Xóa bộ lọc"
              className="cursor-pointer rounded-xl"
            >
              <FilterX className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Actions */}
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
            onClick={onAdd}
            size="icon"
            title="Thêm mới"
            className="cursor-pointer rounded-xl shadow-sm"
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
        {viewOptions}
      </div>
    </div>
  )
}
