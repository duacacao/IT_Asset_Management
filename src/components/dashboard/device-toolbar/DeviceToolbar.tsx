import { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, FilterX, Trash2, Download, Upload, Plus } from 'lucide-react'
import { DeviceStatus, DeviceType } from '@/types/device'
import { DEVICE_STATUS_CONFIG, DEVICE_TYPE_LABELS } from '@/constants/device'
import { STATUS_DOT_COLORS } from '../device-columns'
import { usePermissions } from '@/hooks/use-permissions'

interface DeviceToolbarProps {
  // Render prop output từ DeviceList
  viewOptions: ReactNode

  // Filter state (owned by page)
  search: string
  onSearchChange: (value: string) => void
  statusFilter: DeviceStatus | 'all'
  onStatusFilterChange: (value: DeviceStatus | 'all') => void
  typeFilter: DeviceType | 'all'
  onTypeFilterChange: (value: DeviceType | 'all') => void

  // Selection info (từ DeviceList qua render prop params)
  selectedCount: number
  onBulkDelete: () => void
  isBulkPending: boolean

  // Primary actions (owned by page)
  onExportCSV: () => void
  onImportDevice: () => void
  onCreateDevice: () => void
  isImporting?: boolean
}

export function DeviceToolbar({
  viewOptions,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  typeFilter,
  onTypeFilterChange,
  selectedCount,
  onBulkDelete,
  isBulkPending,
  onExportCSV,
  onImportDevice,
  onCreateDevice,
  isImporting,
}: DeviceToolbarProps) {
  const hasActiveFilters = search !== '' || statusFilter !== 'all' || typeFilter !== 'all'
  const { canCreate, canDelete, canImportExport } = usePermissions()

  const handleClearFilters = () => {
    onSearchChange('')
    onStatusFilterChange('all')
    onTypeFilterChange('all')
  }

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      {/* Bên trái — Search + Filters */}
      <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
          <Input
            placeholder="Tìm theo tên, IP hoặc ID…"
            className="border-border/50 dark:bg-card rounded-xl bg-white pl-9 shadow-sm"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          {/* Status Filter */}
          <Select
            value={statusFilter}
            onValueChange={(value) => onStatusFilterChange(value as DeviceStatus | 'all')}
          >
            <SelectTrigger className="border-border/50 dark:bg-card w-full rounded-xl bg-white shadow-sm md:w-[180px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent className="border-border/50 rounded-xl shadow-md">
              <SelectItem value="all">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-gray-400" />
                  Tất cả
                </div>
              </SelectItem>
              {Object.entries(DEVICE_STATUS_CONFIG).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-2 w-2 rounded-full ${STATUS_DOT_COLORS[key as DeviceStatus]}`}
                    />
                    {config.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Device Type Filter */}
          <Select
            value={typeFilter}
            onValueChange={(value) => onTypeFilterChange(value as DeviceType | 'all')}
          >
            <SelectTrigger className="border-border/50 dark:bg-card w-full rounded-xl bg-white shadow-sm md:w-[180px]">
              <SelectValue placeholder="Loại thiết bị" />
            </SelectTrigger>
            <SelectContent className="border-border/50 rounded-xl shadow-md">
              <SelectItem value="all">Tất cả loại</SelectItem>
              {Object.entries(DEVICE_TYPE_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
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

      {/* Bên phải — Actions: Delete | Import | Export | Create | ViewOptions */}
      <div className="flex items-center gap-2">
        {/* Bulk delete — chỉ hiển thị khi có selection VÀ có quyền xóa */}
        {canDelete && selectedCount > 0 && (
          <Button
            variant="destructive"
            size="icon"
            disabled={isBulkPending}
            title={`Xóa ${selectedCount} thiết bị`}
            className="cursor-pointer rounded-xl shadow-sm"
            onClick={onBulkDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}

        {/* Import — chỉ hiện khi có quyền import-export */}
        {canImportExport && (
          <Button
            variant="outline"
            size="icon"
            onClick={onImportDevice}
            disabled={isImporting}
            title="Import Excel"
            className="cursor-pointer rounded-xl shadow-sm"
          >
            <Upload className="h-4 w-4" />
          </Button>
        )}

        {/* Export — chỉ hiện khi có quyền import-export */}
        {canImportExport && (
          <Button
            variant="outline"
            size="icon"
            onClick={onExportCSV}
            title="Export CSV"
            disabled={selectedCount === 0}
            className="cursor-pointer rounded-xl shadow-sm"
          >
            <Download className="h-4 w-4" />
          </Button>
        )}

        {/* Create — chỉ hiện khi có quyền tạo */}
        {canCreate && (
          <Button
            variant="default"
            size="icon"
            onClick={onCreateDevice}
            title="Tạo mới"
            className="cursor-pointer rounded-xl shadow-sm"
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}

        {/* View options */}
        {viewOptions}
      </div>
    </div>
  )
}
