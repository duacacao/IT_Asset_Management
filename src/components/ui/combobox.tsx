"use client"

import * as React from "react"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

interface ComboBoxProps {
  value?: string
  onValueChange: (value: string) => void
  options: { label: string; value: string }[]
  placeholder?: string
  emptyText?: string
  onCreateNew?: (value: string) => void
  creatable?: boolean
  createLabel?: string
}

export function ComboBox({
  value,
  onValueChange,
  options,
  placeholder = "Chọn...",
  emptyText = "Không có kết quả",
  onCreateNew,
  creatable = false,
  createLabel = "Thêm mới",
}: ComboBoxProps) {
  const [open, setOpen] = React.useState(false)
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false)
  const [newValue, setNewValue] = React.useState("")

  const selectedOption = options.find((opt) => opt.value === value)

  const handleSelect = (currentValue: string) => {
    if (currentValue === "__create__") {
      setOpen(false)
      setNewValue("")
      setCreateDialogOpen(true)
      return
    }
    onValueChange(currentValue === value ? "" : currentValue)
    setOpen(false)
  }

  const handleCreate = () => {
    if (newValue.trim()) {
      onCreateNew?.(newValue.trim())
      setCreateDialogOpen(false)
      setNewValue("")
    }
  }

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedOption?.label || placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command>
            <CommandInput placeholder="Tìm kiếm..." />
            <CommandList>
              <CommandEmpty>{emptyText}</CommandEmpty>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => handleSelect(option.value)}
                >
                  {option.label}
                </CommandItem>
              ))}
              {creatable && (
                <>
                  <CommandSeparator />
                  <CommandItem
                    key="__create__"
                    value="__create__"
                    onSelect={() => handleSelect("__create__")}
                    className="text-primary"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {createLabel}
                  </CommandItem>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm mới</DialogTitle>
            <DialogDescription>
              Nhập tên mới để thêm vào danh sách.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder={placeholder.replace("Chọn ", "")}
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleCreate()
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleCreate} className="cursor-pointer">
              Thêm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
