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

export const STATUS_DOT_COLORS: Record<DeviceStatus, string> = {
  active: 'bg-emerald-500',
  broken: 'bg-red-500',
  inactive: 'bg-amber-500',
}

export const SHEET_TABLE_COLUMNS = {
  MIN_WIDTH: 80,
  DEFAULT_WIDTH: 150,
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
