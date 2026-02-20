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

export const DEVICE_TYPE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  [DEVICE_TYPES.PC]: {
    bg: 'bg-slate-50 dark:bg-slate-900/50',
    text: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-200 dark:border-slate-800',
  },
  [DEVICE_TYPES.LAPTOP]: {
    bg: 'bg-indigo-50 dark:bg-indigo-900/20',
    text: 'text-indigo-700 dark:text-indigo-400',
    border: 'border-indigo-200 dark:border-indigo-800',
  },
  [DEVICE_TYPES.MONITOR]: {
    bg: 'bg-cyan-50 dark:bg-cyan-900/20',
    text: 'text-cyan-700 dark:text-cyan-400',
    border: 'border-cyan-200 dark:border-cyan-800',
  },
  [DEVICE_TYPES.PRINTER]: {
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    text: 'text-orange-700 dark:text-orange-400',
    border: 'border-orange-200 dark:border-orange-800',
  },
  [DEVICE_TYPES.PHONE]: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    text: 'text-blue-700 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800',
  },
  [DEVICE_TYPES.TABLET]: {
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    text: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-200 dark:border-emerald-800',
  },
  [DEVICE_TYPES.NETWORK]: {
    bg: 'bg-fuchsia-50 dark:bg-fuchsia-900/20',
    text: 'text-fuchsia-700 dark:text-fuchsia-400',
    border: 'border-fuchsia-200 dark:border-fuchsia-800',
  },
  [DEVICE_TYPES.OTHER]: {
    bg: 'bg-gray-50 dark:bg-gray-800/50',
    text: 'text-gray-600 dark:text-gray-400',
    border: 'border-gray-200 dark:border-gray-700',
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
      title: 'CPU',
      icon: 'Cpu',
      iconColor: 'text-orange-600',
      fields: [{ key: 'cpu', label: 'Processor', source: 'deviceInfo' }],
    },
    {
      type: 'hardware',
      title: 'Bộ nhớ',
      icon: 'HardDrive',
      iconColor: 'text-blue-600',
      fields: [
        { key: 'ram', label: 'RAM', source: 'deviceInfo' },
        { key: 'storage', label: 'Storage', source: 'computed', computedKey: 'storage' },
      ],
    },
    {
      type: 'hardware',
      title: 'GPU',
      icon: 'Monitor',
      iconColor: 'text-purple-600',
      fields: [{ key: 'gpu', label: 'Graphics', source: 'computed', computedKey: 'gpu' }],
    },
    {
      type: 'os',
      title: 'Hệ điều hành',
      icon: 'HardDrive',
      iconColor: 'text-green-600',
      fields: [
        { key: 'os', label: 'OS', source: 'deviceInfo' },
        { key: 'architecture', label: 'Architecture', source: 'deviceInfo' },
      ],
    },
    {
      type: 'os',
      title: 'Kích hoạt',
      icon: 'CheckCircle2',
      iconColor: 'text-emerald-600',
      fields: [
        {
          key: 'activationStatus',
          label: 'Activation',
          source: 'computed',
          computedKey: 'activationStatus',
        },
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
  [DEVICE_TYPES.LAPTOP]: [
    {
      type: 'hardware',
      title: 'CPU',
      icon: 'Cpu',
      iconColor: 'text-orange-600',
      fields: [{ key: 'cpu', label: 'Processor', source: 'deviceInfo' }],
    },
    {
      type: 'hardware',
      title: 'Bộ nhớ',
      icon: 'HardDrive',
      iconColor: 'text-blue-600',
      fields: [
        { key: 'ram', label: 'RAM', source: 'deviceInfo' },
        { key: 'storage', label: 'Storage', source: 'computed', computedKey: 'storage' },
      ],
    },
    {
      type: 'hardware',
      title: 'GPU',
      icon: 'Monitor',
      iconColor: 'text-purple-600',
      fields: [{ key: 'gpu', label: 'Graphics', source: 'computed', computedKey: 'gpu' }],
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
      iconColor: 'text-green-600',
      fields: [
        { key: 'os', label: 'OS', source: 'deviceInfo' },
        { key: 'architecture', label: 'Architecture', source: 'deviceInfo' },
      ],
    },
    {
      type: 'os',
      title: 'Kích hoạt',
      icon: 'CheckCircle2',
      iconColor: 'text-emerald-600',
      fields: [
        {
          key: 'activationStatus',
          label: 'Activation',
          source: 'computed',
          computedKey: 'activationStatus',
        },
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
