import { DeviceStatus } from '@/types/device'

export const DEVICE_STATUSES = {
  ACTIVE: 'active',
  BROKEN: 'broken',
  INACTIVE: 'inactive',
} as const

export const DEVICE_TYPES = {
  PC: 'PC',
  LAPTOP: 'Laptop',
  MONITOR: 'Monitor',
  PRINTER: 'Printer',
  PHONE: 'Phone',
  TABLET: 'Tablet',
  NETWORK: 'Network',
  OTHER: 'Other',
} as const

export const DEVICE_STATUS_CONFIG = {
  [DEVICE_STATUSES.ACTIVE]: { label: 'Đang sử dụng', softColor: 'success' },
  [DEVICE_STATUSES.BROKEN]: { label: 'Hư hỏng', softColor: 'error' },
  [DEVICE_STATUSES.INACTIVE]: { label: 'Không sử dụng', softColor: 'warning' },
} as const

export const DEVICE_TYPE_LABELS: Record<string, string> = {
  [DEVICE_TYPES.PC]: 'Máy tính bàn',
  [DEVICE_TYPES.LAPTOP]: 'Laptop',
  [DEVICE_TYPES.MONITOR]: 'Màn hình',
  [DEVICE_TYPES.PRINTER]: 'Máy in',
  [DEVICE_TYPES.PHONE]: 'Điện thoại',
  [DEVICE_TYPES.TABLET]: 'Máy tính bảng',
  [DEVICE_TYPES.NETWORK]: 'Thiết bị mạng',
  [DEVICE_TYPES.OTHER]: 'Khác',
}

export const DEVICE_TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  [DEVICE_TYPES.PC]: {
    bg: 'bg-slate-100 dark:bg-slate-800/50',
    text: 'text-slate-700 dark:text-slate-300',
  },
  [DEVICE_TYPES.LAPTOP]: {
    bg: 'bg-teal-100 dark:bg-teal-900/30',
    text: 'text-teal-700 dark:text-teal-400',
  },
  [DEVICE_TYPES.MONITOR]: {
    bg: 'bg-cyan-100 dark:bg-cyan-900/30',
    text: 'text-cyan-700 dark:text-cyan-400',
  },
  [DEVICE_TYPES.PRINTER]: {
    bg: 'bg-orange-100 dark:bg-orange-900/30',
    text: 'text-orange-700 dark:text-orange-400',
  },
  [DEVICE_TYPES.PHONE]: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-700 dark:text-blue-400',
  },
  [DEVICE_TYPES.TABLET]: {
    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
    text: 'text-emerald-700 dark:text-emerald-400',
  },
  [DEVICE_TYPES.NETWORK]: {
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    text: 'text-amber-700 dark:text-amber-400',
  },
  [DEVICE_TYPES.OTHER]: {
    bg: 'bg-gray-100 dark:bg-gray-800/50',
    text: 'text-gray-600 dark:text-gray-400',
  },
}

export const STATUS_DOT_COLORS: Record<DeviceStatus, string> = {
  active: 'bg-emerald-500',
  broken: 'bg-red-500',
  inactive: 'bg-amber-500',
}

export const SHEET_TABLE_COLUMNS = {
  MIN_WIDTH: 80,
  DEFAULT_WIDTH: 200,
} as const

export const DEVICE_DETAIL_CONFIG = {
  DEFAULT_TAB: 'cau_hinh',
  MOBILE_BREAKPOINT: 768,
  GRID_COLS: {
    MOBILE: 1,
    TABLET: 2,
    DESKTOP: 3,
  },
} as const

export type CardType = 'hardware' | 'os' | 'network' | 'display' | 'connection'

export interface DetailCardField {
  key: string
  label: string
  source: 'deviceInfo' | 'sheets' | 'computed'
  computedKey?: string
}

export interface DetailCardConfig {
  type: CardType
  title: string
  icon: string
  iconColor: string
  fields: DetailCardField[]
}

