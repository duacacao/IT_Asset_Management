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
            className="rounded-xl border-border/50 bg-white pl-9 shadow-sm dark:bg-card"
            value={filters.search}
            onChange={handleSearchChange}
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <Select value={filters.department} onValueChange={handleDeptChange}>
            <SelectTrigger className="w-full rounded-xl border-border/50 bg-white shadow-sm dark:bg-card md:w-[180px]">
              <SelectValue placeholder="Phòng ban" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border/50 shadow-md">
              <SelectItem value="ALL">Tất cả phòng ban</SelectItem>
              {departments.map((d) => (
                <SelectItem key={d.value} value={d.value}>
                  {d.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.position} onValueChange={handlePosChange}>
            <SelectTrigger className="w-full rounded-xl border-border/50 bg-white shadow-sm dark:bg-card md:w-[180px]">
              <SelectValue placeholder="Chức vụ" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border/50 shadow-md">
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
        {selectedCount > 0 && (
          <Button
            variant="destructive"
            size="sm"
            onClick={onBulkDelete}
            className="cursor-pointer rounded-xl gap-2"
          >
            <Trash className="h-4 w-4" />
            Xóa ({selectedCount})
          </Button>
        )}
        <Button
          variant="default"
          onClick={onAdd}
          size="sm"
          className="cursor-pointer rounded-xl shadow-sm gap-2"
        >
          <Plus className="h-4 w-4" />
          Thêm mới
        </Button>
      </div>
    </div>
  )
}
