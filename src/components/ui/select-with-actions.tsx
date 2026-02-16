'use client'

import * as React from 'react'
import * as SelectPrimitive from '@radix-ui/react-select'
import { CheckIcon, ChevronDownIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface OptionItem {
  label: string
  value: string
}

interface SelectWithActionsProps {
  value: string
  onValueChange: (value: string) => void
  options: OptionItem[]
  placeholder?: string
  creatable?: boolean
  createLabel?: string
  onCreateNew?: (value: string) => void
  onEdit?: (value: string, label: string) => void
  onDelete?: (value: string) => void
  className?: string
}

export function SelectWithActions({
  value,
  onValueChange,
  options,
  placeholder = 'Select...',
  creatable,
  createLabel = 'Create new',
  onCreateNew,
  onEdit,
  onDelete,
  className,
}: SelectWithActionsProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [isCreating, setIsCreating] = React.useState(false)
  const [newValue, setNewValue] = React.useState('')

  const handleCreate = () => {
    if (newValue.trim() && onCreateNew) {
      onCreateNew(newValue.trim())
      setNewValue('')
      setIsCreating(false)
    }
  }

  const handleEdit = (e: React.MouseEvent, optionValue: string, optionLabel: string) => {
    e.stopPropagation()
    if (onEdit) {
      onEdit(optionValue, optionLabel)
    }
  }

  const handleDelete = (e: React.MouseEvent, optionValue: string) => {
    e.stopPropagation()
    if (onDelete) {
      onDelete(optionValue)
    }
  }

  const selectedLabel = options.find((o) => o.value === value)?.label || placeholder

  return (
    <SelectPrimitive.Root
      open={isOpen}
      onOpenChange={setIsOpen}
      value={value}
      onValueChange={onValueChange}
    >
      <SelectPrimitive.Trigger
        className={cn(
          "border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex h-9 w-full items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
          className
        )}
      >
        <SelectPrimitive.Value placeholder={placeholder}>
          {value ? selectedLabel : placeholder}
        </SelectPrimitive.Value>
        <SelectPrimitive.Icon asChild>
          <ChevronDownIcon className="size-4 opacity-50" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          className="bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border shadow-md"
          position="popper"
          sideOffset={4}
        >
          <SelectPrimitive.Viewport className="p-1">
            {/* Existing options with actions */}
            {options.map((option) => (
              <SelectPrimitive.Item
                key={option.value}
                value={option.value}
                className="focus:bg-accent focus:text-accent-foreground relative flex w-full cursor-default items-center justify-between rounded-sm py-1.5 pr-2 pl-8 text-sm outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                onSelect={() => {
                  onValueChange(option.value)
                  setIsOpen(false)
                }}
              >
                <span className="flex items-center pl-2">
                  <SelectPrimitive.ItemIndicator className="mr-2">
                    <CheckIcon className="size-4" />
                  </SelectPrimitive.ItemIndicator>
                  <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                </span>

                {/* Inline Actions */}
                <div className="ml-2 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  {onEdit && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:bg-accent h-6 w-6"
                      onClick={(e) => handleEdit(e, option.value, option.label)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                        <path d="m15 5 4 4" />
                      </svg>
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:bg-destructive/10 hover:text-destructive text-destructive/60 h-6 w-6"
                      onClick={(e) => handleDelete(e, option.value)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        <line x1="10" x2="10" y1="11" y2="17" />
                        <line x1="14" x2="14" y1="11" y2="17" />
                      </svg>
                    </Button>
                  )}
                </div>
              </SelectPrimitive.Item>
            ))}

            {/* Create new option */}
            {creatable && !isCreating && (
              <SelectPrimitive.Item
                value="__create_new__"
                className="focus:bg-accent focus:text-accent-foreground text-muted-foreground relative flex w-full cursor-pointer items-center rounded-sm py-1.5 pr-2 pl-8 text-sm outline-none select-none"
                onSelect={(e) => {
                  e.preventDefault()
                  setIsCreating(true)
                }}
              >
                <SelectPrimitive.ItemIndicator className="mr-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14" />
                    <path d="M12 5v14" />
                  </svg>
                </SelectPrimitive.ItemIndicator>
                <SelectPrimitive.ItemText>{createLabel}</SelectPrimitive.ItemText>
              </SelectPrimitive.Item>
            )}

            {/* Create new input */}
            {creatable && isCreating && (
              <div className="flex items-center gap-1 px-2 py-1.5">
                <input
                  type="text"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder={createLabel}
                  className="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-7 w-full rounded-md border px-2 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleCreate()
                    } else if (e.key === 'Escape') {
                      setIsCreating(false)
                      setNewValue('')
                    }
                  }}
                  onBlur={() => {
                    if (!newValue.trim()) {
                      setIsCreating(false)
                    }
                  }}
                  autoFocus
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2"
                  onClick={handleCreate}
                  disabled={!newValue.trim()}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </Button>
              </div>
            )}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  )
}