export const DEVICE_DETAIL_CARDS: Record<string, DetailCardConfig[]> = {
  [DEVICE_TYPES.PC]: [
    {
      type: 'hardware',
      title: 'Phần cứng',
      icon: 'Cpu',
      iconColor: 'text-orange-600',
      fields: [
        { key: 'cpu', label: 'Processor', source: 'deviceInfo' },
        { key: 'ram', label: 'Memory', source: 'deviceInfo' },
        { key: 'gpu', label: 'Graphics', source: 'computed', computedKey: 'gpu' },
        { key: 'storage', label: 'Storage', source: 'computed', computedKey: 'storage' },
      ],
    },
    {
      type: 'os',
      title: 'Hệ điều hành',
      icon: 'HardDrive',
      iconColor: 'text-purple-600',
      fields: [
        { key: 'os', label: 'OS', source: 'deviceInfo' },
        { key: 'architecture', label: 'Architecture', source: 'deviceInfo' },
        {
          key: 'activationStatus',
          label: 'Activation',
          source: 'computed',
          computedKey: 'activationStatus',
        },
        { key: 'biosMode', label: 'BIOS Mode', source: 'computed', computedKey: 'biosMode' },
      ],
    },
    {
      type: 'network',
      title: 'Mạng & Kết nối',
      icon: 'Wifi',
      iconColor: 'text-sky-600',
      fields: [
        { key: 'ip', label: 'IP Address', source: 'deviceInfo' },
        { key: 'mac', label: 'MAC Address', source: 'deviceInfo' },
      ],
    },
  ],
  [DEVICE_TYPES.LAPTOP]: [
    {
      type: 'hardware',
      title: 'Phần cứng',
      icon: 'Cpu',
      iconColor: 'text-orange-600',
      fields: [
        { key: 'cpu', label: 'Processor', source: 'deviceInfo' },
        { key: 'ram', label: 'Memory', source: 'deviceInfo' },
        { key: 'gpu', label: 'Graphics', source: 'computed', computedKey: 'gpu' },
        { key: 'storage', label: 'Storage', source: 'computed', computedKey: 'storage' },
      ],
    },
    {
      type: 'display',
      title: 'Màn hình',
      icon: 'Monitor',
      iconColor: 'text-cyan-600',
      fields: [
        { key: 'screenSize', label: 'Screen Size', source: 'deviceInfo' },
        { key: 'resolution', label: 'Resolution', source: 'deviceInfo' },
      ],
    },
    {
      type: 'os',
      title: 'Hệ điều hành',
      icon: 'HardDrive',
      iconColor: 'text-purple-600',
      fields: [
        { key: 'os', label: 'OS', source: 'deviceInfo' },
        { key: 'architecture', label: 'Architecture', source: 'deviceInfo' },
        {
          key: 'activationStatus',
          label: 'Activation',
          source: 'computed',
          computedKey: 'activationStatus',
        },
        { key: 'biosMode', label: 'BIOS Mode', source: 'computed', computedKey: 'biosMode' },
      ],
    },
    {
      type: 'network',
      title: 'Mạng & Kết nối',
      icon: 'Wifi',
      iconColor: 'text-sky-600',
      fields: [
        { key: 'ip', label: 'IP Address', source: 'deviceInfo' },
        { key: 'mac', label: 'MAC Address', source: 'deviceInfo' },
      ],
    },
  ],
  [DEVICE_TYPES.MONITOR]: [
    {
      type: 'display',
      title: 'Thông số màn hình',
      icon: 'Monitor',
      iconColor: 'text-cyan-600',
      fields: [
        { key: 'screenSize', label: 'Kích thước', source: 'deviceInfo' },
        { key: 'resolution', label: 'Độ phân giải', source: 'deviceInfo' },
      ],
    },
  ],
  [DEVICE_TYPES.PRINTER]: [
    {
      type: 'connection',
      title: 'Kết nối',
      icon: 'Printer',
      iconColor: 'text-orange-600',
      fields: [{ key: 'connectionType', label: 'Loại kết nối', source: 'deviceInfo' }],
    },
    {
      type: 'network',
      title: 'Mạng',
      icon: 'Wifi',
      iconColor: 'text-sky-600',
      fields: [
        { key: 'ip', label: 'IP Address', source: 'deviceInfo' },
        { key: 'mac', label: 'MAC Address', source: 'deviceInfo' },
      ],
    },
  ],
  [DEVICE_TYPES.PHONE]: [
    {
      type: 'os',
      title: 'Hệ điều hành',
      icon: 'Smartphone',
      iconColor: 'text-blue-600',
      fields: [
        { key: 'os', label: 'OS', source: 'deviceInfo' },
        { key: 'ram', label: 'RAM', source: 'deviceInfo' },
      ],
    },
    {
      type: 'network',
      title: 'Mạng',
      icon: 'Wifi',
      iconColor: 'text-sky-600',
      fields: [
        { key: 'ip', label: 'IP Address', source: 'deviceInfo' },
        { key: 'mac', label: 'MAC Address', source: 'deviceInfo' },
      ],
    },
  ],
  [DEVICE_TYPES.TABLET]: [
    {
      type: 'os',
      title: 'Hệ điều hành',
      icon: 'Tablet',
      iconColor: 'text-emerald-600',
      fields: [
        { key: 'os', label: 'OS', source: 'deviceInfo' },
        { key: 'ram', label: 'RAM', source: 'deviceInfo' },
      ],
    },
    {
      type: 'display',
      title: 'Màn hình',
      icon: 'Monitor',
      iconColor: 'text-cyan-600',
      fields: [{ key: 'screenSize', label: 'Kích thước', source: 'deviceInfo' }],
    },
    {
      type: 'network',
      title: 'Mạng',
      icon: 'Wifi',
      iconColor: 'text-sky-600',
      fields: [
        { key: 'ip', label: 'IP Address', source: 'deviceInfo' },
        { key: 'mac', label: 'MAC Address', source: 'deviceInfo' },
      ],
    },
  ],
  [DEVICE_TYPES.NETWORK]: [
    {
      type: 'connection',
      title: 'Kết nối',
      icon: 'Network',
      iconColor: 'text-amber-600',
      fields: [{ key: 'connectionType', label: 'Loại kết nối', source: 'deviceInfo' }],
    },
    {
      type: 'network',
      title: 'Mạng',
      icon: 'Wifi',
      iconColor: 'text-sky-600',
      fields: [
        { key: 'ip', label: 'IP Address', source: 'deviceInfo' },
        { key: 'mac', label: 'MAC Address', source: 'deviceInfo' },
      ],
    },
  ],
  [DEVICE_TYPES.OTHER]: [
    {
      type: 'hardware',
      title: 'Thông tin thiết bị',
      icon: 'Cpu',
      iconColor: 'text-gray-600',
      fields: [
        { key: 'os', label: 'OS', source: 'deviceInfo' },
        { key: 'cpu', label: 'Processor', source: 'deviceInfo' },
        { key: 'ram', label: 'Memory', source: 'deviceInfo' },
      ],
    },
    {
      type: 'network',
      title: 'Mạng',
      icon: 'Wifi',
      iconColor: 'text-sky-600',
      fields: [
        { key: 'ip', label: 'IP Address', source: 'deviceInfo' },
        { key: 'mac', label: 'MAC Address', source: 'deviceInfo' },
      ],
    },
  ],
}
