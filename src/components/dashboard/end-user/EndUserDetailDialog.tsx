'use client'

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Pencil } from 'lucide-react'
import { getDeviceIcon } from './end-user-columns'

import { EndUserWithDevice } from '@/types/end-user'

interface EndUserDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: EndUserWithDevice | null
  onEdit: (user: EndUserWithDevice) => void
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1.5">
      <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
        {label}
      </span>
      <p className="text-foreground rounded-xl border border-border/20 bg-muted/20 px-3 py-2 text-sm">
        {value || '-'}
      </p>
    </div>
  )
}

export function EndUserDetailDialog({
  open,
  onOpenChange,
  user,
  onEdit,
}: EndUserDetailDialogProps) {
  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-xl border-border/50 shadow-lg">
        <DialogHeader>
          <DialogTitle>Chi tiết nhân viên</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <ReadOnlyField label="Họ và tên" value={user.full_name} />

          <div className="grid grid-cols-2 gap-4">
            <ReadOnlyField label="Email" value={user.email || '-'} />
            <ReadOnlyField label="Điện thoại" value={user.phone || '-'} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <ReadOnlyField label="Phòng ban" value={user.department || '-'} />
            <ReadOnlyField label="Chức vụ" value={user.position || '-'} />
          </div>

          <div className="grid gap-1.5">
            <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
              Thiết bị đang sử dụng
            </span>
            {user.devices && user.devices.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {user.devices.map((d) => (
                  <Badge key={d.id} variant="outline" className="rounded-full gap-1 border-border/50">
                    {getDeviceIcon(d.type)}
                    {d.name}
                    {d.type && <span className="text-muted-foreground">({d.type})</span>}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm italic">Chưa gán thiết bị</p>
            )}
          </div>

          <div className="grid gap-1.5">
            <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
              Ghi chú
            </span>
            <p className="text-foreground rounded-xl border border-border/20 bg-muted/20 px-3 py-2 text-sm min-h-[80px] whitespace-pre-wrap">
              {user.notes || '-'}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="cursor-pointer rounded-xl"
          >
            Đóng
          </Button>
          <Button
            type="button"
            onClick={() => onEdit(user)}
            className="cursor-pointer rounded-xl"
          >
            <Pencil className="mr-2 h-4 w-4" />
            Sửa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
