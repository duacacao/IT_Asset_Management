'use client'

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Laptop, Pencil } from 'lucide-react'

import { EndUserWithDevice } from '@/types/end-user'

interface EndUserDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: EndUserWithDevice | null
  onEdit: (user: EndUserWithDevice) => void
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Chi tiết End-User</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Họ và tên</label>
            <Input value={user.full_name} disabled />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Email</label>
              <Input value={user.email || '-'} disabled />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Điện thoại</label>
              <Input value={user.phone || '-'} disabled />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Phòng ban</label>
              <Input value={user.department || '-'} disabled />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Chức vụ</label>
              <Input value={user.position || '-'} disabled />
            </div>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Thiết bị đang sử dụng</label>
            {user.devices && user.devices.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {user.devices.map((d) => (
                  <Badge key={d.id} variant="outline" className="gap-1">
                    <Laptop className="h-3 w-3" />
                    {d.name}
                    {d.type && <span className="text-muted-foreground">({d.type})</span>}
                  </Badge>
                ))}
              </div>
            ) : (
              <Input value="Chưa gán thiết bị" disabled />
            )}
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Ghi chú</label>
            <Textarea value={user.notes || '-'} disabled className="min-h-[80px]" />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
          <Button type="button" onClick={() => onEdit(user)} className="cursor-pointer">
            <Pencil className="mr-2 h-4 w-4" />
            Sửa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
