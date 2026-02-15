import { DeviceStatus } from '@/types/device';

export const STATUS_DOT_COLORS: Record<DeviceStatus, string> = {
    active: 'bg-emerald-500',
    broken: 'bg-red-500',
    inactive: 'bg-amber-500',
};

export const SHEET_TABLE_COLUMNS = {
    MIN_WIDTH: 80,
    DEFAULT_WIDTH: 150,
} as const;

export const DEVICE_DETAIL_CONFIG = {
    DEFAULT_TAB: 'cau_hinh',
    MOBILE_BREAKPOINT: 768,
    GRID_COLS: {
        MOBILE: 1,
        TABLET: 2,
        DESKTOP: 3,
    },
} as const;
