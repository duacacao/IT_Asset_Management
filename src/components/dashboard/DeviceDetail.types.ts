import { Device, DeviceInfo, DeviceStatus } from '@/types/device'

export interface DeviceDetailProps {
  device: Device | null
  isOpen: boolean
  mode?: 'view' | 'edit'
  onClose: () => void
  onExport: (device: Device) => void
  onDelete: (deviceId: string) => void
}

export type DeviceStatusMutation = {
  mutate: (params: { deviceId: string; status: DeviceStatus }) => void
  isPending: boolean
}

export type DeviceUpdateMutation = {
  mutate: (params: { deviceId: string; updates: Partial<DeviceInfo>; currentSpecs?: any }) => void
  isPending: boolean
}

export type SheetMutation = {
  mutate: (params: any) => void
  isPending: boolean
}
