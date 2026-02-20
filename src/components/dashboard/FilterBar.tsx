'use client'

import { useState, useEffect } from 'react'
import { Filter, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SearchBar } from './SearchBar'
import { DeviceStatus, DeviceType } from '@/types/device'
import { DEVICE_STATUS_CONFIG, DEVICE_TYPE_LABELS } from '@/constants/device'

export interface DeviceFilters {
  search?: string
  status?: DeviceStatus[]
  deviceType?: DeviceType[]
}

interface FilterBarProps {
  onFilterChange: (filters: DeviceFilters) => void
  onReset: () => void
  className?: string
  children?: React.ReactNode
}

export function FilterBar({ onFilterChange, onReset, className, children }: FilterBarProps) {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<DeviceStatus | 'all'>('all')
  const [deviceType, setDeviceType] = useState<DeviceType | 'all'>('all')
  const [hasFilters, setHasFilters] = useState(false)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      applyFilters()
    }, 300)

    return () => clearTimeout(timer)
  }, [search])

  // Apply filters immediately for non-search changes
  useEffect(() => {
    applyFilters()
  }, [status, deviceType])

  const applyFilters = () => {
    const filters: DeviceFilters = {
      search: search || undefined,
      status: status === 'all' ? undefined : [status],
      deviceType: deviceType === 'all' ? undefined : [deviceType],
    }

    const hasActiveFilters = !!(filters.search || filters.status || filters.deviceType)
    setHasFilters(hasActiveFilters)
    onFilterChange(filters)
  }

  const handleReset = () => {
    setSearch('')
    setStatus('all')
    setDeviceType('all')
    setHasFilters(false)
    onReset()
  }

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Tìm theo tên, IP hoặc ID…"
          className="w-full sm:w-[300px]"
        />

        {/* Status Filter */}
        <Select value={status} onValueChange={(value) => setStatus(value as DeviceStatus | 'all')}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
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
                    className={`h-2 w-2 rounded-full ${key === 'active'
                      ? 'bg-emerald-500'
                      : key === 'broken'
                        ? 'bg-red-500'
                        : 'bg-amber-500'
                      }`}
                  />
                  {config.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Device Type Filter */}
        <Select
          value={deviceType}
          onValueChange={(value) => setDeviceType(value as DeviceType | 'all')}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Loại thiết bị" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả loại</SelectItem>
            {Object.entries(DEVICE_TYPE_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Reset Button */}
        {hasFilters && (
          <Button variant="outline" size="sm" onClick={handleReset}>
            <X className="mr-2 h-4 w-4" />
            Xóa bộ lọc
          </Button>
        )}

        {/* Filter indicator */}
        {hasFilters && (
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <Filter className="h-4 w-4" />
            <span>Đang lọc</span>
          </div>
        )}
        {/* Action Slot */}
        <div className="ml-auto flex items-center gap-2">
          {children}
        </div>
      </div>
    </div>
  )
}
