'use client'

import * as React from 'react'
import { Check, ChevronsUpDown, MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AppLoader } from '@/components/ui/app-loader'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

export interface Option {
  value: string
  label: string
}

interface SmartComboboxProps {
  value?: string
  onValueChange: (value: string) => void
  options: Option[]
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  creatable?: boolean
  createLabel?: string
  onCreate?: (value: string) => Promise<void>
  editable?: boolean
  onEdit?: (id: string, newValue: string) => Promise<void>
  deletable?: boolean
  onDelete?: (id: string) => Promise<void>
  className?: string
}

export function SmartCombobox({
  value,
  onValueChange,
  options,
  placeholder = 'Chọn...',
  searchPlaceholder = 'Tìm kiếm...',
  emptyText = 'Không tìm thấy kết quả.',
  creatable = false,
  createLabel = 'Tạo mới',
  onCreate,
  editable = false,
  onEdit,
  deletable = false,
  onDelete,
  className,
}: SmartComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState('')

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false)
  const [editDialogOpen, setEditDialogOpen] = React.useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)

  // Temp states for dialogs
  const [tempValue, setTempValue] = React.useState('')
  const [selectedItem, setSelectedItem] = React.useState<Option | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)

  const selectedOption = options.find((opt) => opt.value === value)

  const handleCreate = async () => {
    if (!tempValue.trim() || !onCreate) return
    setIsLoading(true)
    try {
      await onCreate(tempValue.trim())
      setCreateDialogOpen(false)
      setTempValue('')
    } catch (error) {
      console.error(error)
      toast.error('Không thể tạo mục')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = async () => {
    if (!selectedItem || !tempValue.trim() || !onEdit) return
    setIsLoading(true)
    try {
      await onEdit(selectedItem.value, tempValue.trim())
      setEditDialogOpen(false)
      setSelectedItem(null)
      setTempValue('')
    } catch (error) {
      console.error(error)
      toast.error('Không thể cập nhật mục')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedItem || !onDelete) return
    setIsLoading(true)
    try {
      await onDelete(selectedItem.value)
      setDeleteDialogOpen(false)
      setSelectedItem(null)
      if (value === selectedItem.value) {
        onValueChange('')
      }
    } catch (error) {
      console.error(error)
      toast.error('Không thể xóa mục')
    } finally {
      setIsLoading(false)
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
            className={cn(
              'w-full justify-between font-normal',
              !value && 'text-muted-foreground',
              className
            )}
          >
            {selectedOption ? selectedOption.label : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command>
            <CommandInput
              placeholder={searchPlaceholder}
              value={searchValue}
              onValueChange={setSearchValue}
            />
            <CommandList>
              <CommandEmpty>
                <div className="text-muted-foreground flex flex-col items-center justify-center p-4 text-center text-sm">
                  {emptyText}
                  {creatable && searchValue && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary mt-2 h-8"
                      onClick={() => {
                        setTempValue(searchValue)
                        setCreateDialogOpen(true)
                        setOpen(false) // Close popover to focus dialog
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Tạo &quot;{searchValue}&quot;
                    </Button>
                  )}
                </div>
              </CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.label} // Use label for better filtering match usually
                    onSelect={() => {
                      onValueChange(option.value === value ? '' : option.value)
                      setOpen(false)
                    }}
                    className="group flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          value === option.value ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      {option.label}
                    </div>

                    {/* Item Actions */}
                    {(editable || deletable) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl border-border/50 shadow-md">
                          {editable && (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedItem(option)
                                setTempValue(option.label)
                                setEditDialogOpen(true)
                                setOpen(false)
                              }}
                              className="cursor-pointer"
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                          )}
                          {deletable && (
                            <DropdownMenuItem
                              className="text-destructive cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedItem(option)
                                setDeleteDialogOpen(true)
                                setOpen(false)
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Xóa
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>

            {creatable && (
              <div className="border-t p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground w-full cursor-pointer justify-start"
                  onClick={() => {
                    setTempValue('')
                    setCreateDialogOpen(true)
                    setOpen(false)
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {createLabel}
                </Button>
              </div>
            )}
          </Command>
        </PopoverContent>
      </Popover>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="rounded-xl border-border/50 shadow-lg">
          <DialogHeader>
            <DialogTitle>{createLabel}</DialogTitle>
            <DialogDescription>Nhập tên cho mục mới.</DialogDescription>
          </DialogHeader>
          <Input
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            placeholder="Tên..."
            autoFocus
            className="rounded-xl border-border/50"
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)} className="cursor-pointer rounded-xl">
              Hủy
            </Button>
            <Button onClick={handleCreate} disabled={isLoading || !tempValue.trim()} className="cursor-pointer rounded-xl">
              {isLoading ? (
                <>
                  <AppLoader layout="horizontal" hideText className="mr-2" />
                  Đang tạo...
                </>
              ) : (
                'Tạo'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="rounded-xl border-border/50 shadow-lg">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa</DialogTitle>
          </DialogHeader>
          <Input
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            placeholder="Tên..."
            autoFocus
            className="rounded-xl border-border/50"
            onKeyDown={(e) => e.key === 'Enter' && handleEdit()}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} className="cursor-pointer rounded-xl">
              Hủy
            </Button>
            <Button onClick={handleEdit} disabled={isLoading || !tempValue.trim()} className="cursor-pointer rounded-xl">
              {isLoading ? (
                <>
                  <AppLoader layout="horizontal" hideText className="mr-2" />
                  Đang lưu...
                </>
              ) : (
                'Lưu'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="rounded-xl border-border/50 shadow-lg">
          <DialogHeader>
            <DialogTitle>Xóa mục?</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa &quot;{selectedItem?.label}&quot;? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} className="cursor-pointer rounded-xl">
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isLoading} className="cursor-pointer rounded-xl">
              {isLoading ? (
                <>
                  <AppLoader layout="horizontal" hideText className="mr-2" />
                  Đang xóa...
                </>
              ) : (
                'Xóa'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
