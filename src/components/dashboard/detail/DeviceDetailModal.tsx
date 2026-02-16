import { useState } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Device } from '@/types/device'
import * as VisuallyHidden from '@radix-ui/react-visually-hidden'
import { DeviceOverviewTab } from './DeviceOverviewTab'
import { DeviceSheetsTab } from './DeviceSheetsTab'
import { useDeviceDetailQuery } from '@/hooks/useDevicesQuery'

interface DeviceDetailModalProps {
  device: Device | null
  isOpen: boolean
  onClose: () => void
  onExport: (device: Device) => void
  onDelete: (deviceId: string) => void
}

export function DeviceDetailModal({
  device,
  isOpen,
  onClose,
  onExport,
  onDelete,
}: DeviceDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'sheets'>('overview')

  // Fetch full data if we have an ID
  const { data: detailData } = useDeviceDetailQuery(device?.id ?? null)
  const fullDevice = detailData?.device ?? device

  if (!fullDevice) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-background flex h-[90vh] w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-[90vw]">
        {/* Accessible Title */}
        <VisuallyHidden.Root>
          <DialogTitle>{fullDevice.deviceInfo.name}</DialogTitle>
        </VisuallyHidden.Root>

        {/* Tabs Navigation */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as any)}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="flex shrink-0 items-center justify-between border-b px-6 py-4">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold tracking-tight">{fullDevice.deviceInfo.name}</h2>
              <TabsList className="grid w-[200px] grid-cols-2">
                <TabsTrigger value="overview">Tổng quan</TabsTrigger>
                <TabsTrigger value="sheets">Dữ liệu</TabsTrigger>
              </TabsList>
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-muted/5 min-h-0 flex-1 overflow-hidden">
            <TabsContent value="overview" className="m-0 h-full overflow-auto p-0">
              <DeviceOverviewTab
                device={fullDevice}
                onExport={() => onExport(fullDevice)}
                onDelete={onDelete}
                onClose={onClose}
              />
            </TabsContent>
            <TabsContent value="sheets" className="m-0 flex h-full flex-col p-0">
              <DeviceSheetsTab device={fullDevice} />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
