import type { Device } from '@/types/device'

export const deviceListSelectors = {
  minimal: (devices: Device[]) =>
    devices.map((d) => ({
      id: d.id,
      name: d.name,
      status: d.status,
      type: d.type,
    })),

  forTable: (devices: Device[]) =>
    devices.map((d) => ({
      id: d.id,
      name: d.name,
      status: d.status,
      type: d.type,
      ip: d.deviceInfo.ip,
      mac: d.deviceInfo.mac,
      assignment: d.assignment,
      metadata: d.metadata,
    })),

  forOverview: (devices: Device[]) =>
    devices.map((d) => ({
      id: d.id,
      name: d.name,
      status: d.status,
      type: d.type,
      deviceInfo: {
        os: d.deviceInfo.os,
        cpu: d.deviceInfo.cpu,
        ram: d.deviceInfo.ram,
        ip: d.deviceInfo.ip,
        mac: d.deviceInfo.mac,
      },
    })),

  forCharts: (devices: Device[]) =>
    devices.map((d) => ({
      id: d.id,
      status: d.status,
      type: d.type,
      deviceInfo: {
        os: d.deviceInfo.os,
        cpu: d.deviceInfo.cpu,
        ram: d.deviceInfo.ram,
        storage: d.deviceInfo.storage,
        gpu: d.deviceInfo.gpu,
      },
    })),
}
