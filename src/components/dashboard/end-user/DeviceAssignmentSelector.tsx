'use client'

import { useState } from 'react'
import { Laptop, Plus, X, ChevronsUpDown } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'

interface DeviceOption {
  id: string
  name: string
  type: string | null
}

interface DeviceAssignmentSelectorProps {
  selectedDeviceIds: string[]
  onChange: (ids: string[]) => void
  selectableDevices: DeviceOption[]
  disabled?: boolean
}

export function DeviceAssignmentSelector({
  selectedDeviceIds,
  onChange,
  selectableDevices,
  disabled = false,
}: DeviceAssignmentSelectorProps) {
  const [open, setOpen] = useState(false)

  const handleRemove = (deviceId: string) => {
    onChange(selectedDeviceIds.filter((id) => id !== deviceId))
  }

  const handleSelect = (deviceId: string) => {
    onChange([...selectedDeviceIds, deviceId])
    setOpen(false)
  }

  // Devices that are in the list but not yet selected
  const devicesToSelect = selectableDevices.filter((d) => !selectedDeviceIds.includes(d.id))

  return (
    <div className="space-y-2">
      <label className="text-sm leading-none font-medium">Thiết bị được gán</label>

      {/* Selected Chips */}
      {selectedDeviceIds.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedDeviceIds.map((deviceId) => {
            const device = selectableDevices.find((d) => d.id === deviceId)
            if (!device) return null
            return (
              <Badge key={deviceId} variant="secondary" className="gap-1 pr-1 text-xs">
                <Laptop className="h-3 w-3" />
                {device.name}
                {device.type && <span className="text-muted-foreground">({device.type})</span>}
                <button
                  type="button"
                  disabled={disabled}
                  className="hover:bg-destructive/20 hover:text-destructive ml-0.5 cursor-pointer rounded-sm p-0.5 transition-colors disabled:opacity-50"
                  onClick={() => handleRemove(deviceId)}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )
          })}
        </div>
      )}

      {/* Add Button & Popover */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            type="button"
            disabled={disabled}
            className="text-muted-foreground w-full cursor-pointer justify-between"
          >
            <span className="flex items-center gap-1">
              <Plus className="h-3.5 w-3.5" />
              Thêm thiết bị
            </span>
            <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[320px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Tìm thiết bị..." />
            <CommandList>
              <CommandEmpty>Không tìm thấy thiết bị.</CommandEmpty>
              <CommandGroup>
                {devicesToSelect.map((device) => (
                  <CommandItem
                    key={device.id}
                    value={`${device.name} ${device.type}`}
                    onSelect={() => handleSelect(device.id)}
                    className="cursor-pointer"
                  >
                    <Laptop className="text-muted-foreground mr-2 h-4 w-4" />
                    <span>{device.name}</span>
                    {device.type && (
                      <span className="text-muted-foreground ml-1">({device.type})</span>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedDeviceIds.length === 0 && (
        <p className="text-muted-foreground text-xs">Chưa gán thiết bị nào</p>
      )}
    </div>
  )
}
