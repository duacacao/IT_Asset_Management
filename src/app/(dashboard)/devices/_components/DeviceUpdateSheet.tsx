'use client'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Device } from '@/types/device'
import { AppLoader } from '@/components/ui/app-loader'
import dynamic from 'next/dynamic'
import { type DeviceUpdateFormProps } from './DeviceUpdateForm'

// Lazy load the form to prevent inflating the initial bundle size of the devices page
// This optimizes performance by only loading form logic when the admin clicks "Edit"
const DeviceUpdateForm = dynamic<DeviceUpdateFormProps>(
  () => import('./DeviceUpdateForm').then((mod) => mod.DeviceUpdateForm),
  {
    loading: () => (
      <div className="flex min-h-[50vh] flex-col items-center justify-center">
        <AppLoader text="Đang tải form cập nhật..." />
      </div>
    ),
    ssr: false, // Form is client-side only
  }
)

interface DeviceUpdateSheetProps {
  device: Device | null
  isOpen: boolean
  onClose: () => void
}

export function DeviceUpdateSheet({ device, isOpen, onClose }: DeviceUpdateSheetProps) {
  // If the sheet is closing and we don't have a device, render empty content to prevent flash
  if (!device) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="right" hideClose className="w-full sm:max-w-xl"></SheetContent>
      </Sheet>
    )
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" hideClose className="flex w-full flex-col sm:max-w-xl">
        <SheetHeader className="mb-2 space-y-1">
          <div className="flex items-center space-x-2">
            <span className="bg-primary/10 text-primary rounded-md px-2 py-0.5 text-xs font-semibold tracking-wider">
              Đang chỉnh sửa
            </span>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-hidden">
          <DeviceUpdateForm device={device} onClose={onClose} />
        </div>
      </SheetContent>
    </Sheet>
  )
}
