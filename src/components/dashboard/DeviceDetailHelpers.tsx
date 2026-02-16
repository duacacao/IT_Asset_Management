import React from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// Row thông tin trong sidebar — label trên, value dưới
export function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-2 py-1">
      <span className="text-muted-foreground mt-0.5 flex-shrink-0">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-muted-foreground mb-1 text-[11px] leading-none">{label}</p>
        <p className="text-sm leading-snug font-medium break-words">{value || 'Không có'}</p>
      </div>
    </div>
  )
}

// Edit mode — Input field trong sidebar
export function EditField({
  icon,
  label,
  value,
  onChange,
}: {
  icon: React.ReactNode
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground flex-shrink-0">{icon}</span>
      <div className="min-w-0 flex-1">
        <Label className="text-muted-foreground text-[11px]">{label}</Label>
        <Input
          name={label}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-0.5 h-7 text-sm"
          autoComplete="off"
        />
      </div>
    </div>
  )
}

// Sortable tab — click để view, kebab menu, long press để drag
export function SortableTab({
  id,
  label,
  count,
  isActive,
  onRename,
  onDelete,
}: {
  id: string
  label: string
  count: number
  isActive?: boolean
  onRename: () => void
  onDelete?: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group flex flex-shrink-0 items-center rounded-full border transition-colors ${
        isActive
          ? 'bg-primary/10 text-primary border-primary/20'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 border-transparent'
      }`}
    >
      {/* Tab content — click để chọn sheet */}
      <TabsTrigger
        value={id}
        className="h-8 flex-shrink-0 rounded-full border-none bg-transparent px-3.5 whitespace-nowrap shadow-none data-[state=active]:bg-transparent data-[state=active]:shadow-none"
      >
        {label}
        <span className="ml-1.5 text-xs opacity-60">{count}</span>
      </TabsTrigger>
      {/* Kebab menu — 3-dot để mở Rename/Delete */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="mr-0.5 -ml-1 h-7 w-6 rounded-full opacity-0 transition-opacity group-hover:opacity-100 hover:bg-transparent data-[state=open]:opacity-100"
            onClick={(e) => e.stopPropagation()}
            aria-label="Tùy chọn sheet"
          >
            <MoreVertical className="h-3.5 w-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={onRename}>
            <Pencil className="mr-2 h-3.5 w-3.5" />
            Đổi tên
          </DropdownMenuItem>
          {onDelete && (
            <DropdownMenuItem
              onClick={onDelete}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-3.5 w-3.5" />
              Xóa
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

// Icon database tùy chỉnh — dùng trong metadata section
export function DatabaseIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
  )
}
