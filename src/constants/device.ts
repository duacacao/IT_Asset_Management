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
