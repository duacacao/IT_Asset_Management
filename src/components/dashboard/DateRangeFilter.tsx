"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface DateRangeFilterProps {
    value?: DateRange
    onChange: (range: DateRange | undefined) => void
    className?: string
}

export function DateRangeFilter({ value, onChange, className }: DateRangeFilterProps) {
    const [date, setDate] = React.useState<DateRange | undefined>(value)

    const handleSelect = (range: DateRange | undefined) => {
        setDate(range)
        onChange(range)
    }

    const handlePreset = (days: number) => {
        const to = new Date()
        const from = new Date()
        from.setDate(from.getDate() - days)
        const range = { from, to }
        setDate(range)
        onChange(range)
    }

    const handleClear = () => {
        setDate(undefined)
        onChange(undefined)
    }

    return (
        <div className={cn("grid gap-2", className)}>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant="outline"
                        className={cn(
                            "w-[280px] justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date?.from ? (
                            date.to ? (
                                <>
                                    {format(date.from, "dd/MM/yyyy", { locale: vi })} -{" "}
                                    {format(date.to, "dd/MM/yyyy", { locale: vi })}
                                </>
                            ) : (
                                format(date.from, "dd/MM/yyyy", { locale: vi })
                            )
                        ) : (
                            <span>Chọn khoảng thời gian</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <div className="flex flex-col">
                        {/* Preset buttons header */}
                        <div className="flex items-center gap-1 p-2 border-b bg-muted/50">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs"
                                onClick={() => handlePreset(0)}
                            >
                                Hôm nay
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs"
                                onClick={() => handlePreset(7)}
                            >
                                7 ngày
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs"
                                onClick={() => handlePreset(30)}
                            >
                                30 ngày
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs"
                                onClick={() => handlePreset(90)}
                            >
                                90 ngày
                            </Button>
                            {date && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 px-2 text-xs text-destructive ml-auto"
                                    onClick={handleClear}
                                >
                                    Xóa
                                </Button>
                            )}
                        </div>
                        {/* Single calendar */}
                        <Calendar
                            initialFocus
                            mode="range"
                            className="p-3"
                            defaultMonth={date?.from}
                            selected={date}
                            onSelect={handleSelect}
                            numberOfMonths={1}
                            locale={vi}
                        />
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    )
}
