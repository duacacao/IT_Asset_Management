"use client"

import { useState, useEffect } from "react"
import { Filter, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { SearchBar } from "./SearchBar"
import { DateRangeFilter } from "./DateRangeFilter"
import { DeviceStatus, DEVICE_STATUS_CONFIG } from "@/types/device"
import { DateRange } from "react-day-picker"

export interface DeviceFilters {
    search?: string
    status?: DeviceStatus[]
    dateRange?: DateRange
}

interface FilterBarProps {
    onFilterChange: (filters: DeviceFilters) => void
    onReset: () => void
    className?: string
}

export function FilterBar({ onFilterChange, onReset, className }: FilterBarProps) {
    const [search, setSearch] = useState("")
    const [status, setStatus] = useState<DeviceStatus | "all">("all")
    const [dateRange, setDateRange] = useState<DateRange | undefined>()
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
    }, [status, dateRange])

    const applyFilters = () => {
        const filters: DeviceFilters = {
            search: search || undefined,
            status: status === "all" ? undefined : [status],
            dateRange: dateRange,
        }

        const hasActiveFilters = !!(filters.search || filters.status || filters.dateRange)
        setHasFilters(hasActiveFilters)
        onFilterChange(filters)
    }

    const handleReset = () => {
        setSearch("")
        setStatus("all")
        setDateRange(undefined)
        setHasFilters(false)
        onReset()
    }

    // Keyboard shortcut for search
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "f") {
                e.preventDefault()
                document.querySelector<HTMLInputElement>('input[type="text"]')?.focus()
            }
        }

        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [])

    return (
        <div className={`flex flex-col gap-4 ${className}`}>
            <div className="flex flex-wrap items-center gap-3">
                {/* Search */}
                <SearchBar
                    value={search}
                    onChange={setSearch}
                    placeholder="Tìm kiếm theo tên / ID..."
                    className="w-full sm:w-[300px]"
                />

                {/* Status Filter */}
                <Select value={status} onValueChange={(value) => setStatus(value as DeviceStatus | "all")}>
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
                                    <div className={`h-2 w-2 rounded-full ${key === 'active' ? 'bg-emerald-500' :
                                            key === 'broken' ? 'bg-red-500' :
                                                'bg-gray-400'
                                        }`} />
                                    {config.label}
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Date Range Filter */}
                <DateRangeFilter value={dateRange} onChange={setDateRange} />

                {/* Reset Button */}
                {hasFilters && (
                    <Button variant="outline" size="sm" onClick={handleReset}>
                        <X className="mr-2 h-4 w-4" />
                        Xóa bộ lọc
                    </Button>
                )}

                {/* Filter indicator */}
                {hasFilters && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Filter className="h-4 w-4" />
                        <span>Đang lọc</span>
                    </div>
                )}
            </div>
        </div>
    )
}
