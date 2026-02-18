import type { DeviceType } from '@/types/device'
import { DEVICE_TYPES } from './device'

export type FieldType = 'text' | 'dropdown'

export interface FieldConfig {
  show: boolean
  type?: FieldType
  required?: boolean
}

export const DEVICE_FIELDS_CONFIG: Record<DeviceType, Record<string, FieldConfig>> = {
  [DEVICE_TYPES.PC]: {
    os: { show: true, type: 'text' },
    cpu: { show: true, type: 'text' },
    ram: { show: true, type: 'text' },
    architecture: { show: true, type: 'text' },
    ip: { show: true, type: 'text' },
    mac: { show: true, type: 'text' },
  },
  [DEVICE_TYPES.LAPTOP]: {
    os: { show: true, type: 'text' },
    cpu: { show: true, type: 'text' },
    ram: { show: true, type: 'text' },
    architecture: { show: true, type: 'text' },
    ip: { show: true, type: 'text' },
    mac: { show: true, type: 'text' },
    screenSize: { show: true, type: 'dropdown' },
  },
  [DEVICE_TYPES.MONITOR]: {
    os: { show: false },
    cpu: { show: false },
    ram: { show: false },
    architecture: { show: false },
    ip: { show: false },
    mac: { show: false },
    screenSize: { show: true, type: 'dropdown' },
    resolution: { show: true, type: 'dropdown' },
  },
  [DEVICE_TYPES.PRINTER]: {
    os: { show: false },
    cpu: { show: false },
    ram: { show: false },
    architecture: { show: false },
    ip: { show: true, type: 'text' },
    mac: { show: true, type: 'text' },
    connectionType: { show: true, type: 'dropdown' },
  },
  [DEVICE_TYPES.PHONE]: {
    os: { show: true, type: 'text' },
    cpu: { show: false },
    ram: { show: true, type: 'text' },
    architecture: { show: false },
    ip: { show: true, type: 'text' },
    mac: { show: true, type: 'text' },
  },
  [DEVICE_TYPES.TABLET]: {
    os: { show: true, type: 'text' },
    cpu: { show: false },
    ram: { show: true, type: 'text' },
    architecture: { show: false },
    ip: { show: true, type: 'text' },
    mac: { show: true, type: 'text' },
    screenSize: { show: true, type: 'dropdown' },
  },
  [DEVICE_TYPES.NETWORK]: {
    os: { show: false },
    cpu: { show: false },
    ram: { show: false },
    architecture: { show: false },
    ip: { show: true, type: 'text' },
    mac: { show: true, type: 'text' },
    connectionType: { show: true, type: 'dropdown' },
  },
  [DEVICE_TYPES.OTHER]: {
    os: { show: true, type: 'text' },
    cpu: { show: true, type: 'text' },
    ram: { show: true, type: 'text' },
    architecture: { show: true, type: 'text' },
    ip: { show: true, type: 'text' },
    mac: { show: true, type: 'text' },
  },
}

export const SCREEN_SIZE_OPTIONS = [
  '14"',
  '15.6"',
  '21"',
  '22"',
  '23"',
  '24"',
  '27"',
  '32"',
  '34" Ultrawide',
  'Other',
]

export const RESOLUTION_OPTIONS = [
  '1366x768 (HD)',
  '1920x1080 (FHD)',
  '2560x1440 (2K QHD)',
  '3840x2160 (4K UHD)',
  '5120x2880 (5K)',
  'Other',
]

export const CONNECTION_TYPE_OPTIONS = [
  'USB',
  'LAN (Ethernet)',
  'WiFi',
  'Bluetooth',
  'USB + LAN',
  'USB + WiFi',
  'Multi-function',
  'Other',
]

export interface DeviceTemplate {
  name: string
  values: Record<string, string>
}

export const DEVICE_TEMPLATES: Record<DeviceType, DeviceTemplate[]> = {
  [DEVICE_TYPES.PC]: [
    {
      name: 'PC Văn phòng',
      values: { cpu: 'Intel i5-12400', ram: '8GB', os: 'Windows 11 Pro', architecture: 'x64' },
    },
    {
      name: 'PC Developer',
      values: { cpu: 'Intel i7-13700', ram: '16GB', os: 'Windows 11 Pro', architecture: 'x64' },
    },
    {
      name: 'PC Cao cấp',
      values: { cpu: 'Intel i9-13900K', ram: '32GB', os: 'Windows 11 Pro', architecture: 'x64' },
    },
  ],
  [DEVICE_TYPES.LAPTOP]: [
    {
      name: 'Laptop cơ bản',
      values: { cpu: 'Intel i5', ram: '8GB', os: 'Windows 11', architecture: 'x64' },
    },
    {
      name: 'Laptop Pro',
      values: { cpu: 'Intel i7', ram: '16GB', os: 'Windows 11 Pro', architecture: 'x64' },
    },
    {
      name: 'MacBook Air',
      values: { cpu: 'Apple M2', ram: '8GB', os: 'macOS', architecture: 'ARM64' },
    },
    {
      name: 'MacBook Pro',
      values: { cpu: 'Apple M3 Pro', ram: '18GB', os: 'macOS', architecture: 'ARM64' },
    },
  ],
  [DEVICE_TYPES.MONITOR]: [
    { name: 'Màn hình văn phòng', values: { screenSize: '24"', resolution: '1920x1080 (FHD)' } },
    { name: 'Màn hình Designer', values: { screenSize: '27"', resolution: '2560x1440 (2K QHD)' } },
    { name: 'Màn hình Gaming', values: { screenSize: '27"', resolution: '2560x1440 (2K QHD)' } },
    { name: 'Màn hình 4K', values: { screenSize: '32"', resolution: '3840x2160 (4K UHD)' } },
  ],
  [DEVICE_TYPES.PRINTER]: [
    { name: 'Máy in USB', values: { connectionType: 'USB' } },
    { name: 'Máy in mạng', values: { connectionType: 'LAN (Ethernet)' } },
    { name: 'Máy in WiFi', values: { connectionType: 'WiFi' } },
    { name: 'Máy in đa năng', values: { connectionType: 'Multi-function' } },
  ],
  [DEVICE_TYPES.PHONE]: [
    { name: 'iPhone cơ bản', values: { os: 'iOS', ram: '4GB' } },
    { name: 'iPhone Pro', values: { os: 'iOS', ram: '8GB' } },
    { name: 'Android cơ bản', values: { os: 'Android', ram: '4GB' } },
    { name: 'Android cao cấp', values: { os: 'Android', ram: '12GB' } },
  ],
  [DEVICE_TYPES.TABLET]: [
    { name: 'iPad', values: { os: 'iPadOS', ram: '4GB', screenSize: '14"' } },
    { name: 'iPad Pro', values: { os: 'iPadOS', ram: '8GB', screenSize: '15.6"' } },
    { name: 'Android Tablet', values: { os: 'Android', ram: '4GB', screenSize: '14"' } },
  ],
  [DEVICE_TYPES.NETWORK]: [
    { name: 'Switch 8-port', values: { connectionType: 'LAN (Ethernet)' } },
    { name: 'Switch 24-port', values: { connectionType: 'LAN (Ethernet)' } },
    { name: 'Router WiFi', values: { connectionType: 'WiFi' } },
    { name: 'Access Point', values: { connectionType: 'WiFi' } },
  ],
  [DEVICE_TYPES.OTHER]: [{ name: 'Thiết bị khác', values: {} }],
}
